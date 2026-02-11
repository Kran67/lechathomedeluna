const express = require('express');
const router = express.Router();

const { requireRole, requireAdmin, requireSelfOrAdmin, requireAuth } = require('../middlewares/auth');
const cats = require('../controllers/catsController');
const users = require('../controllers/usersController');
const uploads = require('../controllers/uploadsController');

// Properties
router.get('/cats', cats.list); // non adoptable
router.get('/catsAdoptable', cats.listAdoptable);
router.get('/catsAdopted/:year', cats.listAdopted);
router.get('/catsMine/:id', cats.listMine);
router.get('/cats/:id', cats.getById);
router.post('/cats', requireRole(['Admin','Assistant', 'HostFamily']), cats.create);
router.patch('/cats/:slug', requireRole(['Admin','Assistant', 'HostFamily']), cats.update);
router.delete('/cats/:id', requireRole(['Admin']), cats.remove);

// Users
router.get('/users', requireAdmin, users.list);
router.get('/users/:id', requireSelfOrAdmin('id'), users.getById);
router.post('/users', requireAdmin, users.create);
router.patch('/users/:id', requireSelfOrAdmin('id'), users.update);

// Uploads
router.post('/uploads/image', requireRole(['Admin']), uploads.uploadImage);

// Delete one or multiple uploaded images by filename or URL
router.delete('/uploads/images', requireRole(['Admin']), uploads.deleteImages);

router.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(500).json({ status: "db down" });
  }
});

router.get('/profile/resetpassword/:id', users.resetPassword);

module.exports = router;
