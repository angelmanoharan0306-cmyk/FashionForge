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
  setupNavigationAuth();

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

  function formatCustomerStatus(status) {
    const map = {
      placed: 'Order Placed',
      processing: 'Processing',
      ready: 'Ready to Ship',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Order Cancelled'
    };
    return map[status] || (status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Placed');
  }

  // 5. Render order cards
  if (listContainer) {
    listContainer.innerHTML = orders.map(order => {
      const itemCount = (order.items && order.items.length) || 0;
      const primaryName = (order.items && order.items[0]?.designName) || 'Custom Garment';
      const itemSubtitle = itemCount > 1
        ? `${escapeHtml(primaryName)} + ${itemCount - 1} other item${itemCount > 2 ? 's' : ''}`
        : escapeHtml(primaryName);

      const payStatus = order.paymentStatus || 'pending';
      const ordStatus = order.orderStatus || 'placed';
      const formattedPayStatus = payStatus.charAt(0).toUpperCase() + payStatus.slice(1);
      const formattedOrdStatus = formatCustomerStatus(ordStatus);

      return `
        <article class="order-history-card">
          <div class="order-card-header">
            <div class="order-card-id-block">
              <h3 class="order-ref-id">Order #${escapeHtml(order.orderId)}</h3>
              <span class="order-date-text">Placed on ${formatDate(order.createdAt)}</span>
            </div>
            <div class="order-card-badges" style="display: flex; gap: 8px; flex-wrap: wrap;">
              <span class="badge-status-${payStatus}">Payment: ${formattedPayStatus}</span>
              <span class="badge-status-${ordStatus}">Status: ${formattedOrdStatus}</span>
            </div>
          </div>

          <div class="order-card-divider"></div>

          <div class="order-card-body">
            <div class="order-card-info">
              <div class="order-primary-garment">${itemSubtitle}</div>
              <div class="order-items-count">${itemCount} ${itemCount === 1 ? 'item' : 'items'}</div>
            </div>
            <div class="order-card-pricing">
              <span class="order-price-label">Total</span>
              <span class="order-price-amount">${formatCurrency(order.total)}</span>
            </div>
          </div>

          <div class="order-card-footer" style="display: flex; gap: 8px;">
            <a class="btn-primary order-card-btn" href="order-details.html?orderId=${encodeURIComponent(order.orderId)}" style="flex: 1; justify-content: center;">
              <span>View Order</span>
            </a>
            <a class="btn-secondary order-card-btn" href="order-details.html?orderId=${encodeURIComponent(order.orderId)}" style="flex: 1; justify-content: center;">
              <span>Track Order</span>
            </a>
          </div>
        </article>
      `;
    }).join('');
  }
});
