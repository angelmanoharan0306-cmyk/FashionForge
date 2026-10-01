/**
 * FashionForge — Phase 10: Checkout Controller
 * frontend/js/checkout.js
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
  const alertEl = document.getElementById('checkout-alert');
  const msgEl = document.getElementById('checkout-alert-message');
  if (alertEl && msgEl) {
    msgEl.textContent = msg;
    alertEl.style.display = 'flex';
  }
}

function hideAlert() {
  const alertEl = document.getElementById('checkout-alert');
  if (alertEl) alertEl.style.display = 'none';
}

function formatCurrency(val) {
  return '₹' + Number(val || 0).toLocaleString('en-IN');
}

document.addEventListener('DOMContentLoaded', async () => {
  setupNavigationAuth();

  // 1. Authentication check
  if (!authService.isAuthenticated()) {
    window.location.href = 'login.html?redirect=checkout.html';
    return;
  }

  // 2. Pre-fill user data
  const currentUser = authService.getCurrentUser();
  if (currentUser) {
    const nameInput = document.getElementById('cust-name');
    const emailInput = document.getElementById('cust-email');
    if (nameInput && currentUser.name) nameInput.value = currentUser.name;
    if (emailInput && currentUser.email) emailInput.value = currentUser.email;
  }

  // 3. Load cart
  let cartData = null;
  try {
    const res = await cartService.getCart();
    if (res && res.cart) {
      cartData = res.cart;
    } else if (res && res.items) {
      cartData = res;
    }
  } catch (err) {
    console.error('Failed to load cart for checkout:', err);
    showAlert('Failed to retrieve cart items. Please reload.');
    return;
  }

  if (!cartData || !cartData.items || cartData.items.length === 0) {
    showToast('Your shopping bag is empty.', 'info');
    setTimeout(() => {
      window.location.href = 'cart.html';
    }, 1200);
    return;
  }

  // 4. Render checkout items summary
  const itemsContainer = document.getElementById('checkout-items-list');
  const subtotalEl = document.getElementById('checkout-subtotal');
  const totalEl = document.getElementById('checkout-total');

  if (itemsContainer) {
    itemsContainer.innerHTML = cartData.items.map(item => `
      <div class="checkout-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--color-border-subtle); font-size: var(--text-sm);">
        <div style="flex: 1; padding-right: 12px;">
          <div style="font-weight: 600; color: var(--color-text);">${escapeHtml(item.designName)}</div>
          <div style="font-size: var(--text-xs); color: var(--color-text-muted);">
            Qty: ${item.quantity} × ${formatCurrency(item.unitPrice)}
          </div>
        </div>
        <div style="font-weight: 600; color: var(--color-text);">
          ${formatCurrency(item.totalPrice)}
        </div>
      </div>
    `).join('');
  }

  if (subtotalEl) subtotalEl.textContent = formatCurrency(cartData.subtotal);
  if (totalEl) totalEl.textContent = formatCurrency(cartData.total);

  // 5. Handle form submission
  const checkoutForm = document.getElementById('form-checkout');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const customer = {
        name: document.getElementById('cust-name')?.value.trim(),
        email: document.getElementById('cust-email')?.value.trim(),
        phone: document.getElementById('cust-phone')?.value.trim(),
        address: document.getElementById('cust-address')?.value.trim(),
        city: document.getElementById('cust-city')?.value.trim(),
        state: document.getElementById('cust-state')?.value.trim(),
        postalCode: document.getElementById('cust-postal')?.value.trim()
      };

      // Client validation
      for (const [key, val] of Object.entries(customer)) {
        if (!val) {
          showAlert(`Please provide a valid ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
          return;
        }
      }

      const submitBtn = document.getElementById('btn-submit-order');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Generating Order...';
      }

      try {
        const orderRes = await cartService.checkout(customer);
        const order = (orderRes && orderRes.order) ? orderRes.order : orderRes;
        if (order && order.orderId) {
          window.location.href = `payment.html?orderId=${encodeURIComponent(order.orderId)}`;
        } else {
          showAlert((orderRes && orderRes.message) || 'Checkout failed. Please try again.');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Continue to Payment Simulation';
          }
        }
      } catch (err) {
        showAlert(err.message || 'Network error during checkout.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Continue to Payment Simulation';
        }
      }
    });
  }
});

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
