/**
 * FashionForge — UPI Payment Service
 * backend/services/upiService.js
 *
 * Provides dynamic standard UPI payment URI generation:
 * upi://pay?pa=<UPI_ID>&pn=FashionForge&am=<AMOUNT>&cu=INR&tn=FashionForge%20Order%20<ORDER_ID>
 *
 * Configurable via:
 * - UPI_ID (defaults to fashionforge@upi)
 * - MERCHANT_NAME (defaults to FashionForge)
 */

function getMerchantUpiId() {
  return (process.env.UPI_ID || 'fashionforge@upi').trim();
}

function getMerchantName() {
  return (process.env.MERCHANT_NAME || 'FashionForge').trim();
}

/**
 * Builds standard UPI payment URI for an order
 * @param {Object} params
 * @param {number} params.amount - Order amount in INR
 * @param {string} params.orderId - FashionForge Order ID
 * @returns {string} Standard UPI URI
 */
function buildUpiUri({ amount, orderId }) {
  const upiId = getMerchantUpiId();
  const name = getMerchantName();
  const numericAmount = Number(amount || 0).toFixed(2);
  const transactionNote = `FashionForge Order ${orderId}`;

  return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${numericAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
}

module.exports = {
  getMerchantUpiId,
  getMerchantName,
  buildUpiUri
};
