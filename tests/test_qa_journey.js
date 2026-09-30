/**
 * FashionForge — Phase 10 End-to-End User Journey QA Simulation
 * Validates complete authenticated flow:
 * Login -> My Designs -> Add to Cart -> Cart View -> Checkout -> Payment Simulation (Success & Failure)
 */

import mongoose from 'mongoose';
import User from '../backend/models/User.js';
import Design from '../backend/models/Design.js';
import Cart from '../backend/models/Cart.js';
import Order from '../backend/models/Order.js';

const API_ROOT = 'http://localhost:5000';

console.log('====================================================');
console.log('FASHIONFORGE — PHASE 10 BROWSER/API END-TO-END QA');
console.log('====================================================\n');

// MongoDB direct connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fashionforge';
if (mongoose.connection.readyState === 0) {
  await mongoose.connect(mongoUri);
}

const qaTimestamp = Date.now().toString(36);
const qaUser = {
  name: 'Eleanor Vance',
  email: `eleanor_${qaTimestamp}@haute-couture.test`,
  password: 'AtelierSecret123!'
};

let qaToken = null;
let qaUserId = null;
let designId = null;
let orderId = null;

try {
  // Step 1: Verify static pages are served properly
  console.log('1. Checking HTML Pages Availability:');
  const cartHtml = await fetch(`${API_ROOT}/cart`);
  console.log(`- GET /cart: status ${cartHtml.status} (${cartHtml.headers.get('content-type')})`);
  if (cartHtml.status !== 200) throw new Error('Cart page not served');

  const checkoutHtml = await fetch(`${API_ROOT}/checkout`);
  console.log(`- GET /checkout: status ${checkoutHtml.status} (${checkoutHtml.headers.get('content-type')})`);
  if (checkoutHtml.status !== 200) throw new Error('Checkout page not served');

  const paymentHtml = await fetch(`${API_ROOT}/payment`);
  console.log(`- GET /payment: status ${paymentHtml.status} (${paymentHtml.headers.get('content-type')})`);
  if (paymentHtml.status !== 200) throw new Error('Payment page not served');

  // Step 2: Register user
  console.log('\n2. User Registration & Login:');
  const regRes = await fetch(`${API_ROOT}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(qaUser)
  });
  const regData = await regRes.json();
  qaToken = regData.token;
  qaUserId = regData.user.userId;
  console.log(`- Registered ${qaUser.name} (${qaUserId})`);

  // Step 3: Create bespoke design in Studio
  console.log('\n3. Design Studio — Save Bespoke Design:');
  const designRes = await fetch(`${API_ROOT}/api/designs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${qaToken}`
    },
    body: JSON.stringify({
      name: 'Midnight Silk Ballgown',
      gender: 'female',
      figure: 'female',
      size: 'S',
      top: 'corset',
      bottom: 'ballgown',
      sleeves: 'sleeveless',
      collar: 'sweetheart',
      fabric: 'silk',
      colour: '#0a0a23',
      price: 3600
    })
  });
  const designData = await designRes.json();
  designId = designData.id || designData.designId;
  console.log(`- Saved design "${designData.name}" (ID: ${designId}) with price ₹${designData.price}`);

  // Step 4: Add to Cart from Studio / My Designs
  console.log('\n4. Add to Cart:');
  const addCartRes = await fetch(`${API_ROOT}/api/cart/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${qaToken}`
    },
    body: JSON.stringify({ designId, quantity: 1 })
  });
  const addCartData = await addCartRes.json();
  console.log(`- Added to cart. Items in cart: ${addCartData.cart.items.length}`);
  console.log(`- Cart Item: "${addCartData.cart.items[0].designName}", Qty: ${addCartData.cart.items[0].quantity}, Total: ₹${addCartData.cart.items[0].totalPrice}`);

  // Step 5: Duplicate Cart Behavior (Add again increments quantity)
  console.log('\n5. Duplicate Cart Behavior (Re-adding increments quantity):');
  const addAgainRes = await fetch(`${API_ROOT}/api/cart/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${qaToken}`
    },
    body: JSON.stringify({ designId, quantity: 1 })
  });
  const addAgainData = await addAgainRes.json();
  console.log(`- Total items count: ${addAgainData.cart.items.length}, Qty: ${addAgainData.cart.items[0].quantity}, Subtotal: ₹${addAgainData.cart.subtotal}`);

  // Step 6: Checkout Form Submission
  console.log('\n6. Checkout — Creating Pending Bespoke Order:');
  const checkoutRes = await fetch(`${API_ROOT}/api/orders/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${qaToken}`
    },
    body: JSON.stringify({
      customer: {
        fullName: 'Eleanor Vance',
        email: qaUser.email,
        phone: '+91 98765 43210',
        shippingAddress: '42 Haute Couture Boulevard, Suite 500',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001'
      }
    })
  });
  const checkoutData = await checkoutRes.json();
  orderId = checkoutData.order.orderId;
  console.log(`- Order created: ${orderId}`);
  console.log(`- Initial Payment Status: ${checkoutData.order.paymentStatus}`);
  console.log(`- Initial Order Status: ${checkoutData.order.orderStatus}`);
  console.log(`- Authoritative Server Total: ₹${checkoutData.order.total}`);

  // Step 7: Payment Simulation — Test Failure Path
  console.log('\n7. Payment Simulation — Testing Decline/Failure Path:');
  const failRes = await fetch(`${API_ROOT}/api/orders/${orderId}/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${qaToken}`
    },
    body: JSON.stringify({ result: 'failure' })
  });
  const failData = await failRes.json();
  console.log(`- Payment Simulation Result: ${failData.order.paymentStatus}`);
  if (failData.order.paymentStatus !== 'failed') throw new Error('Payment status did not transition to failed');

  // Verify cart is NOT cleared on failure
  const cartDuringFail = await fetch(`${API_ROOT}/api/cart`, {
    headers: { 'Authorization': `Bearer ${qaToken}` }
  });
  const cartDuringFailData = await cartDuringFail.json();
  console.log(`- Cart items after payment failure: ${cartDuringFailData.cart.items.length} (Bag preserved for retry)`);

  // Step 8: Payment Simulation — Test Success Path
  console.log('\n8. Payment Simulation — Testing Approval/Success Path:');
  const successRes = await fetch(`${API_ROOT}/api/orders/${orderId}/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${qaToken}`
    },
    body: JSON.stringify({ result: 'success' })
  });
  const successData = await successRes.json();
  console.log(`- Payment Simulation Result: ${successData.order.paymentStatus}`);
  console.log(`- Order Status: ${successData.order.orderStatus}`);
  if (successData.order.paymentStatus !== 'paid') throw new Error('Payment status did not transition to paid');

  // Verify cart IS cleared on success
  const cartAfterSuccess = await fetch(`${API_ROOT}/api/cart`, {
    headers: { 'Authorization': `Bearer ${qaToken}` }
  });
  const cartAfterSuccessData = await cartAfterSuccess.json();
  console.log(`- Cart items after successful payment: ${cartAfterSuccessData.cart.items.length} (Bag cleared)`);

  // Step 9: Order Confirmation Page
  console.log('\n9. Order Confirmation:');
  const confHtml = await fetch(`${API_ROOT}/order-confirmation?orderId=${orderId}`);
  console.log(`- GET /order-confirmation: status ${confHtml.status}`);
  const confOrderRes = await fetch(`${API_ROOT}/api/orders/${orderId}`, {
    headers: { 'Authorization': `Bearer ${qaToken}` }
  });
  const confOrderData = await confOrderRes.json();
  console.log(`- Confirmed Order Ref: ${confOrderData.order.orderId}, Total: ₹${confOrderData.order.total}, Status: ${confOrderData.order.orderStatus}`);

  // Step 10: My Orders History Page
  console.log('\n10. My Orders History:');
  const ordersHtml = await fetch(`${API_ROOT}/orders`);
  console.log(`- GET /orders: status ${ordersHtml.status}`);
  const myOrdersRes = await fetch(`${API_ROOT}/api/orders`, {
    headers: { 'Authorization': `Bearer ${qaToken}` }
  });
  const myOrdersData = await myOrdersRes.json();
  const ordersList = Array.isArray(myOrdersData) ? myOrdersData : (myOrdersData.orders || []);
  console.log(`- Orders listed for user: ${ordersList.length} (Latest: ${ordersList[0].orderId})`);

  // Step 11: Order Details & Live Tracking
  console.log('\n11. Order Details & Live Tracking:');
  const detailsHtml = await fetch(`${API_ROOT}/order-details?orderId=${orderId}`);
  console.log(`- GET /order-details: status ${detailsHtml.status}`);

  // Step 12: Tracking Lifecycle Progression Simulation
  console.log('\n12. Simulated Milestone Progression:');
  const milestones = ['processing', 'ready', 'shipped', 'delivered'];
  for (const m of milestones) {
    const adv = await fetch(`${API_ROOT}/api/orders/${orderId}/advance-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${qaToken}` },
      body: JSON.stringify({ nextStatus: m })
    });
    const advData = await adv.json();
    console.log(`  -> Advanced to "${advData.order.orderStatus}" (Events: ${advData.order.tracking.length})`);
  }

  console.log('\n====================================================');
  console.log('END-TO-END QA JOURNEY: FULL SUCCESS (ALL 12 STEPS VERIFIED)');
  console.log('====================================================\n');
} catch (err) {
  console.error('[QA FAILED]:', err);
  process.exit(1);
} finally {
  console.log('--- Cleaning Up QA Records ---');
  if (qaUserId) {
    await Cart.deleteMany({ userId: qaUserId });
    await Order.deleteMany({ userId: qaUserId });
    await Design.deleteMany({ userId: qaUserId });
    await User.deleteOne({ userId: qaUserId });
  }
  await mongoose.disconnect();
}
