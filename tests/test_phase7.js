/**
 * FashionForge — Phase 7 Automated Regression Test Suite
 * Tests Design Persistence, Saved Schema, My Designs Operations, Restoration, and Integrity
 * against the persistent storage interface.
 */

import {
  STORAGE_KEY,
  getSavedDesigns,
  getDesignById,
  saveDesign,
  updateDesign,
  deleteDesign,
  duplicateDesign,
  clearAllSavedDesigns,
  generateDesignId,
  normalizeDesignSchema,
  saveDesignToCart,
  getCartItems,
  setTestAuthToken
} from '../frontend/js/services/design-storage.js';

import { register, setSession } from '../frontend/js/services/auth-service.js';
import { calculateDesignPrice, GARMENT_CATALOG } from '../frontend/js/renderer/garment-data.js';
import { getRecommendation, getDetailedRecommendation } from '../frontend/js/recommendation.js';
import {
  getBodiceFrontPath,
  getBodiceBackPath,
  getSkirtFrontPath,
  getSkirtBackPath,
  getTrouserFrontPath,
  getTrouserBackPath
} from '../frontend/js/renderer/geometry.js';

console.log('====================================================');
console.log('FASHIONFORGE — PHASE 7 REGRESSION VERIFICATION SUITE');
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

// Initialize authenticated test artisan session
const testArtisan = {
  name: 'Regression Artisan P7',
  email: `artisan_p7_${Date.now()}@atelier.test`,
  password: 'TestPassword123!'
};
const authData = await register(testArtisan.name, testArtisan.email, testArtisan.password);
setTestAuthToken(authData.token);
setSession(authData.token, authData.user);

// Ensure clean test isolation
await clearAllSavedDesigns();

// -----------------------------------------------------------------------------
// A. SAVE NEW DESIGN
// -----------------------------------------------------------------------------
console.log('--- A. Save New Design ---');
const sampleDesign1 = {
  name: 'Midnight Silk Gown',
  figure: 'female',
  croquis: 'female',
  gender: 'female',
  size: 'M',
  top: 'wrap',
  bottom: 'wide',
  sleeves: 'flare',
  collar: 'vneck',
  colour: '#2c3e50',
  fabric: 'silk',
  pattern: 'solid',
  notes: 'Fluid wrap eveningwear with palazzo flare.'
};

const saved1 = await saveDesign(sampleDesign1);
assert(typeof saved1.id === 'string' && saved1.id.startsWith('FF-D'), `Assigned collision-safe ID: ${saved1.id}`);
assert(saved1.name === 'Midnight Silk Gown', `Saved name preserved: ${saved1.name}`);
assert(typeof saved1.createdAt === 'string', `Creation timestamp generated: ${saved1.createdAt}`);
assert(typeof saved1.updatedAt === 'string', `Update timestamp generated: ${saved1.updatedAt}`);
assert(saved1.gender === 'female' && saved1.size === 'M', 'Gender and size preserved');
assert(saved1.top === 'wrap' && saved1.bottom === 'wide', 'Top and bottom components preserved');
assert(saved1.fabric === 'silk' && saved1.colour === '#2c3e50', 'Fabric and colour preserved');
assert(saved1.price === (420 + 640 + 200 + 90 + 520 + 0), `Price accurately calculated: ₹${saved1.price}`);

// -----------------------------------------------------------------------------
// B. RETRIEVE SAVED DESIGN
// -----------------------------------------------------------------------------
console.log('\n--- B. Retrieve Saved Design ---');
const retrieved1 = await getDesignById(saved1.id);
assert(retrieved1 !== null, 'Retrieved design by ID is non-null');
assert(retrieved1.id === saved1.id, `Retrieved ID matches saved ID: ${retrieved1.id}`);
assert(retrieved1.name === saved1.name, 'Retrieved name matches');
assert(retrieved1.top === 'wrap' && retrieved1.bottom === 'wide', 'Retrieved components match');
assert(retrieved1.neckline === 'vneck', 'Neckline alias preserved in schema');

// -----------------------------------------------------------------------------
// C. RESTORE EXACT DESIGN CONFIGURATION
// -----------------------------------------------------------------------------
console.log('\n--- C. Restore Exact Design Configuration ---');
const simulatedStudioState = {};
function restoreIntoState(target, source) {
  target.id = source.id;
  target.name = source.name;
  target.figure = source.figure || source.gender;
  target.croquis = source.croquis || source.figure;
  target.size = source.size;
  target.top = source.top;
  target.bottom = source.bottom;
  target.sleeves = source.sleeves;
  target.collar = source.collar || source.neckline;
  target.colour = source.colour;
  target.fabric = source.fabric;
  target.pattern = source.pattern;
  target.notes = source.notes;
  target.pricing = source.price;
}
restoreIntoState(simulatedStudioState, retrieved1);
assert(simulatedStudioState.figure === 'female', 'Restored gender/figure = female');
assert(simulatedStudioState.size === 'M', 'Restored size = M');
assert(simulatedStudioState.top === 'wrap', 'Restored top = wrap');
assert(simulatedStudioState.bottom === 'wide', 'Restored bottom = wide');
assert(simulatedStudioState.sleeves === 'flare', 'Restored sleeves = flare');
assert(simulatedStudioState.collar === 'vneck', 'Restored collar = vneck');
assert(simulatedStudioState.fabric === 'silk', 'Restored fabric = silk');
assert(simulatedStudioState.colour === '#2c3e50', 'Restored colour = #2c3e50');

// -----------------------------------------------------------------------------
// D. DUPLICATE DESIGN
// -----------------------------------------------------------------------------
console.log('\n--- D. Duplicate Design ---');
const duplicate1 = await duplicateDesign(saved1.id);
assert(duplicate1 !== null, 'Duplicate created successfully');
assert(duplicate1.id !== saved1.id, `Duplicate has unique ID: ${duplicate1.id}`);
assert(duplicate1.name === 'Midnight Silk Gown Copy', `Duplicate has copy name: "${duplicate1.name}"`);
assert(duplicate1.top === saved1.top && duplicate1.bottom === saved1.bottom, 'Duplicate preserves garment configuration');

// Verify original wasn't mutated
const originalAfterDup = await getDesignById(saved1.id);
assert(originalAfterDup.name === 'Midnight Silk Gown', 'Original design was not mutated by duplicate');

// Subsequent duplicate gets "Copy 2"
const duplicate2 = await duplicateDesign(saved1.id);
assert(duplicate2.name === 'Midnight Silk Gown Copy 2', `Subsequent duplicate named: "${duplicate2.name}"`);

// -----------------------------------------------------------------------------
// E. DELETE DESIGN
// -----------------------------------------------------------------------------
console.log('\n--- E. Delete Design ---');
const deleteSuccess = await deleteDesign(duplicate2.id);
assert(deleteSuccess === true, 'deleteDesign returned true');
assert(await getDesignById(duplicate2.id) === null, 'Deleted design no longer found in storage');
assert(await getDesignById(saved1.id) !== null, 'Original design still exists after deleting duplicate');

// -----------------------------------------------------------------------------
// F. MULTIPLE SAVED DESIGNS
// -----------------------------------------------------------------------------
console.log('\n--- F. Multiple Saved Designs ---');
const sampleDesign2 = {
  name: 'Casual Denim Studio Ensemble',
  figure: 'female',
  top: 'basic',
  bottom: 'trousers',
  sleeves: 'short',
  collar: 'square',
  colour: '#3b5998',
  fabric: 'denim',
  pattern: 'stripes',
  size: 'L'
};
const saved2 = await saveDesign(sampleDesign2);

const sampleDesign3 = {
  name: 'Architectural Menswear Shirt',
  figure: 'male',
  croquis: 'male',
  top: 'crop',
  bottom: 'trousers',
  sleeves: 'long',
  collar: 'vneck',
  colour: '#1f1c1a',
  fabric: 'linen',
  pattern: 'checks',
  size: 'XL'
};
const saved3 = await saveDesign(sampleDesign3);

const allSaved = await getSavedDesigns();
assert(allSaved.length === 4, `All saved designs count = 4 (got ${allSaved.length})`);
assert(allSaved[0].id === saved3.id, 'Newest design appears first in list');

// -----------------------------------------------------------------------------
// G. EMPTY STATE
// -----------------------------------------------------------------------------
console.log('\n--- G. Empty State ---');
await clearAllSavedDesigns();
const emptyList = await getSavedDesigns();
assert(Array.isArray(emptyList) && emptyList.length === 0, 'getSavedDesigns() returns empty array after clear');
assert(await getDesignById('nonexistent-id') === null, 'getDesignById on empty storage returns null');

// Re-save saved1 for remaining tests
await saveDesign(sampleDesign1);
const reSaved = (await getSavedDesigns())[0];

// -----------------------------------------------------------------------------
// H. PRICE REMAINS CONSISTENT AFTER SAVE / REOPEN
// -----------------------------------------------------------------------------
console.log('\n--- H. Price Consistency ---');
const priceBeforeSave = calculateDesignPrice(sampleDesign1).total;
const priceAfterReopen = calculateDesignPrice(reSaved).total;
assert(priceBeforeSave === priceAfterReopen, `Price before save (₹${priceBeforeSave}) equals price after reopen (₹${priceAfterReopen})`);
assert(reSaved.price === priceBeforeSave, `Persisted price field (₹${reSaved.price}) equals recalculated price`);

// -----------------------------------------------------------------------------
// I. FRONT / BACK RENDERER COMPATIBILITY AFTER REOPEN
// -----------------------------------------------------------------------------
console.log('\n--- I. Front / Back Renderer Compatibility ---');
let frontPath, backPath;
try {
  frontPath = getBodiceFrontPath();
  backPath = getBodiceBackPath();
} catch (err) {
  frontPath = null;
  backPath = null;
}
assert(typeof frontPath === 'string' && frontPath.startsWith('M'), 'Front garment geometry path generates cleanly');
assert(typeof backPath === 'string' && backPath.startsWith('M'), 'Back garment geometry path generates cleanly');

// Male trouser paths
let mFront, mBack;
try {
  mFront = getTrouserFrontPath(undefined, true);
  mBack = getTrouserBackPath(undefined, true);
} catch (err) {
  mFront = null;
  mBack = null;
}
assert(typeof mFront === 'string' && mFront.startsWith('M'), 'Male trouser front path generates cleanly');
assert(typeof mBack === 'string' && mBack.startsWith('M'), 'Male trouser back path generates cleanly');

// -----------------------------------------------------------------------------
// J. SPECIFICATION GENERATION AFTER REOPEN
// -----------------------------------------------------------------------------
console.log('\n--- J. Specification Generation ---');
const specTop = GARMENT_CATALOG.tops[reSaved.top]?.name;
const specBottom = GARMENT_CATALOG.bottoms[reSaved.bottom]?.name;
const specFabric = GARMENT_CATALOG.fabrics[reSaved.fabric]?.name;
assert(specTop === 'Wrap Top', `Top specification resolves to "${specTop}"`);
assert(specBottom === 'Wide Leg', `Bottom specification resolves to "${specBottom}"`);
assert(specFabric === 'Mulberry Silk', `Fabric specification resolves to "${specFabric}"`);

// -----------------------------------------------------------------------------
// K. RECOMMENDATION STILL UPDATES AFTER REOPENING
// -----------------------------------------------------------------------------
console.log('\n--- K. Recommendation Updates After Reopening ---');
const reopenedRec = getDetailedRecommendation(reSaved);
assert(typeof reopenedRec.title === 'string' && reopenedRec.title.length > 0, `Recommendation title generated: "${reopenedRec.title}"`);
assert(typeof reopenedRec.explanation === 'string' && reopenedRec.explanation.length > 0, 'Supporting explanation generated');
assert(reopenedRec.title.includes('Silk') || reopenedRec.title.includes('Wrap') || reopenedRec.title.includes('Fluid'), `Recommendation matches restored silk/wrap styling: ${reopenedRec.title}`);

// -----------------------------------------------------------------------------
// CART COMPATIBILITY (REQUIREMENT 9)
// -----------------------------------------------------------------------------
console.log('\n--- Cart Compatibility (Requirement 9) ---');
const cartEntry = saveDesignToCart(reSaved);
assert(typeof cartEntry.cartItemId === 'string', `Cart item assigned ID: ${cartEntry.cartItemId}`);
assert(cartEntry.design.name === reSaved.name, 'Full design configuration stored in cart item');
assert(cartEntry.design.price === reSaved.price, 'Price preserved in cart item');
const cartItems = getCartItems();
assert(cartItems.length >= 1, `Cart storage returns ${cartItems.length} item(s)`);

console.log('\n====================================================');
console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('====================================================');

if (failCount > 0) process.exit(1);
