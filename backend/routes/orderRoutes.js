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

module.exports = router;
