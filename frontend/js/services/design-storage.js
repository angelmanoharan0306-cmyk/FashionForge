/**
 * FashionForge — Design Persistence Layer Service
 *
 * REST API client backed by MongoDB with JWT session authentication.
 * Automatically attaches Authorization: Bearer <token> for authenticated endpoints.
 *
 * Endpoint Base: /api/designs
 */

import { calculateDesignPrice } from '../renderer/garment-data.js';
import { getToken } from './auth-service.js';

export const STORAGE_KEY = 'fashionforge_saved_designs';
export const CART_STORAGE_KEY = 'fashionforge_cart';

// Optional override token for test runner isolation
let overrideAuthToken = null;

export function setTestAuthToken(token) {
  overrideAuthToken = token;
}

/**
 * Generates headers with JWT authentication token if available
 */
export function getAuthHeaders(extraHeaders = {}) {
  const headers = { ...extraHeaders };
  const token = overrideAuthToken || getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Resolves the API base URL based on runtime environment (browser vs Node.js test runner)
 */
export function getApiBaseUrl() {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    if (window.API_BASE_URL) return `${window.API_BASE_URL.replace(/\/$/, '')}/api/designs`;
    return '/api/designs';
  }
  return (typeof process !== 'undefined' && process.env?.API_BASE_URL)
    ? process.env.API_BASE_URL
    : 'http://localhost:5000/api/designs';
}

/**
 * Generates a unique, collision-safe design identifier
 * Format: FF-D[TIMESTAMP_BASE36]-[RANDOM_HEX4]
 *
 * @returns {string} e.g. "FF-D1A4K8-E9B2"
 */
export function generateDesignId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FF-D${timestamp}-${randomPart}`;
}

/**
 * Normalizes any design payload into the canonical FashionForge schema
 *
 * @param {object} raw - Raw input design object
 * @returns {object} Canonical design object
 */
export function normalizeDesignSchema(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const id = raw.id || raw.designId || generateDesignId();
  const name = (raw.name || 'Untitled Design').trim();
  const gender = (raw.gender === 'male' || raw.figure === 'male' || raw.croquis === 'male') ? 'male' : 'female';
  const size = raw.size || 'M';
  const top = raw.top || 'basic';
  const bottom = raw.bottom || 'pencil';
  const sleeves = raw.sleeves || 'none';
  const collar = raw.collar || raw.neckline || 'crew';
  const neckline = raw.neckline || collar;
  const fabric = raw.fabric || 'cotton';
  const colour = raw.colour || '#ffffff';
  const pattern = raw.pattern || 'solid';
  const notes = raw.notes || '';
  const view = raw.view || 'front';
  const userId = raw.userId || null;

  let calculatedPrice = 0;
  try {
    calculatedPrice = calculateDesignPrice({ top, bottom, sleeves, collar, fabric, pattern }).total;
  } catch (err) {
    calculatedPrice = Number(raw.price) || 0;
  }
  const price = (typeof raw.price === 'number' && !isNaN(raw.price) && raw.price > 0)
    ? raw.price
    : calculatedPrice;

  const configuration = (raw.configuration && typeof raw.configuration === 'object')
    ? { ...raw.configuration }
    : {
        figure: gender,
        croquis: gender,
        gender,
        size,
        top,
        bottom,
        sleeves,
        collar,
        neckline,
        fabric,
        colour,
        pattern,
        notes,
        view,
        price
      };

  return {
    id,
    designId: id,
    userId,
    styleId: raw.styleId || id,
    name,
    gender,
    figure: gender,
    croquis: gender,
    size,
    top,
    bottom,
    sleeves,
    collar,
    neckline,
    fabric,
    colour,
    pattern,
    notes,
    price,
    view,
    configuration,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString()
  };
}

/**
 * Retrieves all saved designs for the current user from REST API, sorted newest first
 *
 * @returns {Promise<Array<object>>} Array of saved design objects
 */
export async function getSavedDesigns() {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(baseUrl, {
      method: 'GET',
      headers: getAuthHeaders({ 'Accept': 'application/json' })
    });

    if (res.status === 401) {
      console.warn('[FashionForge Storage] Unauthenticated access to getSavedDesigns.');
      return [];
    }

    if (!res.ok) {
      console.warn(`[FashionForge API] GET ${baseUrl} failed with status: ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data
      .map(normalizeDesignSchema)
      .filter(Boolean)
      .sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
  } catch (err) {
    console.warn('[FashionForge API] Failed to fetch saved designs:', err.message);
    return [];
  }
}

/**
 * Retrieves a single saved design by its unique ID
 *
 * @param {string} id
 * @returns {Promise<object|null>} The design object or null if not found
 */
export async function getDesignById(id) {
  if (!id) return null;
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: getAuthHeaders({ 'Accept': 'application/json' })
    });

    if (res.status === 404 || res.status === 403 || res.status === 401) {
      return null;
    }

    if (!res.ok) {
      console.warn(`[FashionForge API] GET ${baseUrl}/${id} returned status: ${res.status}`);
      return null;
    }

    const data = await res.json();
    return normalizeDesignSchema(data);
  } catch (err) {
    console.warn(`[FashionForge API] Failed to fetch design ${id}:`, err.message);
    return null;
  }
}

/**
 * Saves a new design configuration to MongoDB via POST /api/designs
 *
 * @param {object} design - The design configuration object
 * @returns {Promise<object>} The saved design with canonical ID and timestamps
 */
export async function saveDesign(design) {
  const normalized = normalizeDesignSchema(design);
  if (!normalized) {
    throw new Error('Invalid design payload provided to saveDesign.');
  }

  const baseUrl = getApiBaseUrl();
  const payload = {
    designId: normalized.id,
    styleId: normalized.styleId,
    name: normalized.name,
    gender: normalized.gender,
    figure: normalized.figure,
    croquis: normalized.croquis,
    size: normalized.size,
    top: normalized.top,
    bottom: normalized.bottom,
    sleeves: normalized.sleeves,
    collar: normalized.collar,
    neckline: normalized.neckline,
    fabric: normalized.fabric,
    colour: normalized.colour,
    pattern: normalized.pattern,
    notes: normalized.notes,
    price: normalized.price,
    view: normalized.view,
    configuration: normalized.configuration
  };

  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: getAuthHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }),
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.message || `Save failed with status ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  const savedData = await res.json();
  return normalizeDesignSchema(savedData);
}

/**
 * Updates an existing saved design by ID via PUT /api/designs/:id
 *
 * @param {string} id - The design identifier to update
 * @param {object} updates - Properties to update
 * @returns {Promise<object|null>} Updated design or null on failure
 */
export async function updateDesign(id, updates) {
  if (!id) return null;
  const baseUrl = getApiBaseUrl();

  const res = await fetch(`${baseUrl}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: getAuthHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }),
    body: JSON.stringify(updates)
  });

  if (res.status === 404 || res.status === 403) return null;
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Update failed with status ${res.status}`);
  }

  const data = await res.json();
  return normalizeDesignSchema(data);
}

/**
 * Deletes a design by its unique ID via DELETE /api/designs/:id
 *
 * @param {string} id - The design ID to delete
 * @returns {Promise<boolean>} True if successfully deleted, false otherwise
 */
export async function deleteDesign(id) {
  if (!id) return false;
  const baseUrl = getApiBaseUrl();

  try {
    const res = await fetch(`${baseUrl}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders({ 'Accept': 'application/json' })
    });

    if (res.status === 404 || res.status === 403) return false;
    return res.ok;
  } catch (err) {
    console.error(`[FashionForge API] Failed to delete design ${id}:`, err);
    return false;
  }
}

/**
 * Duplicates an existing design under a new unique ID and copy name
 * Appends "Copy", "Copy 2", etc.
 *
 * @param {string} id - The source design ID to duplicate
 * @returns {Promise<object|null>} The newly created duplicate design or null
 */
export async function duplicateDesign(id) {
  const original = await getDesignById(id);
  if (!original) {
    console.warn(`[FashionForge Duplicate] Original design ${id} not found.`);
    return null;
  }

  const allDesigns = await getSavedDesigns();

  // Determine duplicate naming sequence
  const baseName = original.name.replace(/\s+Copy(\s+\d+)?$/i, '').trim();
  const copyRegex = new RegExp(`^${baseName}\\s+Copy(?:\\s+(\\d+))?$`, 'i');

  let maxCopyIndex = 0;
  for (const d of allDesigns) {
    const match = (d.name || '').match(copyRegex);
    if (match) {
      const idx = match[1] ? parseInt(match[1], 10) : 1;
      if (idx > maxCopyIndex) maxCopyIndex = idx;
    }
  }

  const newCopyName = maxCopyIndex === 0
    ? `${baseName} Copy`
    : `${baseName} Copy ${maxCopyIndex + 1}`;

  const duplicatePayload = {
    ...original,
    id: generateDesignId(),
    name: newCopyName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  delete duplicatePayload.styleId;

  return await saveDesign(duplicatePayload);
}

/**
 * Clears all saved designs for current user (helper for test teardown)
 *
 * @returns {Promise<void>}
 */
export async function clearAllSavedDesigns() {
  const designs = await getSavedDesigns();
  for (const d of designs) {
    await deleteDesign(d.id || d.designId);
  }
}

let memoryCartStore = [];

/**
 * Saves design into Cart storage (Phase 10 compatibility)
 *
 * @param {object} design - Active design state to place in cart
 * @returns {object} Cart entry
 */
export function saveDesignToCart(design) {
  const normalized = normalizeDesignSchema(design);
  const cartItem = {
    cartItemId: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    addedAt: new Date().toISOString(),
    design: normalized
  };

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      const items = raw ? JSON.parse(raw) : [];
      items.unshift(cartItem);
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } else {
      memoryCartStore.unshift(cartItem);
    }
  } catch (err) {
    console.warn('[FashionForge Cart] Failed to persist cart item:', err);
  }

  return cartItem;
}

/**
 * Retrieves all items currently in cart
 *
 * @returns {Array<object>}
 */
export function getCartItems() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }
    return [...memoryCartStore];
  } catch (err) {
    return [];
  }
}
