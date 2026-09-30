/**
 * FashionForge — Centralized 2.5D Garment Renderer
 *
 * Implements the single centralized rendering pipeline:
 * renderDesign(designState, containerSvg)
 *   → Base Human Model Layer (Transparent studio alpha blend)
 *   → Back Interior Depth Layer
 *   → Lower Garment (A-Line Skirt with 2.5D drape flutes)
 *   → Waist Interface Connection & Contact Shadow
 *   → Upper Garment (Fitted Bodice with princess seams & bust fullness)
 *   → Sleeves (Set-In Short Sleeves with cylindrical volume)
 *   → Neckline / Collar (Finished binding strip)
 *   → Construction Seams, Topstitching & Flutes
 *   → Foreground Hands Occlusion Layer
 *   → Contact Depth & Cast Shadows
 */

import {
  MODEL_GEOMETRY,
  getBodiceFrontPath,
  getBodiceBackPath,
  getInnerNeckBackDepthPath,
  getSkirtFrontPath,
  getSkirtBackPath,
  getHemFacingDepthPath,
  getLeftSleevePath,
  getRightSleevePath,
  getNecklineBindingPath,
  getConstructionLines
} from './geometry.js';

import {
  generateMaterialDefs,
  getHarmonizedPalette
} from './materials.js';

import {
  generateLightingDefs
} from './lighting.js';

import {
  getBodyLandmarks,
  getFemaleCroquis,
  getFemaleCroquisTarget,
  getMaleCroquis,
  getMaleCroquisTarget
} from './body-profiles.js';

import {
  renderCalibrationOverlay
} from './croquis-calibration.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Creates an SVG element with given attributes
 */
function createSvgElement(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      el.setAttribute(key, String(val));
    }
  });
  return el;
}

/**
 * Primary 2.5D Rendering Pipeline
 */
export function renderDesign(designState, svgElement) {
  if (!svgElement) {
    return;
  }

  const isBack = designState.view === 'back';
  const size = designState?.size || 'M';
  const gender = (designState?.figure === 'male' || designState?.croquis === 'male') ? 'male' : 'female';
  const palette = getHarmonizedPalette(
    designState.material?.colour || designState.colour || '#b96b61',
    designState.material?.fabric || designState.fabric || 'cotton'
  );

  // 1. Establish Coordinate System (Preserves 768x1376 model without distortion)
  const vb = MODEL_GEOMETRY.viewBox;
  svgElement.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.width} ${vb.height}`);
  svgElement.setAttribute('class', `costume-preview view-${designState.view || 'front'}`);

  // Clear previous dynamic layers
  svgElement.replaceChildren();

  // Retrieve calibrated anatomical landmarks for active garment size and gender
  const LM = getBodyLandmarks(size, gender);

  // 2. Defs Layer (Dynamic Materials, Lighting, Patterns, Depth Filters, Clip Paths)
  const defsElement = createSvgElement('defs');
  defsElement.innerHTML = `
    <!-- Material Weave Textures and Graphic Patterns -->
    ${generateMaterialDefs(designState)}

    <!-- 2.5D Volumetric Lighting Gradients and Depth Filters -->
    ${generateLightingDefs(designState)}

    <!-- Foreground Hands Clip Path for Natural Hand-over-Skirt Layering -->
    <clipPath id="ff-foreground-hands-clip">
      <path d="${LM.armsForeground.leftClip} ${LM.armsForeground.rightClip}" />
    </clipPath>
  `;
  svgElement.appendChild(defsElement);

  // 3. Stage 1: Render Photographic Croquis Foundation (renderCroquis)
  if (designState.figureVisible !== false) {
    renderCroquis(svgElement, isBack, size, gender, LM);
  }

  // 4. Stage 2: Render 2.5D Garment Composition (renderGarment)
  if (designState.detailsVisible !== false) {
    const garmentGroup = createSvgElement('g', {
      class: 'garment-composition',
      id: 'garment-composition'
    });
    svgElement.appendChild(garmentGroup);

    renderGarment(garmentGroup, designState, palette, isBack, LM);
  }

  // Stage 3: Development Calibration Overlay Debugger
  if (designState.debugCalibration || (typeof window !== 'undefined' && window.__FF_DEBUG_CALIBRATION)) {
    renderCalibrationOverlay(svgElement, size, isBack, LM, gender);
  }
}

/**
 * Stage 1: Render Photographic Croquis Base Layer
 */
export function renderCroquis(svgElement, isBack, size = 'M', gender = 'female', landmarks = null) {
  renderHumanModel(svgElement, isBack, size, gender, landmarks);
}

/**
 * Stage 2: Render 2.5D Garment Composition
 * Orchestrates silhouette, material, colour, pattern, lighting, construction, and depth
 */
export function renderGarment(garmentGroup, designState, palette, isBack, LM) {
  // 1. Back Interior Depth (Visible inside collar scoop & under hem)
  if (!isBack) {
    renderBackDepth(garmentGroup, palette, LM);
  }

  // 2. Lower Garment (A-Line Skirt with 2.5D drape flutes)
  renderBottom(garmentGroup, designState, palette, isBack, LM);

  // 3. Waist Interface Connection & Contact Shadow
  renderWaistInterface(garmentGroup, palette, isBack, LM);

  // 4. Bodice (Fitted Torso with princess seams & bust fullness)
  renderTop(garmentGroup, designState, palette, isBack, LM);

  // 5. Sleeves (Set-In Short Sleeves with cylindrical volume)
  renderSleeves(garmentGroup, designState, palette, isBack, LM);

  // 6. Neckline / Collar Finished Binding
  renderNeckline(garmentGroup, palette, isBack, LM);

  // 7. Construction Seams, Topstitching & Flutes
  applyConstructionDetails(garmentGroup, palette, isBack, LM);

  // 8. Final Depth and Contact Shadows
  renderDepth(garmentGroup, palette, isBack, LM);
}

/**
 * 1. Human Model Base Layer
 * Seamless blend onto studio backdrop using photographic alpha PNG
 */
function renderHumanModel(svgElement, isBack, size = 'M', gender = 'female', landmarks = null) {
  const LM = landmarks || getBodyLandmarks(size, gender);
  const groundY = LM?.feet?.groundY || MODEL_GEOMETRY.landmarks.feet.groundY;

  // Ground ambient shadow under shoes
  const groundShadow = createSvgElement('ellipse', {
    cx: String(MODEL_GEOMETRY.centerX),
    cy: String(groundY),
    rx: '130',
    ry: '11',
    fill: '#2a1f1b',
    opacity: '0.22',
    class: 'model-ground-shadow',
    style: 'filter: blur(5px);'
  });
  svgElement.appendChild(groundShadow);

  const modelGroup = createSvgElement('g', {
    id: 'human-model-group',
    class: 'human-model-group'
  });

  const viewName = isBack ? 'back' : 'front';
  const isMale = (gender === 'male');
  const modelImageSrc = isMale ? getMaleCroquis(size, viewName) : getFemaleCroquis(size, viewName);
  const targetImageSrc = isMale ? getMaleCroquisTarget(size, viewName) : getFemaleCroquisTarget(size, viewName);

  const modelImage = createSvgElement('image', {
    id: 'model-base-photo',
    class: 'base-model-layer',
    href: modelImageSrc,
    'data-size': String(size).toUpperCase(),
    'data-view': viewName,
    'data-gender': gender,
    'data-target-croquis': targetImageSrc,
    x: '0',
    y: '0',
    width: String(MODEL_GEOMETRY.nativeWidth),
    height: String(MODEL_GEOMETRY.nativeHeight),
    preserveAspectRatio: 'xMidYMid meet'
  });

  modelGroup.appendChild(modelImage);
  svgElement.appendChild(modelGroup);
}

/**
 * Foreground Hands Layer:
 * Preserves the model's actual hands and wrists resting naturally in front of the flared skirt
 */
function renderForegroundHands(svgElement, isBack, size = 'M', gender = 'female') {
  const fgGroup = createSvgElement('g', {
    id: 'foreground-hands-group',
    class: 'foreground-hands-group',
    'clip-path': 'url(#ff-foreground-hands-clip)'
  });

  const viewName = isBack ? 'back' : 'front';
  const isMale = (gender === 'male');
  const modelImageSrc = isMale ? getMaleCroquis(size, viewName) : getFemaleCroquis(size, viewName);
  const targetImageSrc = isMale ? getMaleCroquisTarget(size, viewName) : getFemaleCroquisTarget(size, viewName);

  const fgImage = createSvgElement('image', {
    class: 'foreground-hands-photo',
    href: modelImageSrc,
    'data-size': String(size).toUpperCase(),
    'data-view': viewName,
    'data-gender': gender,
    'data-target-croquis': targetImageSrc,
    x: '0',
    y: '0',
    width: String(MODEL_GEOMETRY.nativeWidth),
    height: String(MODEL_GEOMETRY.nativeHeight),
    preserveAspectRatio: 'xMidYMid meet'
  });

  fgGroup.appendChild(fgImage);
  svgElement.appendChild(fgGroup);
}

/**
 * 2. Back Interior Depth
 */
function renderBackDepth(container, palette, LM = MODEL_GEOMETRY.landmarks) {
  const depthGroup = createSvgElement('g', { class: 'garment-interior-depth' });

  // Underside facing shadow under the skirt hem
  const hemFacing = createSvgElement('path', {
    d: getHemFacingDepthPath(LM),
    fill: 'url(#ff-light-hem-depth)',
    opacity: '0.88'
  });
  depthGroup.appendChild(hemFacing);

  container.appendChild(depthGroup);
}

/**
 * 3. Lower Garment (A-Line Skirt)
 */
function renderBottom(container, designState, palette, isBack, LM = MODEL_GEOMETRY.landmarks) {
  const skirtGroup = createSvgElement('g', { class: 'garment-region bottom-region', 'data-region': 'bottom' });
  const skirtPathData = isBack ? getSkirtBackPath(LM) : getSkirtFrontPath(LM);
  const fabricId = designState.fabric || 'cotton';

  // 3a. Base structural fabric fill with soft shadow filter
  const baseSkirt = createSvgElement('path', {
    d: skirtPathData,
    fill: palette.base,
    stroke: palette.seamColor,
    'stroke-width': '0.9',
    style: 'filter: url(#ff-soft-drop-shadow);'
  });
  skirtGroup.appendChild(baseSkirt);

  // 3b. 2.5D Volumetric Drape Gradient (sinusoidal vertical flutes)
  const drapeVolume = createSvgElement('path', {
    d: skirtPathData,
    fill: isBack ? 'url(#ff-light-skirt-back)' : 'url(#ff-light-skirt-front)',
    style: 'mix-blend-mode: multiply; opacity: 0.70;'
  });
  skirtGroup.appendChild(drapeVolume);

  // 3c. Vertical Drape Gravity Gradient (Top subtle shadow, bottom gentle shade)
  if (!isBack) {
    const verticalDrape = createSvgElement('path', {
      d: skirtPathData,
      fill: 'url(#ff-light-skirt-vertical)',
      style: 'mix-blend-mode: multiply; opacity: 0.28;'
    });
    skirtGroup.appendChild(verticalDrape);
  }

  // 3d. Fabric Micro-Texture Overlay (Softened for authentic sheen)
  const weavePatternId = `ff-fabric-weave-${fabricId}`;
  const weaveOverlay = createSvgElement('path', {
    d: skirtPathData,
    fill: `url(#${weavePatternId})`,
    style: 'mix-blend-mode: overlay; opacity: 0.35;'
  });
  skirtGroup.appendChild(weaveOverlay);

  // Material-specific tactile luster enhancements
  if (fabricId === 'silk') {
    // Directional lustrous sheen for silk
    const silkGlint = createSvgElement('path', {
      d: skirtPathData,
      fill: 'url(#ff-fabric-weave-silk)',
      style: 'mix-blend-mode: screen; opacity: 0.45;'
    });
    skirtGroup.appendChild(silkGlint);
  } else if (fabricId === 'denim') {
    // Accentuated diagonal twill body for denim
    const denimTwill = createSvgElement('path', {
      d: skirtPathData,
      fill: 'url(#ff-fabric-weave-denim)',
      style: 'mix-blend-mode: multiply; opacity: 0.35;'
    });
    skirtGroup.appendChild(denimTwill);
  } else if (fabricId === 'chiffon') {
    // Sheer translucent shimmer for chiffon
    const chiffonGlint = createSvgElement('path', {
      d: skirtPathData,
      fill: 'url(#ff-fabric-weave-chiffon)',
      style: 'mix-blend-mode: screen; opacity: 0.35;'
    });
    skirtGroup.appendChild(chiffonGlint);
  }

  // 3e. Decorative Surface Pattern (stripes, checks, floral, geometric, dots)
  if (designState.pattern && designState.pattern !== 'solid') {
    const patternOverlay = createSvgElement('path', {
      d: skirtPathData,
      fill: 'url(#ff-garment-pattern)',
      style: 'mix-blend-mode: multiply; opacity: 0.85;'
    });
    skirtGroup.appendChild(patternOverlay);
  }

  container.appendChild(skirtGroup);
}

/**
 * 4. Waist Interface Seam
 */
function renderWaistInterface(container, palette, isBack, LM = MODEL_GEOMETRY.landmarks) {
  const waistGroup = createSvgElement('g', { class: 'garment-region waist-interface-region' });
  const waistCenterY = isBack ? LM.waist.centerBack.y : LM.waist.centerFront.y;

  // Waistband line
  const waistSeam = createSvgElement('path', {
    d: `M ${LM.waist.left.x} ${LM.waist.left.y} Q ${MODEL_GEOMETRY.centerX} ${waistCenterY} ${LM.waist.right.x} ${LM.waist.right.y}`,
    fill: 'none',
    stroke: palette.seamColor,
    'stroke-width': '1.5',
    opacity: '0.8'
  });
  waistGroup.appendChild(waistSeam);

  // Soft contact shadow of bodice onto skirt
  const waistShadow = createSvgElement('path', {
    d: `M ${LM.waist.left.x} ${LM.waist.left.y} Q ${MODEL_GEOMETRY.centerX} ${waistCenterY} ${LM.waist.right.x} ${LM.waist.right.y} L ${LM.waist.right.x} ${LM.waist.right.y + 6} Q ${MODEL_GEOMETRY.centerX} ${waistCenterY + 6} ${LM.waist.left.x} ${LM.waist.left.y + 6} Z`,
    fill: 'url(#ff-light-waist-shadow)',
    opacity: '0.50'
  });
  waistGroup.appendChild(waistShadow);

  container.appendChild(waistGroup);
}

/**
 * 5. Upper Garment (Fitted Bodice)
 */
function renderTop(container, designState, palette, isBack, LM = MODEL_GEOMETRY.landmarks) {
  const topGroup = createSvgElement('g', { class: 'garment-region top-region', 'data-region': 'top' });
  const bodicePathData = isBack ? getBodiceBackPath(LM) : getBodiceFrontPath(LM);
  const fabricId = designState.fabric || 'cotton';

  // 5a. Base structural fabric fill
  const baseBodice = createSvgElement('path', {
    d: bodicePathData,
    fill: palette.base,
    stroke: palette.seamColor,
    'stroke-width': '0.9'
  });
  topGroup.appendChild(baseBodice);

  // 5b. 2.5D Volumetric Lighting Gradient (directional key-light)
  const bodiceLighting = createSvgElement('path', {
    d: bodicePathData,
    fill: isBack ? 'url(#ff-light-bodice-back)' : 'url(#ff-light-bodice-front)',
    style: 'mix-blend-mode: multiply; opacity: 0.70;'
  });
  topGroup.appendChild(bodiceLighting);

  // 5c. Bust fullness highlights (front view only)
  if (!isBack) {
    const leftBust = createSvgElement('ellipse', {
      cx: String(LM.bust.leftApex.x),
      cy: String(LM.bust.leftApex.y),
      rx: '38',
      ry: '38',
      fill: 'url(#ff-light-bust-left)',
      style: 'mix-blend-mode: screen; opacity: 0.48;'
    });
    const rightBust = createSvgElement('ellipse', {
      cx: String(LM.bust.rightApex.x),
      cy: String(LM.bust.rightApex.y),
      rx: '36',
      ry: '36',
      fill: 'url(#ff-light-bust-right)',
      style: 'mix-blend-mode: screen; opacity: 0.38;'
    });
    topGroup.appendChild(leftBust);
    topGroup.appendChild(rightBust);
  }

  // 5d. Fabric Micro-Texture Overlay
  const weavePatternId = `ff-fabric-weave-${fabricId}`;
  const weaveOverlay = createSvgElement('path', {
    d: bodicePathData,
    fill: `url(#${weavePatternId})`,
    style: 'mix-blend-mode: overlay; opacity: 0.35;'
  });
  topGroup.appendChild(weaveOverlay);

  // Material-specific tactile luster enhancements on bodice
  if (fabricId === 'silk') {
    const silkGlint = createSvgElement('path', {
      d: bodicePathData,
      fill: 'url(#ff-fabric-weave-silk)',
      style: 'mix-blend-mode: screen; opacity: 0.45;'
    });
    topGroup.appendChild(silkGlint);
  } else if (fabricId === 'denim') {
    const denimTwill = createSvgElement('path', {
      d: bodicePathData,
      fill: 'url(#ff-fabric-weave-denim)',
      style: 'mix-blend-mode: multiply; opacity: 0.35;'
    });
    topGroup.appendChild(denimTwill);
  } else if (fabricId === 'chiffon') {
    const chiffonGlint = createSvgElement('path', {
      d: bodicePathData,
      fill: 'url(#ff-fabric-weave-chiffon)',
      style: 'mix-blend-mode: screen; opacity: 0.35;'
    });
    topGroup.appendChild(chiffonGlint);
  }

  // 5e. Decorative Surface Pattern
  if (designState.pattern && designState.pattern !== 'solid') {
    const patternOverlay = createSvgElement('path', {
      d: bodicePathData,
      fill: 'url(#ff-garment-pattern)',
      style: 'mix-blend-mode: multiply; opacity: 0.85;'
    });
    topGroup.appendChild(patternOverlay);
  }

  container.appendChild(topGroup);
}

/**
 * 6. Sleeves (Set-In Short Sleeves)
 */
function renderSleeves(container, designState, palette, isBack, LM = MODEL_GEOMETRY.landmarks) {
  const sleevesGroup = createSvgElement('g', { class: 'garment-region sleeves-region', 'data-region': 'sleeves' });
  const leftPathData = getLeftSleevePath(isBack, LM);
  const rightPathData = getRightSleevePath(isBack, LM);
  const fabricId = designState.fabric || 'cotton';
  const weavePatternId = `ff-fabric-weave-${fabricId}`;

  // Left sleeve base & lighting
  sleevesGroup.appendChild(createSvgElement('path', {
    d: leftPathData,
    fill: palette.base,
    stroke: palette.seamColor,
    'stroke-width': '0.9'
  }));
  sleevesGroup.appendChild(createSvgElement('path', {
    d: leftPathData,
    fill: 'url(#ff-light-sleeve-left)',
    style: 'mix-blend-mode: multiply; opacity: 0.72;'
  }));

  // Right sleeve base & lighting
  sleevesGroup.appendChild(createSvgElement('path', {
    d: rightPathData,
    fill: palette.base,
    stroke: palette.seamColor,
    'stroke-width': '0.9'
  }));
  sleevesGroup.appendChild(createSvgElement('path', {
    d: rightPathData,
    fill: 'url(#ff-light-sleeve-right)',
    style: 'mix-blend-mode: multiply; opacity: 0.72;'
  }));

  // Sleeve micro-textures
  sleevesGroup.appendChild(createSvgElement('path', {
    d: leftPathData,
    fill: `url(#${weavePatternId})`,
    style: 'mix-blend-mode: overlay; opacity: 0.32;'
  }));
  sleevesGroup.appendChild(createSvgElement('path', {
    d: rightPathData,
    fill: `url(#${weavePatternId})`,
    style: 'mix-blend-mode: overlay; opacity: 0.32;'
  }));

  // Surface pattern for sleeves
  if (designState.pattern && designState.pattern !== 'solid') {
    sleevesGroup.appendChild(createSvgElement('path', {
      d: leftPathData,
      fill: 'url(#ff-garment-pattern)',
      style: 'mix-blend-mode: multiply; opacity: 0.85;'
    }));
    sleevesGroup.appendChild(createSvgElement('path', {
      d: rightPathData,
      fill: 'url(#ff-garment-pattern)',
      style: 'mix-blend-mode: multiply; opacity: 0.85;'
    }));
  }

  // Armscye attachment seam indication
  const leftArmscyeSeam = createSvgElement('path', {
    d: `M ${LM.shoulders.leftTip.x} ${LM.shoulders.leftTip.y} C ${LM.armscye.leftMid.x} ${LM.armscye.leftMid.y}, ${LM.armscye.leftPit.x - 4} ${LM.armscye.leftPit.y - 15}, ${LM.armscye.leftPit.x} ${LM.armscye.leftPit.y}`,
    fill: 'none',
    stroke: palette.seamColor,
    'stroke-width': '1.2',
    opacity: '0.7'
  });
  const rightArmscyeSeam = createSvgElement('path', {
    d: `M ${LM.shoulders.rightTip.x} ${LM.shoulders.rightTip.y} C ${LM.armscye.rightMid.x} ${LM.armscye.rightMid.y}, ${LM.armscye.rightPit.x + 4} ${LM.armscye.rightPit.y - 15}, ${LM.armscye.rightPit.x} ${LM.armscye.rightPit.y}`,
    fill: 'none',
    stroke: palette.seamColor,
    'stroke-width': '1.2',
    opacity: '0.7'
  });
  sleevesGroup.appendChild(leftArmscyeSeam);
  sleevesGroup.appendChild(rightArmscyeSeam);

  // Cast shadow from sleeve hem onto bare arms
  const lOuter = LM.sleeveShort.leftOuterHem;
  const lInner = LM.sleeveShort.leftInnerHem;
  const lc1x = Math.round(lOuter.x + (lInner.x - lOuter.x) * 0.35);
  const lc1y = Math.round(lOuter.y + (lInner.y - lOuter.y) * 0.35 + 5);
  const lc2x = Math.round(lOuter.x + (lInner.x - lOuter.x) * 0.70);
  const lc2y = Math.round(lOuter.y + (lInner.y - lOuter.y) * 0.70 + 4);

  const rInner = LM.sleeveShort.rightInnerHem;
  const rOuter = LM.sleeveShort.rightOuterHem;
  const rc1x = Math.round(rInner.x + (rOuter.x - rInner.x) * 0.30);
  const rc1y = Math.round(rInner.y + (rOuter.y - rInner.y) * 0.30 + 4);
  const rc2x = Math.round(rInner.x + (rOuter.x - rInner.x) * 0.65);
  const rc2y = Math.round(rInner.y + (rOuter.y - rInner.y) * 0.65 + 5);

  const leftSleeveShadow = createSvgElement('path', {
    d: `M ${lOuter.x} ${lOuter.y} C ${lc1x} ${lc1y}, ${lc2x} ${lc2y}, ${lInner.x} ${lInner.y} L ${lInner.x} ${lInner.y + 6} C ${lc2x} ${lc2y + 6}, ${lc1x} ${lc1y + 6}, ${lOuter.x} ${lOuter.y + 6} Z`,
    fill: 'url(#ff-sleeve-cast-shadow-left)'
  });
  const rightSleeveShadow = createSvgElement('path', {
    d: `M ${rInner.x} ${rInner.y} C ${rc1x} ${rc1y}, ${rc2x} ${rc2y}, ${rOuter.x} ${rOuter.y} L ${rOuter.x} ${rOuter.y + 6} C ${rc2x} ${rc2y + 6}, ${rc1x} ${rc1y + 6}, ${rInner.x} ${rInner.y + 6} Z`,
    fill: 'url(#ff-sleeve-cast-shadow-right)'
  });
  sleevesGroup.appendChild(leftSleeveShadow);
  sleevesGroup.appendChild(rightSleeveShadow);

  container.appendChild(sleevesGroup);
}

/**
 * 7. Neckline / Collar
 */
function renderNeckline(container, palette, isBack, LM = MODEL_GEOMETRY.landmarks) {
  const neckGroup = createSvgElement('g', { class: 'garment-region neckline-region', 'data-region': 'collar' });

  // Finished slender neck binding strip
  const binding = createSvgElement('path', {
    d: getNecklineBindingPath(isBack, LM),
    fill: palette.base,
    stroke: palette.seamColor,
    'stroke-width': '0.9',
    opacity: '0.96'
  });
  neckGroup.appendChild(binding);

  // Subtle contact shadow cast under neck binding onto collarbone / skin
  const shadowD = isBack
    ? `M ${LM.neck.left.x} ${LM.neck.backCervicaleDip.y + 6} Q ${LM.neck.backCervicaleDip.x} ${LM.neck.backCervicaleDip.y + 8} ${LM.neck.right.x} ${LM.neck.backCervicaleDip.y + 6}`
    : `M ${LM.neck.left.x} ${LM.neck.frontJewelDip.y + 4} Q ${LM.neck.frontJewelDip.x} ${LM.neck.frontJewelDip.y + 7} ${LM.neck.right.x} ${LM.neck.frontJewelDip.y + 4}`;
  const neckShadow = createSvgElement('path', {
    d: shadowD,
    fill: 'none',
    stroke: palette.shadowDeep,
    'stroke-width': '2.0',
    opacity: '0.22',
    style: 'filter: blur(1px);'
  });
  neckGroup.appendChild(neckShadow);

  container.appendChild(neckGroup);
}

/**
 * 8. Construction Seams, Topstitching & Flutes
 */
function applyConstructionDetails(container, palette, isBack, LM = MODEL_GEOMETRY.landmarks) {
  const detailsGroup = createSvgElement('g', { class: 'garment-construction-details' });
  const lines = getConstructionLines(isBack ? 'back' : 'front', LM);

  if (!isBack) {
    // Front Princess Seams (Shadow line + soft highlight line)
    const leftPrincess = createSvgElement('path', {
      d: lines.leftPrincessSeam,
      fill: 'none',
      stroke: palette.seamColor,
      'stroke-width': '1.1',
      opacity: '0.55'
    });
    const rightPrincess = createSvgElement('path', {
      d: lines.rightPrincessSeam,
      fill: 'none',
      stroke: palette.seamColor,
      'stroke-width': '1.1',
      opacity: '0.55'
    });
    detailsGroup.appendChild(leftPrincess);
    detailsGroup.appendChild(rightPrincess);

    // Armscye seams (Set-in sleeve attachment)
    if (lines.leftArmscye && lines.rightArmscye) {
      const leftArmscye = createSvgElement('path', {
        d: lines.leftArmscye,
        fill: 'none',
        stroke: palette.seamColor,
        'stroke-width': '1.0',
        opacity: '0.42'
      });
      const rightArmscye = createSvgElement('path', {
        d: lines.rightArmscye,
        fill: 'none',
        stroke: palette.seamColor,
        'stroke-width': '1.0',
        opacity: '0.42'
      });
      detailsGroup.appendChild(leftArmscye);
      detailsGroup.appendChild(rightArmscye);
    }

    // Front Skirt Drape Flutes (Soft fabric folds)
    [lines.skirtFluteOuterLeft, lines.skirtFluteLeft, lines.skirtFluteCenter, lines.skirtFluteRight, lines.skirtFluteOuterRight].forEach((flutePath) => {
      const flute = createSvgElement('path', {
        d: flutePath,
        fill: 'none',
        stroke: palette.shadowDeep,
        'stroke-width': '1.0',
        opacity: '0.24'
      });
      detailsGroup.appendChild(flute);
    });

    // Topstitching on Hem and Sleeves (fine dashed line)
    const hemStitch = createSvgElement('path', {
      d: lines.hemStitch,
      fill: 'none',
      stroke: palette.stitchColor,
      'stroke-width': '0.8',
      'stroke-dasharray': '5,3',
      opacity: '0.65'
    });
    const leftSleeveStitch = createSvgElement('path', {
      d: lines.sleeveLeftStitch,
      fill: 'none',
      stroke: palette.stitchColor,
      'stroke-width': '0.8',
      'stroke-dasharray': '4,3',
      opacity: '0.6'
    });
    const rightSleeveStitch = createSvgElement('path', {
      d: lines.sleeveRightStitch,
      fill: 'none',
      stroke: palette.stitchColor,
      'stroke-width': '0.8',
      'stroke-dasharray': '4,3',
      opacity: '0.6'
    });
    detailsGroup.appendChild(hemStitch);
    detailsGroup.appendChild(leftSleeveStitch);
    detailsGroup.appendChild(rightSleeveStitch);
  } else {
    // Back View: Center Back Zipper / Closure Seam
    const zipper = createSvgElement('path', {
      d: lines.centerBackZipper,
      fill: 'none',
      stroke: palette.seamColor,
      'stroke-width': '1.6',
      opacity: '0.85'
    });
    // Zipper pull at top
    const zipperPull = createSvgElement('rect', {
      x: String(LM.bust.center.x - 3),
      y: String(LM.neck.backCervicaleDip.y + 4),
      width: '6',
      height: '11',
      rx: '2',
      fill: palette.shadowDeep,
      stroke: palette.highlightCrisp,
      'stroke-width': '0.8'
    });
    detailsGroup.appendChild(zipper);
    detailsGroup.appendChild(zipperPull);

    // Back Darts
    const leftDart = createSvgElement('path', {
      d: lines.leftBackDart,
      fill: 'none',
      stroke: palette.seamColor,
      'stroke-width': '1.0',
      opacity: '0.45'
    });
    const rightDart = createSvgElement('path', {
      d: lines.rightBackDart,
      fill: 'none',
      stroke: palette.seamColor,
      'stroke-width': '1.0',
      opacity: '0.45'
    });
    detailsGroup.appendChild(leftDart);
    detailsGroup.appendChild(rightDart);

    // Armscye seams on back
    if (lines.leftArmscye && lines.rightArmscye) {
      const leftArmscye = createSvgElement('path', {
        d: lines.leftArmscye,
        fill: 'none',
        stroke: palette.seamColor,
        'stroke-width': '1.0',
        opacity: '0.42'
      });
      const rightArmscye = createSvgElement('path', {
        d: lines.rightArmscye,
        fill: 'none',
        stroke: palette.seamColor,
        'stroke-width': '1.0',
        opacity: '0.42'
      });
      detailsGroup.appendChild(leftArmscye);
      detailsGroup.appendChild(rightArmscye);
    }

    // Back Skirt Flutes
    [lines.skirtFluteOuterLeft, lines.skirtFluteLeft, lines.skirtFluteCenter, lines.skirtFluteRight, lines.skirtFluteOuterRight].forEach((flutePath) => {
      const flute = createSvgElement('path', {
        d: flutePath,
        fill: 'none',
        stroke: palette.shadowDeep,
        'stroke-width': '1.0',
        opacity: '0.24'
      });
      detailsGroup.appendChild(flute);
    });

    // Back Topstitching
    const hemStitch = createSvgElement('path', {
      d: lines.hemStitch,
      fill: 'none',
      stroke: palette.stitchColor,
      'stroke-width': '0.8',
      'stroke-dasharray': '5,3',
      opacity: '0.65'
    });
    detailsGroup.appendChild(hemStitch);
  }

  container.appendChild(detailsGroup);
}

/**
 * 9. Depth and Contact Shadows
 */
function renderDepth(container, palette, isBack, LM = MODEL_GEOMETRY.landmarks) {
  const depthGroup = createSvgElement('g', { class: 'garment-ambient-depth' });

  // Contact shadow under skirt hem casting onto model's legs
  const legContactShadow = createSvgElement('ellipse', {
    cx: String(MODEL_GEOMETRY.centerX),
    cy: String(LM.skirtAline.hemY + 14),
    rx: '155',
    ry: '8',
    fill: '#2a1f1b',
    opacity: '0.20',
    style: 'filter: blur(4px); pointer-events: none;'
  });
  depthGroup.appendChild(legContactShadow);

  container.appendChild(depthGroup);
}

/**
 * Helper to render a clean single technical flat (Front or Back)
 * Professional vector CAD representation on white background
 */
function buildTechnicalFlatSvg(containerSvg, isBack = false, designState = null) {
  if (!containerSvg) return;
  const isMainCanvas = containerSvg.id === 'main-flat-svg';
  const size = designState?.size || 'M';
  const gender = (designState?.figure === 'male' || designState?.croquis === 'male') ? 'male' : 'female';
  const LM = getBodyLandmarks(size, gender);

  // Frame focused tightly on the garment silhouette: X 215..555, Y 270..930
  containerSvg.setAttribute('viewBox', '215 270 340 660');
  containerSvg.setAttribute('class', isMainCanvas ? `main-flat-svg ${isBack ? 'view-back' : 'view-front'}` : `tech-flat-thumb ${isBack ? 'view-back' : 'view-front'}`);
  if (!isMainCanvas) {
    containerSvg.style.height = '100%';
    containerSvg.style.maxHeight = '7.2rem';
    containerSvg.style.width = 'auto';
    containerSvg.style.maxWidth = '100%';
  }
  containerSvg.style.display = 'block';
  containerSvg.replaceChildren();

  const g = createSvgElement('g', {
    class: 'technical-flat-lines',
    fill: '#ffffff',
    stroke: '#1e1c1b',
    'stroke-width': '1.8',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round'
  });

  // Base garment pieces
  const skirtPath = createSvgElement('path', { d: isBack ? getSkirtBackPath(LM) : getSkirtFrontPath(LM) });
  const bodicePath = createSvgElement('path', { d: isBack ? getBodiceBackPath(LM) : getBodiceFrontPath(LM) });
  const leftSleeve = createSvgElement('path', { d: getLeftSleevePath(isBack, LM) });
  const rightSleeve = createSvgElement('path', { d: getRightSleevePath(isBack, LM) });
  const neckBinding = createSvgElement('path', { d: getNecklineBindingPath(isBack, LM), fill: '#f6f4f2' });

  g.appendChild(skirtPath);
  g.appendChild(bodicePath);
  g.appendChild(leftSleeve);
  g.appendChild(rightSleeve);
  g.appendChild(neckBinding);

  // Construction lines
  const details = createSvgElement('g', {
    fill: 'none',
    stroke: '#1e1c1b',
    'stroke-width': '1.0'
  });
  const lines = getConstructionLines(isBack ? 'back' : 'front', LM);

  if (!isBack) {
    [lines.leftPrincessSeam, lines.rightPrincessSeam, lines.leftArmscye, lines.rightArmscye, lines.waistSeam, lines.skirtFluteLeft, lines.skirtFluteRight].forEach(d => {
      if (d) details.appendChild(createSvgElement('path', { d }));
    });
    // Dashed stitches
    [lines.hemStitch, lines.sleeveLeftStitch, lines.sleeveRightStitch].forEach(d => {
      if (d) details.appendChild(createSvgElement('path', { d, 'stroke-dasharray': '4,3', opacity: '0.8' }));
    });
  } else {
    // Back center zipper
    if (lines.centerBackZipper) {
      details.appendChild(createSvgElement('path', { d: lines.centerBackZipper, 'stroke-width': '1.8' }));
    }
    // Center back seam below zipper to hem
    if (lines.centerBackSeam) {
      details.appendChild(createSvgElement('path', { d: lines.centerBackSeam, 'stroke-width': '1.0' }));
    }
    // Zipper pull at neckline
    details.appendChild(createSvgElement('rect', {
      x: String(LM.bust.center.x - 3),
      y: String(LM.neck.backCervicaleDip.y + 4),
      width: '6',
      height: '11',
      rx: '2',
      fill: '#1e1c1b'
    }));
    [lines.leftBackDart, lines.rightBackDart, lines.leftArmscye, lines.rightArmscye, lines.waistSeam, lines.skirtFluteLeft, lines.skirtFluteRight].forEach(d => {
      if (d) details.appendChild(createSvgElement('path', { d }));
    });
    [lines.hemStitch, lines.sleeveLeftStitch, lines.sleeveRightStitch].forEach(d => {
      if (d) details.appendChild(createSvgElement('path', { d, 'stroke-dasharray': '4,3', opacity: '0.8' }));
    });
  }

  g.appendChild(details);
  containerSvg.appendChild(g);
}

/**
 * Technical Flat Renderer Boundary (Separate from 2.5D Shading)
 */
export function renderTechnicalFlat(designState, containerSvg) {
  const isBack = designState.view === 'back';
  buildTechnicalFlatSvg(containerSvg, isBack, designState);
}

/**
 * Dual Technical Flat Pair (Renders Front & Back side-by-side in information panel)
 */
export function renderTechnicalFlatPair(frontSvg, backSvg, designState = null) {
  buildTechnicalFlatSvg(frontSvg, false, designState);
  buildTechnicalFlatSvg(backSvg, true, designState);
}
