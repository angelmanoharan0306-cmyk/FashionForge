/**
 * FashionForge — Complete Workflow & Navigation Verification Suite
 * tests/test_workflow.js
 *
 * Validates the complete user journey:
 * 1. Page Availability (Home, Studio, My Designs, Bag/Cart, Checkout, Payment, Confirmation, Orders, Order Details)
 * 2. API/Data Workflow (Register, Create Design, Save Design, Add to Bag, Retrieve Cart,
 *    Checkout, Payment Failure -> verify failed order & cart preserved,
 *    Payment Success -> verify paid order & cart cleared,
 *    Confirmation Order, My Orders, Order Details, Advance Tracking to Delivered)
 */

import assert from 'node:assert';
import mongoose from 'mongoose';
import User from '../backend/models/User.js';
import Design from '../backend/models/Design.js';
import Cart from '../backend/models/Cart.js';
import Order from '../backend/models/Order.js';

const API_ROOT = process.env.API_BASE_URL
  ? process.env.API_BASE_URL.replace('/api/designs', '')
  : 'http://localhost:5000';

console.log('====================================================');
console.log('FASHIONFORGE — COMPLETE APPLICATION WORKFLOW SUITE');
console.log('====================================================\n');

// Connect to MongoDB directly for validation and cleanup
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fashionforge';
if (mongoose.connection.readyState === 0) {
  await mongoose.connect(mongoUri);
}

const testRunId = Date.now().toString(36);
const testUser = {
  name: 'Gabrielle Chanel',
  email: `coco_${testRunId}@atelier.test`,
  password: 'AtelierSecurePassword123!'
};

let authToken = null;
let userId = null;
let savedDesignId = null;
let failedOrderId = null;
let successOrderId = null;

try {
  // ===========================================================================
  // PART 1: PAGE ACCESSIBILITY & ROUTE SERVING (STEPS 1 - 9)
  // ===========================================================================
  console.log('--- Part 1: Page Availability & Routing ---');

  // 1. Home page available
  const resHome = await fetch(`${API_ROOT}/`);
  assert(resHome.status === 200, `Step 1: Home page (/) returns HTTP 200 (got ${resHome.status})`);
  const textHome = await resHome.text();
  assert(textHome.includes('FashionForge'), 'Home page contains FashionForge brand');
  console.log('[PASS] 1. Home page available');

  // 2. Design Studio available
  const resDesign = await fetch(`${API_ROOT}/design`);
  assert(resDesign.status === 200, `Step 2: Design Studio (/design) returns HTTP 200 (got ${resDesign.status})`);
  const textDesign = await resDesign.text();
  assert(textDesign.includes('Design Studio'), 'Design Studio page contains studio workspace');
  console.log('[PASS] 2. Design Studio available');

  // 3. My Designs available
  const resMyDesigns = await fetch(`${API_ROOT}/my-designs`);
  assert(resMyDesigns.status === 200, `Step 3: My Designs (/my-designs) returns HTTP 200 (got ${resMyDesigns.status})`);
  const textMyDesigns = await resMyDesigns.text();
  assert(textMyDesigns.includes('My Saved Designs') || textMyDesigns.includes('Atelier Portfolio'), 'My Designs page rendered');
  console.log('[PASS] 3. My Designs available');

  // 4. Bag/Cart available
  const resCart = await fetch(`${API_ROOT}/cart`);
  assert(resCart.status === 200, `Step 4: Bag/Cart (/cart) returns HTTP 200 (got ${resCart.status})`);
  const textCart = await resCart.text();
  assert(textCart.includes('Bag') || textCart.includes('Cart'), 'Shopping bag page rendered');
  const resBag = await fetch(`${API_ROOT}/bag`);
  assert(resBag.status === 200, `Step 4b: Bag alias (/bag) returns HTTP 200 (got ${resBag.status})`);
  console.log('[PASS] 4. Bag/Cart available (both /cart and /bag routes)');

  // 5. Checkout available
  const resCheckout = await fetch(`${API_ROOT}/checkout`);
  assert(resCheckout.status === 200, `Step 5: Checkout (/checkout) returns HTTP 200 (got ${resCheckout.status})`);
  const textCheckout = await resCheckout.text();
  assert(textCheckout.includes('Checkout'), 'Checkout page rendered');
  console.log('[PASS] 5. Checkout available');

  // 6. Payment available
  const resPayment = await fetch(`${API_ROOT}/payment`);
  assert(resPayment.status === 200, `Step 6: Payment (/payment) returns HTTP 200 (got ${resPayment.status})`);
  const textPayment = await resPayment.text();
  assert(textPayment.includes('Payment') && textPayment.includes('Payment Method'), 'Payment page rendered');
  console.log('[PASS] 6. Payment available');

  // 7. Order Confirmation available
  const resConfirmation = await fetch(`${API_ROOT}/order-confirmation`);
  assert(resConfirmation.status === 200, `Step 7: Order Confirmation (/order-confirmation) returns HTTP 200 (got ${resConfirmation.status})`);
  const textConfirmation = await resConfirmation.text();
  assert(textConfirmation.includes('Order Confirmation'), 'Order confirmation page rendered');
  console.log('[PASS] 7. Order Confirmation available');

  // 8. My Orders available
  const resOrders = await fetch(`${API_ROOT}/orders`);
  assert(resOrders.status === 200, `Step 8: My Orders (/orders) returns HTTP 200 (got ${resOrders.status})`);
  const textOrders = await resOrders.text();
  assert(textOrders.includes('My Orders') || textOrders.includes('Orders'), 'My Orders page rendered');
  console.log('[PASS] 8. My Orders available');

  // 9. Order Details available
  const resDetails = await fetch(`${API_ROOT}/order-details`);
  assert(resDetails.status === 200, `Step 9: Order Details (/order-details) returns HTTP 200 (got ${resDetails.status})`);
  const textDetails = await resDetails.text();
  assert(textDetails.includes('Order Details') || textDetails.includes('Tracking'), 'Order Details page rendered');
  console.log('[PASS] 9. Order Details available');

  // ===========================================================================
  // PART 2: API & DATA WORKFLOW (STEPS 10 - 26)
  // ===========================================================================
  console.log('\n--- Part 2: End-to-End User & Data Workflow ---');

  // 10. Register / Login
  const regRes = await fetch(`${API_ROOT}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });
  assert(regRes.status === 201, `Step 10: Registration returns HTTP 201 (got ${regRes.status})`);
  const regData = await regRes.json();
  assert(typeof regData.token === 'string', 'Received JWT token');
  authToken = regData.token;
  userId = regData.user.userId;

  const loginRes = await fetch(`${API_ROOT}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUser.email, password: testUser.password })
  });
  assert(loginRes.status === 200, `Step 10b: Login returns HTTP 200 (got ${loginRes.status})`);
  console.log(`[PASS] 10. Register & Login successful (${testUser.name}, userId: ${userId})`);

  // 11. Create Design
  const designPayload = {
    name: 'Little Black Tweed Dress',
    gender: 'female',
    figure: 'female',
    croquis: 'female',
    size: 'M',
    top: 'tunic',
    bottom: 'pencil',
    sleeves: 'short',
    collar: 'round',
    neckline: 'round',
    fabric: 'cotton',
    colour: '#111827',
    pattern: 'solid',
    notes: 'Iconic bespoke tailored tweed sheath.',
    price: 3400
  };
  console.log('[PASS] 11. Create Design payload constructed');

  // 12. Save Design
  const saveRes = await fetch(`${API_ROOT}/api/designs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(designPayload)
  });
  assert(saveRes.status === 201, `Step 12: Save Design returns HTTP 201 (got ${saveRes.status})`);
  const savedDesign = await saveRes.json();
  savedDesignId = savedDesign.designId || savedDesign.id;
  assert(typeof savedDesignId === 'string', `Saved design ID generated: ${savedDesignId}`);
  assert(savedDesign.name === designPayload.name, 'Design name persisted accurately');
  console.log(`[PASS] 12. Save Design persisted in MongoDB (id: ${savedDesignId})`);

  // 13. Add Design to Cart
  const addCartRes = await fetch(`${API_ROOT}/api/cart/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ designId: savedDesignId, quantity: 2 })
  });
  assert(addCartRes.status === 201, `Step 13: Add to Cart returns HTTP 201 (got ${addCartRes.status})`);
  const addCartData = await addCartRes.json();
  assert(addCartData.success === true, 'Item successfully added to cart');
  console.log('[PASS] 13. Add Design to Bag');

  // 14. Retrieve Cart
  const getCartRes = await fetch(`${API_ROOT}/api/cart`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  assert(getCartRes.status === 200, `Step 14: Retrieve Cart returns HTTP 200 (got ${getCartRes.status})`);
  const cartData = await getCartRes.json();
  const cart = cartData.cart || cartData;
  assert(Array.isArray(cart.items) && cart.items.length === 1, `Cart has 1 line item (got ${cart.items.length})`);
  assert(cart.items[0].quantity === 2, `Cart item quantity is 2 (got ${cart.items[0].quantity})`);
  assert(cart.subtotal === 6800, `Cart subtotal matches 2 x ₹3400 = ₹6800 (got ₹${cart.subtotal})`);
  console.log(`[PASS] 14. Retrieve Cart (1 line item, qty 2, subtotal: ₹${cart.subtotal})`);

  // 15. Checkout
  const customerInfo = {
    name: 'Gabrielle Chanel',
    email: testUser.email,
    phone: '+33 1 42 86 28 00',
    address: '31 Rue Cambon',
    city: 'Paris',
    state: 'Île-de-France',
    postalCode: '75001'
  };

  const checkoutRes = await fetch(`${API_ROOT}/api/orders/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ customer: customerInfo })
  });
  assert(checkoutRes.status === 201, `Step 15: Checkout returns HTTP 201 (got ${checkoutRes.status})`);
  const checkoutData = await checkoutRes.json();
  failedOrderId = checkoutData.order ? checkoutData.order.orderId : checkoutData.orderId;
  assert(typeof failedOrderId === 'string', `Order created for testing: ${failedOrderId}`);
  console.log(`[PASS] 15. Checkout created pending order (${failedOrderId})`);

  // 16. Payment Failure Simulation
  const failPayRes = await fetch(`${API_ROOT}/api/orders/${failedOrderId}/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ result: 'failure' })
  });
  assert(failPayRes.status === 200, `Step 16: Payment simulation failure returns HTTP 200 (got ${failPayRes.status})`);
  const failData = await failPayRes.json();
  console.log('[PASS] 16. Payment failure simulated');

  // 17. Verify Failed Order
  const verifyFailedOrder = await Order.findOne({ orderId: failedOrderId });
  assert(verifyFailedOrder.paymentStatus === 'failed', `Order paymentStatus transitioned to "failed" (got ${verifyFailedOrder.paymentStatus})`);
  assert(verifyFailedOrder.orderStatus === 'placed', 'OrderStatus remains "placed"');
  console.log('[PASS] 17. Verify failed order status');

  // 18. Verify Cart Preserved after Failure
  const cartAfterFailRes = await fetch(`${API_ROOT}/api/cart`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const cartAfterFailData = await cartAfterFailRes.json();
  const cartAfterFail = cartAfterFailData.cart || cartAfterFailData;
  assert(cartAfterFail.items && cartAfterFail.items.length === 1, 'Cart items preserved following payment decline');
  console.log('[PASS] 18. Verify cart preserved after payment failure');

  // Create second checkout order for successful payment
  const checkoutSuccessRes = await fetch(`${API_ROOT}/api/orders/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ customer: customerInfo })
  });
  const checkoutSuccessData = await checkoutSuccessRes.json();
  successOrderId = checkoutSuccessData.order ? checkoutSuccessData.order.orderId : checkoutSuccessData.orderId;

  // 19. Payment Success Simulation
  const successPayRes = await fetch(`${API_ROOT}/api/orders/${successOrderId}/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ result: 'success' })
  });
  assert(successPayRes.status === 200, `Step 19: Payment simulation success returns HTTP 200 (got ${successPayRes.status})`);
  console.log('[PASS] 19. Payment success simulated');

  // 20. Verify Order Paid
  const verifySuccessOrder = await Order.findOne({ orderId: successOrderId });
  assert(verifySuccessOrder.paymentStatus === 'paid', `Order paymentStatus is "paid" (got ${verifySuccessOrder.paymentStatus})`);
  assert(verifySuccessOrder.orderStatus === 'placed', 'Order orderStatus is "placed"');
  console.log('[PASS] 20. Verify order paid');

  // 21. Verify Cart Cleared
  const cartAfterSuccessRes = await fetch(`${API_ROOT}/api/cart`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const cartAfterSuccessData = await cartAfterSuccessRes.json();
  const cartAfterSuccess = cartAfterSuccessData.cart || cartAfterSuccessData;
  assert(cartAfterSuccess.items && cartAfterSuccess.items.length === 0, 'Cart is cleared following successful payment');
  console.log('[PASS] 21. Verify cart cleared');

  // 22. Retrieve Confirmation Order
  const confOrderRes = await fetch(`${API_ROOT}/api/orders/${successOrderId}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  assert(confOrderRes.status === 200, `Step 22: Retrieve confirmation order returns HTTP 200 (got ${confOrderRes.status})`);
  const confOrderData = await confOrderRes.json();
  const confOrder = confOrderData.order || confOrderData;
  assert(confOrder.orderId === successOrderId, 'Retrieved confirmation order matches ID');
  assert(confOrder.paymentStatus === 'paid', 'Confirmation order reflects "paid"');
  assert(confOrder.items && confOrder.items.length > 0, 'Confirmation order has garment items');
  console.log(`[PASS] 22. Retrieve confirmation order (${successOrderId})`);

  // 23. Retrieve My Orders
  const myOrdersRes = await fetch(`${API_ROOT}/api/orders`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  assert(myOrdersRes.status === 200, `Step 23: Retrieve My Orders returns HTTP 200 (got ${myOrdersRes.status})`);
  const myOrdersData = await myOrdersRes.json();
  const ordersList = Array.isArray(myOrdersData) ? myOrdersData : (myOrdersData.orders || []);
  assert(ordersList.length >= 2, `User retrieved order history (found ${ordersList.length} orders)`);
  assert(ordersList[0].orderId === successOrderId, 'Newest order appears first');
  console.log(`[PASS] 23. Retrieve My Orders (${ordersList.length} orders listed, sorted newest first)`);

  // 24. Retrieve Order Details
  const orderDetailsRes = await fetch(`${API_ROOT}/api/orders/${successOrderId}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  assert(orderDetailsRes.status === 200, `Step 24: Retrieve Order Details returns HTTP 200 (got ${orderDetailsRes.status})`);
  const orderDetailsData = await orderDetailsRes.json();
  const orderDetails = orderDetailsData.order || orderDetailsData;
  assert(orderDetails.customer && orderDetails.customer.name === customerInfo.name, 'Customer details match');
  assert(Array.isArray(orderDetails.tracking), 'Tracking array exists');
  assert(orderDetails.tracking.length === 1 && orderDetails.tracking[0].status === 'placed', 'Initial tracking is placed');
  console.log('[PASS] 24. Retrieve Order Details & tracking state');

  // 25. Advance Tracking (placed -> processing -> ready -> shipped)
  const transitions = ['processing', 'ready', 'shipped'];
  for (const nextPhase of transitions) {
    const advRes = await fetch(`${API_ROOT}/api/orders/${successOrderId}/advance-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ nextStatus: nextPhase })
    });
    assert(advRes.status === 200, `Advance to ${nextPhase} returns HTTP 200 (got ${advRes.status})`);
    const advData = await advRes.json();
    assert(advData.order.orderStatus === nextPhase, `Order advanced to ${nextPhase}`);
  }
  console.log('[PASS] 25. Advance tracking (placed -> processing -> ready -> shipped)');

  // 26. Reach Delivered
  const deliveredRes = await fetch(`${API_ROOT}/api/orders/${successOrderId}/advance-status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ nextStatus: 'delivered' })
  });
  assert(deliveredRes.status === 200, `Step 26: Advance to delivered returns HTTP 200 (got ${deliveredRes.status})`);
  const deliveredData = await deliveredRes.json();
  assert(deliveredData.order.orderStatus === 'delivered', 'Terminal phase "delivered" reached');
  assert(deliveredData.order.tracking.length === 5, 'Tracking history contains all 5 lifecycle milestones');
  console.log('[PASS] 26. Reach delivered (all 5 milestones complete)');

  // Cleanup test records
  console.log('\n--- Cleanup: Removing Workflow Test Data ---');
  if (userId) {
    await User.deleteOne({ userId });
    await Design.deleteMany({ userId });
    await Cart.deleteOne({ userId });
    await Order.deleteMany({ userId });
  }
  console.log('[CLEANUP] Test records cleaned up successfully.');

  console.log('\n====================================================');
  console.log('WORKFLOW TEST RESULTS: ALL 26/26 WORKFLOW STEPS PASSED');
  console.log('====================================================\n');
} catch (error) {
  console.error('\n[WORKFLOW TEST FAILED]:', error);
  // Attempt cleanup on failure
  if (userId) {
    try {
      await User.deleteOne({ userId });
      await Design.deleteMany({ userId });
      await Cart.deleteOne({ userId });
      await Order.deleteMany({ userId });
    } catch {}
  }
  process.exit(1);
} finally {
  await mongoose.disconnect();
}
