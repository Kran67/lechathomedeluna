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
    birthDate: row.birthDate,
    pictures: [row.url],
    hostFamily: row.hostFamily_id ? { id: row.hostFamily_id, name: row.hostFamily_name } : undefined,
  };
}

function slugify(input) {
  const s = String(input || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const slug = s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-');
  return slug || 'cat';
}

async function ensureUniqueSlug(db, base, excludeId = null) {
  let slug = base;
  let n = 2;
  // Loop until slug is unique
  while (true) {
    const row = excludeId
      ? await db.getAsync('SELECT id FROM cats WHERE slug = ? AND id != ?', [slug, excludeId])
      : await db.getAsync('SELECT id FROM cats WHERE slug = ?', [slug]);
    if (!row) return slug;
    slug = `${base}-${n++}`;
  }
}

async function listCats(db, isAdopted = false) {
  const rows = await db.allAsync(`
      SELECT DISTINCT c.id, c.slug, c.name, substr(c.description, 1, 210) AS description, c.status, c.sex, c.dress, c.race, c.birthDate, cp.url
      FROM cats c
      LEFT JOIN cat_pictures cp ON cp.cat_id = c.id
	    GROUP BY c.id, c.slug, c.name, c.description, c.status, c.sex, c.dress, c.race, c.birthDate
      HAVING c.isAdopted = ${isAdopted ? '1' : '0 OR c.isAdopted IS NULL'}
      ORDER BY c.name ASC
    `);
  return rows.map(mapCatRow);
}

async function getCatDetails(db, slug) {
  const row = await db.getAsync(`
    SELECT p.*, u.id AS hostFamily_id, u.name AS hostFamily_name
    FROM cats p
    LEFT JOIN users u ON u.id = p.hostfamily_id
    WHERE p.slug = ?
  `, [slug]);
  if (!row) return null;
  const base = mapCatRow(row);
  const pictures = await db.allAsync('SELECT url FROM cat_pictures WHERE cat_id = ?', [base.id]);
  if (pictures.length === 0) {
      pictures.push({ url:"/images/chat.png"});
  }
  //const vaccines = await db.allAsync('SELECT name FROM cat_equipments WHERE cat_id = ?', [id]);
  return {
    ...base,
    pictures: pictures.map(r => r.url),
    //vaccines: equipments.map(r => r.name),
  };
}

async function createCat(db, payload) {
  const {
    id,
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
  const uniqueSlug = await ensureUniqueSlug(db, base);
  const r = await db.runAsync(
    `INSERT INTO cats(name, slug, description, status, numIdentification, sex, dress, race, isSterilized, sterilizationDate, birthDate, isDuringVisit, isAdopted, adoptionDate, hostFamily_id)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [name, uniqueSlug, description, status, numIdentification, sex, dress, race, isSterilized, sterilizationDate, birthDate, isDuringVisit, isAdopted, adoptionDate, hostFamilyId]
  );

  if (Array.isArray(pictures)) {
    for (const url of pictures) {
      if (url) await db.runAsync('INSERT OR IGNORE INTO cat_pictures(cat_id, url) VALUES (?,?)', [r.lastID, url]);
    }
  }

  return await getCatDetails(db, r.lastID);
}

async function updateCat(db, slug, changes) {
  const allowed = ['name', 'description', 'status', 'numIdentification', 'sex', 'dress', 'race', 'isSterilized', 'sterilizationDate', 'birthDate', 'isDuringVisit', 'isAdopted', 'adoptionDate', 'hostFamily_Id'];
  const fields = [];
  const params = [];

  for (const k of allowed) {
    if (k in (changes || {})) {
      fields.push(`${k} = ?`);
      params.push(changes[k]);
    }
  }

  if (fields.length === 0) {
    const err = new Error('Aucun champ à mettre à jour');
    err.status = 400;
    throw err;
  }
  params.push(slug);
  const r = await db.runAsync(`UPDATE cats SET ${fields.join(', ')} WHERE slug = ?`, params);
  if (r.changes === 0) {
    const err = new Error('Chat introuvable');
    err.status = 404;
    throw err;
  }
  return await getCatDetails(db, slug);
}

async function deleteCat(db, id) {
  const r = await db.runAsync('DELETE FROM cats WHERE id = ?', [id]);
  if (r.changes === 0) {
    const err = new Error('Chat introuvable');
    err.status = 404;
    throw err;
  }
}

async function getCatHostFamilyId(db, id) {
  const row = await db.getAsync('SELECT hostfamily_id FROM cats WHERE id = ?', [id]);
  return row ? row.hostfamily_id : null;
}

module.exports = {
  listCats,
  getCatDetails,
  createCat,
  updateCat,
  deleteCat,
  getCatHostFamilyId,
};
