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

export const MALE_CROQUIS_REGISTRY = {
  XS: {
    front: 'assets/models/male-model-xs-front.png',
    back: 'assets/models/male-model-xs-back.png'
  },
  S: {
    front: 'assets/models/male-model-s-front.png',
    back: 'assets/models/male-model-s-back.png'
  },
  M: {
    front: 'assets/models/male-model-front.png',
    back: 'assets/models/male-model-back.png'
  },
  L: {
    front: 'assets/models/male-model-l-front.png',
    back: 'assets/models/male-model-l-back.png'
  },
  XL: {
    front: 'assets/models/male-model-xl-front.png',
    back: 'assets/models/male-model-xl-back.png'
  },
  XXL: {
    front: 'assets/models/male-model-xxl-front.png',
    back: 'assets/models/male-model-xxl-back.png'
  },
  '3XL': {
    front: 'assets/models/male-model-3xl-front.png',
    back: 'assets/models/male-model-3xl-back.png'
  },
  '4XL': {
    front: 'assets/models/male-model-4xl-front.png',
    back: 'assets/models/male-model-4xl-back.png'
  }
};

/**
 * Returns the photographic croquis asset path for a given male size and view.
 *
 * @param {string} size - 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | '4XL'
 * @param {string} view - 'front' | 'back'
 * @returns {string} Relative asset URL
 */
export function getMaleCroquis(size = 'M', view = 'front') {
  const normSize = String(size || 'M').toUpperCase();
  const normView = String(view || 'front').toLowerCase() === 'back' ? 'back' : 'front';
  const entry = MALE_CROQUIS_REGISTRY[normSize];
  if (entry && entry[normView]) {
    return entry[normView];
  }
  return normView === 'back'
    ? 'assets/models/male-model-back.png'
    : 'assets/models/male-model-front.png';
}

/**
 * Returns canonical male target asset path
 */
export function getMaleCroquisTarget(size = 'M', view = 'front') {
  const normSize = String(size || 'M').toUpperCase();
  const normView = String(view || 'front').toLowerCase() === 'back' ? 'back' : 'front';
  return `assets/models/male-model-${normSize.toLowerCase()}-${normView}.png`;
}

/**
 * Generic croquis resolver supporting both Female and Male models
 */
export function getModelCroquis(gender = 'female', size = 'M', view = 'front') {
  const isMale = String(gender).toLowerCase() === 'male';
  return isMale ? getMaleCroquis(size, view) : getFemaleCroquis(size, view);
}

/**
 * Generic croquis target resolver supporting both Female and Male models
 */
export function getModelCroquisTarget(gender = 'female', size = 'M', view = 'front') {
  const isMale = String(gender).toLowerCase() === 'male';
  return isMale ? getMaleCroquisTarget(size, view) : getFemaleCroquisTarget(size, view);
}

import { getCalibratedHandClips, getCalibratedMaleHandClips } from './croquis-calibration.js';

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

export const MALE_SIZE_HAND_CLIPS = {
  XS: getCalibratedMaleHandClips('XS'),
  S: getCalibratedMaleHandClips('S'),
  M: getCalibratedMaleHandClips('M'),
  L: getCalibratedMaleHandClips('L'),
  XL: getCalibratedMaleHandClips('XL'),
  XXL: getCalibratedMaleHandClips('XXL'),
  '3XL': getCalibratedMaleHandClips('3XL'),
  '4XL': getCalibratedMaleHandClips('4XL')
};

/**
 * Canonical Male Model Geometry & Native Landmarks (Size M)
 */
export const MALE_MODEL_GEOMETRY = {
  nativeWidth: 768,
  nativeHeight: 1376,
  centerX: 385,
  landmarks: {
    head: {
      top: { x: 385, y: 82 },
      chin: { x: 385, y: 245 },
      jawLeft: { x: 350, y: 228 },
      jawRight: { x: 420, y: 228 }
    },
    neck: {
      left: { x: 338, y: 275 },
      right: { x: 432, y: 275 },
      frontJewelDip: { x: 385, y: 298 },
      backCervicaleDip: { x: 385, y: 280 },
      sternalNotch: { x: 385, y: 295 }
    },
    shoulders: {
      leftTip: { x: 248, y: 318 },
      rightTip: { x: 522, y: 318 },
      leftMid: { x: 293, y: 296 },
      rightMid: { x: 477, y: 296 }
    },
    armscye: {
      leftPit: { x: 282, y: 440 },
      rightPit: { x: 488, y: 440 },
      leftMid: { x: 260, y: 375 },
      rightMid: { x: 510, y: 375 }
    },
    bust: {
      leftApex: { x: 335, y: 395 },
      rightApex: { x: 435, y: 395 },
      center: { x: 385, y: 395 }
    },
    waist: {
      left: { x: 287, y: 500 },
      right: { x: 483, y: 500 },
      centerFront: { x: 385, y: 504 },
      centerBack: { x: 385, y: 500 }
    },
    hip: {
      highLeft: { x: 287, y: 560 },
      highRight: { x: 483, y: 560 },
      lowLeft: { x: 277, y: 640 },
      lowRight: { x: 493, y: 640 },
      midLeft: { x: 274, y: 690 },
      midRight: { x: 496, y: 690 }
    },
    skirtAline: {
      hemY: 906,
      hemLeft: { x: 238, y: 906 },
      hemRight: { x: 532, y: 906 },
      hemCenterFront: { x: 385, y: 918 },
      hemCenterBack: { x: 385, y: 902 }
    },
    sleeveShort: {
      leftOuterHem: { x: 224, y: 422 },
      leftInnerHem: { x: 282, y: 440 },
      rightOuterHem: { x: 546, y: 422 },
      rightInnerHem: { x: 488, y: 440 }
    },
    armsForeground: {
      leftClip: 'M 220 670 L 266 670 L 266 755 L 220 755 Z',
      rightClip: 'M 504 670 L 550 670 L 550 755 L 504 755 Z'
    },
    feet: {
      groundY: 1315,
      center: { x: 385, y: 1315 }
    }
  }
};

/**
 * Returns calibrated anatomical landmarks for the requested garment size and gender.
 * For female size 'M', returns coordinates identical to baseline MODEL_GEOMETRY.landmarks.
 * For male size 'M', returns coordinates identical to MALE_MODEL_GEOMETRY.landmarks.
 */
export function getBodyLandmarks(sizeId = 'M', gender = 'female') {
  const isMale = String(gender).toLowerCase() === 'male';
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

  // Symmetric X calculation around center axis (X = 385)
  const scaleX = (origX, factor) => {
    const offset = origX - CX;
    return Math.round(CX + offset * factor);
  };

  if (isMale) {
    if (sizeId === 'M') {
      return MALE_MODEL_GEOMETRY.landmarks;
    }

    const baseLM = MALE_MODEL_GEOMETRY.landmarks;
    const handClips = MALE_SIZE_HAND_CLIPS[String(sizeId).toUpperCase()] || MALE_SIZE_HAND_CLIPS['M'];

    const neckScale = 1.0 + (bustScale - 1.0) * 0.45;
    const armOuterScale = shoulderScale * 0.35 + armholeScale * 0.65;
    const sleeveOuterX = scaleX(224, armOuterScale);
    const sleeveOuterY = Math.round(422 + (armholeScale - 1.0) * 12);

    const armscyePitScale = 1.0 + (bustScale - 1.0) * 1.05;
    const armscyePitX = scaleX(282, armscyePitScale);
    const armscyePitY = Math.round(baseLM.armscye.leftPit.y + (armholeScale - 1.0) * 10);

    const armscyeMidScale = 1.0 + (bustScale - 1.0) * 0.90;
    const armscyeMidX = scaleX(baseLM.armscye.leftMid.x, armscyeMidScale);
    const armscyeMidY = Math.round(baseLM.armscye.leftMid.y + (armholeScale - 1.0) * 6);

    return {
      head: baseLM.head,
      neck: {
        left: { x: scaleX(baseLM.neck.left.x, neckScale), y: baseLM.neck.left.y },
        right: { x: scaleX(baseLM.neck.right.x, neckScale), y: baseLM.neck.right.y },
        frontJewelDip: { x: CX, y: Math.round(baseLM.neck.frontJewelDip.y + (bustScale - 1.0) * 12) },
        backCervicaleDip: { x: CX, y: Math.round(baseLM.neck.backCervicaleDip.y + (bustScale - 1.0) * 4) },
        sternalNotch: { x: CX, y: Math.round(baseLM.neck.sternalNotch.y + (bustScale - 1.0) * 8) }
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
        centerFront: { x: CX, y: Math.round(baseLM.waist.centerFront.y + (waistScale - 1.0) * 6) },
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

  // Exact Female baseline behavior (100% frozen)
  if (sizeId === 'M') {
    return MODEL_GEOMETRY.landmarks;
  }

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
