const {
  listCats,
  getCatDetails,
  createCat,
  updateCat,
  deleteCat,
} = require('../services/catsService');
const { statusFromError } = require('../utils/lib');

async function list(req, res) {
  try {
    const rows = await listCats();
    res.json(rows);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function listAdoptable(req, res) {
  try {
    const rows = await listCats(true);
    res.json(rows);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function listAdopted(req, res) {
  try {
    const rows = await listCats(false, req.params.year);
    res.json(rows);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function listMine(req, res) {
  try {
    const rows = await listCats(false, null, req.params.id);
    res.json(rows);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function getById(req, res) {
  try {
    const prop = await getCatDetails(req.params.id);
    if (!prop) return res.status(404).json({ error: 'Chat introuvable' });
    res.json(prop);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function create(req, res) {
  try {
    const created = await createCat(req.body || {});
    res.status(201).json(created);
  } catch (e) {
    const code = statusFromError(e);
    // Map message for validation consistency
    let msg = e.message;
    if (code === 409) msg = 'Un chat avec le même identifiant existe déjà.';
    if (msg === 'Nom est requis') return res.status(400).json({ error: msg });
    if (msg === 'Description est requis') return res.status(400).json({ error: msg });
    if (msg === 'Sexe est requis') return res.status(400).json({ error: msg });
    if (msg.startsWith('hostfamily_id')) return res.status(400).json({ error: msg });
    res.status(code).json({ error: msg });
  }
}

async function update(req, res) {
  try {
    const updated = await updateCat(req.params.slug, req.body || {});
    res.json(updated);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function remove(req, res) {
  try {
    await deleteCat(req.params.id);
    res.status(204).end();
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

module.exports = {
  list,
  listAdoptable,
  listAdopted,
  listMine,
  getById,
  create,
  update,
  remove,
};
