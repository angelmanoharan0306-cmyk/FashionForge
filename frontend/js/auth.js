/**
 * FashionForge — Authentication Page Controller
 * Handles tab switching, client validation, login, and registration.
 */

import { login, register, isAuthenticated, getCurrentUser } from './services/auth-service.js';

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

function showAlert(message) {
  const banner = document.querySelector('#auth-alert-banner');
  const msgEl = document.querySelector('#auth-alert-message');
  if (banner && msgEl) {
    msgEl.textContent = message;
    banner.style.display = 'flex';
  }
}

function hideAlert() {
  const banner = document.querySelector('#auth-alert-banner');
  if (banner) {
    banner.style.display = 'none';
  }
}

function getRedirectUrl() {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect');
  if (redirect) {
    // Only allow relative paths to prevent open redirects
    if (!redirect.startsWith('//') && !redirect.startsWith('http://') && !redirect.startsWith('https://')) {
      return redirect;
    }
  }
  return 'design.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const tabLogin = document.querySelector('#tab-login');
  const tabRegister = document.querySelector('#tab-register');
  const formLogin = document.querySelector('#form-login');
  const formRegister = document.querySelector('#form-register');
  const titleEl = document.querySelector('#auth-title');
  const subtitleEl = document.querySelector('#auth-subtitle');

  // Check URL param ?tab=register or ?mode=register
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab') || urlParams.get('mode');

  function switchTab(mode) {
    hideAlert();
    if (mode === 'register') {
      tabRegister?.classList.add('is-active');
      tabRegister?.setAttribute('aria-selected', 'true');
      tabLogin?.classList.remove('is-active');
      tabLogin?.setAttribute('aria-selected', 'false');
      if (formRegister) formRegister.style.display = 'block';
      if (formLogin) formLogin.style.display = 'none';
      if (titleEl) titleEl.textContent = 'Join the Fashion Atelier';
      if (subtitleEl) subtitleEl.textContent = 'Create your account to design, store, and manage your bespoke couture collections.';
    } else {
      tabLogin?.classList.add('is-active');
      tabLogin?.setAttribute('aria-selected', 'true');
      tabRegister?.classList.remove('is-active');
      tabRegister?.setAttribute('aria-selected', 'false');
      if (formLogin) formLogin.style.display = 'block';
      if (formRegister) formRegister.style.display = 'none';
      if (titleEl) titleEl.textContent = 'Welcome to FashionForge';
      if (subtitleEl) subtitleEl.textContent = 'Sign in to save bespoke garments, manage your portfolio, and access couture flats.';
    }
  }

  if (initialTab === 'register') {
    switchTab('register');
  }

  tabLogin?.addEventListener('click', () => switchTab('login'));
  tabRegister?.addEventListener('click', () => switchTab('register'));

  // 1. LOGIN SUBMIT
  formLogin?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const email = document.querySelector('#login-email')?.value.trim();
    const password = document.querySelector('#login-password')?.value;
    const btnSubmit = document.querySelector('#btn-submit-login');

    if (!email || !password) {
      showAlert('Please enter both email and password.');
      return;
    }

    try {
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span>Signing In...</span>';
      }

      const res = await login(email, password);
      showToast(`Welcome back, ${res.user?.name || 'Designer'}!`);

      setTimeout(() => {
        window.location.href = getRedirectUrl();
      }, 350);
    } catch (err) {
      showAlert(err.message || 'Login failed. Please check your credentials.');
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `
          <span>Sign In to Atelier</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        `;
      }
    }
  });

  // 2. REGISTER SUBMIT
  formRegister?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const name = document.querySelector('#register-name')?.value.trim();
    const email = document.querySelector('#register-email')?.value.trim();
    const password = document.querySelector('#register-password')?.value;
    const confirmPassword = document.querySelector('#register-confirm-password')?.value;
    const btnSubmit = document.querySelector('#btn-submit-register');

    if (!name || !email || !password) {
      showAlert('All fields are required.');
      return;
    }

    if (password.length < 6) {
      showAlert('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span>Creating Account...</span>';
      }

      const res = await register(name, email, password);
      showToast(`Welcome to FashionForge, ${res.user?.name || 'Artisan'}!`);

      setTimeout(() => {
        window.location.href = getRedirectUrl();
      }, 350);
    } catch (err) {
      showAlert(err.message || 'Registration failed. Please try a different email.');
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `
          <span>Create Atelier Account</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
      }
    }
  });
});
