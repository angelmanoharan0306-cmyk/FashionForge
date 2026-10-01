/**
 * FashionForge — Navigation Auth Widget
 * Dynamically renders user authentication badge, Bag count, or sign-in buttons across pages.
 */

import { isAuthenticated, getCurrentUser, logout } from './auth-service.js';
import { registerServiceWorker } from './pwa.js';

// Auto-register PWA service worker across all pages
if (typeof window !== 'undefined') {
  registerServiceWorker();
}

export async function updateNavBagCount() {
  const badge = document.querySelector('#nav-bag-count');
  if (!badge) return;
  if (!isAuthenticated()) {
    badge.style.display = 'none';
    return;
  }
  try {
    const token = localStorage.getItem('fashionforge_auth_token');
    if (!token) return;
    const res = await fetch('/api/cart', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    if (!res.ok) return;
    const data = await res.json();
    const cart = data.cart || data;
    const count = (cart && cart.totalItems !== undefined)
      ? cart.totalItems
      : (cart && cart.items ? cart.items.reduce((s, i) => s + (i.quantity || 1), 0) : 0);
    if (count > 0) {
      badge.textContent = String(count);
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  } catch {
    // Ignore network interruptions
  }
}

if (typeof window !== 'undefined') {
  window.updateNavBagCount = updateNavBagCount;
}

export function setupNavigationAuth(mountSelector) {
  let mountEl = null;
  if (mountSelector) {
    mountEl = document.querySelector(mountSelector);
  }
  if (!mountEl) {
    mountEl = document.querySelector('.header-right, .studio-header-right, .home-nav-actions');
  }
  if (!mountEl) return;

  const isHome = mountEl.classList.contains('home-nav-actions') ||
                 window.location.pathname === '/' ||
                 window.location.pathname.endsWith('index.html');

  // If mounting into .home-nav-actions on index.html, remove stale static login link
  const staticLogin = mountEl.querySelector('a.home-nav-link[href="login.html"], a[href="login.html"]');
  if (staticLogin && isHome) {
    staticLogin.remove();
  }

  // Check if auth container already exists, or create one
  let authWidget = mountEl.querySelector('#nav-auth-widget');
  if (!authWidget) {
    authWidget = document.createElement('div');
    authWidget.id = 'nav-auth-widget';
    authWidget.style.display = 'inline-flex';
    authWidget.style.alignItems = 'center';
    authWidget.style.gap = '8px';

    // In .home-nav-actions, place before the primary "Start Designing" CTA button
    const startDesigningBtn = mountEl.querySelector('a.btn-primary[href="design.html"]');
    if (startDesigningBtn && isHome) {
      mountEl.insertBefore(authWidget, startDesigningBtn);
    } else {
      mountEl.appendChild(authWidget);
    }
  }

  const authenticated = isAuthenticated();
  const user = getCurrentUser() || { name: 'Account' };

  if (isHome) {
    // -------------------------------------------------------------
    // MARKETING HEADER (Home Page): Clean, No internal app clutter
    // -------------------------------------------------------------
    if (authenticated) {
      const displayName = user.name || 'Account';
      const initials = displayName.charAt(0).toUpperCase();

      authWidget.innerHTML = `
        <div class="user-account-badge" id="nav-user-account" title="Signed in as ${user.email || displayName}" aria-label="Account">
          <span class="user-avatar-circle" aria-hidden="true">${initials}</span>
          <span class="user-account-label" style="font-weight: 600;">${displayName}</span>
          <button class="btn-auth-logout" id="btn-header-logout" type="button" title="Sign out">Sign Out</button>
        </div>
      `;

      const btnLogout = authWidget.querySelector('#btn-header-logout');
      if (btnLogout) {
        btnLogout.addEventListener('click', () => {
          logout();
          window.location.href = 'index.html';
        });
      }
    } else {
      authWidget.innerHTML = `
        <a class="home-nav-link" href="login.html" style="font-size: var(--text-sm); margin-right: var(--space-2);">Sign In</a>
      `;
    }
    return;
  }

  // -----------------------------------------------------------------
  // APPLICATION & STUDIO HEADER: My Orders, Bag, Account, Sign Out
  // -----------------------------------------------------------------
  if (authenticated) {
    const displayName = user.name || 'Account';
    const initials = displayName.charAt(0).toUpperCase();

    authWidget.innerHTML = `
      <a class="header-action-btn btn-header-orders" href="orders.html" title="My Orders & Tracking" aria-label="My Orders" style="display: inline-flex; align-items: center; gap: 6px; text-decoration: none; padding: 4px 10px; font-size: var(--text-xs); color: inherit;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        <span>My Orders</span>
      </a>
      <a class="header-action-btn btn-header-cart" href="cart.html" title="Shopping Bag" aria-label="Bag" style="display: inline-flex; align-items: center; gap: 6px; text-decoration: none; padding: 4px 10px; font-size: var(--text-xs); color: inherit;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span>Bag</span>
        <span class="nav-bag-count-badge" id="nav-bag-count" style="display: none; background: var(--color-brand); color: #fff; border-radius: 999px; padding: 1px 6px; font-size: 10px; font-weight: 700; line-height: 1.2;"></span>
      </a>
      <div class="user-account-badge" id="nav-user-account" title="Signed in as ${user.email || displayName}" aria-label="Account">
        <span class="user-avatar-circle" aria-hidden="true">${initials}</span>
        <span class="user-account-label" style="font-weight: 600;">Account</span>
        <span class="user-name" style="color: var(--color-text-secondary); font-size: var(--text-xs); margin-left: 2px;">(${displayName})</span>
        <button class="btn-auth-logout" id="btn-header-logout" type="button" title="Sign out">Sign Out</button>
      </div>
    `;

    const btnLogout = authWidget.querySelector('#btn-header-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        logout();
        window.location.href = 'index.html';
      });
    }

    // Refresh bag count
    updateNavBagCount();
  } else {
    // Current page path for redirect after login
    const currentPath = window.location.pathname.split('/').pop() || 'design.html';
    const redirectParam = encodeURIComponent(currentPath + window.location.search);

    authWidget.innerHTML = `
      <a class="btn-ghost" href="login.html?redirect=${redirectParam}" style="font-size: var(--text-xs); padding: 6px 12px;" title="Sign into FashionForge">
        <span>Sign In</span>
      </a>
      <a class="btn-primary" href="login.html?tab=register&redirect=${redirectParam}" style="font-size: var(--text-xs); padding: 6px 12px;" title="Register Account">
        <span>Register</span>
      </a>
    `;
  }
}
