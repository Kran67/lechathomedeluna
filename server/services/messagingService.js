const pool = require("../db/pool");

function mapMessagingRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    user_id: row.user_id,
    nickname: row.nickname,
    type: row.type,
    content: { id: row.message_id, content: row.content ? decodeURIComponent(row.content): "Pas de message" },
    sent_at: row.sent_at,
    is_readed: row.is_readed,
    members: row.members ? row.members : null
  };
}

function mapMessageRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    thread_id: row.thread_id,
    user_id: row.user_id,
    nickname: row.nickname,
    content: row.content ? decodeURIComponent(row.content) : "",
    sent_at: row.sent_at,
    is_readed: row.is_readed
  };
}

async function getAllThreadsByUserId(userid) {
  const res = await pool.query(`
    SELECT 
        mt.id,
        mt.type,
        mt.name AS thread_name,
        u_admin.id as user_id,

        -- participants (group uniquement)
        CASE 
            WHEN mt.type = 'group' THEN members.members_json
            ELSE NULL
        END AS members,

        -- nickname : autre participant si private
        CASE 
            WHEN mt.type = 'private' THEN CONCAT(u_other.name, ' ', u_other.lastname)
            ELSE mt.name
        END AS nickname,

        -- dernier message
        m.id AS message_id,
        m.content,
        m.sent_at,

        -- statut lecture du dernier message
        CASE 
            WHEN m.sender_id = $1 THEN true
            WHEN mr_last.message_id IS NOT NULL THEN true
            ELSE false
        END AS is_readed,

        mr_last.read_at,

        COALESCE(unread.unread_count, 0) AS unread_count

    FROM message_threads mt

    -- l'utilisateur appartient au thread
    JOIN thread_participants tp 
        ON tp.thread_id = mt.id
        AND tp.user_id = $1

    -- récupérer l'autre participant (seulement utile pour private)
    LEFT JOIN thread_participants tp_other
        ON tp_other.thread_id = mt.id
        AND tp_other.user_id <> $1
        AND mt.type = 'private'
    LEFT JOIN users u_other
        ON u_other.id = tp_other.user_id

    LEFT JOIN thread_participants tp_admin
		ON tp_admin.thread_id = mt.id
        AND tp_admin.role = 'admin'

    LEFT JOIN users u_admin
        ON u_admin.id = tp_admin.user_id	

    -- membres du groupe (json_agg)
    LEFT JOIN LATERAL (
        SELECT json_agg(
            json_build_object(
                'id', u.id,
                'name', CONCAT(u.name, ' ', u.lastname)
            )
        ) AS members_json
        FROM thread_participants tp2
        JOIN users u ON u.id = tp2.user_id
        WHERE tp2.thread_id = mt.id
    ) members ON mt.type = 'group'
 
    -- dernier message
    LEFT JOIN LATERAL (
        SELECT *
        FROM messages
        WHERE thread_id = mt.id
        ORDER BY sent_at DESC
        LIMIT 1
    ) m ON true

    -- lecture du dernier message
    LEFT JOIN message_reads mr_last
        ON mr_last.message_id = m.id
        AND mr_last.user_id = $1

    -- compteur non lus
    LEFT JOIN (
        SELECT 
            msg.thread_id,
            COUNT(*) AS unread_count
        FROM messages msg
        LEFT JOIN message_reads mr 
            ON mr.message_id = msg.id
            AND mr.user_id = $1
        WHERE 
            msg.sender_id <> $1
            AND mr.message_id IS NULL
        GROUP BY msg.thread_id
    ) unread 
        ON unread.thread_id = mt.id

    ORDER BY mt.created_at DESC, m.sent_at DESC NULLS LAST;
  `, [userid]);
  if (res.rows.length === 0) return null;
  return res.rows.map(mapMessagingRow);
}

async function getUnreadMessageCountByUserId(userid) {
  const res = await pool.query(`
    SELECT 
        msg.thread_id,
        COUNT(*) AS unread_count
    FROM messages msg
    LEFT JOIN message_reads mr 
        ON mr.message_id = msg.id
        AND mr.user_id = $1
    WHERE 
        msg.sender_id <> $1
        AND mr.message_id IS NULL
    GROUP BY msg.thread_id
  `, [userid]);
  if (res.rows.length === 0) return null;
  return res.rows[0];
}

async function getAllMessagesById(id, userId) {
  const res = await pool.query(`
    SELECT *
    FROM (
        SELECT 
            m.id,
            m.thread_id,
            m.content,
            m.sent_at,

            u.id AS user_id,
            CONCAT(u.name, ' ', u.lastname) AS nickname,

            CASE 
                WHEN m.sender_id = $2 THEN true
                WHEN mr.message_id IS NOT NULL THEN true
                ELSE false
            END AS is_read,

            mr.read_at,
            COALESCE(
              json_agg(
                json_build_object(
                  'id', ma.id,
                  'url', ma.url,
                  'original_name', ma.original_name,
                  'mime_type', ma.mime_type,
                  'size', ma.size
                )
              ) FILTER (WHERE ma.id IS NOT NULL),
              '[]'
            ) AS attachments

        FROM messages m

        -- Sécurité : vérifier que l'utilisateur appartient au thread
        JOIN thread_participants tp ON tp.thread_id = m.thread_id AND tp.user_id = $2

        JOIN users u ON u.id = m.sender_id

        LEFT JOIN message_reads mr ON mr.message_id = m.id AND mr.user_id = $2

        LEFT JOIN message_attachments ma ON ma.message_id = m.id

        WHERE m.thread_id = $1
        GROUP BY m.id, u.id, mr.message_id, mr.read_at
        ORDER BY m.sent_at DESC
        LIMIT 10
    ) sub
    ORDER BY sent_at ASC;
  `, [id, userId]);
  if (res.rows.length === 0) return [];
  return res.rows.map(row => ({
    ...mapMessageRow(row),
    attachments: row.attachments || []
  }));
}

async function createMessaging(payload) {
    const {
        toUserId,
        fromUserId,
        type = 'private',
        groupName,
        memberIds = []
    } = payload || {};
    let sql = "";
    let res;

    if (!toUserId) throw new Error('toUserId est requis');
    if (!fromUserId) throw new Error("fromUserId est requis");
    if (type !== "private" && !groupName) throw new Error("le nom du groupe est requis");

    if (type === 'private') {
      sql = `WITH existing_thread AS (
            SELECT mt.id
            FROM message_threads mt
            JOIN thread_participants tp1 
                ON tp1.thread_id = mt.id AND tp1.user_id = $1
            JOIN thread_participants tp2 
                ON tp2.thread_id = mt.id AND tp2.user_id = $2
            WHERE mt.type = 'private'
            GROUP BY mt.id
            HAVING COUNT(*) = 2
        ),
        new_thread AS (
            INSERT INTO message_threads (type, created_by, created_at)
            SELECT 'private', $1, now()
            WHERE NOT EXISTS (SELECT 1 FROM existing_thread)
            RETURNING id
        ),
        thread_id AS (
            SELECT id FROM new_thread
            UNION
            SELECT id FROM existing_thread
        )
        INSERT INTO thread_participants (thread_id, user_id, role, joined_at)
        SELECT id, user_id, 'member', now()
        FROM thread_id,
        LATERAL (VALUES ($1), ($2)) AS users(user_id)
        ON CONFLICT DO NOTHING
        RETURNING thread_id;`
      res = await pool.query(sql, [toUserId, fromUserId]);
    } else {
      sql = `
        WITH new_thread AS (
          INSERT INTO message_threads (type, name, created_by, created_at)
          VALUES ('group', $2, $1, now())
          RETURNING id
        )

        -- Ajouter le créateur en admin
        INSERT INTO thread_participants (thread_id, user_id, role, joined_at)
        SELECT id, $1, 'admin', now()
        FROM new_thread

        UNION ALL

        -- Ajouter les autres membres
        SELECT id, member_id, 'member', now()
        FROM new_thread,
        LATERAL unnest($3::integer[]) AS member_id

        RETURNING thread_id;`;
      res = await pool.query(sql, [fromUserId, groupName, memberIds]);
    }
    //return await getById(res.rows[0].thread_id, fromUserId);
}

async function deleteMessaging(id) {
  const res = await pool.query(`DELETE FROM message_threads 
    WHERE id = $1;`, [id]);
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
    content,
    attachments = []
  } = payload || {};

  if (!threadId) throw new Error('threadId est requis');
  if (!userId) throw new Error("userId est requis");

  const result = await pool.query(
    `WITH inserted_message AS (
      INSERT INTO messages (thread_id, sender_id, content, sent_at)
      SELECT 
          $1,
          $2,
          $3,
          now()
      FROM thread_participants tp
      WHERE 
          tp.thread_id = $1
          AND tp.user_id = $2
      RETURNING *
    )
    INSERT INTO message_reads (message_id, user_id, read_at)
    SELECT id, $2, now()
      FROM inserted_message
    RETURNING message_id;`,
    [threadId, userId, content ? encodeURIComponent(content) : '']
  );

  const messageId = result.rows[0]?.message_id;
  if (messageId && attachments.length > 0) {
    for (const att of attachments) {
      await pool.query(
        `INSERT INTO message_attachments (message_id, filename, original_name, mime_type, size, url)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [messageId, att.filename, att.original_name, att.mime_type, att.size, att.url]
      );
    }
  }  
}

async function deleteMessage(id, userId) {
  const res = await pool.query(`UPDATE messages m
    SET deleted_at = now(),
        content = 'Message supprimé'
    FROM thread_participants tp
    WHERE 
        m.id = $1
        AND m.sender_id = $2
        AND tp.thread_id = m.thread_id
        AND tp.user_id = $2;`, [id, userId]);
  if (res.rowCount === 0) {
    const err = new Error('Message introuvable');
    err.status = 404;
    throw err;
  }
}

async function readAllMessages(threadId, userId) {
  await pool.query(`INSERT INTO message_reads (message_id, user_id)
    SELECT m.id, $2
    FROM messages m
    LEFT JOIN message_reads mr
        ON mr.message_id = m.id
        AND mr.user_id = $2
    WHERE 
        m.thread_id = $1
        AND m.sender_id <> $2
        AND mr.message_id IS NULL; `, [threadId, userId]);
}

async function addMembersToThread(data) {
  const res = await pool.query(`INSERT INTO thread_participants (thread_id, user_id, role, joined_at)
    SELECT $1, unnest($2::integer[]), 'member', now()
    ON CONFLICT DO NOTHING;`, [data.threadId, data.members]);
  if (res.rowCount === 0) {
    const err = new Error('Aucun membre ajouté (discussion introuvable ou membres déjà présents)');
    err.status = 404;
    throw err;
  }
}

async function removeMembersToThread(data) {
  const res = await pool.query(`DELETE FROM thread_participants
    WHERE thread_id = $1
    AND user_id = ANY($2::integer[]);`, [data.threadId, data.members]);
  if (res.rowCount === 0) {
    const err = new Error('Aucun membre supprimé (discussion introuvable ou membres déjà absents)');
    err.status = 404;
    throw err;
  }
}

async function renameMessagingThread(data) {
  const res = await pool.query(`UPDATE message_threads
    SET name = $2
    WHERE id = $1;`, [data.threadId, data.newName]);
  if (res.rowCount === 0) {
    const err = new Error('Discussion introuvable');
    err.status = 404;
    throw err;
  }
}

async function leaveMessagingThread(data) {
  const res = await pool.query(`DELETE FROM thread_participants
    WHERE thread_id = $1
    AND user_id = $2;`, [data.threadId, data.userId]);
  if (res.rowCount === 0) {
    const err = new Error('Discussion introuvable ou utilisateur non membre');
    err.status = 404;
    throw err;
  }
}

async function setNewAdmin(threadId) {
  const res = await pool.query(`UPDATE thread_participants
    SET role = 'admin'
    WHERE user_id = (
      SELECT user_id
      FROM thread_participants
      WHERE thread_id = $1
      ORDER BY joined_at ASC
      LIMIT 1
    ) AND thread_id = $1;`, [threadId]);
  if (res.rowCount === 0) {
    const err = new Error('Discussion introuvable ou aucun membre restant pour devenir admin');
    err.status = 404;
    throw err;
  }
}

module.exports = {
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
};
