/**
 * FashionForge — Rule-Based Recommendation & Compatibility Engine
 *
 * Implements deterministic IF/THEN rules for styling recommendations
 * and sartorial compatibility. Transparent, fully explainable, with zero AI/ML.
 *
 * Single Source of Truth for:
 *   1. Gender & garment compatibility rules
 *   2. Rule-based fashion recommendations (fabric, silhouette, pattern, proportion)
 *   3. Concise compatibility notifications and automatic valid alternatives
 */

import { GARMENT_CATALOG } from './renderer/garment-data.js';

/* ==========================================================================
   1. SARTORIAL COMPATIBILITY RULES
   ========================================================================== */

export const COMPATIBILITY_RULES = {
  male: {
    allowedTops: ['crop'], // Relaxed Fit / Shirt
    allowedBottoms: ['trousers', 'wide'], // Slim Trousers, Wide Leg
    allowedSleeves: ['short', 'long', 'flare'],
    allowedCollars: ['round', 'vneck', 'square'],
    defaultTop: 'crop',
    defaultBottom: 'trousers',
    incompatibleReplacements: {
      top: {
        basic: {
          replaceWith: 'crop',
          message: 'Contoured bust bodice is female-specific. Replaced with Relaxed Shirt.',
          title: 'Menswear Compatibility Notice'
        },
        wrap: {
          replaceWith: 'crop',
          message: 'Cross-front wrap top is female-specific. Replaced with Relaxed Shirt.',
          title: 'Menswear Compatibility Notice'
        },
        peplum: {
          replaceWith: 'crop',
          message: 'Peplum waist flounce is female-specific. Replaced with Relaxed Shirt.',
          title: 'Menswear Compatibility Notice'
        }
      },
      bottom: {
        skirt: {
          replaceWith: 'trousers',
          message: 'A-Line Skirt is female-specific. Replaced with Slim Trousers.',
          title: 'Menswear Compatibility Notice'
        },
        straight: {
          replaceWith: 'trousers',
          message: 'Straight Skirt is female-specific. Replaced with Slim Trousers.',
          title: 'Menswear Compatibility Notice'
        }
      }
    }
  },
  female: {
    allowedTops: ['basic', 'crop', 'wrap', 'peplum'],
    allowedBottoms: ['skirt', 'straight', 'wide', 'trousers'],
    allowedSleeves: ['short', 'long', 'flare'],
    allowedCollars: ['round', 'vneck', 'square'],
    defaultTop: 'basic',
    defaultBottom: 'skirt'
  }
};

/**
 * Checks whether a specific component selection is compatible with the active croquis
 *
 * @param {string} gender - 'male' | 'female'
 * @param {string} group  - 'top' | 'bottom' | 'sleeves' | 'collar'
 * @param {string} value  - Component ID
 * @returns {{ compatible: boolean, replaceWith?: string, message?: string, title?: string }}
 */
export function checkCompatibility(gender, group, value) {
  const isMale = (gender === 'male');
  if (isMale) {
    const maleRules = COMPATIBILITY_RULES.male;
    const replacement = maleRules.incompatibleReplacements?.[group]?.[value];
    if (replacement) {
      return {
        compatible: false,
        replaceWith: replacement.replaceWith,
        message: replacement.message,
        title: replacement.title
      };
    }
  }
  return { compatible: true };
}

/**
 * Validates and enforces compatibility across the entire design state.
 * Automatically replaces any incompatible choices with canonical alternatives.
 *
 * @param {object} state - Active designState
 * @returns {{ modified: boolean, changes: Array<{ group: string, from: string, to: string, message: string }> }}
 */
export function enforceCompatibility(state) {
  const isMale = (state.figure === 'male' || state.croquis === 'male');
  const changes = [];

  if (isMale) {
    const maleRules = COMPATIBILITY_RULES.male;
    // Check top
    const topCheck = maleRules.incompatibleReplacements.top?.[state.top];
    if (topCheck) {
      changes.push({ group: 'top', from: state.top, to: topCheck.replaceWith, message: topCheck.message });
      state.top = topCheck.replaceWith;
    }
    // Check bottom
    const bottomCheck = maleRules.incompatibleReplacements.bottom?.[state.bottom];
    if (bottomCheck) {
      changes.push({ group: 'bottom', from: state.bottom, to: bottomCheck.replaceWith, message: bottomCheck.message });
      state.bottom = bottomCheck.replaceWith;
    }
  }

  return {
    modified: changes.length > 0,
    changes
  };
}

/* ==========================================================================
   2. DETERMINISTIC RECOMMENDATION RULES TABLE
   ========================================================================== */

/**
 * Rule definition format:
 * - id: unique identifier
 * - category: 'compatibility' | 'gender' | 'fabric' | 'pattern' | 'silhouette' | 'size' | 'default'
 * - priority: higher numbers evaluated first
 * - condition(state): deterministic boolean evaluator
 * - title: Primary recommendation headline (concise)
 * - explanation: Short supporting explanation
 * - ruleLogic: Explicit IF/THEN explanation for auditability
 */
export const RECOMMENDATION_RULES = [
  // ------------------------------------------------------------------------
  // A. Incompatibility & Auto-Resolution Rules (Priority 100)
  // ------------------------------------------------------------------------
  {
    id: 'incompat-male-skirt',
    category: 'compatibility',
    priority: 100,
    condition: (state) => {
      const isMale = (state.figure === 'male' || state.croquis === 'male');
      return isMale && (state.bottom === 'skirt' || state.bottom === 'straight');
    },
    title: 'Compatibility Notice',
    explanation: 'Skirts are specific to the female silhouette. Trousers are recommended for masculine proportions.',
    ruleLogic: 'IF male croquis AND bottom in [skirt, straight] THEN display compatibility warning and guide to trousers.'
  },
  {
    id: 'incompat-male-bodice',
    category: 'compatibility',
    priority: 100,
    condition: (state) => {
      const isMale = (state.figure === 'male' || state.croquis === 'male');
      return isMale && (state.top === 'basic' || state.top === 'peplum' || state.top === 'wrap');
    },
    title: 'Compatibility Notice',
    explanation: 'Contoured bust bodices are calibrated for female silhouettes. The Relaxed Shirt is recommended for menswear.',
    ruleLogic: 'IF male croquis AND top in [basic, peplum, wrap] THEN display compatibility warning and guide to relaxed shirt.'
  },

  // ------------------------------------------------------------------------
  // B. Context-Sensitive Action Rules (Priority 70-90)
  // Triggered when user specifically changes fabric, pattern, or silhouette
  // ------------------------------------------------------------------------

  // Fabric-specific rules
  {
    id: 'fabric-denim',
    category: 'fabric',
    priority: 85,
    condition: (state) => state.fabric === 'denim' && (state.lastChanged === 'fabric' || !state.lastChanged),
    title: 'Structured Silhouette Recommended',
    explanation: 'Structured Denim provides substantial body and crisp seams. Pair with tailored or structured silhouettes to accentuate clean architectural lines.',
    ruleLogic: 'IF fabric = denim THEN recommend structured/tailored silhouettes.'
  },
  {
    id: 'fabric-silk',
    category: 'fabric',
    priority: 85,
    condition: (state) => state.fabric === 'silk' && (state.lastChanged === 'fabric' || !state.lastChanged),
    title: 'Relaxed & Wrap Silhouettes Recommended',
    explanation: 'Mulberry Silk features high specular sheen and a liquid hand. Best paired with relaxed or wrap silhouettes that maximize natural fabric drape and graceful movement.',
    ruleLogic: 'IF fabric = silk THEN recommend relaxed/wrap silhouettes.'
  },
  {
    id: 'fabric-chiffon',
    category: 'fabric',
    priority: 85,
    condition: (state) => state.fabric === 'chiffon' && (state.lastChanged === 'fabric' || !state.lastChanged),
    title: 'Lightweight Flowing Silhouette Recommended',
    explanation: 'Sheer Chiffon delivers an ethereal, floating quality. Flared skirts, bell sleeves, and flowing silhouettes complement its delicate, translucent weave.',
    ruleLogic: 'IF fabric = chiffon THEN recommend lightweight/flowing silhouettes.'
  },
  {
    id: 'fabric-linen',
    category: 'fabric',
    priority: 80,
    condition: (state) => state.fabric === 'linen' && (state.lastChanged === 'fabric' || !state.lastChanged),
    title: 'Relaxed Textural Ease',
    explanation: 'Natural Linen offers breathable slub texture and crisp summer drape. Relaxed silhouettes and straight cuts harmonize with its organic, tactile finish.',
    ruleLogic: 'IF fabric = linen THEN recommend relaxed, breathable summer silhouettes.'
  },
  {
    id: 'fabric-cotton',
    category: 'fabric',
    priority: 75,
    condition: (state) => state.fabric === 'cotton' && state.lastChanged === 'fabric',
    title: 'Versatile Daily Couture',
    explanation: 'Breathable Organic Cotton provides reliable structure and a clean matte finish suitable for versatile day-to-evening wear.',
    ruleLogic: 'IF fabric = cotton AND lastChanged = fabric THEN recommend versatile daywear.'
  },

  // Pattern-specific rules
  {
    id: 'pattern-floral',
    category: 'pattern',
    priority: 85,
    condition: (state) => state.pattern === 'floral' && (state.lastChanged === 'pattern' || !state.lastChanged),
    title: 'Simpler Construction Recommended',
    explanation: 'The rich floral damask makes a prominent visual statement. Simpler garment construction and clean lines ensure the intricate botanical motif stays center stage without visual clutter.',
    ruleLogic: 'IF pattern = floral THEN recommend simpler garment construction.'
  },
  {
    id: 'pattern-stripes',
    category: 'pattern',
    priority: 80,
    condition: (state) => state.pattern === 'stripes' && (state.lastChanged === 'pattern' || !state.lastChanged),
    title: 'Linear Elongation',
    explanation: 'Woven vertical pinstripes naturally elongate the silhouette. Straight skirts or tailored trousers enhance the lengthening, slimming effect of the pattern.',
    ruleLogic: 'IF pattern = stripes THEN recommend straight, elongated silhouettes.'
  },
  {
    id: 'pattern-checks',
    category: 'pattern',
    priority: 80,
    condition: (state) => state.pattern === 'checks' && (state.lastChanged === 'pattern' || !state.lastChanged),
    title: 'Sartorial Heritage Styling',
    explanation: 'Windowpane checks evoke bespoke tailoring tradition. Best complemented by clean neckline framing and structured sleeve hems.',
    ruleLogic: 'IF pattern = checks THEN recommend structured tailored details.'
  },
  {
    id: 'pattern-geometric',
    category: 'pattern',
    priority: 80,
    condition: (state) => state.pattern === 'geometric' && (state.lastChanged === 'pattern' || !state.lastChanged),
    title: 'Architectural Precision',
    explanation: 'Tessellated geometric prints bring contemporary runway edge. Clean geometric cuts like square necklines and straight cuts reinforce the graphic repeats.',
    ruleLogic: 'IF pattern = geometric THEN recommend angular architectural necklines.'
  },
  {
    id: 'pattern-dots',
    category: 'pattern',
    priority: 80,
    condition: (state) => state.pattern === 'dots' && (state.lastChanged === 'pattern' || !state.lastChanged),
    title: 'Rhythmic Print Balance',
    explanation: 'Polka dots add playful vintage charm. Balanced A-line silhouettes and jewel necklines frame the print with timeless proportions.',
    ruleLogic: 'IF pattern = dots THEN recommend balanced A-line and round jewel neckline.'
  },

  // ------------------------------------------------------------------------
  // C. Male Sartorial Styling Guidance (Priority 70)
  // ------------------------------------------------------------------------
  {
    id: 'male-trousers-guidance',
    category: 'gender',
    priority: 70,
    condition: (state) => {
      const isMale = (state.figure === 'male' || state.croquis === 'male');
      return isMale && state.bottom === 'trousers';
    },
    title: 'Masculine Sartorial Guidance',
    explanation: 'Tailored trousers paired with a relaxed shirt deliver a sharp, balanced menswear silhouette with clean vertical breaks. Ideal for modern bespoke tailoring.',
    ruleLogic: 'IF male AND bottom = trousers THEN provide appropriate masculine styling guidance.'
  },
  {
    id: 'male-wide-guidance',
    category: 'gender',
    priority: 70,
    condition: (state) => {
      const isMale = (state.figure === 'male' || state.croquis === 'male');
      return isMale && state.bottom === 'wide';
    },
    title: 'Contemporary Menswear Proportion',
    explanation: 'Wide-leg trousers combined with a relaxed boxy cut create an effortless, fashion-forward menswear drape with generous ease.',
    ruleLogic: 'IF male AND bottom = wide THEN provide contemporary menswear volume guidance.'
  },

  // ------------------------------------------------------------------------
  // D. Silhouette & Proportion Balance Rules (Priority 60-65)
  // ------------------------------------------------------------------------
  {
    id: 'fitted-top-wide-bottom',
    category: 'silhouette',
    priority: 65,
    condition: (state) => state.top === 'basic' && state.bottom === 'wide',
    title: 'Balanced Silhouette',
    explanation: 'Pairing a fitted bodice with wide-leg trousers achieves ideal volume contrast — anchoring the dramatic flare below with clean upper body contouring.',
    ruleLogic: 'IF wide-leg bottom + fitted top THEN recommend balanced silhouette.'
  },
  {
    id: 'fitted-bodice-aline-skirt',
    category: 'silhouette',
    priority: 65,
    condition: (state) => state.top === 'basic' && state.bottom === 'skirt',
    title: 'Balanced A-Line Silhouette',
    explanation: 'The contoured fitted bodice paired with an A-line skirt creates a balanced, universally flattering hourglass silhouette suitable for both casual and semi-formal occasions.',
    ruleLogic: 'IF fitted bodice + a-line skirt THEN show a suitable balanced styling message.'
  },
  {
    id: 'relaxed-top-straight-skirt',
    category: 'silhouette',
    priority: 65,
    condition: (state) => state.top === 'crop' && state.bottom === 'straight',
    title: 'Proportion Contrast',
    explanation: 'A relaxed, boxy top paired with a slim pencil skirt creates an appealing proportion contrast, balancing casual comfort on top with a sleek column below.',
    ruleLogic: 'IF relaxed top + straight skirt THEN recommend modern column contrast.'
  },
  {
    id: 'wrap-top-wide-leg',
    category: 'silhouette',
    priority: 65,
    condition: (state) => state.top === 'wrap' && state.bottom === 'wide',
    title: 'Fluid Draped Balance',
    explanation: 'The diagonal wrap bodice harmonizes with the fluid flare of wide-leg trousers, creating an elongated, graceful line throughout the body.',
    ruleLogic: 'IF wrap top + wide leg THEN recommend fluid drape balance.'
  },
  {
    id: 'peplum-straight-skirt',
    category: 'silhouette',
    priority: 62,
    condition: (state) => state.top === 'peplum' && state.bottom === 'straight',
    title: 'Sculpted Hourglass',
    explanation: 'The architectural peplum waist flare adds feminine definition that is cleanly framed by the narrow column of a straight pencil skirt.',
    ruleLogic: 'IF peplum top + straight bottom THEN recommend sculpted hourglass framing.'
  },
  {
    id: 'peplum-general',
    category: 'silhouette',
    priority: 60,
    condition: (state) => state.top === 'peplum',
    title: 'Contoured Hourglass Accent',
    explanation: 'The structured peplum tier accentuates the natural waistline and hip transition, creating a dramatic hourglass profile with couture flair.',
    ruleLogic: 'IF top = peplum THEN describe peplum tier waist shaping.'
  },
  {
    id: 'wrap-general',
    category: 'silhouette',
    priority: 60,
    condition: (state) => state.top === 'wrap',
    title: 'Universal Wrap Flattery',
    explanation: 'The diagonal wrap construction offers an adjustable, fluid neckline that naturally adapts and flatters all body proportions.',
    ruleLogic: 'IF top = wrap THEN describe wrap versatility.'
  },

  // ------------------------------------------------------------------------
  // E. Component Accent Rules (Priority 50)
  // ------------------------------------------------------------------------
  {
    id: 'sleeves-flare',
    category: 'component',
    priority: 50,
    condition: (state) => state.sleeves === 'flare',
    title: 'Romantic Bell Sleeves',
    explanation: 'Bell sleeves add romantic, bohemian volume to the arms, balancing fitted bodices or flared skirts with dramatic wrist flare.',
    ruleLogic: 'IF sleeves = flare THEN highlight bohemian sleeve volume.'
  },
  {
    id: 'sleeves-long',
    category: 'component',
    priority: 50,
    condition: (state) => state.sleeves === 'long',
    title: 'Tailored Linear Coverage',
    explanation: 'Full-length sleeves provide structural refinement and formal elegance, ideal for tailored bespoke ensembles.',
    ruleLogic: 'IF sleeves = long THEN highlight elegant formal coverage.'
  },
  {
    id: 'collar-vneck',
    category: 'component',
    priority: 50,
    condition: (state) => state.collar === 'vneck',
    title: 'Elongating V-Neckline',
    explanation: 'The pointed V-neckline visually elongates the neck and torso, creating an open, flattering vertical focal point.',
    ruleLogic: 'IF collar = vneck THEN highlight décolletage elongation.'
  },
  {
    id: 'collar-square',
    category: 'component',
    priority: 50,
    condition: (state) => state.collar === 'square',
    title: 'Architectural Square Framing',
    explanation: 'The horizontal square neckline frames the clavicle with clean right angles, adding runway-ready structural polish.',
    ruleLogic: 'IF collar = square THEN highlight architectural framing.'
  },

  // ------------------------------------------------------------------------
  // F. Size & Fit Guidance Rules (Priority 40)
  // ------------------------------------------------------------------------
  {
    id: 'size-petite',
    category: 'size',
    priority: 40,
    condition: (state) => (state.size === 'XS' || state.size === 'S') && state.lastChanged === 'size',
    title: 'Petite Fit Guidance',
    explanation: 'Tailored contour cuts and vertical proportioning flatter petite proportions with clean line transitions and calibrated ease.',
    ruleLogic: 'IF size in [XS, S] AND lastChanged = size THEN provide petite fit guidance.'
  },
  {
    id: 'size-plus',
    category: 'size',
    priority: 40,
    condition: (state) => ['XL', 'XXL', '3XL', '4XL'].includes(state.size) && state.lastChanged === 'size',
    title: 'Extended Size Comfort & Flow',
    explanation: 'Fluid drape fabrics and relaxed or wrap bodices provide exceptional comfort, movement, and flattering contouring across plus-size grading.',
    ruleLogic: 'IF size in [XL, XXL, 3XL, 4XL] AND lastChanged = size THEN provide plus-size ease guidance.'
  },

  // ------------------------------------------------------------------------
  // G. Canonical Default Fallback Rule (Priority 1)
  // ------------------------------------------------------------------------
  {
    id: 'default-balanced-harmony',
    category: 'default',
    priority: 1,
    condition: () => true,
    title: 'Balanced A-Line Silhouette',
    explanation: 'A classic and versatile design that works well for both casual and semi-formal occasions. The A-line skirt flatters most body types and offers comfortable movement.',
    ruleLogic: 'Default fallback recommendation when no higher-priority condition applies.'
  }
];

/* ==========================================================================
   3. DETERMINISTIC EVALUATION ENGINE
   ========================================================================== */

/**
 * Deterministically evaluates active designState against the rule table.
 * Returns exactly one primary recommendation + optional short supporting explanation.
 *
 * @param {object} state - Active designState
 * @returns {{ id: string, category: string, title: string, explanation: string, fullText: string, ruleLogic: string }}
 */
export function evaluateRecommendations(state) {
  if (!state) {
    return {
      id: 'default',
      category: 'default',
      title: 'Balanced A-Line Silhouette',
      explanation: 'A classic and versatile design that works well for both casual and semi-formal occasions.',
      fullText: 'Balanced A-Line Silhouette: A classic and versatile design that works well for both casual and semi-formal occasions.',
      ruleLogic: 'Default fallback.'
    };
  }

  // Sort rules deterministically by priority descending
  const sortedRules = [...RECOMMENDATION_RULES].sort((a, b) => b.priority - a.priority);

  // If user just made a specific change (e.g. fabric, pattern, size, component),
  // prioritize rules corresponding to that category
  if (state.lastChanged) {
    const contextCategory = (state.lastChanged === 'fabric') ? 'fabric'
      : (state.lastChanged === 'pattern') ? 'pattern'
      : (state.lastChanged === 'size') ? 'size'
      : (state.lastChanged === 'top' || state.lastChanged === 'bottom') ? 'silhouette'
      : (state.lastChanged === 'croquis' || state.lastChanged === 'figure') ? 'gender'
      : null;

    if (contextCategory) {
      const contextMatch = sortedRules.find(r => r.category === contextCategory && r.condition(state));
      if (contextMatch) {
        return formatRecommendationResult(contextMatch);
      }
    }
  }

  // Standard deterministic evaluation by priority order
  for (const rule of sortedRules) {
    try {
      if (rule.condition(state)) {
        return formatRecommendationResult(rule);
      }
    } catch (err) {
      // Graceful fallback on condition error
      continue;
    }
  }

  // Fallback
  const fallback = RECOMMENDATION_RULES[RECOMMENDATION_RULES.length - 1];
  return formatRecommendationResult(fallback);
}

/**
 * Formats a recommendation rule into the canonical result structure
 */
function formatRecommendationResult(rule) {
  const fullText = `${rule.title}: ${rule.explanation}`;
  return {
    id: rule.id,
    category: rule.category,
    title: rule.title,
    explanation: rule.explanation,
    fullText,
    ruleLogic: rule.ruleLogic
  };
}

/**
 * Public API matching existing app.js interface
 *
 * @param {object} state - Active designState
 * @returns {string} - Formatted recommendation text
 */
export function getRecommendation(state) {
  const result = evaluateRecommendations(state);
  return result.fullText;
}

/**
 * Public API for detailed recommendation inspection
 *
 * @param {object} state - Active designState
 * @returns {object} - Full recommendation object
 */
export function getDetailedRecommendation(state) {
  return evaluateRecommendations(state);
}
