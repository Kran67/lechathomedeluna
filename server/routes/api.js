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
router.post('/cats', requireRole(['SuperAdmin', 'Admin','AdoptionReferent', 'HostFamily']), cats.create);
router.patch('/cats/favorite/:slug', cats.updateFavoriteCount);
router.patch('/cats/:slug', requireRole(['SuperAdmin', 'Admin', 'AdoptionReferent', 'HealthRegisterReferent', 'VetVoucherReferent', 'ICADReferent', 'HostFamily']), cats.update);
router.delete('/cats/:slug', requireRole(['SuperAdmin', 'Admin']), cats.remove);
router.delete('/cats/cloneandremove/:slug', requireRole(['SuperAdmin', 'Admin']), cats.cloneAndRemove);
router.get('/facatnotfullycompletedcount', requireRole(['SuperAdmin', 'Admin', 'AdoptionReferent']), cats.notFullyCompletedCount);
router.get('/facatnotfullycompletedcount/:id', requireRole(['SuperAdmin', 'Admin', 'AdoptionReferent', 'HostFamily']), cats.notFullyCompletedCount);
router.get('/facatnotfullycompletedlist', requireRole(['SuperAdmin', 'Admin', 'AdoptionReferent', 'HostFamily']), cats.notFullyCompletedList);
router.get('/facatnotfullycompletedlist/:id', requireRole(['HostFamily']), cats.notFullyCompletedList);
router.get('/adoptedcatnotfullycompletedcount', requireRole(['SuperAdmin', 'Admin', 'CommitteeMember']), cats.adoptedNotFullyCompletedCount);
router.get('/adoptedcatnotfullycompletedlist', requireRole(['SuperAdmin', 'Admin', 'CommitteeMember']), cats.adoptedNotFullyCompletedList);
router.get('/hasprevisitwithoutdatelist', requireRole(['SuperAdmin', 'Admin', 'CommitteeMember']), cats.hasPreVisitWithoutDateList);
router.post('/createadoptionrequest', cats.createAdoptionRequest);
router.get('/adoptedcount', cats.adoptedCount)
router.get('/catboostervaccinationnolaterthanonemonthcount', requireRole(['SuperAdmin', 'Admin', 'HostFamily']), cats.boosterVaccinationNoLaterThanOneMonthCount);
router.get('/catboostervaccinationnolaterthanonemonthcount/:id', requireRole(['HostFamily']), cats.boosterVaccinationNoLaterThanOneMonthCount);
router.get('/catboostervaccinationnolaterthanonemonthlist', requireRole(['SuperAdmin', 'Admin', 'HostFamily']), cats.boosterVaccinationNoLaterThanOneMonthList);
router.get('/catboostervaccinationnolaterthanonemonthlist/:id', requireRole(['HostFamily']), cats.boosterVaccinationNoLaterThanOneMonthList);

// Users
router.get('/users', requireAuth, users.list);
router.get('/users/:id', requireSelfOrAdmin('id'), users.getById);
router.post('/users', requireAdmin, users.create);
router.patch('/users/:id', requireSelfOrAdmin('id'), users.update);
router.get('/users/reset/:token', users.userIdByResetToken);

// Reset password
router.get('/profile/resetpassword/:email', users.resetPassword);
router.get('/resetpassword/validate/:token', users.checkResetTokenValidity);
router.post('/profile/updatepassword', users.updatePassword);

// Vet vouchers
router.get('/vetvouchers', requireRole(['SuperAdmin', 'Admin', 'VetVoucherReferent']), vetVouchers.list);
router.get('/vetvouchers/:year/:clinic/:object', requireRole(['SuperAdmin', 'Admin', 'VetVoucherReferent']), vetVouchers.listByParams);
router.get('/vetvouchers/:id', requireRole(['SuperAdmin', 'Admin', 'VetVoucherReferent']), vetVouchers.listByParams);
router.post('/vetvouchers', requireRole(['SuperAdmin', 'Admin', 'HostFamily']), vetVouchers.create);
router.patch('/vetvouchers/:id', requireRole(['SuperAdmin', 'Admin', 'VetVoucherReferent']), vetVouchers.update);
router.delete('/vetvouchers/:id', requireRole(['SuperAdmin', 'Admin', 'VetVoucherReferent']), vetVouchers.remove);
router.get('/vetvoucherscount', requireRole(['SuperAdmin', 'Admin', 'VetVoucherReferent']), vetVouchers.count);

// Messaging
router.get('/messaging/:userid', requireRole(['SuperAdmin', 'Admin', 'CommitteeMember', 'HostFamily', 'Volunteer']), messaging.getByUserId);
router.get('/messaging/unread/:userid', requireRole(['SuperAdmin', 'Admin', 'CommitteeMember', 'HostFamily', 'Volunteer']), messaging.unreadMessageCountByUserId);
router.get('/messaging/unreadlist/:userid', requireRole(['SuperAdmin', 'Admin', 'CommitteeMember', 'HostFamily', 'Volunteer']), messaging.unreadMessageListByUserId);
router.post('/messaging', requireRole(['SuperAdmin', 'Admin', 'CommitteeMember', 'HostFamily', 'Volunteer']), messaging.create);
router.post('/messaging/createandsendmessage', requireRole(['SuperAdmin', 'Admin', 'CommitteeMember', 'HostFamily', 'Volunteer']), messaging.createAndSendMessage);
router.delete('/messaging/:id', requireRole(['SuperAdmin', 'Admin', 'CommitteeMember', 'HostFamily', 'Volunteer']), messaging.remove);
router.post('/sendmessage', requireRole(['SuperAdmin', 'Admin', 'CommitteeMember', 'HostFamily', 'Volunteer']), messaging.createMsg);
router.delete('/message/:id', requireRole(['SuperAdmin', 'Admin', 'CommitteeMember', 'HostFamily', 'Volunteer']), messaging.removeMsg);
router.post('/messaging/addmembers', requireAuth, messaging.addMembers);
router.post('/messaging/removemembers', requireAuth, messaging.removeMembers);
router.post('/messaging/renamethread', requireAuth, messaging.renameThread);
router.post('/messaging/leavethread', requireAuth, messaging.leaveThread);

router.get('/messaging/all/:id/:userid', requireRole(['SuperAdmin', 'Admin', 'CommitteeMember', 'HostFamily', 'Volunteer']), messaging.getAllMessagesByThreadId);
// Ajouter après les routes messaging existantes :
router.post('/messaging/upload', requireRole(['SuperAdmin', 'Admin', 'CommitteeMember', 'HostFamily', 'Volunteer']), messaging.uploadMessageAttachment);

// News
router.get('/news/:period', news.getNews);
router.post('/news', requireRole(['SuperAdmin', 'Admin']), news.create);
router.delete('/news/:id', requireRole(['SuperAdmin', 'Admin']), news.remove);

// Uploads
router.post('/uploads/image', requireRole(['SuperAdmin', 'Admin', 'HealthRegisterReferent', 'HostFamily']), uploads.uploadImage);

// Delete one or multiple uploaded images by filename or URL
router.delete('/uploads/images', requireRole(['SuperAdmin', 'Admin', 'HealthRegisterReferent', 'HostFamily']), uploads.deleteImages);

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
router.get("/dump", requireRole(['SuperAdmin']), async (req, res) => {
  try {
    let result = await pool.query("SELECT * FROM users");
    const users = [];
    result.rows.map((row) => users.push({
        id: row.id,
        name: row.name,
        lastName: row.lastName,
        placeOfBirth: row.placeOfBirth,
        phone: row.phone,
        address: row.address,
        cityId: row.cityId,
        roles: row.roles,
        email: row.email,
        password_hash: row.password_hash,
        blacklisted: row.blacklisted,
        referrer_id: row.referrer_id,
        capacity: row.capacity,
        birthDate: row.birthDate,
        acceptedConditionOfUse: row.acceptedConditionOfUse,
        acceptedConditionOfUseDate: row.acceptedConditionOfUseDate,
        reset_token: row.reset_token,
        reset_expires: row.reset_expires,
    }));
    result = await pool.query("SELECT * FROM cats");
    const cats = [];
    result.rows.map((row) => cats.push({
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description,
        statusFiv: row.statusFiv,
        statusFelv: row.statusFelv,
        numIdentification: row.numIdentification,
        sex: row.sex,
        dress: row.dress,
        race: row.race,
        isSterilized: row.isSterilized,
        sterilizationDate: row.sterilizationDate,
        birthDate: row.birthDate,
        isDuringVisit: row.isDuringVisit,
        isAdoptable: row.isAdoptable,
        adoptionDate: row.adoptionDate,
        favoriteCount: row.favoriteCount,
        preVisitDate: row.preVisitDate,
        hostfamily_id: row.hostfamily_id,
        entryDate: row.entryDate,
        provenance: row.provenance,
        destination: row.destination,
        created_by: row.created_by,
        created_at: row.created_at,
        updated_by: row.updated_by,
        updated_at: row.updated_at,
    }));
    result = await pool.query("SELECT * FROM cat_pictures");
    const catPictures = [];
    result.rows.map((row) => catPictures.push({
        id: row.id,
        cat_id: row.cat_id,
        url: row.url,
        scheduling: row.scheduling,
    }));
    result = await pool.query("SELECT * FROM cat_documents");
    const catDocuments = [];
    result.rows.map((row) => catDocuments.push({
        id: row.id,
        cat_id: row.cat_id,
        date: row.date,
        url: row.url,
        type: row.type,
        original_name: row.original_name,
    }));
    result = await pool.query("SELECT * FROM vet_vouchers");
    const vetVouchers = [];
    result.rows.map((row) => vetVouchers.push({
        id: row.id,
        date: row.date,
        appointmentDate: row.appointmentDate,
        user_id: row.user_id,
        cat_id: row.cat_id,
        clinic: row.clinic,
        object: row.object,
        processed_on: row.processed_on,
        created_by: row.created_by,
        created_at: row.created_at,
        updated_by: row.updated_by,
        updated_at: row.updated_at,
    }));
    result = await pool.query("SELECT * FROM message_threads");
    const messageThreads = [];
    result.rows.map((row) => messageThreads.push({
        id: row.id,
        type: row.type,
        name: row.name,
        created_by: row.created_by,
        created_at: row.created_at,
    }));
    result = await pool.query("SELECT * FROM thread_participants");
    const threadParticipants = [];
    result.rows.map((row) => threadParticipants.push({
        thread_id: row.thread_id,
        user_id: row.user_id,
        role: row.role,
        joined_at: row.joined_at,
    }));
    result = await pool.query("SELECT * FROM messages");
    const messages = [];
    result.rows.map((row) => messages.push({
        id: row.id,
        thread_id: row.thread_id,
        sender_id: row.sender_id,
        content: row.content,
        sent_at: row.sent_at,
        deleted_at: row.deleted_at,
    }));
    result = await pool.query("SELECT * FROM message_reads");
    const messageReads = [];
    result.rows.map((row) => messageReads.push({
        message_id: row.message_id,
        user_id: row.user_id,
        read_at: row.read_at,
    }));
    result = await pool.query("SELECT * FROM news");
    const news = [];
    result.rows.map((row) => news.push({
        id: row.id,
        date: row.date,
        url: row.url,
    }));
    result = await pool.query("SELECT * FROM message_attachments");
    const messageAttachments = [];
    result.rows.map((row) => messageAttachments.push({
        id: row.id,
        message_id: row.message_id,
        filename: row.filename,
        original_name: row.original_name,
        mime_type: row.mime_type,
        size: row.size,
        url: row.url,
        created_at: row.created_at,
    }));
    result = await pool.query("SELECT * FROM cat_request_adoptions");
    const catRequestAdoptions = [];
    result.rows.map((row) => catRequestAdoptions.push({
        id: row.id,
        cat_id: row.cat_id,
        date: row.date,
        last_name: row.last_name,
        first_name: row.first_name,
        email: row.email,
        facebook: row.facebook,
        lifePlace: row.lifePlace,
        area: row.area,
        isOutsideAccess: row.isOutsideAccess,
        householdPeopleNumber: row.householdPeopleNumber,
        alreadyPresenAnimalsNumber: row.alreadyPresenAnimalsNumber,
        dailyTimeOff: row.dailyTimeOff,
        holidaysChildcareSolution: row.holidaysChildcareSolution,
        acceptedConditionOfUse: row.acceptedConditionOfUse,
        acceptedConditionOfUseDate: row.acceptedConditionOfUseDate,
    }));
    res.json({ users, cats, catPictures, catDocuments, vetVouchers, messageThreads, threadParticipants, messages, messageReads, news, messageAttachments, catRequestAdoptions });
  } catch {
    res.status(500).json({ status: "Db down" });
  }
});
router.post('/sql', requireRole(['SuperAdmin']), async (req, res) => {
    const result = await pool.query(req.body.query);
    res.json({ result: result });
});

module.exports = router;
