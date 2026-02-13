const {
    getMessengingByUserId,
    getUnreadMessageCountBuUserId,
    getAllMessagesById,
    getById,
    getByUserIds,
    createMessenging,
    deleteMessenging,
    createMessage,
    deleteMessage,
    readAllMessages
} = require('../services/messengingService');

function statusFromError(e) {
  if (e && e.status) return e.status;
  return 500;
}

async function getByUserId(req, res) {
  try {
    const rows = await getMessengingByUserId(req.params.userid);
    res.json(rows);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function create(req, res) {
  try {
    const created = await createMessenging(req.body || {});
    res.status(201).json(created);
  } catch (e) {
    const code = statusFromError(e);
    // Map message for validation consistency
    let msg = e.message;
    res.status(code).json({ error: msg });
  }
}

async function remove(req, res) {
  try {
    await deleteMessenging(req.params.id);
    res.status(204).end();
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function createMsg(req, res) {
  try {
    const created = await createMessage(req.body || {});
    res.status(201).json(created);
  } catch (e) {
    const code = statusFromError(e);
    // Map message for validation consistency
    let msg = e.message;
    res.status(code).json({ error: msg });
  }
}

async function removeMsg(req, res) {
  try {
    await deleteMessage(req.params.id);
    res.status(204).end();
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

module.exports = {
  getByUserId,
  create,
  remove,
  createMsg,
  removeMsg,
};
