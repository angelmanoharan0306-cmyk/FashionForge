/**
 * FashionForge — Authentication Service
 * Client-side authentication state management and REST API client.
 * Handles token storage, user session lifecycle, and authentication state inspection.
 */

export const TOKEN_KEY = 'fashionforge_auth_token';
export const USER_KEY = 'fashionforge_auth_user';

// In-memory fallback for test runners and headless environments
let memoryToken = null;
let memoryUser = null;

/**
 * Resolves the Auth API base URL based on runtime environment
 */
export function getAuthApiBaseUrl() {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return '/api/auth';
  }
  return (typeof process !== 'undefined' && process.env?.API_BASE_URL)
    ? process.env.API_BASE_URL.replace('/api/designs', '/api/auth')
    : 'http://localhost:5000/api/auth';
}

/**
 * Retrieves the stored JWT authentication token
 *
 * @returns {string|null}
 */
export function getToken() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(TOKEN_KEY) || null;
  }
  return memoryToken;
}

/**
 * Sets the authentication session token and user details
 *
 * @param {string} token
 * @param {object} user
 */
export function setSession(token, user) {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    memoryToken = token || null;
    memoryUser = user || null;
  }
}

/**
 * Clears the authenticated session (stateless client-side logout)
 */
export function logout() {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  } else {
    memoryToken = null;
    memoryUser = null;
  }
}

/**
 * Returns whether a valid session token exists
 *
 * @returns {boolean}
 */
export function isAuthenticated() {
  return Boolean(getToken());
}

/**
 * Returns the currently cached authenticated user profile
 *
 * @returns {object|null}
 */
export function getCurrentUser() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }
  return memoryUser;
}

/**
 * Registers a new user account via POST /api/auth/register
 *
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} Auth payload containing user and token
 */
export async function register(name, email, password) {
  const baseUrl = getAuthApiBaseUrl();
  const res = await fetch(`${baseUrl}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.message || `Registration failed with status ${res.status}`;
    const err = new Error(errorMsg);
    err.status = res.status;
    err.details = data.details;
    throw err;
  }

  setSession(data.token, data.user);
  return data;
}

/**
 * Authenticates user credentials via POST /api/auth/login
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} Auth payload containing user and token
 */
export async function login(email, password) {
  const baseUrl = getAuthApiBaseUrl();
  const res = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.message || `Login failed with status ${res.status}`;
    const err = new Error(errorMsg);
    err.status = res.status;
    throw err;
  }

  setSession(data.token, data.user);
  return data;
}

/**
 * Validates the current token against the server via GET /api/auth/me
 *
 * @returns {Promise<object|null>}
 */
export async function fetchCurrentUser() {
  const token = getToken();
  if (!token) return null;

  const baseUrl = getAuthApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/me`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.status === 401) {
      logout();
      return null;
    }

    if (!res.ok) return null;

    const data = await res.json();
    if (data.user) {
      setSession(token, data.user);
      return data.user;
    }
    return null;
  } catch (err) {
    console.warn('[FashionForge Auth] Failed to fetch current user profile:', err);
    return getCurrentUser();
  }
}

export const authService = {
  getToken,
  isAuthenticated,
  getCurrentUser,
  setSession,
  logout,
  register,
  login,
  fetchCurrentUser
};

