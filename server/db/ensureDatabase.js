const path = require('path');
const fs = require('fs');
const { Client } = require("pg");
const pool = require("./pool");
const tools = require("../utils/lib");

const PROPS_JSON_PATH = path.join(__dirname, '../data', 'cats.json');

const {
  PG_HOST,
  PG_PORT,
  PG_USER,
  PG_PASSWORD,
  PG_DATABASE
} = process.env;

async function initializeDb(deleteAll = false) {
  // Connexion à la base "postgres" (admin)
  const client = new Client({
    host: PG_HOST,
    port: PG_PORT,
    user: PG_USER,
    password: PG_PASSWORD,
    database: "postgres"
  });

  await client.connect();
  await checkDatabase(client);
  if (deleteAll) {
    await dropAll(pool);
  }
  await initSchema(pool);
  await seedIfEmpty(pool);

  await client.end();
}

async function dropAll(client) {
  await client.query('DROP TABLE IF EXISTS cat_vaccines CASCADE');
  await client.query('DROP TABLE IF EXISTS cat_documents CASCADE');
  await client.query('DROP TABLE IF EXISTS cat_pictures CASCADE');
  await client.query('DROP TABLE IF EXISTS cats CASCADE');
  await client.query('DROP TABLE IF EXISTS users CASCADE');
  await client.query('DROP TABLE IF EXISTS vet_vouchers CASCADE');
  await client.query('DROP TABLE IF EXISTS message_threads CASCADE');
  await client.query('DROP TABLE IF EXISTS messages CASCADE');
  //await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
  //await client.query('ALTER SEQUENCE cats_id_seq RESTART WITH 1');
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
        name VARCHAR(50) NOT NULL,
        lastName VARCHAR(50) NOT NULL,
        social_number VARCHAR(13),
        phone VARCHAR(10) NOT NULL,
        address VARCHAR(255) NOT NULL,
        city VARCHAR(30) NOT NULL,
        roles VARCHAR(40) NOT NULL,
        email VARCHAR(100),
        password_hash VARCHAR(255),
        blacklisted BOOLEAN DEFAULT false,
        referrer_id INTEGER REFERENCES users(id) ON DELETE RESTRICT,
        capacity VARCHAR(5) NOT NULL CHECK (capacity IN ('Empty','Full')),
        reset_token VARCHAR(255),
        reset_expires TIMESTAMPTZ,
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
      isAdoptable BOOLEAN DEFAULT false,
      adoptionDate DATE,
      hostfamily_id INTEGER REFERENCES users(id) ON DELETE RESTRICT,
      created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL,
      updated_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      updated_at TIMESTAMPTZ NOT NULL
    );`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cat_pictures (
      id SERIAL PRIMARY KEY,
      cat_id INTEGER NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
      url VARCHAR(50) NOT NULL,
      scheduling INTEGER DEFAULT 0,
      UNIQUE(cat_id, url)
    );`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cat_documents (
      id SERIAL PRIMARY KEY,
      cat_id INTEGER NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      url VARCHAR(50) NOT NULL,
      type VARCHAR(15) NOT NULL CHECK (type IN ('vaccin','antiparasitaire', 'examen')),
      UNIQUE(cat_id, date, type)
    );`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS vet_vouchers (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      user_name VARCHAR(101) NOT NULL,
      cat_id INTEGER NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
      clinic VARCHAR(51) NOT NULL,
      object VARCHAR(165) NOT NULL,
      processed_on DATE,
      UNIQUE(cat_id, date, clinic, object),
      created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL,
      updated_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      updated_at TIMESTAMPTZ NOT NULL
    );`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS message_threads (
      id SERIAL PRIMARY KEY,
      type VARCHAR(20) NOT NULL DEFAULT 'private' CHECK (type IN ('private','group')),
      name VARCHAR(255),
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS thread_participants (
      thread_id INTEGER NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role VARCHAR(20) DEFAULT 'member', -- admin / member
      joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (thread_id, user_id)
    );`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      thread_id INTEGER NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
      sender_id INTEGER NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      deleted_at TIMESTAMPTZ
    );`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS message_reads (
      message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (message_id, user_id)
    );`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS news (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      url VARCHAR(50) NOT NULL
    );`);

  await pool.query(`
      CREATE TABLE IF NOT EXISTS message_attachments (
      id          SERIAL PRIMARY KEY,
      message_id  INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
      filename    TEXT NOT NULL,           -- nom stocké sur disque
      original_name TEXT NOT NULL,         -- nom original du fichier
      mime_type   TEXT NOT NULL,
      size        INTEGER NOT NULL,        -- taille en bytes
      url         TEXT NOT NULL,           -- chemin public ex: /uploads/messaging/xxx.pdf
      created_at  TIMESTAMPTZ DEFAULT now()
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

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_message_thread_id ON message_threads(id);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_message_user_id ON users(id);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_thread_participants_user ON thread_participants(user_id);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_message_reads_user ON message_reads(user_id);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_messages_thread_sent ON messages(thread_id, sent_at DESC);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_message_reads_user_message ON message_reads(user_id, message_id);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_messages_thread_sender ON messages(thread_id, sender_id);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id);
  `);
}

// function slugify(input) {
//   const s = String(input || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
//   const slug = s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-');
//   return slug || 'cat';
// }

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
    await pool.query('INSERT INTO users(name, lastname, phone, address, city, roles, email, password_hash, capacity) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (email) DO NOTHING', 
            [
              'super',
              'admin',
              '----------',
              '-',
              '-',
              'Admin',
              'superadmin@exemple.com',
              'scrypt:8850c2aec59d2e4841e4f1f1a1091f55:2ec6fbedc853cd7f79fffa6f0fc952321b7363130bba327c6d5c5dcbcda839634b3bc68b6bc5afba493d0d04b49a7d793b68bbb2011832346bdc07ba238dbaba',
              'Empty'
            ]);
    await pool.query('INSERT INTO users(name, lastname, phone, address, city, roles, email, password_hash, capacity) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (email) DO NOTHING', 
            [
              'Sylvie',
              'Présidente',
              '0000000000',
              'Unknown',
              'Unknown',
              'Admin',
              'admin@exemple.com',
              'scrypt:8850c2aec59d2e4841e4f1f1a1091f55:2ec6fbedc853cd7f79fffa6f0fc952321b7363130bba327c6d5c5dcbcda839634b3bc68b6bc5afba493d0d04b49a7d793b68bbb2011832346bdc07ba238dbaba',
              'Empty'
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
          const ins = await pool.query('INSERT INTO users(name, lastname, phone, address, city, roles, email, referrer_id, capacity) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id',
            [
              p.hostFamily && p.hostFamily.name,
              p.hostFamily && p.hostFamily.lastName,
              p.hostFamily && p.hostFamily.phone ? p.hostFamily.phone : '0000000000',
              p.hostFamily && p.hostFamily.address ? p.hostFamily.address : null,
              p.hostFamily && p.hostFamily.city ? p.hostFamily.city : null,
              p.hostFamily && p.hostFamily.roles ? p.hostFamily.roles : 'hostfamily',
              p.hostFamily && p.hostFamily.email ? p.hostFamily.email : `unknown${Date.now()}@example.com`,
              p.hostFamily && p.hostFamily.referrerId ? p.hostFamily.referrerId : null,
              "Empty"
            ]);
          user = { id: ins.rows[0].id };
        }
      }

      // Prepare slug
      const base = tools.uuid();//slugify(p.name || 'cat');
      let slug = base;
      let n = 2;
      while (usedSlugs.has(slug)) {
        slug = `${base}-${n++}`;
      }
      usedSlugs.add(slug);

      // Insert cat
      const res = await pool.query(
        'INSERT INTO cats(slug, name, description, status, numIdentification, sex, dress, race, isSterilized, sterilizationDate, birthDate, isDuringVisit, isAdoptable, adoptionDate, hostfamily_id, created_by, created_at, updated_by, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,2, NOW(), 2, NOW()) ON CONFLICT (id) DO NOTHING RETURNING id',
        [
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
          p.isAdoptable ? 1 : 0,
          p.adoptionDate || null,
          user && user.id || null
        ]
      );
      p.id = res.rows[0].id;
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
    //slugify
}
