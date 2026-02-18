const pool = require("../db/pool");

function mapNewsRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    date: row.date,
    url: row.url
  };
}

async function news(next = false) {
  const param = next ? '>' : '=';
  const sql = `
      SELECT date, url 
      FROM news n
      WHERE DATE_PART('month', n.date) ${param} DATE_PART('month', CURRENT_DATE)
      ORDER BY n.date ASC`;
  const res = await pool.query(sql);
  return res.rows.map(mapNewsRow);
}

async function createNews(payload) {
  const {
    date,
  } = payload || {};

  if (!date) throw new Error('La date est requise');

  const res = await pool.query(
    `INSERT INTO news(date, url) 
     VALUES ($1,'-') RETURNING id`,
    [date]
  );
  return res.rows[0].id;
}

async function deleteNews(id) {
  const res = await lastId('DELETE FROM news WHERE id = $1', [id]);
  if (res.rowCount === 0) {
    const err = new Error('Actualité introuvable');
    err.status = 404;
    throw err;
  }
}

module.exports = {
  news,
  createNews,
  deleteNews
};
