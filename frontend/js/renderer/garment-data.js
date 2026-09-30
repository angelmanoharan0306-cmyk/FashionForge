/**
 * FashionForge — 2.5D Centralized Renderer: Garment Component Registry
 *
 * Phase 5: All garment components are now active and fully rendered.
 * Components map directly to geometry functions in geometry.js.
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
      name: 'Relaxed Fit',
      status: 'active',
      price: 380,
      description: 'Boxy, relaxed silhouette with dropped shoulders and straight hip-length hem. No waist suppression.'
    },
    wrap: {
      id: 'wrap',
      category: 'top',
      name: 'Wrap Top',
      status: 'active',
      price: 420,
      description: 'Diagonal V-lapel wrap with crossed centre-front. Adjustable and universally flattering.'
    },
    peplum: {
      id: 'peplum',
      category: 'top',
      name: 'Peplum Bodice',
      status: 'active',
      price: 490,
      description: 'Fitted bodice with a structured flounced peplum tier at the waist for a feminine silhouette.'
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
    straight: {
      id: 'straight',
      category: 'bottom',
      name: 'Straight Skirt',
      status: 'active',
      price: 520,
      description: 'Slim pencil silhouette from waist to knee with minimal taper. Clean and architectural.'
    },
    wide: {
      id: 'wide',
      category: 'bottom',
      name: 'Wide Leg',
      status: 'active',
      price: 640,
      description: 'Dramatic palazzo wide-leg trousers with full flare from the hip to ankle length.'
    },
    trousers: {
      id: 'trousers',
      category: 'bottom',
      name: 'Slim Trousers',
      status: 'active',
      price: 600,
      description: 'Tailored slim-leg trousers tapered from hip to ankle with a clean straight break.'
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
      name: 'Long Sleeve',
      status: 'active',
      price: 220,
      description: 'Full-length sleeve tapering from bicep to wrist with a clean finished cuff.'
    },
    flare: {
      id: 'flare',
      category: 'sleeves',
      name: 'Flare / Bell Sleeve',
      status: 'active',
      price: 200,
      description: 'Fitted at the cap with a dramatically flared bell hem at mid-forearm level.'
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
      name: 'V-Neck',
      status: 'active',
      price: 90,
      description: 'Pointed V-neckline with a deep sternum dip. Elongates and defines the décolletage.'
    },
    square: {
      id: 'square',
      category: 'collar',
      name: 'Square Neck',
      status: 'active',
      price: 95,
      description: 'Structured horizontal chest-level neckline with clean right-angle corners.'
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
    },
    chiffon: {
      id: 'chiffon',
      name: 'Sheer Chiffon',
      status: 'active',
      price: 290,
      description: 'Ethereal sheer silk-blend chiffon with translucent weave and fluid drape.'
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
