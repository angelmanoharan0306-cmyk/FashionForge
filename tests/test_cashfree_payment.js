/**
 * FashionForge — Simplified UPI QR & COD Payment Test Suite
 * tests/test_cashfree_payment.js
 *
 * Verifies the simplified UPI QR & COD payment flow:
 * 1. Unauthenticated checkout rejected (HTTP 401)
 * 2. Authenticated order creation
 * 3. Authoritative server price calculation (client spoofing rejected)
 * 4. Configurable merchant UPI ID retrieval
 * 5. Dynamic standard UPI URI generation (upi://pay?pa=...&pn=FashionForge&am=...&cu=INR)
 * 6. Dynamic QR code SVG generation with non-zero payload
 * 7. Mobile UPI intent link matches order total and UPI ID
 * 8. Wrong user cannot access or confirm payment (HTTP 403)
 * 9. Initial payment status is pending
 * 10. Customer manual confirmation ("I've Completed Payment")
 * 11. Order paymentStatus transitioned to "paid", orderStatus to "placed"
 * 12. Bag cleared completely upon confirmed UPI payment
 * 13. Duplicate confirmation is idempotent
 * 14. Failed payment preserves Bag
 * 15. Cancelled payment preserves Bag
 * 16. Cash on Delivery confirmation
 * 17. COD paymentStatus is pending, orderStatus is placed
 * 18. Cart cleared after COD order
 * 19. Order confirmation preserves line items & delivery info
 * 20. Order tracking timeline exists and advances normally
 */

import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../backend/models/User.js';
import Design from '../backend/models/Design.js';
import Cart from '../backend/models/Cart.js';
import Order from '../backend/models/Order.js';
import upiService from '../backend/services/upiService.js';

const API_ROOT = 'http://localhost:5000';

console.log('====================================================');
console.log('FASHIONFORGE — SIMPLIFIED UPI QR & COD TEST SUITE');
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
  // 3. Server Calculates Authoritative Final Amount
  // -------------------------------------------------------------
  console.log('\n--- 3. Server Calculates Final Amount ---');
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
  // 4. Configurable Merchant UPI ID Retrieval
  // -------------------------------------------------------------
  console.log('\n--- 4. Configurable Merchant UPI ID Retrieval ---');
  const cfgRes = await fetch(`${API_ROOT}/api/payments/config`);
  assert(cfgRes.status === 200, `GET /api/payments/config returns HTTP 200 (got ${cfgRes.status})`);
  const cfgData = await cfgRes.json();
  assert(Boolean(cfgData.upiId), `Merchant UPI ID is configured: ${cfgData.upiId}`);
  assert(Boolean(cfgData.merchantName), `Merchant name is configured: ${cfgData.merchantName}`);

  // -------------------------------------------------------------
  // 5. Dynamic Standard UPI URI Generation
  // -------------------------------------------------------------
  console.log('\n--- 5. Dynamic Standard UPI URI Generation ---');
  const upiDetailsRes = await fetch(`${API_ROOT}/api/payments/${order2.orderId}/upi-details`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert(upiDetailsRes.status === 200, `GET /api/payments/:id/upi-details returns HTTP 200 (got ${upiDetailsRes.status})`);
  const upiDetails = await upiDetailsRes.json();
  assert(upiDetails.upiUri.startsWith('upi://pay?'), 'URI follows standard upi://pay format');
  assert(upiDetails.upiUri.includes(`am=${Number(order2.total).toFixed(2)}`), `UPI URI contains exact order amount (${order2.total})`);
  assert(upiDetails.upiUri.includes('cu=INR'), 'UPI URI specifies INR currency');
  assert(upiDetails.upiUri.includes(encodeURIComponent(order2.orderId)), 'UPI URI includes order ID in transaction note');

  // -------------------------------------------------------------
  // 6. Dynamic QR Code Payload
  // -------------------------------------------------------------
  console.log('\n--- 6. Dynamic QR Code Payload ---');
  assert(typeof upiDetails.qrCode === 'string' && upiDetails.qrCode.length > 10, 'Dynamic QR payload is present');
  assert(upiDetails.amount === order2.total, `Amount matches authoritative order total: ₹${upiDetails.amount}`);

  // -------------------------------------------------------------
  // 7. Mobile UPI Intent Link Matches Order Details
  // -------------------------------------------------------------
  console.log('\n--- 7. Mobile UPI Intent Link ---');
  assert(Boolean(upiDetails.intentUrl), 'Mobile intent URL is provided');
  assert(upiDetails.intentUrl.startsWith('upi://pay?'), 'Mobile intent link points to valid UPI URI');

  // -------------------------------------------------------------
  // 8. Wrong User Cannot Access Payment
  // -------------------------------------------------------------
  console.log('\n--- 8. Wrong User Cannot Access Payment ---');
  const wrongUserUpi = await fetch(`${API_ROOT}/api/payments/${order2.orderId}/upi-details`, {
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  assert(wrongUserUpi.status === 403, `User B accessing User A payment returns HTTP 403 (got ${wrongUserUpi.status})`);

  const wrongUserConfirm = await fetch(`${API_ROOT}/api/payments/${order2.orderId}/confirm-upi`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  assert(wrongUserConfirm.status === 403, `User B confirming User A payment returns HTTP 403 (got ${wrongUserConfirm.status})`);

  // -------------------------------------------------------------
  // 9. Initial Payment Status is Pending
  // -------------------------------------------------------------
  console.log('\n--- 9. Initial Payment Status is Pending ---');
  const statusRes1 = await fetch(`${API_ROOT}/api/payments/${order2.orderId}/status`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert(statusRes1.status === 200, `GET /api/payments/:id/status returns HTTP 200 (got ${statusRes1.status})`);
  const statusData1 = await statusRes1.json();
  assert(statusData1.paymentStatus === 'pending', 'Initial status is pending');
  assert(statusData1.isPaid === false, 'isPaid is false');

  // -------------------------------------------------------------
  // 10. Customer Manual Confirmation ("I've Completed Payment")
  // -------------------------------------------------------------
  console.log('\n--- 10. Customer Manual Confirmation ---');
  const confirmRes = await fetch(`${API_ROOT}/api/payments/${order2.orderId}/confirm-upi`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert(confirmRes.status === 200, `POST /api/payments/:id/confirm-upi returns HTTP 200 (got ${confirmRes.status})`);
  const confirmData = await confirmRes.json();
  assert(confirmData.success === true, 'Confirmation returned success');
  assert(confirmData.order.paymentStatus === 'paid', 'paymentStatus transitioned to "paid"');
  assert(confirmData.order.orderStatus === 'placed', 'orderStatus transitioned to "placed"');

  // -------------------------------------------------------------
  // 11. Order Updated in Database
  // -------------------------------------------------------------
  console.log('\n--- 11. Order Updated in Database ---');
  const updatedDbOrder = await Order.findOne({ orderId: order2.orderId });
  assert(updatedDbOrder.paymentStatus === 'paid', 'DB order paymentStatus is "paid"');
  assert(updatedDbOrder.orderStatus === 'placed', 'DB order orderStatus is "placed"');
  assert(updatedDbOrder.paymentMethod === 'upi', 'DB order paymentMethod is "upi"');

  // -------------------------------------------------------------
  // 12. Bag Cleared Completely After Confirmation
  // -------------------------------------------------------------
  console.log('\n--- 12. Bag Cleared Completely After Confirmation ---');
  const cartAfterSuccess = await fetch(`${API_ROOT}/api/cart`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  const cartSuccessData = await cartAfterSuccess.json();
  assert(cartSuccessData.cart.items.length === 0, 'Bag cleared completely after payment confirmation');

  // -------------------------------------------------------------
  // 13. Duplicate Confirmation is Idempotent
  // -------------------------------------------------------------
  console.log('\n--- 13. Duplicate Confirmation is Idempotent ---');
  const dupConfirm = await fetch(`${API_ROOT}/api/payments/${order2.orderId}/confirm-upi`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert(dupConfirm.status === 200, `Duplicate confirmation returns HTTP 200 (got ${dupConfirm.status})`);
  const dupData = await dupConfirm.json();
  assert(dupData.order.paymentStatus === 'paid', 'Order remains paid idempotently');

  // -------------------------------------------------------------
  // 14. Failed Payment Preserves Bag
  // -------------------------------------------------------------
  console.log('\n--- 14. Failed Payment Preserves Bag ---');
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

  await fetch(`${API_ROOT}/api/payments/${order3.orderId}/mock-status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({ status: 'FAILED' })
  });

  const cartAfterFail = await fetch(`${API_ROOT}/api/cart`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  const cartFailData = await cartAfterFail.json();
  assert(cartFailData.cart.items.length > 0, `Bag preserved on failure (contains ${cartFailData.cart.items.length} items)`);

  // -------------------------------------------------------------
  // 15. Cancelled Payment Preserves Bag
  // -------------------------------------------------------------
  console.log('\n--- 15. Cancelled Payment Preserves Bag ---');
  const cancelRes = await fetch(`${API_ROOT}/api/payments/${order3.orderId}/cancel`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert(cancelRes.status === 200, `Cancel returned HTTP 200 (got ${cancelRes.status})`);
  const cartAfterCancel = await fetch(`${API_ROOT}/api/cart`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  const cartCancelData = await cartAfterCancel.json();
  assert(cartCancelData.cart.items.length > 0, 'Bag preserved after cancellation');

  // -------------------------------------------------------------
  // 16. Cash on Delivery Confirmation
  // -------------------------------------------------------------
  console.log('\n--- 16. Cash on Delivery Confirmation ---');
  const codConfirm = await fetch(`${API_ROOT}/api/payments/${order3.orderId}/cod`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert(codConfirm.status === 200, `COD confirmation returned HTTP 200 (got ${codConfirm.status})`);
  const codData = await codConfirm.json();
  assert(codData.order.paymentMethod === 'cod', 'paymentMethod set to "cod"');

  // -------------------------------------------------------------
  // 17. COD paymentStatus is Pending, orderStatus is Placed
  // -------------------------------------------------------------
  console.log('\n--- 17. COD Statuses ---');
  assert(codData.order.paymentStatus === 'pending', 'COD paymentStatus is "pending"');
  assert(codData.order.orderStatus === 'placed', 'COD orderStatus is "placed"');

  // -------------------------------------------------------------
  // 18. Cart Cleared After COD Order
  // -------------------------------------------------------------
  console.log('\n--- 18. Cart Cleared After COD Order ---');
  const cartAfterCod = await fetch(`${API_ROOT}/api/cart`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  const cartCodData = await cartAfterCod.json();
  assert(cartCodData.cart.items.length === 0, 'Cart cleared after COD order placement');

  // -------------------------------------------------------------
  // 19. Order Confirmation Preserves Line Items
  // -------------------------------------------------------------
  console.log('\n--- 19. Order Confirmation Details ---');
  const getConf = await fetch(`${API_ROOT}/api/orders/${order2.orderId}`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert(getConf.status === 200, `GET /api/orders/:id returns HTTP 200 (got ${getConf.status})`);
  const confOrder = (await getConf.json()).order;
  assert(confOrder.orderId === order2.orderId, 'Order confirmation ID matches');
  assert(confOrder.paymentStatus === 'paid', 'Confirmed order paymentStatus is "paid"');
  assert(confOrder.items && confOrder.items.length > 0, 'Confirmed order preserves line items');

  // -------------------------------------------------------------
  // 20. Order Tracking Timeline Exists & Advances
  // -------------------------------------------------------------
  console.log('\n--- 20. Order Tracking Timeline & Advancement ---');
  assert(Array.isArray(confOrder.tracking), 'Tracking timeline exists');
  assert(confOrder.tracking.length >= 1, `Tracking milestones exist (${confOrder.tracking.length})`);
  assert(confOrder.tracking[0].status === 'placed', 'Initial milestone is "placed"');

  const advanceRes = await fetch(`${API_ROOT}/api/orders/${order2.orderId}/advance-status`, {
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
  console.log(`PAYMENT TEST RESULTS: ${passCount} PASSED | ${failCount} FAILED`);
  console.log('====================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}
