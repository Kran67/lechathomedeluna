const {
  news,
  createNews,
  updateNews,
  deleteNews,
} = require('../services/newsService');
const { statusFromError } = require('../utils/lib');

async function getNews(req, res) {
  try {
    const rows = await news(req.params.period === 'next');
    res.json(rows);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}


async function create(req, res) {
  try {
    const created = await createNews(req.body || {});
    res.status(201).json(created);
  } catch (e) {
    const code = statusFromError(e);
    // Map message for validation consistency
    let msg = e.message;
    if (code === 409) msg = 'Une actualité avec le même identifiant existe déjà.';
    res.status(code).json({ error: msg });
  }
}

async function update(req, res) {
  try {
    const updated = await updateNews(req.params.id, req.body || {});
    res.json(updated);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function remove(req, res) {
  try {
    await deleteNews(req.params.id);
    res.status(204).end();
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

module.exports = {
  getNews,
  create,
  update,
  remove,
};
