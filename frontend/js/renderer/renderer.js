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
  getConstructionLines,
  // Phase 5 — Additional Component Geometry
  getRelaxedBodiceFrontPath,
  getRelaxedBodiceBackPath,
  getWrapTopFrontPath,
  getWrapTopBackPath,
  getPeplumFrontPath,
  getPeplumBackPath,
  getPeplumFlareFrontPath,
  getPeplumFlareBackPath,
  getStraightSkirtFrontPath,
  getStraightSkirtBackPath,
  getWideLegFrontPath,
  getWideLegBackPath,
  getTrouserFrontPath,
  getTrouserBackPath,
  getLeftLongSleevePath,
  getRightLongSleevePath,
  getLeftFlareSleevePath,
  getRightFlareSleevePath,
  getVNeckBindingPath,
  getSquareNeckBindingPath
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
  const isMale = (designState?.figure === 'male' || designState?.croquis === 'male');
  const collar = designState?.collar || 'round';
  const top = designState?.top || 'basic';
  const bottom = designState?.bottom || 'skirt';

  // 1. Back Interior Depth (Visible inside collar scoop & under skirt hem)
  if (!isBack) {
    renderBackDepth(garmentGroup, palette, LM, collar, isMale, bottom);
  }

  // 2. Lower Garment (A-Line Skirt, Straight Skirt, Trousers, or Wide Leg)
  renderBottom(garmentGroup, designState, palette, isBack, LM, isMale);

  // 3. Waist Interface Connection & Contact Shadow
  // Render waist connection band only for fitted silhouettes over skirts (not untucked relaxed shirts)
  if ((bottom === 'skirt' || bottom === 'straight') && top !== 'crop') {
    renderWaistInterface(garmentGroup, palette, isBack, LM);
  }

  // 4. Bodice / Shirt (Fitted Bodice, Relaxed Shirt, Wrap Top, or Peplum)
  renderTop(garmentGroup, designState, palette, isBack, LM, isMale);

  // 5. Sleeves with cylindrical volume (Short, Long, or Flare)
  renderSleeves(garmentGroup, designState, palette, isBack, LM, isMale);

  // 6. Neckline / Collar Finished Binding (Round, V-Neck, or Square)
  renderNeckline(garmentGroup, palette, isBack, LM, collar, isMale, top);

  // 7. Component-Aware Sartorial Construction Details
  applyConstructionDetails(garmentGroup, palette, isBack, LM, designState, isMale);

  // 8. Final Depth and Ground/Leg Contact Shadows
  renderDepth(garmentGroup, palette, isBack, LM, designState);
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
function renderBackDepth(container, palette, LM = MODEL_GEOMETRY.landmarks, collar = 'round', isMale = false, bottom = 'skirt') {
  const depthGroup = createSvgElement('g', { class: 'garment-interior-depth' });

  // Underside facing shadow under skirt hem (only for flared A-line skirts)
  if (bottom === 'skirt') {
    const hemFacing = createSvgElement('path', {
      d: getHemFacingDepthPath(LM),
      fill: 'url(#ff-light-hem-depth)',
      opacity: '0.88'
    });
    depthGroup.appendChild(hemFacing);
  }

  // Inner back neckline depth
  const innerNeck = createSvgElement('path', {
    d: getInnerNeckBackDepthPath(LM, collar),
    fill: 'url(#ff-light-inner-neck)',
    opacity: '0.90'
  });
  depthGroup.appendChild(innerNeck);

  container.appendChild(depthGroup);
}

/**
 * Helper: resolve the bottom path based on designState.bottom and gender
 */
function getBottomPath(bottom, isBack, LM, isMale = false) {
  switch (bottom) {
    case 'straight': return isBack ? getStraightSkirtBackPath(LM) : getStraightSkirtFrontPath(LM);
    case 'wide':     return isBack ? getWideLegBackPath(LM, isMale) : getWideLegFrontPath(LM, isMale);
    case 'trousers': return isBack ? getTrouserBackPath(LM, isMale) : getTrouserFrontPath(LM, isMale);
    default:         return isBack ? getSkirtBackPath(LM) : getSkirtFrontPath(LM);
  }
}

/**
 * 3. Lower Garment (Dispatched by designState.bottom)
 */
function renderBottom(container, designState, palette, isBack, LM = MODEL_GEOMETRY.landmarks, isMale = false) {
  const skirtGroup = createSvgElement('g', { class: 'garment-region bottom-region', 'data-region': 'bottom' });
  const bottom = designState.bottom || 'skirt';
  const skirtPathData = getBottomPath(bottom, isBack, LM, isMale);
  const fabricId = designState.fabric || 'cotton';
  const isPants = (bottom === 'trousers' || bottom === 'wide');

  // 3a. Base structural fabric fill with soft shadow filter
  const baseSkirt = createSvgElement('path', {
    d: skirtPathData,
    fill: palette.base,
    stroke: palette.seamColor,
    'stroke-width': '0.9',
    style: 'filter: url(#ff-soft-drop-shadow);'
  });
  skirtGroup.appendChild(baseSkirt);

  // 3b. 2.5D Volumetric Lighting Gradient
  // Use cylindrical key lighting for trousers, vertical sinusoidal drape flutes for skirts
  const drapeVolume = createSvgElement('path', {
    d: skirtPathData,
    fill: isPants
      ? (isBack ? 'url(#ff-light-bodice-back)' : 'url(#ff-light-bodice-front)')
      : (isBack ? 'url(#ff-light-skirt-back)' : 'url(#ff-light-skirt-front)'),
    style: 'mix-blend-mode: multiply; opacity: 0.65;'
  });
  skirtGroup.appendChild(drapeVolume);

  // 3c. Vertical Drape Gravity Gradient (Top subtle shadow, bottom gentle shade for skirts)
  if (!isBack && !isPants) {
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
 * 5. Upper Garment (Fitted Bodice / Relaxed Shirt / Wrap Top / Peplum)
 */
function renderTop(container, designState, palette, isBack, LM = MODEL_GEOMETRY.landmarks, isMale = false) {
  const topGroup = createSvgElement('g', { class: 'garment-region top-region', 'data-region': 'top' });
  const top = designState.top || 'basic';
  const collar = designState?.collar || 'round';

  let bodicePathData;
  if (top === 'crop') {
    bodicePathData = isBack ? getRelaxedBodiceBackPath(LM, isMale, collar) : getRelaxedBodiceFrontPath(LM, isMale, collar);
  } else if (top === 'wrap') {
    bodicePathData = isBack ? getWrapTopBackPath(LM, collar) : getWrapTopFrontPath(LM, collar);
  } else if (top === 'peplum') {
    bodicePathData = isBack ? getPeplumBackPath(LM, collar) : getPeplumFrontPath(LM, collar);
  } else {
    bodicePathData = isBack ? getBodiceBackPath(LM, collar) : getBodiceFrontPath(LM, collar);
  }
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

  // 5c. Bust fullness highlights (front view only, female fitted tops only)
  if (!isBack && !isMale && top !== 'crop') {
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

  // 5f. Peplum flounce tier (rendered in addition to fitted bodice)
  if (top === 'peplum') {
    const peplumPath = isBack ? getPeplumFlareBackPath(LM) : getPeplumFlareFrontPath(LM);
    const peplumBase = createSvgElement('path', {
      d: peplumPath,
      fill: palette.base,
      stroke: palette.seamColor,
      'stroke-width': '0.9'
    });
    const peplumLight = createSvgElement('path', {
      d: peplumPath,
      fill: isBack ? 'url(#ff-light-skirt-back)' : 'url(#ff-light-skirt-front)',
      style: 'mix-blend-mode: multiply; opacity: 0.60;'
    });
    const peplumWeave = createSvgElement('path', {
      d: peplumPath,
      fill: `url(#ff-fabric-weave-${fabricId})`,
      style: 'mix-blend-mode: overlay; opacity: 0.30;'
    });
    topGroup.appendChild(peplumBase);
    topGroup.appendChild(peplumLight);
    topGroup.appendChild(peplumWeave);
  }

  container.appendChild(topGroup);
}

/**
 * 6. Sleeves (Dispatched by designState.sleeves)
 */
function renderSleeves(container, designState, palette, isBack, LM = MODEL_GEOMETRY.landmarks, isMale = false) {
  const sleevesGroup = createSvgElement('g', { class: 'garment-region sleeves-region', 'data-region': 'sleeves' });
  const sleevesStyle = designState.sleeves || 'short';
  let leftPathData, rightPathData;
  if (sleevesStyle === 'long') {
    leftPathData  = getLeftLongSleevePath(isBack, LM, isMale);
    rightPathData = getRightLongSleevePath(isBack, LM, isMale);
  } else if (sleevesStyle === 'flare') {
    leftPathData  = getLeftFlareSleevePath(isBack, LM, isMale);
    rightPathData = getRightFlareSleevePath(isBack, LM, isMale);
  } else {
    leftPathData  = getLeftSleevePath(isBack, LM);
    rightPathData = getRightSleevePath(isBack, LM);
  }
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

  // Cast shadow from sleeve hem onto bare arms (short sleeves only)
  if (sleevesStyle === 'short') {
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
  }

  container.appendChild(sleevesGroup);
}

/**
 * 7. Neckline / Collar (Dispatched by designState.collar)
 */
function renderNeckline(container, palette, isBack, LM = MODEL_GEOMETRY.landmarks, collar = 'round', isMale = false, top = 'basic') {
  // Front wrap tops possess an integrated crossover surplice neck; skip separate top-stitched binding
  if (top === 'wrap' && !isBack) {
    return;
  }

  const neckGroup = createSvgElement('g', { class: 'garment-region neckline-region', 'data-region': 'collar' });
  const neckBindingPath = getNecklineBindingPath(isBack, LM, collar, isMale);

  // Finished slender neck binding strip
  const binding = createSvgElement('path', {
    d: neckBindingPath,
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
function applyConstructionDetails(container, palette, isBack, LM = MODEL_GEOMETRY.landmarks, designState = null, isMale = false) {
  const detailsGroup = createSvgElement('g', { class: 'garment-construction-details' });
  const lines = getConstructionLines(isBack ? 'back' : 'front', LM, designState);

  // 1. Armscye seams (set-in sleeve attachment)
  if (lines.leftArmscye && lines.rightArmscye) {
    detailsGroup.appendChild(createSvgElement('path', {
      d: lines.leftArmscye,
      fill: 'none',
      stroke: palette.seamColor,
      'stroke-width': '1.2',
      opacity: '0.6'
    }));
    detailsGroup.appendChild(createSvgElement('path', {
      d: lines.rightArmscye,
      fill: 'none',
      stroke: palette.seamColor,
      'stroke-width': '1.2',
      opacity: '0.6'
    }));
  }

  // 2. Princess Seams (Fitted Bodice / Peplum)
  if (lines.leftPrincessSeam && lines.rightPrincessSeam) {
    detailsGroup.appendChild(createSvgElement('path', {
      d: lines.leftPrincessSeam,
      fill: 'none',
      stroke: palette.seamColor,
      'stroke-width': '1.2',
      opacity: '0.65'
    }));
    detailsGroup.appendChild(createSvgElement('path', {
      d: lines.rightPrincessSeam,
      fill: 'none',
      stroke: palette.seamColor,
      'stroke-width': '1.2',
      opacity: '0.65'
    }));
  }

  // 3. Shirt Front Button Placket & Buttons (Relaxed Shirt)
  if (lines.shirtPlacketLeft && lines.shirtPlacketRight) {
    detailsGroup.appendChild(createSvgElement('path', {
      d: lines.shirtPlacketLeft,
      fill: 'none',
      stroke: palette.seamColor,
      'stroke-width': '1.0',
      opacity: '0.75'
    }));
    detailsGroup.appendChild(createSvgElement('path', {
      d: lines.shirtPlacketRight,
      fill: 'none',
      stroke: palette.seamColor,
      'stroke-width': '1.0',
      opacity: '0.75'
    }));
    detailsGroup.appendChild(createSvgElement('path', {
      d: lines.shirtPlacketCenter,
      fill: 'none',
      stroke: palette.stitchColor,
      'stroke-width': '0.7',
      'stroke-dasharray': '4,3',
      opacity: '0.5'
    }));
    if (lines.shirtButtons) {
      lines.shirtButtons.forEach(btn => {
        detailsGroup.appendChild(createSvgElement('circle', {
          cx: String(btn.x),
          cy: String(btn.y),
          r: '3.5',
          fill: '#faf8f5',
          stroke: palette.seamColor,
          'stroke-width': '0.8',
          opacity: '0.9'
        }));
      });
    }
  }

  // 4. Chest Pocket
  if (lines.chestPocket) {
    detailsGroup.appendChild(createSvgElement('path', {
      d: lines.chestPocket,
      fill: 'none',
      stroke: palette.seamColor,
      'stroke-width': '1.1',
      opacity: '0.7'
    }));
  }

  // 5. Wrap crossover seam & tie
  if (lines.wrapCrossover) {
    detailsGroup.appendChild(createSvgElement('path', {
      d: lines.wrapCrossover,
      fill: 'none',
      stroke: palette.seamColor,
      'stroke-width': '1.4',
      opacity: '0.8'
    }));
  }
  if (lines.wrapTie) {
    detailsGroup.appendChild(createSvgElement('path', {
      d: lines.wrapTie,
      fill: 'none',
      stroke: palette.seamColor,
      'stroke-width': '2.0',
      opacity: '0.75'
    }));
  }

  // 6. Shirt Back Yoke & Pleats
  if (lines.shirtYoke) {
    detailsGroup.appendChild(createSvgElement('path', {
      d: lines.shirtYoke,
      fill: 'none',
      stroke: palette.seamColor,
      'stroke-width': '1.2',
      opacity: '0.7'
    }));
    if (lines.shirtPleatLeft && lines.shirtPleatRight) {
      detailsGroup.appendChild(createSvgElement('path', {
        d: lines.shirtPleatLeft,
        fill: 'none',
        stroke: palette.seamColor,
        'stroke-width': '0.9',
        opacity: '0.5'
      }));
      detailsGroup.appendChild(createSvgElement('path', {
        d: lines.shirtPleatRight,
        fill: 'none',
        stroke: palette.seamColor,
        'stroke-width': '0.9',
        opacity: '0.5'
      }));
    }
  }

  // 7. Center Back Zipper & Darts (Fitted Bodice / Dress)
  if (lines.centerBackZipper) {
    detailsGroup.appendChild(createSvgElement('path', {
      d: lines.centerBackZipper,
      fill: 'none',
      stroke: palette.seamColor,
      'stroke-width': '1.6',
      opacity: '0.85'
    }));
    detailsGroup.appendChild(createSvgElement('rect', {
      x: String(LM.bust.center.x - 3),
      y: String(LM.neck.backCervicaleDip.y + 4),
      width: '6',
      height: '11',
      rx: '2',
      fill: palette.shadowDeep,
      stroke: palette.highlightCrisp,
      'stroke-width': '0.8'
    }));
  }
  if (lines.leftBackDart && lines.rightBackDart) {
    detailsGroup.appendChild(createSvgElement('path', {
      d: lines.leftBackDart,
      fill: 'none',
      stroke: palette.seamColor,
      'stroke-width': '1.0',
      opacity: '0.45'
    }));
    detailsGroup.appendChild(createSvgElement('path', {
      d: lines.rightBackDart,
      fill: 'none',
      stroke: palette.seamColor,
      'stroke-width': '1.0',
      opacity: '0.45'
    }));
  }

  // 8. Trousers Front Fly & Crease Lines
  if (lines.frontFlyPlacket) {
    detailsGroup.appendChild(createSvgElement('path', {
      d: lines.frontFlyPlacket,
      fill: 'none',
      stroke: palette.seamColor,
      'stroke-width': '1.3',
      opacity: '0.75'
    }));
  }
  if (lines.trouserCreaseLeft && lines.trouserCreaseRight) {
    detailsGroup.appendChild(createSvgElement('path', {
      d: lines.trouserCreaseLeft,
      fill: 'none',
      stroke: palette.shadowDeep,
      'stroke-width': '0.8',
      opacity: '0.35'
    }));
    detailsGroup.appendChild(createSvgElement('path', {
      d: lines.trouserCreaseRight,
      fill: 'none',
      stroke: palette.shadowDeep,
      'stroke-width': '0.8',
      opacity: '0.35'
    }));
  }

  // 9. Trousers Back Rise & Welt Pockets
  if (lines.trouserBackRise) {
    detailsGroup.appendChild(createSvgElement('path', {
      d: lines.trouserBackRise,
      fill: 'none',
      stroke: palette.seamColor,
      'stroke-width': '1.4',
      opacity: '0.7'
    }));
  }
  if (lines.trouserPocketLeft && lines.trouserPocketRight) {
    detailsGroup.appendChild(createSvgElement('path', {
      d: lines.trouserPocketLeft,
      fill: 'none',
      stroke: palette.seamColor,
      'stroke-width': '1.5',
      opacity: '0.6'
    }));
    detailsGroup.appendChild(createSvgElement('path', {
      d: lines.trouserPocketRight,
      fill: 'none',
      stroke: palette.seamColor,
      'stroke-width': '1.5',
      opacity: '0.6'
    }));
  }

  // 10. Skirt Flutes (A-Line Skirt Only!)
  if (lines.skirtFlutes && Array.isArray(lines.skirtFlutes)) {
    lines.skirtFlutes.forEach(flutePath => {
      detailsGroup.appendChild(createSvgElement('path', {
        d: flutePath,
        fill: 'none',
        stroke: palette.shadowDeep,
        'stroke-width': '1.0',
        opacity: '0.24'
      }));
    });
  }

  // 11. Hem Topstitching
  if (lines.hemStitch) {
    detailsGroup.appendChild(createSvgElement('path', {
      d: lines.hemStitch,
      fill: 'none',
      stroke: palette.stitchColor,
      'stroke-width': '0.8',
      'stroke-dasharray': '5,3',
      opacity: '0.65'
    }));
  }
  if (lines.hemStitchLeft && lines.hemStitchRight) {
    detailsGroup.appendChild(createSvgElement('path', {
      d: lines.hemStitchLeft,
      fill: 'none',
      stroke: palette.stitchColor,
      'stroke-width': '0.8',
      'stroke-dasharray': '4,3',
      opacity: '0.65'
    }));
    detailsGroup.appendChild(createSvgElement('path', {
      d: lines.hemStitchRight,
      fill: 'none',
      stroke: palette.stitchColor,
      'stroke-width': '0.8',
      'stroke-dasharray': '4,3',
      opacity: '0.65'
    }));
  }
  if (lines.walkingVent) {
    detailsGroup.appendChild(createSvgElement('path', {
      d: lines.walkingVent,
      fill: 'none',
      stroke: palette.seamColor,
      'stroke-width': '1.3',
      opacity: '0.75'
    }));
  }

  // 12. Sleeve Stitches
  if (lines.sleeveLeftStitch && lines.sleeveRightStitch) {
    detailsGroup.appendChild(createSvgElement('path', {
      d: lines.sleeveLeftStitch,
      fill: 'none',
      stroke: palette.stitchColor,
      'stroke-width': '0.8',
      'stroke-dasharray': '4,3',
      opacity: '0.6'
    }));
    detailsGroup.appendChild(createSvgElement('path', {
      d: lines.sleeveRightStitch,
      fill: 'none',
      stroke: palette.stitchColor,
      'stroke-width': '0.8',
      'stroke-dasharray': '4,3',
      opacity: '0.6'
    }));
  }

  container.appendChild(detailsGroup);
}

/**
 * 9. Depth and Contact Shadows
 */
function renderDepth(container, palette, isBack, LM = MODEL_GEOMETRY.landmarks, designState = null) {
  const bottom = designState?.bottom || 'skirt';
  const isPants = (bottom === 'trousers' || bottom === 'wide');
  const hemY = isPants ? ((LM?.feet?.groundY || 1320) - 70) : (LM.skirtAline.hemY + 14);

  const depthGroup = createSvgElement('g', { class: 'garment-ambient-depth' });
  const legContactShadow = createSvgElement('ellipse', {
    cx: String(MODEL_GEOMETRY.centerX),
    cy: String(hemY),
    rx: isPants ? '110' : '155',
    ry: '7',
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
  const isMale = (designState?.figure === 'male' || designState?.croquis === 'male');
  const gender = isMale ? 'male' : 'female';
  const LM = getBodyLandmarks(size, gender);

  const top = designState?.top || 'basic';
  const bottom = designState?.bottom || 'skirt';
  const sleevesStyle = designState?.sleeves || 'short';
  const collar = designState?.collar || 'round';

  const isPants = (bottom === 'trousers' || bottom === 'wide');
  const flatHeight = isPants ? 1000 : 660;

  // Frame focused tightly on the garment silhouette
  containerSvg.setAttribute('viewBox', `215 270 340 ${flatHeight}`);
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

  let bodicePathD;
  if (top === 'crop') bodicePathD = isBack ? getRelaxedBodiceBackPath(LM, isMale, collar) : getRelaxedBodiceFrontPath(LM, isMale, collar);
  else if (top === 'wrap') bodicePathD = isBack ? getWrapTopBackPath(LM, collar) : getWrapTopFrontPath(LM, collar);
  else if (top === 'peplum') bodicePathD = isBack ? getPeplumBackPath(LM, collar) : getPeplumFrontPath(LM, collar);
  else bodicePathD = isBack ? getBodiceBackPath(LM, collar) : getBodiceFrontPath(LM, collar);

  const bottomPathD = getBottomPath(bottom, isBack, LM, isMale);

  let leftSleeveD, rightSleeveD;
  if (sleevesStyle === 'long') {
    leftSleeveD  = getLeftLongSleevePath(isBack, LM, isMale);
    rightSleeveD = getRightLongSleevePath(isBack, LM, isMale);
  } else if (sleevesStyle === 'flare') {
    leftSleeveD  = getLeftFlareSleevePath(isBack, LM, isMale);
    rightSleeveD = getRightFlareSleevePath(isBack, LM, isMale);
  } else {
    leftSleeveD  = getLeftSleevePath(isBack, LM);
    rightSleeveD = getRightSleevePath(isBack, LM);
  }

  const neckD = getNecklineBindingPath(isBack, LM, collar, isMale);

  const bottomPath = createSvgElement('path', { d: bottomPathD });
  const bodicePath = createSvgElement('path', { d: bodicePathD });
  const leftSleeve = createSvgElement('path', { d: leftSleeveD });
  const rightSleeve = createSvgElement('path', { d: rightSleeveD });
  const neckBinding = createSvgElement('path', { d: neckD, fill: '#f6f4f2' });

  // Lower garment first, then bodice (or shirt), then sleeves, then neckline
  g.appendChild(bottomPath);
  g.appendChild(bodicePath);

  if (top === 'peplum') {
    const peplumFlat = createSvgElement('path', { d: isBack ? getPeplumFlareBackPath(LM) : getPeplumFlareFrontPath(LM) });
    g.appendChild(peplumFlat);
  }

  g.appendChild(leftSleeve);
  g.appendChild(rightSleeve);
  g.appendChild(neckBinding);

  // Construction lines
  const details = createSvgElement('g', {
    fill: 'none',
    stroke: '#1e1c1b',
    'stroke-width': '1.0'
  });
  const lines = getConstructionLines(isBack ? 'back' : 'front', LM, designState);

  // Structural seam lines
  [
    lines.leftArmscye, lines.rightArmscye,
    lines.leftPrincessSeam, lines.rightPrincessSeam,
    lines.shirtPlacketLeft, lines.shirtPlacketRight,
    lines.chestPocket, lines.wrapCrossover,
    lines.frontFlyPlacket, lines.trouserCreaseLeft, lines.trouserCreaseRight,
    lines.trouserBackRise, lines.trouserPocketLeft, lines.trouserPocketRight,
    lines.shirtYoke, lines.shirtPleatLeft, lines.shirtPleatRight,
    lines.centerBackZipper, lines.leftBackDart, lines.rightBackDart,
    lines.walkingVent
  ].forEach(d => {
    if (d) details.appendChild(createSvgElement('path', { d }));
  });

  if (lines.skirtFlutes && Array.isArray(lines.skirtFlutes)) {
    lines.skirtFlutes.forEach(d => {
      details.appendChild(createSvgElement('path', { d, opacity: '0.4' }));
    });
  }

  // Dashed topstitching lines
  [
    lines.hemStitch, lines.hemStitchLeft, lines.hemStitchRight,
    lines.sleeveLeftStitch, lines.sleeveRightStitch,
    lines.shirtPlacketCenter
  ].forEach(d => {
    if (d) details.appendChild(createSvgElement('path', { d, 'stroke-dasharray': '4,3', opacity: '0.8' }));
  });

  if (lines.shirtButtons) {
    lines.shirtButtons.forEach(btn => {
      details.appendChild(createSvgElement('circle', {
        cx: String(btn.x),
        cy: String(btn.y),
        r: '3.0',
        fill: '#1e1c1b'
      }));
    });
  }

  if (isBack && lines.centerBackZipper) {
    details.appendChild(createSvgElement('rect', {
      x: String(LM.bust.center.x - 3),
      y: String(LM.neck.backCervicaleDip.y + 4),
      width: '6',
      height: '11',
      rx: '2',
      fill: '#1e1c1b'
    }));
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
