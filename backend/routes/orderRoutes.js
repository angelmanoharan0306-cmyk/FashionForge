/**
 * FashionForge — Order & Checkout REST API Routes
 * Mount point: /api/orders
 * Protected by JWT authentication middleware
 */

const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const { requireAuth } = require('../middleware/auth');

// All order operations strictly require authenticated user
router.use(requireAuth);

// POST /api/orders/checkout - Place pending order from user's cart
router.post('/checkout', orderController.checkout);

// GET /api/orders - List all orders for current user
router.get('/', orderController.getUserOrders);

// GET /api/orders/:orderId - Inspect single order by ID
router.get('/:orderId', orderController.getOrderById);

// POST /api/orders/:orderId/pay - Simulate payment execution
router.post('/:orderId/pay', orderController.simulatePayment);

// POST /api/orders/:orderId/advance-status & /status - Simulate lifecycle progression
router.post('/:orderId/advance-status', orderController.advanceOrderStatus);
router.post('/:orderId/status', orderController.advanceOrderStatus);

module.exports = router;
