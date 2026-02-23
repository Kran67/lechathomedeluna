const express = require('express');
const router = express.Router();
const pool = require("../db/pool");

const { requireRole, requireAdmin, requireSelfOrAdmin, requireAuth } = require('../middlewares/auth');
const cats = require('../controllers/catsController');
const users = require('../controllers/usersController');
const uploads = require('../controllers/uploadsController');
const vetVouchers = require('../controllers/vetVouchersController');
const messaging = require('../controllers/messagingController');
const news = require('../controllers/newsController');

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

// Reset password
router.get('/profile/resetpassword/:email', users.resetPassword);
router.get('/resetpassword/validate/:token', users.checkResetTokenValidity);
router.post('/profile/updatepassword', users.updatePassword);

// Vet vouchers
router.get('/vetvouchers', requireRole(['Admin', 'Assistant']), vetVouchers.list);
router.get('/vetvouchers/:year/:clinic/:object', requireRole(['Admin', 'Assistant']), vetVouchers.listByParams);
router.post('/vetvouchers', requireRole(['Admin', 'Assistant']), vetVouchers.create);
router.patch('/vetvouchers/:id', requireRole(['Admin', 'Assistant']), vetVouchers.update);
router.delete('/vetvouchers/:id', requireRole(['Admin', 'Assistant']), vetVouchers.remove);

// Messaging
router.get('/messaging/:userid', requireRole(['Admin', 'Assistant', 'HostFamily', 'Volunteer']), messaging.getByUserId);
router.post('/messaging', requireRole(['Admin', 'Assistant', 'HostFamily', 'Volunteer']), messaging.create);
router.delete('/messaging/:id', requireRole(['Admin', 'Assistant', 'HostFamily', 'Volunteer']), messaging.remove);
router.post('/sendmessage', requireRole(['Admin', 'Assistant', 'HostFamily', 'Volunteer']), messaging.createMsg);
router.delete('/message/:id', requireRole(['Admin', 'Assistant', 'HostFamily', 'Volunteer']), messaging.removeMsg);

router.get('/messaging/all/:id/:userid', requireRole(['Admin', 'Assistant', 'HostFamily', 'Volunteer']), messaging.getAllMessagesByThreadId);

// News
router.get('/news/:period', news.getNews);
router.post('/news', requireRole(['Admin']), news.create);
router.delete('/news/:id', requireRole(['Admin']), news.remove);

// Uploads
router.post('/uploads/image', requireRole(['Admin']), uploads.uploadImage);

// Delete one or multiple uploaded images by filename or URL
router.delete('/uploads/images', requireRole(['Admin']), uploads.deleteImages);

router.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(500).json({ status: "Db down" });
  }
});

router.get('/profile/resetpassword/:id', users.resetPassword);

module.exports = router;
