/**
 * FashionForge — Phase 11: Order Details & Tracking Controller
 * frontend/js/order-details.js
 */

import { orderService } from './services/cart-service.js';
import { authService } from './services/auth-service.js';
import { setupNavigationAuth } from './services/auth-nav.js';
import { renderDesign } from './renderer/renderer.js';
import { GARMENT_CATALOG } from './renderer/garment-data.js';

const ORDER_LIFECYCLE = ['placed', 'processing', 'ready', 'shipped', 'delivered'];

const STATUS_LABELS = {
  placed: 'Bespoke Order Placed',
  processing: 'Artisan Workshop Cutting & Assembly',
  ready: 'Garment Finishing & Quality Inspection',
  shipped: 'Dispatched via Insured Atelier Courier',
  delivered: 'Delivered to Recipient'
};

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
  const alertEl = document.getElementById('order-details-alert');
  const msgEl = document.getElementById('order-details-alert-message');
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

  // 2. Extract orderId from URL
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId');

  if (!orderId) {
    showAlert('No order identifier specified.');
    return;
  }

  // 3. Fetch order from server
  let currentOrder = null;
  try {
    const res = await orderService.getOrder(orderId);
    if (res.success && res.order) {
      currentOrder = res.order;
    } else if (res.orderId || res.id) {
      currentOrder = res;
    } else {
      showAlert(res.message || 'Order details could not be retrieved.');
      return;
    }
  } catch (err) {
    showAlert(err.message || 'Failed to load order details.');
    return;
  }

  // 4. Populate UI elements
  renderOrderHeader(currentOrder);
  renderTrackingTimeline(currentOrder);
  renderCustomerDelivery(currentOrder);
  renderPricing(currentOrder);
  renderGarmentItems(currentOrder);

  // 5. Wire status advance simulation button
  const advanceBtn = document.getElementById('btn-advance-status');
  if (advanceBtn) {
    advanceBtn.addEventListener('click', async () => {
      const currentStatus = currentOrder.orderStatus || 'placed';
      const currentIndex = ORDER_LIFECYCLE.indexOf(currentStatus);

      if (currentIndex === -1 || currentIndex >= ORDER_LIFECYCLE.length - 1) {
        showToast('Order is already at the final delivery stage.', 'info');
        return;
      }

      const nextStatus = ORDER_LIFECYCLE[currentIndex + 1];

      advanceBtn.disabled = true;
      advanceBtn.textContent = 'Advancing Status...';

      try {
        const res = await orderService.advanceOrderStatus(currentOrder.orderId, nextStatus);
        if (res.success && res.order) {
          currentOrder = res.order;
          showToast(`Advanced to "${nextStatus.toUpperCase()}"!`, 'success');
          renderOrderHeader(currentOrder);
          renderTrackingTimeline(currentOrder);
        } else {
          showToast(res.message || 'Failed to advance status', 'error');
        }
      } catch (err) {
        showToast(err.message || 'Failed to advance status', 'error');
      } finally {
        advanceBtn.disabled = false;
        updateAdvanceButtonState(currentOrder);
      }
    });
  }

  function renderOrderHeader(order) {
    const titleEl = document.getElementById('det-order-title');
    const payBadge = document.getElementById('det-pay-badge');
    const ordBadge = document.getElementById('det-ord-badge');

    if (titleEl) titleEl.textContent = order.orderId;

    if (payBadge) {
      const pStatus = order.paymentStatus || 'pending';
      payBadge.className = `badge-status-${pStatus}`;
      payBadge.textContent = pStatus.toUpperCase();
    }

    if (ordBadge) {
      const oStatus = order.orderStatus || 'placed';
      ordBadge.className = `badge-status-${oStatus}`;
      ordBadge.textContent = oStatus.toUpperCase();
    }
  }

  function renderTrackingTimeline(order) {
    const currentStatus = order.orderStatus || 'placed';
    const currentIndex = ORDER_LIFECYCLE.indexOf(currentStatus);

    const steps = document.querySelectorAll('.timeline-step');
    steps.forEach(step => {
      const stepStatus = step.dataset.status;
      const stepIndex = ORDER_LIFECYCLE.indexOf(stepStatus);

      step.classList.remove('step-completed', 'step-active', 'step-pending');

      if (stepIndex < currentIndex) {
        step.classList.add('step-completed');
      } else if (stepIndex === currentIndex) {
        step.classList.add('step-active');
      } else {
        step.classList.add('step-pending');
      }
    });

    // Update latest event text
    const eventTimeEl = document.getElementById('tracking-event-time');
    const eventTextEl = document.getElementById('tracking-event-text');

    const trackingList = order.tracking || [];
    const latestEvent = trackingList[trackingList.length - 1];

    if (latestEvent) {
      if (eventTimeEl) eventTimeEl.textContent = formatDate(latestEvent.timestamp);
      if (eventTextEl) eventTextEl.textContent = latestEvent.label || STATUS_LABELS[currentStatus] || currentStatus;
    } else {
      if (eventTimeEl) eventTimeEl.textContent = formatDate(order.createdAt);
      if (eventTextEl) eventTextEl.textContent = STATUS_LABELS[currentStatus] || 'Order registered in atelier queue.';
    }

    updateAdvanceButtonState(order);
  }

  function updateAdvanceButtonState(order) {
    const advanceBtn = document.getElementById('btn-advance-status');
    if (!advanceBtn) return;

    const currentStatus = order.orderStatus || 'placed';
    const currentIndex = ORDER_LIFECYCLE.indexOf(currentStatus);

    if (currentIndex >= ORDER_LIFECYCLE.length - 1) {
      advanceBtn.disabled = true;
      advanceBtn.innerHTML = `<span>Delivered (Terminal Phase)</span>`;
      advanceBtn.style.opacity = '0.6';
      advanceBtn.style.cursor = 'not-allowed';
    } else {
      const nextStatus = ORDER_LIFECYCLE[currentIndex + 1];
      advanceBtn.disabled = false;
      advanceBtn.innerHTML = `
        <span>Advance to "${nextStatus.toUpperCase()}" (Demo)</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      `;
      advanceBtn.style.opacity = '1';
      advanceBtn.style.cursor = 'pointer';
    }
  }

  function renderCustomerDelivery(order) {
    const container = document.getElementById('det-customer-block');
    if (!container || !order.customer) return;

    const c = order.customer;
    const name = c.fullName || c.name || 'Recipient';
    const address = c.shippingAddress || c.address || '—';

    container.innerHTML = `
      <div style="font-size: var(--text-sm); line-height: 1.6; color: var(--color-text-secondary);">
        <div style="font-weight: 600; color: var(--color-text-primary); margin-bottom: 2px;">${escapeHtml(name)}</div>
        <div>${escapeHtml(c.email || '')}</div>
        <div>${escapeHtml(c.phone || '')}</div>
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--color-border); font-size: var(--text-xs);">
          <strong>Delivery Destination:</strong><br>
          ${escapeHtml(address)}<br>
          ${escapeHtml(c.city || '')}, ${escapeHtml(c.state || '')} ${escapeHtml(c.postalCode || '')}
        </div>
      </div>
    `;
  }

  function renderPricing(order) {
    const subtotalEl = document.getElementById('det-subtotal');
    const totalEl = document.getElementById('det-total');

    if (subtotalEl) subtotalEl.textContent = formatCurrency(order.subtotal);
    if (totalEl) totalEl.textContent = formatCurrency(order.total);
  }

  function renderGarmentItems(order) {
    const container = document.getElementById('det-items-list');
    if (!container || !Array.isArray(order.items)) return;

    container.innerHTML = order.items.map((item, index) => {
      const cfg = item.configuration || {};
      const topName = GARMENT_CATALOG.tops[cfg.top]?.name || cfg.top || 'Top';
      const bottomName = GARMENT_CATALOG.bottoms[cfg.bottom]?.name || cfg.bottom || 'Bottom';
      const fabricName = GARMENT_CATALOG.fabrics[cfg.fabric]?.name || cfg.fabric || 'Fabric';

      return `
        <div class="cart-item-card det-item-card" data-index="${index}" style="margin-bottom: var(--space-4);">
          <div class="cart-item-preview">
            <svg class="det-item-svg-${index}" viewBox="85 70 600 1240" aria-label="Garment preview"></svg>
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
            <div class="cart-item-price-unit" style="margin-top: 6px;">
              Unit Price: ${formatCurrency(item.unitPrice)} × ${item.quantity}
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
      const svgEl = container.querySelector(`.det-item-svg-${index}`);
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
