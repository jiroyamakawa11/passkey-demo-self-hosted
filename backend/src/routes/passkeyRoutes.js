/**
 * Passkey関連のルーティング。
 * @type {import('express').Router}
 */
const express = require('express');
const passkeyController = require('../controllers/passkeyController');
const { requireAuth, requireReauth } = require('../middleware/auth');

const router = express.Router();

router.post('/passkey/registration/start', requireAuth, requireReauth, passkeyController.startRegistration);
router.post('/passkey/registration/finish', requireAuth, requireReauth, passkeyController.finishRegistration);
router.post('/passkey/authentication/start', passkeyController.startAuthentication);
router.post('/passkey/authentication/finish', passkeyController.finishAuthentication);
router.post('/passkey/delete', requireAuth, requireReauth, passkeyController.deletePasskey);

module.exports = router;
