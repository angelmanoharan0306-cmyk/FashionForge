/**
 * FashionForge — Phase 11: My Orders Controller
 * frontend/js/orders.js
 */

import { orderService } from './services/cart-service.js';
import { authService } from './services/auth-service.js';
import { setupNavigationAuth } from './services/auth-nav.js';

function formatCurrency(val) {
  return '₹' + Number(val || 0).toLocaleString('en-IN');
}

function formatDate(isoStr) {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return String(isoStr);
  }
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

function showAlert(msg) {
  const alertEl = document.getElementById('orders-alert');
  const msgEl = document.getElementById('orders-alert-message');
  if (alertEl && msgEl) {
    msgEl.textContent = msg;
    alertEl.style.display = 'flex';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  setupNavigationAuth('.header-right');

  // 1. Authentication check
  if (!authService.isAuthenticated()) {
    window.location.href = 'login.html?redirect=orders.html';
    return;
  }

  const listContainer = document.getElementById('orders-list');
  const emptyPanel = document.getElementById('orders-empty-state');

  // 2. Fetch orders for current user
  let orders = [];
  try {
    const res = await orderService.getUserOrders();
    orders = Array.isArray(res) ? res : (res.orders || []);
  } catch (err) {
    console.error('Failed to load orders:', err);
    showAlert(err.message || 'Failed to retrieve order history.');
    if (listContainer) listContainer.innerHTML = '';
    return;
  }

  // 3. Handle empty state
  if (!orders || orders.length === 0) {
    if (listContainer) listContainer.style.display = 'none';
    if (emptyPanel) emptyPanel.style.display = 'block';
    return;
  }

  // 4. Ensure newest orders first
  orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  // 5. Render order cards
  if (listContainer) {
    listContainer.innerHTML = orders.map(order => {
      const itemCount = (order.items && order.items.length) || 0;
      const primaryName = (order.items && order.items[0]?.designName) || 'Bespoke Garment';
      const itemSubtitle = itemCount > 1
        ? `${escapeHtml(primaryName)} + ${itemCount - 1} other garment${itemCount > 2 ? 's' : ''}`
        : escapeHtml(primaryName);

      const payStatus = order.paymentStatus || 'pending';
      const ordStatus = order.orderStatus || 'placed';

      return `
        <article class="order-history-card">
          <div class="order-card-header">
            <div class="order-card-id-block">
              <span class="order-ref-label">Order Ref</span>
              <h3 class="order-ref-id">${escapeHtml(order.orderId)}</h3>
              <span class="order-date-text">Placed on ${formatDate(order.createdAt)}</span>
            </div>
            <div class="order-card-badges">
              <span class="badge-status-${payStatus}">${payStatus.toUpperCase()}</span>
              <span class="badge-status-${ordStatus}">${ordStatus.toUpperCase()}</span>
            </div>
          </div>

          <div class="order-card-divider"></div>

          <div class="order-card-body">
            <div class="order-card-info">
              <div class="order-primary-garment">${itemSubtitle}</div>
              <div class="order-items-count">${itemCount} bespoke ${itemCount === 1 ? 'piece' : 'pieces'} commissioned</div>
            </div>
            <div class="order-card-pricing">
              <span class="order-price-label">Order Total</span>
              <span class="order-price-amount">${formatCurrency(order.total)}</span>
            </div>
          </div>

          <div class="order-card-footer">
            <a class="btn-primary order-card-btn" href="order-details.html?orderId=${encodeURIComponent(order.orderId)}">
              <span>View Order Details & Tracking</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </a>
          </div>
        </article>
      `;
    }).join('');
  }
});
