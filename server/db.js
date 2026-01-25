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
    role TEXT NOT NULL CHECK (role IN ('admin', 'assistant', 'hostfamilyrefer', 'hostfamily', 'volunteer')),
    email TEXT,
    password_hash TEXT,
    blacklist INTEGER DEFAULT 0,
    user_id INTEGER,
    UNIQUE(email)
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE RESTRICT
  );

  CREATE TABLE IF NOT EXISTS cats (
    id TEXT PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('positif','négatif','non testé')),
    numIdentification TEXT,
    sex TEXT NOT NULL CHECK (sex IN ('mâle','femelle')),
    dress TEXT,
    race TEXT,
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
    UNIQUE(property_id, name),
    FOREIGN KEY(property_id) REFERENCES properties(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS cat_vaccine_pictures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cat_vaccine_id TEXT NOT NULL,
    url TEXT NOT NULL,
    UNIQUE(cat_vaccine_id, url),
    FOREIGN KEY(cat_vaccine_id) REFERENCES cat_vaccines(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_cats_hostfamily ON cats(hostfamily_id);
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
        for (const p of data) {
          // Ensure owner user exists
          let user = await db.getAsync('SELECT id FROM users WHERE email = ? ', [email]);
          if (!user) {
            const ins = await db.runAsync('INSERT INTO users(name, lastname, phone, address, city, role, email) VALUES (?,?,?,?,?,?,?)', 
              [hostName, hostName, p.host && p.host.phone ? p.host.phone : '0000000000', p.host && p.host.address ? p.host.address : 'Unknown', p.host && p.host.city ? p.host.city : 'Unknown', role, email]);
            user = { id: ins.lastID };
          }

          // Prepare slug
          const base = slugify(p.title || p.id || hostName);
          let slug = base;
          let n = 2;
          while (usedSlugs.has(slug)) {
            slug = `${base}-${n++}`;
          }
          usedSlugs.add(slug);

          // Insert cat
          await db.runAsync(
            'INSERT OR IGNORE INTO cats(id, slug, name, description, status, sex, dress, isAdopted, adoptionDate, birthday, numIdentification, hostfamily_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
            [p.id, slug, p.name || null, p.description || null, p.status || null, p.sex || null, p.dress || null, p.isAdopted ? 1 : 0, p.adoptionDate || null, p.birthday || null, p.numIdentification || null, user.id]
          );

          // Pictures
          const pics = new Set();
          if (p.cover) pics.add(p.cover);
          if (Array.isArray(p.pictures)) p.pictures.forEach(u => u && pics.add(u));
          for (const url of pics) {
            await db.runAsync('INSERT OR IGNORE INTO cats_pictures(cat_id, url) VALUES (?,?)', [p.id, url]);
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
