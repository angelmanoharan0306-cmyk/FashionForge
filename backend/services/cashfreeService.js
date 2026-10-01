/**
 * FashionForge — Cashfree Payment Gateway Service
 * backend/services/cashfreeService.js
 *
 * Implements server-side Cashfree Payment Gateway integration:
 * - Order creation with server-authoritative amounts
 * - Dynamic UPI QR code generation
 * - Mobile UPI Intent generation
 * - Order payment status checks
 * - Webhook HMAC-SHA256 signature verification and idempotency
 * - Seamless service-boundary test/sandbox mocking when live credentials are not set
 */

const crypto = require('crypto');

// Cashfree Environment Configuration
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || '';
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || '';
const CASHFREE_ENV = (process.env.CASHFREE_ENV || 'sandbox').toLowerCase();
const CASHFREE_API_VERSION = process.env.CASHFREE_API_VERSION || '2023-08-01';

const CASHFREE_BASE_URL = CASHFREE_ENV === 'production'
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

/**
 * Returns true if real Cashfree credentials are configured
 */
function isConfigured() {
  return Boolean(
    CASHFREE_APP_ID &&
    CASHFREE_SECRET_KEY &&
    !CASHFREE_APP_ID.includes('YOUR_') &&
    !CASHFREE_SECRET_KEY.includes('YOUR_')
  );
}

// In-memory mock store for sandbox testing when credentials are not yet provisioned
const mockOrderStore = new Map();

/**
 * Generates standard headers for Cashfree PG API requests
 */
function getCashfreeHeaders() {
  return {
    'x-client-id': CASHFREE_APP_ID,
    'x-client-secret': CASHFREE_SECRET_KEY,
    'x-api-version': CASHFREE_API_VERSION,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
}

/**
 * Sanitizes phone number to 10 digits as required by Cashfree
 */
function sanitizePhoneNumber(phone) {
  if (!phone) return '9999999999';
  const digits = String(phone).replace(/[^0-9]/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits.padStart(10, '9');
}

/**
 * Creates a Cashfree PG Order
 *
 * @param {Object} params
 * @param {string} params.orderId - FashionForge unique order ID
 * @param {number} params.orderAmount - Authoritative order amount in INR
 * @param {Object} params.customer - Customer details (userId, name, email, phone)
 * @param {string} [params.returnUrl] - Return URL after completion
 * @param {string} [params.notifyUrl] - Webhook notification URL
 * @returns {Promise<Object>} Cashfree order response with payment_session_id
 */
async function createCashfreeOrder({ orderId, orderAmount, customer, returnUrl, notifyUrl }) {
  const numericAmount = Number(Number(orderAmount).toFixed(2));
  const phone = sanitizePhoneNumber(customer.phone);
  const email = (customer.email || 'customer@fashionforge.com').trim().toLowerCase();
  const name = (customer.name || customer.fullName || 'FashionForge Client').trim();
  const customerId = (customer.userId || customer.customerId || `CUST_${orderId}`).replace(/[^a-zA-Z0-9_-]/g, '_');

  const payload = {
    order_id: orderId,
    order_amount: numericAmount,
    order_currency: 'INR',
    customer_details: {
      customer_id: customerId,
      customer_name: name,
      customer_email: email,
      customer_phone: phone
    },
    order_meta: {
      return_url: returnUrl || `http://localhost:5000/order-confirmation?orderId=${encodeURIComponent(orderId)}`,
      notify_url: notifyUrl || `http://localhost:5000/api/payments/cashfree/webhook`
    },
    order_note: `FashionForge Order ${orderId}`
  };

  // If live credentials are not configured, simulate Cashfree PG order at service boundary
  if (!isConfigured()) {
    const cfOrderId = `cf_ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const sessionId = `session_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const mockOrder = {
      cf_order_id: cfOrderId,
      order_id: orderId,
      order_amount: numericAmount,
      order_currency: 'INR',
      payment_session_id: sessionId,
      order_status: 'ACTIVE',
      created_at: new Date().toISOString()
    };
    mockOrderStore.set(orderId, {
      ...mockOrder,
      customer,
      payments: []
    });
    return mockOrder;
  }

  const url = `${CASHFREE_BASE_URL}/orders`;
  const response = await fetch(url, {
    method: 'POST',
    headers: getCashfreeHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || `Cashfree order creation failed with HTTP ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.details = data;
    throw err;
  }

  return data;
}

/**
 * Generates dynamic transaction-specific UPI QR data for an order session
 *
 * @param {Object} params
 * @param {string} params.paymentSessionId - Cashfree payment session ID
 * @param {string} params.orderId - FashionForge order ID
 * @param {number} params.amount - Order amount in INR
 * @returns {Promise<Object>} { qrCode, cfPaymentId, channel: 'qrcode', status: 'PENDING' }
 */
async function createDynamicUpiQr({ paymentSessionId, orderId, amount }) {
  const numericAmount = Number(amount || 0).toFixed(2);

  // If real Cashfree credentials are not provisioned, generate dynamic transaction UPI URI & QR data
  if (!isConfigured()) {
    const cfPaymentId = `cf_pay_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    // NPCI standard dynamic UPI QR URI format tied specifically to this order and exact amount
    const upiUri = `upi://pay?pa=fashionforge.cashfree@okhdfcbank&pn=FashionForge&tr=${encodeURIComponent(orderId)}&am=${numericAmount}&cu=INR&tn=FashionForge%20Order%20${encodeURIComponent(orderId)}`;

    const mockRecord = mockOrderStore.get(orderId);
    if (mockRecord) {
      mockRecord.payments.push({
        cf_payment_id: cfPaymentId,
        payment_status: 'PENDING',
        payment_amount: Number(numericAmount),
        payment_group: 'upi',
        payment_time: new Date().toISOString()
      });
    }

    return {
      cf_payment_id: cfPaymentId,
      payment_method: 'upi',
      channel: 'qrcode',
      data: {
        payload: {
          qrcode: upiUri,
          upi_string: upiUri
        }
      },
      payment_status: 'PENDING',
      order_id: orderId,
      amount: Number(numericAmount)
    };
  }

  const url = `${CASHFREE_BASE_URL}/orders/sessions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-version': CASHFREE_API_VERSION,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      payment_session_id: paymentSessionId,
      payment_method: {
        upi: {
          channel: 'qrcode'
        }
      }
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || `Cashfree UPI QR generation failed with HTTP ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.details = data;
    throw err;
  }

  return data;
}

/**
 * Generates Mobile UPI Intent deep-link for supported mobile flow
 *
 * @param {Object} params
 * @param {string} params.paymentSessionId - Cashfree payment session ID
 * @param {string} params.orderId - FashionForge order ID
 * @param {number} params.amount - Order amount in INR
 * @returns {Promise<Object>}
 */
async function createUpiIntent({ paymentSessionId, orderId, amount }) {
  const numericAmount = Number(amount || 0).toFixed(2);

  if (!isConfigured()) {
    const cfPaymentId = `cf_intent_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const intentUri = `upi://pay?pa=fashionforge.cashfree@okhdfcbank&pn=FashionForge&tr=${encodeURIComponent(orderId)}&am=${numericAmount}&cu=INR&tn=FashionForge%20Order%20${encodeURIComponent(orderId)}`;
    return {
      cf_payment_id: cfPaymentId,
      payment_method: 'upi',
      channel: 'intent',
      data: {
        payload: {
          intent: intentUri,
          gpay: intentUri,
          phonepe: intentUri,
          paytm: intentUri
        }
      },
      payment_status: 'PENDING'
    };
  }

  const url = `${CASHFREE_BASE_URL}/orders/sessions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-version': CASHFREE_API_VERSION,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      payment_session_id: paymentSessionId,
      payment_method: {
        upi: {
          channel: 'intent'
        }
      }
    })
  });

  return await response.json().catch(() => ({}));
}

/**
 * Retrieves Cashfree order status by order ID
 *
 * @param {string} orderId
 * @returns {Promise<Object>}
 */
async function getCashfreeOrder(orderId) {
  if (!isConfigured()) {
    const mock = mockOrderStore.get(orderId);
    if (!mock) {
      return { order_id: orderId, order_status: 'ACTIVE' };
    }
    return mock;
  }

  const url = `${CASHFREE_BASE_URL}/orders/${encodeURIComponent(orderId)}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getCashfreeHeaders()
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data.message || `Failed to fetch Cashfree order (${response.status})`);
    err.status = response.status;
    throw err;
  }

  return data;
}

/**
 * Retrieves payment attempts for an order from Cashfree
 *
 * @param {string} orderId
 * @returns {Promise<Array>} List of payment attempts
 */
async function getCashfreeOrderPayments(orderId) {
  if (!isConfigured()) {
    const mock = mockOrderStore.get(orderId);
    return mock ? (mock.payments || []) : [];
  }

  const url = `${CASHFREE_BASE_URL}/orders/${encodeURIComponent(orderId)}/payments`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getCashfreeHeaders()
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data.message || `Failed to fetch payments for order (${response.status})`);
    err.status = response.status;
    throw err;
  }

  return Array.isArray(data) ? data : [];
}

/**
 * Authoritatively verifies whether a Cashfree order has succeeded
 * Checks both Order Status (PAID) and Payments list (SUCCESS)
 *
 * @param {string} orderId
 * @returns {Promise<{ isPaid: boolean, isFailed: boolean, paymentId: string|null, paymentMethod: string|null, rawStatus: string }>}
 */
async function getCashfreePaymentStatus(orderId) {
  try {
    const [orderInfo, payments] = await Promise.all([
      getCashfreeOrder(orderId).catch(() => ({})),
      getCashfreeOrderPayments(orderId).catch(() => [])
    ]);

    // Check payments list for SUCCESS or FAILED
    const successfulPayment = payments.find(p => p.payment_status === 'SUCCESS');
    const failedPayment = payments.find(p => ['FAILED', 'USER_DROPPED', 'CANCELLED'].includes(p.payment_status));

    if (successfulPayment || orderInfo.order_status === 'PAID') {
      return {
        isPaid: true,
        isFailed: false,
        paymentId: successfulPayment ? (successfulPayment.cf_payment_id || successfulPayment.payment_id) : (orderInfo.cf_order_id || null),
        paymentMethod: successfulPayment ? (successfulPayment.payment_group || 'upi') : 'online',
        rawStatus: 'PAID'
      };
    }

    if (failedPayment && !successfulPayment) {
      return {
        isPaid: false,
        isFailed: true,
        paymentId: failedPayment.cf_payment_id || null,
        paymentMethod: failedPayment.payment_group || 'upi',
        rawStatus: failedPayment.payment_status
      };
    }

    return {
      isPaid: false,
      isFailed: false,
      paymentId: null,
      paymentMethod: null,
      rawStatus: orderInfo.order_status || 'ACTIVE'
    };
  } catch (error) {
    console.error(`[CashfreeService] Error inspecting status for ${orderId}:`, error.message);
    return {
      isPaid: false,
      isFailed: false,
      paymentId: null,
      paymentMethod: null,
      rawStatus: 'UNKNOWN'
    };
  }
}

/**
 * Verifies Cashfree webhook HMAC-SHA256 signature
 *
 * Verification rule according to Cashfree PG documentation:
 * signedPayload = x-webhook-timestamp + rawBody
 * signature = base64(hmac_sha256(signedPayload, CASHFREE_SECRET_KEY))
 *
 * @param {Object} params
 * @param {string} params.signature - Header 'x-webhook-signature'
 * @param {string} params.timestamp - Header 'x-webhook-timestamp'
 * @param {string} params.rawBody - Exact unparsed raw request body string
 * @param {string} [params.secretKey] - Optional override key (for testing)
 * @returns {boolean} True if signature is valid
 */
function verifyWebhookSignature({ signature, timestamp, rawBody, secretKey }) {
  if (!signature || !timestamp || typeof rawBody !== 'string') {
    return false;
  }

  const keyToUse = secretKey || CASHFREE_SECRET_KEY || 'test_fallback_secret_for_local_testing';
  const signedPayload = `${timestamp}${rawBody}`;
  const computedSignature = crypto
    .createHmac('sha256', keyToUse)
    .update(signedPayload)
    .digest('base64');

  try {
    const signatureBuffer = Buffer.from(signature, 'utf8');
    const computedBuffer = Buffer.from(computedSignature, 'utf8');
    if (signatureBuffer.length !== computedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(signatureBuffer, computedBuffer);
  } catch {
    return false;
  }
}

/**
 * Test helper: injects simulated payment status into the mock store
 * for automated testing of success/failure states at service boundary
 */
function __mockSetPaymentResult(orderId, { status = 'SUCCESS', paymentId, paymentMethod = 'upi' } = {}) {
  const record = mockOrderStore.get(orderId) || {
    order_id: orderId,
    order_status: status === 'SUCCESS' ? 'PAID' : 'ACTIVE',
    payments: []
  };

  const cfPaymentId = paymentId || `cf_test_${Date.now()}`;
  record.order_status = status === 'SUCCESS' ? 'PAID' : 'ACTIVE';
  record.payments = [
    {
      cf_payment_id: cfPaymentId,
      payment_status: status,
      payment_amount: record.order_amount || 0,
      payment_group: paymentMethod,
      payment_time: new Date().toISOString()
    }
  ];
  mockOrderStore.set(orderId, record);
}

module.exports = {
  isConfigured,
  createCashfreeOrder,
  createDynamicUpiQr,
  createUpiIntent,
  getCashfreeOrder,
  getCashfreeOrderPayments,
  getCashfreePaymentStatus,
  verifyWebhookSignature,
  sanitizePhoneNumber,
  mockOrderStore,
  __mockSetPaymentResult,
  CASHFREE_BASE_URL,
  CASHFREE_API_VERSION
};
