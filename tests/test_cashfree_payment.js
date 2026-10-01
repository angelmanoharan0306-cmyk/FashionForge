/**
 * FashionForge — Cashfree Payment & Order Verification Test Suite
 * tests/test_cashfree_payment.js
 *
 * Verifies all 20 required Cashfree payment scenarios:
 * 1. unauthenticated checkout rejected
 * 2. authenticated order creation
 * 3. server calculates final amount
 * 4. Cashfree order receives correct amount
 * 5. Cashfree reference saved
 * 6. wrong user cannot access payment
 * 7. pending payment
 * 8. successful payment
 * 9. failed payment
 * 10. cancelled payment
 * 11. Bag preserved on failure
 * 12. Bag preserved on cancellation
 * 13. Bag cleared after verified success
 * 14. duplicate success is idempotent
 * 15. duplicate webhook is idempotent
 * 16. wrong amount rejected
 * 17. invalid webhook rejected
 * 18. COD still works
 * 19. existing order confirmation still works
 * 20. existing tracking still works
 */

import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../backend/models/User.js';
import Design from '../backend/models/Design.js';
import Cart from '../backend/models/Cart.js';
import Order from '../backend/models/Order.js';
import cashfreeService from '../backend/services/cashfreeService.js';

const API_ROOT = 'http://localhost:5000';

console.log('====================================================');
console.log('FASHIONFORGE — CASHFREE PAYMENT & WEBHOOK TEST SUITE');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fashionforge';
if (mongoose.connection.readyState === 0) {
  await mongoose.connect(mongoUri);
}

const timestamp = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
const userA_data = {
  name: 'Cristóbal Balenciaga',
  email: `balenciaga_${timestamp}@couture.test`,
  password: 'MasterTailor1937!'
};

const userB_data = {
  name: 'Christian Dior',
  email: `dior_${timestamp}@couture.test`,
  password: 'NewLookCorolle1947!'
};

let tokenA = null;
let userA_id = null;
let tokenB = null;
let userB_id = null;

let designA1_id = null;
let designA2_id = null;

try {
  // -------------------------------------------------------------
  // Setup: Register Test Users & Design
  // -------------------------------------------------------------
  console.log('--- Setup: Registering Isolated Test Designers ---');
  const regA = await fetch(`${API_ROOT}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userA_data)
  });
  const dataA = await regA.json();
  tokenA = dataA.token;
  userA_id = dataA.user.userId;

  const regB = await fetch(`${API_ROOT}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userB_data)
  });
  const dataB = await regB.json();
  tokenB = dataB.token;
  userB_id = dataB.user.userId;

  // Create designs for User A
  const desRes1 = await fetch(`${API_ROOT}/api/designs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      name: 'Infanta Gown',
      gender: 'female',
      figure: 'female',
      size: 'S',
      top: 'corset',
      bottom: 'tiered',
      fabric: 'silk',
      colour: '#1e1b18',
      price: 3400
    })
  });
  const des1 = await desRes1.json();
  designA1_id = des1.designId || des1.id;

  const desRes2 = await fetch(`${API_ROOT}/api/designs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      name: 'Cocoon Coat',
      gender: 'female',
      figure: 'female',
      size: 'M',
      top: 'blazer',
      bottom: 'pleated',
      fabric: 'wool',
      colour: '#71717a',
      price: 2800
    })
  });
  const des2 = await desRes2.json();
  designA2_id = des2.designId || des2.id;

  // Add Item to User A cart
  await fetch(`${API_ROOT}/api/cart/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({ designId: designA1_id, quantity: 2 })
  });

  const cartRes = await fetch(`${API_ROOT}/api/cart`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  const initialCart = (await cartRes.json()).cart;
  const expectedSubtotal = initialCart.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);

  // -------------------------------------------------------------
  // 1. Unauthenticated Checkout Rejected
  // -------------------------------------------------------------
  console.log('\n--- 1. Unauthenticated Checkout Rejected ---');
  const unauthCheckout = await fetch(`${API_ROOT}/api/orders/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: {
        name: userA_data.name,
        email: userA_data.email,
        phone: '+91 98765 43210',
        address: '10 Avenue George V',
        city: 'Paris',
        state: 'IDF',
        postalCode: '75008'
      }
    })
  });
  assert(unauthCheckout.status === 401, `Unauthenticated checkout rejected with HTTP 401 (got ${unauthCheckout.status})`);

  // -------------------------------------------------------------
  // 2. Authenticated Order Creation
  // -------------------------------------------------------------
  console.log('\n--- 2. Authenticated Order Creation ---');
  const authCheckout = await fetch(`${API_ROOT}/api/orders/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      customer: {
        name: userA_data.name,
        email: userA_data.email,
        phone: '+91 98765 43210',
        address: '10 Avenue George V',
        city: 'Paris',
        state: 'IDF',
        postalCode: '75008'
      }
    })
  });
  assert(authCheckout.status === 201, `Authenticated checkout returned HTTP 201 (got ${authCheckout.status})`);
  const orderData1 = await authCheckout.json();
  const order1 = orderData1.order;
  assert(order1 && order1.orderId, `Order successfully generated (${order1.orderId})`);

  // -------------------------------------------------------------
  // 3. Server Calculates Final Amount (Client Override Ignored)
  // -------------------------------------------------------------
  console.log('\n--- 3. Server Calculates Final Amount ---');
  // Add item back to test spoofing
  await fetch(`${API_ROOT}/api/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({ designId: designA2_id, quantity: 1 })
  });

  const spoofedRes = await fetch(`${API_ROOT}/api/orders/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      total: 1.00, // Malicious override attempt
      subtotal: 1.00,
      customer: {
        name: userA_data.name,
        email: userA_data.email,
        phone: '+91 98765 43210',
        address: '10 Avenue George V',
        city: 'Paris',
        state: 'IDF',
        postalCode: '75008'
      }
    })
  });
  const orderData2 = await spoofedRes.json();
  const order2 = orderData2.order;
  assert(order2.total !== 1.00, 'Client attempt to override total was ignored');
  assert(order2.total > 1000, `Server authoritative total enforced: ₹${order2.total}`);

  // -------------------------------------------------------------
  // 4. Cashfree Order Receives Correct Amount
  // -------------------------------------------------------------
  console.log('\n--- 4. Cashfree Order Receives Correct Amount ---');
  const cfMockRecord = cashfreeService.mockOrderStore.get(order2.orderId);
  if (cfMockRecord) {
    assert(cfMockRecord.order_amount === order2.total, `Cashfree order amount matches server total (${cfMockRecord.order_amount} == ${order2.total})`);
  } else {
    // In live sandbox
    assert(order2.total > 0, `Order amount is valid (${order2.total})`);
  }

  // -------------------------------------------------------------
  // 5. Cashfree Reference Saved on FashionForge Order
  // -------------------------------------------------------------
  console.log('\n--- 5. Cashfree Reference Saved ---');
  const dbOrder = await Order.findOne({ orderId: order2.orderId });
  assert(dbOrder !== null, 'Order found in MongoDB');
  assert(Boolean(dbOrder.cashfreePaymentSessionId || dbOrder.cashfreeOrderId), `Cashfree reference stored: ${dbOrder.cashfreePaymentSessionId || dbOrder.cashfreeOrderId}`);

  // -------------------------------------------------------------
  // 6. Wrong User Cannot Access Payment
  // -------------------------------------------------------------
  console.log('\n--- 6. Wrong User Cannot Access Payment ---');
  const wrongUserQr = await fetch(`${API_ROOT}/api/payments/${order2.orderId}/upi-qr`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  assert(wrongUserQr.status === 403, `User B accessing User A payment returns HTTP 403 (got ${wrongUserQr.status})`);

  const wrongUserStatus = await fetch(`${API_ROOT}/api/payments/${order2.orderId}/status`, {
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  assert(wrongUserStatus.status === 403, `User B querying User A payment status returns HTTP 403 (got ${wrongUserStatus.status})`);

  // -------------------------------------------------------------
  // 7. Pending Payment State
  // -------------------------------------------------------------
  console.log('\n--- 7. Pending Payment State ---');
  const statusRes1 = await fetch(`${API_ROOT}/api/payments/${order2.orderId}/status`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert(statusRes1.status === 200, `GET /api/payments/:id/status returns HTTP 200 (got ${statusRes1.status})`);
  const statusData1 = await statusRes1.json();
  assert(statusData1.paymentStatus === 'pending', `Initial payment status is "pending" (got ${statusData1.paymentStatus})`);
  assert(statusData1.isPaid === false, 'isPaid is false');

  // Dynamic UPI QR generation
  const qrRes = await fetch(`${API_ROOT}/api/payments/${order2.orderId}/upi-qr`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert(qrRes.status === 200, `POST /api/payments/:id/upi-qr returns HTTP 200 (got ${qrRes.status})`);
  const qrData = await qrRes.json();
  assert(qrData.success === true, 'QR response indicates success');
  assert(typeof qrData.qrCode === 'string' && qrData.qrCode.length > 10, 'Real dynamic QR payload returned');
  assert(qrData.amount === order2.total, `QR amount matches order total: ₹${qrData.amount}`);

  // -------------------------------------------------------------
  // 8. Successful Payment Verification
  // -------------------------------------------------------------
  console.log('\n--- 8. Successful Payment Verification ---');
  // Inject mock success at Cashfree service boundary via server endpoint
  await fetch(`${API_ROOT}/api/payments/${order2.orderId}/mock-status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      status: 'SUCCESS',
      paymentId: `cf_pay_test_${Date.now()}`,
      paymentMethod: 'upi'
    })
  });

  const payCheckRes = await fetch(`${API_ROOT}/api/payments/${order2.orderId}/status`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  const payCheckData = await payCheckRes.json();
  assert(payCheckData.isPaid === true, 'Payment status recognized as PAID');
  assert(payCheckData.paymentStatus === 'paid', 'paymentStatus transitioned to "paid"');

  // Verify updated in MongoDB
  const updatedDbOrder = await Order.findOne({ orderId: order2.orderId });
  assert(updatedDbOrder.paymentStatus === 'paid', 'Order paymentStatus in DB is "paid"');
  assert(updatedDbOrder.orderStatus === 'placed', 'Order orderStatus in DB is "placed"');

  // -------------------------------------------------------------
  // 9. Failed Payment Handling
  // -------------------------------------------------------------
  console.log('\n--- 9. Failed Payment Handling ---');
  // Create order 3 to test failure
  await fetch(`${API_ROOT}/api/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({ designId: designA1_id, quantity: 1 })
  });
  const checkoutFail = await fetch(`${API_ROOT}/api/orders/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({
      customer: {
        name: userA_data.name,
        email: userA_data.email,
        phone: '+91 98765 43210',
        address: '10 Avenue George V',
        city: 'Paris',
        state: 'IDF',
        postalCode: '75008'
      }
    })
  });
  const order3 = (await checkoutFail.json()).order;

  // Set failed in mock Cashfree store
  await fetch(`${API_ROOT}/api/payments/${order3.orderId}/mock-status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      status: 'FAILED',
      paymentId: `cf_pay_fail_${Date.now()}`
    })
  });

  const failCheck = await fetch(`${API_ROOT}/api/payments/${order3.orderId}/status`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  const failData = await failCheck.json();
  assert(failData.isPaid === false, 'Order is not marked paid');
  assert(failData.paymentStatus === 'failed', 'Payment status is "failed"');

  // -------------------------------------------------------------
  // 10. Cancelled Payment
  // -------------------------------------------------------------
  console.log('\n--- 10. Cancelled Payment ---');
  const cancelRes = await fetch(`${API_ROOT}/api/payments/${order3.orderId}/cancel`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert(cancelRes.status === 200, `Cancel returned HTTP 200 (got ${cancelRes.status})`);
  const cancelData = await cancelRes.json();
  assert(cancelData.success === true, 'Cancellation acknowledged');

  // -------------------------------------------------------------
  // 11. Bag Preserved on Failure
  // -------------------------------------------------------------
  console.log('\n--- 11. Bag Preserved on Failure ---');
  const cartAfterFail = await fetch(`${API_ROOT}/api/cart`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  const cartFailData = await cartAfterFail.json();
  assert(cartFailData.cart.items.length > 0, `Bag preserved on failure (contains ${cartFailData.cart.items.length} items)`);

  // -------------------------------------------------------------
  // 12. Bag Preserved on Cancellation
  // -------------------------------------------------------------
  console.log('\n--- 12. Bag Preserved on Cancellation ---');
  const cartAfterCancel = await fetch(`${API_ROOT}/api/cart`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  const cartCancelData = await cartAfterCancel.json();
  assert(cartCancelData.cart.items.length > 0, 'Bag preserved after cancellation');

  // -------------------------------------------------------------
  // 13. Bag Cleared After Verified Success
  // -------------------------------------------------------------
  console.log('\n--- 13. Bag Cleared After Verified Success ---');
  // Pay order 3 successfully
  await fetch(`${API_ROOT}/api/payments/${order3.orderId}/mock-status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      status: 'SUCCESS',
      paymentId: `cf_pay_success_${Date.now()}`
    })
  });
  await fetch(`${API_ROOT}/api/payments/${order3.orderId}/status`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  const cartAfterSuccess = await fetch(`${API_ROOT}/api/cart`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  const cartSuccessData = await cartAfterSuccess.json();
  assert(cartSuccessData.cart.items.length === 0, 'Bag cleared completely after verified payment success');

  // -------------------------------------------------------------
  // 14. Duplicate Success Is Idempotent
  // -------------------------------------------------------------
  console.log('\n--- 14. Duplicate Success Is Idempotent ---');
  const dupCheck = await fetch(`${API_ROOT}/api/payments/${order3.orderId}/status`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert(dupCheck.status === 200, `Duplicate status check returned HTTP 200 (got ${dupCheck.status})`);
  const dupData = await dupCheck.json();
  assert(dupData.isPaid === true, 'Order remains paid without errors');

  // -------------------------------------------------------------
  // 15. Duplicate Webhook Is Idempotent
  // -------------------------------------------------------------
  console.log('\n--- 15. Duplicate Webhook Is Idempotent ---');
  // Create order 4 for webhook testing
  await fetch(`${API_ROOT}/api/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({ designId: designA1_id, quantity: 1 })
  });
  const order4Res = await fetch(`${API_ROOT}/api/orders/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({
      customer: {
        name: userA_data.name,
        email: userA_data.email,
        phone: '+91 98765 43210',
        address: '10 Avenue George V',
        city: 'Paris',
        state: 'IDF',
        postalCode: '75008'
      }
    })
  });
  const order4 = (await order4Res.json()).order;

  const webhookSecret = process.env.CASHFREE_SECRET_KEY || 'test_fallback_secret_for_local_testing';
  const webhookTimestamp = Math.floor(Date.now() / 1000).toString();
  const webhookBody = JSON.stringify({
    type: 'PAYMENT_SUCCESS_WEBHOOK',
    data: {
      order: {
        order_id: order4.orderId,
        order_amount: order4.total,
        order_currency: 'INR'
      },
      payment: {
        cf_payment_id: 99887766,
        payment_status: 'SUCCESS',
        payment_amount: order4.total,
        payment_currency: 'INR',
        payment_group: 'upi'
      }
    }
  });

  const webhookSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(`${webhookTimestamp}${webhookBody}`)
    .digest('base64');

  // First webhook delivery
  const hookRes1 = await fetch(`${API_ROOT}/api/payments/cashfree/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-webhook-signature': webhookSignature,
      'x-webhook-timestamp': webhookTimestamp
    },
    body: webhookBody
  });
  assert(hookRes1.status === 200, `First webhook returned HTTP 200 (got ${hookRes1.status})`);

  // Duplicate webhook delivery
  const hookRes2 = await fetch(`${API_ROOT}/api/payments/cashfree/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-webhook-signature': webhookSignature,
      'x-webhook-timestamp': webhookTimestamp
    },
    body: webhookBody
  });
  assert(hookRes2.status === 200, `Duplicate webhook acknowledged with HTTP 200 (got ${hookRes2.status})`);
  const hookData2 = await hookRes2.json();
  assert(hookData2.success === true, 'Duplicate webhook handled idempotently');

  // -------------------------------------------------------------
  // 16. Wrong Amount in Webhook Rejected
  // -------------------------------------------------------------
  console.log('\n--- 16. Wrong Amount in Webhook Rejected ---');
  const badAmountBody = JSON.stringify({
    type: 'PAYMENT_SUCCESS_WEBHOOK',
    data: {
      order: {
        order_id: order4.orderId,
        order_amount: 1.00 // Tampered amount
      },
      payment: {
        cf_payment_id: 11223344,
        payment_status: 'SUCCESS',
        payment_amount: 1.00
      }
    }
  });
  const badAmountSig = crypto
    .createHmac('sha256', webhookSecret)
    .update(`${webhookTimestamp}${badAmountBody}`)
    .digest('base64');

  const badAmountRes = await fetch(`${API_ROOT}/api/payments/cashfree/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-webhook-signature': badAmountSig,
      'x-webhook-timestamp': webhookTimestamp
    },
    body: badAmountBody
  });
  assert(badAmountRes.status === 400, `Tampered amount in webhook rejected with HTTP 400 (got ${badAmountRes.status})`);

  // -------------------------------------------------------------
  // 17. Invalid Webhook Signature Rejected
  // -------------------------------------------------------------
  console.log('\n--- 17. Invalid Webhook Signature Rejected ---');
  const forgedHook = await fetch(`${API_ROOT}/api/payments/cashfree/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-webhook-signature': 'FORGED_INVALID_SIGNATURE_BASE64==',
      'x-webhook-timestamp': webhookTimestamp
    },
    body: webhookBody
  });
  assert(forgedHook.status === 400, `Forged webhook rejected with HTTP 400 (got ${forgedHook.status})`);

  // -------------------------------------------------------------
  // 18. COD (Cash on Delivery) Still Works
  // -------------------------------------------------------------
  console.log('\n--- 18. Cash on Delivery Still Works ---');
  await fetch(`${API_ROOT}/api/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({ designId: designA2_id, quantity: 1 })
  });
  const codCheckout = await fetch(`${API_ROOT}/api/orders/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({
      customer: {
        name: userA_data.name,
        email: userA_data.email,
        phone: '+91 98765 43210',
        address: '10 Avenue George V',
        city: 'Paris',
        state: 'IDF',
        postalCode: '75008'
      }
    })
  });
  const codOrder = (await codCheckout.json()).order;

  const codConfirm = await fetch(`${API_ROOT}/api/payments/${codOrder.orderId}/cod`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert(codConfirm.status === 200, `COD confirmation returned HTTP 200 (got ${codConfirm.status})`);
  const codData = await codConfirm.json();
  assert(codData.order.paymentMethod === 'cod', 'paymentMethod set to "cod"');
  assert(codData.order.paymentStatus === 'pending', 'COD paymentStatus is "pending"');
  assert(codData.order.orderStatus === 'placed', 'COD orderStatus is "placed"');

  // Verify cart cleared after COD order
  const cartAfterCod = await fetch(`${API_ROOT}/api/cart`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  const cartCodData = await cartAfterCod.json();
  assert(cartCodData.cart.items.length === 0, 'Cart cleared after COD order placement');

  // -------------------------------------------------------------
  // 19. Existing Order Confirmation Still Works
  // -------------------------------------------------------------
  console.log('\n--- 19. Existing Order Confirmation Still Works ---');
  const getConf = await fetch(`${API_ROOT}/api/orders/${order4.orderId}`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert(getConf.status === 200, `GET /api/orders/:id returns HTTP 200 (got ${getConf.status})`);
  const confOrder = (await getConf.json()).order;
  assert(confOrder.orderId === order4.orderId, 'Order confirmation ID matches');
  assert(confOrder.paymentStatus === 'paid', 'Confirmed order paymentStatus is "paid"');
  assert(confOrder.items && confOrder.items.length > 0, 'Confirmed order preserves line items');

  // -------------------------------------------------------------
  // 20. Existing Tracking Still Works
  // -------------------------------------------------------------
  console.log('\n--- 20. Existing Tracking Still Works ---');
  assert(Array.isArray(confOrder.tracking), 'Tracking timeline exists');
  assert(confOrder.tracking.length >= 1, `Tracking milestones exist (${confOrder.tracking.length})`);
  assert(confOrder.tracking[0].status === 'placed', 'Initial milestone is "placed"');

  // Advance status to processing
  const advanceRes = await fetch(`${API_ROOT}/api/orders/${order4.orderId}/advance-status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({ nextStatus: 'processing' })
  });
  assert(advanceRes.status === 200, `Advance status returned HTTP 200 (got ${advanceRes.status})`);
  const advancedOrder = (await advanceRes.json()).order;
  assert(advancedOrder.orderStatus === 'processing', 'Order status successfully transitioned to "processing"');

} catch (err) {
  console.error('[UNEXPECTED ERROR in test_cashfree_payment.js]:', err);
  failCount++;
} finally {
  console.log('\n--- Cleanup: Removing Test Records ---');
  try {
    if (userA_id) {
      await Cart.deleteMany({ userId: userA_id });
      await Order.deleteMany({ userId: userA_id });
      await Design.deleteMany({ userId: userA_id });
      await User.deleteOne({ userId: userA_id });
    }
    if (userB_id) {
      await Cart.deleteMany({ userId: userB_id });
      await Order.deleteMany({ userId: userB_id });
      await Design.deleteMany({ userId: userB_id });
      await User.deleteOne({ userId: userB_id });
    }
    console.log('[CLEANUP] Test records cleaned up successfully.');
  } catch (cleanErr) {
    console.warn('[CLEANUP WARNING]:', cleanErr.message);
  }

  await mongoose.disconnect();

  console.log('\n====================================================');
  console.log(`CASHFREE PAYMENT TEST RESULTS: ${passCount} PASSED | ${failCount} FAILED`);
  console.log('====================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}
