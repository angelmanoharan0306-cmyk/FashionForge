/**
 * FashionForge — Order & Checkout Controller
 * Handles checkout order creation, authoritative server price calculation,
 * and payment simulation state transitions.
 */

const Order = require('../models/Order');
const Cart = require('../models/Cart');
const cashfreeService = require('../services/cashfreeService');

const ORDER_LIFECYCLE = ['placed', 'processing', 'ready', 'shipped', 'delivered'];

const STATUS_LABELS = {
  placed: 'Bespoke Order Placed',
  processing: 'Artisan Workshop Cutting & Assembly',
  ready: 'Garment Finishing & Quality Inspection',
  shipped: 'Dispatched via Insured Atelier Courier',
  delivered: 'Delivered to Recipient'
};

/**
 * Validates customer checkout payload fields
 */
function validateCustomerInfo(customer = {}) {
  const errors = [];
  const name = customer.fullName || customer.name;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Full name is required.');
  }
  if (!customer.email || typeof customer.email !== 'string' || !/^\S+@\S+\.\S+$/.test(customer.email.trim())) {
    errors.push('A valid email address is required.');
  }
  if (!customer.phone || typeof customer.phone !== 'string' || customer.phone.trim().length < 5) {
    errors.push('Phone number is required.');
  }
  const address = customer.shippingAddress || customer.address;
  if (!address || typeof address !== 'string' || address.trim().length === 0) {
    errors.push('Shipping address is required.');
  }
  if (!customer.city || typeof customer.city !== 'string' || customer.city.trim().length === 0) {
    errors.push('City is required.');
  }
  if (!customer.state || typeof customer.state !== 'string' || customer.state.trim().length === 0) {
    errors.push('State / Province is required.');
  }
  if (!customer.postalCode || typeof customer.postalCode !== 'string' || customer.postalCode.trim().length === 0) {
    errors.push('Postal / ZIP code is required.');
  }
  return errors;
}

/**
 * POST /api/orders/checkout
 * Converts user's active cart into a pending order with authoritative server totals
 */
async function checkout(req, res, next) {
  try {
    const userId = req.user.userId;
    const { customer } = req.body || {};

    // 1. Validate customer information
    const validationErrors = validateCustomerInfo(customer);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid customer checkout details.',
        details: validationErrors
      });
    }

    // 2. Load user's cart from MongoDB
    const cart = await Cart.findOne({ userId });
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Empty Cart',
        message: 'Your cart is empty. Please add items before checking out.'
      });
    }

    // 3. Server-authoritative calculation (Price Security: Ignore any client-submitted totals)
    let calculatedSubtotal = 0;
    const orderItems = cart.items.map(item => {
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
      const lineTotal = qty * unitPrice;
      calculatedSubtotal += lineTotal;

      return {
        designId: item.designId,
        designName: item.designName,
        quantity: qty,
        unitPrice,
        totalPrice: lineTotal,
        configuration: item.configuration
      };
    });

    const calculatedTotal = calculatedSubtotal;
    const resolvedName = (customer.fullName || customer.name).trim();
    const resolvedAddress = (customer.shippingAddress || customer.address).trim();

    // 4. Create Order document with initial statuses
    const newOrder = new Order({
      userId,
      items: orderItems,
      subtotal: calculatedSubtotal,
      total: calculatedTotal,
      customer: {
        fullName: resolvedName,
        name: resolvedName,
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone.trim(),
        shippingAddress: resolvedAddress,
        address: resolvedAddress,
        city: customer.city.trim(),
        state: customer.state.trim(),
        postalCode: customer.postalCode.trim()
      },
      paymentStatus: 'pending',
      orderStatus: 'placed',
      tracking: [
        {
          status: 'placed',
          label: STATUS_LABELS.placed,
          timestamp: new Date()
        }
      ]
    });

    // Create Cashfree Payment Order
    try {
      const cfOrder = await cashfreeService.createCashfreeOrder({
        orderId: newOrder.orderId,
        orderAmount: calculatedTotal,
        customer: {
          userId,
          name: resolvedName,
          email: customer.email.trim().toLowerCase(),
          phone: customer.phone.trim()
        }
      });
      if (cfOrder) {
        newOrder.cashfreeOrderId = cfOrder.cf_order_id || cfOrder.order_id;
        newOrder.cashfreePaymentSessionId = cfOrder.payment_session_id;
      }
    } catch (cfErr) {
      console.warn('[Order Controller] Cashfree order initialization warning:', cfErr.message);
    }

    const savedOrder = await newOrder.save();

    return res.status(201).json({
      success: true,
      message: 'Order created successfully. Ready for payment.',
      order: savedOrder.toJSON()
    });
  } catch (error) {
    console.error('[Order Controller] checkout error:', error.message);
    next(error);
  }
}

/**
 * GET /api/orders/:orderId
 * Retrieves order details if owned by current user
 */
async function getOrderById(req, res, next) {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;

    let order = await Order.findOne({ orderId });
    if (!order && orderId.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(orderId);
    }

    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Order "${orderId}" was not found.`
      });
    }

    // Authorization check
    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to view this order.'
      });
    }

    return res.status(200).json({
      success: true,
      order: order.toJSON()
    });
  } catch (error) {
    console.error(`[Order Controller] getOrderById error for ${req.params.orderId}:`, error.message);
    next(error);
  }
}

/**
 * GET /api/orders
 * Retrieves all orders belonging to authenticated user
 */
async function getUserOrders(req, res, next) {
  try {
    const userId = req.user.userId;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json(orders.map(o => o.toJSON()));
  } catch (error) {
    console.error('[Order Controller] getUserOrders error:', error.message);
    next(error);
  }
}

/**
 * POST /api/orders/:orderId/pay
 * Simulates payment processing (success or failure) controlled by server state transitions
 */
async function simulatePayment(req, res, next) {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;
    const { result } = req.body || {};

    if (!result || !['success', 'failure'].includes(result)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Simulation parameter "result" must be either "success" or "failure".'
      });
    }

    let order = await Order.findOne({ orderId });
    if (!order && orderId.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(orderId);
    }

    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Order "${orderId}" was not found.`
      });
    }

    // Security check: Only the order owner can pay
    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: "You cannot process payment for another customer's order."
      });
    }

    // Server-controlled state transition
    if (result === 'success') {
      order.paymentStatus = 'paid';
      order.orderStatus = 'placed';

      if (!Array.isArray(order.tracking) || order.tracking.length === 0) {
        order.tracking = [
          {
            status: 'placed',
            label: STATUS_LABELS.placed,
            timestamp: new Date()
          }
        ];
      }

      // Clear user's cart on successful payment simulation
      await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });
    } else {
      order.paymentStatus = 'failed';
    }

    const updatedOrder = await order.save();

    return res.status(200).json({
      success: result === 'success',
      paymentStatus: updatedOrder.paymentStatus,
      message: result === 'success'
        ? 'Payment simulation successful. Order placed.'
        : 'Payment simulation failed. Order marked as failed.',
      order: updatedOrder.toJSON()
    });
  } catch (error) {
    console.error(`[Order Controller] simulatePayment error for ${req.params.orderId}:`, error.message);
    next(error);
  }
}

/**
 * POST /api/orders/:orderId/advance-status
 * Advances order lifecycle state to next valid phase (Simulation mechanism)
 */
async function advanceOrderStatus(req, res, next) {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;
    const { nextStatus, status } = req.body || {};
    const requestedTarget = nextStatus || status;

    let order = await Order.findOne({ orderId });
    if (!order && orderId.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(orderId);
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Order "${orderId}" was not found.`
      });
    }

    // Strict ownership verification
    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: "You do not have permission to advance another customer's order status."
      });
    }

    const currentStatus = order.orderStatus || 'placed';
    const currentIndex = ORDER_LIFECYCLE.indexOf(currentStatus);

    // If order is at terminal state 'delivered'
    if (currentStatus === 'delivered') {
      return res.status(400).json({
        success: false,
        error: 'Terminal State',
        message: 'Order has already been delivered and cannot be advanced further or regressed.'
      });
    }

    if (currentIndex === -1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid State',
        message: `Order status "${currentStatus}" cannot be advanced.`
      });
    }

    const expectedNext = ORDER_LIFECYCLE[currentIndex + 1];

    // If client supplied a target status, verify it matches expectedNext exactly
    if (requestedTarget && requestedTarget !== expectedNext) {
      return res.status(400).json({
        success: false,
        error: 'Invalid State Transition',
        message: `Invalid status transition from "${currentStatus}" to "${requestedTarget}". The next allowed state is "${expectedNext}".`
      });
    }

    // Advance order
    order.orderStatus = expectedNext;

    if (!Array.isArray(order.tracking)) {
      order.tracking = [];
    }

    order.tracking.push({
      status: expectedNext,
      label: STATUS_LABELS[expectedNext] || expectedNext,
      timestamp: new Date()
    });

    const updated = await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status advanced to "${expectedNext}".`,
      order: updated.toJSON()
    });
  } catch (error) {
    console.error(`[Order Controller] advanceOrderStatus error for ${req.params.orderId}:`, error.message);
    next(error);
  }
}

module.exports = {
  checkout,
  getOrderById,
  getUserOrders,
  simulatePayment,
  advanceOrderStatus,
  ORDER_LIFECYCLE,
  STATUS_LABELS
};
