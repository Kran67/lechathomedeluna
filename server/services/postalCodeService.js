const pool = require('../db/pool');

async function searchPostalCodes(search) {
  const term = `${search}%`;
  const res = await pool.query(
    `SELECT DISTINCT code, department
     FROM postal_codes
     WHERE code LIKE $1
     ORDER BY code
     LIMIT 50`,
    [term]
  );
  return res.rows;
}

async function getCitiesByCode(code) {
  const res = await pool.query(
    `SELECT id, code, city, department
     FROM postal_codes
     WHERE code = $1
     ORDER BY city`,
    [code]
  );
  return res.rows;
}

module.exports = { searchPostalCodes, getCitiesByCode };