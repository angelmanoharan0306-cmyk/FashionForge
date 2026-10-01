/**
 * FashionForge — Cart Page Controller
 * Renders shopping bag items, handles quantity updates, item deletions,
 * and coordinates checkout transitions.
 */

import { getCart, updateCartItemQuantity, removeCartItem, clearCart } from './services/cart-service.js';
import { isAuthenticated } from './services/auth-service.js';
import { setupNavigationAuth } from './services/auth-nav.js';
import { renderDesign } from './renderer/renderer.js';
import { GARMENT_CATALOG } from './renderer/garment-data.js';

function showToast(message) {
  const container = document.querySelector('#toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'studio-toast';
  toast.innerHTML = `
    <svg class="toast-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 200ms ease';
    setTimeout(() => toast.remove(), 250);
  }, 2800);
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getItemSummaryText(config = {}) {
  const topName = GARMENT_CATALOG.tops[config.top]?.name || config.top || 'Top';
  const bottomName = GARMENT_CATALOG.bottoms[config.bottom]?.name || config.bottom || 'Bottom';
  const fabricName = GARMENT_CATALOG.fabrics[config.fabric]?.name || config.fabric || 'Fabric';
  const patternName = GARMENT_CATALOG.patterns[config.pattern]?.name || config.pattern || 'Solid';
  const genderLabel = (config.gender === 'male' || config.figure === 'male') ? 'Menswear' : 'Womenswear';

  return `${topName} • ${bottomName} • ${fabricName} • ${patternName} • ${genderLabel} (Size ${config.size || 'M'})`;
}

export async function loadAndRenderCart() {
  const loadingEl = document.querySelector('#cart-loading');
  const emptyStateEl = document.querySelector('#cart-empty-state');
  const layoutGrid = document.querySelector('#cart-layout-grid');
  const itemsContainer = document.querySelector('#cart-items-container');
  const btnClear = document.querySelector('#btn-clear-cart');

  const subtotalEl = document.querySelector('#summary-subtotal');
  const totalEl = document.querySelector('#summary-total');
  const countEl = document.querySelector('#summary-items-count');

  if (!isAuthenticated()) {
    if (loadingEl) loadingEl.style.display = 'none';
    if (layoutGrid) layoutGrid.style.display = 'none';
    if (btnClear) btnClear.style.display = 'none';
    if (emptyStateEl) {
      emptyStateEl.style.display = 'flex';
      emptyStateEl.innerHTML = `
        <div class="empty-icon-wrap" style="background: var(--color-brand-tint); color: var(--color-brand);">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h3 class="empty-title">Sign In to View Your Shopping Bag</h3>
        <p class="empty-copy">Sign in to view items placed in your shopping bag and proceed to checkout.</p>
        <div style="display: flex; gap: var(--space-3); margin-top: var(--space-4);">
          <a class="btn-primary" href="login.html?redirect=cart.html">
            <span>Sign In</span>
          </a>
          <a class="btn-secondary" href="login.html?tab=register&redirect=cart.html">
            <span>Create Account</span>
          </a>
        </div>
      `;
    }
    return;
  }

  try {
    const res = await getCart();
    const cart = (res && res.cart) ? res.cart : (res || {});
    if (loadingEl) loadingEl.style.display = 'none';

    const items = cart.items || [];

    if (items.length === 0) {
      if (layoutGrid) layoutGrid.style.display = 'none';
      if (btnClear) btnClear.style.display = 'none';
      if (emptyStateEl) emptyStateEl.style.display = 'flex';
      return;
    }

    if (emptyStateEl) emptyStateEl.style.display = 'none';
    if (layoutGrid) layoutGrid.style.display = 'grid';
    if (btnClear) btnClear.style.display = 'inline-block';

    // Update summary values
    if (subtotalEl) subtotalEl.textContent = `₹${(cart.subtotal || 0).toLocaleString('en-IN')}`;
    if (totalEl) totalEl.textContent = `₹${(cart.total || 0).toLocaleString('en-IN')}`;
    if (countEl) countEl.textContent = String(cart.totalItems || items.length);

    // Render line items
    if (itemsContainer) {
      itemsContainer.innerHTML = '';
      items.forEach(item => {
        const itemCard = createCartItemElement(item);
        itemsContainer.appendChild(itemCard);

        // Render mini 2.5D SVG thumbnail
        const svgEl = itemCard.querySelector('.cart-item-preview-svg');
        if (svgEl && item.configuration) {
          try {
            renderDesign(item.configuration, svgEl);
          } catch (err) {
            console.warn('Mini SVG render error:', err);
          }
        }
      });
    }
  } catch (err) {
    if (loadingEl) loadingEl.innerHTML = `<p style="color: var(--color-brand);">Failed to load shopping bag: ${escapeHtml(err.message)}</p>`;
  }
}

function createCartItemElement(item) {
  const card = document.createElement('article');
  card.className = 'cart-item-card';
  card.dataset.itemId = item.cartItemId;

  const config = item.configuration || {};
  const isMale = (config.gender === 'male' || config.figure === 'male');
  const summary = getItemSummaryText(config);
  const unitPriceFormatted = `₹${(item.unitPrice || 0).toLocaleString('en-IN')}`;
  const lineTotalFormatted = `₹${(item.totalPrice || 0).toLocaleString('en-IN')}`;

  card.innerHTML = `
    <!-- Thumbnail Preview Frame -->
    <div class="cart-item-thumb-frame">
      <svg class="cart-item-preview-svg" viewBox="85 70 600 1240" aria-label="Garment preview of ${escapeHtml(item.designName)}"></svg>
      <div class="mydesigns-color-indicator" style="background-color: ${escapeHtml(config.colour || '#ffffff')};" title="Base colour"></div>
    </div>

    <!-- Info & Controls -->
    <div class="cart-item-details">
      <div class="cart-item-header">
        <div>
          <span class="mydesigns-gender-badge ${isMale ? 'badge-male' : 'badge-female'}" style="margin-bottom: 4px;">
            ${isMale ? 'Male' : 'Female'} • ${escapeHtml(config.size || 'M')}
          </span>
          <h3 class="cart-item-title">${escapeHtml(item.designName)}</h3>
          <p class="cart-item-specs">${escapeHtml(summary)}</p>
        </div>
        <div class="cart-item-price-block">
          <span class="cart-item-line-total">${lineTotalFormatted}</span>
          <span class="cart-item-unit-price">${unitPriceFormatted} each</span>
        </div>
      </div>

      <div class="cart-item-footer">
        <div class="cart-qty-control" role="group" aria-label="Quantity controls for ${escapeHtml(item.designName)}">
          <button class="cart-qty-btn btn-qty-minus" type="button" aria-label="Decrease quantity" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
          <span class="cart-qty-value">${item.quantity}</span>
          <button class="cart-qty-btn btn-qty-plus" type="button" aria-label="Increase quantity">+</button>
        </div>

        <button class="btn-ghost btn-remove-cart-item" type="button" style="color: #b91c1c; font-size: var(--text-xs); padding: 4px 8px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          <span>Remove</span>
        </button>
      </div>
    </div>
  `;

  // Attach Quantity & Remove Handlers
  const btnMinus = card.querySelector('.btn-qty-minus');
  const btnPlus = card.querySelector('.btn-qty-plus');
  const btnRemove = card.querySelector('.btn-remove-cart-item');

  btnMinus?.addEventListener('click', async () => {
    if (item.quantity > 1) {
      try {
        await updateCartItemQuantity(item.cartItemId, item.quantity - 1);
        await loadAndRenderCart();
      } catch (err) {
        showToast(err.message);
      }
    }
  });

  btnPlus?.addEventListener('click', async () => {
    try {
      await updateCartItemQuantity(item.cartItemId, item.quantity + 1);
      await loadAndRenderCart();
    } catch (err) {
      showToast(err.message);
    }
  });

  btnRemove?.addEventListener('click', async () => {
    try {
      await removeCartItem(item.cartItemId);
      showToast(`Removed "${item.designName}" from bag`);
      await loadAndRenderCart();
    } catch (err) {
      showToast(err.message);
    }
  });

  return card;
}

document.addEventListener('DOMContentLoaded', () => {
  setupNavigationAuth();
  loadAndRenderCart();

  const btnClear = document.querySelector('#btn-clear-cart');
  if (btnClear) {
    btnClear.addEventListener('click', async () => {
      if (confirm('Are you sure you want to clear your shopping bag?')) {
        try {
          await clearCart();
          showToast('Shopping bag cleared');
          await loadAndRenderCart();
        } catch (err) {
          showToast(err.message);
        }
      }
    });
  }
});
