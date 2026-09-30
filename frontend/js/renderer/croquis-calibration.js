/**
 * FashionForge — Authoritative Female Croquis Calibration System
 *
 * Source of Truth for all female croquis measurements, landmarks,
 * and anatomical dimensions across sizes: XS, S, M, L, XL, XXL, 3XL, 4XL.
 *
 * Coordinate System:
 *   - Canvas: 768 × 1376 px
 *   - Anatomical Center Axis: X = 385
 *   - Foot Baseline: Y = 1325
 *   - Model Height: 1243 px (invariant across all sizes)
 *
 * Guarantees:
 *   1. Identical anatomical dimensions between Front and Back views for every size
 *   2. Strictly monotonic body size progression (XS < S < M < L < XL < XXL < 3XL < 4XL)
 *   3. 1:1 mathematical alignment with 2.5D garment SVG geometry
 */

import { MODEL_GEOMETRY } from './geometry.js';
import { getSizeData, SIZE_ORDER } from './size-data.js';

const CX = MODEL_GEOMETRY.centerX; // 385
const FOOT_BASELINE = 1325;

/**
 * Symmetric X coordinate transformation around center axis X = 385
 */
function scaleX(origX, factor) {
  const offset = origX - CX;
  return Math.round(CX + offset * factor);
}

/**
 * Builds calibrated landmark coordinates for a specific size
 */
function buildSizeCalibration(sizeId) {
  const size = getSizeData(sizeId);

  // Exact measurement ratios relative to canonical M baseline
  // M: chest=36", waistAvg=33", hip=40", shoulder=14.5", armhole=15", lengthAvg=42"
  const waistAvg = (size.waistMin + size.waistMax) / 2;
  const lengthAvg = (size.lengthMin + size.lengthMax) / 2;

  const shoulderScale = size.shoulder / 14.5;
  const neckScale = 1.0 + (size.chest / 36.0 - 1.0) * 0.48;
  const bustScale = size.chest / 36.0;
  const armholeScale = size.armhole / 15.0;
  const armpitScale = 1.0 + (bustScale - 1.0) * 1.05;
  const waistScale = waistAvg / 33.0;
  const hipScale = size.hip / 40.0;
  const lengthDeltaPx = (lengthAvg - 42.0) * 3.5;

  const hemY = Math.round(906 + lengthDeltaPx);

  // Front anatomical landmarks
  const front = {
    neckLeft: { x: scaleX(343, neckScale), y: 282 },
    neckRight: { x: scaleX(427, neckScale), y: 282 },
    shoulderLeft: { x: scaleX(260, shoulderScale), y: Math.round(323 + (shoulderScale - 1.0) * 3) },
    shoulderRight: { x: scaleX(510, shoulderScale), y: Math.round(323 + (shoulderScale - 1.0) * 3) },
    bustLeft: { x: scaleX(345, bustScale), y: Math.round(385 + (bustScale - 1.0) * 4) },
    bustRight: { x: scaleX(425, bustScale), y: Math.round(385 + (bustScale - 1.0) * 4) },
    waistLeft: { x: scaleX(306, waistScale), y: 490 },
    waistRight: { x: scaleX(462, waistScale), y: 490 },
    hipLeft: { x: scaleX(282, hipScale), y: 600 },
    hipRight: { x: scaleX(488, hipScale), y: 600 },
    armholeLeft: { x: scaleX(295, armpitScale), y: Math.round(418 + (armholeScale - 1.0) * 10) },
    armholeRight: { x: scaleX(475, armpitScale), y: Math.round(418 + (armholeScale - 1.0) * 10) },
    wristLeft: { x: scaleX(260, hipScale), y: 660 },
    wristRight: { x: scaleX(510, hipScale), y: 660 },
    handLeft: { x: scaleX(255, hipScale), y: 680 },
    handRight: { x: scaleX(515, hipScale), y: 680 },
    hemY: hemY,
    footBaseline: FOOT_BASELINE
  };

  // Back anatomical landmarks — rigorously identical widths to front
  const back = {
    neckLeft: { x: front.neckLeft.x, y: 282 },
    neckRight: { x: front.neckRight.x, y: 282 },
    shoulderLeft: { x: front.shoulderLeft.x, y: front.shoulderLeft.y },
    shoulderRight: { x: front.shoulderRight.x, y: front.shoulderRight.y },
    bustLeft: { x: front.bustLeft.x, y: front.bustLeft.y },
    bustRight: { x: front.bustRight.x, y: front.bustRight.y },
    waistLeft: { x: front.waistLeft.x, y: 490 },
    waistRight: { x: front.waistRight.x, y: 490 },
    hipLeft: { x: front.hipLeft.x, y: 600 },
    hipRight: { x: front.hipRight.x, y: 600 },
    armholeLeft: { x: front.armholeLeft.x, y: front.armholeLeft.y },
    armholeRight: { x: front.armholeRight.x, y: front.armholeRight.y },
    wristLeft: { x: front.wristLeft.x, y: 660 },
    wristRight: { x: front.wristRight.x, y: 660 },
    handLeft: { x: front.handLeft.x, y: 680 },
    handRight: { x: front.handRight.x, y: 680 },
    hemY: hemY,
    footBaseline: FOOT_BASELINE
  };

  return { front, back, scales: { shoulderScale, neckScale, bustScale, waistScale, hipScale, armholeScale } };
}

/**
 * Centralized Calibration Registry for all 8 sizes
 */
export const femaleCroquisCalibration = {
  XS: buildSizeCalibration('XS'),
  S: buildSizeCalibration('S'),
  M: buildSizeCalibration('M'),
  L: buildSizeCalibration('L'),
  XL: buildSizeCalibration('XL'),
  XXL: buildSizeCalibration('XXL'),
  '3XL': buildSizeCalibration('3XL'),
  '4XL': buildSizeCalibration('4XL')
};

/**
 * Returns the calibration object for a given size and view
 */
export function getFemaleCroquisCalibration(size = 'M', view = 'front') {
  const normSize = String(size || 'M').toUpperCase();
  const normView = String(view || 'front').toLowerCase() === 'back' ? 'back' : 'front';
  const entry = femaleCroquisCalibration[normSize] || femaleCroquisCalibration.M;
  return entry[normView];
}

/**
 * Computes calibrated foreground hand clips for each size.
 * Strictly encloses the bare hands and wrists (Y=660 to 745) resting in front of the skirt flare.
 * Bounded cleanly so undergarment shorts and thighs are NEVER clipped over the skirt.
 */
export function getCalibratedHandClips(size = 'M') {
  const normSize = String(size || 'M').toUpperCase();
  const entry = femaleCroquisCalibration[normSize] || femaleCroquisCalibration.M;
  const hipScale = entry.scales.hipScale;

  // On size M: hand is at X in [244, 268]. Shorts/thighs are at X >= 274.
  // We keep a safe 6px gap from the body so zero shorts can ever bleed through.
  const leftMinX = Math.round(scaleX(238, hipScale));
  const leftMaxX = Math.round(scaleX(268, hipScale));
  const rightMinX = Math.round(scaleX(502, hipScale));
  const rightMaxX = Math.round(scaleX(532, hipScale));

  return {
    left: `M ${leftMinX} 660 L ${leftMaxX} 660 L ${leftMaxX} 745 L ${leftMinX} 745 Z`,
    right: `M ${rightMinX} 660 L ${rightMaxX} 660 L ${rightMaxX} 745 L ${rightMinX} 745 Z`
  };
}

/**
 * Development Calibration Overlay Debugger
 * Toggled via designState.debugCalibration === true or window.__FF_DEBUG_CALIBRATION === true
 */
export function renderCalibrationOverlay(containerSvg, size = 'M', isBack = false, garmentLM = null) {
  const cal = getFemaleCroquisCalibration(size, isBack ? 'back' : 'front');
  const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  overlay.setAttribute('id', 'calibration-debug-overlay');
  overlay.setAttribute('class', 'calibration-debug-overlay');
  overlay.style.pointerEvents = 'none';

  function line(x1, y1, x2, y2, stroke, dash = '') {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    el.setAttribute('x1', String(x1));
    el.setAttribute('y1', String(y1));
    el.setAttribute('x2', String(x2));
    el.setAttribute('y2', String(y2));
    el.setAttribute('stroke', stroke);
    el.setAttribute('stroke-width', '1.5');
    if (dash) el.setAttribute('stroke-dasharray', dash);
    overlay.appendChild(el);
  }

  function circle(cx, cy, r, fill) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    el.setAttribute('cx', String(cx));
    el.setAttribute('cy', String(cy));
    el.setAttribute('r', String(r));
    el.setAttribute('fill', fill);
    overlay.appendChild(el);
  }

  function text(x, y, str, fill, anchor = 'start') {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    el.setAttribute('x', String(x));
    el.setAttribute('y', String(y));
    el.setAttribute('fill', fill);
    el.setAttribute('font-size', '10');
    el.setAttribute('font-family', 'monospace');
    el.setAttribute('font-weight', 'bold');
    el.setAttribute('text-anchor', anchor);
    el.textContent = str;
    overlay.appendChild(el);
  }

  // 1. Centerline
  line(CX, 70, CX, FOOT_BASELINE, '#00e5ff', '4,4');
  text(CX + 5, 85, 'CENTER X=385', '#00e5ff');

  // 2. Body Shoulder
  line(cal.shoulderLeft.x, cal.shoulderLeft.y, cal.shoulderRight.x, cal.shoulderRight.y, '#ff1744');
  circle(cal.shoulderLeft.x, cal.shoulderLeft.y, 4, '#ff1744');
  circle(cal.shoulderRight.x, cal.shoulderRight.y, 4, '#ff1744');
  text(cal.shoulderLeft.x - 8, cal.shoulderLeft.y - 4, 'BODY SHOULDER', '#ff1744', 'end');

  // 3. Garment Shoulder (if landmark passed)
  if (garmentLM && garmentLM.shoulders) {
    circle(garmentLM.shoulders.leftTip.x, garmentLM.shoulders.leftTip.y, 3, '#00e676');
    circle(garmentLM.shoulders.rightTip.x, garmentLM.shoulders.rightTip.y, 3, '#00e676');
    text(garmentLM.shoulders.rightTip.x + 8, garmentLM.shoulders.rightTip.y - 4, 'GARMENT SHOULDER', '#00e676');
  }

  // 4. Body Bust
  line(cal.bustLeft.x, cal.bustLeft.y, cal.bustRight.x, cal.bustRight.y, '#e040fb');
  text(cal.bustLeft.x - 8, cal.bustLeft.y - 2, 'BODY BUST', '#e040fb', 'end');

  // 5. Body Waist
  line(cal.waistLeft.x, cal.waistLeft.y, cal.waistRight.x, cal.waistRight.y, '#ffd600');
  circle(cal.waistLeft.x, cal.waistLeft.y, 4, '#ffd600');
  circle(cal.waistRight.x, cal.waistRight.y, 4, '#ffd600');
  text(cal.waistLeft.x - 8, cal.waistLeft.y - 4, 'BODY WAIST', '#ffd600', 'end');

  // 6. Garment Waist
  if (garmentLM && garmentLM.waist) {
    line(garmentLM.waist.left.x, garmentLM.waist.left.y, garmentLM.waist.right.x, garmentLM.waist.right.y, '#00e676', '2,2');
    text(garmentLM.waist.right.x + 8, garmentLM.waist.right.y - 4, 'GARMENT WAIST', '#00e676');
  }

  // 7. Body Hip
  line(cal.hipLeft.x, cal.hipLeft.y, cal.hipRight.x, cal.hipRight.y, '#ff9100');
  circle(cal.hipLeft.x, cal.hipLeft.y, 4, '#ff9100');
  circle(cal.hipRight.x, cal.hipRight.y, 4, '#ff9100');
  text(cal.hipLeft.x - 8, cal.hipLeft.y - 4, 'BODY HIP', '#ff9100', 'end');

  // 8. Armhole points
  circle(cal.armholeLeft.x, cal.armholeLeft.y, 4, '#2979ff');
  circle(cal.armholeRight.x, cal.armholeRight.y, 4, '#2979ff');
  text(cal.armholeLeft.x - 8, cal.armholeLeft.y - 4, 'ARMSCYE', '#2979ff', 'end');

  // 9. Garment Hem
  line(CX - 180, cal.hemY, CX + 180, cal.hemY, '#76ff03', '4,2');
  text(CX + 190, cal.hemY + 4, `GARMENT HEM Y=${cal.hemY}`, '#76ff03');

  // 10. Foot Baseline
  line(CX - 150, FOOT_BASELINE, CX + 150, FOOT_BASELINE, '#ffffff', '2,2');
  text(CX + 160, FOOT_BASELINE + 4, 'FOOT BASELINE Y=1325', '#ffffff');

  containerSvg.appendChild(overlay);
}
