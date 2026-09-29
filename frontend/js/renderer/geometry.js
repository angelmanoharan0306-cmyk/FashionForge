/**
 * FashionForge — 2.5D Centralized Renderer: Geometry & Landmarks
 *
 * Mapped 1:1 to the real human fashion model assets:
 * frontend/assets/models/female-model-front.jpg
 * frontend/assets/models/female-model-back.jpg
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
      // Foreground clip strictly covering bare wrists and hands resting in front of skirt
      leftClip: 'M 238 580 L 275 580 L 275 750 L 238 750 Z',
      rightClip: 'M 495 580 L 535 580 L 535 750 L 495 750 Z'
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
 * Contours neck base, shoulder slope, armscye, bust volume, and natural waist.
 */
export function getBodiceFrontPath(landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  const rightShoulderMidX = Math.round((LM.neck.right.x + LM.shoulders.rightTip.x) / 2);
  const leftShoulderMidX = Math.round((LM.neck.left.x + LM.shoulders.leftTip.x) / 2);

  return [
    `M ${LM.neck.left.x} ${LM.neck.left.y}`,
    `Q ${LM.neck.frontJewelDip.x} ${LM.neck.frontJewelDip.y} ${LM.neck.right.x} ${LM.neck.right.y}`,
    `C ${rightShoulderMidX - 10} 292, ${rightShoulderMidX + 15} 302, ${LM.shoulders.rightTip.x} ${LM.shoulders.rightTip.y}`,
    `C ${LM.armscye.rightMid.x} ${LM.armscye.rightMid.y}, ${LM.armscye.rightPit.x + 4} ${LM.armscye.rightPit.y - 15}, ${LM.armscye.rightPit.x} ${LM.armscye.rightPit.y}`,
    `C ${LM.bust.rightApex.x + 36} 440, ${LM.waist.right.x + 2} 468, ${LM.waist.right.x} ${LM.waist.right.y}`,
    `Q ${LM.waist.centerFront.x} ${LM.waist.centerFront.y} ${LM.waist.left.x} ${LM.waist.left.y}`,
    `C ${LM.waist.left.x - 2} 468, ${LM.bust.leftApex.x - 36} 440, ${LM.armscye.leftPit.x} ${LM.armscye.leftPit.y}`,
    `C ${LM.armscye.leftPit.x - 4} ${LM.armscye.leftPit.y - 15}, ${LM.armscye.leftMid.x} ${LM.armscye.leftMid.y}, ${LM.shoulders.leftTip.x} ${LM.shoulders.leftTip.y}`,
    `C ${leftShoulderMidX - 15} 302, ${leftShoulderMidX + 10} 292, ${LM.neck.left.x} ${LM.neck.left.y}`,
    'Z'
  ].join(' ');
}

/**
 * Bodice Back Path:
 * Higher cervicale dip, tailored back darts, and spine center seam.
 */
export function getBodiceBackPath(landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  const rightShoulderMidX = Math.round((LM.neck.right.x + LM.shoulders.rightTip.x) / 2);
  const leftShoulderMidX = Math.round((LM.neck.left.x + LM.shoulders.leftTip.x) / 2);

  return [
    `M ${LM.neck.left.x} ${LM.neck.left.y}`,
    `Q ${LM.neck.backCervicaleDip.x} ${LM.neck.backCervicaleDip.y} ${LM.neck.right.x} ${LM.neck.right.y}`,
    `C ${rightShoulderMidX - 10} 292, ${rightShoulderMidX + 15} 302, ${LM.shoulders.rightTip.x} ${LM.shoulders.rightTip.y}`,
    `C ${LM.armscye.rightMid.x} ${LM.armscye.rightMid.y}, ${LM.armscye.rightPit.x + 4} ${LM.armscye.rightPit.y - 15}, ${LM.armscye.rightPit.x} ${LM.armscye.rightPit.y}`,
    `C ${LM.bust.rightApex.x + 32} 440, ${LM.waist.right.x + 2} 468, ${LM.waist.right.x} ${LM.waist.right.y}`,
    `Q ${LM.waist.centerBack.x} ${LM.waist.centerBack.y} ${LM.waist.left.x} ${LM.waist.left.y}`,
    `C ${LM.waist.left.x - 2} 468, ${LM.bust.leftApex.x - 32} 440, ${LM.armscye.leftPit.x} ${LM.armscye.leftPit.y}`,
    `C ${LM.armscye.leftPit.x - 4} ${LM.armscye.leftPit.y - 15}, ${LM.armscye.leftMid.x} ${LM.armscye.leftMid.y}, ${LM.shoulders.leftTip.x} ${LM.shoulders.leftTip.y}`,
    `C ${leftShoulderMidX - 15} 302, ${leftShoulderMidX + 10} 292, ${LM.neck.left.x} ${LM.neck.left.y}`,
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
 * Wraps deltoid cap smoothly with tailored bicep contour and elliptical hem.
 */
export function getLeftSleevePath(isBack = false, landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  const outerCurveControlX = Math.round(LM.shoulders.leftTip.x - 5);
  return [
    `M ${LM.shoulders.leftTip.x} ${LM.shoulders.leftTip.y}`,
    `C ${outerCurveControlX} 345, ${outerCurveControlX - 1} 370, ${LM.sleeveShort.leftOuterHem.x} ${LM.sleeveShort.leftOuterHem.y}`,
    `C ${LM.sleeveShort.leftOuterHem.x + 4} 408, ${LM.sleeveShort.leftInnerHem.x - 15} 418, ${LM.sleeveShort.leftInnerHem.x} ${LM.sleeveShort.leftInnerHem.y}`,
    `C ${LM.armscye.leftPit.x - 4} ${LM.armscye.leftPit.y - 20}, ${LM.armscye.leftMid.x} ${LM.armscye.leftMid.y}, ${LM.shoulders.leftTip.x} ${LM.shoulders.leftTip.y}`,
    'Z'
  ].join(' ');
}

/**
 * Right Sleeve Path (Set-In Short Sleeve):
 * Wraps deltoid cap smoothly with tailored bicep contour and elliptical hem.
 */
export function getRightSleevePath(isBack = false, landmarks = DEFAULT_LM) {
  const LM = landmarks || DEFAULT_LM;
  const outerCurveControlX = Math.round(LM.shoulders.rightTip.x + 5);
  return [
    `M ${LM.shoulders.rightTip.x} ${LM.shoulders.rightTip.y}`,
    `C ${outerCurveControlX} 345, ${outerCurveControlX + 1} 370, ${LM.sleeveShort.rightOuterHem.x} ${LM.sleeveShort.rightOuterHem.y}`,
    `C ${LM.sleeveShort.rightOuterHem.x - 4} 408, ${LM.sleeveShort.rightInnerHem.x + 15} 418, ${LM.sleeveShort.rightInnerHem.x} ${LM.sleeveShort.rightInnerHem.y}`,
    `C ${LM.armscye.rightPit.x + 4} ${LM.armscye.rightPit.y - 20}, ${LM.armscye.rightMid.x} ${LM.armscye.rightMid.y}, ${LM.shoulders.rightTip.x} ${LM.shoulders.rightTip.y}`,
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

  if (view === 'front') {
    return {
      leftPrincessSeam: `M ${LM.shoulders.leftMid.x} ${LM.shoulders.leftMid.y} Q ${LM.bust.leftApex.x - 4} 345 ${LM.bust.leftApex.x} ${LM.bust.leftApex.y} Q ${LM.bust.leftApex.x + 4} 435 ${leftPrincessWaistX} ${LM.waist.left.y + 2}`,
      rightPrincessSeam: `M ${LM.shoulders.rightMid.x} ${LM.shoulders.rightMid.y} Q ${LM.bust.rightApex.x + 4} 345 ${LM.bust.rightApex.x} ${LM.bust.rightApex.y} Q ${LM.bust.rightApex.x - 4} 435 ${rightPrincessWaistX} ${LM.waist.right.y + 2}`,
      leftArmscye: `M ${LM.shoulders.leftTip.x} ${LM.shoulders.leftTip.y} C ${LM.armscye.leftMid.x} ${LM.armscye.leftMid.y}, ${LM.armscye.leftPit.x - 4} ${LM.armscye.leftPit.y - 15}, ${LM.armscye.leftPit.x} ${LM.armscye.leftPit.y}`,
      rightArmscye: `M ${LM.shoulders.rightTip.x} ${LM.shoulders.rightTip.y} C ${LM.armscye.rightMid.x} ${LM.armscye.rightMid.y}, ${LM.armscye.rightPit.x + 4} ${LM.armscye.rightPit.y - 15}, ${LM.armscye.rightPit.x} ${LM.armscye.rightPit.y}`,
      waistSeam: `M ${LM.waist.left.x} ${LM.waist.left.y} Q ${LM.waist.centerFront.x} ${LM.waist.centerFront.y} ${LM.waist.right.x} ${LM.waist.right.y}`,
      skirtFluteOuterLeft: `M ${LM.waist.left.x + 19} ${LM.waist.left.y + 1} Q ${LM.hip.lowLeft.x + 8} 680 ${LM.skirtAline.hemLeft.x + 34} ${LM.skirtAline.hemY + 4}`,
      skirtFluteLeft: `M ${leftPrincessWaistX} ${LM.waist.left.y + 2} Q ${LM.bust.leftApex.x - 15} 680 ${LM.skirtAline.hemLeft.x + 94} ${LM.skirtAline.hemY + 9}`,
      skirtFluteCenter: `M ${LM.bust.center.x} ${LM.waist.centerFront.y} Q ${LM.bust.center.x} 690 ${LM.skirtAline.hemCenterFront.x} ${LM.skirtAline.hemCenterFront.y}`,
      skirtFluteRight: `M ${rightPrincessWaistX} ${LM.waist.right.y + 2} Q ${LM.bust.rightApex.x + 15} 680 ${LM.skirtAline.hemRight.x - 94} ${LM.skirtAline.hemY + 9}`,
      skirtFluteOuterRight: `M ${LM.waist.right.x - 17} ${LM.waist.right.y + 1} Q ${LM.hip.lowRight.x - 8} 680 ${LM.skirtAline.hemRight.x - 34} ${LM.skirtAline.hemY + 4}`,
      hemStitch: `M ${LM.skirtAline.hemLeft.x + 6} ${LM.skirtAline.hemY - 7} Q ${LM.skirtAline.hemCenterFront.x} ${LM.skirtAline.hemCenterFront.y - 7} ${LM.skirtAline.hemRight.x - 6} ${LM.skirtAline.hemY - 7}`,
      sleeveLeftStitch: `M ${LM.sleeveShort.leftOuterHem.x + 3} ${LM.sleeveShort.leftOuterHem.y - 5} C ${LM.sleeveShort.leftOuterHem.x + 7} 403, ${LM.sleeveShort.leftInnerHem.x - 15} 412, ${LM.sleeveShort.leftInnerHem.x} ${LM.sleeveShort.leftInnerHem.y - 5}`,
      sleeveRightStitch: `M ${LM.sleeveShort.rightInnerHem.x} ${LM.sleeveShort.rightInnerHem.y - 5} C ${LM.sleeveShort.rightInnerHem.x + 15} 412, ${LM.sleeveShort.rightOuterHem.x - 7} 403, ${LM.sleeveShort.rightOuterHem.x - 3} ${LM.sleeveShort.rightOuterHem.y - 5}`
    };
  }

  const leftDartX = Math.round(LM.waist.left.x + (LM.bust.center.x - LM.waist.left.x) * 0.49);
  const rightDartX = Math.round(LM.bust.center.x + (LM.waist.right.x - LM.bust.center.x) * 0.51);

  return {
    centerBackZipper: `M ${LM.bust.center.x} ${LM.neck.backCervicaleDip.y + 4} L ${LM.bust.center.x} ${LM.waist.centerBack.y + 75}`,
    centerBackSeam: `M ${LM.bust.center.x} ${LM.waist.centerBack.y + 75} L ${LM.bust.center.x} ${LM.skirtAline.hemCenterBack.y}`,
    leftBackDart: `M ${leftDartX} 320 L ${leftDartX} ${LM.waist.left.y - 2}`,
    rightBackDart: `M ${rightDartX} 320 L ${rightDartX} ${LM.waist.right.y - 2}`,
    leftArmscye: `M ${LM.shoulders.leftTip.x} ${LM.shoulders.leftTip.y} C ${LM.armscye.leftMid.x} ${LM.armscye.leftMid.y}, ${LM.armscye.leftPit.x - 4} ${LM.armscye.leftPit.y - 15}, ${LM.armscye.leftPit.x} ${LM.armscye.leftPit.y}`,
    rightArmscye: `M ${LM.shoulders.rightTip.x} ${LM.shoulders.rightTip.y} C ${LM.armscye.rightMid.x} ${LM.armscye.rightMid.y}, ${LM.armscye.rightPit.x + 4} ${LM.armscye.rightPit.y - 15}, ${LM.armscye.rightPit.x} ${LM.armscye.rightPit.y}`,
    waistSeam: `M ${LM.waist.left.x} ${LM.waist.left.y} Q ${LM.waist.centerBack.x} ${LM.waist.centerBack.y} ${LM.waist.right.x} ${LM.waist.right.y}`,
    skirtFluteOuterLeft: `M ${LM.waist.left.x + 19} ${LM.waist.left.y + 1} Q ${LM.hip.lowLeft.x + 8} 680 ${LM.skirtAline.hemLeft.x + 34} ${LM.skirtAline.hemY - 1}`,
    skirtFluteLeft: `M ${leftDartX} ${LM.waist.left.y - 2} Q ${LM.bust.leftApex.x - 15} 680 ${LM.skirtAline.hemLeft.x + 94} ${LM.skirtAline.hemY}`,
    skirtFluteCenter: `M ${LM.bust.center.x} ${LM.waist.centerBack.y} L ${LM.bust.center.x} ${LM.skirtAline.hemCenterBack.y}`,
    skirtFluteRight: `M ${rightDartX} ${LM.waist.right.y - 2} Q ${LM.bust.rightApex.x + 15} 680 ${LM.skirtAline.hemRight.x - 94} ${LM.skirtAline.hemY}`,
    skirtFluteOuterRight: `M ${LM.waist.right.x - 17} ${LM.waist.right.y + 1} Q ${LM.hip.lowRight.x - 8} 680 ${LM.skirtAline.hemRight.x - 34} ${LM.skirtAline.hemY - 1}`,
    hemStitch: `M ${LM.skirtAline.hemLeft.x + 6} ${LM.skirtAline.hemY - 7} Q ${LM.skirtAline.hemCenterBack.x} ${LM.skirtAline.hemCenterBack.y + 3} ${LM.skirtAline.hemRight.x - 6} ${LM.skirtAline.hemY - 7}`,
    sleeveLeftStitch: `M ${LM.sleeveShort.leftOuterHem.x + 3} ${LM.sleeveShort.leftOuterHem.y - 5} C ${LM.sleeveShort.leftOuterHem.x + 7} 403, ${LM.sleeveShort.leftInnerHem.x - 15} 412, ${LM.sleeveShort.leftInnerHem.x} ${LM.sleeveShort.leftInnerHem.y - 5}`,
    sleeveRightStitch: `M ${LM.sleeveShort.rightInnerHem.x} ${LM.sleeveShort.rightInnerHem.y - 5} C ${LM.sleeveShort.rightInnerHem.x + 15} 412, ${LM.sleeveShort.rightOuterHem.x - 7} 403, ${LM.sleeveShort.rightOuterHem.x - 3} ${LM.sleeveShort.rightOuterHem.y - 5}`
  };
}
