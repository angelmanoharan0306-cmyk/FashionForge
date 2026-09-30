/**
 * FashionForge — 2.5D Centralized Renderer: Geometry & Anatomical Landmarks
 *
 * Provides size-aware, gender-differentiated, parametric garment geometry
 * anchored to the calibrated 768 × 1376 croquis model coordinate space.
 * Primary anatomical vertical center axis: X = 385.
 *
 * ARCHITECTURAL RULE:
 * Every garment shape derives dynamically from the active body landmarks (LM)
 * across both genders (Female & Male) and all 8 sizes (XS through 4XL).
 * The croquis is authoritative — the garment adapts to the croquis.
 */

export const MODEL_GEOMETRY = {
  nativeWidth: 768,
  nativeHeight: 1376,
  centerX: 385,

  // Symmetrically framed viewport centering the full human model with balanced breathing room
  viewBox: {
    x: 85,
    y: 70,
    width: 600,
    height: 1240
  },

  // Anatomical Landmarks measured directly from the human model photography (Female Size M baseline)
  landmarks: {
    head: {
      top: { x: 385, y: 75 },
      bun: { x: 385, y: 110 },
      chin: { x: 385, y: 260 },
      jawLeft: { x: 350, y: 235 },
      jawRight: { x: 420, y: 235 }
    },
    neck: {
      left: { x: 343, y: 282 },               // Natural base of neck left
      right: { x: 427, y: 282 },              // Natural base of neck right
      frontJewelDip: { x: 385, y: 314 },      // Natural clavicle dip
      backCervicaleDip: { x: 385, y: 289 },   // C7 vertebra neck base rear
      sternalNotch: { x: 385, y: 310 }
    },
    shoulders: {
      leftTip: { x: 260, y: 323 },            // Left acromion / shoulder joint
      rightTip: { x: 510, y: 323 },           // Right acromion / shoulder joint
      leftMid: { x: 302, y: 301 },
      rightMid: { x: 468, y: 301 }
    },
    armscye: {
      leftPit: { x: 295, y: 418 },            // Left axillary fold junction
      rightPit: { x: 475, y: 418 },           // Right axillary fold junction
      leftMid: { x: 278, y: 362 },
      rightMid: { x: 492, y: 362 }
    },
    bust: {
      leftApex: { x: 345, y: 385 },
      rightApex: { x: 425, y: 385 },
      center: { x: 385, y: 385 }
    },
    waist: {
      left: { x: 306, y: 490 },              // Natural waist left indentation
      right: { x: 462, y: 490 },             // Natural waist right indentation
      centerFront: { x: 385, y: 495 },
      centerBack: { x: 385, y: 492 }
    },
    hip: {
      highLeft: { x: 298, y: 540 },
      highRight: { x: 472, y: 540 },
      lowLeft: { x: 282, y: 600 },           // Widest hip contour left (greater trochanter)
      lowRight: { x: 488, y: 600 },          // Widest hip contour right
      midLeft: { x: 272, y: 660 },
      midRight: { x: 498, y: 660 }
    },
    skirtAline: {
      hemY: 906,                             // Knee-level hemline
      hemLeft: { x: 228, y: 906 },
      hemRight: { x: 542, y: 906 },
      hemCenterFront: { x: 385, y: 918 },
      hemCenterBack: { x: 385, y: 902 }
    },
    sleeveShort: {
      leftOuterHem: { x: 256, y: 398 },      // Tailored short sleeve bicep outer hem
      leftInnerHem: { x: 295, y: 416 },      // Seamless inner arm junction
      rightOuterHem: { x: 514, y: 398 },     // Tailored short sleeve bicep outer hem
      rightInnerHem: { x: 475, y: 416 }      // Seamless inner arm junction
    },
    armsForeground: {
      leftClip: 'M 235 640 L 278 640 L 278 750 L 235 750 Z',
      rightClip: 'M 492 640 L 535 640 L 535 750 L 492 750 Z'
    },
    feet: {
      groundY: 1325,
      center: { x: 385, y: 1325 }
    }
  }
};

const DEFAULT_LM = MODEL_GEOMETRY.landmarks;

/* ==========================================================================
   CANONICAL GARMENT FIT FRAME ABSTRACTION
   ========================================================================== */

/**
 * Derives the canonical anatomical garment fit frame from active body landmarks.
 * Guarantees that every garment component receives mathematically consistent
 * torso, waist, hip, crotch, leg, sleeve, and neckline anchor coordinates.
 */
export function getGarmentFitFrame(landmarks = DEFAULT_LM, isMale = false) {
  const LM = landmarks || DEFAULT_LM;
  const CX = LM?.bust?.center?.x || 385;

  // Crotch / Perineum fork:
  // Male boxer brief undergarment ends at Y ~ 695 (M)
  // Female panties undergarment ends at Y ~ 658 (M)
  const crotchY = isMale
    ? Math.round(LM.hip.lowLeft.y + 65)
    : Math.round(LM.waist.centerFront.y + 177);

  const kneeY = Math.round(980);
  const trouserHemY = Math.round((LM?.feet?.groundY || 1320) - 70);

  // Proportional outer hip and thigh half-widths tailored to gender anatomy
  const hipHalfWidth = isMale
    ? Math.round((CX - LM.waist.left.x) * 1.45)
    : Math.round((CX - LM.waist.left.x) * 1.50);

  const thighHalfWidth = isMale
    ? Math.round((CX - LM.waist.left.x) * 1.38)
    : Math.round((CX - LM.waist.left.x) * 1.40);

  const hipLX = CX - hipHalfWidth;
  const hipRX = CX + hipHalfWidth;
  const thighLX = CX - thighHalfWidth;
  const thighRX = CX + thighHalfWidth;

  // Anatomical center axis of left and right legs
  const legCenterLX = Math.round(CX - hipHalfWidth * 0.56);
  const legCenterRX = Math.round(CX + hipHalfWidth * 0.56);

  // Trouser leg width metrics
  const kneeHalfWidth = isMale
    ? Math.round(hipHalfWidth * 0.31)
    : Math.round(hipHalfWidth * 0.31);
  const hemHalfWidth = isMale
    ? Math.round(hipHalfWidth * 0.27)
    : Math.round(hipHalfWidth * 0.27);

  // Shirt hem level (untucked relaxed shirt covers upper pelvic crest)
  const shirtHemY = isMale
    ? Math.round(LM.hip.lowLeft.y - 28)
    : Math.round(LM.hip.highLeft.y + 26);

  const shirtSideLX = isMale
    ? Math.round(LM.waist.left.x - 14)
    : Math.round(LM.hip.highLeft.x - 4);

  const shirtSideRX = isMale
    ? Math.round(LM.waist.right.x + 14)
    : Math.round(LM.hip.highRight.x + 4);

  return {
    CX,
    isMale,
    crotchY,
    kneeY,
    trouserHemY,
    hipLX,
    hipRX,
    thighLX,
    thighRX,
    legCenterLX,
    legCenterRX,
    kneeHalfWidth,
    hemHalfWidth,
    shirtHemY,
    shirtSideLX,
    shirtSideRX
  };
}

/* ==========================================================================
   1. TORSO: FITTED BODICE (REFERENCE IMPLEMENTATION)
   ========================================================================== */

/**
 * Bodice Front Path:
 * Reference tailored bodice contouring neck base, shoulder slope, armscye,
 * bust fullness, and curved natural waist. Supports integrated neckline cut.
 */
export function getBodiceFrontPath(landmarks = DEFAULT_LM, neckline = 'round') {
  const LM = landmarks || DEFAULT_LM;
  const CX = LM?.bust?.center?.x || 385;

  const shDxR = LM.shoulders.rightTip.x - LM.neck.right.x;
  const shDyR = LM.shoulders.rightTip.y - LM.neck.right.y;
  const cp1Rx = Math.round(LM.neck.right.x + shDxR * 0.40);
  const cp1Ry = Math.round(LM.neck.right.y + shDyR * 0.20);
  const cp2Rx = Math.round(LM.neck.right.x + shDxR * 0.80);
  const cp2Ry = Math.round(LM.neck.right.y + shDyR * 0.65);

  const shDxL = LM.shoulders.leftTip.x - LM.neck.left.x;
  const shDyL = LM.shoulders.leftTip.y - LM.neck.left.y;
  const cp1Lx = Math.round(LM.neck.left.x + shDxL * 0.40);
  const cp1Ly = Math.round(LM.neck.left.y + shDyL * 0.20);
  const cp2Lx = Math.round(LM.neck.left.x + shDxL * 0.80);
  const cp2Ly = Math.round(LM.neck.left.y + shDyL * 0.65);

  const cpPitRx = Math.max(LM.armscye.rightPit.x, LM.waist.right.x);
  const cpPitLx = Math.min(LM.armscye.leftPit.x, LM.waist.left.x);

  // Integrated front neckline cut
  let neckCut;
  if (neckline === 'vneck') {
    const vDip = Math.round(LM.bust.center.y + 10);
    neckCut = `L ${CX} ${vDip} L ${LM.neck.right.x} ${LM.neck.right.y}`;
  } else if (neckline === 'square') {
    const boxY = Math.round(LM.neck.frontJewelDip.y + 40);
    const boxL = LM.neck.left.x - 4;
    const boxR = LM.neck.right.x + 4;
    neckCut = `L ${boxL} ${boxY} L ${boxR} ${boxY} L ${LM.neck.right.x} ${LM.neck.right.y}`;
  } else {
    // Canonical round jewel scoop
    neckCut = `Q ${LM.neck.frontJewelDip.x} ${LM.neck.frontJewelDip.y} ${LM.neck.right.x} ${LM.neck.right.y}`;
  }

  return [
    `M ${LM.neck.left.x} ${LM.neck.left.y}`,
    neckCut,
    `C ${cp1Rx} ${cp1Ry}, ${cp2Rx} ${cp2Ry}, ${LM.shoulders.rightTip.x} ${LM.shoulders.rightTip.y}`,
    `C ${LM.armscye.rightMid.x} ${LM.armscye.rightMid.y}, ${LM.armscye.rightPit.x + 2} ${LM.armscye.rightPit.y - 12}, ${LM.armscye.rightPit.x} ${LM.armscye.rightPit.y}`,
    `C ${cpPitRx} 445, ${LM.waist.right.x + 1} 470, ${LM.waist.right.x} ${LM.waist.right.y}`,
    `Q ${LM.waist.centerFront.x} ${LM.waist.centerFront.y} ${LM.waist.left.x} ${LM.waist.left.y}`,
    `C ${LM.waist.left.x - 1} 470, ${cpPitLx} 445, ${LM.armscye.leftPit.x} ${LM.armscye.leftPit.y}`,
    `C ${LM.armscye.leftPit.x - 2} ${LM.armscye.leftPit.y - 12}, ${LM.armscye.leftMid.x} ${LM.armscye.leftMid.y}, ${LM.shoulders.leftTip.x} ${LM.shoulders.leftTip.y}`,
    `C ${cp2Lx} ${cp2Ly}, ${cp1Lx} ${cp1Ly}, ${LM.neck.left.x} ${LM.neck.left.y}`,
    'Z'
  ].join(' ');
}

/**
 * Bodice Back Path:
 * Higher cervicale dip, tailored back darts line, and spine center seam.
 */
export function getBodiceBackPath(landmarks = DEFAULT_LM, neckline = 'round') {
  const LM = landmarks || DEFAULT_LM;

  const shDxR = LM.shoulders.rightTip.x - LM.neck.right.x;
  const shDyR = LM.shoulders.rightTip.y - LM.neck.right.y;
  const cp1Rx = Math.round(LM.neck.right.x + shDxR * 0.40);
  const cp1Ry = Math.round(LM.neck.right.y + shDyR * 0.20);
  const cp2Rx = Math.round(LM.neck.right.x + shDxR * 0.80);
  const cp2Ry = Math.round(LM.neck.right.y + shDyR * 0.65);

  const shDxL = LM.shoulders.leftTip.x - LM.neck.left.x;
  const shDyL = LM.shoulders.leftTip.y - LM.neck.left.y;
  const cp1Lx = Math.round(LM.neck.left.x + shDxL * 0.40);
  const cp1Ly = Math.round(LM.neck.left.y + shDyL * 0.20);
  const cp2Lx = Math.round(LM.neck.left.x + shDxL * 0.80);
  const cp2Ly = Math.round(LM.neck.left.y + shDyL * 0.65);

  const cpPitRx = Math.max(LM.armscye.rightPit.x, LM.waist.right.x);
  const cpPitLx = Math.min(LM.armscye.leftPit.x, LM.waist.left.x);

  return [
    `M ${LM.neck.left.x} ${LM.neck.left.y}`,
    `Q ${LM.neck.backCervicaleDip.x} ${LM.neck.backCervicaleDip.y} ${LM.neck.right.x} ${LM.neck.right.y}`,
    `C ${cp1Rx} ${cp1Ry}, ${cp2Rx} ${cp2Ry}, ${LM.shoulders.rightTip.x} ${LM.shoulders.rightTip.y}`,
    `C ${LM.armscye.rightMid.x} ${LM.armscye.rightMid.y}, ${LM.armscye.rightPit.x + 2} ${LM.armscye.rightPit.y - 12}, ${LM.armscye.rightPit.x} ${LM.armscye.rightPit.y}`,
    `C ${cpPitRx} 445, ${LM.waist.right.x + 1} 470, ${LM.waist.right.x} ${LM.waist.right.y}`,
    `Q ${LM.waist.centerBack.x} ${LM.waist.centerBack.y} ${LM.waist.left.x} ${LM.waist.left.y}`,
    `C ${LM.waist.left.x - 1} 470, ${cpPitLx} 445, ${LM.armscye.leftPit.x} ${LM.armscye.leftPit.y}`,
    `C ${LM.armscye.leftPit.x - 2} ${LM.armscye.leftPit.y - 12}, ${LM.armscye.leftMid.x} ${LM.armscye.leftMid.y}, ${LM.shoulders.leftTip.x} ${LM.shoulders.leftTip.y}`,
    `C ${cp2Lx} ${cp2Ly}, ${cp1Lx} ${cp1Ly}, ${LM.neck.left.x} ${LM.neck.left.y}`,
    'Z'
  ].join(' ');
}

/**
 * Inner Back Neckline Depth Path (Visible inside collar scoop from front)
 */
export function getInnerNeckBackDepthPath(landmarks = DEFAULT_LM, collar = 'round') {
  const LM = landmarks || DEFAULT_LM;
  const CX = LM?.bust?.center?.x || 385;

  if (collar === 'vneck') {
    const vDip = Math.round(LM.bust.center.y - 5);
    return [
      `M ${LM.neck.left.x} ${LM.neck.left.y}`,
      `Q ${LM.neck.backCervicaleDip.x} ${LM.neck.backCervicaleDip.y - 3} ${LM.neck.right.x} ${LM.neck.right.y}`,
      `L ${CX} ${vDip}`,
      'Z'
    ].join(' ');
  }

  if (collar === 'square') {
    const boxY = Math.round(LM.neck.frontJewelDip.y + 40);
    const boxL = LM.neck.left.x - 4;
    const boxR = LM.neck.right.x + 4;
    return [
      `M ${LM.neck.left.x} ${LM.neck.left.y}`,
      `Q ${LM.neck.backCervicaleDip.x} ${LM.neck.backCervicaleDip.y - 3} ${LM.neck.right.x} ${LM.neck.right.y}`,
      `L ${boxR} ${boxY} L ${boxL} ${boxY}`,
      'Z'
    ].join(' ');
  }

  return [
    `M ${LM.neck.left.x} ${LM.neck.left.y}`,
    `Q ${LM.neck.backCervicaleDip.x} ${LM.neck.backCervicaleDip.y - 3} ${LM.neck.right.x} ${LM.neck.right.y}`,
    `Q ${LM.neck.frontJewelDip.x} ${LM.neck.frontJewelDip.y} ${LM.neck.left.x} ${LM.neck.left.y}`,
    'Z'
  ].join(' ');
}

/* ==========================================================================
   2. TORSO: RELAXED SHIRT (MALE REFERENCE & FEMALE RELAXED)
   ========================================================================== */

/**
 * Relaxed Shirt Front Path:
 * Masculine shoulder drop, broad chest, straight side seams descending past
 * hips to a classic curved shirt hem. For female, provides comfortable relaxed drape.
 */
export function getRelaxedBodiceFrontPath(landmarks = DEFAULT_LM, isMale = false, neckline = 'round') {
  const LM = landmarks || DEFAULT_LM;
  const frame = getGarmentFitFrame(LM, isMale);
  const CX = frame.CX;
  const hemY = frame.shirtHemY;
  const sideL = frame.shirtSideLX;
  const sideR = frame.shirtSideRX;

  const shDxR = LM.shoulders.rightTip.x - LM.neck.right.x;
  const shDyR = LM.shoulders.rightTip.y - LM.neck.right.y;
  const cp1Rx = Math.round(LM.neck.right.x + shDxR * 0.40);
  const cp1Ry = Math.round(LM.neck.right.y + shDyR * 0.20);
  const cp2Rx = Math.round(LM.neck.right.x + shDxR * 0.80);
  const cp2Ry = Math.round(LM.neck.right.y + shDyR * 0.65);

  const shDxL = LM.shoulders.leftTip.x - LM.neck.left.x;
  const shDyL = LM.shoulders.leftTip.y - LM.neck.left.y;
  const cp1Lx = Math.round(LM.neck.left.x + shDxL * 0.40);
  const cp1Ly = Math.round(LM.neck.left.y + shDyL * 0.20);
  const cp2Lx = Math.round(LM.neck.left.x + shDxL * 0.80);
  const cp2Ly = Math.round(LM.neck.left.y + shDyL * 0.65);

  // Neckline cut
  let neckCut;
  if (neckline === 'vneck') {
    const vDip = isMale ? Math.round(LM.bust.center.y - 5) : Math.round(LM.bust.center.y + 10);
    neckCut = `L ${CX} ${vDip} L ${LM.neck.right.x} ${LM.neck.right.y}`;
  } else if (neckline === 'square') {
    const boxY = Math.round(LM.neck.frontJewelDip.y + (isMale ? 46 : 40));
    const boxL = LM.neck.left.x - 4;
    const boxR = LM.neck.right.x + 4;
    neckCut = `L ${boxL} ${boxY} L ${boxR} ${boxY} L ${LM.neck.right.x} ${LM.neck.right.y}`;
  } else {
    neckCut = `Q ${LM.neck.frontJewelDip.x} ${LM.neck.frontJewelDip.y} ${LM.neck.right.x} ${LM.neck.right.y}`;
  }

  return [
    `M ${LM.neck.left.x} ${LM.neck.left.y}`,
    neckCut,
    `C ${cp1Rx} ${cp1Ry}, ${cp2Rx} ${cp2Ry}, ${LM.shoulders.rightTip.x} ${LM.shoulders.rightTip.y}`,
    `C ${LM.armscye.rightMid.x} ${LM.armscye.rightMid.y}, ${LM.armscye.rightPit.x + 4} ${LM.armscye.rightPit.y}, ${LM.armscye.rightPit.x + 4} ${LM.armscye.rightPit.y + 6}`,
    `C ${sideR} ${LM.waist.right.y}, ${sideR} ${hemY - 20}, ${sideR} ${hemY}`,
    // Classic shirt hem dipping gently at center
    `Q ${CX} ${hemY + 12} ${sideL} ${hemY}`,
    `C ${sideL} ${hemY - 20}, ${sideL} ${LM.waist.left.y}, ${LM.armscye.leftPit.x - 4} ${LM.armscye.leftPit.y + 6}`,
    `C ${LM.armscye.leftPit.x - 4} ${LM.armscye.leftPit.y}, ${LM.armscye.leftMid.x} ${LM.armscye.leftMid.y}, ${LM.shoulders.leftTip.x} ${LM.shoulders.leftTip.y}`,
    `C ${cp2Lx} ${cp2Ly}, ${cp1Lx} ${cp1Ly}, ${LM.neck.left.x} ${LM.neck.left.y}`,
    'Z'
  ].join(' ');
}

export function getRelaxedBodiceBackPath(landmarks = DEFAULT_LM, isMale = false, neckline = 'round') {
  const LM = landmarks || DEFAULT_LM;
  const frame = getGarmentFitFrame(LM, isMale);
  const CX = frame.CX;
  const hemY = frame.shirtHemY;
  const sideL = frame.shirtSideLX;
  const sideR = frame.shirtSideRX;

  const shDxR = LM.shoulders.rightTip.x - LM.neck.right.x;
  const shDyR = LM.shoulders.rightTip.y - LM.neck.right.y;
  const cp1Rx = Math.round(LM.neck.right.x + shDxR * 0.40);
  const cp1Ry = Math.round(LM.neck.right.y + shDyR * 0.20);
  const cp2Rx = Math.round(LM.neck.right.x + shDxR * 0.80);
  const cp2Ry = Math.round(LM.neck.right.y + shDyR * 0.65);

  const shDxL = LM.shoulders.leftTip.x - LM.neck.left.x;
  const shDyL = LM.shoulders.leftTip.y - LM.neck.left.y;
  const cp1Lx = Math.round(LM.neck.left.x + shDxL * 0.40);
  const cp1Ly = Math.round(LM.neck.left.y + shDyL * 0.20);
  const cp2Lx = Math.round(LM.neck.left.x + shDxL * 0.80);
  const cp2Ly = Math.round(LM.neck.left.y + shDyL * 0.65);

  return [
    `M ${LM.neck.left.x} ${LM.neck.left.y}`,
    `Q ${LM.neck.backCervicaleDip.x} ${LM.neck.backCervicaleDip.y} ${LM.neck.right.x} ${LM.neck.right.y}`,
    `C ${cp1Rx} ${cp1Ry}, ${cp2Rx} ${cp2Ry}, ${LM.shoulders.rightTip.x} ${LM.shoulders.rightTip.y}`,
    `C ${LM.armscye.rightMid.x} ${LM.armscye.rightMid.y}, ${LM.armscye.rightPit.x + 4} ${LM.armscye.rightPit.y}, ${LM.armscye.rightPit.x + 4} ${LM.armscye.rightPit.y + 6}`,
    `C ${sideR} ${LM.waist.right.y}, ${sideR} ${hemY - 20}, ${sideR} ${hemY}`,
    `Q ${CX} ${hemY + 10} ${sideL} ${hemY}`,
    `C ${sideL} ${hemY - 20}, ${sideL} ${LM.waist.left.y}, ${LM.armscye.leftPit.x - 4} ${LM.armscye.leftPit.y + 6}`,
    `C ${LM.armscye.leftPit.x - 4} ${LM.armscye.leftPit.y}, ${LM.armscye.leftMid.x} ${LM.armscye.leftMid.y}, ${LM.shoulders.leftTip.x} ${LM.shoulders.leftTip.y}`,
    `C ${cp2Lx} ${cp2Ly}, ${cp1Lx} ${cp1Ly}, ${LM.neck.left.x} ${LM.neck.left.y}`,
    'Z'
  ].join(' ');
}

/* ==========================================================================
   3. TORSO: WRAP TOP & PEPLUM (FEMALE)
   ========================================================================== */

/**
 * Wrap Top Bodice Front Path:
 * Diagonal crossover lapel gracefully wrapping across chest to opposite waist.
 * Encloses the entire bust contour with zero skin gaps at armscye or sternum.
 */
export function getWrapTopFrontPath(landmarks = DEFAULT_LM, neckline = 'vneck') {
  const LM = landmarks || DEFAULT_LM;
  const CX = LM?.bust?.center?.x || 385;
  const lapelCrossY = Math.round(LM.bust.center.y + 12);

  const shDxR = LM.shoulders.rightTip.x - LM.neck.right.x;
  const shDyR = LM.shoulders.rightTip.y - LM.neck.right.y;
  const cp1Rx = Math.round(LM.neck.right.x + shDxR * 0.40);
  const cp1Ry = Math.round(LM.neck.right.y + shDyR * 0.20);
  const cp2Rx = Math.round(LM.neck.right.x + shDxR * 0.80);
  const cp2Ry = Math.round(LM.neck.right.y + shDyR * 0.65);

  const shDxL = LM.shoulders.leftTip.x - LM.neck.left.x;
  const shDyL = LM.shoulders.leftTip.y - LM.neck.left.y;
  const cp1Lx = Math.round(LM.neck.left.x + shDxL * 0.40);
  const cp1Ly = Math.round(LM.neck.left.y + shDyL * 0.20);
  const cp2Lx = Math.round(LM.neck.left.x + shDxL * 0.80);
  const cp2Ly = Math.round(LM.neck.left.y + shDyL * 0.65);

  const cpPitRx = Math.max(LM.armscye.rightPit.x, LM.waist.right.x);
  const cpPitLx = Math.min(LM.armscye.leftPit.x, LM.waist.left.x);

  return [
    `M ${LM.neck.left.x} ${LM.neck.left.y}`,
    `C ${LM.neck.left.x + 10} ${LM.neck.left.y + 40}, ${CX - 15} ${lapelCrossY - 20}, ${CX} ${lapelCrossY}`,
    `L ${LM.neck.right.x} ${LM.neck.right.y}`,
    `C ${cp1Rx} ${cp1Ry}, ${cp2Rx} ${cp2Ry}, ${LM.shoulders.rightTip.x} ${LM.shoulders.rightTip.y}`,
    `C ${LM.armscye.rightMid.x} ${LM.armscye.rightMid.y}, ${LM.armscye.rightPit.x + 2} ${LM.armscye.rightPit.y - 12}, ${LM.armscye.rightPit.x} ${LM.armscye.rightPit.y}`,
    `C ${cpPitRx} 445, ${LM.waist.right.x + 1} 470, ${LM.waist.right.x} ${LM.waist.right.y}`,
    `Q ${LM.waist.centerFront.x} ${LM.waist.centerFront.y} ${LM.waist.left.x} ${LM.waist.left.y}`,
    `C ${LM.waist.left.x - 1} 470, ${cpPitLx} 445, ${LM.armscye.leftPit.x} ${LM.armscye.leftPit.y}`,
    `C ${LM.armscye.leftPit.x - 2} ${LM.armscye.leftPit.y - 12}, ${LM.armscye.leftMid.x} ${LM.armscye.leftMid.y}, ${LM.shoulders.leftTip.x} ${LM.shoulders.leftTip.y}`,
    `C ${cp2Lx} ${cp2Ly}, ${cp1Lx} ${cp1Ly}, ${LM.neck.left.x} ${LM.neck.left.y}`,
    'Z'
  ].join(' ');
}

export function getWrapTopBackPath(landmarks = DEFAULT_LM) {
  return getBodiceBackPath(landmarks);
}

/**
 * Peplum Bodice:
 * Fitted upper bodice down to natural waist.
 */
export function getPeplumFrontPath(landmarks = DEFAULT_LM, neckline = 'round') {
  return getBodiceFrontPath(landmarks, neckline);
}

export function getPeplumBackPath(landmarks = DEFAULT_LM, neckline = 'round') {
  return getBodiceBackPath(landmarks, neckline);
}

/**
 * Peplum Flounce Tier:
 * Structured flared mini-tier starting at waist and fluting over high hip.
 */
export function getPeplumFlareFrontPath(landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  const tierTop = LM.waist.left.y;
  const tierBotL = { x: LM.hip.highLeft.x - 14, y: LM.hip.highLeft.y + 24 };
  const tierBotR = { x: LM.hip.highRight.x + 14, y: LM.hip.highRight.y + 24 };
  const tierCenterY = LM.waist.centerFront.y + 55;

  return [
    `M ${LM.waist.left.x} ${tierTop}`,
    `Q ${LM.waist.centerFront.x} ${LM.waist.centerFront.y} ${LM.waist.right.x} ${tierTop}`,
    `C ${LM.hip.highRight.x + 6} ${tierTop + 14}, ${tierBotR.x} ${tierBotR.y - 12}, ${tierBotR.x} ${tierBotR.y}`,
    `Q ${LM.bust.center.x} ${tierCenterY} ${tierBotL.x} ${tierBotL.y}`,
    `C ${tierBotL.x} ${tierBotL.y - 12}, ${LM.hip.highLeft.x - 6} ${tierTop + 14}, ${LM.waist.left.x} ${tierTop}`,
    'Z'
  ].join(' ');
}

export function getPeplumFlareBackPath(landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  const tierTop = LM.waist.left.y;
  const tierBotL = { x: LM.hip.highLeft.x - 14, y: LM.hip.highLeft.y + 24 };
  const tierBotR = { x: LM.hip.highRight.x + 14, y: LM.hip.highRight.y + 24 };
  const tierCenterY = LM.waist.centerBack.y + 55;

  return [
    `M ${LM.waist.left.x} ${tierTop}`,
    `Q ${LM.waist.centerBack.x} ${LM.waist.centerBack.y} ${LM.waist.right.x} ${tierTop}`,
    `C ${LM.hip.highRight.x + 6} ${tierTop + 14}, ${tierBotR.x} ${tierBotR.y - 12}, ${tierBotR.x} ${tierBotR.y}`,
    `Q ${LM.bust.center.x} ${tierCenterY} ${tierBotL.x} ${tierBotL.y}`,
    `C ${tierBotL.x} ${tierBotL.y - 12}, ${LM.hip.highLeft.x - 6} ${tierTop + 14}, ${LM.waist.left.x} ${tierTop}`,
    'Z'
  ].join(' ');
}

/* ==========================================================================
   4. BOTTOM: A-LINE SKIRT & STRAIGHT SKIRT
   ========================================================================== */

/**
 * A-Line Skirt Front Path (Reference Implementation):
 * Balanced A-line flare from natural waist past hips to knee level.
 */
export function getSkirtFrontPath(landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  return [
    `M ${LM.waist.left.x} ${LM.waist.left.y}`,
    `Q ${LM.waist.centerFront.x} ${LM.waist.centerFront.y} ${LM.waist.right.x} ${LM.waist.right.y}`,
    `C ${LM.hip.highRight.x} 540, ${LM.hip.lowRight.x} 600, ${LM.hip.midRight.x} 660`,
    `C ${LM.hip.midRight.x + 12} 740, ${LM.skirtAline.hemRight.x - 6} 820, ${LM.skirtAline.hemRight.x} ${LM.skirtAline.hemY}`,
    `Q ${LM.skirtAline.hemCenterFront.x} ${LM.skirtAline.hemCenterFront.y} ${LM.skirtAline.hemLeft.x} ${LM.skirtAline.hemY}`,
    `C ${LM.skirtAline.hemLeft.x + 6} 820, ${LM.hip.midLeft.x - 12} 740, ${LM.hip.midLeft.x} 660`,
    `C ${LM.hip.lowLeft.x} 600, ${LM.hip.highLeft.x} 540, ${LM.waist.left.x} ${LM.waist.left.y}`,
    'Z'
  ].join(' ');
}

export function getSkirtBackPath(landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  return [
    `M ${LM.waist.left.x} ${LM.waist.left.y}`,
    `Q ${LM.waist.centerBack.x} ${LM.waist.centerBack.y} ${LM.waist.right.x} ${LM.waist.right.y}`,
    `C ${LM.hip.highRight.x} 540, ${LM.hip.lowRight.x} 600, ${LM.hip.midRight.x} 660`,
    `C ${LM.hip.midRight.x + 12} 740, ${LM.skirtAline.hemRight.x - 6} 820, ${LM.skirtAline.hemRight.x} ${LM.skirtAline.hemY}`,
    `Q ${LM.skirtAline.hemCenterBack.x} ${LM.skirtAline.hemCenterBack.y + 6} ${LM.skirtAline.hemLeft.x} ${LM.skirtAline.hemY}`,
    `C ${LM.skirtAline.hemLeft.x + 6} 820, ${LM.hip.midLeft.x - 12} 740, ${LM.hip.midLeft.x} 660`,
    `C ${LM.hip.lowLeft.x} 600, ${LM.hip.highLeft.x} 540, ${LM.waist.left.x} ${LM.waist.left.y}`,
    'Z'
  ].join(' ');
}

/**
 * Straight / Pencil Skirt Front Path:
 * Hugs hips fully without clipping or exposing underwear/thighs.
 * Tapers gently below trochanter to a knee-level column silhouette.
 */
export function getStraightSkirtFrontPath(landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  const hemY = Math.round(LM.skirtAline.hemY + 6);
  // Encloses trochanter with safe 3px ease; tapers 5px at knee hem
  const hemR = Math.round(LM.hip.lowRight.x - 4);
  const hemL = Math.round(LM.hip.lowLeft.x + 4);

  return [
    `M ${LM.waist.left.x} ${LM.waist.left.y}`,
    `Q ${LM.waist.centerFront.x} ${LM.waist.centerFront.y} ${LM.waist.right.x} ${LM.waist.right.y}`,
    `C ${LM.hip.highRight.x + 2} ${LM.hip.highRight.y}, ${LM.hip.lowRight.x + 3} ${LM.hip.lowRight.y}, ${LM.hip.midRight.x + 1} ${LM.hip.midRight.y}`,
    `C ${LM.hip.midRight.x} 740, ${hemR + 2} 830, ${hemR} ${hemY}`,
    `Q ${LM.bust.center.x} ${hemY + 8} ${hemL} ${hemY}`,
    `C ${hemL - 2} 830, ${LM.hip.midLeft.x} 740, ${LM.hip.midLeft.x - 1} ${LM.hip.midLeft.y}`,
    `C ${LM.hip.lowLeft.x - 3} ${LM.hip.lowLeft.y}, ${LM.hip.highLeft.x - 2} ${LM.hip.highLeft.y}, ${LM.waist.left.x} ${LM.waist.left.y}`,
    'Z'
  ].join(' ');
}

export function getStraightSkirtBackPath(landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  const hemY = Math.round(LM.skirtAline.hemY + 6);
  const hemR = Math.round(LM.hip.lowRight.x - 4);
  const hemL = Math.round(LM.hip.lowLeft.x + 4);

  return [
    `M ${LM.waist.left.x} ${LM.waist.left.y}`,
    `Q ${LM.waist.centerBack.x} ${LM.waist.centerBack.y} ${LM.waist.right.x} ${LM.waist.right.y}`,
    `C ${LM.hip.highRight.x + 2} ${LM.hip.highRight.y}, ${LM.hip.lowRight.x + 3} ${LM.hip.lowRight.y}, ${LM.hip.midRight.x + 1} ${LM.hip.midRight.y}`,
    `C ${LM.hip.midRight.x} 740, ${hemR + 2} 830, ${hemR} ${hemY}`,
    `Q ${LM.bust.center.x} ${hemY + 6} ${hemL} ${hemY}`,
    `C ${hemL - 2} 830, ${LM.hip.midLeft.x} 740, ${LM.hip.midLeft.x - 1} ${LM.hip.midLeft.y}`,
    `C ${LM.hip.lowLeft.x - 3} ${LM.hip.lowLeft.y}, ${LM.hip.highLeft.x - 2} ${LM.hip.highLeft.y}, ${LM.waist.left.x} ${LM.waist.left.y}`,
    'Z'
  ].join(' ');
}

/* ==========================================================================
   5. BOTTOM: STRAIGHT TROUSERS & WIDE-LEG TROUSERS (MALE & FEMALE)
   ========================================================================== */

/**
 * Tailored Straight Trousers Front Path:
 * Continuous closed silhouette covering waistband, pelvic contour, hips,
 * thighs, and calves down to ankle cuffs with an anatomically correct crotch fork
 * positioned cleanly below the croquis undergarment shorts.
 */
export function getTrouserFrontPath(landmarks = DEFAULT_LM, isMale = false) {
  const LM = landmarks || DEFAULT_LM;
  const CX = LM?.bust?.center?.x || 385;
  const crotchY = isMale
    ? Math.round(LM.hip.lowLeft.y + 105)
    : Math.round(LM.hip.lowLeft.y + 125);
  const kneeY = Math.round(980);
  const hemY = Math.round((LM?.feet?.groundY || 1320) - 70);

  const waistDelta = CX - LM.waist.left.x;
  const wL = Math.round(LM.waist.left.x - 3);
  const wR = Math.round(LM.waist.right.x + 3);

  const hipOutL = Math.round(CX - waistDelta * (isMale ? 1.15 : 1.35));
  const hipOutR = Math.round(CX + waistDelta * (isMale ? 1.15 : 1.35));
  const lowHipY = LM.hip.lowLeft.y;

  const legOffset = Math.round(waistDelta * (isMale ? 0.46 : 0.52));
  const legCenterLX = Math.round(CX - legOffset);
  const legCenterRX = Math.round(CX + legOffset);
  const kneeW = Math.round(waistDelta * (isMale ? 0.48 : 0.42));
  const hemW = Math.round(waistDelta * (isMale ? 0.43 : 0.38));

  return [
    // Waistband
    `M ${wL} ${LM.waist.left.y}`,
    `Q ${LM.waist.centerFront.x} ${LM.waist.centerFront.y} ${wR} ${LM.waist.right.y}`,
    // Right outseam past hips, thigh, knee to hem
    `C ${wR + 8} ${lowHipY - 40}, ${hipOutR} ${lowHipY}, ${hipOutR + 2} ${lowHipY + 50}`,
    `C ${hipOutR} 750, ${legCenterRX + kneeW + 2} ${kneeY - 40}, ${legCenterRX + kneeW} ${kneeY}`,
    `C ${legCenterRX + kneeW} ${kneeY + 60}, ${legCenterRX + hemW + 2} ${hemY - 40}, ${legCenterRX + hemW} ${hemY}`,
    // Right cuff
    `Q ${legCenterRX} ${hemY + 4} ${legCenterRX - hemW} ${hemY + 1}`,
    // Right inseam up to crotch fork (covering medial thigh and boxer shorts)
    `C ${legCenterRX - hemW} ${hemY - 40}, ${legCenterRX - kneeW} ${kneeY + 60}, ${legCenterRX - kneeW} ${kneeY}`,
    `C ${legCenterRX - kneeW - 2} ${kneeY - 60}, ${CX + 4} ${crotchY + 30}, ${CX} ${crotchY}`,
    // Left inseam down from crotch fork to left hem
    `C ${CX - 4} ${crotchY + 30}, ${legCenterLX + kneeW + 2} ${kneeY - 60}, ${legCenterLX + kneeW} ${kneeY}`,
    `C ${legCenterLX + kneeW} ${kneeY + 60}, ${legCenterLX + hemW} ${hemY - 40}, ${legCenterLX + hemW} ${hemY + 1}`,
    // Left cuff
    `Q ${legCenterLX} ${hemY + 4} ${legCenterLX - hemW} ${hemY}`,
    // Left outseam up past knee, thigh, hips to waistband
    `C ${legCenterLX - hemW - 2} ${hemY - 40}, ${legCenterLX - kneeW} ${kneeY + 60}, ${legCenterLX - kneeW} ${kneeY}`,
    `C ${legCenterLX - kneeW} 750, ${hipOutL} ${lowHipY + 50}, ${hipOutL - 2} ${lowHipY}`,
    `C ${hipOutL} ${lowHipY - 40}, ${wL - 8} ${lowHipY - 40}, ${wL} ${LM.waist.left.y}`,
    'Z'
  ].join(' ');
}

export function getTrouserBackPath(landmarks = DEFAULT_LM, isMale = false) {
  const LM = landmarks || DEFAULT_LM;
  const CX = LM?.bust?.center?.x || 385;
  const crotchY = isMale
    ? Math.round(LM.hip.lowLeft.y + 105)
    : Math.round(LM.hip.lowLeft.y + 125);
  const kneeY = Math.round(980);
  const hemY = Math.round((LM?.feet?.groundY || 1320) - 70);

  const waistDelta = CX - LM.waist.left.x;
  const wL = Math.round(LM.waist.left.x - 3);
  const wR = Math.round(LM.waist.right.x + 3);

  const hipOutL = Math.round(CX - waistDelta * (isMale ? 1.15 : 1.35));
  const hipOutR = Math.round(CX + waistDelta * (isMale ? 1.15 : 1.35));
  const lowHipY = LM.hip.lowLeft.y;

  const legOffset = Math.round(waistDelta * (isMale ? 0.46 : 0.52));
  const legCenterLX = Math.round(CX - legOffset);
  const legCenterRX = Math.round(CX + legOffset);
  const kneeW = Math.round(waistDelta * (isMale ? 0.48 : 0.42));
  const hemW = Math.round(waistDelta * (isMale ? 0.43 : 0.38));

  return [
    `M ${wL} ${LM.waist.left.y}`,
    `Q ${LM.waist.centerBack.x} ${LM.waist.centerBack.y} ${wR} ${LM.waist.right.y}`,
    `C ${wR + 8} ${lowHipY - 40}, ${hipOutR} ${lowHipY}, ${hipOutR + 2} ${lowHipY + 50}`,
    `C ${hipOutR} 750, ${legCenterRX + kneeW + 2} ${kneeY - 40}, ${legCenterRX + kneeW} ${kneeY}`,
    `C ${legCenterRX + kneeW} ${kneeY + 60}, ${legCenterRX + hemW + 2} ${hemY - 40}, ${legCenterRX + hemW} ${hemY}`,
    `Q ${legCenterRX} ${hemY + 4} ${legCenterRX - hemW} ${hemY + 1}`,
    `C ${legCenterRX - hemW} ${hemY - 40}, ${legCenterRX - kneeW} ${kneeY + 60}, ${legCenterRX - kneeW} ${kneeY}`,
    `C ${legCenterRX - kneeW - 2} ${kneeY - 60}, ${CX + 4} ${crotchY + 30}, ${CX} ${crotchY}`,
    `C ${CX - 4} ${crotchY + 30}, ${legCenterLX + kneeW + 2} ${kneeY - 60}, ${legCenterLX + kneeW} ${kneeY}`,
    `C ${legCenterLX + kneeW} ${kneeY + 60}, ${legCenterLX + hemW} ${hemY - 40}, ${legCenterLX + hemW} ${hemY + 1}`,
    `Q ${legCenterLX} ${hemY + 4} ${legCenterLX - hemW} ${hemY}`,
    `C ${legCenterLX - hemW - 2} ${hemY - 40}, ${legCenterLX - kneeW} ${kneeY + 60}, ${legCenterLX - kneeW} ${kneeY}`,
    `C ${legCenterLX - kneeW} 750, ${hipOutL} ${lowHipY + 50}, ${hipOutL - 2} ${lowHipY}`,
    `C ${hipOutL} ${lowHipY - 40}, ${wL - 8} ${lowHipY - 40}, ${wL} ${LM.waist.left.y}`,
    'Z'
  ].join(' ');
}

/**
 * Wide-Leg / Palazzo Trousers Front Path:
 * Full palazzo drape with wide flare from low hip down to ankle hem.
 * Completely closed crotch fork anchored at anatomical perineum.
 */
export function getWideLegFrontPath(landmarks = DEFAULT_LM, isMale = false) {
  const LM = landmarks || DEFAULT_LM;
  const CX = LM?.bust?.center?.x || 385;
  const crotchY = isMale
    ? Math.round(LM.hip.lowLeft.y + 105)
    : Math.round(LM.hip.lowLeft.y + 125);
  const hemY = Math.round((LM?.feet?.groundY || 1320) - 70);

  const waistDelta = CX - LM.waist.left.x;
  const legOffset = Math.round(waistDelta * (isMale ? 0.46 : 0.52));
  const cLX = Math.round(CX - legOffset);
  const cRX = Math.round(CX + legOffset);

  const wL = Math.round(LM.waist.left.x - 3);
  const wR = Math.round(LM.waist.right.x + 3);

  const hipOutL = Math.round(CX - waistDelta * (isMale ? 1.15 : 1.35));
  const hipOutR = Math.round(CX + waistDelta * (isMale ? 1.15 : 1.35));
  const lowHipY = LM.hip.lowLeft.y;

  const wideHemOuterR = isMale ? Math.round(CX + waistDelta * 2.05) : Math.round(LM.skirtAline.hemRight.x + 8);
  const wideHemOuterL = isMale ? Math.round(CX - waistDelta * 2.05) : Math.round(LM.skirtAline.hemLeft.x - 8);
  const wideHemInnerR = CX + 14;
  const wideHemInnerL = CX - 14;

  return [
    `M ${wL} ${LM.waist.left.y}`,
    `Q ${LM.waist.centerFront.x} ${LM.waist.centerFront.y} ${wR} ${LM.waist.right.y}`,
    `C ${wR + 8} ${lowHipY - 40}, ${hipOutR} ${lowHipY}, ${hipOutR} ${lowHipY + 30}`,
    `C ${hipOutR + 10} 780, ${wideHemOuterR - 20} 950, ${wideHemOuterR} ${hemY}`,
    `Q ${cRX} ${hemY + 6} ${wideHemInnerR} ${hemY + 2}`,
    `C ${wideHemInnerR} 950, ${CX + 8} ${crotchY + 40}, ${CX} ${crotchY}`,
    `C ${CX - 8} ${crotchY + 40}, ${wideHemInnerL} 950, ${wideHemInnerL} ${hemY + 2}`,
    `Q ${cLX} ${hemY + 6} ${wideHemOuterL} ${hemY}`,
    `C ${wideHemOuterL + 20} 950, ${hipOutL - 10} 780, ${hipOutL} ${lowHipY + 30}`,
    `C ${hipOutL} ${lowHipY}, ${wL - 8} ${lowHipY - 40}, ${wL} ${LM.waist.left.y}`,
    'Z'
  ].join(' ');
}

export function getWideLegBackPath(landmarks = DEFAULT_LM, isMale = false) {
  const LM = landmarks || DEFAULT_LM;
  const CX = LM?.bust?.center?.x || 385;
  const crotchY = isMale
    ? Math.round(LM.hip.lowLeft.y + 105)
    : Math.round(LM.hip.lowLeft.y + 125);
  const hemY = Math.round((LM?.feet?.groundY || 1320) - 70);

  const waistDelta = CX - LM.waist.left.x;
  const legOffset = Math.round(waistDelta * (isMale ? 0.46 : 0.52));
  const cLX = Math.round(CX - legOffset);
  const cRX = Math.round(CX + legOffset);

  const wL = Math.round(LM.waist.left.x - 3);
  const wR = Math.round(LM.waist.right.x + 3);

  const hipOutL = Math.round(CX - waistDelta * (isMale ? 1.15 : 1.35));
  const hipOutR = Math.round(CX + waistDelta * (isMale ? 1.15 : 1.35));
  const lowHipY = LM.hip.lowLeft.y;

  const wideHemOuterR = isMale ? Math.round(CX + waistDelta * 2.05) : Math.round(LM.skirtAline.hemRight.x + 8);
  const wideHemOuterL = isMale ? Math.round(CX - waistDelta * 2.05) : Math.round(LM.skirtAline.hemLeft.x - 8);
  const wideHemInnerR = CX + 14;
  const wideHemInnerL = CX - 14;

  return [
    `M ${wL} ${LM.waist.left.y}`,
    `Q ${LM.waist.centerBack.x} ${LM.waist.centerBack.y} ${wR} ${LM.waist.right.y}`,
    `C ${wR + 8} ${lowHipY - 40}, ${hipOutR} ${lowHipY}, ${hipOutR} ${lowHipY + 30}`,
    `C ${hipOutR + 10} 780, ${wideHemOuterR - 20} 950, ${wideHemOuterR} ${hemY}`,
    `Q ${cRX} ${hemY + 6} ${wideHemInnerR} ${hemY + 2}`,
    `C ${wideHemInnerR} 950, ${CX + 8} ${crotchY + 40}, ${CX} ${crotchY}`,
    `C ${CX - 8} ${crotchY + 40}, ${wideHemInnerL} 950, ${wideHemInnerL} ${hemY + 2}`,
    `Q ${cLX} ${hemY + 6} ${wideHemOuterL} ${hemY}`,
    `C ${wideHemOuterL + 20} 950, ${hipOutL - 10} 780, ${hipOutL} ${lowHipY + 30}`,
    `C ${hipOutL} ${lowHipY}, ${wL - 8} ${lowHipY - 40}, ${wL} ${LM.waist.left.y}`,
    'Z'
  ].join(' ');
}

/* ==========================================================================
   6. SLEEVES: SHORT (REFERENCE), LONG & FLARE
   ========================================================================== */

/**
 * Short Sleeve Path (Reference Implementation):
 * Rounds softly over deltoid cap and drapes downward along upper arm cylinder with elliptical hem.
 */
export function getLeftSleevePath(isBack = false, landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  const shX = LM.shoulders.leftTip.x;
  const shY = LM.shoulders.leftTip.y;
  const outX = LM.sleeveShort.leftOuterHem.x;
  const outY = LM.sleeveShort.leftOuterHem.y;
  const inX = LM.sleeveShort.leftInnerHem.x;
  const inY = LM.sleeveShort.leftInnerHem.y;
  const pitX = LM.armscye.leftPit.x;
  const pitY = LM.armscye.leftPit.y;
  const midX = LM.armscye.leftMid.x;
  const midY = LM.armscye.leftMid.y;

  return [
    `M ${shX} ${shY}`,
    `C ${shX - 10} ${shY + 20}, ${outX - 4} ${outY - 24}, ${outX} ${outY}`,
    `C ${outX + 8} ${outY + 6}, ${inX - 10} ${inY + 6}, ${inX} ${inY}`,
    `C ${pitX - 2} ${pitY - 12}, ${midX} ${midY}, ${shX} ${shY}`,
    'Z'
  ].join(' ');
}

export function getRightSleevePath(isBack = false, landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  const shX = LM.shoulders.rightTip.x;
  const shY = LM.shoulders.rightTip.y;
  const outX = LM.sleeveShort.rightOuterHem.x;
  const outY = LM.sleeveShort.rightOuterHem.y;
  const inX = LM.sleeveShort.rightInnerHem.x;
  const inY = LM.sleeveShort.rightInnerHem.y;
  const pitX = LM.armscye.rightPit.x;
  const pitY = LM.armscye.rightPit.y;
  const midX = LM.armscye.rightMid.x;
  const midY = LM.armscye.rightMid.y;

  return [
    `M ${shX} ${shY}`,
    `C ${shX + 10} ${shY + 20}, ${outX + 4} ${outY - 24}, ${outX} ${outY}`,
    `C ${outX - 8} ${outY + 6}, ${inX + 10} ${inY + 6}, ${inX} ${inY}`,
    `C ${pitX + 2} ${pitY - 12}, ${midX} ${midY}, ${shX} ${shY}`,
    'Z'
  ].join(' ');
}

/**
 * Long Sleeve Path:
 * Seamless set-in attachment to armscye. Follows bicep volume, natural outward arm angle,
 * and tapers gracefully to a tailored wrist cuff at Y ~ 650-665.
 */
export function getLeftLongSleevePath(isBack = false, landmarks = DEFAULT_LM, isMale = false) {
  const LM = landmarks || DEFAULT_LM;
  const shX = LM.shoulders.leftTip.x;
  const shY = LM.shoulders.leftTip.y;
  const bicepOutX = LM.sleeveShort.leftOuterHem.x;
  const bicepOutY = LM.sleeveShort.leftOuterHem.y;
  const pitX = LM.armscye.leftPit.x;
  const pitY = LM.armscye.leftPit.y;
  const midX = LM.armscye.leftMid.x;
  const midY = LM.armscye.leftMid.y;

  // Natural arm angle: arm angles outward laterally as it descends toward wrist
  const wristY = isMale ? 665 : 650;
  const elbowY = isMale ? 515 : 500;

  const elbowOutX = isMale ? bicepOutX - 16 : bicepOutX - 12;
  const wristOutX = isMale ? bicepOutX - 14 : bicepOutX - 18;
  const wristWidth = isMale ? 44 : 36;
  const wristInX = wristOutX + wristWidth;

  return [
    `M ${shX} ${shY}`,
    `C ${shX - 12} ${shY + 20}, ${bicepOutX - 4} ${bicepOutY - 20}, ${bicepOutX} ${bicepOutY}`,
    `C ${bicepOutX - 2} ${bicepOutY + 30}, ${elbowOutX - 2} ${elbowY - 20}, ${elbowOutX} ${elbowY}`,
    `C ${elbowOutX - 2} ${elbowY + 30}, ${wristOutX - 2} ${wristY - 25}, ${wristOutX} ${wristY}`,
    `Q ${(wristOutX + wristInX) / 2} ${wristY + 5} ${wristInX} ${wristY}`,
    `C ${wristInX + 4} ${wristY - 30}, ${pitX - 6} ${elbowY + 20}, ${pitX} ${pitY}`,
    `C ${pitX - 2} ${pitY - 12}, ${midX} ${midY}, ${shX} ${shY}`,
    'Z'
  ].join(' ');
}

export function getRightLongSleevePath(isBack = false, landmarks = DEFAULT_LM, isMale = false) {
  const LM = landmarks || DEFAULT_LM;
  const shX = LM.shoulders.rightTip.x;
  const shY = LM.shoulders.rightTip.y;
  const bicepOutX = LM.sleeveShort.rightOuterHem.x;
  const bicepOutY = LM.sleeveShort.rightOuterHem.y;
  const pitX = LM.armscye.rightPit.x;
  const pitY = LM.armscye.rightPit.y;
  const midX = LM.armscye.rightMid.x;
  const midY = LM.armscye.rightMid.y;

  const wristY = isMale ? 665 : 650;
  const elbowY = isMale ? 515 : 500;

  const elbowOutX = isMale ? bicepOutX + 16 : bicepOutX + 12;
  const wristOutX = isMale ? bicepOutX + 14 : bicepOutX + 18;
  const wristWidth = isMale ? 44 : 36;
  const wristInX = wristOutX - wristWidth;

  return [
    `M ${shX} ${shY}`,
    `C ${shX + 12} ${shY + 20}, ${bicepOutX + 4} ${bicepOutY - 20}, ${bicepOutX} ${bicepOutY}`,
    `C ${bicepOutX + 2} ${bicepOutY + 30}, ${elbowOutX + 2} ${elbowY - 20}, ${elbowOutX} ${elbowY}`,
    `C ${elbowOutX + 2} ${elbowY + 30}, ${wristOutX + 2} ${wristY - 25}, ${wristOutX} ${wristY}`,
    `Q ${(wristOutX + wristInX) / 2} ${wristY + 5} ${wristInX} ${wristY}`,
    `C ${wristInX - 4} ${wristY - 30}, ${pitX + 6} ${elbowY + 20}, ${pitX} ${pitY}`,
    `C ${pitX + 2} ${pitY - 12}, ${midX} ${midY}, ${shX} ${shY}`,
    'Z'
  ].join(' ');
}

/**
 * Flare / Bell Sleeve Path:
 * Clean shoulder/armscye cap attachment, fitted through bicep, then fluting
 * gracefully outward to a 3D bell cuff at mid-forearm (Y ~ 605).
 */
export function getLeftFlareSleevePath(isBack = false, landmarks = DEFAULT_LM, isMale = false) {
  const LM = landmarks || DEFAULT_LM;
  const shX = LM.shoulders.leftTip.x;
  const shY = LM.shoulders.leftTip.y;
  const bicepOutX = LM.sleeveShort.leftOuterHem.x;
  const bicepOutY = LM.sleeveShort.leftOuterHem.y;
  const pitX = LM.armscye.leftPit.x;
  const pitY = LM.armscye.leftPit.y;
  const midX = LM.armscye.leftMid.x;
  const midY = LM.armscye.leftMid.y;

  const bellY = 605;
  const bellOutX = Math.round(bicepOutX - (isMale ? 32 : 36));
  const bellInX = Math.round(bicepOutX + 24);

  return [
    `M ${shX} ${shY}`,
    `C ${shX - 12} ${shY + 20}, ${bicepOutX - 4} ${bicepOutY - 20}, ${bicepOutX} ${bicepOutY}`,
    `C ${bicepOutX - 4} ${bicepOutY + 30}, ${bellOutX + 8} ${bellY - 30}, ${bellOutX} ${bellY}`,
    `Q ${(bellOutX + bellInX) / 2} ${bellY + 8} ${bellInX} ${bellY}`,
    `C ${bellInX - 4} ${bellY - 30}, ${pitX - 2} ${bicepOutY + 20}, ${pitX} ${pitY}`,
    `C ${pitX - 2} ${pitY - 12}, ${midX} ${midY}, ${shX} ${shY}`,
    'Z'
  ].join(' ');
}

export function getRightFlareSleevePath(isBack = false, landmarks = DEFAULT_LM, isMale = false) {
  const LM = landmarks || DEFAULT_LM;
  const shX = LM.shoulders.rightTip.x;
  const shY = LM.shoulders.rightTip.y;
  const bicepOutX = LM.sleeveShort.rightOuterHem.x;
  const bicepOutY = LM.sleeveShort.rightOuterHem.y;
  const pitX = LM.armscye.rightPit.x;
  const pitY = LM.armscye.rightPit.y;
  const midX = LM.armscye.rightMid.x;
  const midY = LM.armscye.rightMid.y;

  const bellY = 605;
  const bellOutX = Math.round(bicepOutX + (isMale ? 32 : 36));
  const bellInX = Math.round(bicepOutX - 24);

  return [
    `M ${shX} ${shY}`,
    `C ${shX + 12} ${shY + 20}, ${bicepOutX + 4} ${bicepOutY - 20}, ${bicepOutX} ${bicepOutY}`,
    `C ${bicepOutX + 4} ${bicepOutY + 30}, ${bellOutX - 8} ${bellY - 30}, ${bellOutX} ${bellY}`,
    `Q ${(bellOutX + bellInX) / 2} ${bellY + 8} ${bellInX} ${bellY}`,
    `C ${bellInX + 4} ${bellY - 30}, ${pitX + 2} ${bicepOutY + 20}, ${pitX} ${pitY}`,
    `C ${pitX + 2} ${pitY - 12}, ${midX} ${midY}, ${shX} ${shY}`,
    'Z'
  ].join(' ');
}

/* ==========================================================================
   7. NECKLINES & COLLAR BINDINGS
   ========================================================================== */

/**
 * Universal Neckline Finished Binding Strip:
 * Dispatches to Round Jewel, V-Neck, or Square Neck based on active collar style.
 */
export function getNecklineBindingPath(isBack = false, landmarks = DEFAULT_LM, collar = 'round', isMale = false) {
  const LM = landmarks || DEFAULT_LM;

  if (collar === 'vneck') {
    return getVNeckBindingPath(isBack, LM, isMale);
  }
  if (collar === 'square') {
    return getSquareNeckBindingPath(isBack, LM, isMale);
  }

  // Canonical Round Jewel Binding
  if (isBack) {
    return [
      `M ${LM.neck.left.x} ${LM.neck.left.y}`,
      `Q ${LM.neck.backCervicaleDip.x} ${LM.neck.backCervicaleDip.y} ${LM.neck.right.x} ${LM.neck.right.y}`,
      `L ${LM.neck.right.x} ${LM.neck.right.y + 6}`,
      `Q ${LM.neck.backCervicaleDip.x} ${LM.neck.backCervicaleDip.y + 6} ${LM.neck.left.x} ${LM.neck.left.y + 6}`,
      'Z'
    ].join(' ');
  }

  return [
    `M ${LM.neck.left.x} ${LM.neck.left.y}`,
    `Q ${LM.neck.frontJewelDip.x} ${LM.neck.frontJewelDip.y} ${LM.neck.right.x} ${LM.neck.right.y}`,
    `L ${LM.neck.right.x} ${LM.neck.right.y + 6}`,
    `Q ${LM.neck.frontJewelDip.x} ${LM.neck.frontJewelDip.y + 6} ${LM.neck.left.x} ${LM.neck.left.y + 6}`,
    'Z'
  ].join(' ');
}

/**
 * V-Neck Finished Binding Strip:
 * Mitered V-neck collar band matching the garment's neckline cutout.
 */
export function getVNeckBindingPath(isBack = false, landmarks = DEFAULT_LM, isMale = false) {
  const LM = landmarks || DEFAULT_LM;
  const CX = LM?.bust?.center?.x || 385;

  if (isBack) {
    return [
      `M ${LM.neck.left.x} ${LM.neck.left.y}`,
      `Q ${LM.neck.backCervicaleDip.x} ${LM.neck.backCervicaleDip.y} ${LM.neck.right.x} ${LM.neck.right.y}`,
      `L ${LM.neck.right.x} ${LM.neck.right.y + 6}`,
      `Q ${LM.neck.backCervicaleDip.x} ${LM.neck.backCervicaleDip.y + 6} ${LM.neck.left.x} ${LM.neck.left.y + 6}`,
      'Z'
    ].join(' ');
  }

  const vDip = isMale
    ? Math.round(LM.bust.center.y - 5)
    : Math.round(LM.bust.center.y + 10);

  return [
    `M ${LM.neck.left.x} ${LM.neck.left.y}`,
    `L ${CX} ${vDip}`,
    `L ${LM.neck.right.x} ${LM.neck.right.y}`,
    `L ${LM.neck.right.x} ${LM.neck.right.y + 6}`,
    `L ${CX} ${vDip + 8}`,
    `L ${LM.neck.left.x} ${LM.neck.left.y + 6}`,
    'Z'
  ].join(' ');
}

/**
 * Square Neck Finished Binding Strip:
 * Architectural right-angled collar band framing the shoulders.
 */
export function getSquareNeckBindingPath(isBack = false, landmarks = DEFAULT_LM, isMale = false) {
  const LM = landmarks || DEFAULT_LM;

  if (isBack) {
    return [
      `M ${LM.neck.left.x} ${LM.neck.left.y}`,
      `Q ${LM.neck.backCervicaleDip.x} ${LM.neck.backCervicaleDip.y} ${LM.neck.right.x} ${LM.neck.right.y}`,
      `L ${LM.neck.right.x} ${LM.neck.right.y + 6}`,
      `Q ${LM.neck.backCervicaleDip.x} ${LM.neck.backCervicaleDip.y + 6} ${LM.neck.left.x} ${LM.neck.left.y + 6}`,
      'Z'
    ].join(' ');
  }

  const boxY = Math.round(LM.neck.frontJewelDip.y + (isMale ? 46 : 40));
  const boxL = LM.neck.left.x - 4;
  const boxR = LM.neck.right.x + 4;

  return [
    `M ${LM.neck.left.x} ${LM.neck.left.y}`,
    `L ${boxL} ${boxY}`,
    `L ${boxR} ${boxY}`,
    `L ${LM.neck.right.x} ${LM.neck.right.y}`,
    `L ${LM.neck.right.x} ${LM.neck.right.y + 6}`,
    `L ${boxR - 6} ${boxY + 6}`,
    `L ${boxL + 6} ${boxY + 6}`,
    `L ${LM.neck.left.x} ${LM.neck.left.y + 6}`,
    'Z'
  ].join(' ');
}

/**
 * Underside Hem Facing Shadow Path
 */
export function getHemFacingDepthPath(landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  return [
    `M ${LM.skirtAline.hemLeft.x} ${LM.skirtAline.hemY}`,
    `Q ${LM.skirtAline.hemCenterBack.x} ${LM.skirtAline.hemCenterBack.y + 10} ${LM.skirtAline.hemRight.x} ${LM.skirtAline.hemY}`,
    `Q ${LM.skirtAline.hemCenterFront.x} ${LM.skirtAline.hemCenterFront.y} ${LM.skirtAline.hemLeft.x} ${LM.skirtAline.hemY}`,
    'Z'
  ].join(' ');
}

/* ==========================================================================
   8. COMPONENT-AWARE SARTORIAL CONSTRUCTION DETAILS
   ========================================================================== */

/**
 * Derives contextual construction seams, darts, and topstitching tailored
 * specifically to the active component selection and gender.
 */
export function getConstructionLines(view = 'front', landmarks = DEFAULT_LM, designState = null) {
  const LM = landmarks || DEFAULT_LM;
  const isBack = (view === 'back');
  const isMale = (designState?.figure === 'male' || designState?.croquis === 'male');
  const top = designState?.top || 'basic';
  const bottom = designState?.bottom || 'skirt';
  const sleevesStyle = designState?.sleeves || 'short';
  const collar = designState?.collar || 'round';

  const frame = getGarmentFitFrame(LM, isMale);
  const CX = frame.CX;
  const crotchY = frame.crotchY;
  const kneeY = frame.kneeY;
  const trouserHemY = frame.trouserHemY;
  const cLX = frame.legCenterLX;
  const cRX = frame.legCenterRX;
  const hw = frame.hemHalfWidth;
  const shirtHemY = frame.shirtHemY;

  const leftPrincessWaistX = Math.round(LM.waist.left.x + (CX - LM.waist.left.x) * 0.49);
  const rightPrincessWaistX = Math.round(CX + (LM.waist.right.x - CX) * 0.51);

  const lOuterY = LM.sleeveShort.leftOuterHem.y;
  const lInnerY = LM.sleeveShort.leftInnerHem.y;
  const rOuterY = LM.sleeveShort.rightOuterHem.y;
  const rInnerY = LM.sleeveShort.rightInnerHem.y;

  const lines = {
    // Armscye seams (shared by all sleeves)
    leftArmscye: `M ${LM.shoulders.leftTip.x} ${LM.shoulders.leftTip.y} C ${LM.armscye.leftMid.x} ${LM.armscye.leftMid.y}, ${LM.armscye.leftPit.x - 2} ${LM.armscye.leftPit.y - 12}, ${LM.armscye.leftPit.x} ${LM.armscye.leftPit.y}`,
    rightArmscye: `M ${LM.shoulders.rightTip.x} ${LM.shoulders.rightTip.y} C ${LM.armscye.rightMid.x} ${LM.armscye.rightMid.y}, ${LM.armscye.rightPit.x + 2} ${LM.armscye.rightPit.y - 12}, ${LM.armscye.rightPit.x} ${LM.armscye.rightPit.y}`
  };

  // Sleeve hem stitches
  if (sleevesStyle === 'long') {
    const wristY = isMale ? 675 : 660;
    const wOutLX = frame.shirtSideLX ? frame.shirtSideLX : 246;
    lines.sleeveLeftStitch = `M ${Math.round(LM.sleeveShort.leftOuterHem.x + 10)} ${wristY - 6} L ${Math.round(LM.armscye.leftPit.x - 14)} ${wristY - 6}`;
    lines.sleeveRightStitch = `M ${Math.round(LM.armscye.rightPit.x + 14)} ${wristY - 6} L ${Math.round(LM.sleeveShort.rightOuterHem.x - 10)} ${wristY - 6}`;
  } else if (sleevesStyle === 'flare') {
    lines.sleeveLeftStitch = `M ${Math.round(LM.sleeveShort.leftOuterHem.x - 30)} 598 Q ${Math.round(LM.sleeveShort.leftOuterHem.x - 12)} 604 ${Math.round(LM.armscye.leftPit.x - 2)} 598`;
    lines.sleeveRightStitch = `M ${Math.round(LM.armscye.rightPit.x + 2)} 598 Q ${Math.round(LM.sleeveShort.rightOuterHem.x + 12)} 604 ${Math.round(LM.sleeveShort.rightOuterHem.x + 30)} 598`;
  } else {
    // Short sleeve topstitching
    lines.sleeveLeftStitch = `M ${LM.sleeveShort.leftOuterHem.x + 3} ${lOuterY - 5} C ${LM.sleeveShort.leftOuterHem.x + 7} ${lOuterY + 2}, ${LM.sleeveShort.leftInnerHem.x - 10} ${lInnerY + 2}, ${LM.sleeveShort.leftInnerHem.x} ${lInnerY - 5}`;
    lines.sleeveRightStitch = `M ${LM.sleeveShort.rightInnerHem.x} ${rInnerY - 5} C ${LM.sleeveShort.rightInnerHem.x + 10} ${rInnerY + 2}, ${LM.sleeveShort.rightOuterHem.x - 7} ${rOuterY + 2}, ${LM.sleeveShort.rightOuterHem.x - 3} ${rOuterY - 5}`;
  }

  // TOP CONSTRUCTION LINES
  if (!isBack) {
    if (top === 'crop') {
      // Relaxed Shirt: Front Button Placket
      const placketStartY = (collar === 'vneck')
        ? (isMale ? Math.round(LM.bust.center.y - 5) : Math.round(LM.bust.center.y + 10))
        : (collar === 'square' ? Math.round(LM.neck.frontJewelDip.y + 40) : LM.neck.frontJewelDip.y);

      lines.shirtPlacketLeft = `M ${CX - 10} ${placketStartY} L ${CX - 10} ${shirtHemY + 10}`;
      lines.shirtPlacketRight = `M ${CX + 10} ${placketStartY} L ${CX + 10} ${shirtHemY + 10}`;
      lines.shirtPlacketCenter = `M ${CX} ${placketStartY} L ${CX} ${shirtHemY + 10}`;
      lines.shirtButtons = [
        { x: CX, y: Math.round(placketStartY + 45) },
        { x: CX, y: Math.round(placketStartY + 95) },
        { x: CX, y: Math.round(placketStartY + 145) },
        { x: CX, y: Math.round(placketStartY + 195) }
      ];
      if (isMale) {
        // Chest pocket on left pectoral
        const pocX = Math.round(LM.bust.leftApex.x);
        const pocY = Math.round(LM.bust.leftApex.y - 10);
        lines.chestPocket = `M ${pocX - 22} ${pocY} L ${pocX + 22} ${pocY} L ${pocX + 22} ${pocY + 42} L ${pocX} ${pocY + 52} L ${pocX - 22} ${pocY + 42} Z`;
      }
    } else if (top === 'wrap') {
      // Diagonal crossover seam line
      const lapelCrossY = Math.round(LM.bust.center.y + 12);
      lines.wrapCrossover = `M ${LM.neck.left.x} ${LM.neck.left.y} C ${LM.neck.left.x + 10} ${LM.neck.left.y + 40}, ${CX - 15} ${lapelCrossY - 20}, ${CX} ${lapelCrossY} L ${LM.waist.right.x} ${LM.waist.right.y}`;
      lines.wrapTie = `M ${LM.waist.right.x} ${LM.waist.right.y} Q ${LM.waist.right.x + 18} ${LM.waist.right.y + 15} ${LM.waist.right.x + 8} ${LM.waist.right.y + 35}`;
    } else {
      // Fitted Bodice & Peplum: Princess Seams
      lines.leftPrincessSeam = `M ${LM.shoulders.leftMid.x} ${LM.shoulders.leftMid.y} Q ${LM.bust.leftApex.x - 4} 345 ${LM.bust.leftApex.x} ${LM.bust.leftApex.y} Q ${LM.bust.leftApex.x + 4} 435 ${leftPrincessWaistX} ${LM.waist.left.y + 2}`;
      lines.rightPrincessSeam = `M ${LM.shoulders.rightMid.x} ${LM.shoulders.rightMid.y} Q ${LM.bust.rightApex.x + 4} 345 ${LM.bust.rightApex.x} ${LM.bust.rightApex.y} Q ${LM.bust.rightApex.x - 4} 435 ${rightPrincessWaistX} ${LM.waist.right.y + 2}`;
    }
  } else {
    // Back View: Closure / Yoke
    if (top === 'crop') {
      // Shirt back yoke and box pleat
      const yokeY = Math.round(LM.neck.backCervicaleDip.y + 60);
      lines.shirtYoke = `M ${LM.armscye.leftMid.x + 6} ${yokeY} Q ${CX} ${yokeY - 4} ${LM.armscye.rightMid.x - 6} ${yokeY}`;
      lines.shirtPleatLeft = `M ${CX - 8} ${yokeY} L ${CX - 8} ${LM.waist.centerBack.y}`;
      lines.shirtPleatRight = `M ${CX + 8} ${yokeY} L ${CX + 8} ${LM.waist.centerBack.y}`;
    } else {
      // Center back invisible zipper & darts
      lines.centerBackZipper = `M ${CX} ${LM.neck.backCervicaleDip.y + 4} L ${CX} ${LM.waist.centerBack.y + 75}`;
      lines.leftBackDart = `M ${leftPrincessWaistX} 320 L ${leftPrincessWaistX} ${LM.waist.left.y - 2}`;
      lines.rightBackDart = `M ${rightPrincessWaistX} 320 L ${rightPrincessWaistX} ${LM.waist.right.y - 2}`;
    }
  }

  // BOTTOM CONSTRUCTION LINES
  if (bottom === 'trousers' || bottom === 'wide') {
    if (!isBack) {
      // Front Fly Placket: only display when waistband is exposed (not covered by an untucked shirt)
      if (top !== 'crop') {
        const flyBotY = Math.round(crotchY - 30);
        lines.frontFlyPlacket = `M ${CX} ${LM.waist.centerFront.y} L ${CX} ${flyBotY} C ${CX} ${flyBotY + 16}, ${CX + 18} ${flyBotY + 16}, ${CX + 18} ${flyBotY}`;
      }
      // Front pressed leg creases
      lines.trouserCreaseLeft = `M ${cLX} ${crotchY + 30} L ${cLX} ${trouserHemY - 15}`;
      lines.trouserCreaseRight = `M ${cRX} ${crotchY + 30} L ${cRX} ${trouserHemY - 15}`;
      // Cuff hem stitches
      lines.hemStitchLeft = `M ${cLX - hw + 4} ${trouserHemY - 8} L ${cLX + hw - 4} ${trouserHemY - 8}`;
      lines.hemStitchRight = `M ${cRX - hw + 4} ${trouserHemY - 8} L ${cRX + hw - 4} ${trouserHemY - 8}`;
    } else {
      // Back rise seam and welt pockets
      lines.trouserBackRise = `M ${CX} ${LM.waist.centerBack.y} L ${CX} ${crotchY}`;
      const pocketY = Math.round(LM.waist.centerBack.y + 45);
      lines.trouserPocketLeft = `M ${cLX - 26} ${pocketY} L ${cLX + 26} ${pocketY}`;
      lines.trouserPocketRight = `M ${cRX - 26} ${pocketY} L ${cRX + 26} ${pocketY}`;
      lines.hemStitchLeft = `M ${cLX - hw + 4} ${trouserHemY - 8} L ${cLX + hw - 4} ${trouserHemY - 8}`;
      lines.hemStitchRight = `M ${cRX - hw + 4} ${trouserHemY - 8} L ${cRX + hw - 4} ${trouserHemY - 8}`;
    }
  } else if (bottom === 'straight') {
    const sHemY = Math.round(LM.skirtAline.hemY + 6);
    if (!isBack) {
      lines.hemStitch = `M ${LM.hip.lowLeft.x + 8} ${sHemY - 7} Q ${CX} ${sHemY - 1} ${LM.hip.lowRight.x - 8} ${sHemY - 7}`;
    } else {
      lines.hemStitch = `M ${LM.hip.lowLeft.x + 8} ${sHemY - 7} Q ${CX} ${sHemY - 1} ${LM.hip.lowRight.x - 8} ${sHemY - 7}`;
      // Back walking vent slit
      lines.walkingVent = `M ${CX} ${sHemY - 55} L ${CX} ${sHemY + 6}`;
    }
  } else {
    // A-Line Skirt Flutes & Curved Hem Stitch
    if (!isBack) {
      lines.waistSeam = `M ${LM.waist.left.x} ${LM.waist.left.y} Q ${LM.waist.centerFront.x} ${LM.waist.centerFront.y} ${LM.waist.right.x} ${LM.waist.right.y}`;
      lines.skirtFlutes = [
        `M ${LM.waist.left.x + 19} ${LM.waist.left.y + 1} Q ${LM.hip.lowLeft.x + 8} 680 ${LM.skirtAline.hemLeft.x + 34} ${LM.skirtAline.hemY + 4}`,
        `M ${leftPrincessWaistX} ${LM.waist.left.y + 2} Q ${LM.bust.leftApex.x - 15} 680 ${LM.skirtAline.hemLeft.x + 94} ${LM.skirtAline.hemY + 9}`,
        `M ${CX} ${LM.waist.centerFront.y} Q ${CX} 690 ${LM.skirtAline.hemCenterFront.x} ${LM.skirtAline.hemCenterFront.y}`,
        `M ${rightPrincessWaistX} ${LM.waist.right.y + 2} Q ${LM.bust.rightApex.x + 15} 680 ${LM.skirtAline.hemRight.x - 94} ${LM.skirtAline.hemY + 9}`,
        `M ${LM.waist.right.x - 17} ${LM.waist.right.y + 1} Q ${LM.hip.lowRight.x - 8} 680 ${LM.skirtAline.hemRight.x - 34} ${LM.skirtAline.hemY + 4}`
      ];
      lines.hemStitch = `M ${LM.skirtAline.hemLeft.x + 6} ${LM.skirtAline.hemY - 7} Q ${LM.skirtAline.hemCenterFront.x} ${LM.skirtAline.hemCenterFront.y - 7} ${LM.skirtAline.hemRight.x - 6} ${LM.skirtAline.hemY - 7}`;
    } else {
      lines.waistSeam = `M ${LM.waist.left.x} ${LM.waist.left.y} Q ${LM.waist.centerBack.x} ${LM.waist.centerBack.y} ${LM.waist.right.x} ${LM.waist.right.y}`;
      lines.skirtFlutes = [
        `M ${LM.waist.left.x + 19} ${LM.waist.left.y + 1} Q ${LM.hip.lowLeft.x + 8} 680 ${LM.skirtAline.hemLeft.x + 34} ${LM.skirtAline.hemY - 1}`,
        `M ${leftPrincessWaistX} ${LM.waist.left.y - 2} Q ${LM.bust.leftApex.x - 15} 680 ${LM.skirtAline.hemLeft.x + 94} ${LM.skirtAline.hemY}`,
        `M ${CX} ${LM.waist.centerBack.y} L ${CX} ${LM.skirtAline.hemCenterBack.y}`,
        `M ${rightPrincessWaistX} ${LM.waist.right.y - 2} Q ${LM.bust.rightApex.x + 15} 680 ${LM.skirtAline.hemRight.x - 94} ${LM.skirtAline.hemY}`,
        `M ${LM.waist.right.x - 17} ${LM.waist.right.y + 1} Q ${LM.hip.lowRight.x - 8} 680 ${LM.skirtAline.hemRight.x - 34} ${LM.skirtAline.hemY - 1}`
      ];
      lines.hemStitch = `M ${LM.skirtAline.hemLeft.x + 6} ${LM.skirtAline.hemY - 7} Q ${LM.skirtAline.hemCenterBack.x} ${LM.skirtAline.hemCenterBack.y + 3} ${LM.skirtAline.hemRight.x - 6} ${LM.skirtAline.hemY - 7}`;
    }
  }

  return lines;
}
