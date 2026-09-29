/**
 * FashionForge — Design Studio Application Controller
 *
 * Implements the reference-driven studio workflow, single source of truth designState,
 * view toggling, zoom engine, dual technical flats, and live inspector intelligence.
 */

import {
  renderDesign,
  renderTechnicalFlat,
  renderTechnicalFlatPair
} from './renderer/renderer.js';

import { GARMENT_CATALOG } from './renderer/garment-data.js';

// Centralized Application State (Single Source of Truth)
export const designState = {
  styleId: 'FF-2026-001',
  name: 'Aria Fitted Ensemble',
  version: '1.0',
  view: 'front',           // 'front' | 'back'
  figure: 'female',
  croquis: 'female',
  figureVisible: true,
  detailsVisible: true,
  zoom: 100,
  activeMode: 'design',     // 'design' | 'technical-flat' | 'tech-pack' | 'settings'

  // Garment Components
  top: 'basic',
  bottom: 'skirt',
  sleeves: 'short',
  collar: 'round',

  // Appearance & Materials
  colour: '#b96b61',
  fabric: 'cotton',
  pattern: 'solid',

  // Pricing & Metadata
  pricing: 1480,
  notes: 'Fitted bodice with natural waist connection and structured A-line drape.'
};

/**
 * Calculates total estimated price based on active selections
 */
export function calculatePrice(state) {
  const topPrice = GARMENT_CATALOG.tops[state.top]?.price || 450;
  const bottomPrice = GARMENT_CATALOG.bottoms[state.bottom]?.price || 550;
  const sleevesPrice = GARMENT_CATALOG.sleeves[state.sleeves]?.price || 150;
  const collarPrice = GARMENT_CATALOG.collars[state.collar]?.price || 80;
  const fabricPrice = GARMENT_CATALOG.fabrics[state.fabric]?.price || 250;
  const patternPrice = GARMENT_CATALOG.patterns[state.pattern]?.price || 0;

  return topPrice + bottomPrice + sleevesPrice + collarPrice + fabricPrice + patternPrice;
}

/**
 * Deterministic Style Recommendation matching reference fashion intelligence
 */
export function getRecommendation(state) {
  if (state.fabric === 'cotton' && state.top === 'basic' && state.bottom === 'skirt') {
    return 'A classic and versatile design that works well for both casual and semi-formal occasions. The A-line skirt flatters most body types and offers comfortable movement.';
  }
  if (state.fabric === 'silk') {
    return 'Mulberry Silk adds fluid grace and lustrous depth to the structured silhouette. Ideal for evening events and refined formal bespoke tailoring.';
  }
  if (state.fabric === 'denim') {
    return 'Structured Denim emphasizes architectural seams and topstitching. Excellent for modern casual bespoke tailoring.';
  }
  if (state.fabric === 'linen') {
    return 'Natural Linen offers breathable texture and relaxed sophistication with classic, airy summer drape.';
  }

  return 'A classic and versatile design that works well for both casual and semi-formal occasions. The A-line skirt flatters most body types and offers comfortable movement.';
}

/**
 * Updates UI Information Panels: chips, specifications, price, recommendation
 */
function updateInformationPanels(state) {
  const topName = GARMENT_CATALOG.tops[state.top]?.name || 'Fitted Bodice';
  const bottomName = GARMENT_CATALOG.bottoms[state.bottom]?.name || 'A-Line Skirt';
  const sleevesName = GARMENT_CATALOG.sleeves[state.sleeves]?.name || 'Set-In Short Sleeve';
  const collarName = GARMENT_CATALOG.collars[state.collar]?.name || 'Round Jewel Neckline';
  const fabricName = GARMENT_CATALOG.fabrics[state.fabric]?.name || 'Organic Cotton';
  const patternName = GARMENT_CATALOG.patterns[state.pattern]?.name || 'Solid Colour';

  // 1. Bottom Workspace Chips
  const chipTop = document.querySelector('#chip-top');
  const chipBottom = document.querySelector('#chip-bottom');
  const chipSleeves = document.querySelector('#chip-sleeves');
  const chipCollar = document.querySelector('#chip-collar');

  if (chipTop) chipTop.textContent = `Top: ${topName}`;
  if (chipBottom) chipBottom.textContent = `Bottom: ${bottomName}`;
  if (chipSleeves) chipSleeves.textContent = `Sleeves: ${sleevesName}`;
  if (chipCollar) chipCollar.textContent = `Neckline: ${collarName}`;

  // 2. Garment Specifications Table
  const specTop = document.querySelector('#spec-top');
  const specBottom = document.querySelector('#spec-bottom');
  const specSleeves = document.querySelector('#spec-sleeves');
  const specCollar = document.querySelector('#spec-collar');
  const specFabric = document.querySelector('#spec-fabric');
  const specPattern = document.querySelector('#spec-pattern');

  if (specTop) specTop.textContent = topName;
  if (specBottom) specBottom.textContent = bottomName;
  if (specSleeves) specSleeves.textContent = sleevesName;
  if (specCollar) specCollar.textContent = collarName;
  if (specFabric) specFabric.textContent = fabricName;
  if (specPattern) specPattern.textContent = patternName;

  // 3. Style Recommendation
  const recText = document.querySelector('#recommendation-text');
  if (recText) {
    recText.textContent = getRecommendation(state);
  }

  // 4. Estimated Price
  const priceDisplay = document.querySelector('#price-display');
  if (priceDisplay) {
    const total = calculatePrice(state);
    priceDisplay.textContent = `₹${total.toLocaleString('en-IN')}`;
  }

  // 5. Update Color, Fabric, and Pattern Swatch Preview Indicators
  const colourDot = document.querySelector('#colour-swatch-dot');
  if (colourDot) {
    colourDot.style.backgroundColor = state.colour;
  }

  const fabricDot = document.querySelector('#fabric-swatch-dot');
  if (fabricDot) {
    if (state.fabric === 'cotton') {
      fabricDot.style.background = 'radial-gradient(circle at 35% 35%, #f6e6de 10%, #ba6b62 80%)';
    } else if (state.fabric === 'silk') {
      fabricDot.style.background = 'radial-gradient(circle at 35% 35%, #ffffff 15%, #b96b61 75%)';
    } else if (state.fabric === 'denim') {
      fabricDot.style.background = 'repeating-linear-gradient(45deg, #486178, #486178 2px, #304354 2px, #304354 5px)';
    } else if (state.fabric === 'linen') {
      fabricDot.style.background = 'radial-gradient(circle at 35% 35%, #f2eae2 15%, #bfa897 80%)';
    }
  }

  const patternDot = document.querySelector('#pattern-swatch-dot');
  if (patternDot) {
    if (state.pattern === 'solid') {
      patternDot.style.background = state.colour;
    } else if (state.pattern === 'stripes') {
      patternDot.style.background = `repeating-linear-gradient(90deg, ${state.colour}, ${state.colour} 2px, #ffffff 2px, #ffffff 5px)`;
    } else if (state.pattern === 'checks') {
      patternDot.style.background = `repeating-conic-gradient(${state.colour} 0% 25%, #ffffff 0% 50%) 50% / 8px 8px`;
    } else if (state.pattern === 'dots') {
      patternDot.style.background = `radial-gradient(circle, ${state.colour} 35%, #ffffff 40%) 0 0 / 6px 6px`;
    }
  }
}

/**
 * Applies Zoom to the Workspace Preview
 */
export function setZoom(zoomValue) {
  designState.zoom = Math.min(200, Math.max(50, zoomValue));
  const preview = document.querySelector('#costume-preview');
  const zoomText = document.querySelector('#zoom-indicator');
  const zoomSlider = document.querySelector('#zoom-slider');

  if (preview) {
    const scale = designState.zoom / 100;
    preview.style.transform = `scale(${scale})`;
    preview.style.transformOrigin = 'center top';
  }

  if (zoomText) {
    zoomText.textContent = `${Math.round(designState.zoom)}%`;
  }

  if (zoomSlider && Number(zoomSlider.value) !== Math.round(designState.zoom)) {
    zoomSlider.value = String(Math.round(designState.zoom));
  }
}

/**
 * Triggers the Complete Rendering Pipeline
 */
export function updatePreview() {
  const previewSvg = document.querySelector('#costume-preview');
  if (previewSvg) {
    renderDesign(designState, previewSvg);
  }

  // Render Front and Back Technical Flats side-by-side in information panel
  const flatFront = document.querySelector('#tech-flat-front-svg');
  const flatBack = document.querySelector('#tech-flat-back-svg');
  if (flatFront && flatBack) {
    renderTechnicalFlatPair(flatFront, flatBack, designState);
  }

  updateInformationPanels(designState);
}

/**
 * View Switcher: Front View / Back View
 */
export function setView(viewName) {
  if (viewName !== 'front' && viewName !== 'back') return;
  designState.view = viewName;

  const btnFront = document.querySelector('#btn-view-front');
  const btnBack = document.querySelector('#btn-view-back');

  if (btnFront && btnBack) {
    if (viewName === 'front') {
      btnFront.classList.add('is-active');
      btnFront.setAttribute('aria-pressed', 'true');
      btnBack.classList.remove('is-active');
      btnBack.setAttribute('aria-pressed', 'false');
    } else {
      btnBack.classList.add('is-active');
      btnBack.setAttribute('aria-pressed', 'true');
      btnFront.classList.remove('is-active');
      btnFront.setAttribute('aria-pressed', 'false');
    }
  }

  updatePreview();
}

/**
 * Left Rail Mode Switcher
 */
export function setStudioMode(mode) {
  designState.activeMode = mode;
  document.querySelectorAll('.rail-item').forEach(item => {
    item.classList.toggle('is-active', item.dataset.mode === mode);
  });

  const workspace2D = document.querySelector('#workspace-2d');
  const workspaceFlat = document.querySelector('#workspace-technical-flat');

  if (mode === 'technical-flat') {
    if (workspace2D) workspace2D.style.display = 'none';
    if (workspaceFlat) {
      workspaceFlat.style.display = 'flex';
      const mainFlatSvg = document.querySelector('#main-flat-svg');
      if (mainFlatSvg) renderTechnicalFlat(designState, mainFlatSvg);
    }
  } else {
    if (workspace2D) workspace2D.style.display = 'flex';
    if (workspaceFlat) workspaceFlat.style.display = 'none';
    updatePreview();
  }
}

/**
 * Handles Form Selection Changes
 */
function handleSelectionChange(event) {
  const { name, value } = event.target;
  if (name === 'collar') {
    designState.collar = value;
  } else if (name === 'croquis' || name === 'figure') {
    designState.figure = value;
    designState.croquis = value;
  } else if (name in designState) {
    designState[name] = value;
  }

  updatePreview();
}

/**
 * Application Bootstrap
 */
document.addEventListener('DOMContentLoaded', () => {
  const controlsForm = document.querySelector('#design-controls');
  if (controlsForm) {
    const formElements = controlsForm.elements;

    if (formElements.top) {
      formElements.top.value = designState.top;
      formElements.top.addEventListener('change', handleSelectionChange);
    }
    if (formElements.bottom) {
      formElements.bottom.value = designState.bottom;
      formElements.bottom.addEventListener('change', handleSelectionChange);
    }
    if (formElements.sleeves) {
      formElements.sleeves.value = designState.sleeves;
      formElements.sleeves.addEventListener('change', handleSelectionChange);
    }
    if (formElements.collar) {
      formElements.collar.value = designState.collar;
      formElements.collar.addEventListener('change', handleSelectionChange);
    }
    if (formElements.colour) {
      formElements.colour.value = designState.colour;
      formElements.colour.addEventListener('change', handleSelectionChange);
    }
    if (formElements.fabric) {
      formElements.fabric.value = designState.fabric;
      formElements.fabric.addEventListener('change', handleSelectionChange);
    }
    if (formElements.pattern) {
      formElements.pattern.value = designState.pattern;
      formElements.pattern.addEventListener('change', handleSelectionChange);
    }
    if (formElements.croquis) {
      formElements.croquis.value = designState.figure || designState.croquis || 'female';
      formElements.croquis.addEventListener('change', handleSelectionChange);
    }
  }

  // View Switchers
  const btnFront = document.querySelector('#btn-view-front');
  const btnBack = document.querySelector('#btn-view-back');
  if (btnFront) btnFront.addEventListener('click', () => setView('front'));
  if (btnBack) btnBack.addEventListener('click', () => setView('back'));

  // Figure Visibility Toggle
  const btnToggleFigure = document.querySelector('#btn-toggle-figure');
  if (btnToggleFigure) {
    btnToggleFigure.addEventListener('click', () => {
      designState.figureVisible = !designState.figureVisible;
      btnToggleFigure.classList.toggle('is-toggled-off', !designState.figureVisible);
      btnToggleFigure.setAttribute('title', designState.figureVisible ? 'Hide Figure' : 'Show Figure');
      updatePreview();
    });
  }

  // Garment Details Visibility Toggle
  const btnToggleDetails = document.querySelector('#btn-toggle-details');
  if (btnToggleDetails) {
    btnToggleDetails.addEventListener('click', () => {
      designState.detailsVisible = !designState.detailsVisible;
      btnToggleDetails.classList.toggle('is-toggled-off', !designState.detailsVisible);
      btnToggleDetails.setAttribute('title', designState.detailsVisible ? 'Hide Garment' : 'Show Garment');
      updatePreview();
    });
  }

  // Fullscreen Toggle
  const btnFullscreen = document.querySelector('#btn-fullscreen');
  const canvasCard = document.querySelector('#canvas-card');
  if (btnFullscreen && canvasCard) {
    btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        canvasCard.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    });
  }

  // Zoom Controls
  const zoomSlider = document.querySelector('#zoom-slider');
  if (zoomSlider) {
    zoomSlider.addEventListener('input', (e) => setZoom(Number(e.target.value)));
  }

  const btnZoomOut = document.querySelector('#btn-zoom-out');
  const btnZoomPlus = document.querySelector('#btn-zoom-plus');
  const btnZoomReset = document.querySelector('#btn-zoom-reset');

  if (btnZoomOut) btnZoomOut.addEventListener('click', () => setZoom(designState.zoom - 10));
  if (btnZoomPlus) btnZoomPlus.addEventListener('click', () => setZoom(designState.zoom + 10));
  if (btnZoomReset) btnZoomReset.addEventListener('click', () => setZoom(100));

  // Left Navigation Rail Items
  document.querySelectorAll('.rail-item').forEach(item => {
    item.addEventListener('click', () => {
      setStudioMode(item.dataset.mode);
    });
  });

  // Action Buttons
  const btnSave = document.querySelector('#btn-save-design');
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      alert(`Design "${designState.name}" (Version ${designState.version}) saved to local workspace.`);
    });
  }

  const btnCart = document.querySelector('#btn-add-cart');
  if (btnCart) {
    btnCart.addEventListener('click', () => {
      const price = calculatePrice(designState);
      alert(`Added "${designState.name}" to cart (₹${price.toLocaleString('en-IN')}).`);
    });
  }

  // Initial Render
  updatePreview();
});