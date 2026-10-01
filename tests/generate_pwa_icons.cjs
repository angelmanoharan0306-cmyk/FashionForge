const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const svgPath = path.resolve(__dirname, '../frontend/assets/icons/icon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

async function render() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Standard 512x512
  await page.setViewport({ width: 512, height: 512, deviceScaleFactor: 1 });
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;overflow:hidden;">${svgContent}</body></html>`);
  await page.screenshot({ path: path.resolve(__dirname, '../frontend/assets/icons/icon-512.png'), omitBackground: true });

  // 2. Standard 192x192
  await page.setViewport({ width: 192, height: 192, deviceScaleFactor: 1 });
  const svg192 = svgContent.replace('width="512"', 'width="192"').replace('height="512"', 'height="192"');
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;overflow:hidden;"><div style="width:192px;height:192px;">${svg192}</div></body></html>`);
  await page.screenshot({ path: path.resolve(__dirname, '../frontend/assets/icons/icon-192.png'), omitBackground: true });

  // 3. Maskable 512x512 (full bleed square background with safe zone)
  const maskableSvg = svgContent.replace('rx="112"', 'rx="0"').replace('x="36" y="36" width="440" height="440" rx="90"', 'x="60" y="60" width="392" height="392" rx="20"');
  await page.setViewport({ width: 512, height: 512, deviceScaleFactor: 1 });
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:#783733;overflow:hidden;">${maskableSvg}</body></html>`);
  await page.screenshot({ path: path.resolve(__dirname, '../frontend/assets/icons/icon-maskable-512.png'), omitBackground: false });

  // 4. Maskable 192x192
  await page.setViewport({ width: 192, height: 192, deviceScaleFactor: 1 });
  const maskable192 = maskableSvg.replace('width="512"', 'width="192"').replace('height="512"', 'height="192"');
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:#783733;overflow:hidden;"><div style="width:192px;height:192px;">${maskable192}</div></body></html>`);
  await page.screenshot({ path: path.resolve(__dirname, '../frontend/assets/icons/icon-maskable-192.png'), omitBackground: false });

  await browser.close();
  console.log('PWA icons rendered successfully!');
}

render().catch(err => {
  console.error(err);
  process.exit(1);
});
