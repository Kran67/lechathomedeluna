async function listUsers(db) {
  return await db.allAsync('SELECT id, name, lastName FROM users ORDER BY id DESC');
}

async function getUser(db, id) {
  return await db.getAsync('SELECT * FROM users WHERE id = ?', [id]);
}

async function createUser(db, { email, name, role = 'client' }) {
  if (!email) {
    const err = new Error('Email est requis');
    err.status = 400;
    throw err;
  }
  if (!['Admin', 'Assistant', 'FamilyHostReference'].includes(role)) {
    const err = new Error('Rôle invalide');
    err.status = 400;
    throw err;
  }
  try {
    const r = await db.runAsync('INSERT INTO users(email, name, role) VALUES (?,?,?)', [email, name, role]);
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
