/**
 * FashionForge — Design Persistence Layer Service
 *
 * Implements local storage persistence for bespoke garment designs.
 * Provides a modular, cleanly decoupled API designed to be seamlessly
 * upgraded to REST API + MongoDB endpoints in Phase 8.
 *
 * Single Source of Truth for Saved Designs:
 *   Key: 'fashionforge_saved_designs'
 */

import { calculateDesignPrice } from '../renderer/garment-data.js';

export const STORAGE_KEY = 'fashionforge_saved_designs';
export const CART_STORAGE_KEY = 'fashionforge_cart';

// In-memory fallback for test runners or non-browser environments
let memoryStore = {};

/**
 * Accesses local storage safely across browser and test environments
 *
 * @returns {Storage|object}
 */
function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage;
  }
  return {
    getItem: (key) => (Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : null),
    setItem: (key, val) => { memoryStore[key] = String(val); },
    removeItem: (key) => { delete memoryStore[key]; },
    clear: () => { memoryStore = {}; }
  };
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
 * Retrieves all saved designs from storage, ordered newest first
 *
 * @returns {Array<object>} Array of saved design objects
 */
export function getSavedDesigns() {
  try {
    const raw = getStorage().getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Ensure chronological sort (newest updated first)
    return parsed.sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  } catch (err) {
    console.warn('[FashionForge Storage] Failed to read saved designs:', err);
    return [];
  }
}

/**
 * Internal helper to persist an array of designs
 *
 * @param {Array<object>} designs
 * @returns {boolean} Success status
 */
function persistDesigns(designs) {
  try {
    getStorage().setItem(STORAGE_KEY, JSON.stringify(designs));
    return true;
  } catch (err) {
    console.error('[FashionForge Storage] Failed to write designs:', err);
    return false;
  }
}

/**
 * Retrieves a single saved design by its unique ID
 *
 * @param {string} id
 * @returns {object|null} The design object or null if not found
 */
export function getDesignById(id) {
  if (!id) return null;
  const designs = getSavedDesigns();
  return designs.find(d => d.id === id) || null;
}

/**
 * Normalizes and validates design state into the canonical saved schema
 *
 * @param {object} designInput - Raw designState or design object
 * @returns {object} Canonical design object
 */
export function normalizeDesignSchema(designInput) {
  const gender = designInput.figure || designInput.croquis || designInput.gender || 'female';
  const top = designInput.top || (gender === 'male' ? 'crop' : 'basic');
  const bottom = designInput.bottom || (gender === 'male' ? 'trousers' : 'skirt');
  const sleeves = designInput.sleeves || 'short';
  const collar = designInput.collar || designInput.neckline || 'round';
  const size = designInput.size || 'M';
  const fabric = designInput.fabric || 'cotton';
  const pattern = designInput.pattern || 'solid';
  const colour = designInput.colour || '#b96b61';

  // Compute authoritative price using centralized pricing engine
  const pricingResult = calculateDesignPrice({
    top,
    bottom,
    sleeves,
    collar,
    size,
    fabric,
    pattern
  });

  const now = new Date().toISOString();

  return {
    id: designInput.id || generateDesignId(),
    styleId: designInput.styleId || `FF-${Math.floor(1000 + Math.random() * 9000)}`,
    name: (designInput.name && designInput.name.trim()) ? designInput.name.trim() : 'Bespoke Atelier Design',
    createdAt: designInput.createdAt || now,
    updatedAt: now,
    // Explicit canonical schema attributes
    gender,
    figure: gender,
    croquis: gender,
    size,
    top,
    bottom,
    sleeves,
    collar,
    neckline: collar,
    colour,
    fabric,
    pattern,
    price: pricingResult.total,
    pricing: pricingResult.total,
    // Full renderer configuration
    view: designInput.view || 'front',
    figureVisible: (typeof designInput.figureVisible === 'boolean') ? designInput.figureVisible : true,
    garmentVisible: (typeof designInput.garmentVisible === 'boolean') ? designInput.garmentVisible : true,
    detailsVisible: (typeof designInput.detailsVisible === 'boolean') ? designInput.detailsVisible : true,
    zoom: designInput.zoom || 100,
    notes: designInput.notes || '',
    version: designInput.version || '1.0'
  };
}

/**
 * Saves a new design into persistent storage
 *
 * @param {object} design - The design configuration to save
 * @returns {object} The saved design with assigned ID and timestamps
 */
export function saveDesign(design) {
  if (!design) throw new Error('Cannot save empty design configuration');

  const normalized = normalizeDesignSchema(design);
  const existingList = getSavedDesigns();

  // If design with this exact ID already exists in storage, update it instead
  const existingIndex = existingList.findIndex(d => d.id === normalized.id);
  if (existingIndex >= 0) {
    normalized.createdAt = existingList[existingIndex].createdAt || normalized.createdAt;
    existingList[existingIndex] = normalized;
    persistDesigns(existingList);
    return normalized;
  }

  // Prepend so the newest design appears first
  const updatedList = [normalized, ...existingList];
  persistDesigns(updatedList);
  return normalized;
}

/**
 * Updates an existing design by ID
 *
 * @param {string} id - The design ID to update
 * @param {object} patch - Fields to update
 * @returns {object|null} The updated design or null if not found
 */
export function updateDesign(id, patch) {
  if (!id || !patch) return null;

  const existingList = getSavedDesigns();
  const index = existingList.findIndex(d => d.id === id);
  if (index === -1) return null;

  const current = existingList[index];
  const merged = {
    ...current,
    ...patch,
    id: current.id, // Preserve original ID
    createdAt: current.createdAt, // Preserve original creation date
    updatedAt: new Date().toISOString()
  };

  const normalized = normalizeDesignSchema(merged);
  existingList[index] = normalized;
  persistDesigns(existingList);
  return normalized;
}

/**
 * Deletes a design by ID
 *
 * @param {string} id - The design ID to delete
 * @returns {boolean} True if deleted, false if not found
 */
export function deleteDesign(id) {
  if (!id) return false;
  const existingList = getSavedDesigns();
  const filtered = existingList.filter(d => d.id !== id);

  if (filtered.length === existingList.length) {
    return false; // Nothing was removed
  }

  return persistDesigns(filtered);
}

/**
 * Duplicates an existing design under a new unique ID
 *
 * @param {string} id - The source design ID to duplicate
 * @returns {object|null} The newly created duplicate design or null
 */
export function duplicateDesign(id) {
  const original = getDesignById(id);
  if (!original) return null;

  // Generate sensible duplicate name, e.g. "Original Copy" or "Original Copy 2"
  const existingDesigns = getSavedDesigns();
  const baseName = original.name.replace(/\s+Copy(\s+\d+)?$/i, '').trim();

  // Find existing duplicate numbers
  const copyRegex = new RegExp(`^${escapeRegex(baseName)} Copy(?: (\\d+))?$`, 'i');
  let maxCopyNum = 0;
  let foundAnyCopy = false;

  existingDesigns.forEach(d => {
    const match = d.name.match(copyRegex);
    if (match) {
      foundAnyCopy = true;
      const num = match[1] ? parseInt(match[1], 10) : 1;
      if (num > maxCopyNum) maxCopyNum = num;
    }
  });

  const duplicateName = !foundAnyCopy ? `${baseName} Copy` : `${baseName} Copy ${maxCopyNum + 1}`;
  const now = new Date().toISOString();

  const duplicate = {
    ...original,
    id: generateDesignId(),
    styleId: `FF-${Math.floor(1000 + Math.random() * 9000)}`,
    name: duplicateName,
    createdAt: now,
    updatedAt: now
  };

  const normalized = normalizeDesignSchema(duplicate);
  const updatedList = [normalized, ...existingDesigns];
  persistDesigns(updatedList);
  return normalized;
}

/**
 * Clears all saved designs from storage (primarily for testing and reset)
 */
export function clearAllSavedDesigns() {
  try {
    getStorage().removeItem(STORAGE_KEY);
    memoryStore = {};
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Helper to escape regex special characters
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ==========================================================================
   CART PERSISTENCE COMPATIBILITY (PHASE 7 -> PHASE 10 BRIDGE)
   ========================================================================== */

/**
 * Stores full design configuration into cart storage
 *
 * @param {object} designState
 * @returns {object} Cart item
 */
export function saveDesignToCart(designState) {
  const cartItem = {
    cartItemId: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    design: normalizeDesignSchema(designState),
    addedAt: new Date().toISOString()
  };

  try {
    const raw = getStorage().getItem(CART_STORAGE_KEY);
    const cart = raw ? JSON.parse(raw) : [];
    cart.unshift(cartItem);
    getStorage().setItem(CART_STORAGE_KEY, JSON.stringify(cart.slice(0, 50)));
  } catch (err) {
    console.warn('[FashionForge Cart Storage] Failed to add cart item:', err);
  }

  return cartItem;
}

/**
 * Retrieves items currently in the cart
 *
 * @returns {Array<object>}
 */
export function getCartItems() {
  try {
    const raw = getStorage().getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}
