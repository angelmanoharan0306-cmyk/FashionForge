/**
 * FashionForge — Payment Controller
 * frontend/js/payment.js
 *
 * Implements simplified UPI QR and Cash on Delivery payment flow:
 * - Dynamic standard UPI QR code generation via Pure JS QRCodeSVG
 * - Merchant UPI ID display with one-click Copy button
 * - Mobile "Pay using UPI app" direct intent link
 * - Customer "I've Completed Payment" manual confirmation
 * - Cash on Delivery (COD) order confirmation
 * - Cart / Bag clearance upon confirmed order
 */

import { cartService } from './services/cart-service.js';
import { authService } from './services/auth-service.js';
import { setupNavigationAuth } from './services/auth-nav.js';
import { QRCodeSVG } from './renderer/qrcode.js';

let currentOrder = null;
let currentUpiDetails = null;

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `studio-toast studio-toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

function showAlert(msg) {
  const alertEl = document.getElementById('payment-alert');
  const msgEl = document.getElementById('payment-alert-message');
  if (alertEl && msgEl) {
    msgEl.textContent = msg;
    alertEl.style.display = 'flex';
  }
}

function hideAlert() {
  const alertEl = document.getElementById('payment-alert');
  if (alertEl) alertEl.style.display = 'none';
}

function formatCurrency(val) {
  return '₹' + Number(val || 0).toLocaleString('en-IN');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

document.addEventListener('DOMContentLoaded', async () => {
  setupNavigationAuth();

  // 1. Auth check
  if (!authService.isAuthenticated()) {
    window.location.href = 'login.html?redirect=payment.html';
    return;
  }

  // 2. Extract orderId
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId');

  if (!orderId) {
    showAlert('No order identifier provided.');
    setTimeout(() => { window.location.href = 'cart.html'; }, 2000);
    return;
  }

  // 3. Load Order from backend
  try {
    const res = await cartService.getOrder(orderId);
    if (res.success && res.order) {
      currentOrder = res.order;
    } else {
      showAlert(res.message || 'Order could not be found.');
      return;
    }
  } catch (err) {
    showAlert(err.message || 'Failed to retrieve order.');
    return;
  }

  // 4. Populate Order Review UI
  populateOrderUI(currentOrder);

  // If order was already paid
  if (currentOrder.paymentStatus === 'paid') {
    window.location.href = `order-confirmation.html?orderId=${encodeURIComponent(currentOrder.orderId)}`;
    return;
  }

  // 5. Initialize Payment Method Radio Group
  setupPaymentMethodSelector();

  // 6. Load Dynamic UPI QR details
  await loadUpiQrDetails();

  // 7. Wire Payment Actions
  setupPaymentActions();
});

/**
 * Renders order details in the review card
 */
function populateOrderUI(order) {
  const orderIdEl = document.getElementById('order-id-display');
  const itemsEl = document.getElementById('payment-order-items');
  const deliveryEl = document.getElementById('payment-delivery-summary');
  const subtotalEl = document.getElementById('payment-subtotal-display');
  const totalEl = document.getElementById('payment-total-display');

  if (orderIdEl) orderIdEl.textContent = order.orderId;
  if (subtotalEl) subtotalEl.textContent = formatCurrency(order.subtotal || order.total);
  if (totalEl) totalEl.textContent = formatCurrency(order.total);

  updateStatusBadge(order.paymentStatus);

  if (itemsEl && order.items) {
    itemsEl.innerHTML = order.items.map(item => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: var(--text-sm);">
        <div>
          <span style="font-weight: 600; color: var(--color-text);">${escapeHtml(item.designName)}</span>
          <span style="color: var(--color-text-muted); font-size: var(--text-xs); margin-left: 8px;">
            Qty: ${item.quantity} × ${formatCurrency(item.unitPrice)}
          </span>
        </div>
        <div style="font-weight: 600; color: var(--color-text);">${formatCurrency(item.totalPrice)}</div>
      </div>
    `).join('');
  }

  if (deliveryEl && order.customer) {
    const c = order.customer;
    deliveryEl.innerHTML = `
      <div><strong>Recipient:</strong> ${escapeHtml(c.name || c.fullName)} (${escapeHtml(c.email)})</div>
      <div><strong>Phone:</strong> ${escapeHtml(c.phone)}</div>
      <div><strong>Ship to:</strong> ${escapeHtml(c.address || c.shippingAddress)}, ${escapeHtml(c.city)}, ${escapeHtml(c.state)} - ${escapeHtml(c.postalCode)}</div>
    `;
  }
}

/**
 * Updates the order payment status badge
 */
function updateStatusBadge(status) {
  const badgeEl = document.getElementById('payment-status-badge');
  if (!badgeEl) return;
  badgeEl.className = '';
  if (status === 'paid') {
    badgeEl.className = 'badge-status-paid';
    badgeEl.textContent = 'Paid';
  } else if (status === 'failed') {
    badgeEl.className = 'badge-status-failed';
    badgeEl.textContent = 'Payment Failed';
  } else {
    badgeEl.className = 'badge-status-pending';
    badgeEl.textContent = 'Pending Payment';
  }
}

/**
 * Fetches dynamic UPI details and renders sharp SVG QR code
 */
async function loadUpiQrDetails() {
  const qrTarget = document.getElementById('qr-image-target');
  const upiAmount = document.getElementById('upi-amount-display');
  const orderRefDisplay = document.getElementById('upi-order-ref-display');
  const upiIdDisplay = document.getElementById('upi-id-display');
  const mobileLink = document.getElementById('btn-open-upi-app');

  if (upiAmount) upiAmount.textContent = formatCurrency(currentOrder.total);
  if (orderRefDisplay) orderRefDisplay.textContent = `Order #${currentOrder.orderId}`;

  try {
    const details = await cartService.getUpiDetails(currentOrder.orderId);
    currentUpiDetails = details;

    if (upiIdDisplay && details.upiId) {
      upiIdDisplay.textContent = details.upiId;
    }

    if (mobileLink && details.upiUri) {
      mobileLink.href = details.upiUri;
    }

    if (qrTarget && details.upiUri) {
      // Render crisp, standards-compliant SVG QR code
      const svgMarkup = QRCodeSVG.createQRCodeSVG(details.upiUri, { size: 210, margin: 1 });
      qrTarget.innerHTML = svgMarkup;
    }
  } catch (err) {
    console.error('Failed to load UPI details:', err);
    // Fallback: build standard client-side URI if endpoint fails
    const fallbackUpiId = 'fashionforge@upi';
    const fallbackUri = `upi://pay?pa=${encodeURIComponent(fallbackUpiId)}&pn=FashionForge&am=${Number(currentOrder.total).toFixed(2)}&cu=INR&tn=FashionForge%20Order%20${encodeURIComponent(currentOrder.orderId)}`;
    
    if (upiIdDisplay) upiIdDisplay.textContent = fallbackUpiId;
    if (mobileLink) mobileLink.href = fallbackUri;
    if (qrTarget) {
      const svgMarkup = QRCodeSVG.createQRCodeSVG(fallbackUri, { size: 210, margin: 1 });
      qrTarget.innerHTML = svgMarkup;
    }
  }
}

/**
 * Handles selecting between UPI and COD
 */
function setupPaymentMethodSelector() {
  const optionCod = document.getElementById('option-cod');
  const optionUpi = document.getElementById('option-upi');
  const codPanel = document.getElementById('cod-action-panel');
  const upiPanel = document.getElementById('upi-action-panel');

  function selectMethod(method) {
    hideAlert();
    [optionCod, optionUpi].forEach(el => {
      if (el) {
        el.classList.remove('is-selected');
        el.setAttribute('aria-checked', 'false');
      }
    });

    if (codPanel) codPanel.style.display = 'none';
    if (upiPanel) upiPanel.style.display = 'none';

    if (method === 'cod') {
      optionCod?.classList.add('is-selected');
      optionCod?.setAttribute('aria-checked', 'true');
      if (codPanel) codPanel.style.display = 'block';
    } else {
      optionUpi?.classList.add('is-selected');
      optionUpi?.setAttribute('aria-checked', 'true');
      if (upiPanel) upiPanel.style.display = 'block';
    }
  }

  optionCod?.addEventListener('click', () => selectMethod('cod'));
  optionUpi?.addEventListener('click', () => selectMethod('upi'));

  [
    { el: optionCod, method: 'cod' },
    { el: optionUpi, method: 'upi' }
  ].forEach(({ el, method }) => {
    el?.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        selectMethod(method);
      }
    });
  });
}

/**
 * Sets up buttons: Copy UPI ID, I've Completed Payment, and Place Order (COD)
 */
function setupPaymentActions() {
  const btnCopy = document.getElementById('btn-copy-upi');
  const btnConfirmUpi = document.getElementById('btn-confirm-upi');
  const btnConfirmCod = document.getElementById('btn-confirm-cod');

  // Copy UPI ID button
  btnCopy?.addEventListener('click', async () => {
    const upiId = document.getElementById('upi-id-display')?.textContent?.trim() || 'fashionforge@upi';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(upiId);
      } else {
        const tempInput = document.createElement('input');
        tempInput.value = upiId;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }
      const label = btnCopy.querySelector('span');
      if (label) {
        const orig = label.textContent;
        label.textContent = '✓ Copied!';
        setTimeout(() => { label.textContent = orig; }, 2000);
      }
      showToast('UPI ID copied to clipboard!', 'success');
    } catch {
      showToast(`UPI ID: ${upiId}`, 'info');
    }
  });

  // "I've Completed Payment" button
  btnConfirmUpi?.addEventListener('click', async () => {
    if (!currentOrder) return;
    btnConfirmUpi.disabled = true;
    const btnSpan = btnConfirmUpi.querySelector('span');
    if (btnSpan) btnSpan.textContent = 'Confirming Order...';

    try {
      const res = await cartService.confirmUpi(currentOrder.orderId);
      updateStatusBadge('paid');
      showToast('Payment submitted! Redirecting to confirmation...', 'success');
      setTimeout(() => {
        window.location.href = `order-confirmation.html?orderId=${encodeURIComponent(currentOrder.orderId)}`;
      }, 800);
    } catch (err) {
      showAlert(err.message || 'Failed to confirm UPI payment.');
      btnConfirmUpi.disabled = false;
      if (btnSpan) btnSpan.textContent = "I've Completed Payment";
    }
  });

  // Cash on Delivery "Place Order" button
  btnConfirmCod?.addEventListener('click', async () => {
    if (!currentOrder) return;
    btnConfirmCod.disabled = true;
    const btnSpan = btnConfirmCod.querySelector('span');
    if (btnSpan) btnSpan.textContent = 'Placing Order...';

    try {
      const res = await cartService.confirmCod(currentOrder.orderId);
      showToast('Order confirmed with Cash on Delivery!', 'success');
      setTimeout(() => {
        window.location.href = `order-confirmation.html?orderId=${encodeURIComponent(currentOrder.orderId)}`;
      }, 800);
    } catch (err) {
      showAlert(err.message || 'Failed to place order with Cash on Delivery.');
      btnConfirmCod.disabled = false;
      if (btnSpan) btnSpan.textContent = 'Place Order';
    }
  });
}
