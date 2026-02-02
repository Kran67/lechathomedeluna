const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const pool = require("../db/pool");

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function mapUserRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    lastName: row.lastname ?? "",
    phone: row.phone ?? "",
    address: row.address ?? "",
    city: row.city ?? "",
    role: row.role,
    email: row.email,
    blacklisted: row.blacklisted ?? false,
    referrer_id: row.referrer_id ?? null,
  };
}

function hashPassword(password, salt = null) {
  if (!salt) salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || typeof stored !== 'string') return false;
  const parts = stored.split(':');
  if (parts[0] !== 'scrypt' || parts.length !== 3) return false;
  const salt = parts[1];
  const expected = parts[2];
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expected, 'hex'));
}

function signToken(user) {
  const payload = { id: user.id, role: user.role, name: user.name, email: user.email || null };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

async function register({ name, email, password, role = 'HostFamily' }) {
  if (!name) {
    const err = new Error('Nom est requis'); err.status = 400; throw err;
  }
  if (!email) {
    const err = new Error('Email est requis'); err.status = 400; throw err;
  }
  if (!password || String(password).length < 8) {
    const err = new Error('Le mot de passe doit comporter au moins 8 caractères.'); err.status = 400; throw err;
  }
  if (!['HostFamily'].includes(role)) role = 'HostFamily';
  const password_hash = hashPassword(String(password));
  try {
    const r = await pool.query('INSERT INTO users(name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id', [name, email, password_hash, role]);
    const lastId = r.rows[0].id;
    const res = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [lastId]);
    const user = mapUserRow(res.rows[0]);
    const token = signToken(user);
    return { token, user };
  } catch (e) {
    if (/UNIQUE/i.test(e.message)) { const err = new Error('Email déjà inscrit'); err.status = 409; throw err; }
    throw e;
  }
}

async function login({ email, password }) {
  if (!email || !password) { const err = new Error('Un email et un mot de passe sont requis.'); err.status = 400; throw err; }
  const res = await pool.query('SELECT id, name, lastName, email, role, password_hash FROM users WHERE email = $1', [email]);
  if (res.rowCount === 0 || !res.rows[0].password_hash || !verifyPassword(String(password), res.rows[0].password_hash)) {
    const err = new Error("informations d'identification invalides"); err.status = 401; throw err;
  }
  const { password_hash, ...publicUser } = res.rows[0];
  const token = signToken(publicUser);
  return { token, user: publicUser };
}

async function requestPasswordReset({ email }) {
  if (!email) { const err = new Error('email est requis'); err.status = 400; throw err; }
  const res = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);
  const user = mapUserRow(res.rows[0]);
  // Always respond with success to avoid user enumeration
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 60 * 60 * 1000; // 1 hour
  if (user) {
    await pool.query('UPDATE users SET reset_token = $1, reset_expires = $2 WHERE id = $3', [token, expires, user.id]);
  }
  const resp = { ok: true, message: "Si l'email existe, un lien de réinitialisation a été envoyé." };
  if (process.env.NODE_ENV !== 'production') resp.token = token;
  return resp;
}

async function resetPassword({ token, password }) {
  if (!token || !password) { const err = new Error('Un jeton et un mot de passe sont requis.'); err.status = 400; throw err; }
  if (String(password).length < 8) { const err = new Error('Le mot de passe doit comporter au moins 8 caractères.'); err.status = 400; throw err; }
  const now = Date.now();
  const res = await pool.query('SELECT id FROM users WHERE reset_token = $1 AND IFNULL(reset_expires, 0) > $2', [token, now]);
  const user = mapUserRow(res.rows[0]);
  if (!user) { const err = new Error('Jeton invalide ou expiré'); err.status = 400; throw err; }
  const password_hash = hashPassword(String(password));
  await pool.query('UPDATE users SET password_hash = $1, reset_token = NULL, reset_expires = NULL WHERE id = $2', [password_hash, user.id]);
  return { ok: true };
}

module.exports = {
  register,
  login,
  requestPasswordReset,
  resetPassword,
  hashPassword,
  verifyPassword,
  signToken,
  mapUserRow
};
