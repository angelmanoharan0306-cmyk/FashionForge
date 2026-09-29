/**
 * FashionForge — Haute Couture Design Studio Controller
 *
 * Implements the centralized state architecture, undo/redo history,
 * visual component card selectors, material swatches, mode switching,
 * real-time pricing & specifications sync, and export/save capabilities.
 */

import {
  renderDesign,
  renderTechnicalFlat,
  renderTechnicalFlatPair
} from './renderer/renderer.js';

import { GARMENT_CATALOG } from './renderer/garment-data.js';

/* ==========================================================================
   1. CENTRALIZED APPLICATION STATE (SINGLE SOURCE OF TRUTH)
   ========================================================================== */

export const designState = {
  styleId: 'FF-2026-001',
  name: 'Aria Fitted Ensemble',
  version: '1.0',
  view: 'front',              // 'front' | 'back'
  figure: 'female',           // 'female' | 'male'
  croquis: 'female',
  figureVisible: true,
  garmentVisible: true,
  detailsVisible: true,
  zoom: 100,
  activeMode: 'design',        // 'design' | 'technical-flat' | 'tech-pack'

  // Garment Components
  top: 'basic',               // 'basic' | 'crop' | 'tunic'
  bottom: 'skirt',            // 'skirt' | 'trousers' | 'wide'
  sleeves: 'short',           // 'short' | 'long' | 'flare'
  collar: 'round',            // 'round' | 'vneck' | 'square'

  // Appearance & Materials
  colour: '#b96b61',
  fabric: 'cotton',           // 'cotton' | 'silk' | 'denim' | 'linen'
  pattern: 'solid',           // 'solid' | 'stripes' | 'checks' | 'dots'

  // Metadata & Commercial Pricing
  pricing: 1480,
  notes: 'Fitted bodice with natural waist connection and structured A-line drape.'
};

/* ==========================================================================
   2. UNDO / REDO HISTORY STACK ARCHITECTURE
   ========================================================================== */

const undoStack = [];
const redoStack = [];
const MAX_HISTORY = 30;

/**
 * Pushes a snapshot of current design configuration onto undo stack
 */
function pushStateSnapshot() {
  const snapshot = {
    top: designState.top,
    bottom: designState.bottom,
    sleeves: designState.sleeves,
    collar: designState.collar,
    colour: designState.colour,
    fabric: designState.fabric,
    pattern: designState.pattern,
    figure: designState.figure,
    name: designState.name,
    notes: designState.notes
  };

  undoStack.push(snapshot);
  if (undoStack.length > MAX_HISTORY) undoStack.shift();
  redoStack.length = 0; // Clear redo on fresh action
  updateUndoRedoButtons();
}

/**
 * Reverts to previous design snapshot
 */
export function undo() {
  if (undoStack.length === 0) return;

  const currentSnapshot = {
    top: designState.top,
    bottom: designState.bottom,
    sleeves: designState.sleeves,
    collar: designState.collar,
    colour: designState.colour,
    fabric: designState.fabric,
    pattern: designState.pattern,
    figure: designState.figure,
    name: designState.name,
    notes: designState.notes
  };
  redoStack.push(currentSnapshot);

  const previousSnapshot = undoStack.pop();
  Object.assign(designState, previousSnapshot);

  syncUIFromState();
  updatePreview();
  updateUndoRedoButtons();
  showToast('Undo applied');
}

/**
 * Re-applies undone design snapshot
 */
export function redo() {
  if (redoStack.length === 0) return;

  const currentSnapshot = {
    top: designState.top,
    bottom: designState.bottom,
    sleeves: designState.sleeves,
    collar: designState.collar,
    colour: designState.colour,
    fabric: designState.fabric,
    pattern: designState.pattern,
    figure: designState.figure,
    name: designState.name,
    notes: designState.notes
  };
  undoStack.push(currentSnapshot);

  const nextSnapshot = redoStack.pop();
  Object.assign(designState, nextSnapshot);

  syncUIFromState();
  updatePreview();
  updateUndoRedoButtons();
  showToast('Redo applied');
}

/**
 * Updates disabled state on Undo/Redo header buttons
 */
function updateUndoRedoButtons() {
  const btnUndo = document.querySelector('#btn-undo');
  const btnRedo = document.querySelector('#btn-redo');
  if (btnUndo) btnUndo.disabled = (undoStack.length === 0);
  if (btnRedo) btnRedo.disabled = (redoStack.length === 0);
}

/**
 * Resets design to default ensemble
 */
export function resetDesign() {
  pushStateSnapshot();

  designState.top = 'basic';
  designState.bottom = 'skirt';
  designState.sleeves = 'short';
  designState.collar = 'round';
  designState.colour = '#b96b61';
  designState.fabric = 'cotton';
  designState.pattern = 'solid';
  designState.view = 'front';
  designState.zoom = 100;
  designState.figureVisible = true;
  designState.detailsVisible = true;

  syncUIFromState();
  updatePreview();
  showToast('Reset to default ensemble');
}

/* ==========================================================================
   3. PRICING & RECOMMENDATION ENGINE
   ========================================================================== */

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

/* ==========================================================================
   4. UI SYNCHRONIZATION FROM STATE
   ========================================================================== */

/**
 * Synchronizes all UI selectors, chips, specs, recommendations, and pricing
 */
export function syncUIFromState() {
  const state = designState;

  const topName = GARMENT_CATALOG.tops[state.top]?.name || 'Fitted Bodice';
  const bottomName = GARMENT_CATALOG.bottoms[state.bottom]?.name || 'A-Line Skirt';
  const sleevesName = GARMENT_CATALOG.sleeves[state.sleeves]?.name || 'Set-In Short Sleeve';
  const collarName = GARMENT_CATALOG.collars[state.collar]?.name || 'Round Jewel Neckline';
  const fabricName = GARMENT_CATALOG.fabrics[state.fabric]?.name || 'Organic Cotton';
  const patternName = GARMENT_CATALOG.patterns[state.pattern]?.name || 'Solid Colour';

  // 1. Header Design Identity
  const headerName = document.querySelector('#header-design-name');
  if (headerName && headerName.textContent.trim() !== state.name) {
    headerName.textContent = state.name;
  }
  const headerStyleId = document.querySelector('#header-style-id');
  if (headerStyleId) headerStyleId.textContent = state.styleId;

  // 2. Control Value Labels
  const valTop = document.querySelector('#val-top');
  const valBottom = document.querySelector('#val-bottom');
  const valSleeves = document.querySelector('#val-sleeves');
  const valCollar = document.querySelector('#val-collar');
  const valColour = document.querySelector('#val-colour');
  const valFabric = document.querySelector('#val-fabric');
  const valPattern = document.querySelector('#val-pattern');

  if (valTop) valTop.textContent = topName;
  if (valBottom) valBottom.textContent = bottomName;
  if (valSleeves) valSleeves.textContent = sleevesName;
  if (valCollar) valCollar.textContent = collarName;
  if (valFabric) valFabric.textContent = fabricName;
  if (valPattern) valPattern.textContent = patternName;

  // 3. Highlight Selected Component Cards
  document.querySelectorAll('.component-card[data-component-group]').forEach(card => {
    const group = card.dataset.componentGroup;
    const value = card.dataset.value;
    const isSelected = (state[group] === value);
    card.classList.toggle('is-selected', isSelected);
    card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
  });

  // 4. Highlight Selected Colour Swatch
  document.querySelectorAll('.swatch-button[data-color]').forEach(btn => {
    const isSelected = (btn.dataset.color.toLowerCase() === state.colour.toLowerCase());
    btn.classList.toggle('is-selected', isSelected);
    btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    if (isSelected && valColour) valColour.textContent = btn.dataset.name || state.colour;
  });

  // 5. Highlight Selected Fabric Card
  document.querySelectorAll('.fabric-card[data-fabric]').forEach(card => {
    const isSelected = (card.dataset.fabric === state.fabric);
    card.classList.toggle('is-selected', isSelected);
    card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
  });

  // 6. Highlight Selected Pattern Card & Update Dynamic Pattern Previews
  document.querySelectorAll('.pattern-card[data-pattern]').forEach(card => {
    const isSelected = (card.dataset.pattern === state.pattern);
    card.classList.toggle('is-selected', isSelected);
    card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
  });

  // Update Pattern Preview Boxes with current color
  const pSolid = document.querySelector('#pattern-preview-solid');
  const pStripes = document.querySelector('#pattern-preview-stripes');
  const pChecks = document.querySelector('#pattern-preview-checks');
  const pDots = document.querySelector('#pattern-preview-dots');
  if (pSolid) pSolid.style.backgroundColor = state.colour;
  if (pStripes) pStripes.style.background = `repeating-linear-gradient(90deg, ${state.colour}, ${state.colour} 2px, #ffffff 2px, #ffffff 5px)`;
  if (pChecks) pChecks.style.background = `repeating-conic-gradient(${state.colour} 0% 25%, #ffffff 0% 50%) 50% / 8px 8px`;
  if (pDots) pDots.style.background = `radial-gradient(circle, ${state.colour} 35%, #ffffff 40%) 0 0 / 6px 6px`;

  // 7. Workspace Bottom Component Chips
  const chipTop = document.querySelector('#chip-top');
  const chipBottom = document.querySelector('#chip-bottom');
  const chipSleeves = document.querySelector('#chip-sleeves');
  const chipCollar = document.querySelector('#chip-collar');
  if (chipTop) chipTop.textContent = `Top: ${topName}`;
  if (chipBottom) chipBottom.textContent = `Bottom: ${bottomName}`;
  if (chipSleeves) chipSleeves.textContent = `Sleeves: ${sleevesName}`;
  if (chipCollar) chipCollar.textContent = `Neckline: ${collarName}`;

  // 8. Inspector Garment Specifications Table
  const specTop = document.querySelector('#spec-top');
  const specBottom = document.querySelector('#spec-bottom');
  const specSleeves = document.querySelector('#spec-sleeves');
  const specCollar = document.querySelector('#spec-collar');
  const specFabric = document.querySelector('#spec-fabric');
  const specColour = document.querySelector('#spec-colour');
  const specPattern = document.querySelector('#spec-pattern');

  if (specTop) specTop.textContent = topName;
  if (specBottom) specBottom.textContent = bottomName;
  if (specSleeves) specSleeves.textContent = sleevesName;
  if (specCollar) specCollar.textContent = collarName;
  if (specFabric) specFabric.textContent = fabricName;
  if (specColour) {
    const swatchName = valColour ? valColour.textContent : 'Rose Clay';
    specColour.textContent = swatchName;
  }
  if (specPattern) specPattern.textContent = patternName;

  // 9. Style Recommendation
  const recText = document.querySelector('#recommendation-text');
  if (recText) recText.textContent = getRecommendation(state);

  // 10. Estimated Price
  const priceDisplay = document.querySelector('#price-display');
  const total = calculatePrice(state);
  state.pricing = total;
  if (priceDisplay) {
    priceDisplay.textContent = `₹${total.toLocaleString('en-IN')}`;
  }

  // 11. Notes Textarea
  const notesArea = document.querySelector('#designer-notes-input');
  if (notesArea && notesArea.value !== state.notes) {
    notesArea.value = state.notes;
  }

  // 12. Tech Pack Sheet Synchronizer
  const tpName = document.querySelector('#tp-design-name');
  const tpStyleId = document.querySelector('#tp-style-id');
  const tpFabric = document.querySelector('#tp-bom-fabric');
  const tpColor = document.querySelector('#tp-bom-color');
  const tpFabricCost = document.querySelector('#tp-bom-fabric-cost');

  if (tpName) tpName.textContent = state.name;
  if (tpStyleId) tpStyleId.textContent = `Style ID: ${state.styleId} | Season: Bespoke SS26`;
  if (tpFabric) tpFabric.textContent = fabricName;
  if (tpColor) tpColor.textContent = `${valColour ? valColour.textContent : 'Rose Clay'} (${state.colour})`;
  if (tpFabricCost) tpFabricCost.textContent = `₹${GARMENT_CATALOG.fabrics[state.fabric]?.price || 250}`;

  // 13. Zoom Indicator & Slider
  const zoomText = document.querySelector('#zoom-indicator');
  const zoomSlider = document.querySelector('#zoom-slider');
  if (zoomText) zoomText.textContent = `${Math.round(state.zoom)}%`;
  if (zoomSlider && Number(zoomSlider.value) !== Math.round(state.zoom)) {
    zoomSlider.value = String(Math.round(state.zoom));
  }

  // 14. Visibility States
  const btnToggleFigure = document.querySelector('#btn-toggle-figure');
  if (btnToggleFigure) {
    btnToggleFigure.classList.toggle('is-toggled-off', !state.figureVisible);
  }
  const btnToggleDetails = document.querySelector('#btn-toggle-details');
  if (btnToggleDetails) {
    btnToggleDetails.classList.toggle('is-toggled-off', !state.detailsVisible);
  }
}

/* ==========================================================================
   5. RENDERING PIPELINE CONTROLLER
   ========================================================================== */

/**
 * Triggers full 2.5D, vector technical flat, and UI synchronizer
 */
export function updatePreview() {
  const previewSvg = document.querySelector('#costume-preview');
  if (previewSvg) {
    renderDesign(designState, previewSvg);
  }

  // Dual side-by-side technical sketch in inspector
  const flatFront = document.querySelector('#tech-flat-front-svg');
  const flatBack = document.querySelector('#tech-flat-back-svg');
  if (flatFront && flatBack) {
    renderTechnicalFlatPair(flatFront, flatBack, designState);
  }

  // Full-scale CAD canvas if active
  const mainFlatSvg = document.querySelector('#main-flat-svg');
  if (mainFlatSvg && designState.activeMode === 'technical-flat') {
    renderTechnicalFlat(designState, mainFlatSvg);
  }

  syncUIFromState();
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
    const isFront = (viewName === 'front');
    btnFront.classList.toggle('is-active', isFront);
    btnFront.setAttribute('aria-pressed', isFront ? 'true' : 'false');
    btnBack.classList.toggle('is-active', !isFront);
    btnBack.setAttribute('aria-pressed', !isFront ? 'true' : 'false');
  }

  updatePreview();
}

/**
 * Workspace Mode Switcher (Design Studio / Technical Flat CAD / Tech Pack)
 */
export function setStudioMode(mode) {
  designState.activeMode = mode;

  // Header Segmented Pills
  document.querySelectorAll('[data-mode]').forEach(el => {
    const isActive = (el.dataset.mode === mode);
    el.classList.toggle('is-active', isActive);
    if (el.getAttribute('role') === 'tab') {
      el.setAttribute('aria-selected', isActive ? 'true' : 'false');
    }
  });

  const workspace2D = document.querySelector('#workspace-2d');
  const workspaceFlat = document.querySelector('#workspace-technical-flat');
  const workspaceTechPack = document.querySelector('#workspace-tech-pack');

  if (workspace2D) workspace2D.style.display = (mode === 'design') ? 'flex' : 'none';
  if (workspaceFlat) workspaceFlat.style.display = (mode === 'technical-flat') ? 'flex' : 'none';
  if (workspaceTechPack) workspaceTechPack.style.display = (mode === 'tech-pack') ? 'block' : 'none';

  if (mode === 'technical-flat') {
    const mainFlatSvg = document.querySelector('#main-flat-svg');
    if (mainFlatSvg) renderTechnicalFlat(designState, mainFlatSvg);
  }

  updatePreview();
}

/**
 * Zoom Engine
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

  if (zoomText) zoomText.textContent = `${Math.round(designState.zoom)}%`;
  if (zoomSlider && Number(zoomSlider.value) !== Math.round(designState.zoom)) {
    zoomSlider.value = String(Math.round(designState.zoom));
  }
}

/* ==========================================================================
   6. TOAST & MODAL SYSTEM
   ========================================================================== */

export function showToast(message) {
  const container = document.querySelector('#toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'studio-toast';
  toast.innerHTML = `
    <svg class="toast-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 200ms ease';
    setTimeout(() => toast.remove(), 250);
  }, 2800);
}

/**
 * Saves design to localStorage
 */
export function saveDesignToStorage() {
  try {
    const savedDesigns = JSON.parse(localStorage.getItem('fashionforge_saved_designs') || '[]');
    const newEntry = {
      ...designState,
      savedAt: new Date().toISOString()
    };
    savedDesigns.unshift(newEntry);
    localStorage.setItem('fashionforge_saved_designs', JSON.stringify(savedDesigns.slice(0, 20)));
    showToast(`Design "${designState.name}" saved to atelier workspace`);
  } catch (err) {
    showToast('Design saved to session');
  }
}

/**
 * Downloads the current technical flat as a standalone SVG file
 */
export function downloadTechnicalFlatSvg() {
  const svg = document.querySelector('#tech-flat-front-svg');
  if (!svg) return;

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${designState.name.replace(/\s+/g, '-').toLowerCase()}-cad-flat.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Vector CAD Flat downloaded');
}

/* ==========================================================================
   7. EVENT WIRING & APPLICATION BOOTSTRAP
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Garment Component Card Handlers
  document.querySelectorAll('.component-card[data-component-group]').forEach(card => {
    card.addEventListener('click', () => {
      if (card.disabled) return;
      pushStateSnapshot();
      const group = card.dataset.componentGroup;
      const value = card.dataset.value;
      designState[group] = value;
      updatePreview();
    });
  });

  // 2. Palette Swatch Handlers (Colour)
  document.querySelectorAll('.swatch-button[data-color]').forEach(btn => {
    btn.addEventListener('click', () => {
      pushStateSnapshot();
      designState.colour = btn.dataset.color;
      updatePreview();
    });
  });

  // 3. Fabric Weave Selector Handlers
  document.querySelectorAll('.fabric-card[data-fabric]').forEach(card => {
    card.addEventListener('click', () => {
      pushStateSnapshot();
      designState.fabric = card.dataset.fabric;
      updatePreview();
    });
  });

  // 4. Surface Pattern Selector Handlers
  document.querySelectorAll('.pattern-card[data-pattern]').forEach(card => {
    card.addEventListener('click', () => {
      pushStateSnapshot();
      designState.pattern = card.dataset.pattern;
      updatePreview();
    });
  });

  // 5. Front / Back View Switchers
  const btnFront = document.querySelector('#btn-view-front');
  const btnBack = document.querySelector('#btn-view-back');
  if (btnFront) btnFront.addEventListener('click', () => setView('front'));
  if (btnBack) btnBack.addEventListener('click', () => setView('back'));

  // 6. Figure Visibility Toggle
  const btnToggleFigure = document.querySelector('#btn-toggle-figure');
  if (btnToggleFigure) {
    btnToggleFigure.addEventListener('click', () => {
      designState.figureVisible = !designState.figureVisible;
      updatePreview();
      showToast(designState.figureVisible ? 'Figure visible' : 'Figure hidden');
    });
  }

  // 7. Garment Details Toggle
  const btnToggleDetails = document.querySelector('#btn-toggle-details');
  if (btnToggleDetails) {
    btnToggleDetails.addEventListener('click', () => {
      designState.detailsVisible = !designState.detailsVisible;
      updatePreview();
      showToast(designState.detailsVisible ? 'Construction lines visible' : 'Construction lines hidden');
    });
  }

  // 8. Fullscreen Canvas
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

  // 9. Zoom Controls
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

  // 10. Workspace Mode Switchers (Header & Rail)
  document.querySelectorAll('[data-mode]').forEach(el => {
    el.addEventListener('click', () => setStudioMode(el.dataset.mode));
  });

  const btnOpenCad = document.querySelector('#btn-open-cad-flat');
  if (btnOpenCad) {
    btnOpenCad.addEventListener('click', () => setStudioMode('technical-flat'));
  }

  const btnFlatReturn = document.querySelector('#btn-flat-return');
  if (btnFlatReturn) {
    btnFlatReturn.addEventListener('click', () => setStudioMode('design'));
  }

  // 11. Undo / Redo / Reset Commands
  const btnUndo = document.querySelector('#btn-undo');
  const btnRedo = document.querySelector('#btn-redo');
  const btnReset = document.querySelector('#btn-reset');

  if (btnUndo) btnUndo.addEventListener('click', undo);
  if (btnRedo) btnRedo.addEventListener('click', redo);
  if (btnReset) btnReset.addEventListener('click', resetDesign);

  // Global Keyboard Shortcuts (Ctrl+Z, Ctrl+Y)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault();
      redo();
    }
  });

  // 12. Editable Design Title
  const headerName = document.querySelector('#header-design-name');
  if (headerName) {
    headerName.addEventListener('blur', () => {
      const text = headerName.textContent.trim();
      if (text && text !== designState.name) {
        pushStateSnapshot();
        designState.name = text;
        syncUIFromState();
        showToast(`Design renamed to "${text}"`);
      }
    });
    headerName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        headerName.blur();
      }
    });
  }

  // 13. Designer Studio Notes Textarea
  const notesInput = document.querySelector('#designer-notes-input');
  if (notesInput) {
    notesInput.addEventListener('input', () => {
      designState.notes = notesInput.value;
    });
  }

  // 14. Save Design Actions
  const btnHeaderSave = document.querySelector('#btn-save');
  const btnInspectorSave = document.querySelector('#btn-save-design');
  if (btnHeaderSave) btnHeaderSave.addEventListener('click', saveDesignToStorage);
  if (btnInspectorSave) btnInspectorSave.addEventListener('click', saveDesignToStorage);

  // 15. Export Modal Controls
  const btnExport = document.querySelector('#btn-export');
  const modalExport = document.querySelector('#modal-export');
  const btnCloseExport = document.querySelector('#btn-close-export');
  const btnCancelExport = document.querySelector('#btn-cancel-export');

  const openExportModal = () => modalExport?.classList.add('is-open');
  const closeExportModal = () => modalExport?.classList.remove('is-open');

  if (btnExport) btnExport.addEventListener('click', openExportModal);
  if (btnCloseExport) btnCloseExport.addEventListener('click', closeExportModal);
  if (btnCancelExport) btnCancelExport.addEventListener('click', closeExportModal);

  const btnDownloadSvg = document.querySelector('#btn-download-svg');
  if (btnDownloadSvg) {
    btnDownloadSvg.addEventListener('click', () => {
      downloadTechnicalFlatSvg();
      closeExportModal();
    });
  }

  const btnExportTechSheet = document.querySelector('#btn-export-techsheet');
  if (btnExportTechSheet) {
    btnExportTechSheet.addEventListener('click', () => {
      closeExportModal();
      setStudioMode('tech-pack');
      setTimeout(() => window.print(), 350);
    });
  }

  // 16. Cart Modal Controls
  const btnAddCart = document.querySelector('#btn-add-cart');
  const modalCart = document.querySelector('#modal-cart');
  const btnCloseCart = document.querySelector('#btn-close-cart');
  const btnCancelCart = document.querySelector('#btn-cancel-cart');
  const btnConfirmCart = document.querySelector('#btn-confirm-cart');

  const openCartModal = () => {
    const itemTitle = document.querySelector('#cart-item-title');
    const itemSpecs = document.querySelector('#cart-item-specs');
    const itemPrice = document.querySelector('#cart-item-price');
    const topName = GARMENT_CATALOG.tops[designState.top]?.name || 'Fitted Bodice';
    const bottomName = GARMENT_CATALOG.bottoms[designState.bottom]?.name || 'A-Line Skirt';
    const fabricName = GARMENT_CATALOG.fabrics[designState.fabric]?.name || 'Organic Cotton';

    if (itemTitle) itemTitle.textContent = designState.name;
    if (itemSpecs) itemSpecs.textContent = `${topName} • ${bottomName} • ${fabricName}`;
    if (itemPrice) itemPrice.textContent = `₹${designState.pricing.toLocaleString('en-IN')}`;

    modalCart?.classList.add('is-open');
  };

  const closeCartModal = () => modalCart?.classList.remove('is-open');

  if (btnAddCart) btnAddCart.addEventListener('click', openCartModal);
  if (btnCloseCart) btnCloseCart.addEventListener('click', closeCartModal);
  if (btnCancelCart) btnCancelCart.addEventListener('click', closeCartModal);
  if (btnConfirmCart) {
    btnConfirmCart.addEventListener('click', () => {
      closeCartModal();
      showToast(`Added "${designState.name}" to Atelier Cart (₹${designState.pricing.toLocaleString('en-IN')})`);
    });
  }

  // 17. Print Tech Pack Button
  const btnPrintTechPack = document.querySelector('#btn-print-techpack');
  if (btnPrintTechPack) {
    btnPrintTechPack.addEventListener('click', () => window.print());
  }

  // Check URL query parameters (e.g. ?mode=tech-pack)
  const urlParams = new URLSearchParams(window.location.search);
  const initialMode = urlParams.get('mode');
  if (initialMode && ['design', 'technical-flat', 'tech-pack'].includes(initialMode)) {
    setStudioMode(initialMode);
  } else {
    // Initial Render
    updatePreview();
  }
});