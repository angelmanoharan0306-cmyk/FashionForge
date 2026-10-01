/**
 * FashionForge — Phase 11: Order Confirmation Controller
 * frontend/js/order-confirmation.js
 */

import { cartService } from './services/cart-service.js';
import { authService } from './services/auth-service.js';
import { setupNavigationAuth } from './services/auth-nav.js';
import { renderDesign } from './renderer/renderer.js';
import { GARMENT_CATALOG } from './renderer/garment-data.js';

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
  const alertEl = document.getElementById('confirmation-alert');
  const msgEl = document.getElementById('confirmation-alert-message');
  if (alertEl && msgEl) {
    msgEl.textContent = msg;
    alertEl.style.display = 'flex';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  setupNavigationAuth();

  // 1. Auth check
  if (!authService.isAuthenticated()) {
    const current = encodeURIComponent(window.location.pathname.split('/').pop() + window.location.search);
    window.location.href = `login.html?redirect=${current}`;
    return;
  }

  // 2. Extract orderId
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId');

  if (!orderId) {
    showAlert('No order identifier specified.');
    return;
  }

  // 3. Fetch order from server
  let order = null;
  try {
    const res = await cartService.getOrder(orderId);
    if (res.success && res.order) {
      order = res.order;
    } else if (res.orderId || res.id) {
      order = res;
    } else {
      showAlert(res.message || 'Order details could not be retrieved.');
      return;
    }
  } catch (err) {
    showAlert(err.message || 'Failed to load order confirmation.');
    return;
  }

  // 4. Populate Hero & Metadata
  const idEl = document.getElementById('conf-order-id');
  const dateEl = document.getElementById('conf-order-date');
  const payBadge = document.getElementById('conf-payment-badge');
  const orderBadge = document.getElementById('conf-order-badge');
  const subtotalEl = document.getElementById('conf-subtotal');
  const totalEl = document.getElementById('conf-total');
  const trackBtn = document.getElementById('btn-track-order');

  if (idEl) idEl.textContent = order.orderId;
  if (dateEl) dateEl.textContent = formatDate(order.createdAt);
  if (subtotalEl) subtotalEl.textContent = formatCurrency(order.subtotal);
  if (totalEl) totalEl.textContent = formatCurrency(order.total);

  if (payBadge) {
    payBadge.className = `badge-status-${order.paymentStatus || 'pending'}`;
    payBadge.textContent = (order.paymentStatus || 'pending').toUpperCase();
  }

  if (orderBadge) {
    orderBadge.className = `badge-status-${order.orderStatus || 'placed'}`;
    orderBadge.textContent = (order.orderStatus || 'placed').toUpperCase();
  }

  if (trackBtn) {
    trackBtn.href = `order-details.html?orderId=${encodeURIComponent(order.orderId)}`;
  }

  // 5. Populate Delivery Information
  const deliveryContainer = document.getElementById('conf-delivery-info');
  if (deliveryContainer && order.customer) {
    const c = order.customer;
    const name = c.fullName || c.name || 'Recipient';
    const address = c.shippingAddress || c.address || '—';
    deliveryContainer.innerHTML = `
      <div style="font-size: var(--text-sm); line-height: 1.6; color: var(--color-text-secondary);">
        <div style="font-weight: 600; color: var(--color-text-primary); margin-bottom: 2px;">${escapeHtml(name)}</div>
        <div>${escapeHtml(c.email || '')}</div>
        <div>${escapeHtml(c.phone || '')}</div>
        <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed var(--color-border); font-size: var(--text-xs);">
          <strong>Ship To:</strong><br>
          ${escapeHtml(address)}<br>
          ${escapeHtml(c.city || '')}, ${escapeHtml(c.state || '')} ${escapeHtml(c.postalCode || '')}
        </div>
      </div>
    `;
  }

  // 6. Populate Ordered Garments List
  const itemsContainer = document.getElementById('conf-items-list');
  if (itemsContainer && Array.isArray(order.items)) {
    itemsContainer.innerHTML = order.items.map((item, index) => {
      const cfg = item.configuration || {};
      const topName = GARMENT_CATALOG.tops[cfg.top]?.name || cfg.top || 'Top';
      const bottomName = GARMENT_CATALOG.bottoms[cfg.bottom]?.name || cfg.bottom || 'Bottom';
      const fabricName = GARMENT_CATALOG.fabrics[cfg.fabric]?.name || cfg.fabric || 'Fabric';

      return `
        <div class="cart-item-card conf-item-card" data-index="${index}" style="margin-bottom: var(--space-3);">
          <div class="cart-item-preview">
            <svg class="conf-item-svg-${index}" viewBox="85 70 600 1240" aria-label="Garment preview"></svg>
          </div>
          <div class="cart-item-info">
            <h3 class="cart-item-title">${escapeHtml(item.designName)}</h3>
            <div class="cart-item-tags">
              <span class="cart-item-tag">${escapeHtml(cfg.figure || cfg.gender || 'female')} • ${escapeHtml(cfg.size || 'M')}</span>
              <span class="cart-item-tag">${escapeHtml(topName)} + ${escapeHtml(bottomName)}</span>
              <span class="cart-item-tag">${escapeHtml(fabricName)}</span>
              <span class="cart-item-tag" style="display: inline-flex; align-items: center; gap: 4px;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${escapeHtml(cfg.colour || '#b96b61')}; border: 1px solid rgba(0,0,0,0.2);"></span>
                ${escapeHtml(cfg.colour || 'Colour')}
              </span>
            </div>
            <div class="cart-item-price-unit" style="margin-top: 4px;">
              Unit: ${formatCurrency(item.unitPrice)} × ${item.quantity}
            </div>
          </div>
          <div class="cart-item-actions">
            <div class="cart-item-total">${formatCurrency(item.totalPrice)}</div>
          </div>
        </div>
      `;
    }).join('');

    // Render 2.5D SVG previews for each garment item
    order.items.forEach((item, index) => {
      const svgEl = itemsContainer.querySelector(`.conf-item-svg-${index}`);
      if (svgEl && item.configuration) {
        try {
          renderDesign(item.configuration, svgEl);
        } catch (err) {
          console.warn('Garment SVG render warning:', err);
        }
      }
    });
  }
});
