/**
 * FashionForge — Navigation Auth Widget
 * Dynamically renders user authentication badge or sign-in buttons across pages.
 */

import { isAuthenticated, getCurrentUser, logout } from './auth-service.js';

export function setupNavigationAuth(mountSelector = '.header-right') {
  const mountEl = document.querySelector(mountSelector);
  if (!mountEl) return;

  // Check if auth container already exists, or create one
  let authWidget = mountEl.querySelector('#nav-auth-widget');
  if (!authWidget) {
    authWidget = document.createElement('div');
    authWidget.id = 'nav-auth-widget';
    authWidget.style.display = 'inline-flex';
    authWidget.style.alignItems = 'center';
    authWidget.style.gap = '8px';
    mountEl.appendChild(authWidget);
  }

  const authenticated = isAuthenticated();
  const user = getCurrentUser();

  if (authenticated && user) {
    const initials = (user.name || 'U').charAt(0).toUpperCase();
    authWidget.innerHTML = `
      <div class="user-account-badge" title="Signed in as ${user.email || user.name}">
        <span class="user-avatar-circle" aria-hidden="true">${initials}</span>
        <span class="user-name">${user.name}</span>
        <button class="btn-auth-logout" id="btn-header-logout" type="button" title="Sign out of atelier">Sign Out</button>
      </div>
    `;

    const btnLogout = authWidget.querySelector('#btn-header-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        logout();
        window.location.reload();
      });
    }
  } else {
    // Current page path for redirect after login
    const currentPath = window.location.pathname.split('/').pop() || 'design.html';
    const redirectParam = encodeURIComponent(currentPath + window.location.search);

    authWidget.innerHTML = `
      <a class="btn-ghost" href="login.html?redirect=${redirectParam}" style="font-size: var(--text-xs); padding: 6px 12px;" title="Sign into FashionForge">
        <span>Sign In</span>
      </a>
      <a class="btn-primary" href="login.html?tab=register&redirect=${redirectParam}" style="font-size: var(--text-xs); padding: 6px 12px;" title="Register Atelier Account">
        <span>Register</span>
      </a>
    `;
  }
}
