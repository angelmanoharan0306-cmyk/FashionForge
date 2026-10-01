/**
 * FashionForge — Cart & Checkout Service
 * Handles API requests for cart management, checkout order placement,
 * and simulated payment transitions with JWT authentication.
 */

import { getToken } from './auth-service.js';

let overrideToken = null;

export function setTestCartToken(token) {
  overrideToken = token;
}

function getHeaders(extra = {}) {
  const headers = { ...extra };
  const token = overrideToken || getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export function getCartApiBaseUrl() {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    if (window.API_BASE_URL) return `${window.API_BASE_URL.replace(/\/$/, '')}/api/cart`;
    return '/api/cart';
  }
  return (typeof process !== 'undefined' && process.env?.API_BASE_URL)
    ? process.env.API_BASE_URL.replace('/api/designs', '/api/cart')
    : 'http://localhost:5000/api/cart';
}

export function getOrderApiBaseUrl() {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    if (window.API_BASE_URL) return `${window.API_BASE_URL.replace(/\/$/, '')}/api/orders`;
    return '/api/orders';
  }
  return (typeof process !== 'undefined' && process.env?.API_BASE_URL)
    ? process.env.API_BASE_URL.replace('/api/designs', '/api/orders')
    : 'http://localhost:5000/api/orders';
}

/**
 * Retrieves the current authenticated user's cart
 */
export async function getCart() {
  const baseUrl = getCartApiBaseUrl();
  const res = await fetch(baseUrl, {
    method: 'GET',
    headers: getHeaders({ 'Accept': 'application/json' })
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('Authentication required to access cart.');
    throw new Error(`Failed to load cart with status ${res.status}`);
  }

  return await res.json();
}

/**
 * Adds an owned design to the user's cart
 */
export async function addToCart(designId, quantity = 1) {
  const baseUrl = getCartApiBaseUrl();
  const res = await fetch(`${baseUrl}/items`, {
    method: 'POST',
    headers: getHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }),
    body: JSON.stringify({ designId, quantity })
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || `Failed to add item to cart (${res.status})`);
    err.status = res.status;
    throw err;
  }

  return data;
}

/**
 * Updates item quantity in the cart
 */
export async function updateCartItemQuantity(itemId, quantity) {
  const baseUrl = getCartApiBaseUrl();
  const res = await fetch(`${baseUrl}/items/${encodeURIComponent(itemId)}`, {
    method: 'PUT',
    headers: getHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }),
    body: JSON.stringify({ quantity })
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || `Failed to update quantity (${res.status})`);
    err.status = res.status;
    throw err;
  }

  return data;
}

/**
 * Removes an item from the cart
 */
export async function removeCartItem(itemId) {
  const baseUrl = getCartApiBaseUrl();
  const res = await fetch(`${baseUrl}/items/${encodeURIComponent(itemId)}`, {
    method: 'DELETE',
    headers: getHeaders({ 'Accept': 'application/json' })
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || `Failed to remove item (${res.status})`);
    err.status = res.status;
    throw err;
  }

  return data;
}

/**
 * Clears all items in the user's cart
 */
export async function clearCart() {
  const baseUrl = getCartApiBaseUrl();
  const res = await fetch(baseUrl, {
    method: 'DELETE',
    headers: getHeaders({ 'Accept': 'application/json' })
  });

  if (!res.ok) {
    throw new Error(`Failed to clear cart (${res.status})`);
  }

  return await res.json();
}

/**
 * Submits checkout information to generate a pending order
 */
export async function checkout(customerInfo) {
  const baseUrl = getOrderApiBaseUrl();
  const res = await fetch(`${baseUrl}/checkout`, {
    method: 'POST',
    headers: getHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }),
    body: JSON.stringify({ customer: customerInfo })
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || `Checkout failed (${res.status})`);
    err.status = res.status;
    err.details = data.details;
    throw err;
  }

  return data.order || data;
}

/**
 * Retrieves details for a specific order
 */
export async function getOrder(orderId) {
  const baseUrl = getOrderApiBaseUrl();
  const res = await fetch(`${baseUrl}/${encodeURIComponent(orderId)}`, {
    method: 'GET',
    headers: getHeaders({ 'Accept': 'application/json' })
  });

  if (!res.ok) {
    const err = new Error(`Order fetch failed (${res.status})`);
    err.status = res.status;
    throw err;
  }

  return await res.json();
}

/**
 * Simulates payment processing for a pending order
 */
export async function simulatePayment(orderId, result = 'success') {
  const baseUrl = getOrderApiBaseUrl();
  const res = await fetch(`${baseUrl}/${encodeURIComponent(orderId)}/pay`, {
    method: 'POST',
    headers: getHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }),
    body: JSON.stringify({ result })
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || `Payment failed (${res.status})`);
    err.status = res.status;
    throw err;
  }

  return data;
}

/**
 * Retrieves all orders belonging to authenticated user
 */
export async function getUserOrders() {
  const baseUrl = getOrderApiBaseUrl();
  const res = await fetch(baseUrl, {
    method: 'GET',
    headers: getHeaders({ 'Accept': 'application/json' })
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data.message || `Failed to fetch orders (${res.status})`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  return Array.isArray(data) ? data : (data.orders || []);
}

/**
 * Advances order lifecycle state to next valid phase (Simulation mechanism)
 */
export async function advanceOrderStatus(orderId, nextStatus = null) {
  const baseUrl = getOrderApiBaseUrl();
  const payload = nextStatus ? { nextStatus } : {};
  const res = await fetch(`${baseUrl}/${encodeURIComponent(orderId)}/advance-status`, {
    method: 'POST',
    headers: getHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }),
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || `Failed to advance order status (${res.status})`);
    err.status = res.status;
    throw err;
  }

  return data;
}

export function getPaymentApiBaseUrl() {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    if (window.API_BASE_URL) return `${window.API_BASE_URL.replace(/\/$/, '')}/api/payments`;
    return '/api/payments';
  }
  return (typeof process !== 'undefined' && process.env?.API_BASE_URL)
    ? process.env.API_BASE_URL.replace('/api/designs', '/api/payments')
    : 'http://localhost:5000/api/payments';
}

/**
 * Retrieves transaction-specific Dynamic UPI QR details
 */
export async function getUpiDetails(orderId) {
  const baseUrl = getPaymentApiBaseUrl();
  const res = await fetch(`${baseUrl}/${encodeURIComponent(orderId)}/upi-details`, {
    method: 'GET',
    headers: getHeaders({ 'Accept': 'application/json' })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Failed to fetch UPI details (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/**
 * Backward-compatible alias for fetching dynamic UPI details / QR
 */
export async function generateDynamicUpiQr(orderId) {
  const baseUrl = getPaymentApiBaseUrl();
  const res = await fetch(`${baseUrl}/${encodeURIComponent(orderId)}/upi-qr`, {
    method: 'POST',
    headers: getHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Failed to generate UPI QR (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/**
 * Confirms manual UPI payment ("I've Completed Payment")
 */
export async function confirmUpi(orderId) {
  const baseUrl = getPaymentApiBaseUrl();
  const res = await fetch(`${baseUrl}/${encodeURIComponent(orderId)}/confirm-upi`, {
    method: 'POST',
    headers: getHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Failed to confirm UPI payment (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/**
 * Checks server-authoritative payment status
 */
export async function getPaymentStatus(orderId) {
  const baseUrl = getPaymentApiBaseUrl();
  const res = await fetch(`${baseUrl}/${encodeURIComponent(orderId)}/status`, {
    method: 'GET',
    headers: getHeaders({ 'Accept': 'application/json' })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Failed to get payment status (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/**
 * User cancels payment; preserves Bag
 */
export async function cancelPayment(orderId) {
  const baseUrl = getPaymentApiBaseUrl();
  const res = await fetch(`${baseUrl}/${encodeURIComponent(orderId)}/cancel`, {
    method: 'POST',
    headers: getHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Payment cancellation failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/**
 * Confirms order with Cash on Delivery
 */
export async function confirmCod(orderId) {
  const baseUrl = getPaymentApiBaseUrl();
  const res = await fetch(`${baseUrl}/${encodeURIComponent(orderId)}/cod`, {
    method: 'POST',
    headers: getHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `COD confirmation failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const cartService = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  checkout,
  getOrder,
  getUserOrders,
  simulatePayment,
  advanceOrderStatus,
  getUpiDetails,
  generateDynamicUpiQr,
  confirmUpi,
  getPaymentStatus,
  cancelPayment,
  confirmCod
};

export const orderService = cartService;

