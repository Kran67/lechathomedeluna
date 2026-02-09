const pool = require("../db/pool");

async function listUsers() {
  return await pool.query('SELECT * FROM users ORDER BY id DESC');
}

async function getUser(id) {
  return await pool.query('SELECT * FROM users WHERE id = $1', [id]);
}

async function createUser({ email, name, lastName, phone, address, city, role, blacklisted, referrer_id }) {
  if (!email) {
    const err = new Error("L'email est requis");
    err.status = 400;
    throw err;
  }
  if (!name) {
    const err = new Error('Le Nom est requis');
    err.status = 400;
    throw err;
  }
  if (!lastName) {
    const err = new Error('Le prénom est requis');
    err.status = 400;
    throw err;
  }
  if (!['Assistant', 'HostFamily', 'Volunteer'].includes(role)) {
    const err = new Error('Rôle invalide');
    err.status = 400;
    throw err;
  }
  try {
    const r = await pool.query('INSERT INTO users(email, name, lastName, role, phone, address, city, blacklisted, referrer_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id', [email, name, lastName, role, phone, address, city, blacklisted, referrer_id]);
    return await getUser(r.rows[0].id);
  } catch (e) {
    if (/UNIQUE/i.test(e.message)) {
      const err = new Error("L'utilisateur existe déjà");
      err.status = 409;
      throw err;
    }
    throw e;
  }
}

async function updateUser(id, changes = {}) {
  const allowedFields = ['name', 'lastName', 'phone', 'address', 'city', 'role', 'blacklisted', 'referrer_id'];
  const fields = [];
  const params = [];
  for (const key of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(changes || {}, key)) {
      if (key === 'role') {
        const role = changes.role;
        if (!['Admin', 'Assistant', 'HostFamily', 'Volunteer'].includes(role)) {
          const err = new Error('Rôle invalide');
          err.status = 400;
          throw err;
        }
      }
      fields.push(`${key} = $${allowedFields.indexOf(key) + 1}`);
      params.push(changes[key]);
    }
  }
  if (fields.length === 0) {
    const err = new Error('Aucun champ à mettre à jour');
    err.status = 400;
    throw err;
  }
  params.push(id);
  const res = await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${fields.length + 1}`, params);
  if (res.rowCount === 0) {
    const err = new Error('Utilisateur introuvable');
    err.status = 404;
    throw err;
  }
  return await getUser(id);
}

async function resetMyPassword(id, token) {
  await pool.query(`UPDATE users SET reset_token = $2 WHERE id = $1`, [id, token]);
}

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  resetMyPassword
};
