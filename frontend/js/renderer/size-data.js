/**
 * FashionForge — Authoritative Garment Size System Data
 *
 * Source of Truth: Reference Size Chart (Measurement Unit: Inches)
 *
 * Columns:
 * SIZE | CHEST | WAIST | HIP | LENGTH | SHOULDER | ARM HOLE
 * XS   | 32    | 28–30 | 36  | 38–40  | 13       | 13
 * S    | 34    | 30–32 | 38  | 40–44  | 14       | 14
 * M    | 36    | 32–34 | 40  | 40–44  | 14.5     | 15
 * L    | 38    | 34–36 | 42  | 40–44  | 15       | 16
 * XL   | 40    | 36–38 | 44  | 42–46  | 15.5     | 17
 * XXL  | 42    | 38–40 | 46  | 42–46  | 16       | 18
 * 3XL  | 44    | 40–42 | 48  | 44–48  | 16.5     | 19
 * 4XL  | 46    | 42–44 | 50  | 44–48  | 17       | 20
 */

export const GARMENT_SIZES = {
  XS: {
    id: 'XS',
    name: 'Extra Small',
    chest: 32,
    waistMin: 28,
    waistMax: 30,
    waistDisplay: '28–30',
    hip: 36,
    lengthMin: 38,
    lengthMax: 40,
    lengthDisplay: '38–40',
    shoulder: 13.0,
    armhole: 13.0,
    unit: 'in',
    profileAnchor: 'XS',
    priceModifier: 0
  },
  S: {
    id: 'S',
    name: 'Small',
    chest: 34,
    waistMin: 30,
    waistMax: 32,
    waistDisplay: '30–32',
    hip: 38,
    lengthMin: 40,
    lengthMax: 44,
    lengthDisplay: '40–44',
    shoulder: 14.0,
    armhole: 14.0,
    unit: 'in',
    profileAnchor: 'XS',
    priceModifier: 0
  },
  M: {
    id: 'M',
    name: 'Medium (Reference Baseline)',
    chest: 36,
    waistMin: 32,
    waistMax: 34,
    waistDisplay: '32–34',
    hip: 40,
    lengthMin: 40,
    lengthMax: 44,
    lengthDisplay: '40–44',
    shoulder: 14.5,
    armhole: 15.0,
    unit: 'in',
    profileAnchor: 'M',
    priceModifier: 0
  },
  L: {
    id: 'L',
    name: 'Large',
    chest: 38,
    waistMin: 34,
    waistMax: 36,
    waistDisplay: '34–36',
    hip: 42,
    lengthMin: 40,
    lengthMax: 44,
    lengthDisplay: '40–44',
    shoulder: 15.0,
    armhole: 16.0,
    unit: 'in',
    profileAnchor: 'M',
    priceModifier: 0
  },
  XL: {
    id: 'XL',
    name: 'Extra Large',
    chest: 40,
    waistMin: 36,
    waistMax: 38,
    waistDisplay: '36–38',
    hip: 44,
    lengthMin: 42,
    lengthMax: 46,
    lengthDisplay: '42–46',
    shoulder: 15.5,
    armhole: 17.0,
    unit: 'in',
    profileAnchor: 'XL',
    priceModifier: 0
  },
  XXL: {
    id: 'XXL',
    name: '2X Large',
    chest: 42,
    waistMin: 38,
    waistMax: 40,
    waistDisplay: '38–40',
    hip: 46,
    lengthMin: 42,
    lengthMax: 46,
    lengthDisplay: '42–46',
    shoulder: 16.0,
    armhole: 18.0,
    unit: 'in',
    profileAnchor: 'XL',
    priceModifier: 0
  },
  '3XL': {
    id: '3XL',
    name: '3X Large',
    chest: 44,
    waistMin: 40,
    waistMax: 42,
    waistDisplay: '40–42',
    hip: 48,
    lengthMin: 44,
    lengthMax: 48,
    lengthDisplay: '44–48',
    shoulder: 16.5,
    armhole: 19.0,
    unit: 'in',
    profileAnchor: '3XL',
    priceModifier: 0
  },
  '4XL': {
    id: '4XL',
    name: '4X Large',
    chest: 46,
    waistMin: 42,
    waistMax: 44,
    waistDisplay: '42–44',
    hip: 50,
    lengthMin: 44,
    lengthMax: 48,
    lengthDisplay: '44–48',
    shoulder: 17.0,
    armhole: 20.0,
    unit: 'in',
    profileAnchor: '3XL',
    priceModifier: 0
  }
};

export const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];

/**
 * Returns structured measurement object for given size ID
 */
export function getSizeData(sizeId = 'M') {
  return GARMENT_SIZES[sizeId] || GARMENT_SIZES.M;
}

/**
 * Returns full ordered list of size records for tables & selectors
 */
export function getAllSizes() {
  return SIZE_ORDER.map(id => GARMENT_SIZES[id]);
}
