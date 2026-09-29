/**
 * FashionForge — 2.5D Centralized Renderer: Garment Component Registry
 *
 * Defines the component catalog, metadata, pricing, and active status
 * for the Phase 3 vertical slice.
 */

export const GARMENT_CATALOG = {
  tops: {
    basic: {
      id: 'basic',
      category: 'top',
      name: 'Fitted Bodice',
      status: 'active',
      price: 450,
      description: 'Anatomically fitted structured bodice with natural waist connection and contour bust shaping.'
    },
    crop: {
      id: 'crop',
      category: 'top',
      name: 'Crop Top (Phase 4)',
      status: 'reserved',
      disabled: true,
      price: 350,
      description: 'Reserved for Phase 4 library expansion.'
    },
    tunic: {
      id: 'tunic',
      category: 'top',
      name: 'Tunic Top (Phase 4)',
      status: 'reserved',
      disabled: true,
      price: 500,
      description: 'Reserved for Phase 4 library expansion.'
    }
  },
  bottoms: {
    skirt: {
      id: 'skirt',
      category: 'bottom',
      name: 'A-Line Skirt',
      status: 'active',
      price: 550,
      description: 'Balanced A-line flare skirt contouring natural waist and hips with soft drape volume.'
    },
    trousers: {
      id: 'trousers',
      category: 'bottom',
      name: 'Trousers (Phase 4)',
      status: 'reserved',
      disabled: true,
      price: 600,
      description: 'Reserved for Phase 4 library expansion.'
    },
    wide: {
      id: 'wide',
      category: 'bottom',
      name: 'Wide Bottom (Phase 4)',
      status: 'reserved',
      disabled: true,
      price: 650,
      description: 'Reserved for Phase 4 library expansion.'
    }
  },
  sleeves: {
    short: {
      id: 'short',
      category: 'sleeves',
      name: 'Set-In Short Sleeve',
      status: 'active',
      price: 150,
      description: 'Tailored set-in sleeve originating at the shoulder tip with cylindrical bicep volume.'
    },
    long: {
      id: 'long',
      category: 'sleeves',
      name: 'Long Sleeve (Phase 4)',
      status: 'reserved',
      disabled: true,
      price: 220,
      description: 'Reserved for Phase 4 library expansion.'
    },
    flare: {
      id: 'flare',
      category: 'sleeves',
      name: 'Flare Sleeve (Phase 4)',
      status: 'reserved',
      disabled: true,
      price: 200,
      description: 'Reserved for Phase 4 library expansion.'
    }
  },
  collars: {
    round: {
      id: 'round',
      category: 'collar',
      name: 'Round Jewel Neckline',
      status: 'active',
      price: 80,
      description: 'Classic round neckline framed with subtle binding and inner collar depth.'
    },
    vneck: {
      id: 'vneck',
      category: 'collar',
      name: 'V-Neck (Phase 4)',
      status: 'reserved',
      disabled: true,
      price: 90,
      description: 'Reserved for Phase 4 library expansion.'
    },
    square: {
      id: 'square',
      category: 'collar',
      name: 'Square Neck (Phase 4)',
      status: 'reserved',
      disabled: true,
      price: 95,
      description: 'Reserved for Phase 4 library expansion.'
    }
  },
  fabrics: {
    cotton: {
      id: 'cotton',
      name: 'Organic Cotton',
      status: 'active',
      price: 250,
      description: '100% Combed Organic Cotton (180 GSM), breathable matte finish.'
    },
    silk: {
      id: 'silk',
      name: 'Mulberry Silk',
      status: 'active',
      price: 520,
      description: 'Pure Mulberry Silk with subtle directional sheen.'
    },
    denim: {
      id: 'denim',
      name: 'Structured Denim',
      status: 'active',
      price: 380,
      description: '12oz Indigo Cotton Twill with pronounced grain.'
    },
    linen: {
      id: 'linen',
      name: 'Natural Linen',
      status: 'active',
      price: 320,
      description: 'Unbleached European Flax with breathable textured slub.'
    }
  },
  patterns: {
    solid: {
      id: 'solid',
      name: 'Solid Colour',
      status: 'active',
      price: 0,
      description: 'Pure piece-dyed solid surface highlighting weave texture.'
    },
    stripes: {
      id: 'stripes',
      name: 'Subtle Stripe',
      status: 'active',
      price: 120,
      description: 'Fine vertical woven pinstripe with tailored cadence.'
    },
    checks: {
      id: 'checks',
      name: 'Check / Plaid',
      status: 'active',
      price: 140,
      description: 'Classic yarn-dyed windowpane micro-check.'
    },
    floral: {
      id: 'floral',
      name: 'Floral Damask',
      status: 'active',
      price: 180,
      description: 'Artisanal botanical motif softly harmonized with base tone.'
    },
    geometric: {
      id: 'geometric',
      name: 'Geometric Motif',
      status: 'active',
      price: 150,
      description: 'Tessellated modern geometric repeat pattern.'
    },
    dots: {
      id: 'dots',
      name: 'Polka Dots',
      status: 'active',
      price: 110,
      description: 'Balanced geometric dot print integrated with drape shading.'
    }
  }
};
