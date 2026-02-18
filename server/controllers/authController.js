const { register, login, requestPasswordReset, resetPassword } = require('../services/authService');
const { statusFromError } = require('../utils/lib');

async function doRegister(req, res) {
  try {
    const result = await register(req.body || {});
    res.status(201).json(result);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function doLogin(req, res) {
  try {
    const result = await login(req.body || {});
    res.status(200).json(result);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function doRequestReset(req, res) {
  try {
    const result = await requestPasswordReset(req.body || {});
    res.status(200).json(result);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function doResetPassword(req, res) {
  try {
    const result = await resetPassword(req.body || {});
    res.status(200).json(result);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

module.exports = { doRegister, doLogin, doRequestReset, doResetPassword };
