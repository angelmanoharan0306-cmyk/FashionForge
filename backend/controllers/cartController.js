/**
 * FashionForge — Cart Controller
 * Handles shopping cart operations scoped strictly to the authenticated user.
 */

const Cart = require('../models/Cart');
const Design = require('../models/Design');

/**
 * Finds or initializes an empty cart for the user
 */
async function getOrCreateUserCart(userId) {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
    await cart.save();
  }
  return cart;
}

/**
 * GET /api/cart
 * Retrieves the authenticated user's cart
 */
async function getCart(req, res, next) {
  try {
    const userId = req.user.userId;
    const cart = await getOrCreateUserCart(userId);
    return res.status(200).json({
      success: true,
      cart: cart.toJSON()
    });
  } catch (error) {
    console.error('[Cart Controller] getCart error:', error.message);
    next(error);
  }
}

/**
 * POST /api/cart/items
 * Adds an owned design to the user's cart
 */
async function addItem(req, res, next) {
  try {
    const userId = req.user.userId;
    const { designId, quantity = 1 } = req.body || {};

    if (!designId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Field "designId" is required to add item to cart.'
      });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Field "quantity" must be a positive integer.'
      });
    }

    // Verify design existence in database
    let design = await Design.findOne({ designId });
    if (!design && designId.match(/^[0-9a-fA-F]{24}$/)) {
      design = await Design.findById(designId);
    }

    if (!design) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Design with ID "${designId}" was not found.`
      });
    }

    // Strictly enforce ownership: User cannot add another user's design to cart
    if (design.userId && design.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: "You cannot add another designer's garment to your cart."
      });
    }

    const cart = await getOrCreateUserCart(userId);

    // Duplicate behavior: Check if this exact designId already exists in cart
    const existingIndex = cart.items.findIndex(item => item.designId === design.designId);

    if (existingIndex > -1) {
      // Increment quantity rather than creating duplicate cart line
      cart.items[existingIndex].quantity += qty;
      cart.items[existingIndex].totalPrice = cart.items[existingIndex].quantity * cart.items[existingIndex].unitPrice;
    } else {
      // Ensure unit price is authoritative from design model
      const unitPrice = Number(design.price) || 0;
      const configSnapshot = design.configuration || {
        gender: design.gender,
        figure: design.figure,
        croquis: design.croquis,
        size: design.size,
        top: design.top,
        bottom: design.bottom,
        sleeves: design.sleeves,
        collar: design.collar,
        neckline: design.neckline,
        fabric: design.fabric,
        colour: design.colour,
        pattern: design.pattern,
        notes: design.notes,
        price: unitPrice,
        view: design.view
      };

      cart.items.push({
        cartItemId: `citem_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
        designId: design.designId,
        designName: design.name,
        quantity: qty,
        unitPrice,
        totalPrice: qty * unitPrice,
        configuration: configSnapshot
      });
    }

    cart.recalculate();
    await cart.save();

    const statusCode = existingIndex > -1 ? 200 : 201;
    return res.status(statusCode).json({
      success: true,
      cart: cart.toJSON()
    });
  } catch (error) {
    console.error('[Cart Controller] addItem error:', error.message);
    next(error);
  }
}

/**
 * PUT /api/cart/items/:itemId
 * Updates item quantity in cart
 */
async function updateItemQuantity(req, res, next) {
  try {
    const userId = req.user.userId;
    const { itemId } = req.params;
    const { quantity } = req.body || {};

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Quantity must be a positive integer.'
      });
    }

    const cart = await getOrCreateUserCart(userId);
    const item = cart.items.find(i => i.cartItemId === itemId || i.designId === itemId);

    if (!item) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Cart item "${itemId}" not found in your bag.`
      });
    }

    item.quantity = qty;
    item.totalPrice = qty * item.unitPrice;

    cart.recalculate();
    await cart.save();

    return res.status(200).json({
      success: true,
      cart: cart.toJSON()
    });
  } catch (error) {
    console.error(`[Cart Controller] updateItemQuantity error for ${req.params.itemId}:`, error.message);
    next(error);
  }
}

/**
 * DELETE /api/cart/items/:itemId
 * Removes an item from the cart
 */
async function removeItem(req, res, next) {
  try {
    const userId = req.user.userId;
    const { itemId } = req.params;

    const cart = await getOrCreateUserCart(userId);
    const initialCount = cart.items.length;
    cart.items = cart.items.filter(i => i.cartItemId !== itemId && i.designId !== itemId);

    if (cart.items.length === initialCount) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Cart item "${itemId}" not found in your bag.`
      });
    }

    cart.recalculate();
    await cart.save();

    return res.status(200).json({
      success: true,
      cart: cart.toJSON()
    });
  } catch (error) {
    console.error(`[Cart Controller] removeItem error for ${req.params.itemId}:`, error.message);
    next(error);
  }
}

/**
 * DELETE /api/cart
 * Clears all items in the user's cart
 */
async function clearCart(req, res, next) {
  try {
    const userId = req.user.userId;
    const cart = await getOrCreateUserCart(userId);
    cart.items = [];
    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully.',
      cart: cart.toJSON()
    });
  } catch (error) {
    console.error('[Cart Controller] clearCart error:', error.message);
    next(error);
  }
}

module.exports = {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart
};
