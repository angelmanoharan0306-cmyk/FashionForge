const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function generateDefaultQR() {
  const imagesDir = path.join(__dirname, '..', 'frontend', 'assets', 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  const { createQRCodeSVG } = await import('../frontend/js/renderer/qrcode.js');
  const upiUri = 'upi://pay?pa=fashionforge@upi&pn=FashionForge&cu=INR&tn=FashionForge%20Payment';
  const svg = createQRCodeSVG(upiUri, { size: 400, margin: 8 });

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#ffffff;display:flex;align-items:center;justify-content:center;">${svg}</body></html>`;

  const browser = await puppeteer.launch({ executablePath: chromePath, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 400, height: 400 });
  await page.setContent(html, { waitUntil: 'load' });
  
  const pngPath = path.join(imagesDir, 'upi-qr.png');
  await page.screenshot({ path: pngPath, type: 'png' });
  await browser.close();

  console.log('Successfully generated default QR code image:');
  console.log('Path:', pngPath);
  console.log('Size:', fs.statSync(pngPath).size, 'bytes');
}

generateDefaultQR().catch(err => {
  console.error(err);
  process.exit(1);
});
