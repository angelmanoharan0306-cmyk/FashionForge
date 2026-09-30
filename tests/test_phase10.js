/**
 * FashionForge — Phase 10 Automated Test Suite
 * Tests Cart, Checkout, Authoritative Pricing Security, Payment Simulation,
 * and Cross-User Isolation (Tests A through T).
 */

import mongoose from 'mongoose';
import User from '../backend/models/User.js';
import Design from '../backend/models/Design.js';
import Cart from '../backend/models/Cart.js';
import Order from '../backend/models/Order.js';

const API_ROOT = 'http://localhost:5000';

console.log('====================================================');
console.log('FASHIONFORGE — PHASE 10 CART & CHECKOUT TEST SUITE');
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

// Connect to MongoDB for direct verification and cleanup
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fashionforge';
if (mongoose.connection.readyState === 0) {
  await mongoose.connect(mongoUri);
}

const timestamp = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
const userA_data = {
  name: 'Hubert de Givenchy',
  email: `givenchy_${timestamp}@atelier.test`,
  password: 'AudreyHepburnLBD123!'
};

const userB_data = {
  name: 'Yves Saint Laurent',
  email: `ysl_${timestamp}@atelier.test`,
  password: 'LeSmokingTuxedo456!'
};

let tokenA = null;
let userA_id = null;
let tokenB = null;
let userB_id = null;

let designA1_id = null;
let designA2_id = null;
let designB1_id = null;

let orderA_id = null;

try {
  // Setup Test Users
  console.log('--- Setup: Registering Isolated Test Users ---');
  const regA = await fetch(`${API_ROOT}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(userA_data)
  });
  const dataA = await regA.json();
  tokenA = dataA.token;
  userA_id = dataA.user.userId;

  const regB = await fetch(`${API_ROOT}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(userB_data)
  });
  const dataB = await regB.json();
  tokenB = dataB.token;
  userB_id = dataB.user.userId;

  // Create designs for User A
  const createDesA1 = await fetch(`${API_ROOT}/api/designs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      name: 'Sabrina Evening Gown',
      gender: 'female',
      figure: 'female',
      size: 'M',
      top: 'corset',
      bottom: 'tiered',
      sleeves: 'sleeveless',
      collar: 'sweetheart',
      fabric: 'silk',
      colour: '#111827',
      price: 2400
    })
  });
  const desA1Data = await createDesA1.json();
  designA1_id = desA1Data.id || desA1Data.designId;

  const createDesA2 = await fetch(`${API_ROOT}/api/designs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      name: 'Trapeze Coat Dress',
      gender: 'female',
      figure: 'female',
      size: 'M',
      top: 'blazer',
      bottom: 'pleated',
      sleeves: 'long',
      fabric: 'wool',
      colour: '#c5a059',
      price: 3100
    })
  });
  const desA2Data = await createDesA2.json();
  designA2_id = desA2Data.id || desA2Data.designId;

  // Create design for User B
  const createDesB1 = await fetch(`${API_ROOT}/api/designs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenB}`
    },
    body: JSON.stringify({
      name: 'Rive Gauche Safari Jacket',
      gender: 'male',
      figure: 'male',
      size: 'L',
      top: 'blazer',
      bottom: 'trousers',
      fabric: 'linen',
      colour: '#85583b',
      price: 2850
    })
  });
  const desB1Data = await createDesB1.json();
  designB1_id = desB1Data.id || desB1Data.designId;

  // ---------------------------------------------------------------------------
  // A. AUTHENTICATED USER GETS EMPTY CART
  // ---------------------------------------------------------------------------
  console.log('\n--- A. Authenticated User Gets Empty Cart ---');
  const cartRes = await fetch(`${API_ROOT}/api/cart`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert(cartRes.status === 200, `GET /api/cart returns HTTP 200 (got ${cartRes.status})`);
  const cartData = await cartRes.json();
  assert(cartData.success === true, 'Response indicates success');
  assert(Array.isArray(cartData.cart.items) && cartData.cart.items.length === 0, 'Cart starts with 0 items');
  assert(cartData.cart.subtotal === 0, 'Cart subtotal starts at 0');
  assert(cartData.cart.total === 0, 'Cart total starts at 0');

  // ---------------------------------------------------------------------------
  // B. ADD OWNED DESIGN TO CART
  // ---------------------------------------------------------------------------
  console.log('\n--- B. Add Owned Design to Cart ---');
  const addRes = await fetch(`${API_ROOT}/api/cart/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({ designId: designA1_id, quantity: 1 })
  });
  assert(addRes.status === 201, `POST /api/cart/items returns HTTP 201 (got ${addRes.status})`);
  const addData = await addRes.json();
  assert(addData.cart.items.length === 1, 'Cart has 1 line item');
  const item1 = addData.cart.items[0];
  assert(item1.designId === designA1_id, `Item designId matches (${item1.designId})`);
  assert(item1.designName === 'Sabrina Evening Gown', `Item designName preserved (${item1.designName})`);
  assert(item1.quantity === 1, 'Quantity is 1');
  assert(item1.unitPrice > 0, `Unit price calculated: ₹${item1.unitPrice}`);
  assert(item1.totalPrice === item1.unitPrice, 'totalPrice = unitPrice * 1');
  assert(item1.configuration && item1.configuration.fabric === 'silk', 'Snapshot configuration preserved in cart item');

  // ---------------------------------------------------------------------------
  // C. CANNOT ADD ANOTHER USER'S DESIGN
  // ---------------------------------------------------------------------------
  console.log('\n--- C. Cannot Add Another User\'s Design ---');
  const addForbidden = await fetch(`${API_ROOT}/api/cart/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenB}`
    },
    body: JSON.stringify({ designId: designA1_id, quantity: 1 })
  });
  assert(addForbidden.status === 403, `User B adding User A's design returns HTTP 403 (got ${addForbidden.status})`);
  const forbidData = await addForbidden.json();
  assert(forbidData.success === false, 'Operation rejected');

  // ---------------------------------------------------------------------------
  // D. ADDING SAME DESIGN INCREASES QUANTITY
  // ---------------------------------------------------------------------------
  console.log('\n--- D. Adding Same Design Increases Quantity ---');
  const addAgain = await fetch(`${API_ROOT}/api/cart/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({ designId: designA1_id, quantity: 1 })
  });
  assert(addAgain.status === 200, `Adding same design returns HTTP 200 (got ${addAgain.status})`);
  const addAgainData = await addAgain.json();
  assert(addAgainData.cart.items.length === 1, 'Cart lines count remains 1 (no duplicate row)');
  const itemUpdated = addAgainData.cart.items[0];
  assert(itemUpdated.quantity === 2, `Quantity incremented to 2 (got ${itemUpdated.quantity})`);
  assert(itemUpdated.totalPrice === itemUpdated.unitPrice * 2, `Line total doubled: ₹${itemUpdated.totalPrice}`);

  // ---------------------------------------------------------------------------
  // E. UPDATE QUANTITY
  // ---------------------------------------------------------------------------
  console.log('\n--- E. Update Quantity ---');
  const updateRes = await fetch(`${API_ROOT}/api/cart/items/${itemUpdated.cartItemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({ quantity: 4 })
  });
  assert(updateRes.status === 200, `PUT /api/cart/items/:id returns HTTP 200 (got ${updateRes.status})`);
  const updateData = await updateRes.json();
  const itemMod = updateData.cart.items.find(i => i.cartItemId === itemUpdated.cartItemId);
  assert(itemMod.quantity === 4, `Quantity updated to 4 (got ${itemMod.quantity})`);
  assert(itemMod.totalPrice === itemMod.unitPrice * 4, `Line total matches quantity 4: ₹${itemMod.totalPrice}`);

  // ---------------------------------------------------------------------------
  // F. REMOVE CART ITEM
  // ---------------------------------------------------------------------------
  console.log('\n--- F. Remove Cart Item ---');
  const delRes = await fetch(`${API_ROOT}/api/cart/items/${itemUpdated.cartItemId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert(delRes.status === 200, `DELETE /api/cart/items/:id returns HTTP 200 (got ${delRes.status})`);
  const delData = await delRes.json();
  assert(delData.cart.items.length === 0, 'Item successfully removed, cart now empty');

  // ---------------------------------------------------------------------------
  // G. CLEAR CART
  // ---------------------------------------------------------------------------
  console.log('\n--- G. Clear Cart ---');
  // Add two items first
  await fetch(`${API_ROOT}/api/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({ designId: designA1_id, quantity: 1 })
  });
  await fetch(`${API_ROOT}/api/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({ designId: designA2_id, quantity: 2 })
  });
  const clearRes = await fetch(`${API_ROOT}/api/cart`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert(clearRes.status === 200, `DELETE /api/cart returns HTTP 200 (got ${clearRes.status})`);
  const clearData = await clearRes.json();
  assert(clearData.cart.items.length === 0, 'Cart cleared completely');

  // ---------------------------------------------------------------------------
  // H. CHECKOUT REJECTS EMPTY CART
  // ---------------------------------------------------------------------------
  console.log('\n--- H. Checkout Rejects Empty Cart ---');
  const emptyCheckout = await fetch(`${API_ROOT}/api/orders/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      customer: {
        name: 'Hubert de Givenchy',
        email: userA_data.email,
        phone: '+33 1 42 68 31 00',
        address: '3 Avenue George V',
        city: 'Paris',
        state: 'Île-de-France',
        postalCode: '75008'
      }
    })
  });
  assert(emptyCheckout.status === 400, `Checkout with empty cart rejected with HTTP 400 (got ${emptyCheckout.status})`);
  const emptyCheckData = await emptyCheckout.json();
  assert(emptyCheckData.success === false, 'Error message returned for empty cart');

  // ---------------------------------------------------------------------------
  // I. CHECKOUT VALIDATES CUSTOMER INFORMATION
  // ---------------------------------------------------------------------------
  console.log('\n--- I. Checkout Validates Customer Information ---');
  // Put item back into cart
  await fetch(`${API_ROOT}/api/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({ designId: designA1_id, quantity: 2 })
  });

  const missingCust = await fetch(`${API_ROOT}/api/orders/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      customer: {
        name: 'Hubert de Givenchy'
        // Missing address, email, phone, city, etc.
      }
    })
  });
  assert(missingCust.status === 400, `Incomplete customer info rejected with HTTP 400 (got ${missingCust.status})`);

  // ---------------------------------------------------------------------------
  // J. SERVER CALCULATES CORRECT SUBTOTAL
  // ---------------------------------------------------------------------------
  console.log('\n--- J. Server Calculates Correct Subtotal ---');
  // Add second item (Trapeze Coat Dress)
  await fetch(`${API_ROOT}/api/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({ designId: designA2_id, quantity: 1 })
  });

  const cartCheck = await fetch(`${API_ROOT}/api/cart`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  const currentCart = (await cartCheck.json()).cart;
  const expectedSubtotal = currentCart.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  assert(currentCart.subtotal === expectedSubtotal, `Cart subtotal authoritative calculation matches sum: ₹${currentCart.subtotal}`);

  // ---------------------------------------------------------------------------
  // K. CLIENT CANNOT OVERRIDE TOTAL
  // ---------------------------------------------------------------------------
  console.log('\n--- K. Client Cannot Override Total ---');
  const spoofedCheckout = await fetch(`${API_ROOT}/api/orders/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      total: 1, // Malicious client attempt to pay ₹1
      subtotal: 1,
      customer: {
        name: 'Hubert de Givenchy',
        email: userA_data.email,
        phone: '+33 1 42 68 31 00',
        address: '3 Avenue George V',
        city: 'Paris',
        state: 'Île-de-France',
        postalCode: '75008'
      }
    })
  });
  assert(spoofedCheckout.status === 201, `Checkout created order with HTTP 201 (got ${spoofedCheckout.status})`);
  const orderResData = await spoofedCheckout.json();
  const createdOrder = orderResData.order;
  orderA_id = createdOrder.orderId;

  assert(createdOrder.total !== 1, 'Client spoofed total was IGNORED');
  assert(createdOrder.total === expectedSubtotal, `Authoritative total enforced by server: ₹${createdOrder.total}`);
  assert(createdOrder.subtotal === expectedSubtotal, `Authoritative subtotal enforced: ₹${createdOrder.subtotal}`);

  // ---------------------------------------------------------------------------
  // L. ORDER CREATED FROM AUTHENTICATED USER'S CART
  // ---------------------------------------------------------------------------
  console.log('\n--- L. Order Created From Authenticated User\'s Cart ---');
  const dbOrder = await Order.findOne({ orderId: orderA_id });
  assert(dbOrder !== null, `Order found in MongoDB (${orderA_id})`);
  assert(dbOrder.userId.toString() === userA_id, 'Order belongs to req.user.userId');
  assert(dbOrder.paymentStatus === 'pending', 'Initial paymentStatus is "pending"');
  assert(dbOrder.orderStatus === 'placed', 'Initial orderStatus is "placed"');
  assert(dbOrder.items.length === 2, 'Order has 2 items snapshot matching cart');

  // ---------------------------------------------------------------------------
  // M. CART CLEARED AFTER SUCCESSFUL PAYMENT FLOW
  // ---------------------------------------------------------------------------
  console.log('\n--- M. Cart Cleared After Successful Order Creation/Payment Flow ---');
  // First verify cart is still preserved before payment simulation
  const cartBeforePay = await fetch(`${API_ROOT}/api/cart`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  const cartBeforePayData = await cartBeforePay.json();
  assert(cartBeforePayData.cart.items.length > 0, 'Cart remains intact until payment simulation succeeds');

  // ---------------------------------------------------------------------------
  // N. PAYMENT SIMULATION SUCCESS
  // ---------------------------------------------------------------------------
  console.log('\n--- N. Payment Simulation Success ---');
  const paySuccessRes = await fetch(`${API_ROOT}/api/orders/${orderA_id}/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({ result: 'success' })
  });
  assert(paySuccessRes.status === 200, `POST /api/orders/:id/pay returns HTTP 200 (got ${paySuccessRes.status})`);
  const paySuccessData = await paySuccessRes.json();
  assert(paySuccessData.order.paymentStatus === 'paid', 'paymentStatus transitioned to "paid"');
  assert(paySuccessData.order.orderStatus === 'placed', 'orderStatus is "placed"');

  // Verify cart is now cleared in MongoDB
  const cartAfterPay = await fetch(`${API_ROOT}/api/cart`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  const cartAfterPayData = await cartAfterPay.json();
  assert(cartAfterPayData.cart.items.length === 0, 'Cart was cleared upon successful payment');

  // ---------------------------------------------------------------------------
  // O. PAYMENT SIMULATION FAILURE
  // ---------------------------------------------------------------------------
  console.log('\n--- O. Payment Simulation Failure ---');
  // Create another order to test payment failure
  await fetch(`${API_ROOT}/api/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({ designId: designA1_id, quantity: 1 })
  });
  const order2Res = await fetch(`${API_ROOT}/api/orders/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({
      customer: {
        name: 'Hubert de Givenchy',
        email: userA_data.email,
        phone: '+33 1 42 68 31 00',
        address: '3 Avenue George V',
        city: 'Paris',
        state: 'Île-de-France',
        postalCode: '75008'
      }
    })
  });
  const order2Data = await order2Res.json();
  const orderA2_id = order2Data.order.orderId;

  const payFailRes = await fetch(`${API_ROOT}/api/orders/${orderA2_id}/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({ result: 'failure' })
  });
  assert(payFailRes.status === 200, `Payment failure simulated with HTTP 200 (got ${payFailRes.status})`);
  const payFailData = await payFailRes.json();
  assert(payFailData.order.paymentStatus === 'failed', 'paymentStatus transitioned to "failed"');
  assert(payFailData.order.orderStatus !== 'processing', 'orderStatus does not advance to processing');

  // Verify cart was NOT cleared on failed payment
  const cartAfterFail = await fetch(`${API_ROOT}/api/cart`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  const cartAfterFailData = await cartAfterFail.json();
  assert(cartAfterFailData.cart.items.length === 1, 'Cart remains intact after failed payment so user can retry');

  // ---------------------------------------------------------------------------
  // P. CANNOT PAY ANOTHER USER'S ORDER
  // ---------------------------------------------------------------------------
  console.log('\n--- P. Cannot Pay Another User\'s Order ---');
  const payOtherRes = await fetch(`${API_ROOT}/api/orders/${orderA2_id}/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenB}` // User B attempting to pay User A's order
    },
    body: JSON.stringify({ result: 'success' })
  });
  assert(payOtherRes.status === 403, `User B paying User A's order rejected with HTTP 403 (got ${payOtherRes.status})`);

  // ---------------------------------------------------------------------------
  // Q. CANNOT ACCESS ANOTHER USER'S CART
  // ---------------------------------------------------------------------------
  console.log('\n--- Q. Cannot Access Another User\'s Cart ---');
  const userBCartRes = await fetch(`${API_ROOT}/api/cart`, {
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  const userBCartData = await userBCartRes.json();
  assert(userBCartData.cart.items.length === 0, 'User B cart is isolated and sees 0 items, not User A items');

  // ---------------------------------------------------------------------------
  // R. CANNOT ACCESS ANOTHER USER'S ORDER
  // ---------------------------------------------------------------------------
  console.log('\n--- R. Cannot Access Another User\'s Order ---');
  const getOtherOrder = await fetch(`${API_ROOT}/api/orders/${orderA_id}`, {
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  assert(getOtherOrder.status === 403, `User B reading User A's order rejected with HTTP 403 (got ${getOtherOrder.status})`);

  // ---------------------------------------------------------------------------
  // S. COMPLETE DESIGN CONFIGURATION PRESERVED IN ORDER
  // ---------------------------------------------------------------------------
  console.log('\n--- S. Complete Design Configuration Preserved In Order ---');
  const myOrderRes = await fetch(`${API_ROOT}/api/orders/${orderA_id}`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert(myOrderRes.status === 200, `User A retrieves own order (got ${myOrderRes.status})`);
  const myOrderData = await myOrderRes.json();
  const orderGownItem = myOrderData.order.items.find(i => i.designId === designA1_id);
  assert(orderGownItem !== undefined, 'Order contains item snapshot');
  assert(orderGownItem.configuration !== undefined, 'Item has configuration object');
  assert(orderGownItem.configuration.top === 'corset', `top: ${orderGownItem.configuration.top}`);
  assert(orderGownItem.configuration.bottom === 'tiered', `bottom: ${orderGownItem.configuration.bottom}`);
  assert(orderGownItem.configuration.fabric === 'silk', `fabric: ${orderGownItem.configuration.fabric}`);
  assert(orderGownItem.configuration.colour === '#111827', `colour: ${orderGownItem.configuration.colour}`);

  // ---------------------------------------------------------------------------
  // T. PHASE 9 AUTHENTICATION STILL WORKS
  // ---------------------------------------------------------------------------
  console.log('\n--- T. Phase 9 Authentication Still Works ---');
  const loginRes = await fetch(`${API_ROOT}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userA_data.email,
      password: userA_data.password
    })
  });
  assert(loginRes.status === 200, `POST /api/auth/login returns HTTP 200 (got ${loginRes.status})`);
  const loginData = await loginRes.json();
  assert(typeof loginData.token === 'string', 'Login returns valid JWT');

  const meRes = await fetch(`${API_ROOT}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${loginData.token}` }
  });
  assert(meRes.status === 200, `GET /api/auth/me returns HTTP 200 (got ${meRes.status})`);
  const meData = await meRes.json();
  assert(meData.user.userId === userA_id, 'User profile matches authenticated session');

} catch (err) {
  console.error('[UNEXPECTED ERROR in test_phase10.js]:', err);
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
    console.log('[CLEANUP] Test data cleaned up successfully.');
  } catch (cleanErr) {
    console.warn('[CLEANUP WARNING]:', cleanErr.message);
  }

  await mongoose.disconnect();

  console.log('\n====================================================');
  console.log(`PHASE 10 TEST RESULTS: ${passCount} PASSED | ${failCount} FAILED`);
  console.log('====================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}
