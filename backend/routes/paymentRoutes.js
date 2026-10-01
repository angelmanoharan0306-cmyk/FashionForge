/**
 * FashionForge — Payment REST API Routes
 * Mount point: /api/payments
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { requireAuth } = require('../middleware/auth');

// Public gateway / merchant configuration
router.get('/config', paymentController.getPaymentConfig);

// Protected Payment Endpoints (Strictly require authenticated JWT user)
router.get('/:orderId/upi-details', requireAuth, paymentController.getUpiDetails);
router.post('/:orderId/upi-qr', requireAuth, paymentController.generateDynamicUpiQr);
router.post('/:orderId/confirm-upi', requireAuth, paymentController.confirmUpiPayment);
router.post('/:orderId/cod', requireAuth, paymentController.confirmCod);
router.get('/:orderId/status', requireAuth, paymentController.getPaymentStatus);
router.post('/:orderId/cancel', requireAuth, paymentController.cancelPayment);
router.post('/:orderId/mock-status', paymentController.mockPaymentStatus);
router.post('/test-mode', (req, res) => res.status(200).json({ success: true }));

module.exports = router;
