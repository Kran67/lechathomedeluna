const pool = require("../db/pool");
const tools = require("../utils/lib");

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
    numIdentification: row.numidentification,
    sex: row.sex,
    dress: row.dress,
    race: row.race,
    isSterilized: row.issterilized,
    sterilizationDate: row.sterilizationdate,
    birthDate: row.birthdate,
    isDuringVisit: row.isduringvisit,
    isAdoptable: row.isadoptable,
    adoptionDate: row.adoptiondate,
    hostFamily: row.hostfamily_id ? { id: row.hostfamily_id, name: row.hostfamily_name } : undefined,
    pictures: [row.url],
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

async function listCats(isAdoptable = false, year = 0, hostFamilyId = null) {
  let sql = `
      SELECT DISTINCT c.*, cp.url
      FROM cats c
      LEFT JOIN LATERAL (
        SELECT url
        FROM cat_pictures
        WHERE cat_id = c.id
        ORDER BY id ASC
        LIMIT 1
      ) cp ON true`;
    if (hostFamilyId) {
      sql += ` WHERE c.hostfamily_id = ${hostFamilyId}`;
    } else if (year > 0) {
      sql += ` WHERE c.adoptionDate IS NOT NULL AND DATE_PART('year',  c.adoptionDate) = ${year}`;
    } else if (isAdoptable) {
      sql += ' WHERE isAdoptable = true AND c.adoptionDate IS NULL';
    } else {
      sql += ' WHERE c.isAdoptable = false AND c.adoptionDate IS NULL ';
    }
    sql += ' ORDER BY c.name ASC';
  const res = await pool.query(sql);
  return res.rows.map(mapCatRow);
}

async function getCatDetails(slug) {
  const res = await pool.query(`
    SELECT p.*, u.id AS hostFamily_id, u.name AS hostFamily_name
    FROM cats p
    LEFT JOIN users u ON u.id = p.hostfamily_id
    WHERE p.slug = $1
  `, [slug]);
  if (res.rows.length === 0) return null;
  const base = mapCatRow(res.rows[0]);
  const resPic = await pool.query('SELECT url FROM cat_pictures WHERE cat_id = $1 ORDER BY scheduling ASC', [base.id]);
  if (resPic.rows.length === 0) {
      resPic.rows.push({ url:"/images/chat.png"});
  }
  const resVac = await pool.query('SELECT date, url, type FROM cat_documents WHERE cat_id = $1 ORDER BY date ASC', [base.id]);
  return {
    ...base,
    pictures: resPic.rows.map(p => p.url),
    documents: resVac.rows.map(v => { return { date: v.date, picture: v.url, type: v.type } }),
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
    isAdoptable = false,
    adoptionDate = null,
    hostFamilyId = null,
    pictures = [],
    userId = null,
  } = payload || {};

  if (!name) throw new Error('Nom est requis');
  if (!description) throw new Error('Description est requis');
  if (!sex) throw new Error('Sexe est requis');

  const base = tools.uuid();
  const uniqueSlug = await ensureUniqueSlug(base);
  const res = await pool.query(
    `INSERT INTO cats(name, slug, description, status, numIdentification, sex, dress, race, isSterilized, sterilizationDate, birthDate, isDuringVisit, isAdoptable, adoptionDate, hostFamily_id, created_by, created_at, updated_by, updated_at) 
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15, $16, NOW(), $17, NOW()) RETURNING id`,
    [name, uniqueSlug, description, status, numIdentification, sex, dress, race, isSterilized, sterilizationDate, birthDate, isDuringVisit, isAdoptable, adoptionDate, hostFamilyId, userId, userId]
  );
  const lastId = res.rows[0].id;

  if (Array.isArray(pictures)) {
    for (const url of pictures) {
      if (url) await pool.query('INSERT INTO cat_pictures(cat_id, url) VALUES ($1,$2)', [lastId, url]);
    }
  }

  return await getCatDetails(uniqueSlug);
}

async function updateCat(slug, changes) {
  const allowed = ['name', 'description', 'status', 'numIdentification', 'sex', 'dress', 'race', 'isSterilized', 'sterilizationDate', 'birthDate', 'isDuringVisit', 'isAdoptable', 'adoptionDate', 'hostFamily_Id'];
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
  const res = await pool.query(`UPDATE cats SET ${fields.join(', ')}, updated_by = ${changes["userId"]}, updated_at = NOW() WHERE slug = $${fields.length + 1}`, params);
  if (res.rowCount === 0) {
    const err = new Error('Chat introuvable');
    err.status = 404;
    throw err;
  }
  return await getCatDetails(slug);
}

async function deleteCat(id) {
  const res = await pool.query('DELETE FROM cats WHERE id = $1', [id]);
  if (res.rowCount === 0) {
    const err = new Error('Chat introuvable');
    err.status = 404;
    throw err;
  }
}

async function getCatHostFamilyId(id) {
  const res = await pool.query('SELECT hostfamily_id FROM cats WHERE id = $1', [id]);
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
