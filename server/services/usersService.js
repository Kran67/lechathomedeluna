const pool = require("../db/pool");

async function listUsers() {
  return await pool.query(`SELECT u.*, pc.code as postalCode, pc.city, pc.id as cityId
    FROM users u
    LEFT JOIN postal_codes pc ON pc.id = u.cityId
    WHERE u.id > 1 AND u.blacklisted = false
    ORDER BY u.lastname, u.name DESC`);
}

async function getUser(id) {
  return await pool.query(`SELECT u.*, pc.code as postalCode, pc.city, pc.id as cityId
    FROM users u
    LEFT JOIN postal_codes pc ON pc.id = u.cityId
    WHERE u.id = $1`, [id]);
}

async function getUserByEmail(email) {
  return await pool.query(`SELECT u.*, pc.code as postalCode, pc.city, pc.id as cityId
    FROM users u
    LEFT JOIN postal_codes pc ON pc.id = u.cityId
    WHERE u.email = $1`, [email]);
}

async function createUser({ email, name, lastName, social_number, phone, address, cityId, roles, blacklisted, referrer_id, capacity, birthDate }) {
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
  const userRoles = roles.split("|");
  if (!userRoles.some(role => ['Assistant', 'HostFamily', 'Volunteer'].includes(role))) {
    const err = new Error('Rôles invalides');
    err.status = 400;
    throw err;
  }
  try {
    const r = await pool.query('INSERT INTO users(email, name, lastName, social_number, roles, phone, address, cityId, blacklisted, referrer_id, capacity, birthdate) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id',
      [email, name, lastName, social_number , roles, phone, address, cityId, blacklisted, referrer_id, capacity, birthDate]);
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
  const allowedFields = ['name', 'lastName', 'social_number', 'phone', 'address', 'cityId', 'roles', 'blacklisted', 'referrer_id', 'capacity', 'birthDate'];
  const fields = [];
  const params = [];
  for (const key of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(changes || {}, key)) {
      if (key === 'roles') {
        const roles = changes.roles.split("|");
        if (!roles.some(role => ['Admin', 'Assistant', 'HostFamily', 'Volunteer'].includes(role))) {
          const err = new Error('Rôles invalides');
          err.status = 400;
          throw err;
        }
      }
      fields.push(`${key} = $${allowedFields.indexOf(key) + 1}`);
      if (["birthDate"].includes(key) && changes[key] === "") {
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
  await pool.query(`UPDATE users SET reset_token = $2, reset_expires = NOW() + INTERVAL '1 hours' WHERE id = $1`, [id, token]);
}

async function changePassword(id, newPassword) {
  const crypto = require('crypto');
  const hash = crypto.scryptSync(newPassword, 'salt', 64).toString('hex');
  await pool.query(`UPDATE users SET password_hash = $2, reset_token = NULL, reset_expires = NULL WHERE id = $1`, [id, `scrypt:salt:${hash}`]);
}

async function getByReferentId(id) {
  return await pool.query(`SELECT u.id
    FROM users u
    WHERE u.referrer_id = $1`, [id]);
}

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  resetMyPassword,
  getUserByEmail,
  changePassword,
  getByReferentId
};
