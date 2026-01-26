const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

const DB_PATH = path.join(__dirname, 'data', 'lechathomedeluna.sqlite3');
const PROPS_JSON_PATH = path.join(__dirname, 'data', 'cats.json');

function openDb() {
  const db = new sqlite3.Database(DB_PATH);
  // Promisify helpers
  db.runAsync = function (sql, params = []) {
    return new Promise((resolve, reject) => {
      this.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  };
  db.getAsync = promisify(db.get.bind(db));
  db.allAsync = promisify(db.all.bind(db));
  db.execAsync = promisify(db.exec.bind(db));
  return db;
}

async function initSchema(db) {
  const schema = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    lastName TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Admin', 'Assistant', 'HostFamily', 'Volunteer')),
    email TEXT,
    password_hash TEXT,
    blacklisted INTEGER DEFAULT 0,
    referrer_id INTEGER,
    reset_token TEXT,
    reset_expires INTEGER,
    UNIQUE(email)
    FOREIGN KEY(referrer_id) REFERENCES users(id) ON DELETE RESTRICT
  );

  CREATE TABLE IF NOT EXISTS cats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('Positif','Négatif','Non testé')),
    numIdentification TEXT,
    sex TEXT NOT NULL CHECK (sex IN ('Mâle','Femelle')),
    dress TEXT,
    race TEXT,
    isSterilized INTEGER DEFAULT 0,
    sterilizationDate TEXT,
    birthDate TEXT,
    isDuringVisit INTEGER DEFAULT 0,
    isAdopted INTEGER DEFAULT 0,
    adoptionDate TEXT,
    hostfamily_id INTEGER,
    FOREIGN KEY(hostfamily_id) REFERENCES users(id) ON DELETE RESTRICT
  );

  CREATE TABLE IF NOT EXISTS cat_pictures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cat_id TEXT NOT NULL,
    url TEXT NOT NULL,
    UNIQUE(cat_id, url),
    FOREIGN KEY(cat_id) REFERENCES cats(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS cat_vaccines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cat_id TEXT NOT NULL,
    date TEXT NOT NULL,
    UNIQUE(cat_id, date),
    FOREIGN KEY(cat_id) REFERENCES cats(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS cat_vaccine_pictures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cat_vaccine_id TEXT NOT NULL,
    url TEXT NOT NULL,
    UNIQUE(cat_vaccine_id, url),
    FOREIGN KEY(cat_vaccine_id) REFERENCES cat_vaccines(id) ON DELETE CASCADE
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
  CREATE INDEX IF NOT EXISTS idx_cats_hostfamily ON cats(hostfamily_id);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_cats_slug ON cats(slug);
  `;

  await db.execAsync(schema);
}

function slugify(input) {
  const s = String(input || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const slug = s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-');
  return slug || 'cat';
}

async function seedIfEmpty(db) {
  const row = await db.getAsync('SELECT COUNT(*) as c FROM cats');
  if (row && row.c > 0) return; // already seeded

  if (!fs.existsSync(PROPS_JSON_PATH)) return;
  const raw = fs.readFileSync(PROPS_JSON_PATH, 'utf-8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse cats.json:', e.message);
    return;
  }

  await new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        const usedSlugs = new Set();
        await db.runAsync('INSERT INTO users(name, lastname, phone, address, city, role, email, password_hash) VALUES (?,?,?,?,?,?,?,?)', 
                [
                  'Sylvie',
                  '',
                  '0000000000',
                  'Unknown',
                  'Unknown',
                  'Admin',
                  'admin@exemple.com',
                  'scrypt:8850c2aec59d2e4841e4f1f1a1091f55:2ec6fbedc853cd7f79fffa6f0fc952321b7363130bba327c6d5c5dcbcda839634b3bc68b6bc5afba493d0d04b49a7d793b68bbb2011832346bdc07ba238dbaba'
                ]);
        for (const p of data) {
          // Ensure owner user exists
          let user = null;
          if (p.hostFamily) {
            user = await db.getAsync('SELECT id FROM users WHERE email = ? ', [p.hostFamily.email]);
            if (!user) {
              const ins = await db.runAsync('INSERT INTO users(name, lastname, phone, address, city, role, email, referrer_id) VALUES (?,?,?,?,?,?,?,?)', 
                [
                  p.hostFamily && p.hostFamily.name,
                  p.hostFamily && p.hostFamily.lastName,
                  p.hostFamily && p.hostFamily.phone ? p.hostFamily.phone : '0000000000',
                  p.hostFamily && p.hostFamily.address ? p.hostFamily.address : '',
                  p.hostFamily && p.hostFamily.city ? p.hostFamily.city : '',
                  p.hostFamily && p.hostFamily.role ? p.hostFamily.role : 'hostfamily',
                  p.hostFamily && p.hostFamily.email ? p.hostFamily.email : `unknown${Date.now()}@example.com`,
                  p.hostFamily && p.hostFamily.referrerId ? p.hostFamily.referrerId : null
                ]);
              user = { id: ins.lastID };
            }
          }

          // Prepare slug
          const base = slugify(p.name || p.id || 'cat');
          let slug = base;
          let n = 2;
          while (usedSlugs.has(slug)) {
            slug = `${base}-${n++}`;
          }
          usedSlugs.add(slug);

          // Insert cat
          await db.runAsync(
            'INSERT  INTO cats(id, slug, name, description, status, numIdentification, sex, dress, race, isSterilized, sterilizationDate, birthDate, isDuringVisit, isAdopted, adoptionDate, hostfamily_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [
              p.id,
              slug,
              p.name,
              p.description || null,
              p.status || null,
              p.numIdentification || null,
              p.sex || null,
              p.dress || null,
              p.race || null,
              p.isSterilized ? 1 : 0,
              p.sterilizationDate || null,
              p.birthDate || null,
              p.isDuringVisit ? 1 : 0,
              p.isAdopted ? 1 : 0,
              p.adoptionDate || null,
              user && user.id || null
            ]
          );

          // Pictures
          const pics = new Set();
          if (Array.isArray(p.pictures)) p.pictures.forEach(u => u && pics.add(u));
          for (const url of pics) {
            await db.runAsync('INSERT OR IGNORE INTO cat_pictures(cat_id, url) VALUES (?,?)', [p.id, url]);
          }

          // Equipments
          //if (Array.isArray(p.equipments)) {
          //  for (const name of p.equipments) {
          //    await db.runAsync('INSERT OR IGNORE INTO property_equipments(property_id, name) VALUES (?,?)', [p.id, name]);
          //  }
          //}

          // Tags
          //if (Array.isArray(p.tags)) {
          //  for (const name of p.tags) {
          //    await db.runAsync('INSERT OR IGNORE INTO property_tags(property_id, name) VALUES (?,?)', [p.id, name]);
          //  }
          //}
        }
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  });
}

async function initialize() {
  const db = openDb();
  await initSchema(db);
  await seedIfEmpty(db);
  return db;
}

module.exports = {
  initialize,
  openDb,
  DB_PATH,
};
