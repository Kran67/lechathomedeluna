const { listUsers, getUser, createUser, updateUser, resetMyPassword, getUserByEmail, changePassword } = require('../services/usersService');
const { mapUserRow } = require('../services/authService');
const { statusFromError } = require('../utils/lib');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-prod';
const JWT_EXPIRES_IN = '1h';

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

async function getByEmail(req, res) {
  try {
    const result = await getUser(req.params.email);
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

async function resetPassword(req, res) {
  //requireAuth(req, res, async () => {
    try {
      const result = await getUserByEmail(req.params.email);
      if (result.rowCount > 0) {
        const user = mapUserRow(result.rows[0]);
        const payload = { id: user.id, name: user.name, email: user.email || null };
        const resetToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        await resetMyPassword(user.id, resetToken);
        return res.status(200).json({ token: resetToken });
      } else {
        return res.status(404).json({ error: 'User not found' });
      }
    } catch (e) {
      return res.status(statusFromError(e)).json({ error: e.message });
    }
  //})
}

async function checkResetTokenValidity(req, res) {
  try {
    const token = req.params.token;
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await getUser(decoded.id);
    if (result.rowCount === 0) {
      return res.status(404).json({ valid: false });
    }
    const user = mapUserRow(result.rows[0]);
    if (user.reset_token !== token) {
      return res.status(400).json({ valid: false });
    }
    if (new Date(user.reset_expires) < new Date()) {
      return res.status(400).json({ valid: false });
    }
    res.json({ valid: true });
  } catch (e) {
    res.status(statusFromError(e)).json({ valid: false, error: e.message });
  }
}

async function updatePassword(req, res) {
  try {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await getUserByEmail(decoded.email);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = mapUserRow(result.rows[0]);
    if (user.reset_token !== token) {
      return res.status(400).json({ error: 'Invalid token' });
    }
    if (new Date(user.reset_expires) < new Date()) {
      return res.status(400).json({ error: 'Token expired' });
    }
    await changePassword(user.id, newPassword);
    res.json({ success: true });
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  resetPassword,
  getByEmail,
  checkResetTokenValidity,
  updatePassword
};
