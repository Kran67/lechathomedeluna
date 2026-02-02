const { slugify } = require('../db/ensureDatabase');
const pool = require("../db/pool");

function mapCatRow(row) {
  if (!row) return null;
  if (!row.url) {
    row.url = "/images/chat.png";
  }
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    status: row.status,
    sex: row.sex,
    dress: row.dress,
    race: row.race,
    birthDate: row.birthdate,
    pictures: [row.url],
    hostFamily: row.hostfamily_id ? { id: row.hostfamily_id, name: row.hostfamily_name } : undefined,
  };
}

async function ensureUniqueSlug(base, excludeId = null) {
  let slug = base;
  let n = 2;
  // Loop until slug is unique
  while (true) {
    const res = excludeId
      ? await pool.query('SELECT id FROM cats WHERE slug = $1 AND id != $2', [slug, excludeId])
      : await pool.query('SELECT id FROM cats WHERE slug = $1', [slug]);
    if (res.rows.length === 0) return slug;
    slug = `${base}-${n++}`;
  }
}

async function listCats(isAdopted = false, year = 0) {
  const sql = `
      SELECT DISTINCT c.id, c.slug, c.name, substr(c.description, 1, 210) AS description, c.status, c.sex, c.dress, c.race, c.birthDate, cp.url
      FROM cats c
      LEFT JOIN LATERAL (
        SELECT url
        FROM cat_pictures
        WHERE cat_id = c.id
        ORDER BY id ASC
        LIMIT 1
      ) cp ON true
      WHERE c.isAdopted = ${isAdopted ? 'true' : 'false OR c.isAdopted IS NULL'}`
      + (isAdopted && year !== 0 ? ` AND DATE_PART('year',  c.adoptionDate) = ${year}` : "") +
    `  ORDER BY c.name ASC
    `;
  const res = await pool.query(sql);
  return res.rows.map(mapCatRow);
}

async function getCatDetails(slug) {
  let res = await pool.query(`
    SELECT p.*, u.id AS hostFamily_id, u.name AS hostFamily_name
    FROM cats p
    LEFT JOIN users u ON u.id = p.hostfamily_id
    WHERE p.slug = $1
  `, [slug]);
  if (!res.rows.length === 0) return null;
  const base = mapCatRow(res.rows[0]);
  res = await pool.query('SELECT url FROM cat_pictures WHERE cat_id = $1 ORDER BY scheduling ASC', [base.id]);
  if (res.rows.length === 0) {
      res.rows.push({ url:"/images/chat.png"});
  }
  //const vaccines = await db.allAsync('SELECT name FROM cat_equipments WHERE cat_id = ?', [id]);
  return {
    ...base,
    pictures: res.rows.map(r => r.url),
    //vaccines: equipments.map(r => r.name),
  };
}

async function createCat(payload) {
  const {
    name,
    description = null,
    status = null,
    numIdentification = null,
    sex = null,
    dress = null,
    race = null,
    isSterilized = null,
    sterilizationDate = null,
    birthDate = null,
    isDuringVisit = null,
    isAdopted = null,
    adoptionDate = null,
    hostFamilyId = null,
    pictures = [],
  } = payload || {};

  if (!name) throw new Error('Nom est requis');
  if (!description) throw new Error('Description est requis');
  if (!sex) throw new Error('Sexe est requis');

  const base = slugify(name);
  const uniqueSlug = await ensureUniqueSlug(base);
  const res = await pool.query(
    `INSERT INTO cats(name, slug, description, status, numIdentification, sex, dress, race, isSterilized, sterilizationDate, birthDate, isDuringVisit, isAdopted, adoptionDate, hostFamily_id) 
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id`
    [name, uniqueSlug, description, status, numIdentification, sex, dress, race, isSterilized, sterilizationDate, birthDate, isDuringVisit, isAdopted, adoptionDate, hostFamilyId]
  );
  const lastId = res.rows[0].id;

  if (Array.isArray(pictures)) {
    for (const url of pictures) {
      if (url) await pool.query('INSERT INTO cat_pictures(cat_id, url) VALUES ($1,$2)', [lastId, url]);
    }
  }

  return await getCatDetails(lastId);
}

async function updateCat(slug, changes) {
  const allowed = ['name', 'description', 'status', 'numIdentification', 'sex', 'dress', 'race', 'isSterilized', 'sterilizationDate', 'birthDate', 'isDuringVisit', 'isAdopted', 'adoptionDate', 'hostFamily_Id'];
  const fields = [];
  const params = [];

  for (const key of allowed) {
    if (key in (changes || {})) {
      fields.push(`${key} = $${allowed.indexOf(key) + 1}`);
      if (["sterilizationDate", "birthDate", "adoptionDate"].includes(key) && changes[key] === "") {
        params.push(null);
      } else {
        params.push(changes[key]);
      }
    }
  }

  if (fields.length === 0) {
    const err = new Error('Aucun champ à mettre à jour');
    err.status = 400;
    throw err;
  }
  params.push(slug);
  const res = await pool.query(`UPDATE cats SET ${fields.join(', ')} WHERE slug = $${fields.length + 1}`, params);
  if (r.rowCount === 0) {
    const err = new Error('Chat introuvable');
    err.status = 404;
    throw err;
  }
  return await getCatDetails(slug);
}

async function deleteCat(id) {
  const res = await lastId('DELETE FROM cats WHERE id = $1', [id]);
  if (res.changes === 0) {
    const err = new Error('Chat introuvable');
    err.status = 404;
    throw err;
  }
}

async function getCatHostFamilyId(id) {
  const res = await lastId('SELECT hostfamily_id FROM cats WHERE id = $1', [id]);
  return res.rows.length > 0 ? res.rows[0] : null;
}

module.exports = {
  listCats,
  getCatDetails,
  createCat,
  updateCat,
  deleteCat,
  getCatHostFamilyId,
};
