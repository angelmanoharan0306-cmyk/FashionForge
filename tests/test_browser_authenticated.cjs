const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5000';

const PAGES = [
  { name: 'Home', path: '/' },
  { name: 'Design Studio', path: '/design.html' },
  { name: 'My Designs', path: '/my-designs.html' },
  { name: 'Cart / Bag', path: '/cart.html' },
  { name: 'Checkout', path: '/checkout.html' },
  { name: 'Payment', path: '/payment.html' },
  { name: 'Order Confirmation', path: '/order-confirmation.html' },
  { name: 'Orders', path: '/orders.html' },
  { name: 'Order Details', path: '/order-details.html' }
];

async function runAuthenticatedAudit() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Register a test user via API
  const testUser = {
    name: 'Audit User',
    email: `audit_${Date.now()}@fashionforge.test`,
    password: 'Password123!'
  };

  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });
  const regData = await regRes.json();
  const token = regData.token;
  const user = regData.user;
  console.log(`Registered test user: ${user.name} (${user.email})`);

  // Create a design for this user
  const designRes = await fetch(`${BASE_URL}/api/designs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'Architectural Silk Tunic',
      gender: 'female',
      figure: 'female',
      croquis: 'female',
      size: 'L',
      top: 'wrap',
      bottom: 'palazzo',
      sleeves: 'flare',
      collar: 'vneck',
      neckline: 'vneck',
      fabric: 'silk',
      colour: '#2c3e50',
      pattern: 'solid',
      notes: 'High-waisted fluid silhouette with bell sleeves.',
      price: 1870
    })
  });
  const designData = await designRes.json();
  const designId = designData.designId || designData.id;
  console.log(`Created design: ${designId}`);

  // Add design to cart
  const cartRes = await fetch(`${BASE_URL}/api/cart/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ designId, quantity: 1 })
  });
  console.log(`Added to cart: status ${cartRes.status}`);

  // Checkout an order to test order pages
  const checkoutRes = await fetch(`${BASE_URL}/api/orders/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      customer: {
        name: 'Audit User',
        email: user.email,
        phone: '+1 555-0199',
        address: '100 Haute Avenue',
        city: 'New York',
        state: 'NY',
        postalCode: '10001'
      }
    })
  });
  const checkoutData = await checkoutRes.json();
  const orderId = checkoutData.order ? checkoutData.order.orderId : checkoutData.orderId;
  console.log(`Created order for testing: ${orderId}`);

  // Re-add an item to cart so cart.html has items to display!
  await fetch(`${BASE_URL}/api/cart/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ designId, quantity: 2 })
  });

  // Inject session into page localStorage
  await page.goto(`${BASE_URL}/login.html`, { waitUntil: 'networkidle0' });
  await page.evaluate((t, u) => {
    localStorage.setItem('fashionforge_auth_token', t);
    localStorage.setItem('fashionforge_user', JSON.stringify(u));
  }, token, user);

  console.log('\n=== 2. AUDITING AUTHENTICATED PAGES & WORKFLOW ===');
  for (const p of PAGES) {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => consoleErrors.push(err.message));

    let targetUrl = `${BASE_URL}${p.path}`;
    if (p.path.includes('payment') || p.path.includes('order-confirmation') || p.path.includes('order-details')) {
      targetUrl += `?orderId=${encodeURIComponent(orderId)}`;
    }

    const response = await page.goto(targetUrl, { waitUntil: 'networkidle0' });
    const title = await page.title();
    const currentUrl = page.url();

    const navLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('header a, nav a, .studio-top-header a, .home-nav-links a, .home-nav-actions a, .segmented-control a, .header-right a, .studio-header-right a'));
      return links.map(a => ({
        text: (a.innerText || a.getAttribute('title') || a.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' '),
        href: a.getAttribute('href')
      })).filter(l => l.text || l.href);
    });

    const pageContentSummary = await page.evaluate(() => {
      const heading = document.querySelector('h1, h2')?.innerText || '';
      const emptyStateVisible = document.querySelector('#cart-empty-state, #orders-empty-state')?.style.display !== 'none';
      const itemsCount = document.querySelectorAll('.cart-item-card, .order-history-card')?.length;
      return { heading, emptyStateVisible, itemsCount };
    });

    console.log(`\nPage: ${p.name}`);
    console.log(`  Target: ${targetUrl}`);
    console.log(`  Final:  ${currentUrl}`);
    console.log(`  Status: ${response.status()}, Title: "${title}"`);
    console.log(`  Content: heading="${pageContentSummary.heading}", items=${pageContentSummary.itemsCount}, emptyVisible=${pageContentSummary.emptyStateVisible}`);
    console.log(`  Header Links: ${JSON.stringify(navLinks)}`);
    if (consoleErrors.length > 0) {
      console.log(`  CONSOLE ERRORS:`, consoleErrors);
    } else {
      console.log(`  Console: Clean (0 errors)`);
    }

    page.removeAllListeners('console');
    page.removeAllListeners('pageerror');
  }

  await browser.close();
}

runAuthenticatedAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
