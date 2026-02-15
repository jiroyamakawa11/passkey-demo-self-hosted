/**
 * 認証関連のルーティング。
 * @type {import('express').Router}
 */
const express = require('express');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/me', authController.me);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/reauth', requireAuth, authController.reauth);

module.exports = router;
