/**
 * FashionForge — UI/UX, Page Shell, Navigation & PWA Test Suite
 * Validates PWA manifest, service-worker, offline fallback,
 * natural scrolling rules, marketing vs application headers, and footer shells.
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');

let totalTests = 0;
let passedTests = 0;

function test(description, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`[PASS] ${description}`);
  } catch (err) {
    console.error(`[FAIL] ${description}`);
    console.error(`       ${err.message}`);
    throw err;
  }
}

console.log('====================================================');
console.log('FASHIONFORGE — UI/UX, NAVIGATION & PWA VALIDATION');
console.log('====================================================\n');

// -----------------------------------------------------------------------------
// 1. PWA Manifest Verification
// -----------------------------------------------------------------------------
console.log('--- 1. PWA Manifest Audit ---');

const manifestPath = path.join(frontendDir, 'manifest.webmanifest');
test('manifest.webmanifest exists in frontend root', () => {
  assert(fs.existsSync(manifestPath), 'manifest.webmanifest must exist');
});

const manifestContent = fs.readFileSync(manifestPath, 'utf8');
let manifestJson = null;
test('manifest.webmanifest is valid JSON', () => {
  manifestJson = JSON.parse(manifestContent);
  assert(manifestJson, 'Parsed manifest should be non-null');
});

test('Manifest has required metadata: name, short_name, scope, start_url, display', () => {
  assert.strictEqual(manifestJson.name, 'FashionForge — Interactive Digital Fashion Studio');
  assert.strictEqual(manifestJson.short_name, 'FashionForge');
  assert.strictEqual(manifestJson.start_url, '/');
  assert.strictEqual(manifestJson.scope, '/');
  assert.strictEqual(manifestJson.display, 'standalone');
  assert.strictEqual(manifestJson.theme_color, '#b96b61');
  assert.strictEqual(manifestJson.background_color, '#fbf9f6');
});

test('Manifest defines 192x192, 512x512, and maskable icons', () => {
  assert(Array.isArray(manifestJson.icons), 'icons must be an array');
  assert(manifestJson.icons.length >= 3, 'Must define at least 3 icon configurations');

  const has192 = manifestJson.icons.some(i => i.sizes === '192x192' && i.purpose === 'any');
  const has512 = manifestJson.icons.some(i => i.sizes === '512x512' && i.purpose === 'any');
  const hasMaskable = manifestJson.icons.some(i => i.purpose === 'maskable');

  assert(has192, 'Manifest must specify 192x192 icon');
  assert(has512, 'Manifest must specify 512x512 icon');
  assert(hasMaskable, 'Manifest must specify maskable icon');
});

test('All manifest icon assets physically exist on disk', () => {
  for (const icon of manifestJson.icons) {
    const relativePath = icon.src.replace(/^\//, '');
    const fullPath = path.join(frontendDir, relativePath);
    assert(fs.existsSync(fullPath), `Icon file ${icon.src} must exist at ${fullPath}`);
    const stat = fs.statSync(fullPath);
    assert(stat.size > 0, `Icon file ${icon.src} must not be empty (size: ${stat.size} bytes)`);
  }
});

// -----------------------------------------------------------------------------
// 2. Service Worker & Cache Strategy Verification
// -----------------------------------------------------------------------------
console.log('\n--- 2. Service Worker & Caching Security Audit ---');

const swPath = path.join(frontendDir, 'service-worker.js');
test('service-worker.js exists in frontend root', () => {
  assert(fs.existsSync(swPath), 'service-worker.js must exist');
});

const swContent = fs.readFileSync(swPath, 'utf8');
test('Service worker specifies versioned cache name', () => {
  assert(/CACHE_NAME\s*=\s*['"]fashionforge-[^'"]+['"]/.test(swContent), 'Must define a versioned CACHE_NAME');
});

test('Service worker explicitly bypasses cache for private /api/ endpoints', () => {
  assert(swContent.includes('/api/'), 'Service worker must inspect /api/ path');
  assert(
    swContent.includes("url.pathname.startsWith('/api/')") || swContent.includes('req.url.includes(\'/api/\')'),
    'Service worker must have rule for /api/'
  );
});

test('Service worker claims clients and deletes obsolete caches on activate', () => {
  assert(swContent.includes('self.clients.claim()'), 'Must call clients.claim()');
  assert(swContent.includes('caches.delete'), 'Must purge outdated caches during activate');
});

test('offline.html fallback page exists and is referenced in service worker', () => {
  const offlinePath = path.join(frontendDir, 'offline.html');
  assert(fs.existsSync(offlinePath), 'offline.html must exist');
  assert(swContent.includes('offline.html'), 'Service worker must cache/reference offline.html');
});

// -----------------------------------------------------------------------------
// 3. Global Page Shell & Natural Scrolling Audit
// -----------------------------------------------------------------------------
console.log('\n--- 3. Page Shell & Scrolling Audit ---');

const nonStudioPages = [
  'index.html',
  'my-designs.html',
  'cart.html',
  'checkout.html',
  'payment.html',
  'order-confirmation.html',
  'orders.html',
  'order-details.html',
  'login.html',
  'offline.html'
];

test('Only design.html has studio-app-body; all non-studio pages use natural scrolling body', () => {
  const designHtml = fs.readFileSync(path.join(frontendDir, 'design.html'), 'utf8');
  assert(designHtml.includes('class="studio-app-body"'), 'design.html must retain studio-app-body workspace');

  for (const pageName of nonStudioPages) {
    if (pageName === 'index.html') continue;
    const pageHtml = fs.readFileSync(path.join(frontendDir, pageName), 'utf8');
    assert(
      !pageHtml.includes('class="studio-app-body"'),
      `${pageName} MUST NOT have studio-app-body (causes overflow:hidden 100vh lockup)`
    );
    assert(
      pageHtml.includes('app-page-body'),
      `${pageName} must use app-page-body for natural document flow`
    );
  }
});

test('All non-studio pages include the shared site-footer', () => {
  for (const pageName of nonStudioPages) {
    if (pageName === 'offline.html') continue;
    const pageHtml = fs.readFileSync(path.join(frontendDir, pageName), 'utf8');
    assert(
      pageHtml.includes('class="site-footer"'),
      `${pageName} must include the shared site-footer component`
    );
  }
});

// -----------------------------------------------------------------------------
// 4. Marketing Header vs Application Header Rules
// -----------------------------------------------------------------------------
console.log('\n--- 4. Marketing Header vs Application Header Audit ---');

const indexHtml = fs.readFileSync(path.join(frontendDir, 'index.html'), 'utf8');
test('Home page marketing header does not expose internal app links', () => {
  const navMatch = indexHtml.match(/<nav class="home-nav-links"[^>]*>([\s\S]*?)<\/nav>/);
  assert(navMatch, 'home-nav-links must exist on index.html');
  const navInner = navMatch[1];

  assert(!navInner.includes('my-designs.html'), 'Home marketing nav must NOT include My Designs link');
  assert(!navInner.includes('orders.html'), 'Home marketing nav must NOT include My Orders link');
  assert(!navInner.includes('cart.html'), 'Home marketing nav must NOT include Bag link');
  assert(!navInner.includes('#tech-pack'), 'Home marketing nav must NOT include Tech Pack link');
});

test('Home page primary CTA leads to Design Studio', () => {
  assert(
    indexHtml.includes('href="design.html"') && indexHtml.includes('Start Designing'),
    'Home page primary CTA must link to design.html with Start Designing'
  );
});

const authNavCode = fs.readFileSync(path.join(frontendDir, 'js/services/auth-nav.js'), 'utf8');
test('auth-nav.js never injects orders.html or cart.html into Home header', () => {
  assert(
    !authNavCode.includes("homeNavLinks.querySelector('a[href=\"orders.html\"]')"),
    'auth-nav.js must not inject My Orders into home-nav-links'
  );
});

// -----------------------------------------------------------------------------
// 5. Checkout Progress Stepper Consistency
// -----------------------------------------------------------------------------
console.log('\n--- 5. Checkout Progress Stepper Audit ---');

const checkoutPages = [
  { file: 'cart.html', step: 'Bag' },
  { file: 'checkout.html', step: 'Checkout' },
  { file: 'payment.html', step: 'Payment' },
  { file: 'order-confirmation.html', step: 'Confirmation' }
];

for (const { file, step } of checkoutPages) {
  test(`${file} includes checkout-stepper with active milestone: ${step}`, () => {
    const content = fs.readFileSync(path.join(frontendDir, file), 'utf8');
    assert(content.includes('class="checkout-stepper"'), `${file} must include checkout-stepper`);
    assert(
      content.includes(`is-active"><span class="stepper-step-num">`) && content.includes(step),
      `${file} must mark ${step} as is-active`
    );
  });
}

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n====================================================');
console.log(`UI/UX & PWA TEST RESULTS: ${passedTests}/${totalTests} PASSED (0 FAILED)`);
console.log('====================================================\n');
