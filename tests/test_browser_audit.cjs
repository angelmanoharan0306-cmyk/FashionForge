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
  { name: 'Order Details', path: '/order-details.html' },
  { name: 'Login', path: '/login.html' }
];

async function runAudit() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('=== 1. AUDITING GUEST NAVIGATION & PAGE ERRORS ===');
  for (const p of PAGES) {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => consoleErrors.push(err.message));

    const response = await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'networkidle0' });
    const title = await page.title();
    const currentUrl = page.url();
    const navLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('header a, nav a, .studio-top-header a, .home-nav-links a, .home-nav-actions a, .segmented-control a, .header-right a, .studio-header-right a'));
      return links.map(a => ({
        text: (a.innerText || a.getAttribute('title') || a.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' '),
        href: a.getAttribute('href')
      })).filter(l => l.text || l.href);
    });

    console.log(`\nPage: ${p.name} (${p.path})`);
    console.log(`  Final URL: ${currentUrl}`);
    console.log(`  Status: ${response.status()}, Title: "${title}"`);
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

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
