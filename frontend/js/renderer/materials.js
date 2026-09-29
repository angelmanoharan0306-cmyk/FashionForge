/**
 * FashionForge — 2.5D Centralized Renderer: Material System
 *
 * Provides extensible material profiles, color harmonization,
 * and vector-based fabric weave textures and patterns.
 */

export const MATERIAL_PROFILES = {
  cotton: {
    id: 'cotton',
    name: 'Organic Cotton',
    roughness: 0.85,
    textureScale: 10,
    highlightOpacity: 0.16,
    shadowOpacity: 0.36,
    edgeStrength: 0.28,
    foldStrength: 0.32,
    specular: 'matte',
    description: 'Soft combed organic cotton with fine matte weave texture and subtle polished luster.'
  },
  silk: {
    id: 'silk',
    name: 'Mulberry Silk',
    roughness: 0.25,
    textureScale: 16,
    highlightOpacity: 0.42,
    shadowOpacity: 0.44,
    edgeStrength: 0.18,
    foldStrength: 0.48,
    specular: 'lustrous',
    description: 'High-sheen fluid drape with directional specular highlights and liquid fall.'
  },
  denim: {
    id: 'denim',
    name: 'Structured Denim',
    roughness: 0.92,
    textureScale: 8,
    highlightOpacity: 0.10,
    shadowOpacity: 0.48,
    edgeStrength: 0.42,
    foldStrength: 0.26,
    specular: 'sturdy',
    description: 'Heavy diagonal twill weave with deep contour shadows and structured body.'
  },
  linen: {
    id: 'linen',
    name: 'Natural Linen',
    roughness: 0.90,
    textureScale: 12,
    highlightOpacity: 0.18,
    shadowOpacity: 0.34,
    edgeStrength: 0.32,
    foldStrength: 0.36,
    specular: 'crisp',
    description: 'Subtle slub texture with natural dry hand, crisp airy drape, and visible weave.'
  }
};

/**
 * Utility: parse hex color and compute tints/shades
 */
export function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

export function adjustColor(hex, factor) {
  // factor > 0 lightens toward white; factor < 0 darkens toward black
  const { r, g, b } = hexToRgb(hex);
  if (factor >= 0) {
    const nr = Math.round(r + (255 - r) * factor);
    const ng = Math.round(g + (255 - g) * factor);
    const nb = Math.round(b + (255 - b) * factor);
    return `rgb(${nr}, ${ng}, ${nb})`;
  } else {
    const f = 1 + factor;
    const nr = Math.round(r * f);
    const ng = Math.round(g * f);
    const nb = Math.round(b * f);
    return `rgb(${nr}, ${ng}, ${nb})`;
  }
}

/**
 * Computes color palette stops for a garment based on base color and material profile
 */
export function getHarmonizedPalette(baseColor, fabricId = 'cotton') {
  const profile = MATERIAL_PROFILES[fabricId] || MATERIAL_PROFILES.cotton;
  return {
    base: baseColor,
    highlightSoft: adjustColor(baseColor, profile.highlightOpacity * 1.5),
    highlightCrisp: adjustColor(baseColor, profile.highlightOpacity * 2.8),
    midtone: baseColor,
    shadowSoft: adjustColor(baseColor, -profile.shadowOpacity * 0.6),
    shadowDeep: adjustColor(baseColor, -profile.shadowOpacity),
    shadowAmbient: adjustColor(baseColor, -0.65),
    seamColor: adjustColor(baseColor, -0.55),
    stitchColor: adjustColor(baseColor, -0.32),
    patternStroke: adjustColor(baseColor, -0.38)
  };
}

/**
 * Generates SVG <defs> elements for the material textures and surface patterns
 */
export function generateMaterialDefs(designState) {
  const fabricId = designState.fabric || 'cotton';
  const palette = getHarmonizedPalette(designState.colour || '#b96b61', fabricId);
  const patternId = designState.pattern || 'solid';

  const defs = [];

  // 1. Fabric Weave Micro-Textures
  // Cotton (Soft combed matte cross-weave)
  defs.push(`
    <pattern id="ff-fabric-weave-cotton" width="10" height="10" patternUnits="userSpaceOnUse">
      <rect width="10" height="10" fill="none" />
      <path d="M0 2.5 H10 M0 7.5 H10" stroke="${palette.highlightSoft}" stroke-width="0.8" opacity="0.38" />
      <path d="M2.5 0 V10 M7.5 0 V10" stroke="${palette.shadowDeep}" stroke-width="0.75" opacity="0.28" />
      <circle cx="2.5" cy="2.5" r="0.6" fill="${palette.highlightCrisp}" opacity="0.35" />
      <circle cx="7.5" cy="7.5" r="0.6" fill="${palette.highlightCrisp}" opacity="0.35" />
    </pattern>
  `);

  // Silk (High-luster diagonal sheen and fine fluid specular glints)
  defs.push(`
    <pattern id="ff-fabric-weave-silk" width="16" height="16" patternUnits="userSpaceOnUse">
      <rect width="16" height="16" fill="none" />
      <line x1="0" y1="16" x2="16" y2="0" stroke="${palette.highlightCrisp}" stroke-width="1.8" opacity="0.55" />
      <line x1="-8" y1="8" x2="8" y2="-8" stroke="${palette.highlightSoft}" stroke-width="1.0" opacity="0.35" />
      <line x1="8" y1="24" x2="24" y2="8" stroke="${palette.highlightSoft}" stroke-width="1.0" opacity="0.35" />
      <circle cx="8" cy="8" r="0.8" fill="#ffffff" opacity="0.45" />
    </pattern>
  `);

  // Denim (Pronounced 45° diagonal twill weave with deep contrast ribs)
  defs.push(`
    <pattern id="ff-fabric-weave-denim" width="10" height="10" patternUnits="userSpaceOnUse">
      <rect width="10" height="10" fill="none" />
      <line x1="0" y1="0" x2="10" y2="10" stroke="${palette.shadowDeep}" stroke-width="2.4" opacity="0.65" />
      <line x1="0" y1="5" x2="5" y2="10" stroke="${palette.highlightSoft}" stroke-width="1.2" opacity="0.45" />
      <line x1="5" y1="0" x2="10" y2="5" stroke="${palette.highlightSoft}" stroke-width="1.2" opacity="0.45" />
    </pattern>
  `);

  // Linen (Natural organic cross-slub grid with visible texture variations)
  defs.push(`
    <pattern id="ff-fabric-weave-linen" width="16" height="16" patternUnits="userSpaceOnUse">
      <rect width="16" height="16" fill="none" />
      <path d="M0 4 H16 M0 12 H16" stroke="${palette.shadowSoft}" stroke-width="1.2" opacity="0.45" />
      <path d="M4 0 V16 M12 0 V16" stroke="${palette.highlightSoft}" stroke-width="1.0" opacity="0.40" />
      <rect x="2" y="10" width="4.5" height="1.8" rx="0.5" fill="${palette.shadowDeep}" opacity="0.45" />
      <rect x="10" y="2" width="2" height="4.5" rx="0.5" fill="${palette.shadowDeep}" opacity="0.45" />
      <rect x="9" y="11" width="3" height="1.5" rx="0.5" fill="${palette.highlightCrisp}" opacity="0.35" />
    </pattern>
  `);

  // 2. Garment Surface Decorative Patterns
  if (patternId === 'stripes') {
    defs.push(`
      <pattern id="ff-garment-pattern" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill="none" />
        <line x1="8" y1="0" x2="8" y2="16" stroke="${palette.patternStroke}" stroke-width="2.6" opacity="0.45" />
        <line x1="9" y1="0" x2="9" y2="16" stroke="${palette.highlightSoft}" stroke-width="0.9" opacity="0.30" />
      </pattern>
    `);
  } else if (patternId === 'checks') {
    defs.push(`
      <pattern id="ff-garment-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
        <rect width="24" height="24" fill="none" />
        <rect x="0" y="0" width="12" height="12" fill="${palette.patternStroke}" opacity="0.25" />
        <rect x="12" y="12" width="12" height="12" fill="${palette.patternStroke}" opacity="0.25" />
        <line x1="0" y1="0" x2="24" y2="0" stroke="${palette.patternStroke}" stroke-width="1.2" opacity="0.35" />
        <line x1="0" y1="0" x2="0" y2="24" stroke="${palette.patternStroke}" stroke-width="1.2" opacity="0.35" />
        <line x1="0" y1="12" x2="24" y2="12" stroke="${palette.highlightSoft}" stroke-width="0.8" opacity="0.25" />
        <line x1="12" y1="0" x2="12" y2="24" stroke="${palette.highlightSoft}" stroke-width="0.8" opacity="0.25" />
      </pattern>
    `);
  } else if (patternId === 'floral') {
    defs.push(`
      <pattern id="ff-garment-pattern" width="28" height="28" patternUnits="userSpaceOnUse">
        <rect width="28" height="28" fill="none" />
        <!-- 4-petal floral damask motif -->
        <circle cx="14" cy="9" r="4.2" fill="${palette.patternStroke}" opacity="0.30" />
        <circle cx="14" cy="19" r="4.2" fill="${palette.patternStroke}" opacity="0.30" />
        <circle cx="9" cy="14" r="4.2" fill="${palette.patternStroke}" opacity="0.30" />
        <circle cx="19" cy="14" r="4.2" fill="${palette.patternStroke}" opacity="0.30" />
        <circle cx="14" cy="14" r="2.2" fill="${palette.highlightCrisp}" opacity="0.50" />
        <!-- Corner vine accents -->
        <circle cx="0" cy="0" r="2.5" fill="${palette.patternStroke}" opacity="0.22" />
        <circle cx="28" cy="0" r="2.5" fill="${palette.patternStroke}" opacity="0.22" />
        <circle cx="0" cy="28" r="2.5" fill="${palette.patternStroke}" opacity="0.22" />
        <circle cx="28" cy="28" r="2.5" fill="${palette.patternStroke}" opacity="0.22" />
      </pattern>
    `);
  } else if (patternId === 'geometric') {
    defs.push(`
      <pattern id="ff-garment-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
        <rect width="20" height="20" fill="none" />
        <!-- Diamond lattice geometry -->
        <path d="M10 0 L20 10 L10 20 L0 10 Z" fill="none" stroke="${palette.patternStroke}" stroke-width="1.4" opacity="0.35" />
        <circle cx="10" cy="10" r="1.8" fill="${palette.patternStroke}" opacity="0.40" />
        <circle cx="0" cy="0" r="1.4" fill="${palette.highlightSoft}" opacity="0.35" />
        <circle cx="20" cy="20" r="1.4" fill="${palette.highlightSoft}" opacity="0.35" />
      </pattern>
    `);
  } else if (patternId === 'dots') {
    defs.push(`
      <pattern id="ff-garment-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
        <rect width="20" height="20" fill="none" />
        <circle cx="5" cy="5" r="2.5" fill="${palette.patternStroke}" opacity="0.35" />
        <circle cx="15" cy="15" r="2.5" fill="${palette.patternStroke}" opacity="0.35" />
        <circle cx="4.5" cy="4.5" r="1.0" fill="${palette.highlightSoft}" opacity="0.35" />
        <circle cx="14.5" cy="14.5" r="1.0" fill="${palette.highlightSoft}" opacity="0.35" />
      </pattern>
    `);
  }

  // 3. Natural Ambient Occlusion and Soft Drop-Shadow Filter
  defs.push(`
    <filter id="ff-soft-drop-shadow" x="-10%" y="-8%" width="120%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="3.5" flood-color="#3c2a24" flood-opacity="0.14" />
    </filter>
  `);

  return defs.join('\n');
}
