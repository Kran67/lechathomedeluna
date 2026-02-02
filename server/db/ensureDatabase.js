const path = require('path');
const fs = require('fs');
const { Client } = require("pg");
const { Pool } = require('pg');
const pool = require("./pool");

const PROPS_JSON_PATH = path.join(__dirname, '../data', 'cats.json');

const {
  PG_HOST,
  PG_PORT,
  PG_USER,
  PG_PASSWORD,
  PG_DATABASE
} = process.env;

async function initializeDb() {
  // Connexion à la base "postgres" (admin)
  const client = new Client({
    host: PG_HOST,
    port: PG_PORT,
    user: PG_USER,
    password: PG_PASSWORD,
    database: "postgres"
  });

  // Create a pool of database connections
  //const pool = new Pool();

  await client.connect();
  await checkDatabase(client);
  await initSchema(pool);
  await seedIfEmpty(pool);

  await client.end();
}

async function checkDatabase(client) {
  const result = await client.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`,
    [PG_DATABASE]
  );

  if (result.rowCount === 0) {
    console.log(`🆕 Création de la base "${PG_DATABASE}"`);
    await client.query(`CREATE DATABASE "${PG_DATABASE}"`);
  } else {
    console.log(`✅ Base "${PG_DATABASE}" initialisée`);
  }
}

async function executeQueries(queries) {
  await Promise.all(queries);
}

async function initSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        phone VARCHAR(10) NOT NULL,
        address VARCHAR(255) NOT NULL,
        city VARCHAR(30) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Assistant', 'HostFamily', 'Volunteer')),
        email VARCHAR(100),
        password_hash VARCHAR(255),
        blacklisted BOOLEAN DEFAULT false,
        referrer_id INTEGER REFERENCES users(id) ON DELETE RESTRICT,
        reset_token VARCHAR(255),
        reset_expires BOOLEAN,
        UNIQUE(email)
    );`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cats (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(50) NOT NULL UNIQUE,
      name VARCHAR(20) NOT NULL,
      description TEXT,
      status VARCHAR(9) NOT NULL CHECK (status IN ('Positif','Négatif','Non testé')),
      numIdentification VARCHAR(20),
      sex VARCHAR(7) NOT NULL CHECK (sex IN ('Mâle','Femelle')),
      dress VARCHAR(10),
      race VARCHAR(10),
      isSterilized BOOLEAN DEFAULT false,
      sterilizationDate DATE,
      birthDate DATE,
      isDuringVisit BOOLEAN DEFAULT false,
      isAdopted BOOLEAN DEFAULT false,
      adoptionDate DATE,
      hostfamily_id INTEGER REFERENCES users(id) ON DELETE RESTRICT
    );`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cat_pictures (
      id SERIAL PRIMARY KEY,
      cat_id INTEGER NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
      url VARCHAR(512) NOT NULL,
      scheduling INTEGER DEFAULT 0,
      UNIQUE(cat_id, url)
    );`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cat_vaccines (
      id SERIAL PRIMARY KEY,
      cat_id INTEGER NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
      date VARCHAR(12) NOT NULL,
      UNIQUE(cat_id, date)
    );`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cat_vaccine_pictures (
      id SERIAL PRIMARY KEY,
      cat_vaccine_id INTEGER NOT NULL REFERENCES cat_vaccines(id) ON DELETE CASCADE,
      url VARCHAR(512) NOT NULL,
      UNIQUE(cat_vaccine_id, url)
    );`);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_cats_hostfamily ON cats(hostfamily_id);
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_cats_slug ON cats(slug);
  `);
}

function slugify(input) {
  const s = String(input || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const slug = s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-');
  return slug || 'cat';
}

async function seedIfEmpty(pool) {
  const res = await pool.query('SELECT COUNT(*)::int as c FROM cats');
  if (res.rows && res.rows[0].c > 0) return; // already seeded

  if (!fs.existsSync(PROPS_JSON_PATH)) return;
  const raw = fs.readFileSync(PROPS_JSON_PATH, 'utf-8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse cats.json:', e.message);
    return;
  }

  try {
    const usedSlugs = new Set();
    await pool.query('INSERT INTO users(name, lastname, phone, address, city, role, email, password_hash) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (email) DO NOTHING', 
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
        const { rows } = await pool.query('SELECT id FROM users WHERE email = $1 ', [p.hostFamily.email]);
        if (rows.length > 0) {
          user = { id: rows[0].id };
        }
        if (!user) {
          const ins = await pool.query('INSERT INTO users(name, lastname, phone, address, city, role, email, referrer_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id',
            [
              p.hostFamily && p.hostFamily.name,
              p.hostFamily && p.hostFamily.lastName,
              p.hostFamily && p.hostFamily.phone ? p.hostFamily.phone : '0000000000',
              p.hostFamily && p.hostFamily.address ? p.hostFamily.address : null,
              p.hostFamily && p.hostFamily.city ? p.hostFamily.city : null,
              p.hostFamily && p.hostFamily.role ? p.hostFamily.role : 'hostfamily',
              p.hostFamily && p.hostFamily.email ? p.hostFamily.email : `unknown${Date.now()}@example.com`,
              p.hostFamily && p.hostFamily.referrerId ? p.hostFamily.referrerId : null
            ]);
          user = { id: ins.rows[0].id };
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
      await pool.query(
        'INSERT INTO cats(id, slug, name, description, status, numIdentification, sex, dress, race, isSterilized, sterilizationDate, birthDate, isDuringVisit, isAdopted, adoptionDate, hostfamily_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)  ON CONFLICT (id) DO NOTHING',
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
      //const pics = new Set();
      if (Array.isArray(p.pictures)) p.pictures.forEach(async (u, idx) => u && await pool.query('INSERT INTO cat_pictures(cat_id, url, scheduling) VALUES ($1,$2,$3)', [p.id, u, idx]));
      //for (let i = 0; i< pics.size; i++) {
      //  const url = pics[i];
      //  await pool.query('INSERT INTO cat_pictures(cat_id, url) VALUES ($1,$2,$3)', [p.id, url,i]);
      //}

      // Equipments
      //if (Array.isArray(p.equipments)) {
      //  for (const name of p.equipments) {
      //    await db.runAsync('INSERT OR IGNORE INTO property_equipments(property_id, name) VALUES (?,?)', [p.id, name]);
      //  }
      //}

    }
  } catch (e) {
    console.log(e);
  }
}

module.exports = {
    initializeDb,
    slugify
}
