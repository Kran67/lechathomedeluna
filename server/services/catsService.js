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
    favoriteCount: row.favoritecount,
    isPreVisit: row.isprevisit,
    preVisitDate: row.previsitdate,
    pictures: [row.url],
  };
}

function mapCatUnCompletdRow(row) {
  if (!row) return null;
  return {
    slug: row.slug,
    name: row.name,
    numId: row.numidentification,
    fields: row.fields
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
    SELECT c.*, u.id AS hostFamily_id, u.name AS hostFamily_name
    FROM cats c
    LEFT JOIN users u ON u.id = c.hostfamily_id
    WHERE c.slug = $1
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
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,false,$13,$14, $15, NOW(), $16, NOW()) RETURNING id`,
    [name, uniqueSlug, description, status, numIdentification, sex, dress, race, isSterilized, sterilizationDate, birthDate, isDuringVisit, adoptionDate, hostFamilyId, userId, userId]
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
  const allowed = ['name', 'description', 'status', 'numIdentification', 'sex', 'dress', 'race', 'isSterilized', 'sterilizationDate', 'birthDate', 'isDuringVisit', 'isAdoptable', 'adoptionDate', 'hostFamily_Id', 'isPreVisit', 'preVisitDate'];
  const fields = [];
  const params = [];

  for (const key of allowed) {
    if (key in (changes || {})) {
      fields.push(`${key} = $${allowed.indexOf(key) + 1}`);
      if (["sterilizationDate", "birthDate", "adoptionDate", "preVisitDate"].includes(key) && changes[key] === "") {
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

async function updateCatFavoriteCount(slug) {
  await pool.query('UPDATE cats SET favoriteCount = favoriteCount + 1 WHERE slug = $1', [slug]);
}

async function getAllCatsNotFullyCompletedCount() {
  const res = await pool.query(`SELECT COUNT(*) AS count
    FROM cats
    WHERE isadoptable = false AND
      (description       IS NULL OR description       = '' OR
      numIdentification IS NULL OR numIdentification = '' OR
      dress             IS NULL OR dress             = '' OR
      race              IS NULL OR race              = '' OR
      sterilizationDate IS NULL OR
      birthDate         IS NULL OR
      adoptionDate      IS NULL OR
      hostfamily_id     IS NULL);`);
  return res.rows[0].count;
}

async function getAllCatsNotFullyCompletedList() {
  const res = await pool.query(`SELECT 
      slug,
      name,
      numIdentification,
      ARRAY_REMOVE(ARRAY[
        CASE WHEN description       IS NULL OR description       = '' THEN 'description'       END,
        CASE WHEN numIdentification IS NULL OR numIdentification = '' THEN 'n° d''identification' END,
        CASE WHEN dress             IS NULL OR dress             = '' THEN 'robe'             END,
        CASE WHEN race              IS NULL OR race              = '' THEN 'race'              END,
        CASE WHEN sterilizationDate IS NULL                          THEN 'date de stérilisation' END,
        CASE WHEN birthDate         IS NULL                          THEN 'date de naissance'         END,
        CASE WHEN adoptionDate      IS NULL                          THEN 'date d''adoption'      END,
        CASE WHEN hostfamily_id     IS NULL                          THEN 'famille d''accueil'     END
      ], NULL) AS fields
    FROM cats
    WHERE
      description       IS NULL OR description       = '' OR
      numIdentification IS NULL OR numIdentification = '' OR
      dress             IS NULL OR dress             = '' OR
      race              IS NULL OR race              = '' OR
      sterilizationDate IS NULL OR
      birthDate         IS NULL OR
      adoptionDate      IS NULL OR
      hostfamily_id     IS NULL
    ORDER BY name;`);
  return res.rows.map(mapCatUnCompletdRow);
}

async function catsHasPreVisitWithoutDateList() {
  let sql = `
      SELECT DISTINCT c.*
      FROM cats c
      WHERE isPreVisit = true AND preVisitDate IS NULL
      ORDER BY c.name ASC`;
  const res = await pool.query(sql);
  return res.rows.map(mapCatRow);
}

async function createAdoptionRequestForCat(payload) {
  const {
    catId = null,
    lastName = null,
    firstName = null,
    email = null,
    facebook = null,
    lifePlace = null,
    area = null,
    isOutsideAccess = null,
    householdPeopleNumber = null,
    alreadyPresenAnimalsNumber = null,
    dailyTimeOff = null,
    holidaysChildcareSolution = null,
    baseUrl = null,
    slug = null,
    name = null,
  } = payload || {};

  if (!catId) throw new Error('Le chat est requis');
  if (!lastName) throw new Error('Nom est requis');
  if (!firstName) throw new Error('Prénom est requis');
  if (!email) throw new Error('Email est requis');
  if (!lifePlace) throw new Error('Lieu de vie est requis');
  if (!area) throw new Error('Superficie est requise');
  if (!isOutsideAccess) throw new Error('Accès à l’extérieur est requis');
  if (!householdPeopleNumber) throw new Error('Nombre de personnes dans le foyer est requis');
  if (!alreadyPresenAnimalsNumber) throw new Error('Nombre d’animaux déjà présent est requis');
  if (!dailyTimeOff) throw new Error('Temps d’absence quotidien est requis');
  if (!holidaysChildcareSolution) throw new Error('Solution de garde pendant les congés est requis');
  
  await pool.query(
    `INSERT INTO cat_request_adoptions(cat_id, date, last_name, first_name, email, facebook, lifePlace, area, isOutsideAccess, householdPeopleNumber, alreadyPresenAnimalsNumber, dailyTimeOff, holidaysChildcareSolution)
     VALUES ($1,NOW(),$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    [catId, lastName, firstName, email, facebook, lifePlace, area, isOutsideAccess, householdPeopleNumber, alreadyPresenAnimalsNumber, dailyTimeOff, holidaysChildcareSolution]
  );
}

module.exports = {
  listCats,
  getCatDetails,
  createCat,
  updateCat,
  deleteCat,
  getCatHostFamilyId,
  updateCatFavoriteCount,
  getAllCatsNotFullyCompletedCount,
  getAllCatsNotFullyCompletedList,
  catsHasPreVisitWithoutDateList,
  createAdoptionRequestForCat
};
