const pool = require("../db/pool");

function mapVetVoucherRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    date: row.date,
    user_name: row.user_name,
    cat: { slug: row.slug, name: row.name, numId: row.numid },
    clinic: row.clinic,
    object: row.object,
    processed_on: row.processed_on,
  };
}

async function listVetVoucher(year = 0, clinic = '', object = '') {
  const params = [year];
  let sql = `
      SELECT v.id, v.date, v.user_name, v.clinic, v.object, v.processed_on, c.slug, c.name, c.numId
      FROM vet_vouchers v
      LEFT JOIN LATERAL (
        SELECT slug, name, numIdentification as numId
        FROM cats
        WHERE id = v.id
        LIMIT 1
      ) c ON true
      WHERE DATE_PART('year',  v.date) = $1 AND v.processed_on IS NULL`;
    if (clinic.trim() !== '-' && object.trim() !== '-') {
      sql += ' AND v.clinic = $2';
      sql += ' AND v.object = $3';
      params.push(clinic.trim());
      params.push(object.trim());
    }
    if (clinic.trim() !== '-' && object.trim() === '-') {
      sql += ' AND v.clinic = $2';
      params.push(clinic.trim());
    }
    if (clinic.trim() === '-' && object.trim() !== '-') {
      sql += ' AND v.object = $2';
      params.push(object.trim());
    }
    sql += ' ORDER BY v.date DESC';
  const res = await pool.query(sql, params);
  return res.rows.map(mapVetVoucherRow);
}

async function getVetVoucherById(id) {
  const res = await pool.query(`
    SELECT v.id, v.date, v.user_name, v.clinic, v.object, v.processed_on, c.slug, c.name
    FROM vet_vouchers v
    LEFT JOIN LATERAL (
      SELECT slug, name
      FROM cats
      WHERE cat_id = v.id
      LIMIT 1
    ) c ON true
    WHERE v.id = $1
  `, [id]);
  if (res.rows.length === 0) return null;
  return mapVetVoucherRow(res.rows[0]);
}

async function createVetVoucher(payload) {
  const {
    date,
    user_name,
    cat_id,
    clinic,
    object,
  } = payload || {};

  if (!date) throw new Error('La date est requise');
  if (!user_name) throw new Error("Le nom de l'utilisateur initiateur de la demande est requis");
  if (!cat_id) throw new Error('Le chat est requis');
  if (!clinic) throw new Error('La clinique est requiss');
  if (!object) throw new Error("L'object est requis");

  const res = await pool.query(
    `INSERT INTO vet_vouchers(date, user_name, cat_id, clinic, object) 
     VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [date, user_name, cat_id, clinic, object]
  );
  const lastId = res.rows[0].id;

  return await getVetVoucherById(lastId);
}

async function updateVetVoucher(id, changes) {
  const allowed = ['processed_on'];
  const fields = [];
  const params = [];

  for (const key of allowed) {
    if (key in (changes || {})) {
      fields.push(`${key} = $${allowed.indexOf(key) + 1}`);
      params.push(changes[key]);
    }
  }

  if (fields.length === 0) {
    const err = new Error('Aucun champ à mettre à jour');
    err.status = 400;
    throw err;
  }
  params.push(id);
  const res = await pool.query(`UPDATE vet_vouchers SET ${fields.join(', ')} WHERE id = $${fields.length + 1}`, params);
  if (res.rowCount === 0) {
    const err = new Error('Bon vétérinaire introuvable');
    err.status = 404;
    throw err;
  }
  return await getVetVoucherById(id);
}

async function deleteVetVoucher(id) {
  const res = await pool.query('DELETE FROM vet_vouchers WHERE id = $1', [id]);
  if (res.rowCount === 0) {
    const err = new Error('Bon vétérinaire introuvable');
    err.status = 404;
    throw err;
  }
}

module.exports = {
  listVetVoucher,
  getVetVoucherById,
  createVetVoucher,
  updateVetVoucher,
  deleteVetVoucher
};
