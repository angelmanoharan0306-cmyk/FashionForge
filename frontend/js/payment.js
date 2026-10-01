/**
 * FashionForge — Phase 10: Payment Simulation Controller
 * frontend/js/payment.js
 */

import { cartService } from './services/cart-service.js';
import { authService } from './services/auth-service.js';
import { setupNavigationAuth } from './services/auth-nav.js';

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
  let order = null;
  try {
    const res = await cartService.getOrder(orderId);
    if (res.success && res.order) {
      order = res.order;
    } else {
      showAlert(res.message || 'Order could not be found.');
      return;
    }
  } catch (err) {
    showAlert(err.message || 'Failed to retrieve order.');
    return;
  }

  // 4. Populate UI
  const orderIdEl = document.getElementById('order-id-display');
  const badgeEl = document.getElementById('payment-status-badge');
  const itemsEl = document.getElementById('payment-order-items');
  const deliveryEl = document.getElementById('payment-delivery-summary');
  const totalEl = document.getElementById('payment-total-display');
  const actionsGroup = document.getElementById('payment-actions-group');
  const outcomePanel = document.getElementById('payment-outcome-panel');

  if (orderIdEl) orderIdEl.textContent = order.orderId;
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
      <div><strong>Recipient:</strong> ${escapeHtml(c.name)} (${escapeHtml(c.email)})</div>
      <div><strong>Phone:</strong> ${escapeHtml(c.phone)}</div>
      <div><strong>Ship to:</strong> ${escapeHtml(c.address)}, ${escapeHtml(c.city)}, ${escapeHtml(c.state)} - ${escapeHtml(c.postalCode)}</div>
    `;
  }

  // If order was already paid
  if (order.paymentStatus === 'paid') {
    showOutcome(true, order);
    return;
  }

  // 5. Wire action buttons
  const btnSuccess = document.getElementById('btn-simulate-success');
  const btnFail = document.getElementById('btn-simulate-failure');

  if (btnSuccess) {
    btnSuccess.addEventListener('click', async () => {
      hideAlert();
      btnSuccess.disabled = true;
      btnFail.disabled = true;
      btnSuccess.textContent = 'Simulating Approval...';

      try {
        const payRes = await cartService.simulatePayment(order.orderId, 'success');
        const updatedOrd = payRes.order || order;
        updateStatusBadge('paid');
        showToast('Payment Simulation Succeeded! Redirecting to confirmation...', 'success');
        setTimeout(() => {
          window.location.href = `order-confirmation.html?orderId=${encodeURIComponent(updatedOrd.orderId)}`;
        }, 1200);
        showOutcome(true, updatedOrd);
      } catch (err) {
        showAlert(err.message || 'Network error.');
        btnSuccess.disabled = false;
        btnFail.disabled = false;
        btnSuccess.textContent = 'Simulate Successful Payment';
      }
    });
  }

  if (btnFail) {
    btnFail.addEventListener('click', async () => {
      hideAlert();
      btnSuccess.disabled = true;
      btnFail.disabled = true;
      btnFail.textContent = 'Simulating Decline...';

      try {
        const payRes = await cartService.simulatePayment(order.orderId, 'failure');
        const updatedOrd = payRes.order || order;
        updateStatusBadge('failed');
        showToast('Payment Simulation Failed (Decline Recorded)', 'error');
        showOutcome(false, updatedOrd);
      } catch (err) {
        showAlert(err.message || 'Network error.');
        btnSuccess.disabled = false;
        btnFail.disabled = false;
        btnFail.textContent = 'Simulate Failed Payment';
      }
    });
  }

  function updateStatusBadge(status) {
    if (!badgeEl) return;
    badgeEl.className = '';
    if (status === 'paid') {
      badgeEl.className = 'badge-status-paid';
      badgeEl.textContent = 'Paid (Placed)';
    } else if (status === 'failed') {
      badgeEl.className = 'badge-status-failed';
      badgeEl.textContent = 'Payment Failed';
    } else {
      badgeEl.className = 'badge-status-pending';
      badgeEl.textContent = 'Pending Payment';
    }
  }

  function showOutcome(isSuccess, updatedOrder) {
    if (actionsGroup) actionsGroup.style.display = 'none';
    if (outcomePanel) {
      outcomePanel.style.display = 'block';
      const icon = document.getElementById('outcome-icon');
      const title = document.getElementById('outcome-title');
      const desc = document.getElementById('outcome-desc');
      const navButtons = document.getElementById('outcome-nav-buttons');

      if (isSuccess) {
        if (icon) {
          icon.innerHTML = `<span style="font-size: 40px;">✨</span>`;
        }
        if (title) {
          title.textContent = 'Bespoke Order Confirmed';
          title.style.color = 'var(--color-brand)';
        }
        if (desc) {
          desc.innerHTML = `Order <strong>${escapeHtml(updatedOrder.orderId)}</strong> has been registered with status <em>placed</em>. Your shopping bag has been cleared.`;
        }
        if (navButtons) {
          navButtons.innerHTML = `
            <a class="btn-primary" href="order-confirmation.html?orderId=${encodeURIComponent(updatedOrder.orderId)}" style="padding: 10px 18px;">
              <span>View Order Confirmation</span>
            </a>
            <a class="btn-secondary" href="orders.html" style="padding: 10px 18px;">
              <span>My Orders</span>
            </a>
            <a class="btn-ghost" href="design.html" style="padding: 10px 18px;">
              <span>Continue Designing</span>
            </a>
          `;
        }
      } else {
        if (icon) {
          icon.innerHTML = `<span style="font-size: 40px;">⚠️</span>`;
        }
        if (title) {
          title.textContent = 'Simulation Recorded: Declined';
          title.style.color = '#ef4444';
        }
        if (desc) {
          desc.innerHTML = `Order <strong>${escapeHtml(updatedOrder.orderId)}</strong> status transitioned to <em>failed</em>. Your shopping bag remains intact so you can retry checkout or adjust items.`;
        }
        if (navButtons) {
          navButtons.innerHTML = `
            <button class="btn-primary" id="btn-retry-simulation" type="button" style="padding: 10px 18px;">
              <span>Retry Payment Simulation</span>
            </button>
            <a class="btn-secondary" href="cart.html" style="padding: 10px 18px;">
              <span>Return to Shopping Bag</span>
            </a>
          `;
          document.getElementById('btn-retry-simulation')?.addEventListener('click', () => {
            outcomePanel.style.display = 'none';
            if (actionsGroup) {
              actionsGroup.style.display = 'flex';
              if (btnSuccess) {
                btnSuccess.disabled = false;
                btnSuccess.textContent = 'Simulate Successful Payment';
              }
              if (btnFail) {
                btnFail.disabled = false;
                btnFail.textContent = 'Simulate Failed Payment';
              }
            }
          });
        }
      }
    }
  }
});
