const express = require('express');
const router = express.Router();

const dbReady = require('../middlewares/dbReady');
const { requireRole, requireAdmin, requireSelfOrAdmin, requireAuth } = require('../middlewares/auth');
const cats = require('../controllers/CatsController');
const users = require('../controllers/usersController');
const uploads = require('../controllers/uploadsController');

// Ensure DB is ready for all API routes
router.use(dbReady);

// Properties
router.get('/cats', cats.list);
router.get('/catsAdopted', cats.listAdopted);
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

module.exports = router;
