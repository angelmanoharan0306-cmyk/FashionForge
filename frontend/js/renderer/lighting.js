/**
 * FashionForge — 2.5D Centralized Renderer: Lighting & Depth Engine
 *
 * Implements subtle directional key light, fill light, cylindrical contour
 * gradients, contact shadows, and interior depth illumination for fabric volume.
 */

import { getHarmonizedPalette } from './materials.js';

/**
 * Generates all lighting and shading <defs> elements for the current design state
 */
export function generateLightingDefs(designState) {
  const palette = getHarmonizedPalette(designState.colour || '#b96b61', designState.fabric || 'cotton');
  const defs = [];

  // 1. Bodice Front 2.5D Lighting Gradient (Directional Top-Left Key Light + Torso & Bust Volume)
  defs.push(`
    <linearGradient id="ff-light-bodice-front" x1="0.1" y1="0.1" x2="0.9" y2="0.9">
      <stop offset="0%" stop-color="${palette.highlightSoft}" stop-opacity="0.8" />
      <stop offset="25%" stop-color="${palette.highlightCrisp}" stop-opacity="0.32" />
      <stop offset="50%" stop-color="${palette.base}" stop-opacity="0.95" />
      <stop offset="78%" stop-color="${palette.base}" stop-opacity="1" />
      <stop offset="92%" stop-color="${palette.shadowSoft}" stop-opacity="0.65" />
      <stop offset="100%" stop-color="${palette.shadowDeep}" stop-opacity="0.8" />
    </linearGradient>

    <!-- Bust fullness radial highlights for 2.5D chest contouring -->
    <radialGradient id="ff-light-bust-left" cx="0.45" cy="0.4" r="0.48">
      <stop offset="0%" stop-color="${palette.highlightCrisp}" stop-opacity="0.42" />
      <stop offset="50%" stop-color="${palette.highlightSoft}" stop-opacity="0.18" />
      <stop offset="100%" stop-color="${palette.base}" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="ff-light-bust-right" cx="0.5" cy="0.42" r="0.48">
      <stop offset="0%" stop-color="${palette.highlightSoft}" stop-opacity="0.28" />
      <stop offset="50%" stop-color="${palette.highlightSoft}" stop-opacity="0.1" />
      <stop offset="100%" stop-color="${palette.base}" stop-opacity="0" />
    </radialGradient>
  `);

  // 2. Bodice Back 2.5D Lighting Gradient (Spine Center Depth + Shoulder Blade Volume)
  defs.push(`
    <linearGradient id="ff-light-bodice-back" x1="0.05" y1="0.2" x2="0.95" y2="0.8">
      <stop offset="0%" stop-color="${palette.shadowSoft}" stop-opacity="0.75" />
      <stop offset="22%" stop-color="${palette.base}" stop-opacity="0.95" />
      <stop offset="48%" stop-color="${palette.shadowSoft}" stop-opacity="0.6" />
      <stop offset="52%" stop-color="${palette.shadowDeep}" stop-opacity="0.68" />
      <stop offset="76%" stop-color="${palette.base}" stop-opacity="0.95" />
      <stop offset="100%" stop-color="${palette.shadowDeep}" stop-opacity="0.85" />
    </linearGradient>
  `);

  // 3. A-Line Skirt Front Drape Volume Gradient (Vertical Cylindrical Flutes & Flare)
  // Multi-stop sinusoidal gradient mimicking organic undulating fabric folds
  defs.push(`
    <linearGradient id="ff-light-skirt-front" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${palette.shadowDeep}" stop-opacity="0.75" />
      <stop offset="8%" stop-color="${palette.shadowSoft}" stop-opacity="0.45" />
      <stop offset="18%" stop-color="${palette.highlightSoft}" stop-opacity="0.35" />
      <stop offset="28%" stop-color="${palette.shadowSoft}" stop-opacity="0.4" />
      <stop offset="38%" stop-color="${palette.highlightCrisp}" stop-opacity="0.32" />
      <stop offset="48%" stop-color="${palette.base}" stop-opacity="0.9" />
      <stop offset="53%" stop-color="${palette.highlightSoft}" stop-opacity="0.3" />
      <stop offset="64%" stop-color="${palette.shadowSoft}" stop-opacity="0.4" />
      <stop offset="76%" stop-color="${palette.highlightSoft}" stop-opacity="0.32" />
      <stop offset="88%" stop-color="${palette.shadowSoft}" stop-opacity="0.55" />
      <stop offset="100%" stop-color="${palette.shadowDeep}" stop-opacity="0.8" />
    </linearGradient>

    <!-- Vertical drop shadow from waist to hem for natural drape weight -->
    <linearGradient id="ff-light-skirt-vertical" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${palette.shadowSoft}" stop-opacity="0.25" />
      <stop offset="15%" stop-color="${palette.base}" stop-opacity="0" />
      <stop offset="85%" stop-color="${palette.base}" stop-opacity="0" />
      <stop offset="100%" stop-color="${palette.shadowDeep}" stop-opacity="0.28" />
    </linearGradient>
  `);

  // 4. A-Line Skirt Back Volume Gradient
  defs.push(`
    <linearGradient id="ff-light-skirt-back" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${palette.shadowDeep}" stop-opacity="0.78" />
      <stop offset="18%" stop-color="${palette.base}" stop-opacity="0.95" />
      <stop offset="35%" stop-color="${palette.shadowSoft}" stop-opacity="0.55" />
      <stop offset="48%" stop-color="${palette.shadowDeep}" stop-opacity="0.65" />
      <stop offset="52%" stop-color="${palette.shadowDeep}" stop-opacity="0.65" />
      <stop offset="65%" stop-color="${palette.shadowSoft}" stop-opacity="0.55" />
      <stop offset="82%" stop-color="${palette.base}" stop-opacity="0.95" />
      <stop offset="100%" stop-color="${palette.shadowDeep}" stop-opacity="0.8" />
    </linearGradient>
  `);

  // 5. Left Sleeve Cylindrical Shading (Key-light from upper left)
  defs.push(`
    <linearGradient id="ff-light-sleeve-left" x1="0.1" y1="0" x2="0.9" y2="0.6">
      <stop offset="0%" stop-color="${palette.highlightSoft}" stop-opacity="0.75" />
      <stop offset="35%" stop-color="${palette.base}" stop-opacity="0.9" />
      <stop offset="75%" stop-color="${palette.shadowSoft}" stop-opacity="0.65" />
      <stop offset="100%" stop-color="${palette.shadowDeep}" stop-opacity="0.8" />
    </linearGradient>
  `);

  // 6. Right Sleeve Cylindrical Shading (Softer fill light, ambient contour)
  defs.push(`
    <linearGradient id="ff-light-sleeve-right" x1="0.1" y1="0" x2="0.9" y2="0.6">
      <stop offset="0%" stop-color="${palette.base}" stop-opacity="0.95" />
      <stop offset="45%" stop-color="${palette.shadowSoft}" stop-opacity="0.6" />
      <stop offset="85%" stop-color="${palette.shadowDeep}" stop-opacity="0.78" />
      <stop offset="100%" stop-color="${palette.shadowAmbient}" stop-opacity="0.88" />
    </linearGradient>
  `);

  // 7. Interior Neckline Cavity Depth (Darkened interior collar)
  defs.push(`
    <linearGradient id="ff-light-neck-depth" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${palette.shadowAmbient}" stop-opacity="0.88" />
      <stop offset="60%" stop-color="${palette.shadowDeep}" stop-opacity="0.7" />
      <stop offset="100%" stop-color="${palette.shadowSoft}" stop-opacity="0.4" />
    </linearGradient>
  `);

  // 8. Hem Facing Underside Depth (Shadow under skirt hem)
  defs.push(`
    <linearGradient id="ff-light-hem-depth" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${palette.shadowAmbient}" stop-opacity="0.9" />
      <stop offset="70%" stop-color="${palette.shadowDeep}" stop-opacity="0.8" />
      <stop offset="100%" stop-color="${palette.base}" stop-opacity="0.55" />
    </linearGradient>
  `);

  // 9. Natural Waist Contact Shadow (Slight overhang of bodice on skirt)
  defs.push(`
    <linearGradient id="ff-light-waist-shadow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${palette.shadowAmbient}" stop-opacity="0.4" />
      <stop offset="100%" stop-color="${palette.shadowAmbient}" stop-opacity="0" />
    </linearGradient>
  `);

  // 10. Cast Shadows on Arms from Sleeve Hems
  defs.push(`
    <linearGradient id="ff-sleeve-cast-shadow-left" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2a2220" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#2a2220" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="ff-sleeve-cast-shadow-right" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2a2220" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#2a2220" stop-opacity="0" />
    </linearGradient>
  `);

  // 11. Soft Studio Backdrop Vignette Gradient (Seamless warm ivory glow)
  defs.push(`
    <radialGradient id="ff-studio-backdrop-glow" cx="0.5" cy="0.45" r="0.65">
      <stop offset="0%" stop-color="#fdfcfb" stop-opacity="1" />
      <stop offset="65%" stop-color="#faf7f2" stop-opacity="1" />
      <stop offset="100%" stop-color="#f2ebe2" stop-opacity="1" />
    </radialGradient>
  `);

  // 12. Seamless Photo Edge Feather Mask
  defs.push(`
    <linearGradient id="ff-feather-left" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#000000" />
      <stop offset="100%" stop-color="#ffffff" />
    </linearGradient>
    <linearGradient id="ff-feather-right" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#000000" />
    </linearGradient>
    <linearGradient id="ff-feather-top" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" />
      <stop offset="100%" stop-color="#ffffff" />
    </linearGradient>
    <linearGradient id="ff-feather-bottom" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#000000" />
    </linearGradient>

    <mask id="ff-model-feather-mask">
      <rect x="0" y="0" width="768" height="1376" fill="#ffffff" />
      <rect x="0" y="0" width="70" height="1376" fill="url(#ff-feather-left)" />
      <rect x="698" y="0" width="70" height="1376" fill="url(#ff-feather-right)" />
      <rect x="0" y="0" width="768" height="40" fill="url(#ff-feather-top)" />
      <rect x="0" y="1336" width="768" height="40" fill="url(#ff-feather-bottom)" />
    </mask>
  `);

  return defs.join('\n');
}
