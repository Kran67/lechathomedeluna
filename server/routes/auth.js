const express = require('express');
const router = express.Router();

const { doRegister, doLogin, doRequestReset, doResetPassword } = require('../controllers/authController');

// Auth endpoints
router.post('/register', doRegister);
router.post('/login', doLogin);
router.post('/request-reset', doRequestReset);
router.post('/reset-password', doResetPassword);

module.exports = router;
