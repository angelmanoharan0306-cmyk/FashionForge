/**
 * FashionForge — Payment Controller
 * backend/controllers/paymentController.js
 *
 * Implements simplified UPI QR and Cash on Delivery payment processing:
 * - Dynamic standard UPI payment URI generation (upi://pay?pa=...&pn=FashionForge&am=...&cu=INR)
 * - Customer UPI payment confirmation ("I've Completed Payment")
 * - Cash on Delivery (COD) confirmation
 * - Bag clearance only upon confirmed order
 * - Cancellation preserving Bag intact
 */

const Order = require('../models/Order');
const Cart = require('../models/Cart');
const upiService = require('../services/upiService');

/**
 * Helper to retrieve order by ID with ownership verification
 */
async function getOwnedOrder(orderId, userId) {
  let order = await Order.findOne({ orderId });
  if (!order && orderId && orderId.match(/^[0-9a-fA-F]{24}$/)) {
    order = await Order.findById(orderId);
  }
  return order;
}

/**
 * GET /api/payments/config
 * Returns public merchant UPI details for frontend rendering
 */
function getPaymentConfig(req, res) {
  return res.status(200).json({
    success: true,
    upiId: upiService.getMerchantUpiId(),
    merchantName: upiService.getMerchantName(),
    environment: 'production'
  });
}

/**
 * GET /api/payments/:orderId/upi-details
 * POST /api/payments/:orderId/upi-qr
 * Generates dynamic transaction-specific UPI URI using standard NPCI format
 */
async function getUpiDetails(req, res, next) {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;

    const order = await getOwnedOrder(orderId, userId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Order "${orderId}" was not found.`
      });
    }

    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to pay for this order.'
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(200).json({
        success: true,
        alreadyPaid: true,
        paymentStatus: 'paid',
        orderId: order.orderId,
        message: 'This order has already been paid.'
      });
    }

    const upiId = upiService.getMerchantUpiId();
    const merchantName = upiService.getMerchantName();
    const upiUri = upiService.buildUpiUri({ amount: order.total, orderId: order.orderId });

    order.paymentMethod = 'upi';
    await order.save();

    return res.status(200).json({
      success: true,
      orderId: order.orderId,
      amount: order.total,
      currency: 'INR',
      upiId,
      merchantName,
      upiUri,
      qrCode: upiUri,
      upiString: upiUri,
      intentUrl: upiUri,
      paymentStatus: order.paymentStatus
    });
  } catch (error) {
    console.error(`[PaymentController] getUpiDetails error for ${req.params.orderId}:`, error.message);
    next(error);
  }
}

/**
 * POST /api/payments/:orderId/confirm-upi
 * Triggered when customer clicks "I've Completed Payment"
 * Confirms the order, marks paymentStatus as 'paid', and clears the Bag
 */
async function confirmUpiPayment(req, res, next) {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;

    const order = await getOwnedOrder(orderId, userId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Order "${orderId}" was not found.`
      });
    }

    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to confirm this order.'
      });
    }

    // Idempotency: if already paid, acknowledge without re-clearing
    if (order.paymentStatus === 'paid') {
      return res.status(200).json({
        success: true,
        orderId: order.orderId,
        paymentStatus: 'paid',
        orderStatus: order.orderStatus,
        message: 'Order is already marked as paid.',
        order: order.toJSON()
      });
    }

    // Update order status: manual customer UPI payment confirmation
    order.paymentMethod = 'upi';
    order.paymentStatus = 'paid';
    order.orderStatus = 'placed';
    order.paidAt = new Date();

    if (!Array.isArray(order.tracking) || order.tracking.length === 0) {
      order.tracking = [
        {
          status: 'placed',
          label: 'Order Placed',
          timestamp: new Date()
        }
      ];
    }

    const savedOrder = await order.save();

    // Authoritative Cart clearance only upon confirmed payment
    await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

    return res.status(200).json({
      success: true,
      message: 'UPI payment submitted. Order placed successfully.',
      order: savedOrder.toJSON()
    });
  } catch (error) {
    console.error(`[PaymentController] confirmUpiPayment error for ${req.params.orderId}:`, error.message);
    next(error);
  }
}

/**
 * POST /api/payments/:orderId/cod
 * Confirms order with Cash on Delivery
 */
async function confirmCod(req, res, next) {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;

    const order = await getOwnedOrder(orderId, userId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Order "${orderId}" was not found.`
      });
    }

    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to place this order.'
      });
    }

    order.paymentMethod = 'cod';
    order.paymentStatus = 'pending';
    order.orderStatus = 'placed';

    if (!Array.isArray(order.tracking) || order.tracking.length === 0) {
      order.tracking = [
        {
          status: 'placed',
          label: 'Order Placed',
          timestamp: new Date()
        }
      ];
    }

    const savedOrder = await order.save();

    // Clear cart upon confirming COD order
    await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

    return res.status(200).json({
      success: true,
      message: 'Order confirmed with Cash on Delivery.',
      order: savedOrder.toJSON()
    });
  } catch (error) {
    console.error(`[PaymentController] confirmCod error for ${req.params.orderId}:`, error.message);
    next(error);
  }
}

/**
 * GET /api/payments/:orderId/status
 * Queries authoritative payment status for an order
 */
async function getPaymentStatus(req, res, next) {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;

    const order = await getOwnedOrder(orderId, userId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Order "${orderId}" was not found.`
      });
    }

    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to check status for this order.'
      });
    }

    const isPaid = order.paymentStatus === 'paid';
    return res.status(200).json({
      success: true,
      status: isPaid ? 'PAID' : (order.paymentStatus === 'failed' ? 'FAILED' : 'PENDING'),
      orderId: order.orderId,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      isPaid,
      isFailed: order.paymentStatus === 'failed',
      amount: order.total,
      paidAt: order.paidAt || null
    });
  } catch (error) {
    console.error(`[PaymentController] getPaymentStatus error for ${req.params.orderId}:`, error.message);
    next(error);
  }
}

/**
 * POST /api/payments/:orderId/cancel
 * Triggered when user cancels payment flow; preserves Bag intact
 */
async function cancelPayment(req, res, next) {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;

    const order = await getOwnedOrder(orderId, userId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Order "${orderId}" was not found.`
      });
    }

    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to modify this order.'
      });
    }

    // Keep Bag intact!
    return res.status(200).json({
      success: true,
      orderId: order.orderId,
      paymentStatus: order.paymentStatus,
      message: 'Payment cancelled. Your Bag is still available.'
    });
  } catch (error) {
    console.error(`[PaymentController] cancelPayment error for ${req.params.orderId}:`, error.message);
    next(error);
  }
}

/**
 * POST /api/payments/:orderId/mock-status
 * Test helper for simulating status transitions in automated test suites
 */
async function mockPaymentStatus(req, res, next) {
  try {
    const { orderId } = req.params;
    const { status } = req.body || {};
    const order = await Order.findOne({ orderId });
    if (order) {
      if (status === 'SUCCESS' || status === 'paid') {
        order.paymentStatus = 'paid';
        order.orderStatus = 'placed';
        order.paidAt = new Date();
      } else if (status === 'FAILED' || status === 'failed') {
        order.paymentStatus = 'failed';
      }
      await order.save();
    }
    return res.status(200).json({
      success: true,
      message: `Status updated for order ${orderId}`
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPaymentConfig,
  getUpiDetails,
  generateDynamicUpiQr: getUpiDetails, // backward-compatible alias
  confirmUpiPayment,
  confirmCod,
  getPaymentStatus,
  cancelPayment,
  mockPaymentStatus
};
