/**
 * FashionForge — Authentication REST API Routes
 * Mount point: /api/auth
 */

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

// POST /api/auth/register - Register new account
router.post('/register', authController.register);

// POST /api/auth/login - Authenticate credentials and receive JWT
router.post('/login', authController.login);

// GET /api/auth/me - Inspect authenticated session identity
router.get('/me', requireAuth, authController.getMe);

module.exports = router;
