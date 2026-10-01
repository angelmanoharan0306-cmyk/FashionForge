/**
 * FashionForge — Payment Controller
 * frontend/js/payment.js
 *
 * Implements screenshot-style payment selection:
 * - Cash on Delivery
 * - Dynamic UPI QR with custom FashionForge Modal
 * - Secure Card payment via Cashfree JS SDK
 * - Server-authoritative polling and bag clearing
 */

import { cartService } from './services/cart-service.js';
import { authService } from './services/auth-service.js';
import { setupNavigationAuth } from './services/auth-nav.js';
import { QRCodeSVG } from './renderer/qrcode.js';

let statusPollInterval = null;
let currentOrder = null;

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

function stopStatusPolling() {
  if (statusPollInterval) {
    clearInterval(statusPollInterval);
    statusPollInterval = null;
  }
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
    showOutcome(true, currentOrder);
    return;
  }

  // 5. Initialize Payment Method Radio Group
  setupPaymentMethodSelector();

  // 6. Wire UPI QR Modal Actions
  setupUpiQrModal();

  // 7. Wire Cash on Delivery & Card Actions
  setupCodAndCardActions();
});

/**
 * Renders order details in the review card
 */
function populateOrderUI(order) {
  const orderIdEl = document.getElementById('order-id-display');
  const badgeEl = document.getElementById('payment-status-badge');
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
 * Handles selecting between COD, UPI, and Card
 */
function setupPaymentMethodSelector() {
  const optionCod = document.getElementById('option-cod');
  const optionUpi = document.getElementById('option-upi');
  const optionCard = document.getElementById('option-card');

  const codPanel = document.getElementById('cod-action-panel');
  const upiPanel = document.getElementById('upi-action-panel');
  const cardPanel = document.getElementById('card-action-panel');

  function selectMethod(method) {
    [optionCod, optionUpi, optionCard].forEach(el => {
      if (el) {
        el.classList.remove('is-selected');
        el.setAttribute('aria-checked', 'false');
      }
    });

    if (codPanel) codPanel.style.display = 'none';
    if (upiPanel) upiPanel.style.display = 'none';
    if (cardPanel) cardPanel.style.display = 'none';

    if (method === 'cod') {
      optionCod?.classList.add('is-selected');
      optionCod?.setAttribute('aria-checked', 'true');
      if (codPanel) codPanel.style.display = 'block';
    } else if (method === 'card') {
      optionCard?.classList.add('is-selected');
      optionCard?.setAttribute('aria-checked', 'true');
      if (cardPanel) cardPanel.style.display = 'block';
    } else {
      optionUpi?.classList.add('is-selected');
      optionUpi?.setAttribute('aria-checked', 'true');
      if (upiPanel) upiPanel.style.display = 'block';
    }
  }

  optionCod?.addEventListener('click', () => selectMethod('cod'));
  optionUpi?.addEventListener('click', () => selectMethod('upi'));
  optionCard?.addEventListener('click', () => selectMethod('card'));

  // Keyboard accessibility: Enter and Space to select radio option
  [
    { el: optionCod, method: 'cod' },
    { el: optionUpi, method: 'upi' },
    { el: optionCard, method: 'card' }
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
 * Configures the custom FashionForge UPI QR Modal
 */
function setupUpiQrModal() {
  const btnShowQr = document.getElementById('btn-show-upi-qr');
  const btnPayUpi = document.getElementById('btn-pay-upi');
  const modal = document.getElementById('upi-qr-modal');
  const closeBtn = document.getElementById('btn-close-qr-modal');
  const cancelBtn = document.getElementById('btn-cancel-qr');
  const verifyBtn = document.getElementById('btn-check-qr-status');
  const retryBtn = document.getElementById('btn-retry-qr');
  const closeFailBtn = document.getElementById('btn-close-qr-fail');

  const activeContent = document.getElementById('qr-modal-active-content');
  const successState = document.getElementById('qr-modal-success-state');
  const failedState = document.getElementById('qr-modal-failed-state');

  const amountDisplay = document.getElementById('qr-modal-amount-display');
  const orderRefDisplay = document.getElementById('qr-modal-order-id-display');
  const qrTarget = document.getElementById('qr-image-target');
  const statusLabel = document.getElementById('qr-status-label');

  // Open QR Modal
  async function openUpiQrModal() {
    if (!currentOrder) return;
    hideAlert();
    stopStatusPolling();

    // Reset view states
    if (activeContent) activeContent.style.display = 'flex';
    if (successState) successState.style.display = 'none';
    if (failedState) failedState.style.display = 'none';

    if (amountDisplay) amountDisplay.textContent = formatCurrency(currentOrder.total);
    if (orderRefDisplay) orderRefDisplay.textContent = `Order #${currentOrder.orderId}`;
    if (statusLabel) statusLabel.textContent = 'Waiting for payment...';
    if (qrTarget) {
      qrTarget.innerHTML = `<span style="font-size: 13px; color: var(--color-text-muted);">Generating Dynamic QR...</span>`;
    }

    if (modal) modal.style.display = 'flex';

    try {
      // Call backend to generate transaction-specific dynamic QR code
      const qrRes = await cartService.generateDynamicUpiQr(currentOrder.orderId);

      if (qrRes.alreadyPaid) {
        handlePaymentSuccess();
        return;
      }

      // Render the real dynamic QR code
      renderQrCode(qrRes.qrCode || qrRes.upiString);

      // Setup mobile intent link if on mobile
      const isMobile = window.innerWidth <= 768;
      const intentWrap = document.getElementById('qr-mobile-intent-wrap');
      const intentLink = document.getElementById('qr-mobile-intent-link');
      if (isMobile && qrRes.intentUrl && intentWrap && intentLink) {
        intentLink.href = qrRes.intentUrl;
        intentWrap.style.display = 'block';
      }

      // Start secure server-authoritative polling every 2.5 seconds
      startStatusPolling();
    } catch (err) {
      console.error('Failed to generate UPI QR:', err);
      if (qrTarget) {
        qrTarget.innerHTML = `<span style="font-size: 13px; color: #ef4444; padding: 16px; text-align: center; line-height: 1.5;">Online payment is temporarily unavailable.<br>Please try Cash on Delivery.</span>`;
      }
      showAlert('Online payment is temporarily unavailable. Please try Cash on Delivery.');
    }
  }

  function renderQrCode(qrData) {
    if (!qrTarget || !qrData) return;

    if (typeof qrData === 'string' && (qrData.startsWith('data:image/') || qrData.startsWith('http'))) {
      qrTarget.innerHTML = `<img src="${qrData}" alt="UPI Dynamic Payment QR Code" style="max-width: 200px; max-height: 200px; border-radius: 8px;" />`;
    } else {
      // Generate sharp SVG QR Code from UPI payment URI
      const svgMarkup = QRCodeSVG.createQRCodeSVG(qrData, { size: 200, margin: 1 });
      qrTarget.innerHTML = svgMarkup;
    }
  }

  function startStatusPolling() {
    stopStatusPolling();
    statusPollInterval = setInterval(async () => {
      try {
        const res = await cartService.getPaymentStatus(currentOrder.orderId);
        if (res.isPaid) {
          stopStatusPolling();
          handlePaymentSuccess();
        } else if (res.isFailed) {
          stopStatusPolling();
          handlePaymentFailed();
        }
      } catch (pollErr) {
        console.warn('Status polling check notice:', pollErr.message);
      }
    }, 2500);
  }

  function handlePaymentSuccess() {
    stopStatusPolling();
    updateStatusBadge('paid');
    if (activeContent) activeContent.style.display = 'none';
    if (successState) {
      successState.style.display = 'flex';
      const successAmt = document.getElementById('qr-success-amount');
      if (successAmt) successAmt.textContent = `Amount: ${formatCurrency(currentOrder.total)}`;
    }
    showToast('Payment Successful! Redirecting to confirmation...', 'success');
    setTimeout(() => {
      window.location.href = `order-confirmation.html?orderId=${encodeURIComponent(currentOrder.orderId)}`;
    }, 1500);
  }

  function handlePaymentFailed() {
    stopStatusPolling();
    updateStatusBadge('failed');
    if (activeContent) activeContent.style.display = 'none';
    if (failedState) failedState.style.display = 'flex';
  }

  function closeAndCancelModal() {
    stopStatusPolling();
    if (modal) modal.style.display = 'none';
    // Notify server of cancellation; preserves bag intact
    cartService.cancelPayment(currentOrder.orderId).catch(() => {});
    showAlert('Payment cancelled. Your Bag is still available.');
  }

  btnShowQr?.addEventListener('click', openUpiQrModal);
  btnPayUpi?.addEventListener('click', openUpiQrModal);
  closeBtn?.addEventListener('click', closeAndCancelModal);
  cancelBtn?.addEventListener('click', closeAndCancelModal);
  closeFailBtn?.addEventListener('click', () => {
    if (modal) modal.style.display = 'none';
  });

  retryBtn?.addEventListener('click', openUpiQrModal);

  // "I've completed payment" manual trigger
  verifyBtn?.addEventListener('click', async () => {
    verifyBtn.disabled = true;
    verifyBtn.textContent = 'Verifying with bank...';
    try {
      const res = await cartService.getPaymentStatus(currentOrder.orderId);
      if (res.isPaid) {
        handlePaymentSuccess();
      } else {
        showToast('Payment is still awaiting confirmation from bank. Please wait...', 'info');
        verifyBtn.disabled = false;
        verifyBtn.textContent = "I've completed payment";
      }
    } catch {
      verifyBtn.disabled = false;
      verifyBtn.textContent = "I've completed payment";
    }
  });

  // Close when clicking modal backdrop
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeAndCancelModal();
    }
  });
}

/**
 * Sets up Cash on Delivery and Card checkout actions
 */
function setupCodAndCardActions() {
  const btnCod = document.getElementById('btn-confirm-cod');
  const btnCard = document.getElementById('btn-pay-card');

  // Cash on Delivery
  btnCod?.addEventListener('click', async () => {
    if (!currentOrder) return;
    btnCod.disabled = true;
    btnCod.textContent = 'Placing Order...';

    try {
      const res = await cartService.confirmCod(currentOrder.orderId);
      showToast('Order confirmed with Cash on Delivery!', 'success');
      setTimeout(() => {
        window.location.href = `order-confirmation.html?orderId=${encodeURIComponent(currentOrder.orderId)}`;
      }, 800);
    } catch (err) {
      showAlert(err.message || 'Failed to place order with Cash on Delivery.');
      btnCod.disabled = false;
      btnCod.textContent = 'Place Order';
    }
  });

  // Card Checkout via Cashfree JS SDK
  btnCard?.addEventListener('click', async () => {
    if (!currentOrder) return;
    btnCard.disabled = true;
    btnCard.textContent = 'Processing...';

    const cardStatusMsg = document.getElementById('card-status-msg');
    if (cardStatusMsg) cardStatusMsg.style.display = 'none';

    try {
      const cardRes = await cartService.getCardSession(currentOrder.orderId);

      if (typeof window.Cashfree !== 'undefined' && cardRes && cardRes.paymentSessionId) {
        const cashfree = window.Cashfree({ mode: cardRes.cashfreeEnv || 'sandbox' });
        cashfree.checkout({
          paymentSessionId: cardRes.paymentSessionId,
          redirectTarget: '_modal'
        }).then(async (result) => {
          btnCard.disabled = false;
          btnCard.textContent = 'Pay with Card';

          // Check server status after modal interaction
          const statusRes = await cartService.getPaymentStatus(currentOrder.orderId);
          if (statusRes.isPaid) {
            window.location.href = `order-confirmation.html?orderId=${encodeURIComponent(currentOrder.orderId)}`;
          }
        });
      } else {
        if (cardStatusMsg) {
          cardStatusMsg.textContent = 'Online card payment is currently unavailable.';
          cardStatusMsg.style.display = 'block';
          cardStatusMsg.style.color = '#dc2626';
        }
        showAlert('Online card payment is currently unavailable.');
        btnCard.disabled = true;
        btnCard.textContent = 'Online Card Payment Unavailable';
        btnCard.style.opacity = '0.6';
        btnCard.style.cursor = 'not-allowed';
      }
    } catch (err) {
      if (cardStatusMsg) {
        cardStatusMsg.textContent = 'Online card payment is currently unavailable.';
        cardStatusMsg.style.display = 'block';
        cardStatusMsg.style.color = '#dc2626';
      }
      showAlert('Online card payment is currently unavailable.');
      btnCard.disabled = true;
      btnCard.textContent = 'Online Card Payment Unavailable';
      btnCard.style.opacity = '0.6';
      btnCard.style.cursor = 'not-allowed';
    }
  });
}

/**
 * Outcome panel renderer for complete payment states
 */
function showOutcome(isSuccess, updatedOrder) {
  const outcomePanel = document.getElementById('payment-outcome-panel');
  if (outcomePanel) {
    outcomePanel.style.display = 'block';
    const icon = document.getElementById('outcome-icon');
    const title = document.getElementById('outcome-title');
    const desc = document.getElementById('outcome-desc');
    const navButtons = document.getElementById('outcome-nav-buttons');

    if (isSuccess) {
      if (icon) icon.innerHTML = `<span style="font-size: 40px;">✨</span>`;
      if (title) {
        title.textContent = 'Order Confirmed';
        title.style.color = 'var(--color-brand)';
      }
      if (desc) {
        desc.innerHTML = `Order <strong>${escapeHtml(updatedOrder.orderId)}</strong> has been placed. Your shopping bag has been cleared.`;
      }
      if (navButtons) {
        navButtons.innerHTML = `
          <a class="btn-primary" href="order-confirmation.html?orderId=${encodeURIComponent(updatedOrder.orderId)}" style="padding: 10px 18px; text-align: center;">
            <span>View Order Confirmation</span>
          </a>
          <a class="btn-secondary" href="orders.html" style="padding: 10px 18px; text-align: center;">
            <span>My Orders</span>
          </a>
        `;
      }
    } else {
      if (icon) icon.innerHTML = `<span style="font-size: 40px;">⚠️</span>`;
      if (title) {
        title.textContent = 'Payment Failed';
        title.style.color = '#ef4444';
      }
      if (desc) {
        desc.innerHTML = `Order <strong>${escapeHtml(updatedOrder.orderId)}</strong> payment could not be completed. Your shopping bag remains intact.`;
      }
      if (navButtons) {
        navButtons.innerHTML = `
          <a class="btn-secondary" href="cart.html" style="padding: 10px 18px; text-align: center;">
            <span>Return to Shopping Bag</span>
          </a>
        `;
      }
    }
  }
}
