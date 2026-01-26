function mapCatRow(row) {
  if (!row) return null;
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

function genId() {
  return Math.random().toString(16).slice(2, 10);
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

async function listCats(db, isAdopted) {
  const rows = await db.allAsync(`
      SELECT DISTINCT c.id, c.slug, c.name, substr(c.description, 1, 210) AS description, c.status, c.sex, c.dress, c.race, c.birthDate, cp.url
      FROM cats c
      JOIN cat_pictures cp ON cp.cat_id = c.id
	    GROUP BY c.id, c.slug, c.name, c.description, c.status, c.sex, c.dress, c.race, c.birthDate
      ${isAdopted !== undefined ? 'HAVING c.isAdopted = ' + (isAdopted === 'true' ? '1' : '0') : ''}
      ORDER BY c.name ASC
    `);
  return rows.map(mapCatRow);
}

async function getCatDetails(db, id) {
  const row = await db.getAsync(`
    SELECT p.*, u.id AS hostFamily_id, u.name AS hostFamily_name
    FROM cats p
    LEFT JOIN users u ON u.id = p.hostfamily_id
    WHERE p.slug = ?
  `, [id]);
  if (!row) return null;
  const base = mapCatRow(row);
  const pictures = await db.allAsync('SELECT url FROM cat_pictures WHERE cat_id = ?', [base.id]);
  //const vaccines = await db.allAsync('SELECT name FROM cat_equipments WHERE cat_id = ?', [id]);
  return {
    ...base,
    pictures: pictures.map(r => r.url),
    //vaccines: equipments.map(r => r.name),
  };
}

async function ensureHost(db, host_id, host) {
  if (host_id) return host_id;
  if (host && host.name) {
    const hostName = String(host.name);
    const hostPic = host.picture || null;
    const found = await db.getAsync('SELECT id FROM users WHERE name = ? AND IFNULL(picture, "") = IFNULL(?, "")', [hostName, hostPic]);
    if (found) return found.id;
    const ins = await db.runAsync('INSERT INTO users(name, picture, role) VALUES (?,?,?)', [hostName, hostPic, 'owner']);
    return ins.lastID;
  }
  return null;
}

async function createCat(db, payload) {
  const {
    id,
    name,
    description = null,
    cover = null,
    location = null,
    price_per_night,
    host_id,
    host,
    pictures = [],
    vaccines = [],
  } = payload || {};

  if (!name) throw new Error('Nom est requis');
  let price = Number(price_per_night);
  if (!Number.isFinite(price) || price <= 0) price = 80;

  //const resolvedHostId = await ensureHost(db, host_id, host);
  //if (!resolvedHostId) {
  //  const err = new Error('host_id ou host{nom,image} requis');
  //  err.status = 400; // to allow controller to map specific status
  //  throw err;
  //}

  const newId = id || genId();
  const base = slugify(title);
  const uniqueSlug = await ensureUniqueSlug(db, base);
  await db.runAsync(
    'INSERT INTO cats(id, title, slug, description, cover, location, host_id, price_per_night) VALUES (?,?,?,?,?,?,?,?)',
    [newId, title, uniqueSlug, description, cover, location, price]
  );

  if (Array.isArray(pictures)) {
    for (const url of pictures) {
      if (url) await db.runAsync('INSERT OR IGNORE INTO cat_pictures(cat_id, url) VALUES (?,?)', [newId, url]);
    }
  }
//  if (Array.isArray(equipments)) {
//    for (const name of equipments) {
//      if (name) await db.runAsync('INSERT OR IGNORE INTO property_equipments(property_id, name) VALUES (?,?)', [newId, name]);
//    }
//  }

  return await getCatDetails(db, newId);
}

async function updateCat(db, id, changes) {
  const allowed = ['title', 'description', 'cover', 'location', 'host_id', 'price_per_night'];
  const fields = [];
  const params = [];

  let newSlug = null;
  if (Object.prototype.hasOwnProperty.call(changes || {}, 'title')) {
    const base = slugify(changes.title);
    newSlug = await ensureUniqueSlug(db, base, id);
  }

  for (const k of allowed) {
    if (k in (changes || {})) {
      fields.push(`${k} = ?`);
      params.push(changes[k]);
    }
  }
  if (newSlug) {
    fields.push('slug = ?');
    params.push(newSlug);
  }

  if (fields.length === 0) {
    const err = new Error('Aucun champ à mettre à jour');
    err.status = 400;
    throw err;
  }
  params.push(id);
  const r = await db.runAsync(`UPDATE cats SET ${fields.join(', ')} WHERE id = ?`, params);
  if (r.changes === 0) {
    const err = new Error('Cat not found');
    err.status = 404;
    throw err;
  }
  return await getCatDetails(db, id);
}

async function deleteCat(db, id) {
  const r = await db.runAsync('DELETE FROM cats WHERE id = ?', [id]);
  if (r.changes === 0) {
    const err = new Error('Chat introuvable');
    err.status = 404;
    throw err;
  }
}

async function getCatOwnerId(db, id) {
  const row = await db.getAsync('SELECT host_id FROM cats WHERE id = ?', [id]);
  return row ? row.host_id : null;
}

module.exports = {
  listCats,
  getCatDetails,
  createCat,
  updateCat,
  deleteCat,
  getCatOwnerId,
};
