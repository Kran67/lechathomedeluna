const {
    getMessagingByUserId,
    getUnreadMessageCountByUserId,
    getAllMessagesById,
    getById,
    getByUserIds,
    createMessaging,
    deleteMessaging,
    createMessage,
    deleteMessage,
    readAllMessages
} = require('../services/messagingService');
const { statusFromError } = require('../utils/lib');

async function getByUserId(req, res) {
  try {
    const rows = await getMessagingByUserId(req.params.userid);
    res.json(rows);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function getAllMessagesByThreadId(req, res) {
  try {
    readAllMessages(req.params.id, req.params.userid).then(async ()  => {
      const rows = await getAllMessagesById(req.params.id);
      res.json(rows);
    });
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function create(req, res) {
  try {
    const created = await createMessaging(req.body || {});
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
    await deleteMessaging(req.params.id);
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
  getAllMessagesByThreadId
};
