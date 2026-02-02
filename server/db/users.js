const pool = require("./pool");

async function getUsers() {
  const { rows } = await pool.query(
    "SELECT id, username, email, created_at FROM users ORDER BY id"
  );
  return rows;
}

module.exports = { getUsers };
