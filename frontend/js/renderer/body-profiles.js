/**
 * FashionForge — Calibrated Body Profiles & Anatomical Landmark Architecture
 *
 * Provides size-aware anatomical landmark mappings for the 2.5D SVG garment system.
 * Anchored to the native 768 × 1376 croquis geometry with center axis X = 385.
 *
 * Core Anchors:
 *   - XS: Petite tailored contour (Chest 32", Waist 29", Hip 36", Shoulder 13")
 *   - M:  Reference baseline (Chest 36", Waist 33", Hip 40", Shoulder 14.5")
 *   - XL: Curvy refined contour (Chest 40", Waist 37", Hip 44", Shoulder 15.5")
 *   - 3XL: Volumetric tailoring (Chest 44", Waist 41", Hip 48", Shoulder 16.5")
 *
 * Intermediate sizes (S, L, XXL, 4XL) interpolate with exact proportion adherence.
 */

import { MODEL_GEOMETRY } from './geometry.js';
import { getSizeData } from './size-data.js';

const CX = MODEL_GEOMETRY.centerX; // 385

/**
 * Authoritative Registry of Female Photographic Croquis Assets (8 sizes × 2 views)
 * Native coordinate system: 768 × 1376 px, center axis X = 385.
 * Size M is the authoritative visual and anatomical baseline reference.
 */
export const FEMALE_CROQUIS_REGISTRY = {
  XS: {
    front: 'assets/models/female-model-xs-front.png',
    back: 'assets/models/female-model-xs-back.png'
  },
  S: {
    front: 'assets/models/female-model-s-front.png',
    back: 'assets/models/female-model-s-back.png'
  },
  M: {
    front: 'assets/models/female-model-front.png',
    back: 'assets/models/female-model-back.png'
  },
  L: {
    front: 'assets/models/female-model-l-front.png',
    back: 'assets/models/female-model-l-back.png'
  },
  XL: {
    front: 'assets/models/female-model-xl-front.png',
    back: 'assets/models/female-model-xl-back.png'
  },
  XXL: {
    front: 'assets/models/female-model-xxl-front.png',
    back: 'assets/models/female-model-xxl-back.png'
  },
  '3XL': {
    front: 'assets/models/female-model-3xl-front.png',
    back: 'assets/models/female-model-3xl-back.png'
  },
  '4XL': {
    front: 'assets/models/female-model-4xl-front.png',
    back: 'assets/models/female-model-4xl-back.png'
  }
};

/**
 * Returns the photographic croquis asset path for a given female size and view.
 * Gracefully falls back to authoritative M if size is unmapped or missing.
 *
 * @param {string} size - 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | '4XL'
 * @param {string} view - 'front' | 'back'
 * @returns {string} Relative asset URL
 */
export function getFemaleCroquis(size = 'M', view = 'front') {
  const normSize = String(size || 'M').toUpperCase();
  const normView = String(view || 'front').toLowerCase() === 'back' ? 'back' : 'front';
  const entry = FEMALE_CROQUIS_REGISTRY[normSize];
  if (entry && entry[normView]) {
    return entry[normView];
  }
  // Graceful fallback to authoritative M baseline
  return normView === 'back'
    ? 'assets/models/female-model-back.png'
    : 'assets/models/female-model-front.png';
}

/**
 * Returns the canonical target asset name for documentation and verification
 *
 * @param {string} size - 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | '4XL'
 * @param {string} view - 'front' | 'back'
 * @returns {string} Target asset path
 */
export function getFemaleCroquisTarget(size = 'M', view = 'front') {
  const normSize = String(size || 'M').toUpperCase();
  const normView = String(view || 'front').toLowerCase() === 'back' ? 'back' : 'front';
  return `assets/models/female-model-${normSize.toLowerCase()}-${normView}.png`;
}

import { getCalibratedHandClips } from './croquis-calibration.js';

export const SIZE_HAND_CLIPS = {
  XS: getCalibratedHandClips('XS'),
  S: getCalibratedHandClips('S'),
  M: getCalibratedHandClips('M'),
  L: getCalibratedHandClips('L'),
  XL: getCalibratedHandClips('XL'),
  XXL: getCalibratedHandClips('XXL'),
  '3XL': getCalibratedHandClips('3XL'),
  '4XL': getCalibratedHandClips('4XL')
};

/**
 * Returns calibrated anatomical landmarks for the requested garment size.
 * For size 'M', returns coordinates identical to the baseline MODEL_GEOMETRY.landmarks.
 */
export function getBodyLandmarks(sizeId = 'M') {
  const size = getSizeData(sizeId);

  // Exact measurement ratios compared to baseline M
  // Baseline M: chest=36, waistAvg=33, hip=40, shoulder=14.5, armhole=15, lengthAvg=42
  const waistAvg = (size.waistMin + size.waistMax) / 2;
  const lengthAvg = (size.lengthMin + size.lengthMax) / 2;

  const shoulderScale = size.shoulder / 14.5;
  const bustScale = size.chest / 36.0;
  const waistScale = waistAvg / 33.0;
  const hipScale = size.hip / 40.0;
  const armholeScale = size.armhole / 15.0;

  // Length delta (inches diff * pixels per inch)
  const lengthDeltaPx = (lengthAvg - 42.0) * 3.5;

  // If size is 'M', return identical native landmarks
  if (sizeId === 'M') {
    return MODEL_GEOMETRY.landmarks;
  }

  // Symmetric X calculation around center axis (X = 385)
  const scaleX = (origX, factor) => {
    const offset = origX - CX;
    return Math.round(CX + offset * factor);
  };

  const baseLM = MODEL_GEOMETRY.landmarks;
  const handClips = SIZE_HAND_CLIPS[String(sizeId).toUpperCase()] || SIZE_HAND_CLIPS['M'];

  // Proportional neck scale matching calibrated human model
  const neckScale = 1.0 + (bustScale - 1.0) * 0.48;

  // Sleeve outer hem follows deltoid contour with gentle tailored ease (+3px)
  const armOuterScale = shoulderScale * 0.35 + armholeScale * 0.65;
  const sleeveOuterX = scaleX(256, armOuterScale);
  const sleeveOuterY = Math.round(406 + (armholeScale - 1.0) * 12);

  // Armscye pit: encloses bust fullness with zero undergarment peek
  const armscyePitScale = 1.0 + (bustScale - 1.0) * 1.05;
  const armscyePitX = scaleX(295, armscyePitScale);
  const armscyePitY = Math.round(baseLM.armscye.leftPit.y + (armholeScale - 1.0) * 10);

  const armscyeMidScale = 1.0 + (bustScale - 1.0) * 0.90;
  const armscyeMidX = scaleX(baseLM.armscye.leftMid.x, armscyeMidScale);
  const armscyeMidY = Math.round(baseLM.armscye.leftMid.y + (armholeScale - 1.0) * 6);

  return {
    head: baseLM.head,
    neck: {
      left: { x: scaleX(baseLM.neck.left.x, neckScale), y: baseLM.neck.left.y },
      right: { x: scaleX(baseLM.neck.right.x, neckScale), y: baseLM.neck.right.y },
      frontJewelDip: { x: CX, y: Math.round(baseLM.neck.frontJewelDip.y + (bustScale - 1.0) * 14) },
      backCervicaleDip: { x: CX, y: Math.round(baseLM.neck.backCervicaleDip.y + (bustScale - 1.0) * 4) },
      sternalNotch: { x: CX, y: Math.round(baseLM.neck.sternalNotch.y + (bustScale - 1.0) * 10) }
    },
    shoulders: {
      leftTip: { x: scaleX(baseLM.shoulders.leftTip.x, shoulderScale), y: Math.round(baseLM.shoulders.leftTip.y + (shoulderScale - 1.0) * 3) },
      rightTip: { x: scaleX(baseLM.shoulders.rightTip.x, shoulderScale), y: Math.round(baseLM.shoulders.rightTip.y + (shoulderScale - 1.0) * 3) },
      leftMid: { x: scaleX(baseLM.shoulders.leftMid.x, shoulderScale), y: Math.round(baseLM.shoulders.leftMid.y + (shoulderScale - 1.0) * 2) },
      rightMid: { x: scaleX(baseLM.shoulders.rightMid.x, shoulderScale), y: Math.round(baseLM.shoulders.rightMid.y + (shoulderScale - 1.0) * 2) }
    },
    armscye: {
      leftPit: { x: armscyePitX, y: armscyePitY },
      rightPit: { x: 2 * CX - armscyePitX, y: armscyePitY },
      leftMid: { x: armscyeMidX, y: armscyeMidY },
      rightMid: { x: 2 * CX - armscyeMidX, y: armscyeMidY }
    },
    bust: {
      leftApex: { x: scaleX(baseLM.bust.leftApex.x, bustScale), y: Math.round(baseLM.bust.leftApex.y + (bustScale - 1.0) * 4) },
      rightApex: { x: scaleX(baseLM.bust.rightApex.x, bustScale), y: Math.round(baseLM.bust.rightApex.y + (bustScale - 1.0) * 4) },
      center: { x: CX, y: Math.round(baseLM.bust.center.y + (bustScale - 1.0) * 4) }
    },
    waist: {
      left: { x: scaleX(baseLM.waist.left.x, waistScale), y: baseLM.waist.left.y },
      right: { x: scaleX(baseLM.waist.right.x, waistScale), y: baseLM.waist.right.y },
      centerFront: { x: CX, y: Math.round(baseLM.waist.centerFront.y + (waistScale - 1.0) * 8) },
      centerBack: { x: CX, y: Math.round(baseLM.waist.centerBack.y + (waistScale - 1.0) * 3) }
    },
    hip: {
      highLeft: { x: scaleX(baseLM.hip.highLeft.x, 1 + (waistScale - 1) * 0.5 + (hipScale - 1) * 0.5), y: baseLM.hip.highLeft.y },
      highRight: { x: scaleX(baseLM.hip.highRight.x, 1 + (waistScale - 1) * 0.5 + (hipScale - 1) * 0.5), y: baseLM.hip.highRight.y },
      lowLeft: { x: scaleX(baseLM.hip.lowLeft.x, hipScale), y: baseLM.hip.lowLeft.y },
      lowRight: { x: scaleX(baseLM.hip.lowRight.x, hipScale), y: baseLM.hip.lowRight.y },
      midLeft: { x: scaleX(baseLM.hip.midLeft.x, hipScale), y: baseLM.hip.midLeft.y },
      midRight: { x: scaleX(baseLM.hip.midRight.x, hipScale), y: baseLM.hip.midRight.y }
    },
    skirtAline: {
      hemY: Math.round(baseLM.skirtAline.hemY + lengthDeltaPx),
      hemLeft: { x: scaleX(baseLM.skirtAline.hemLeft.x, hipScale), y: Math.round(baseLM.skirtAline.hemY + lengthDeltaPx) },
      hemRight: { x: scaleX(baseLM.skirtAline.hemRight.x, hipScale), y: Math.round(baseLM.skirtAline.hemY + lengthDeltaPx) },
      hemCenterFront: { x: CX, y: Math.round(baseLM.skirtAline.hemCenterFront.y + lengthDeltaPx) },
      hemCenterBack: { x: CX, y: Math.round(baseLM.skirtAline.hemCenterBack.y + lengthDeltaPx) }
    },
    sleeveShort: {
      leftOuterHem: { x: sleeveOuterX, y: sleeveOuterY },
      leftInnerHem: { x: armscyePitX, y: armscyePitY - 2 },
      rightOuterHem: { x: 2 * CX - sleeveOuterX, y: sleeveOuterY },
      rightInnerHem: { x: 2 * CX - armscyePitX, y: armscyePitY - 2 }
    },
    armsForeground: {
      leftClip: handClips.left,
      rightClip: handClips.right
    },
    feet: baseLM.feet
  };
}
