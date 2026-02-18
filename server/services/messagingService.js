const pool = require("../db/pool");

function mapMessagingRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    user_id: row.user_id,
    nickname: row.nickname,
    content: { id: row.message_id, content: decodeURIComponent(row.content) },
    sent_at: row.sent_at,
    is_readed: row.is_readed
  };
}

function mapMessageRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    thread_id: row.thread_id,
    user_id: row.user_id,
    nickname: row.nickname,
    content: decodeURIComponent(row.content),
    sent_at: row.sent_at,
    is_readed: row.is_readed
  };
}

async function getMessagingByUserId(userid) {
  const res = await pool.query(`
    SELECT 
        u.id AS user_id,
        CONCAT(u.name, ' ', u.lastname) as nickname,
        mt.id,
        m.id AS message_id,
        m.content,
        m.sent_at,
        m.is_readed
    FROM message_threads mt
    JOIN users u 
        ON u.id = CASE 
            WHEN mt.user_id = $1 
            THEN mt.from_user_id 
            ELSE mt.user_id
        END
    LEFT JOIN LATERAL (
        SELECT * 
        FROM messages m 
        WHERE m.thread_id = mt.id AND m.user_id <> $1
        ORDER BY m.sent_at DESC
        LIMIT 1
    ) m ON TRUE
    WHERE mt.user_id = $1 OR mt.from_user_id = $1
    ORDER BY mt.created_at DESC, m.sent_at DESC
  `, [userid]);
  if (res.rows.length === 0) return null;
  return res.rows.map(mapMessagingRow);
}

async function getUnreadMessageCountByUserId(userid) {
  const res = await pool.query(`
    SELECT count(m.id) as count
    FROM messages m
    JOIN message_threads mt ON m.thread_id = mt.id
    WHERE m.is_readed = 0
        AND (
            (mt.user_id = $1 AND m.user_id <> $1)
            OR
            (mt.from_user_id = $1 AND m.user_id <> $1)
        )
  `, [userid]);
  if (res.rows.length === 0) return null;
  return res.rows[0];
}

async function getAllMessagesById(id) {
  const res = await pool.query(`
    SELECT m.content, m.sent_at, m.user_id, CONCAT(u.name, ' ', u.lastname) as nickname, m.is_readed
    FROM messages m
    JOIN users u ON u.id = m.user_id
    WHERE thread_id = $1
    ORDER BY sent_at
  `, [id]);
  if (res.rows.length === 0) return null;
  return res.rows.map(mapMessageRow);
}

async function getById(id) {
  const res = await pool.query(`
    SELECT mt.id, u.id as from_user_id, CONCAT(u.name, ' ', u.lastname) as nickname, u2.id as to_user_id, CONCAT(u2.name, ' ', u2.lastname) as to_nickname
    FROM message_threads mt
    JOIN users u ON u.id = mt.from_user_id
    JOIN users u2 ON u2.id = mt.user_id
    WHERE mt.id = $1
  `, [id]);
  if (res.rows.length === 0) return null;
  return mapMessagingRow(res.rows);
}

async function getByUserIds(fromUserId, toUserId) {
  const res = await pool.query(`
    SELECT *
    FROM message_threads
    WHERE user_id = $1 AND from_user_id = $2 OR user_id = $2 AND from_user_id = $1
  `, [toUserId, fromUserId]);
  if (res.rows.length === 0) return null;
  return mapMessagingRow(res.rows);
}

async function createMessaging(payload) {
    const {
        toUserId,
        fromUserId
    } = payload || {};

    if (!toUserId) throw new Error('toUserId est requis');
    if (!fromUserId) throw new Error("fromUserId est requis");

    // on va voir s'il y a déjà une discussion entre l'utilisateur actuel et l'utilisateur cible
    const exist = await getByUserIds(fromUserId, toUserId);

    if (exist.rows.length === 0) {
        const res = await pool.query(
            `INSERT INTO message_threads(user_id, from_user_id, created_at) 
            VALUES ($1,$2,$3) RETURNING id`,
            [toUserId, fromUserId, new Date()]
        );
        return await getById(res.rows[0].id);
    } else {
        return exist;
    }
}

async function deleteMessaging(id) {
  const res = await lastId('DELETE FROM message_threads WHERE id = $1', [id]);
  if (res.rowCount === 0) {
    const err = new Error('Discussion introuvable');
    err.status = 404;
    throw err;
  }
}

async function createMessage(payload) {
  const {
    threadId,
    userId,
    content
  } = payload || {};

  if (!threadId) throw new Error('threadId est requis');
  if (!userId) throw new Error("userId est requis");

  const res = await pool.query(
    `INSERT INTO messages(thread_id, user_id, content, sent_at) 
     VALUES ($1,$2,$3,$4) RETURNING id`,
    [threadId, userId, encodeURIComponent(content), new Date()]
  );

  return getById(threadId);
}

async function deleteMessage(id) {
  const res = await lastId('DELETE FROM messages WHERE id = $1', [id]);
  if (res.rowCount === 0) {
    const err = new Error('Message introuvable');
    err.status = 404;
    throw err;
  }
}

async function readAllMessages(threadId, userId) {
  const res = await pool.query(`UPDATE messages SET is_readed = 1 WHERE thread_id = $1 AND user_id <> $2 `, [threadId, userId]);
  if (res.rowCount === 0) {
    const err = new Error('Discussion introuvable');
    err.status = 404;
    throw err;
  }
}

module.exports = {
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
};
