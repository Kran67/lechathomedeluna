const { listUsers, getUser, createUser, updateUser } = require('../services/usersService');
const { mapUserRow } = require('../services/authService');

function statusFromError(e) {
  if (e && e.status) return e.status;
  if (e && e.message && /UNIQUE/i.test(e.message)) return 409;
  return 500;
}

async function list(req, res) {
  try {
    const result = await listUsers();
    const users = [];
    result.rows.map((row) => users.push(mapUserRow(row)));
    res.json(users);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function getById(req, res) {
  try {
    const result = await getUser(req.params.id);
    if (!result) return res.status(404).json({ error: 'User not found' });
    res.json(mapUserRow(result.rows[0]));
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function create(req, res) {
  try {
    const result = await createUser(req.body || {});
    res.status(201).json(result.rows[0]);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function update(req, res) {
  try {
    const allowAdminRole = req.user && req.user.role === 'Admin';
    const updated = await updateUser(req.params.id, req.body || {}, { allowAdminRole });
    res.json(updated.rows[0]);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
};
