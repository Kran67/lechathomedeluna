const {
    getAllThreadsByUserId,
    getUnreadMessageCountByUserId,
    getAllMessagesById,
    createMessaging,
    deleteMessaging,
    createMessage,
    deleteMessage,
    readAllMessages,
    addMembersToThread,
    removeMembersToThread,
    renameMessagingThread,
    leaveMessagingThread,
    setNewAdmin
} = require('../services/messagingService');
const { statusFromError } = require('../utils/lib');

async function getByUserId(req, res) {
  try {
    const rows = await getAllThreadsByUserId(req.params.userid);
    res.json(rows);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function getAllMessagesByThreadId(req, res) {
  try {
    readAllMessages(req.params.id, req.params.userid).then(async ()  => {
      const rows = await getAllMessagesById(req.params.id, req.params.userid);
      res.json(rows);
    });
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function create(req, res) {
  try {
    await createMessaging(req.body || {});
    res.status(201).end();
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
    await createMessage(req.body || {});
    res.status(201).end();
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

async function addMembers(req, res) {
  try {
    await addMembersToThread(req.body || {});
    res.status(201).end();
  } catch (e) {
    const code = statusFromError(e);
    // Map message for validation consistency
    let msg = e.message;
    res.status(code).json({ error: msg });
  }
}

async function removeMembers(req, res) {
  try {
    await removeMembersToThread(req.body || {});
    res.status(201).end();
  } catch (e) {
    const code = statusFromError(e);
    // Map message for validation consistency
    let msg = e.message;
    res.status(code).json({ error: msg });
  }
}

async function renameThread(req, res) {
  try {
    await renameMessagingThread(req.body || {});
    res.status(200).end();
  } catch (e) {
    const code = statusFromError(e);
    // Map message for validation consistency
    let msg = e.message;
    res.status(code).json({ error: msg });
  }
}

async function leaveThread(req, res) {
  try {
    await leaveMessagingThread(req.body || {});
    await setNewAdmin(req.body.threadId);
    res.status(200).end();
  } catch (e) {
    const code = statusFromError(e);
    // Map message for validation consistency
    let msg = e.message;
    res.status(code).json({ error: msg });
  }
}

module.exports = {
  getByUserId,
  create,
  remove,
  createMsg,
  removeMsg,
  getAllMessagesByThreadId,
  addMembers,
  removeMembers,
  renameThread,
  leaveThread
};
