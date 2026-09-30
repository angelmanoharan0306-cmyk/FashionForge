/**
 * FashionForge — 2.5D Centralized Renderer: Geometry & Landmarks
 *
 * Mapped 1:1 to the real human fashion model assets:
 * frontend/assets/models/female-model-front.png
 * frontend/assets/models/female-model-back.png
 *
 * Native dimensions: 768 × 1376 pixels.
 * Primary anatomical vertical center axis: X = 385.
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

  // Anatomical Landmarks measured directly from the human model photography
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
      lowLeft: { x: 282, y: 600 },           // Widest hip contour left
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
      // Foreground clip covering bare wrist and hand resting in front of skirt
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

/**
 * Bodice Front Path:
 * Contours neck base, natural shoulder slope, armscye, bust fullness, and curved natural waist.
 */
export function getBodiceFrontPath(landmarks = DEFAULT_LM) {
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
    `Q ${LM.neck.frontJewelDip.x} ${LM.neck.frontJewelDip.y} ${LM.neck.right.x} ${LM.neck.right.y}`,
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
 * Higher cervicale dip, tailored back darts, and spine center seam.
 */
export function getBodiceBackPath(landmarks = DEFAULT_LM) {
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
export function getInnerNeckBackDepthPath(landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  return [
    `M ${LM.neck.left.x} ${LM.neck.left.y}`,
    `Q ${LM.neck.backCervicaleDip.x} ${LM.neck.backCervicaleDip.y - 3} ${LM.neck.right.x} ${LM.neck.right.y}`,
    `Q ${LM.neck.frontJewelDip.x} ${LM.neck.frontJewelDip.y} ${LM.neck.left.x} ${LM.neck.left.y}`,
    'Z'
  ].join(' ');
}

/**
 * A-Line Skirt Front Path:
 * Flaring gracefully from natural waist past hips down to knee level with curved hem.
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

/**
 * A-Line Skirt Back Path:
 * Slightly raised rear hemline in perspective.
 */
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
 * Hem Facing Depth Path (Underside facing shadow under skirt hem)
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

/**
 * Left Sleeve Path (Set-In Short Sleeve):
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

/**
 * Right Sleeve Path (Set-In Short Sleeve):
 * Rounds softly over deltoid cap and drapes downward along upper arm cylinder with elliptical hem.
 */
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
 * Neckline Binding Strip Path:
 * Clean slender band hugging the collar base without gaps.
 */
export function getNecklineBindingPath(isBack = false, landmarks = DEFAULT_LM) {
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
  return [
    `M ${LM.neck.left.x} ${LM.neck.left.y}`,
    `Q ${LM.neck.frontJewelDip.x} ${LM.neck.frontJewelDip.y} ${LM.neck.right.x} ${LM.neck.right.y}`,
    `L ${LM.neck.right.x} ${LM.neck.right.y + 6}`,
    `Q ${LM.neck.frontJewelDip.x} ${LM.neck.frontJewelDip.y + 6} ${LM.neck.left.x} ${LM.neck.left.y + 6}`,
    'Z'
  ].join(' ');
}

/**
 * Construction Seams and Drape Flutes
 */
export function getConstructionLines(view = 'front', landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  const leftPrincessWaistX = Math.round(LM.waist.left.x + (LM.bust.center.x - LM.waist.left.x) * 0.49);
  const rightPrincessWaistX = Math.round(LM.bust.center.x + (LM.waist.right.x - LM.bust.center.x) * 0.51);

  const lOuterY = LM.sleeveShort.leftOuterHem.y;
  const lInnerY = LM.sleeveShort.leftInnerHem.y;
  const rOuterY = LM.sleeveShort.rightOuterHem.y;
  const rInnerY = LM.sleeveShort.rightInnerHem.y;

  if (view === 'front') {
    return {
      leftPrincessSeam: `M ${LM.shoulders.leftMid.x} ${LM.shoulders.leftMid.y} Q ${LM.bust.leftApex.x - 4} 345 ${LM.bust.leftApex.x} ${LM.bust.leftApex.y} Q ${LM.bust.leftApex.x + 4} 435 ${leftPrincessWaistX} ${LM.waist.left.y + 2}`,
      rightPrincessSeam: `M ${LM.shoulders.rightMid.x} ${LM.shoulders.rightMid.y} Q ${LM.bust.rightApex.x + 4} 345 ${LM.bust.rightApex.x} ${LM.bust.rightApex.y} Q ${LM.bust.rightApex.x - 4} 435 ${rightPrincessWaistX} ${LM.waist.right.y + 2}`,
      leftArmscye: `M ${LM.shoulders.leftTip.x} ${LM.shoulders.leftTip.y} C ${LM.armscye.leftMid.x} ${LM.armscye.leftMid.y}, ${LM.armscye.leftPit.x - 2} ${LM.armscye.leftPit.y - 12}, ${LM.armscye.leftPit.x} ${LM.armscye.leftPit.y}`,
      rightArmscye: `M ${LM.shoulders.rightTip.x} ${LM.shoulders.rightTip.y} C ${LM.armscye.rightMid.x} ${LM.armscye.rightMid.y}, ${LM.armscye.rightPit.x + 2} ${LM.armscye.rightPit.y - 12}, ${LM.armscye.rightPit.x} ${LM.armscye.rightPit.y}`,
      waistSeam: `M ${LM.waist.left.x} ${LM.waist.left.y} Q ${LM.waist.centerFront.x} ${LM.waist.centerFront.y} ${LM.waist.right.x} ${LM.waist.right.y}`,
      skirtFluteOuterLeft: `M ${LM.waist.left.x + 19} ${LM.waist.left.y + 1} Q ${LM.hip.lowLeft.x + 8} 680 ${LM.skirtAline.hemLeft.x + 34} ${LM.skirtAline.hemY + 4}`,
      skirtFluteLeft: `M ${leftPrincessWaistX} ${LM.waist.left.y + 2} Q ${LM.bust.leftApex.x - 15} 680 ${LM.skirtAline.hemLeft.x + 94} ${LM.skirtAline.hemY + 9}`,
      skirtFluteCenter: `M ${LM.bust.center.x} ${LM.waist.centerFront.y} Q ${LM.bust.center.x} 690 ${LM.skirtAline.hemCenterFront.x} ${LM.skirtAline.hemCenterFront.y}`,
      skirtFluteRight: `M ${rightPrincessWaistX} ${LM.waist.right.y + 2} Q ${LM.bust.rightApex.x + 15} 680 ${LM.skirtAline.hemRight.x - 94} ${LM.skirtAline.hemY + 9}`,
      skirtFluteOuterRight: `M ${LM.waist.right.x - 17} ${LM.waist.right.y + 1} Q ${LM.hip.lowRight.x - 8} 680 ${LM.skirtAline.hemRight.x - 34} ${LM.skirtAline.hemY + 4}`,
      hemStitch: `M ${LM.skirtAline.hemLeft.x + 6} ${LM.skirtAline.hemY - 7} Q ${LM.skirtAline.hemCenterFront.x} ${LM.skirtAline.hemCenterFront.y - 7} ${LM.skirtAline.hemRight.x - 6} ${LM.skirtAline.hemY - 7}`,
      sleeveLeftStitch: `M ${LM.sleeveShort.leftOuterHem.x + 3} ${lOuterY - 5} C ${LM.sleeveShort.leftOuterHem.x + 7} ${lOuterY + 2}, ${LM.sleeveShort.leftInnerHem.x - 10} ${lInnerY + 2}, ${LM.sleeveShort.leftInnerHem.x} ${lInnerY - 5}`,
      sleeveRightStitch: `M ${LM.sleeveShort.rightInnerHem.x} ${rInnerY - 5} C ${LM.sleeveShort.rightInnerHem.x + 10} ${rInnerY + 2}, ${LM.sleeveShort.rightOuterHem.x - 7} ${rOuterY + 2}, ${LM.sleeveShort.rightOuterHem.x - 3} ${rOuterY - 5}`
    };
  }

  const leftDartX = Math.round(LM.waist.left.x + (LM.bust.center.x - LM.waist.left.x) * 0.49);
  const rightDartX = Math.round(LM.bust.center.x + (LM.waist.right.x - LM.bust.center.x) * 0.51);

  return {
    centerBackZipper: `M ${LM.bust.center.x} ${LM.neck.backCervicaleDip.y + 4} L ${LM.bust.center.x} ${LM.waist.centerBack.y + 75}`,
    centerBackSeam: `M ${LM.bust.center.x} ${LM.waist.centerBack.y + 75} L ${LM.bust.center.x} ${LM.skirtAline.hemCenterBack.y}`,
    leftBackDart: `M ${leftDartX} 320 L ${leftDartX} ${LM.waist.left.y - 2}`,
    rightBackDart: `M ${rightDartX} 320 L ${rightDartX} ${LM.waist.right.y - 2}`,
    leftArmscye: `M ${LM.shoulders.leftTip.x} ${LM.shoulders.leftTip.y} C ${LM.armscye.leftMid.x} ${LM.armscye.leftMid.y}, ${LM.armscye.leftPit.x - 2} ${LM.armscye.leftPit.y - 12}, ${LM.armscye.leftPit.x} ${LM.armscye.leftPit.y}`,
    rightArmscye: `M ${LM.shoulders.rightTip.x} ${LM.shoulders.rightTip.y} C ${LM.armscye.rightMid.x} ${LM.armscye.rightMid.y}, ${LM.armscye.rightPit.x + 2} ${LM.armscye.rightPit.y - 12}, ${LM.armscye.rightPit.x} ${LM.armscye.rightPit.y}`,
    waistSeam: `M ${LM.waist.left.x} ${LM.waist.left.y} Q ${LM.waist.centerBack.x} ${LM.waist.centerBack.y} ${LM.waist.right.x} ${LM.waist.right.y}`,
    skirtFluteOuterLeft: `M ${LM.waist.left.x + 19} ${LM.waist.left.y + 1} Q ${LM.hip.lowLeft.x + 8} 680 ${LM.skirtAline.hemLeft.x + 34} ${LM.skirtAline.hemY - 1}`,
    skirtFluteLeft: `M ${leftDartX} ${LM.waist.left.y - 2} Q ${LM.bust.leftApex.x - 15} 680 ${LM.skirtAline.hemLeft.x + 94} ${LM.skirtAline.hemY}`,
    skirtFluteCenter: `M ${LM.bust.center.x} ${LM.waist.centerBack.y} L ${LM.bust.center.x} ${LM.skirtAline.hemCenterBack.y}`,
    skirtFluteRight: `M ${rightDartX} ${LM.waist.right.y - 2} Q ${LM.bust.rightApex.x + 15} 680 ${LM.skirtAline.hemRight.x - 94} ${LM.skirtAline.hemY}`,
    skirtFluteOuterRight: `M ${LM.waist.right.x - 17} ${LM.waist.right.y + 1} Q ${LM.hip.lowRight.x - 8} 680 ${LM.skirtAline.hemRight.x - 34} ${LM.skirtAline.hemY - 1}`,
    hemStitch: `M ${LM.skirtAline.hemLeft.x + 6} ${LM.skirtAline.hemY - 7} Q ${LM.skirtAline.hemCenterBack.x} ${LM.skirtAline.hemCenterBack.y + 3} ${LM.skirtAline.hemRight.x - 6} ${LM.skirtAline.hemY - 7}`,
    sleeveLeftStitch: `M ${LM.sleeveShort.leftOuterHem.x + 3} ${lOuterY - 5} C ${LM.sleeveShort.leftOuterHem.x + 7} ${lOuterY + 2}, ${LM.sleeveShort.leftInnerHem.x - 10} ${lInnerY + 2}, ${LM.sleeveShort.leftInnerHem.x} ${lInnerY - 5}`,
    sleeveRightStitch: `M ${LM.sleeveShort.rightInnerHem.x} ${rInnerY - 5} C ${LM.sleeveShort.rightInnerHem.x + 10} ${rInnerY + 2}, ${LM.sleeveShort.rightOuterHem.x - 7} ${rOuterY + 2}, ${LM.sleeveShort.rightOuterHem.x - 3} ${rOuterY - 5}`
  };
}

/* ==========================================================================
   PHASE 5 — ADDITIONAL GARMENT COMPONENT GEOMETRY
   ========================================================================== */

/**
 * Relaxed-Fit Bodice (Slightly dropped shoulders, boxy silhouette,
 * straight hip-length hem — no waist suppression)
 */
export function getRelaxedBodiceFrontPath(landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  const hemY = LM.waist.left.y + 24;         // Drop to upper hip
  const sideL = LM.armscye.leftPit.x - 8;   // Boxy — not nipped
  const sideR = LM.armscye.rightPit.x + 8;

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
    `Q ${LM.neck.frontJewelDip.x} ${LM.neck.frontJewelDip.y} ${LM.neck.right.x} ${LM.neck.right.y}`,
    `C ${cp1Rx} ${cp1Ry}, ${cp2Rx} ${cp2Ry}, ${LM.shoulders.rightTip.x} ${LM.shoulders.rightTip.y}`,
    `C ${LM.armscye.rightMid.x} ${LM.armscye.rightMid.y}, ${sideR} ${LM.armscye.rightPit.y}, ${sideR} ${hemY}`,
    `Q ${LM.waist.centerFront.x} ${hemY + 4} ${sideL} ${hemY}`,
    `C ${sideL} ${LM.armscye.leftPit.y}, ${LM.armscye.leftMid.x} ${LM.armscye.leftMid.y}, ${LM.shoulders.leftTip.x} ${LM.shoulders.leftTip.y}`,
    `C ${cp2Lx} ${cp2Ly}, ${cp1Lx} ${cp1Ly}, ${LM.neck.left.x} ${LM.neck.left.y}`,
    'Z'
  ].join(' ');
}

export function getRelaxedBodiceBackPath(landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  const hemY = LM.waist.left.y + 24;
  const sideL = LM.armscye.leftPit.x - 8;
  const sideR = LM.armscye.rightPit.x + 8;

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
    `C ${LM.armscye.rightMid.x} ${LM.armscye.rightMid.y}, ${sideR} ${LM.armscye.rightPit.y}, ${sideR} ${hemY}`,
    `Q ${LM.waist.centerBack.x} ${hemY + 4} ${sideL} ${hemY}`,
    `C ${sideL} ${LM.armscye.leftPit.y}, ${LM.armscye.leftMid.x} ${LM.armscye.leftMid.y}, ${LM.shoulders.leftTip.x} ${LM.shoulders.leftTip.y}`,
    `C ${cp2Lx} ${cp2Ly}, ${cp1Lx} ${cp1Ly}, ${LM.neck.left.x} ${LM.neck.left.y}`,
    'Z'
  ].join(' ');
}

/**
 * Wrap Top Bodice (Diagonal V-lapel from left shoulder to right waist,
 * overlapping crossed centre-front)
 */
export function getWrapTopFrontPath(landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  const cx = LM.bust.center.x;
  const lapelTip = { x: cx, y: LM.waist.centerFront.y - 20 };  // Deep V point

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
    `L ${lapelTip.x} ${lapelTip.y}`,   // Diagonal lapel left edge
    `L ${LM.waist.right.x} ${LM.waist.right.y}`,
    `C ${cpPitRx} 445, ${LM.armscye.rightPit.x + 2} ${LM.armscye.rightPit.y - 12}, ${LM.armscye.rightPit.x} ${LM.armscye.rightPit.y}`,
    `C ${LM.armscye.rightMid.x} ${LM.armscye.rightMid.y}, ${cp2Rx} ${cp2Ry}, ${LM.shoulders.rightTip.x} ${LM.shoulders.rightTip.y}`,
    `C ${cp2Rx} ${cp2Ry}, ${cp1Rx} ${cp1Ry}, ${LM.neck.right.x} ${LM.neck.right.y}`,
    `L ${lapelTip.x} ${lapelTip.y}`,   // V point
    `L ${LM.waist.left.x} ${LM.waist.left.y}`,
    `C ${cpPitLx} 445, ${LM.armscye.leftPit.x - 2} ${LM.armscye.leftPit.y - 12}, ${LM.armscye.leftPit.x} ${LM.armscye.leftPit.y}`,
    `C ${LM.armscye.leftMid.x} ${LM.armscye.leftMid.y}, ${cp2Lx} ${cp2Ly}, ${LM.shoulders.leftTip.x} ${LM.shoulders.leftTip.y}`,
    `C ${cp2Lx} ${cp2Ly}, ${cp1Lx} ${cp1Ly}, ${LM.neck.left.x} ${LM.neck.left.y}`,
    'Z'
  ].join(' ');
}

export function getWrapTopBackPath(landmarks = DEFAULT_LM) {
  return getBodiceBackPath(landmarks);
}

/**
 * Peplum Bodice (Fitted to waist like basic, then short flared peplum tier below waist)
 */
export function getPeplumFrontPath(landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  // Fitted bodice to waist identical to basic
  return getBodiceFrontPath(LM);
}

export function getPeplumBackPath(landmarks = DEFAULT_LM) {
  return getBodiceBackPath(landmarks);
}

/**
 * Peplum Flounce Tier (rendered as a separate layer below waist,
 * slightly flared mini-tier to hip level)
 */
export function getPeplumFlareFrontPath(landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  const tierTop = LM.waist.left.y;
  const tierBotL = { x: LM.hip.highLeft.x - 8, y: LM.hip.highLeft.y + 14 };
  const tierBotR = { x: LM.hip.highRight.x + 8, y: LM.hip.highRight.y + 14 };
  const tierCenter = LM.waist.centerFront.y + 60;
  return [
    `M ${LM.waist.left.x} ${tierTop}`,
    `Q ${LM.waist.centerFront.x} ${LM.waist.centerFront.y} ${LM.waist.right.x} ${tierTop}`,
    `C ${LM.hip.highRight.x} ${tierTop + 14}, ${tierBotR.x} ${tierBotR.y - 10}, ${tierBotR.x} ${tierBotR.y}`,
    `Q ${LM.bust.center.x} ${tierCenter} ${tierBotL.x} ${tierBotL.y}`,
    `C ${tierBotL.x} ${tierBotL.y - 10}, ${LM.hip.highLeft.x} ${tierTop + 14}, ${LM.waist.left.x} ${tierTop}`,
    'Z'
  ].join(' ');
}

export function getPeplumFlareBackPath(landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  const tierTop = LM.waist.left.y;
  const tierBotL = { x: LM.hip.highLeft.x - 8, y: LM.hip.highLeft.y + 14 };
  const tierBotR = { x: LM.hip.highRight.x + 8, y: LM.hip.highRight.y + 14 };
  const tierCenter = LM.waist.centerBack.y + 60;
  return [
    `M ${LM.waist.left.x} ${tierTop}`,
    `Q ${LM.waist.centerBack.x} ${LM.waist.centerBack.y} ${LM.waist.right.x} ${tierTop}`,
    `C ${LM.hip.highRight.x} ${tierTop + 14}, ${tierBotR.x} ${tierBotR.y - 10}, ${tierBotR.x} ${tierBotR.y}`,
    `Q ${LM.bust.center.x} ${tierCenter} ${tierBotL.x} ${tierBotL.y}`,
    `C ${tierBotL.x} ${tierBotL.y - 10}, ${LM.hip.highLeft.x} ${tierTop + 14}, ${LM.waist.left.x} ${tierTop}`,
    'Z'
  ].join(' ');
}

/**
 * Straight / Pencil Skirt: Slim column from waist to knee with minimal taper
 */
export function getStraightSkirtFrontPath(landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  const hemY = LM.skirtAline.hemY;
  const hemL = LM.hip.lowLeft.x + 8;       // Narrow — stay close to hip
  const hemR = LM.hip.lowRight.x - 8;
  return [
    `M ${LM.waist.left.x} ${LM.waist.left.y}`,
    `Q ${LM.waist.centerFront.x} ${LM.waist.centerFront.y} ${LM.waist.right.x} ${LM.waist.right.y}`,
    `C ${LM.hip.highRight.x - 8} 540, ${hemR + 4} 660, ${hemR} ${hemY}`,
    `Q ${LM.bust.center.x} ${hemY + 4} ${hemL} ${hemY}`,
    `C ${hemL + 4} 660, ${LM.hip.highLeft.x + 8} 540, ${LM.waist.left.x} ${LM.waist.left.y}`,
    'Z'
  ].join(' ');
}

export function getStraightSkirtBackPath(landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  const hemY = LM.skirtAline.hemY;
  const hemL = LM.hip.lowLeft.x + 8;
  const hemR = LM.hip.lowRight.x - 8;
  return [
    `M ${LM.waist.left.x} ${LM.waist.left.y}`,
    `Q ${LM.waist.centerBack.x} ${LM.waist.centerBack.y} ${LM.waist.right.x} ${LM.waist.right.y}`,
    `C ${LM.hip.highRight.x - 8} 540, ${hemR + 4} 660, ${hemR} ${hemY}`,
    `Q ${LM.bust.center.x} ${hemY + 6} ${hemL} ${hemY}`,
    `C ${hemL + 4} 660, ${LM.hip.highLeft.x + 8} 540, ${LM.waist.left.x} ${LM.waist.left.y}`,
    'Z'
  ].join(' ');
}

/**
 * Wide-Leg Trousers (full palazzo silhouette, dramatic flare from hip)
 */
export function getWideLegFrontPath(landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  const hemY = LM.skirtAline.hemY + 80;      // Ankle length
  const hemFlareL = LM.skirtAline.hemLeft.x - 28;
  const hemFlareR = LM.skirtAline.hemRight.x + 28;
  const cx = LM.bust.center.x;
  const insLx = cx - 16;
  const insRx = cx + 16;
  return [
    // Waistband
    `M ${LM.waist.left.x} ${LM.waist.left.y}`,
    `Q ${LM.waist.centerFront.x} ${LM.waist.centerFront.y} ${LM.waist.right.x} ${LM.waist.right.y}`,
    // Right leg outer
    `C ${LM.hip.highRight.x} 540, ${hemFlareR - 14} 700, ${hemFlareR} ${hemY}`,
    // Hem across right leg
    `Q ${cx + 28} ${hemY + 4} ${insRx} ${hemY + 2}`,
    // Right leg inner up to crotch
    `C ${insRx} 740, ${cx + 8} 600, ${cx} ${LM.hip.highLeft.y}`,
    // Left leg inner down
    `C ${cx - 8} 600, ${insLx} 740, ${insLx} ${hemY + 2}`,
    // Hem across left leg
    `Q ${cx - 28} ${hemY + 4} ${hemFlareL} ${hemY}`,
    // Left leg outer up
    `C ${hemFlareL + 14} 700, ${LM.hip.highLeft.x} 540, ${LM.waist.left.x} ${LM.waist.left.y}`,
    'Z'
  ].join(' ');
}

export function getWideLegBackPath(landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  const hemY = LM.skirtAline.hemY + 80;
  const hemFlareL = LM.skirtAline.hemLeft.x - 28;
  const hemFlareR = LM.skirtAline.hemRight.x + 28;
  const cx = LM.bust.center.x;
  const insLx = cx - 16;
  const insRx = cx + 16;
  return [
    `M ${LM.waist.left.x} ${LM.waist.left.y}`,
    `Q ${LM.waist.centerBack.x} ${LM.waist.centerBack.y} ${LM.waist.right.x} ${LM.waist.right.y}`,
    `C ${LM.hip.highRight.x} 540, ${hemFlareR - 14} 700, ${hemFlareR} ${hemY}`,
    `Q ${cx + 28} ${hemY + 4} ${insRx} ${hemY + 2}`,
    `C ${insRx} 740, ${cx + 8} 600, ${cx} ${LM.hip.highLeft.y}`,
    `C ${cx - 8} 600, ${insLx} 740, ${insLx} ${hemY + 2}`,
    `Q ${cx - 28} ${hemY + 4} ${hemFlareL} ${hemY}`,
    `C ${hemFlareL + 14} 700, ${LM.hip.highLeft.x} 540, ${LM.waist.left.x} ${LM.waist.left.y}`,
    'Z'
  ].join(' ');
}

/**
 * Slim Trousers (tapered from hip to ankle, straight-leg silhouette)
 */
export function getTrouserFrontPath(landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  const hemY = LM.skirtAline.hemY + 80;
  const hemL = LM.hip.lowLeft.x + 18;   // Narrower at hem than wide-leg
  const hemR = LM.hip.lowRight.x - 18;
  const cx = LM.bust.center.x;
  const insLx = cx - 14;
  const insRx = cx + 14;
  return [
    `M ${LM.waist.left.x} ${LM.waist.left.y}`,
    `Q ${LM.waist.centerFront.x} ${LM.waist.centerFront.y} ${LM.waist.right.x} ${LM.waist.right.y}`,
    `C ${LM.hip.highRight.x} 540, ${hemR + 8} 700, ${hemR} ${hemY}`,
    `Q ${cx + 20} ${hemY + 4} ${insRx} ${hemY + 2}`,
    `C ${insRx} 740, ${cx + 6} 600, ${cx} ${LM.hip.highLeft.y}`,
    `C ${cx - 6} 600, ${insLx} 740, ${insLx} ${hemY + 2}`,
    `Q ${cx - 20} ${hemY + 4} ${hemL} ${hemY}`,
    `C ${hemL + 8} 700, ${LM.hip.highLeft.x} 540, ${LM.waist.left.x} ${LM.waist.left.y}`,
    'Z'
  ].join(' ');
}

export function getTrouserBackPath(landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  const hemY = LM.skirtAline.hemY + 80;
  const hemL = LM.hip.lowLeft.x + 18;
  const hemR = LM.hip.lowRight.x - 18;
  const cx = LM.bust.center.x;
  const insLx = cx - 14;
  const insRx = cx + 14;
  return [
    `M ${LM.waist.left.x} ${LM.waist.left.y}`,
    `Q ${LM.waist.centerBack.x} ${LM.waist.centerBack.y} ${LM.waist.right.x} ${LM.waist.right.y}`,
    `C ${LM.hip.highRight.x} 540, ${hemR + 8} 700, ${hemR} ${hemY}`,
    `Q ${cx + 20} ${hemY + 4} ${insRx} ${hemY + 2}`,
    `C ${insRx} 740, ${cx + 6} 600, ${cx} ${LM.hip.highLeft.y}`,
    `C ${cx - 6} 600, ${insLx} 740, ${insLx} ${hemY + 2}`,
    `Q ${cx - 20} ${hemY + 4} ${hemL} ${hemY}`,
    `C ${hemL + 8} 700, ${LM.hip.highLeft.x} 540, ${LM.waist.left.x} ${LM.waist.left.y}`,
    'Z'
  ].join(' ');
}

/**
 * Long Sleeve (Full length to wrist, slight taper from bicep to wrist)
 */
export function getLeftLongSleevePath(isBack = false, landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  const shX = LM.shoulders.leftTip.x;
  const shY = LM.shoulders.leftTip.y;
  const outX = LM.sleeveShort.leftOuterHem.x - 6;  // Slightly wider at bicep
  const outY = LM.sleeveShort.leftOuterHem.y;
  const wristOutX = outX + 12;    // Taper in to wrist
  const wristInX = LM.armscye.leftPit.x - 8;
  const wristY = outY + 300;      // Wrist level
  const pitX = LM.armscye.leftPit.x;
  const pitY = LM.armscye.leftPit.y;
  const midX = LM.armscye.leftMid.x;
  const midY = LM.armscye.leftMid.y;

  return [
    `M ${shX} ${shY}`,
    `C ${shX - 10} ${shY + 20}, ${outX - 4} ${outY - 20}, ${outX} ${outY}`,
    `C ${outX + 2} ${outY + 80}, ${wristOutX} ${wristY - 40}, ${wristOutX} ${wristY}`,
    `Q ${pitX - 6} ${wristY + 4} ${wristInX} ${wristY}`,
    `C ${wristInX} ${wristY - 40}, ${pitX - 4} ${outY + 60}, ${pitX} ${pitY}`,
    `C ${pitX - 2} ${pitY - 12}, ${midX} ${midY}, ${shX} ${shY}`,
    'Z'
  ].join(' ');
}

export function getRightLongSleevePath(isBack = false, landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  const shX = LM.shoulders.rightTip.x;
  const shY = LM.shoulders.rightTip.y;
  const outX = LM.sleeveShort.rightOuterHem.x + 6;
  const outY = LM.sleeveShort.rightOuterHem.y;
  const wristOutX = outX - 12;
  const wristInX = LM.armscye.rightPit.x + 8;
  const wristY = outY + 300;
  const pitX = LM.armscye.rightPit.x;
  const pitY = LM.armscye.rightPit.y;
  const midX = LM.armscye.rightMid.x;
  const midY = LM.armscye.rightMid.y;

  return [
    `M ${shX} ${shY}`,
    `C ${shX + 10} ${shY + 20}, ${outX + 4} ${outY - 20}, ${outX} ${outY}`,
    `C ${outX - 2} ${outY + 80}, ${wristOutX} ${wristY - 40}, ${wristOutX} ${wristY}`,
    `Q ${pitX + 6} ${wristY + 4} ${wristInX} ${wristY}`,
    `C ${wristInX} ${wristY - 40}, ${pitX + 4} ${outY + 60}, ${pitX} ${pitY}`,
    `C ${pitX + 2} ${pitY - 12}, ${midX} ${midY}, ${shX} ${shY}`,
    'Z'
  ].join(' ');
}

/**
 * Flare / Bell Sleeve (Fitted at cap, dramatically flared hem)
 */
export function getLeftFlareSleevePath(isBack = false, landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  const shX = LM.shoulders.leftTip.x;
  const shY = LM.shoulders.leftTip.y;
  const midOutX = LM.sleeveShort.leftOuterHem.x - 4;
  const midOutY = LM.sleeveShort.leftOuterHem.y;
  const bellOutX = midOutX - 36;    // Dramatic flare
  const bellInX = LM.armscye.leftPit.x + 12;
  const bellY = midOutY + 140;      // Mid-forearm
  const pitX = LM.armscye.leftPit.x;
  const pitY = LM.armscye.leftPit.y;
  const midX = LM.armscye.leftMid.x;
  const midY = LM.armscye.leftMid.y;

  return [
    `M ${shX} ${shY}`,
    `C ${shX - 10} ${shY + 20}, ${midOutX - 4} ${midOutY - 20}, ${midOutX} ${midOutY}`,
    `C ${midOutX - 4} ${midOutY + 40}, ${bellOutX + 8} ${bellY - 30}, ${bellOutX} ${bellY}`,
    `Q ${pitX - 6} ${bellY + 6} ${bellInX} ${bellY}`,
    `C ${bellInX + 4} ${bellY - 30}, ${pitX + 2} ${midOutY + 30}, ${pitX} ${pitY}`,
    `C ${pitX - 2} ${pitY - 12}, ${midX} ${midY}, ${shX} ${shY}`,
    'Z'
  ].join(' ');
}

export function getRightFlareSleevePath(isBack = false, landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  const shX = LM.shoulders.rightTip.x;
  const shY = LM.shoulders.rightTip.y;
  const midOutX = LM.sleeveShort.rightOuterHem.x + 4;
  const midOutY = LM.sleeveShort.rightOuterHem.y;
  const bellOutX = midOutX + 36;
  const bellInX = LM.armscye.rightPit.x - 12;
  const bellY = midOutY + 140;
  const pitX = LM.armscye.rightPit.x;
  const pitY = LM.armscye.rightPit.y;
  const midX = LM.armscye.rightMid.x;
  const midY = LM.armscye.rightMid.y;

  return [
    `M ${shX} ${shY}`,
    `C ${shX + 10} ${shY + 20}, ${midOutX + 4} ${midOutY - 20}, ${midOutX} ${midOutY}`,
    `C ${midOutX + 4} ${midOutY + 40}, ${bellOutX - 8} ${bellY - 30}, ${bellOutX} ${bellY}`,
    `Q ${pitX + 6} ${bellY + 6} ${bellInX} ${bellY}`,
    `C ${bellInX - 4} ${bellY - 30}, ${pitX - 2} ${midOutY + 30}, ${pitX} ${pitY}`,
    `C ${pitX + 2} ${pitY - 12}, ${midX} ${midY}, ${shX} ${shY}`,
    'Z'
  ].join(' ');
}

/**
 * V-Neck Binding (Pointed dip, deeper than jewel)
 */
export function getVNeckBindingPath(isBack = false, landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  if (isBack) {
    return getNecklineBindingPath(true, LM);
  }
  const vDip = LM.waist.centerFront.y - 135;  // Mid sternum V point
  return [
    `M ${LM.neck.left.x} ${LM.neck.left.y}`,
    `L ${LM.bust.center.x} ${vDip}`,
    `L ${LM.neck.right.x} ${LM.neck.right.y}`,
    `L ${LM.neck.right.x} ${LM.neck.right.y + 6}`,
    `L ${LM.bust.center.x} ${vDip + 8}`,
    `L ${LM.neck.left.x} ${LM.neck.left.y + 6}`,
    'Z'
  ].join(' ');
}

/**
 * Square Neck Binding (Horizontal chest-level neckline)
 */
export function getSquareNeckBindingPath(isBack = false, landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  if (isBack) {
    return getNecklineBindingPath(true, LM);
  }
  const boxY = LM.neck.frontJewelDip.y + 28;   // Chest-level horizontal bar
  const boxL = LM.neck.left.x - 6;
  const boxR = LM.neck.right.x + 6;
  return [
    `M ${boxL} ${LM.neck.left.y}`,
    `L ${boxR} ${LM.neck.right.y}`,
    `L ${boxR} ${boxY}`,
    `L ${boxL} ${boxY}`,
    `Z M ${boxL} ${LM.neck.left.y + 6}`,
    `L ${boxR} ${LM.neck.right.y + 6}`,
    `L ${boxR} ${boxY + 6}`,
    `L ${boxL} ${boxY + 6}`,
    'Z'
  ].join(' ');
}
