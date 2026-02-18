const {
  listVetVoucher,
  getVetVoucherById,
  createVetVoucher,
  updateVetVoucher,
  deleteVetVoucher,
} = require('../services/vetVouchersService');
const { statusFromError } = require('../utils/lib');

async function list(req, res) {
  try {
    const rows = await listVetVoucher();
    res.json(rows);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}


async function listByParams(req, res) {
  try {
    const rows = await listVetVoucher(req.params.year, req.params.clinic, req.params.object);
    res.json(rows);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function getById(req, res) {
  try {
    const prop = await getVetVoucherById(req.params.id);
    if (!prop) return res.status(404).json({ error: 'Bon vétérinaire introuvable' });
    res.json(prop);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function create(req, res) {
  try {
    const created = await createVetVoucher(req.body || {});
    res.status(201).json(created);
  } catch (e) {
    const code = statusFromError(e);
    // Map message for validation consistency
    let msg = e.message;
    if (code === 409) msg = 'Un bon vétérinaire avec le même identifiant existe déjà.';
    res.status(code).json({ error: msg });
  }
}

async function update(req, res) {
  try {
    const updated = await updateVetVoucher(req.params.id, req.body || {});
    res.json(updated);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function remove(req, res) {
  try {
    await deleteVetVoucher(req.params.id);
    res.status(204).end();
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

module.exports = {
  list,
  listByParams,
  getById,
  create,
  update,
  remove,
};
