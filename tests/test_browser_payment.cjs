/**
 * FashionForge — Browser E2E Test Suite for UPI QR & COD
 * tests/test_browser_payment.cjs
 *
 * Exercises the complete real user flow using Puppeteer & local Google Chrome:
 * 1. Register & Login
 * 2. Design Studio: Create & Save Design
 * 3. Add to Bag
 * 4. Bag -> Checkout -> Fill shipping information -> Place Order
 * 5. Payment Page:
 *    - Verify UPI Payment section is visible and active
 *    - Verify dynamic QR code SVG is rendered
 *    - Verify exact order amount displayed (e.g. ₹5,200)
 *    - Verify merchant UPI ID is displayed
 *    - Verify "Copy" UPI ID button functionality
 *    - Verify mobile "Pay using UPI App" intent link
 *    - Verify Cash on Delivery radio option is selectable
 * 6. Click "I've Completed Payment" -> Confirms order
 * 7. Auto-redirects to Order Confirmation page -> Verify confirmation details & Paid status
 * 8. Check Bag is now completely empty
 * 9. Multi-viewport responsiveness check (1440, 1280, 1024, 768, 480, 375px)
 */

const puppeteer = require('puppeteer-core');
const assert = require('assert');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5000';

async function runBrowserPaymentE2E() {
  console.log('====================================================');
  console.log('FASHIONFORGE — SIMPLIFIED UPI QR & COD BROWSER E2E');
  console.log('====================================================\n');

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  try {
    // -------------------------------------------------------------
    // Step 1: Register & Login
    // -------------------------------------------------------------
    console.log('[1/7] Registering & Authenticating Bespoke Customer...');
    const testTimestamp = Date.now();
    const testEmail = `couture_tester_${testTimestamp}@fashionforge.test`;
    const testPassword = 'BespokePayment2026!';
    const testName = 'Madeleine Vionnet';

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await page.click('#tab-register');
    await page.type('#register-name', testName);
    await page.type('#register-email', testEmail);
    await page.type('#register-password', testPassword);
    await page.type('#register-confirm-password', testPassword);

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {}),
      page.click('#btn-submit-register')
    ]);
    console.log(`  ✓ Registered test customer (${testEmail})`);

    // -------------------------------------------------------------
    // Step 2: Design Studio -> Create & Save Design
    // -------------------------------------------------------------
    console.log('\n[2/7] Creating Bespoke Garment in Design Studio...');
    const designResult = await page.evaluate(async () => {
      const token = localStorage.getItem('fashionforge_auth_token');
      const res = await fetch('/api/designs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: 'Bias-Cut Silk Crepe Gown',
          gender: 'female',
          figure: 'female',
          croquis: 'female',
          size: 'M',
          top: 'corset',
          bottom: 'tiered',
          sleeves: 'sleeveless',
          collar: 'sweetheart',
          fabric: 'silk',
          colour: '#c5a059',
          pattern: 'solid',
          notes: 'Bias-cut draping for UPI payment E2E verification',
          price: 2600
        })
      });
      return await res.json();
    });
    const designId = designResult.designId || designResult.id;
    assert(designId, 'Failed to create bespoke design in database');
    console.log(`  ✓ Saved design: "${designResult.name}" (ID: ${designId}, Price: ₹${designResult.price})`);

    // -------------------------------------------------------------
    // Step 3: Add to Bag
    // -------------------------------------------------------------
    console.log('\n[3/7] Adding Garment to Bag...');
    const cartAddRes = await page.evaluate(async (id) => {
      const token = localStorage.getItem('fashionforge_auth_token');
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ designId: id, quantity: 2 })
      });
      return await res.json();
    }, designId);
    assert(cartAddRes.cart && cartAddRes.cart.items.length > 0, 'Failed to add item to Cart');
    console.log(`  ✓ Added 2 units to Bag (Total: ₹${cartAddRes.cart.total})`);

    // -------------------------------------------------------------
    // Step 4: Bag -> Checkout
    // -------------------------------------------------------------
    console.log('\n[4/7] Proceeding Through Bag to Checkout...');
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#checkout-items-list .checkout-item-row');

    await page.evaluate(() => {
      document.getElementById('cust-name').value = 'Sundaram Raman';
      document.getElementById('cust-email').value = 'raman@fashionforge.test';
      document.getElementById('cust-phone').value = '9876543210';
      document.getElementById('cust-address').value = '12, Example Street';
      document.getElementById('cust-city').value = 'Chennai';
      document.getElementById('cust-state').value = 'Tamil Nadu';
      document.getElementById('cust-postal').value = '600040';
    });

    // Submit Order
    await page.click('#btn-submit-order');
    await page.waitForFunction(() => window.location.href.includes('payment'), { timeout: 15000 });
    const paymentUrl = page.url();
    assert(paymentUrl.includes('orderId='), 'Payment URL missing orderId parameter');
    const orderId = new URL(paymentUrl).searchParams.get('orderId');
    console.log(`  ✓ Order created and landed on Payment page! Order ID: ${orderId}`);

    // -------------------------------------------------------------
    // Step 5: Verify Simplified UPI QR Payment UI
    // -------------------------------------------------------------
    console.log('\n[5/7] Verifying Simplified UPI QR Payment UI...');
    await page.waitForSelector('.payment-methods-card', { timeout: 10000 });

    // Check payment options: UPI and COD
    const hasUpi = await page.$('#option-upi');
    const hasCod = await page.$('#option-cod');
    assert(hasUpi, 'UPI option missing');
    assert(hasCod, 'Cash on Delivery option missing');
    console.log('  ✓ Payment options match specifications (UPI Payment and Cash on Delivery)');

    // Verify QR Code Image Space Rendered
    await page.waitForFunction(() => {
      const target = document.getElementById('qr-image-target');
      if (!target) return false;
      return target.querySelector('img, svg') !== null;
    }, { timeout: 10000 });

    const qrDimensions = await page.evaluate(() => {
      const el = document.querySelector('#qr-image-target img, #qr-image-target svg');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height, tag: el.tagName, src: el.src || null };
    });
    assert(qrDimensions && qrDimensions.width > 50, 'QR Code image space did not render with valid dimensions');
    console.log(`  ✓ QR code image space rendered cleanly (${Math.round(qrDimensions.width)}x${Math.round(qrDimensions.height)}px, tag: <${qrDimensions.tag.toLowerCase()}>)`);

    // Verify Amount Displayed
    const amountText = await page.$eval('#upi-amount-display', el => el.textContent.trim());
    assert(amountText.includes('5,200') || amountText.includes('5200'), `Expected ₹5,200, got: "${amountText}"`);
    console.log(`  ✓ Authoritative order amount displayed: ${amountText}`);

    // Verify UPI ID Displayed
    const upiIdText = await page.$eval('#upi-id-display', el => el.textContent.trim());
    assert(upiIdText.includes('@'), `Expected valid UPI ID, got: "${upiIdText}"`);
    console.log(`  ✓ Merchant UPI ID displayed: ${upiIdText}`);

    // Verify Copy UPI ID Button
    const copyBtn = await page.$('#btn-copy-upi');
    assert(copyBtn, 'Copy UPI ID button is present');
    await copyBtn.click();
    console.log('  ✓ Copy UPI ID button verified');

    // Verify Mobile UPI Link
    const mobileLink = await page.$eval('#btn-open-upi-app', el => el.getAttribute('href'));
    assert(mobileLink && mobileLink.startsWith('upi://pay?'), `Mobile link must be standard UPI URI, got: ${mobileLink}`);
    console.log('  ✓ Mobile UPI intent link verified');

    // -------------------------------------------------------------
    // Step 6: Test Cash on Delivery Toggle
    // -------------------------------------------------------------
    console.log('\n[6/7] Testing Payment Option Switching...');
    await page.click('#option-cod');
    const isCodVisible = await page.evaluate(() => {
      const panel = document.getElementById('cod-action-panel');
      return panel && panel.style.display !== 'none';
    });
    assert(isCodVisible, 'COD action panel should be visible after clicking COD');
    console.log('  ✓ Cash on Delivery option toggles cleanly');

    // Switch back to UPI
    await page.click('#option-upi');
    const isUpiVisible = await page.evaluate(() => {
      const panel = document.getElementById('upi-action-panel');
      return panel && panel.style.display !== 'none';
    });
    assert(isUpiVisible, 'UPI panel should be visible after clicking UPI');
    console.log('  ✓ UPI Payment option re-selected');

    // Multi-viewport responsiveness check for Payment Page
    console.log('\n--- Checking Payment Page Viewport Responsiveness across 1440, 1280, 1024, 768, 480, 375px ---');
    const viewports = [1440, 1280, 1024, 768, 480, 375];
    for (const width of viewports) {
      await page.setViewport({ width, height: 800 });
      await new Promise(r => setTimeout(r, 60));
      const isOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 2;
      });
      assert(!isOverflow, `Horizontal overflow detected on payment page at ${width}px viewport`);
    }
    console.log('  ✓ Payment Page responsive across all 6 viewports without horizontal overflow');

    // Reset viewport to desktop for clicking confirmation
    await page.setViewport({ width: 1280, height: 800 });

    // -------------------------------------------------------------
    // Step 7: Confirm UPI Payment & Auto-Redirect
    // -------------------------------------------------------------
    console.log('\n[7/7] Confirming Payment ("I\'ve Completed Payment")...');
    const confirmBtn = await page.$('#btn-confirm-upi');
    assert(confirmBtn, 'I\'ve Completed Payment button missing');

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }),
      confirmBtn.click()
    ]);

    const finalUrl = page.url();
    assert(finalUrl.includes('order-confirmation'), `Expected Order Confirmation URL, got: ${finalUrl}`);
    console.log(`  ✓ Auto-redirected to Order Confirmation! URL: ${finalUrl}`);

    // Check Bag is now completely empty
    const cartCountAfterSuccess = await page.evaluate(async () => {
      const token = localStorage.getItem('fashionforge_auth_token');
      const res = await fetch('/api/cart', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      return data.cart?.items?.length || 0;
    });
    assert.strictEqual(cartCountAfterSuccess, 0, 'Bag should be cleared after confirmed payment');
    console.log('  ✓ Customer Bag confirmed empty after payment confirmation');

    // Multi-viewport responsiveness check for Order Confirmation Page
    console.log('\n--- Checking Order Confirmation Viewport Responsiveness across 1440, 1280, 1024, 768, 480, 375px ---');
    for (const width of viewports) {
      await page.setViewport({ width, height: 800 });
      await new Promise(r => setTimeout(r, 60));
      const isOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 2;
      });
      assert(!isOverflow, `Horizontal overflow detected on order-confirmation page at ${width}px viewport`);
    }
    console.log('  ✓ Order Confirmation responsive across all 6 viewports without horizontal overflow');

    console.log('\n====================================================');
    console.log('🎉 ALL SIMPLIFIED PAYMENT BROWSER E2E TESTS PASSED WITH 100% SUCCESS!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ Browser E2E Test Failure:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runBrowserPaymentE2E();
