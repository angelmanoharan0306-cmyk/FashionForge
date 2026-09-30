/**
 * FashionForge — Phase 8 Automated Integration Test Suite
 * Tests REST API endpoints, MongoDB persistence, validation, and schema fidelity.
 */

import {
  getSavedDesigns,
  getDesignById,
  saveDesign,
  updateDesign,
  deleteDesign,
  duplicateDesign,
  clearAllSavedDesigns
} from '../frontend/js/services/design-storage.js';

import { calculateDesignPrice } from '../frontend/js/renderer/garment-data.js';

const API_ROOT = 'http://localhost:5000';

console.log('====================================================');
console.log('FASHIONFORGE — PHASE 8 REST API & MONGODB TEST SUITE');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

// -----------------------------------------------------------------------------
// A. HEALTH ENDPOINT
// -----------------------------------------------------------------------------
console.log('--- A. Health Endpoint ---');
const healthRes = await fetch(`${API_ROOT}/api/health`);
assert(healthRes.status === 200, `GET /api/health returned HTTP 200 (got ${healthRes.status})`);
const healthData = await healthRes.json();
assert(healthData.status === 'ok', `Health status is 'ok' (got '${healthData.status}')`);
assert(healthData.message === 'FashionForge backend is running', 'Health message confirmed');
assert(healthData.database && healthData.database.isConnected === true, `MongoDB is connected (state: ${healthData.database?.state})`);

// -----------------------------------------------------------------------------
// B. POST DESIGN
// -----------------------------------------------------------------------------
console.log('\n--- B. POST Design ---');
const testDesignData = {
  name: 'Architectural Silk Tunic',
  gender: 'female',
  figure: 'female',
  croquis: 'female',
  size: 'L',
  top: 'wrap',
  bottom: 'palazzo',
  sleeves: 'flare',
  collar: 'vneck',
  neckline: 'vneck',
  fabric: 'silk',
  colour: '#2c3e50',
  pattern: 'solid',
  notes: 'High-waisted fluid silhouette with bell sleeves.',
  price: 1870
};

const postRes = await fetch(`${API_ROOT}/api/designs`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  body: JSON.stringify(testDesignData)
});

assert(postRes.status === 201, `POST /api/designs returned HTTP 201 (got ${postRes.status})`);
const createdDesign = await postRes.json();
assert(typeof createdDesign.designId === 'string' && createdDesign.designId.startsWith('FF-D'), `Assigned designId: ${createdDesign.designId}`);
assert(createdDesign.name === testDesignData.name, `Saved name matches: "${createdDesign.name}"`);
assert(createdDesign.price === 1870, `Saved price matches: ₹${createdDesign.price}`);
assert(typeof createdDesign.createdAt === 'string', `MongoDB createdAt timestamp: ${createdDesign.createdAt}`);

const testId = createdDesign.designId;

// -----------------------------------------------------------------------------
// C. GET ALL DESIGNS
// -----------------------------------------------------------------------------
console.log('\n--- C. GET All Designs ---');
const getAllRes = await fetch(`${API_ROOT}/api/designs`);
assert(getAllRes.status === 200, `GET /api/designs returned HTTP 200 (got ${getAllRes.status})`);
const allDesigns = await getAllRes.json();
assert(Array.isArray(allDesigns), 'GET /api/designs returns an array');
assert(allDesigns.some(d => d.designId === testId || d.id === testId), `Created design ${testId} exists in all designs list`);

// -----------------------------------------------------------------------------
// D. GET DESIGN BY ID
// -----------------------------------------------------------------------------
console.log('\n--- D. GET Design by ID ---');
const getByIdRes = await fetch(`${API_ROOT}/api/designs/${testId}`);
assert(getByIdRes.status === 200, `GET /api/designs/${testId} returned HTTP 200`);
const fetchedDesign = await getByIdRes.json();
assert(fetchedDesign.designId === testId, `Fetched design ID matches ${testId}`);
assert(fetchedDesign.top === 'wrap' && fetchedDesign.bottom === 'palazzo', 'Fetched components match input');
assert(fetchedDesign.fabric === 'silk', 'Fetched fabric matches silk');

// -----------------------------------------------------------------------------
// E. PUT / UPDATE DESIGN
// -----------------------------------------------------------------------------
console.log('\n--- E. PUT / Update Design ---');
const updatePayload = {
  name: 'Architectural Silk Tunic (Edited Edition)',
  notes: 'Updated atelier notes: add internal waist binding.',
  price: 1950
};

const putRes = await fetch(`${API_ROOT}/api/designs/${testId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  body: JSON.stringify(updatePayload)
});

assert(putRes.status === 200, `PUT /api/designs/${testId} returned HTTP 200 (got ${putRes.status})`);
const updatedDesign = await putRes.json();
assert(updatedDesign.name === 'Architectural Silk Tunic (Edited Edition)', 'Design name was updated in MongoDB');
assert(updatedDesign.notes === updatePayload.notes, 'Design notes were updated');
assert(updatedDesign.price === 1950, 'Design price was updated');

// -----------------------------------------------------------------------------
// F. DELETE DESIGN
// -----------------------------------------------------------------------------
console.log('\n--- F. DELETE Design ---');
const deleteRes = await fetch(`${API_ROOT}/api/designs/${testId}`, {
  method: 'DELETE',
  headers: { 'Accept': 'application/json' }
});

assert(deleteRes.status === 200, `DELETE /api/designs/${testId} returned HTTP 200 (got ${deleteRes.status})`);
const deleteData = await deleteRes.json();
assert(deleteData.success === true, 'Delete response confirms success');

// Verify it is gone
const verifyDeletedRes = await fetch(`${API_ROOT}/api/designs/${testId}`);
assert(verifyDeletedRes.status === 404, `Subsequent GET returns HTTP 404 (got ${verifyDeletedRes.status})`);

// -----------------------------------------------------------------------------
// G. 404 UNKNOWN DESIGN
// -----------------------------------------------------------------------------
console.log('\n--- G. 404 Unknown Design ---');
const notFoundRes = await fetch(`${API_ROOT}/api/designs/UNKNOWN-ID-NONEXISTENT`);
assert(notFoundRes.status === 404, `GET nonexistent design returned HTTP 404 (got ${notFoundRes.status})`);
const notFoundData = await notFoundRes.json();
assert(notFoundData.error === 'Not Found', `Response error is 'Not Found' (got '${notFoundData.error}')`);

// -----------------------------------------------------------------------------
// H. INVALID DESIGN VALIDATION
// -----------------------------------------------------------------------------
console.log('\n--- H. Invalid Design Validation ---');
const invalidPayloads = [
  { payload: {}, desc: 'Empty payload' },
  { payload: { name: '', gender: 'female', size: 'M', top: 'basic', bottom: 'pencil', fabric: 'cotton', colour: '#fff', price: 100 }, desc: 'Empty name' },
  { payload: { name: 'Test', gender: 'alien', size: 'M', top: 'basic', bottom: 'pencil', fabric: 'cotton', colour: '#fff', price: 100 }, desc: 'Invalid gender' },
  { payload: { name: 'Test', gender: 'female', size: 'M', top: 'basic', bottom: 'pencil', fabric: 'cotton', colour: '#fff', price: -50 }, desc: 'Negative price' },
  { payload: { name: 'Test', gender: 'female', size: 'M', top: '', bottom: 'pencil', fabric: 'cotton', colour: '#fff', price: 100 }, desc: 'Missing top component' }
];

for (const { payload, desc } of invalidPayloads) {
  const badRes = await fetch(`${API_ROOT}/api/designs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  assert(badRes.status === 400, `POST with ${desc} rejected with HTTP 400 (got ${badRes.status})`);
  const errJson = await badRes.json();
  assert(errJson.error === 'Validation Error', `Validation error response confirmed for ${desc}`);
}

// -----------------------------------------------------------------------------
// I. DUPLICATE DESIGN VIA STORAGE SERVICE
// -----------------------------------------------------------------------------
console.log('\n--- I. Duplicate Design Via Storage Service ---');
const baseDesign = await saveDesign({
  name: 'Midnight Velvet Ensemble',
  gender: 'female',
  figure: 'female',
  size: 'S',
  top: 'halter',
  bottom: 'wide',
  sleeves: 'none',
  collar: 'halter',
  fabric: 'velvet',
  colour: '#1a1a2e',
  pattern: 'solid',
  price: 1650
});

const duplicated = await duplicateDesign(baseDesign.id);
assert(duplicated !== null, 'duplicateDesign returned new design object');
assert(duplicated.id !== baseDesign.id, `Duplicate has unique ID: ${duplicated.id} !== ${baseDesign.id}`);
assert(duplicated.name === 'Midnight Velvet Ensemble Copy', `Duplicate has copy name: "${duplicated.name}"`);
assert(duplicated.fabric === 'velvet' && duplicated.top === 'halter', 'Duplicate preserves configuration');

// Verify original wasn't modified
const originalCheck = await getDesignById(baseDesign.id);
assert(originalCheck.name === 'Midnight Velvet Ensemble', 'Original design was not mutated by duplicate');

// Clean up test duplicates
await deleteDesign(baseDesign.id);
await deleteDesign(duplicated.id);

// -----------------------------------------------------------------------------
// J. COMPLETE CONFIGURATION SURVIVES API ROUND-TRIP
// -----------------------------------------------------------------------------
console.log('\n--- J. Complete Configuration Survives API Round-Trip ---');
const complexDesign = {
  name: 'High-Fidelity Studio Haute Couture',
  gender: 'female',
  figure: 'female',
  croquis: 'female',
  size: 'XL',
  top: 'corset',
  bottom: 'flared',
  sleeves: 'cap',
  collar: 'sweetheart',
  neckline: 'sweetheart',
  fabric: 'satin',
  colour: '#e84393',
  pattern: 'floral',
  notes: 'Structured boning with bias cut hemline.',
  price: 2100,
  view: 'back'
};

const savedComplex = await saveDesign(complexDesign);
const reloadedComplex = await getDesignById(savedComplex.id);

assert(reloadedComplex.gender === complexDesign.gender, 'gender preserved');
assert(reloadedComplex.size === complexDesign.size, 'size preserved');
assert(reloadedComplex.top === complexDesign.top, 'top preserved');
assert(reloadedComplex.bottom === complexDesign.bottom, 'bottom preserved');
assert(reloadedComplex.sleeves === complexDesign.sleeves, 'sleeves preserved');
assert(reloadedComplex.collar === complexDesign.collar, 'collar preserved');
assert(reloadedComplex.neckline === complexDesign.neckline, 'neckline preserved');
assert(reloadedComplex.fabric === complexDesign.fabric, 'fabric preserved');
assert(reloadedComplex.colour === complexDesign.colour, 'colour preserved');
assert(reloadedComplex.pattern === complexDesign.pattern, 'pattern preserved');
assert(reloadedComplex.notes === complexDesign.notes, 'notes preserved');
assert(reloadedComplex.view === complexDesign.view, 'view preserved');
assert(typeof reloadedComplex.configuration === 'object', 'renderer configuration object preserved');

// -----------------------------------------------------------------------------
// K. PRICE SURVIVES API ROUND-TRIP & CALCULATOR CONSISTENCY
// -----------------------------------------------------------------------------
console.log('\n--- K. Price Survives API Round-Trip ---');
const calculated = calculateDesignPrice({
  top: complexDesign.top,
  bottom: complexDesign.bottom,
  sleeves: complexDesign.sleeves,
  collar: complexDesign.collar,
  fabric: complexDesign.fabric,
  pattern: complexDesign.pattern
}).total;

assert(savedComplex.price === complexDesign.price, `Saved price matches input (₹${savedComplex.price})`);
assert(reloadedComplex.price === savedComplex.price, `Reloaded price matches saved price (₹${reloadedComplex.price})`);

// Clean up test design
await deleteDesign(savedComplex.id);

console.log('\n====================================================');
console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('====================================================');

if (failCount > 0) process.exit(1);
