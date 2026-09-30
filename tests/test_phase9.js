/**
 * FashionForge — Phase 9 Automated Test Suite
 * Tests User Registration, Authentication, Password Security, Design Ownership,
 * Cross-User Access Isolation, and Authenticated Round-Trip Integrity.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../backend/models/User.js';
import Design from '../backend/models/Design.js';

const API_ROOT = 'http://localhost:5000';

console.log('====================================================');
console.log('FASHIONFORGE — PHASE 9 AUTHENTICATION & OWNERSHIP TEST SUITE');
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

// Ensure direct MongoDB connection for model-level inspection
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fashionforge';
if (mongoose.connection.readyState === 0) {
  await mongoose.connect(mongoUri);
}

const timestamp = Date.now().toString(36);
const userA_data = {
  name: 'Madame Grès',
  email: `gres_${timestamp}@atelier.test`,
  password: 'CouturePassword123!'
};

const userB_data = {
  name: 'Cristóbal Balenciaga',
  email: `balenciaga_${timestamp}@atelier.test`,
  password: 'MasterTailor456!'
};

let tokenA = null;
let userA_profile = null;
let tokenB = null;
let userB_profile = null;
let designA_id = null;

try {
  // ---------------------------------------------------------------------------
  // A. REGISTER NEW USER
  // ---------------------------------------------------------------------------
  console.log('--- A. Register New User ---');
  const regRes = await fetch(`${API_ROOT}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(userA_data)
  });

  assert(regRes.status === 201, `POST /api/auth/register returned HTTP 201 (got ${regRes.status})`);
  const regData = await regRes.json();
  assert(typeof regData.token === 'string' && regData.token.length > 20, 'Returned valid JWT string');
  assert(regData.user && typeof regData.user.userId === 'string', `User created with ID: ${regData.user?.userId}`);
  assert(regData.user.email === userA_data.email.toLowerCase(), 'Normalized email stored');
  assert(regData.user.passwordHash === undefined, 'passwordHash is omitted from registration response');

  tokenA = regData.token;
  userA_profile = regData.user;

  // ---------------------------------------------------------------------------
  // B. DUPLICATE EMAIL REJECTED
  // ---------------------------------------------------------------------------
  console.log('\n--- B. Duplicate Email Rejected ---');
  const dupRes = await fetch(`${API_ROOT}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(userA_data)
  });

  assert(dupRes.status === 400, `Duplicate email registration rejected with HTTP 400 (got ${dupRes.status})`);
  const dupData = await dupRes.json();
  assert(dupData.error === 'Conflict Error' || dupData.error === 'Validation Error', `Handled conflict cleanly (${dupData.error})`);

  // ---------------------------------------------------------------------------
  // C. PASSWORD IS HASHED
  // ---------------------------------------------------------------------------
  console.log('\n--- C. Password Is Securely Hashed ---');
  const dbUser = await User.findOne({ email: userA_data.email.toLowerCase() }).select('+passwordHash');
  assert(dbUser !== null, 'User document found in MongoDB');
  assert(dbUser.passwordHash !== userA_data.password, 'Password is NOT stored in plain text');
  assert(dbUser.passwordHash.startsWith('$2'), `Password uses valid bcrypt hash format: ${dbUser.passwordHash.substring(0, 10)}...`);
  const passwordValid = await bcrypt.compare(userA_data.password, dbUser.passwordHash);
  assert(passwordValid === true, 'bcrypt.compare validates plain password against stored hash');

  // ---------------------------------------------------------------------------
  // D. LOGIN SUCCEEDS WITH CORRECT CREDENTIALS
  // ---------------------------------------------------------------------------
  console.log('\n--- D. Login Succeeds With Correct Credentials ---');
  const loginRes = await fetch(`${API_ROOT}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      email: userA_data.email,
      password: userA_data.password
    })
  });

  assert(loginRes.status === 200, `POST /api/auth/login returned HTTP 200 (got ${loginRes.status})`);
  const loginData = await loginRes.json();
  assert(typeof loginData.token === 'string', 'Login returns valid token');
  assert(loginData.user.userId === userA_profile.userId, 'Login returns matching user profile');
  assert(loginData.user.passwordHash === undefined, 'passwordHash omitted from login response');

  // ---------------------------------------------------------------------------
  // E. LOGIN FAILS WITH WRONG CREDENTIALS
  // ---------------------------------------------------------------------------
  console.log('\n--- E. Login Fails With Wrong Credentials ---');
  const badLoginRes = await fetch(`${API_ROOT}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      email: userA_data.email,
      password: 'IncorrectPassword999!'
    })
  });

  assert(badLoginRes.status === 401, `Invalid password rejected with HTTP 401 (got ${badLoginRes.status})`);
  const badLoginData = await badLoginRes.json();
  assert(badLoginData.error === 'Unauthorized', `Error is 'Unauthorized' (got '${badLoginData.error}')`);

  // ---------------------------------------------------------------------------
  // F. /api/auth/me WORKS WITH VALID TOKEN
  // ---------------------------------------------------------------------------
  console.log('\n--- F. /api/auth/me Works With Valid Token ---');
  const meRes = await fetch(`${API_ROOT}/api/auth/me`, {
    method: 'GET',
    headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${tokenA}` }
  });

  assert(meRes.status === 200, `GET /api/auth/me returned HTTP 200 (got ${meRes.status})`);
  const meData = await meRes.json();
  assert(meData.user.userId === userA_profile.userId, `Returned current userId: ${meData.user.userId}`);
  assert(meData.user.name === userA_profile.name, `Returned current name: ${meData.user.name}`);
  assert(meData.user.email === userA_profile.email, `Returned current email: ${meData.user.email}`);

  // ---------------------------------------------------------------------------
  // G. /api/auth/me REJECTS MISSING / INVALID TOKEN
  // ---------------------------------------------------------------------------
  console.log('\n--- G. /api/auth/me Rejects Missing / Invalid Token ---');
  const noTokenRes = await fetch(`${API_ROOT}/api/auth/me`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });
  assert(noTokenRes.status === 401, `GET /api/auth/me without token rejected with HTTP 401 (got ${noTokenRes.status})`);

  const badTokenRes = await fetch(`${API_ROOT}/api/auth/me`, {
    method: 'GET',
    headers: { 'Accept': 'application/json', 'Authorization': 'Bearer INVALID_MALFORMED_JWT_123' }
  });
  assert(badTokenRes.status === 401, `GET /api/auth/me with bad token rejected with HTTP 401 (got ${badTokenRes.status})`);

  // ---------------------------------------------------------------------------
  // H. AUTHENTICATED DESIGN CREATION ASSIGNS CORRECT USER ID
  // ---------------------------------------------------------------------------
  console.log('\n--- H. Authenticated Design Creation Assigns Correct User ID ---');
  const designPayload = {
    name: 'Pleated Grecian Evening Gown',
    gender: 'female',
    figure: 'female',
    size: 'M',
    top: 'wrap',
    bottom: 'wide',
    sleeves: 'flare',
    collar: 'vneck',
    neckline: 'vneck',
    fabric: 'silk',
    colour: '#d4af37',
    pattern: 'solid',
    price: 1870,
    userId: 'FORGED_CLIENT_USER_ID_ATTEMPT' // Attempt to spoof userId
  };

  const createRes = await fetch(`${API_ROOT}/api/designs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify(designPayload)
  });

  assert(createRes.status === 201, `POST /api/designs with token returned HTTP 201 (got ${createRes.status})`);
  const createdDesign = await createRes.json();
  assert(createdDesign.userId === userA_profile.userId, `Server assigned authenticated userId: ${createdDesign.userId}`);
  assert(createdDesign.userId !== 'FORGED_CLIENT_USER_ID_ATTEMPT', 'Client-forged userId was ignored');
  designA_id = createdDesign.designId || createdDesign.id;

  // ---------------------------------------------------------------------------
  // I. GET DESIGNS RETURNS ONLY CURRENT USER'S DESIGNS
  // ---------------------------------------------------------------------------
  console.log("\n--- I. GET Designs Returns Only Current User's Designs ---");
  const getDesignsRes = await fetch(`${API_ROOT}/api/designs`, {
    method: 'GET',
    headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${tokenA}` }
  });

  assert(getDesignsRes.status === 200, `GET /api/designs returned HTTP 200 (got ${getDesignsRes.status})`);
  const userA_designs = await getDesignsRes.json();
  assert(Array.isArray(userA_designs) && userA_designs.length >= 1, `Found ${userA_designs.length} design(s) for User A`);
  assert(userA_designs.every(d => d.userId === userA_profile.userId), "All returned designs belong strictly to User A's userId");

  // ---------------------------------------------------------------------------
  // J. USER A CANNOT BE READ BY USER B
  // ---------------------------------------------------------------------------
  console.log('\n--- J. User A Cannot Be Read By User B ---');
  // Register and login User B
  const regB_res = await fetch(`${API_ROOT}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(userB_data)
  });
  const regB_data = await regB_res.json();
  tokenB = regB_data.token;
  userB_profile = regB_data.user;

  // User B attempts to GET User A's design
  const crossGetRes = await fetch(`${API_ROOT}/api/designs/${designA_id}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${tokenB}` }
  });
  assert(crossGetRes.status === 403 || crossGetRes.status === 404, `User B reading User A's design rejected with HTTP ${crossGetRes.status} (Forbidden/Not Found)`);

  // ---------------------------------------------------------------------------
  // K. USER B CANNOT UPDATE USER A'S DESIGN
  // ---------------------------------------------------------------------------
  console.log("\n--- K. User B Cannot Update User A's Design ---");
  const crossPutRes = await fetch(`${API_ROOT}/api/designs/${designA_id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${tokenB}`
    },
    body: JSON.stringify({ name: 'Hacked Title By User B' })
  });
  assert(crossPutRes.status === 403 || crossPutRes.status === 404, `User B updating User A's design rejected with HTTP ${crossPutRes.status}`);

  // Verify design name was not altered
  const verifyUnchanged = await Design.findOne({ designId: designA_id });
  assert(verifyUnchanged.name === 'Pleated Grecian Evening Gown', 'Design name remains pristine in database');

  // ---------------------------------------------------------------------------
  // L. USER B CANNOT DELETE USER A'S DESIGN
  // ---------------------------------------------------------------------------
  console.log("\n--- L. User B Cannot Delete User A's Design ---");
  const crossDelRes = await fetch(`${API_ROOT}/api/designs/${designA_id}`, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${tokenB}` }
  });
  assert(crossDelRes.status === 403 || crossDelRes.status === 404, `User B deleting User A's design rejected with HTTP ${crossDelRes.status}`);

  const stillExists = await Design.findOne({ designId: designA_id });
  assert(stillExists !== null, "User A's design was NOT deleted by User B");

  // ---------------------------------------------------------------------------
  // M. USER B CANNOT SEE USER A'S DESIGNS IN LIST
  // ---------------------------------------------------------------------------
  console.log("\n--- M. User B Cannot See User A's Design in Portfolio List ---");
  const userB_listRes = await fetch(`${API_ROOT}/api/designs`, {
    method: 'GET',
    headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${tokenB}` }
  });
  const userB_designs = await userB_listRes.json();
  assert(!userB_designs.some(d => d.designId === designA_id), "User B's design list does NOT contain User A's design");

  // ---------------------------------------------------------------------------
  // N. GUEST CANNOT ACCESS PROTECTED DESIGN API
  // ---------------------------------------------------------------------------
  console.log('\n--- N. Guest Cannot Access Protected Design API ---');
  const guestGet = await fetch(`${API_ROOT}/api/designs`, { method: 'GET' });
  assert(guestGet.status === 401, `Guest GET /api/designs returned HTTP 401 (got ${guestGet.status})`);

  const guestPost = await fetch(`${API_ROOT}/api/designs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(designPayload)
  });
  assert(guestPost.status === 401, `Guest POST /api/designs returned HTTP 401 (got ${guestPost.status})`);

  // ---------------------------------------------------------------------------
  // O. PHASE 8 CRUD REMAINS INTACT FOR AUTHENTICATED OWNER
  // ---------------------------------------------------------------------------
  console.log('\n--- O. Phase 8 CRUD Operations Intact For Authenticated Owner ---');
  // Update by owner
  const ownerPut = await fetch(`${API_ROOT}/api/designs/${designA_id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({ name: 'Pleated Grecian Evening Gown (Master Edition)', price: 1980 })
  });
  assert(ownerPut.status === 200, `Owner PUT returned HTTP 200 (got ${ownerPut.status})`);
  const updatedDoc = await ownerPut.json();
  assert(updatedDoc.name === 'Pleated Grecian Evening Gown (Master Edition)', 'Owner successfully updated name');

  // Read single by owner
  const ownerGet = await fetch(`${API_ROOT}/api/designs/${designA_id}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${tokenA}` }
  });
  assert(ownerGet.status === 200, `Owner GET /api/designs/:id returned HTTP 200 (got ${ownerGet.status})`);

  // ---------------------------------------------------------------------------
  // P. COMPLETE DESIGN CONFIGURATION SURVIVES AUTHENTICATED ROUND-TRIP
  // ---------------------------------------------------------------------------
  console.log('\n--- P. Complete Configuration Survives Authenticated Round-Trip ---');
  const roundTripDoc = await ownerGet.json();
  assert(roundTripDoc.top === 'wrap', 'top preserved');
  assert(roundTripDoc.bottom === 'wide', 'bottom preserved');
  assert(roundTripDoc.sleeves === 'flare', 'sleeves preserved');
  assert(roundTripDoc.collar === 'vneck' && roundTripDoc.neckline === 'vneck', 'collar/neckline alias preserved');
  assert(roundTripDoc.fabric === 'silk', 'fabric preserved');
  assert(roundTripDoc.colour === '#d4af37', 'colour preserved');
  assert(roundTripDoc.price === 1980, 'price preserved');
  assert(typeof roundTripDoc.configuration === 'object', 'renderer configuration snapshot preserved');

} finally {
  // Safe test teardown: delete only test accounts and test designs created in this test
  if (designA_id) {
    await Design.deleteOne({ designId: designA_id });
  }
  if (userA_profile?.userId) {
    await User.deleteOne({ userId: userA_profile.userId });
    await Design.deleteMany({ userId: userA_profile.userId });
  }
  if (userB_profile?.userId) {
    await User.deleteOne({ userId: userB_profile.userId });
    await Design.deleteMany({ userId: userB_profile.userId });
  }
  await mongoose.disconnect();
}

console.log('\n====================================================');
console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('====================================================');

if (failCount > 0) process.exit(1);
