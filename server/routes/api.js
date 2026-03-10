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
const postalCodes = require('../controllers/postalCodeController');

// Properties
router.get('/cats', cats.list); // non adoptable
router.get('/catsadoptable', cats.listAdoptable);
router.get('/catsadopted/:year', cats.listAdopted);
router.get('/catsmine/:id', cats.listMine);
router.get('/cats/:id', cats.getById);
router.post('/cats', requireRole(['Admin','AdoptionReferent', 'HostFamily']), cats.create);
router.patch('/cats/favorite/:slug', cats.updateFavoriteCount);
router.patch('/cats/:slug', requireRole(['Admin', 'AdoptionReferent', 'HealthRegisterReferent', 'VetVoucherReferent', 'ICADReferent', 'HostFamily']), cats.update);
router.delete('/cats/:id', requireRole(['Admin']), cats.remove);
router.get('/catnotfullycompletedcount', requireRole(['Admin', 'AdoptionReferent']), cats.notFullyCompletedCount);
router.get('/catnotfullycompletedlist', requireRole(['Admin', 'AdoptionReferent']), cats.notFullyCompletedList);
router.get('/hasprevisitwithoutdatelist', requireRole(['Admin', 'CommitteeMember']), cats.hasPreVisitWithoutDateList);
router.post('/createadoptionrequest', cats.createAdoptionRequest);

// Users
router.get('/users', requireAuth, users.list);
router.get('/users/:id', requireSelfOrAdmin('id'), users.getById);
router.post('/users', requireAdmin, users.create);
router.patch('/users/:id', requireSelfOrAdmin('id'), users.update);

// Reset password
router.get('/profile/resetpassword/:email', users.resetPassword);
router.get('/resetpassword/validate/:token', users.checkResetTokenValidity);
router.post('/profile/updatepassword', users.updatePassword);

// Vet vouchers
router.get('/vetvouchers', requireRole(['Admin', 'VetVoucherReferent']), vetVouchers.list);
router.get('/vetvouchers/:year/:clinic/:object', requireRole(['Admin', 'VetVoucherReferent']), vetVouchers.listByParams);
router.get('/vetvouchers/:id', requireRole(['Admin', 'VetVoucherReferent']), vetVouchers.listByParams);
router.post('/vetvouchers', requireRole(['Admin', 'VetVoucherReferent']), vetVouchers.create);
router.patch('/vetvouchers/:id', requireRole(['Admin', 'VetVoucherReferent']), vetVouchers.update);
router.delete('/vetvouchers/:id', requireRole(['Admin', 'VetVoucherReferent']), vetVouchers.remove);
router.get('/vetvoucherscount', requireRole(['Admin', 'VetVoucherReferent']), vetVouchers.count);

// Messaging
router.get('/messaging/:userid', requireRole(['Admin', 'CommitteeMember', 'HostFamily', 'Volunteer']), messaging.getByUserId);
router.get('/messaging/unread/:userid', requireRole(['Admin', 'CommitteeMember', 'HostFamily', 'Volunteer']), messaging.unreadMessageCountByUserId);
router.get('/messaging/unreadlist/:userid', requireRole(['Admin', 'CommitteeMember', 'HostFamily', 'Volunteer']), messaging.unreadMessageListByUserId);
router.post('/messaging', requireRole(['Admin', 'CommitteeMember', 'HostFamily', 'Volunteer']), messaging.create);
router.post('/messaging/createandsendmessage', requireRole(['Admin', 'CommitteeMember', 'HostFamily', 'Volunteer']), messaging.createAndSendMessage);
router.delete('/messaging/:id', requireRole(['Admin', 'CommitteeMember', 'HostFamily', 'Volunteer']), messaging.remove);
router.post('/sendmessage', requireRole(['Admin', 'CommitteeMember', 'HostFamily', 'Volunteer']), messaging.createMsg);
router.delete('/message/:id', requireRole(['Admin', 'CommitteeMember', 'HostFamily', 'Volunteer']), messaging.removeMsg);
router.post('/messaging/addmembers', requireAuth, messaging.addMembers);
router.post('/messaging/removemembers', requireAuth, messaging.removeMembers);
router.post('/messaging/renamethread', requireAuth, messaging.renameThread);
router.post('/messaging/leavethread', requireAuth, messaging.leaveThread);

router.get('/messaging/all/:id/:userid', requireRole(['Admin', 'CommitteeMember', 'HostFamily', 'Volunteer']), messaging.getAllMessagesByThreadId);
// Ajouter après les routes messaging existantes :
router.post('/messaging/upload', requireRole(['Admin', 'CommitteeMember', 'HostFamily', 'Volunteer']), messaging.uploadMessageAttachment);

// News
router.get('/news/:period', news.getNews);
router.post('/news', requireRole(['Admin']), news.create);
router.delete('/news/:id', requireRole(['Admin']), news.remove);

// Uploads
router.post('/uploads/image', requireRole(['Admin', 'HealthRegisterReferent', 'HostFamily']), uploads.uploadImage);

// Delete one or multiple uploaded images by filename or URL
router.delete('/uploads/images', requireRole(['Admin', 'HealthRegisterReferent', 'HostFamily']), uploads.deleteImages);

// Codes postaux
router.get('/postalcodes/search', requireAuth, postalCodes.search);
router.get('/postalcodes/:code/cities', requireAuth, postalCodes.getCities);

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
