/**
 * FashionForge — Payment Controller
 * backend/controllers/paymentController.js
 *
 * Coordinates Cashfree payment processing, dynamic UPI QR generation,
 * secure status polling, COD confirmation, and webhook reconciliation.
 */

const Order = require('../models/Order');
const Cart = require('../models/Cart');
const cashfreeService = require('../services/cashfreeService');

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
 * POST /api/payments/:orderId/upi-qr
 * Generates a transaction-specific Dynamic UPI QR code via Cashfree
 */
async function generateDynamicUpiQr(req, res, next) {
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

    // Ensure Cashfree payment session exists
    let sessionId = order.cashfreePaymentSessionId;
    if (!sessionId) {
      const cfOrder = await cashfreeService.createCashfreeOrder({
        orderId: order.orderId,
        orderAmount: order.total,
        customer: {
          userId,
          name: order.customer?.name || order.customer?.fullName,
          email: order.customer?.email,
          phone: order.customer?.phone
        }
      });
      sessionId = cfOrder.payment_session_id;
      order.cashfreeOrderId = cfOrder.cf_order_id || cfOrder.order_id;
      order.cashfreePaymentSessionId = sessionId;
      await order.save();
    }

    // Generate dynamic QR code through Cashfree
    const upiQrData = await cashfreeService.createDynamicUpiQr({
      paymentSessionId: sessionId,
      orderId: order.orderId,
      amount: order.total
    });

    // Extract QR code string or image payload
    const rawQr = upiQrData.data?.payload?.qrcode ||
      upiQrData.data?.payload?.upi_string ||
      upiQrData.data?.url ||
      upiQrData.qrCode ||
      `upi://pay?pa=fashionforge.cashfree@okhdfcbank&pn=FashionForge%20Atelier&tr=${encodeURIComponent(order.orderId)}&am=${Number(order.total).toFixed(2)}&cu=INR&tn=FashionForge%20Order%20${encodeURIComponent(order.orderId)}`;

    // Also attempt mobile intent URI for mobile support
    let intentUrl = null;
    try {
      const intentRes = await cashfreeService.createUpiIntent({
        paymentSessionId: sessionId,
        orderId: order.orderId,
        amount: order.total
      });
      intentUrl = intentRes.data?.payload?.intent ||
        intentRes.data?.payload?.gpay ||
        intentRes.data?.payload?.phonepe ||
        rawQr;
    } catch {
      intentUrl = rawQr;
    }

    order.paymentMethod = 'upi';
    await order.save();

    return res.status(200).json({
      success: true,
      orderId: order.orderId,
      amount: order.total,
      currency: 'INR',
      qrCode: rawQr,
      upiString: rawQr,
      intentUrl: intentUrl || rawQr,
      paymentSessionId: sessionId,
      cfPaymentId: upiQrData.cf_payment_id || null
    });
  } catch (error) {
    console.error(`[PaymentController] generateDynamicUpiQr error for ${req.params.orderId}:`, error.message);
    next(error);
  }
}

/**
 * GET /api/payments/:orderId/status
 * Polled by frontend while QR modal is open. Checks payment status securely server-side.
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

    // If order already recorded as paid in database
    if (order.paymentStatus === 'paid') {
      return res.status(200).json({
        success: true,
        orderId: order.orderId,
        paymentStatus: 'paid',
        orderStatus: order.orderStatus,
        isPaid: true,
        isFailed: false,
        amount: order.total,
        paidAt: order.paidAt
      });
    }

    // Check with Cashfree securely from backend
    const cfStatus = await cashfreeService.getCashfreePaymentStatus(order.orderId);

    if (cfStatus.isPaid) {
      // Order paid! Transition state and clear cart
      order.paymentStatus = 'paid';
      order.orderStatus = 'placed';
      if (cfStatus.paymentId) order.cashfreePaymentId = cfStatus.paymentId;
      order.paidAt = new Date();
      if (cfStatus.paymentMethod) order.paymentMethod = cfStatus.paymentMethod;

      if (!Array.isArray(order.tracking) || order.tracking.length === 0) {
        order.tracking = [
          {
            status: 'placed',
            label: 'Bespoke Order Placed',
            timestamp: new Date()
          }
        ];
      }

      await order.save();

      // Clear authenticated user's cart upon verified payment success
      await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

      return res.status(200).json({
        success: true,
        orderId: order.orderId,
        paymentStatus: 'paid',
        orderStatus: order.orderStatus,
        isPaid: true,
        isFailed: false,
        amount: order.total,
        paidAt: order.paidAt
      });
    }

    if (cfStatus.isFailed) {
      order.paymentStatus = 'failed';
      await order.save();
      // Bag remains preserved!

      return res.status(200).json({
        success: true,
        orderId: order.orderId,
        paymentStatus: 'failed',
        orderStatus: order.orderStatus,
        isPaid: false,
        isFailed: true,
        amount: order.total,
        message: 'Payment attempt was not successful.'
      });
    }

    return res.status(200).json({
      success: true,
      orderId: order.orderId,
      paymentStatus: order.paymentStatus || 'pending',
      orderStatus: order.orderStatus,
      isPaid: false,
      isFailed: false,
      amount: order.total,
      rawStatus: cfStatus.rawStatus
    });
  } catch (error) {
    console.error(`[PaymentController] getPaymentStatus error for ${req.params.orderId}:`, error.message);
    next(error);
  }
}

/**
 * POST /api/payments/:orderId/cancel
 * Triggered when user dismisses the QR modal or chooses to cancel payment
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

    // Do NOT mark as paid. Keep Bag intact.
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
          label: 'Bespoke Order Placed',
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
 * POST /api/payments/:orderId/card-session
 * Returns payment session ID for Cashfree secure card checkout component
 */
async function getCardSession(req, res, next) {
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

    let sessionId = order.cashfreePaymentSessionId;
    if (!sessionId) {
      const cfOrder = await cashfreeService.createCashfreeOrder({
        orderId: order.orderId,
        orderAmount: order.total,
        customer: {
          userId,
          name: order.customer?.name || order.customer?.fullName,
          email: order.customer?.email,
          phone: order.customer?.phone
        }
      });
      sessionId = cfOrder.payment_session_id;
      order.cashfreeOrderId = cfOrder.cf_order_id || cfOrder.order_id;
      order.cashfreePaymentSessionId = sessionId;
      await order.save();
    }

    order.paymentMethod = 'card';
    await order.save();

    return res.status(200).json({
      success: true,
      orderId: order.orderId,
      amount: order.total,
      paymentSessionId: sessionId,
      cashfreeEnv: (process.env.CASHFREE_ENV || 'sandbox').toLowerCase()
    });
  } catch (error) {
    console.error(`[PaymentController] getCardSession error for ${req.params.orderId}:`, error.message);
    next(error);
  }
}

/**
 * POST /api/payments/cashfree/webhook
 * Receives and cryptographically verifies webhooks from Cashfree
 */
async function handleCashfreeWebhook(req, res, next) {
  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    // Cryptographic signature verification
    const isValid = cashfreeService.verifyWebhookSignature({
      signature,
      timestamp,
      rawBody
    });

    if (!isValid) {
      console.warn('[PaymentController] Invalid Cashfree webhook signature received');
      return res.status(400).json({
        success: false,
        error: 'Invalid Signature',
        message: 'Webhook signature verification failed.'
      });
    }

    const { type, data } = req.body || {};
    const orderRef = data?.order?.order_id;
    if (!orderRef) {
      return res.status(200).json({ success: true, message: 'Ignored webhook without order ID' });
    }

    const order = await Order.findOne({ orderId: orderRef });
    if (!order) {
      return res.status(200).json({ success: true, message: `Order ${orderRef} not found in database` });
    }

    // Server-Authoritative Amount Verification
    const webhookAmount = Number(data?.order?.order_amount ?? data?.payment?.payment_amount);
    if (webhookAmount && Math.abs(order.total - webhookAmount) > 0.01) {
      console.error(`[PaymentController] SECURITY ALERT: Webhook amount mismatch! Order: ${order.total}, Webhook: ${webhookAmount}`);
      return res.status(400).json({
        success: false,
        error: 'Amount Mismatch',
        message: 'Webhook payment amount does not match authoritative order total.'
      });
    }

    const paymentStatus = data?.payment?.payment_status;

    if (type === 'PAYMENT_SUCCESS_WEBHOOK' || paymentStatus === 'SUCCESS') {
      // Idempotency: If order is already paid, do not re-clear bag or duplicate actions
      if (order.paymentStatus === 'paid') {
        return res.status(200).json({ success: true, message: 'Order is already marked as paid' });
      }

      order.paymentStatus = 'paid';
      order.orderStatus = 'placed';
      if (data?.payment?.cf_payment_id) {
        order.cashfreePaymentId = String(data.payment.cf_payment_id);
      }
      order.paidAt = new Date();
      if (data?.payment?.payment_group) {
        order.paymentMethod = data.payment.payment_group;
      }

      if (!Array.isArray(order.tracking) || order.tracking.length === 0) {
        order.tracking = [
          {
            status: 'placed',
            label: 'Bespoke Order Placed',
            timestamp: new Date()
          }
        ];
      }

      await order.save();

      // Clear user's bag only on verified payment success
      await Cart.findOneAndUpdate({ userId: order.userId }, { $set: { items: [] } });

      return res.status(200).json({
        success: true,
        message: 'Payment verified and order marked as paid.'
      });
    }

    if (type === 'PAYMENT_FAILED_WEBHOOK' || ['FAILED', 'USER_DROPPED', 'CANCELLED'].includes(paymentStatus)) {
      // Only transition to failed if not already paid
      if (order.paymentStatus !== 'paid') {
        order.paymentStatus = 'failed';
        await order.save();
        // Bag remains preserved!
      }
      return res.status(200).json({
        success: true,
        message: 'Payment failure recorded.'
      });
    }

    return res.status(200).json({ success: true, message: 'Event acknowledged' });
  } catch (error) {
    console.error('[PaymentController] handleCashfreeWebhook error:', error.message);
    next(error);
  }
}

/**
 * POST /api/payments/:orderId/mock-status
 * Test helper for simulating Cashfree gateway status transitions at service boundary
 */
async function mockPaymentStatus(req, res, next) {
  try {
    const { orderId } = req.params;
    const { status, paymentId, paymentMethod } = req.body || {};
    cashfreeService.__mockSetPaymentResult(orderId, {
      status: status || 'SUCCESS',
      paymentId,
      paymentMethod
    });
    return res.status(200).json({
      success: true,
      message: `Mock payment status for order ${orderId} set to ${status || 'SUCCESS'}`
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  generateDynamicUpiQr,
  getPaymentStatus,
  cancelPayment,
  confirmCod,
  getCardSession,
  handleCashfreeWebhook,
  mockPaymentStatus
};
