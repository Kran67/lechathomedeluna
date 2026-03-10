const path = require('path');
const fs = require('fs');
const { Client } = require("pg");
const pool = require("./pool");
const tools = require("../utils/lib");
const https = require('https');

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
  await client.query('DROP SCHEMA public CASCADE;');
  await client.query('CREATE SCHEMA public;');
  await client.query('GRANT ALL ON SCHEMA public TO postgres;');
  await client.query('GRANT ALL ON SCHEMA public TO public;');
  await client.query("COMMENT ON SCHEMA public IS 'standard public schema';");
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
    CREATE TABLE IF NOT EXISTS postal_codes (
      id          SERIAL PRIMARY KEY,
      code        VARCHAR(5)  NOT NULL,
      city        VARCHAR(100) NOT NULL,
      department  VARCHAR(20)  NOT NULL,
      region      VARCHAR(50) NOT NULL DEFAULT 'Grand Est',
      UNIQUE(code, city, department)
    );`);

    await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        lastName VARCHAR(50) NOT NULL,
        social_number VARCHAR(13),
        phone VARCHAR(10) NOT NULL,
        address VARCHAR(255) NOT NULL,
        cityId INTEGER NOT NULL REFERENCES postal_codes(id),
        roles VARCHAR(200) NOT NULL,
        email VARCHAR(100),
        password_hash VARCHAR(255),
        blacklisted BOOLEAN DEFAULT false,
        referrer_id INTEGER REFERENCES users(id) ON DELETE RESTRICT,
        capacity VARCHAR(5) NOT NULL CHECK (capacity IN ('Empty','Full')),
        birthDate DATE,
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
      favoriteCount INTEGER DEFAULT 0,
      preVisitDate DATE,
      hostfamily_id INTEGER REFERENCES users(id) ON DELETE RESTRICT,
      entryDate DATE,
      provenance VARCHAR(50),
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
      original_name TEXT NOT NULL,         -- nom original du fichier
      UNIQUE(cat_id, date, type)
    );`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS vet_vouchers (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      user_id  INTEGER NOT NULL REFERENCES users(id),
      cat_id INTEGER NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
      clinic VARCHAR(51) NOT NULL,
      object VARCHAR(175) NOT NULL,
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
    CREATE TABLE IF NOT EXISTS cat_request_adoptions (
      id SERIAL PRIMARY KEY,
      cat_id INTEGER NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      last_name VARCHAR(30) NOT NULL,
      first_name VARCHAR(30) NOT NULL,
      email VARCHAR(100) NOT NULL,
      facebook VARCHAR(100),
      lifePlace VARCHAR(26) NOT NULL CHECK (lifePlace IN ('Maison','Appartement', 'Studio', 'Loft', 'Duplex, triplex ou souplex')),
      area INTEGER NOT NULL,
      isOutsideAccess BOOLEAN DEFAULT false,
      householdPeopleNumber INTEGER NOT NULL,
      alreadyPresenAnimalsNumber INTEGER NOT NULL,
      dailyTimeOff VARCHAR(12) NOT NULL CHECK (dailyTimeOff IN ('Aucun', '1 heure', '2 heures', '3 heures', 'demi-journée', '5 heures', '6 heures', '7 heures', 'Journée', 'Soirée', 'Nuit')),
      holidaysChildcareSolution BOOLEAN DEFAULT false
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

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_postal_codes_code ON postal_codes(code);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_postal_codes_city ON postal_codes(city);
  `);
}

async function seedBaseData() {
  // uitisateurs de base
  await pool.query('INSERT INTO users(name, lastname, phone, address, cityId, roles, email, password_hash, capacity) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (email) DO NOTHING', 
          [
            'super',
            'admin',
            '----------',
            '-',
            4200,
            'Admin',
            'superadmin@exemple.com',
            'scrypt:8850c2aec59d2e4841e4f1f1a1091f55:2ec6fbedc853cd7f79fffa6f0fc952321b7363130bba327c6d5c5dcbcda839634b3bc68b6bc5afba493d0d04b49a7d793b68bbb2011832346bdc07ba238dbaba',
            'Empty'
          ]);
  await pool.query('INSERT INTO users(name, lastname, phone, address, cityId, roles, email, password_hash, capacity) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (email) DO NOTHING', 
          [
            'Sylvie',
            'Présidente',
            '0000000000',
            'Unknown',
            4200,
            'Admin|CommitteeMember',
            'admin@exemple.com',
            'scrypt:8850c2aec59d2e4841e4f1f1a1091f55:2ec6fbedc853cd7f79fffa6f0fc952321b7363130bba327c6d5c5dcbcda839634b3bc68b6bc5afba493d0d04b49a7d793b68bbb2011832346bdc07ba238dbaba',
            'Empty'
          ]);
  await pool.query("INSERT INTO news (date, url) VALUES ('2026-03-29','/images/news/Loto29-03-2026.jpeg')");

  await pool.query('INSERT INTO users(name, lastname, phone, address, cityId, roles, email, password_hash, capacity) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (email) DO NOTHING', 
          [ //3
            'Marine',
            'Schneider',
            '0632272078',
            'Unknown',
            4697,
            'CommitteeMember|AdoptionReferent',
            'marine.schneider@exemple.com',
            'scrypt:8850c2aec59d2e4841e4f1f1a1091f55:2ec6fbedc853cd7f79fffa6f0fc952321b7363130bba327c6d5c5dcbcda839634b3bc68b6bc5afba493d0d04b49a7d793b68bbb2011832346bdc07ba238dbaba',
            'Empty'
          ]);
  await pool.query('INSERT INTO users(name, lastname, phone, address, cityId, roles, email, password_hash, capacity) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (email) DO NOTHING', 
          [ //4
            'Amandine',
            'List',
            '0680578792',
            'Unknown',
            4653,
            'CommitteeMember|HealthRegisterReferent',
            'amandine.list@exemple.com',
            'scrypt:8850c2aec59d2e4841e4f1f1a1091f55:2ec6fbedc853cd7f79fffa6f0fc952321b7363130bba327c6d5c5dcbcda839634b3bc68b6bc5afba493d0d04b49a7d793b68bbb2011832346bdc07ba238dbaba',
            'Empty'
          ]);
  await pool.query('INSERT INTO users(name, lastname, phone, address, cityId, roles, email, password_hash, capacity) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (email) DO NOTHING', 
          [ //5
            'Thibaut',
            'B',
            '0626196258',
            'Unknown',
            4200,
            'CommitteeMember|VetVoucherReferent',
            'thibaut.b@exemple.com',
            'scrypt:8850c2aec59d2e4841e4f1f1a1091f55:2ec6fbedc853cd7f79fffa6f0fc952321b7363130bba327c6d5c5dcbcda839634b3bc68b6bc5afba493d0d04b49a7d793b68bbb2011832346bdc07ba238dbaba',
            'Empty'
          ]);
  await pool.query('INSERT INTO users(name, lastname, phone, address, cityId, roles, email, password_hash, capacity) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (email) DO NOTHING', 
          [ //6
            'Patricia',
            'Belloni',
            '0626196258',
            'Unknown',
            4465,
            'CommitteeMember|ICADReferent',
            'patricia.belloni@exemple.com',
            'scrypt:8850c2aec59d2e4841e4f1f1a1091f55:2ec6fbedc853cd7f79fffa6f0fc952321b7363130bba327c6d5c5dcbcda839634b3bc68b6bc5afba493d0d04b49a7d793b68bbb2011832346bdc07ba238dbaba',
            'Empty'
          ]);
  await pool.query('INSERT INTO users(name, lastname, phone, address, cityId, roles, email, password_hash, capacity) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (email) DO NOTHING', 
          [ //7
            'Dominique',
            'Cometti',
            '0661348002',
            'Unknown',
            4435,
            'CommitteeMember|PreVisitReferent',
            'dominique.cometti@exemple.com',
            'scrypt:8850c2aec59d2e4841e4f1f1a1091f55:2ec6fbedc853cd7f79fffa6f0fc952321b7363130bba327c6d5c5dcbcda839634b3bc68b6bc5afba493d0d04b49a7d793b68bbb2011832346bdc07ba238dbaba',
            'Empty'
          ]);
  // groupes de discussion de base
  await pool.query('INSERT INTO message_threads (type, name, created_by) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', ['group', 'Adoption', 1]);
  await pool.query('INSERT INTO message_threads (type, name, created_by) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', ['group', 'Bons vétérinaire', 1]);
  await pool.query('INSERT INTO message_threads (type, name, created_by) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', ['group', 'Registre sanitaire', 1]);
  await pool.query('INSERT INTO message_threads (type, name, created_by) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', ['group', 'Visite', 1]);
  await pool.query('INSERT INTO message_threads (type, name, created_by) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', ['group', 'ICAD', 1]);
  // participants sur les groupes de discussion de base
  await pool.query('INSERT INTO thread_participants (thread_id, user_id, role) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [1, 2, 'admin']);
  await pool.query('INSERT INTO thread_participants (thread_id, user_id, role) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [1, 3, 'member']);
  await pool.query('INSERT INTO thread_participants (thread_id, user_id, role) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [2, 2, 'admin']);
  await pool.query('INSERT INTO thread_participants (thread_id, user_id, role) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [2, 5, 'member']);
  await pool.query('INSERT INTO thread_participants (thread_id, user_id, role) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [3, 2, 'admin']);
  await pool.query('INSERT INTO thread_participants (thread_id, user_id, role) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [3, 4, 'member']);
  await pool.query('INSERT INTO thread_participants (thread_id, user_id, role) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [4, 2, 'admin']);
  await pool.query('INSERT INTO thread_participants (thread_id, user_id, role) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [4, 7, 'member']);
  await pool.query('INSERT INTO thread_participants (thread_id, user_id, role) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [5, 2, 'admin']);
  await pool.query('INSERT INTO thread_participants (thread_id, user_id, role) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [5, 6, 'member']);

}

async function importPostalCodes() {
  const GRAND_EST_DEPTS = ['08','10','51','52','54','55','57','67','68','88'];
  const GRAND_EST_DEPT_NAMES = ['Ardennes','Aube','Marne','Haute-Marne','Meurthe-et-Moselle','Meuse','Moselle','Bas-Rhin','Haut-Rhin','Vosges'];
  const CSV_URL = 'https://datanova.laposte.fr/data-fair/api/v1/datasets/laposte-hexasmal/raw';
  const csv = await fetchCSV(CSV_URL);
  const lines = csv.split('\n').slice(1); // skip header

  for (const line of lines) {
    const cols = line.split(';');
    if (cols.length < 3) continue;

    const city = cols[1]?.trim();   // ← Nom_commune  (index 1, pas 0)
    const code = cols[2]?.trim();   // ← Code_postal  (index 2, pas 0)
    const dept = code?.slice(0, 2);
    const deptName = GRAND_EST_DEPT_NAMES[GRAND_EST_DEPTS.indexOf(dept)];

    if (!code || !city) continue;
    if (!GRAND_EST_DEPTS.includes(dept)) continue;

    await pool.query(
      `INSERT INTO postal_codes (code, city, department)
      VALUES ($1, $2, $3)
      ON CONFLICT DO NOTHING`,
      [code, city, deptName]
    );
  }
  console.log('Import terminé');
  //process.exit(0);
}

function fetchCSV(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    });
  });
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
    console.log('Début Import');
    await importPostalCodes();
    await seedBaseData();
    for (const p of data) {
      // Ensure owner user exists
      let user = null;
      if (p.hostFamily) {
        const { rows } = await pool.query('SELECT id FROM users WHERE email = $1 ', [p.hostFamily.email]);
        if (rows.length > 0) {
          user = { id: rows[0].id };
        }
        if (!user) {
          const ins = await pool.query('INSERT INTO users(name, lastname, phone, address, cityId, roles, email, referrer_id, capacity) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id',
            [
              p.hostFamily && p.hostFamily.name,
              p.hostFamily && p.hostFamily.lastName,
              p.hostFamily && p.hostFamily.phone ? p.hostFamily.phone : '0000000000',
              p.hostFamily && p.hostFamily.address ? p.hostFamily.address : null,
              p.hostFamily && p.hostFamily.cityId ? p.hostFamily.cityId : null,
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
      if (Array.isArray(p.pictures)) p.pictures.forEach(async (u, idx) => u && await pool.query('INSERT INTO cat_pictures(cat_id, url, scheduling) VALUES ($1,$2,$3)', [p.id, u, idx]));
    }
  } catch (e) {
    console.log(e);
  }
}

module.exports = {
    initializeDb,
    //slugify
}
