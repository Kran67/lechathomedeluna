async function listUsers(db) {
  return await db.allAsync('SELECT * FROM users ORDER BY id DESC');
}

async function getUser(db, id) {
  return await db.getAsync('SELECT * FROM users WHERE id = ?', [id]);
}

async function createUser(db, { email, name, lastName, phone, address, city, role, blacklisted, referrer_id }) {
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
    const r = await db.runAsync('INSERT INTO users(email, name, lastName, role, phone, address, city, blacklisted, referrer_id) VALUES (?,?,?,?,?,?,?,?,?)', [email, name, lastName, role, phone, address, city, blacklisted, referrer_id]);
    return await getUser(db, r.lastID);
  } catch (e) {
    if (/UNIQUE/i.test(e.message)) {
      const err = new Error("L'utilisateur existe déjà");
      err.status = 409;
      throw err;
    }
    throw e;
  }
}

async function updateUser(db, id, changes = {}) {
  const allowedFields = ['name', 'lastName', 'phone', 'address', 'city', 'role', 'password_hash', 'blacklisted', 'referrer_id'];
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
      fields.push(`${key} = ?`);
      params.push(changes[key]);
    }
  }
  if (fields.length === 0) {
    const err = new Error('Aucun champ à mettre à jour');
    err.status = 400;
    throw err;
  }
  params.push(id);
  const r = await db.runAsync(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
  if (r.changes === 0) {
    const err = new Error('Utilisateur introuvable');
    err.status = 404;
    throw err;
  }
  return await getUser(db, id);
}

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
};
