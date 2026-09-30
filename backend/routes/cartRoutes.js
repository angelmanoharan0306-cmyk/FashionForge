/**
 * FashionForge — Cart REST API Routes
 * Mount point: /api/cart
 * Protected by JWT authentication middleware
 */

const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController');
const { requireAuth } = require('../middleware/auth');

// All cart operations require an authenticated user
router.use(requireAuth);

// GET /api/cart - Retrieve current user's cart
router.get('/', cartController.getCart);

// POST /api/cart/items - Add design to cart
router.post('/items', cartController.addItem);

// PUT /api/cart/items/:itemId - Update item quantity
router.put('/items/:itemId', cartController.updateItemQuantity);

// DELETE /api/cart/items/:itemId - Remove item from cart
router.delete('/items/:itemId', cartController.removeItem);

// DELETE /api/cart - Clear all cart items
router.delete('/', cartController.clearCart);

module.exports = router;
