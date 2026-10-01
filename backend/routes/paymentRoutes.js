/**
 * FashionForge — Payment REST API Routes
 * Mount point: /api/payments
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { requireAuth } = require('../middleware/auth');

// Gateway configuration status endpoint
router.get('/config', paymentController.getPaymentConfig);

// Public Webhook Endpoint (verified cryptographically via HMAC-SHA256 signature)
router.post('/cashfree/webhook', paymentController.handleCashfreeWebhook);

// Protected Payment Endpoints (Strictly require authenticated JWT user)
router.post('/:orderId/upi-qr', requireAuth, paymentController.generateDynamicUpiQr);
router.get('/:orderId/status', requireAuth, paymentController.getPaymentStatus);
router.post('/:orderId/cancel', requireAuth, paymentController.cancelPayment);
router.post('/:orderId/cod', requireAuth, paymentController.confirmCod);
router.post('/:orderId/card-session', requireAuth, paymentController.getCardSession);
router.post('/:orderId/mock-status', paymentController.mockPaymentStatus);

module.exports = router;
