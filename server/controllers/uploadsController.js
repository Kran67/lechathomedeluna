const path = require('path');
const fs = require('fs');
const pool = require('../db/pool');

async function uploadImage(req, res) {
  let multer;
  try {
    multer = require('multer');
  } catch (e) {
    return res.status(500).json({ error: 'Upload not available: missing dependency (multer)' });
  }
  const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
  try { fs.mkdirSync(uploadDir, { recursive: true }); } catch (_) {}

  const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, uploadDir); },
    filename: function (req, file, cb) {
      const ext = path.extname(file && file.originalname ? file.originalname : '').toLowerCase();
      const base = Date.now() + '-' + Math.random().toString(16).slice(2, 10);
      cb(null, base + ext);
    }
  });
  const fileFilter = function (req, file, cb) {
    if (file && file.mimetype && file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  };
  const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }).single('file');

  upload(req, res, async function (err) {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'file is required (field name "file")' });

    // Optional metadata to clarify the intent of this image
    const context = (req.body && String(req.body.context || '').toLowerCase()) || null; // pictures | vaccines |  | other
    const vaccineDate = req.body && req.body.date ? String(req.body.date) : null;
    const catId = req.body && req.body.cat_id ? String(req.body.cat_id) : null;

    // If a cat_id is provided, ensure it exists (for better UX)
    if (catId) {
      try {
        const p = await pool.query('SELECT id FROM cats WHERE id = $1', [catId]);
        if (!p) return res.status(404).json({ error: 'Cat not found for provided cat_id' });
      } catch (e) {
        return res.status(500).json({ error: 'Validation failed: ' + e.message });
      }
    }

    // Build a simple guidance message for the client
    const publicUrl = '/uploads/' + req.file.filename;
    let instructions = 'Upload successful. Use the returned URL where appropriate.';
    //if (purpose === 'property-cover') {
    //  instructions = propertyId
    //    ? `Set as cover: PATCH /api/properties/${propertyId} with { "cover": "${publicUrl}" }`
    //    : 'Set as cover of a property by PATCH /api/properties/{id} with { "cover": "<url>" }';
    //} else
    // if (purpose === 'property-picture') {
      instructions = catId
        ? 'Add to gallery when creating/updating cat data. Currently, pictures are provided when creating a cat: include the URL in the pictures array.'
        : 'Include the URL in the "pictures" array when creating a cat.';
    //} else if (purpose === 'user-picture') {
    //  const userId = req.user && req.user.id ? String(req.user.id) : '{yourUserId}';
    //  instructions = `Set as user picture: PATCH /api/users/${userId} with { "picture": "${publicUrl}" } (self or admin)`;
    //}
    if (context === "pictures") {
      await pool.query('INSERT INTO cat_pictures (cat_id, url) VALUES ($1, $2)', [catId, publicUrl]);
    } else if (context === "vaccines") {
      await pool.query('INSERT INTO cat_vaccines (cat_id, date, url) VALUES ($1, $2, $3)', [catId, vaccineDate, publicUrl]);
    }

    res.status(201).json({
      url: publicUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      //purpose: purpose,
      cat_id: catId || undefined,
      instructions
    });
  });
}

async function deleteImages(req, res) {
  const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
  try { fs.mkdirSync(uploadDir, { recursive: true }); } catch (_) {}

  function toFilename(item) {
    if (!item) return null;
    const s = String(item);
    // Accept either "/uploads/filename.jpg" or just "filename.jpg"
    const base = s.includes('/uploads/') ? s.split('/uploads/').pop() : path.basename(s);
    // Reject path traversal
    if (base.includes('..') || base.includes('/') || base.includes('\\')) return null;
    return base;
  }

  let inputs = [];
  if (req.body && Array.isArray(req.body.filenames)) inputs = inputs.concat(req.body.filenames);
  if (req.body && Array.isArray(req.body.urls)) inputs = inputs.concat(req.body.urls);
  if (req.body && typeof req.body.filename === 'string') inputs.push(req.body.filename);
  if (req.body && typeof req.body.url === 'string') inputs.push(req.body.url);
  // Also support comma-separated query ?filenames=a.jpg,b.png
  if (typeof req.query.filenames === 'string') inputs = inputs.concat(req.query.filenames.split(','));
  if (typeof req.query.filename === 'string') inputs.push(req.query.filename);
  if (typeof req.query.urls === 'string') inputs = inputs.concat(req.query.urls.split(','));
  if (typeof req.query.url === 'string') inputs.push(req.query.url);

  const context = (req.body && String(req.body.context || '').toLowerCase()) || null; // pictures | vaccines |  | other

  const set = new Set(inputs.map(toFilename).filter(Boolean));
  if (set.size === 0) {
    return res.status(400).json({ error: 'Provide filename(s) or url(s) to delete (filenames[], urls[], filename, url, or query params).' });
  }

  const filenames = Array.from(set);
  const results = [];
  const deleted = [];
  const not_found = [];
  const errors = [];

  for (const name of filenames) {
    const full = path.join(uploadDir, name);
    try {
      if (!fs.existsSync(full)) {
        not_found.push(name);
        results.push({ filename: name, status: 'not_found' });
        continue;
      }
      // Unlink file
      fs.unlinkSync(full);
      deleted.push(name);
      results.push({ filename: name, status: 'deleted' });

      const url = '/uploads/' + name;
      // Clean references in DB (best-effort)
      try {
        if (context === "pictures") {
          await pool.query('DELETE FROM cat_pictures WHERE url = $1', [url]);
        } else if (context === "vaccines") {
          await pool.query('DELETE FROM cat_vaccines WHERE url = $1', [url]);
        }
      } catch (_) {}
      //try {
      //  await db.runAsync('UPDATE properties SET cover = NULL WHERE cover = ?', [url]);
      //} catch (_) {}
      //try {
      //  await db.runAsync('UPDATE users SET picture = NULL WHERE picture = ?', [url]);
      //} catch (_) {}
    } catch (e) {
      errors.push({ filename: name, error: e.message });
      results.push({ filename: name, status: 'error', error: e.message });
    }
  }

  const status = errors.length === 0 ? 200 : (deleted.length > 0 ? 207 : 400); // 207 Multi-Status when partial
  return res.status(status).json({ ok: errors.length === 0, deleted, not_found, errors, results });
}

module.exports = { uploadImage, deleteImages };
