const path = require('path');
const fs = require('fs');

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
const multer = require('multer');
const MESSAGING_UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads', 'messaging');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(MESSAGING_UPLOAD_DIR, { recursive: true });
    cb(null, MESSAGING_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(16).slice(2, 10)}${ext}`);
  }
});

const ALLOWED_MIME = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain'
];

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo max
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Type de fichier non autorisé'));
  }
}).array('files', 5); // jusqu'à 5 fichiers par message

async function uploadMessageAttachment(req, res) {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: 'Aucun fichier reçu' });

    const results = req.files.map(f => ({
      filename: f.filename,
      original_name: f.originalname,
      mime_type: f.mimetype,
      size: f.size,
      url: `/uploads/messaging/${f.filename}`
    }));

    res.status(201).json({ attachments: results });
  });
}

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
    if (req.body.isLastMember) {
      await deleteMessaging(req.body.threadId);
    } else {
      await setNewAdmin(req.body.threadId);
    }
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
  leaveThread,
  uploadMessageAttachment
};
