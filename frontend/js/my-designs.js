/**
 * FashionForge — My Designs Portfolio Controller
 *
 * Implements the presentation, thumbnail rendering, duplicate, delete,
 * filtering, and restoration navigation for saved bespoke garment designs.
 */

import {
  getSavedDesigns,
  getDesignById,
  deleteDesign,
  duplicateDesign
} from './services/design-storage.js';

import { isAuthenticated, getCurrentUser } from './services/auth-service.js';
import { setupNavigationAuth } from './services/auth-nav.js';
import { cartService } from './services/cart-service.js';
import { renderDesign } from './renderer/renderer.js';
import { GARMENT_CATALOG } from './renderer/garment-data.js';

let activeFilter = 'all'; // 'all' | 'female' | 'male'
let currentSearch = '';
let pendingDeleteId = null;

/**
 * Formats ISO date into readable atelier format
 * e.g. "Oct 1, 2026 • 8:30 PM"
 */
function formatDate(isoString) {
  if (!isoString) return 'Recently';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (err) {
    return 'Recently';
  }
}

/**
 * Toast Notification Helper
 */
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

/**
 * Builds the human-readable configuration summary line
 */
function getSummaryText(design) {
  const topName = GARMENT_CATALOG.tops[design.top]?.name || design.top || 'Top';
  const bottomName = GARMENT_CATALOG.bottoms[design.bottom]?.name || design.bottom || 'Bottom';
  const fabricName = GARMENT_CATALOG.fabrics[design.fabric]?.name || design.fabric || 'Fabric';
  const patternName = GARMENT_CATALOG.patterns[design.pattern]?.name || design.pattern || 'Solid';
  const genderLabel = (design.gender === 'male' || design.figure === 'male') ? 'Menswear' : 'Womenswear';

  return `${topName} • ${bottomName} • ${fabricName} • ${patternName} • ${genderLabel} (Size ${design.size || 'M'})`;
}

/**
 * Renders all saved designs into the grid
 */
export async function renderDesignsGrid() {
  const grid = document.querySelector('#designs-grid');
  const emptyState = document.querySelector('#empty-designs-state');
  const countBadge = document.querySelector('#designs-count-badge');
  if (!grid) return;

  if (!isAuthenticated()) {
    grid.style.display = 'none';
    if (countBadge) countBadge.textContent = 'Sign In Required';
    if (emptyState) {
      emptyState.style.display = 'flex';
      emptyState.innerHTML = `
        <div class="empty-designs-card">
          <div class="empty-icon-wrap" style="background: var(--color-brand-tint); color: var(--color-brand);">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h3 class="empty-title">Atelier Sign-In Required</h3>
          <p class="empty-copy">Sign in to your FashionForge account to access your private collection of saved bespoke garments and CAD flats.</p>
          <div style="display: flex; gap: var(--space-3); margin-top: var(--space-4);">
            <a class="btn-primary" href="login.html?redirect=my-designs.html">
              <span>Sign In to Atelier</span>
            </a>
            <a class="btn-secondary" href="login.html?tab=register&redirect=my-designs.html">
              <span>Create Account</span>
            </a>
          </div>
        </div>
      `;
    }
    return;
  }

  const allDesigns = await getSavedDesigns();

  // Apply filters & search
  const filtered = allDesigns.filter(d => {
    const isMale = (d.gender === 'male' || d.figure === 'male' || d.croquis === 'male');
    if (activeFilter === 'female' && isMale) return false;
    if (activeFilter === 'male' && !isMale) return false;

    if (currentSearch.trim()) {
      const q = currentSearch.toLowerCase().trim();
      const name = (d.name || '').toLowerCase();
      const styleId = (d.styleId || d.id || '').toLowerCase();
      const fabric = (d.fabric || '').toLowerCase();
      if (!name.includes(q) && !styleId.includes(q) && !fabric.includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Update counter
  if (countBadge) {
    countBadge.textContent = `${allDesigns.length} ${allDesigns.length === 1 ? 'Design' : 'Designs'}`;
  }

  // Handle empty states
  if (allDesigns.length === 0) {
    grid.style.display = 'none';
    if (emptyState) emptyState.style.display = 'flex';
    return;
  }

  if (filtered.length === 0) {
    grid.style.display = 'flex';
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: var(--space-12) var(--space-4); color: var(--color-text-secondary);">
        <p style="font-size: var(--text-base); font-weight: 600; margin-bottom: var(--space-2);">No designs matching "${escapeHtml(currentSearch)}"</p>
        <p style="font-size: var(--text-sm); color: var(--color-text-muted);">Try adjusting your filter or search query.</p>
      </div>
    `;
    if (emptyState) emptyState.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  grid.style.display = 'grid';
  grid.innerHTML = '';

  // Render cards
  filtered.forEach(design => {
    const card = createDesignCardElement(design);
    grid.appendChild(card);

    // Render 2.5D preview into card's SVG viewport
    const svgEl = card.querySelector('.design-card-preview-svg');
    if (svgEl) {
      try {
        renderDesign(design, svgEl);
      } catch (err) {
        console.warn('Card preview render error:', err);
      }
    }
  });
}

/**
 * Creates DOM element for a single design card
 */
function createDesignCardElement(design) {
  const card = document.createElement('article');
  card.className = 'mydesigns-card';
  card.dataset.designId = design.id;

  const isMale = (design.gender === 'male' || design.figure === 'male' || design.croquis === 'male');
  const priceDisplay = `₹${(design.price || 1480).toLocaleString('en-IN')}`;
  const dateDisplay = formatDate(design.updatedAt || design.createdAt);
  const summaryDisplay = getSummaryText(design);

  card.innerHTML = `
    <!-- Top Preview Thumbnail Area -->
    <div class="mydesigns-card-thumb-wrap">
      <div class="mydesigns-badge-group">
        <span class="mydesigns-gender-badge ${isMale ? 'badge-male' : 'badge-female'}">
          ${isMale ? 'Male' : 'Female'} • ${design.size || 'M'}
        </span>
        <span class="mydesigns-id-badge">${escapeHtml(design.styleId || design.id)}</span>
      </div>

      <div class="mydesigns-svg-frame">
        <svg class="design-card-preview-svg" viewBox="85 70 600 1240" aria-label="Garment preview of ${escapeHtml(design.name)}"></svg>
      </div>

      <div class="mydesigns-color-indicator" style="background-color: ${escapeHtml(design.colour || '#b96b61')};" title="Base colour: ${escapeHtml(design.colour || '#b96b61')}"></div>
    </div>

    <!-- Body Information Area -->
    <div class="mydesigns-card-body">
      <div class="mydesigns-card-header">
        <h3 class="mydesigns-card-title" title="${escapeHtml(design.name)}">${escapeHtml(design.name)}</h3>
        <p class="mydesigns-card-price">${priceDisplay}</p>
      </div>

      <p class="mydesigns-card-summary">${escapeHtml(summaryDisplay)}</p>

      <div class="mydesigns-card-meta">
        <span class="mydesigns-date">Saved ${dateDisplay}</span>
      </div>

      <!-- Action Buttons Toolbar -->
      <div class="mydesigns-card-actions">
        <a class="btn-primary mydesigns-action-btn btn-open-design" href="design.html?id=${encodeURIComponent(design.id)}" title="Open design in 2.5D Studio">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          <span>Open / Edit</span>
        </a>

        <button class="btn-secondary mydesigns-action-btn btn-add-cart-card" type="button" data-id="${escapeHtml(design.id)}" title="Add to shopping bag">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span>Bag</span>
        </button>

        <button class="btn-secondary mydesigns-action-btn btn-duplicate-design" type="button" data-id="${escapeHtml(design.id)}" title="Duplicate this design">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="13" height="13" x="9" y="9" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          <span>Duplicate</span>
        </button>

        <button class="btn-danger-icon mydesigns-action-btn btn-delete-design" type="button" data-id="${escapeHtml(design.id)}" data-name="${escapeHtml(design.name)}" title="Delete design" aria-label="Delete ${escapeHtml(design.name)}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  `;

  // Attach event handlers
  const btnCart = card.querySelector('.btn-add-cart-card');
  if (btnCart) {
    btnCart.addEventListener('click', async () => {
      try {
        btnCart.disabled = true;
        const res = await cartService.addToCart(design.id, 1);
        if (res.success) {
          showToast(`Added "${design.name}" to shopping bag!`);
        } else {
          showToast(res.message || 'Failed to add to bag', 'error');
        }
      } catch (err) {
        showToast(err.message || 'Failed to add to bag', 'error');
      } finally {
        btnCart.disabled = false;
      }
    });
  }

  const btnDup = card.querySelector('.btn-duplicate-design');
  if (btnDup) {
    btnDup.addEventListener('click', () => handleDuplicateDesign(design.id));
  }

  const btnDel = card.querySelector('.btn-delete-design');
  if (btnDel) {
    btnDel.addEventListener('click', () => openDeleteModal(design.id, design.name));
  }

  return card;
}

/**
 * Duplicate action handler
 */
export async function handleDuplicateDesign(id) {
  try {
    const copy = await duplicateDesign(id);
    if (copy) {
      await renderDesignsGrid();
      showToast(`Created duplicate "${copy.name}"`);
    } else {
      showToast('Failed to duplicate design');
    }
  } catch (err) {
    console.error('Duplicate design error:', err);
    showToast('Failed to duplicate design');
  }
}

/**
 * Opens delete confirmation modal
 */
export function openDeleteModal(id, name) {
  pendingDeleteId = id;
  const modal = document.querySelector('#modal-delete-design');
  const promptText = document.querySelector('#delete-design-prompt');

  if (promptText) {
    promptText.textContent = `Are you sure you want to delete "${name}"? This action will permanently remove it from your atelier portfolio.`;
  }

  modal?.classList.add('is-open');
}

/**
 * Closes delete confirmation modal
 */
export function closeDeleteModal() {
  pendingDeleteId = null;
  const modal = document.querySelector('#modal-delete-design');
  modal?.classList.remove('is-open');
}

/**
 * Confirms deletion of currently selected design
 */
export async function confirmDeleteDesign() {
  if (!pendingDeleteId) return;

  try {
    const target = await getDesignById(pendingDeleteId);
    const targetName = target?.name || 'Design';
    const success = await deleteDesign(pendingDeleteId);

    closeDeleteModal();

    if (success) {
      await renderDesignsGrid();
      showToast(`Deleted "${targetName}" from atelier portfolio`);
    } else {
      showToast('Failed to delete design');
    }
  } catch (err) {
    console.error('Delete design error:', err);
    showToast('Failed to delete design');
  }
}

/**
 * HTML Escaping utility for security
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ==========================================================================
   EVENT WIRING & INITIALIZATION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 0. Setup User Navigation Auth Widget
  setupNavigationAuth('.header-right');

  // 1. Initial Render
  renderDesignsGrid();

  // 2. Filter Pills
  document.querySelectorAll('.filter-pill[data-filter]').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      activeFilter = pill.dataset.filter;
      renderDesignsGrid();
    });
  });

  // 3. Search Input
  const searchInput = document.querySelector('#designs-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      renderDesignsGrid();
    });
  }

  // 4. Delete Confirmation Modal Actions
  const btnCloseDelete = document.querySelector('#btn-close-delete-modal');
  const btnCancelDelete = document.querySelector('#btn-cancel-delete');
  const btnConfirmDelete = document.querySelector('#btn-confirm-delete');

  if (btnCloseDelete) btnCloseDelete.addEventListener('click', closeDeleteModal);
  if (btnCancelDelete) btnCancelDelete.addEventListener('click', closeDeleteModal);
  if (btnConfirmDelete) btnConfirmDelete.addEventListener('click', confirmDeleteDesign);

  // Close modals on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDeleteModal();
    }
  });
});
