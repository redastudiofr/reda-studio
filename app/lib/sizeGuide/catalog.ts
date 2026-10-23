/**
 * The reference tables behind every size guide estimate.
 *
 * No product in the shop comes with garment measurements: Shopify holds sizes
 * and a fit description, nothing in centimetres. Everything here is therefore
 * an estimate, built from what each piece's own data says — its category, its
 * cut, its leg shape — and graded across sizes the way ready-to-wear usually
 * is. The guide always presents these values as estimates ("≈", "estimated"),
 * never as the maker's measurements.
 *
 * Real measurements, once someone lays a piece flat and measures it, go in
 * products.ts (`verified`): they replace the estimate for that size and are
 * shown as verified. See docs/size-guide.md.
 */

export type Category =
  | 'tshirt'
  | 'longsleeve'
  | 'hoodie'
  | 'zip'
  | 'knit'
  | 'jacket'
  | 'jeans'
  | 'jogging'
  | 'shorts';

/** How close to the body the piece is cut, from the product's own words. */
export type Fit = 'slim' | 'regular' | 'relaxed' | 'oversized';

/** Bottoms only: the line of the leg below the thigh. */
export type LegShape = 'straight' | 'flared' | 'wide' | 'tapered';

export type Measure =
  | 'chest'
  | 'length'
  | 'shoulders'
  | 'sleeve'
  | 'waist'
  | 'inseam'
  | 'thigh'
  | 'opening';

export type Group = 'top' | 'bottom';

export const CATEGORY_GROUP: Record<Category, Group> = {
  tshirt: 'top',
  longsleeve: 'top',
  hoodie: 'top',
  zip: 'top',
  knit: 'top',
  jacket: 'top',
  jeans: 'bottom',
  jogging: 'bottom',
  shorts: 'bottom',
};

/** The measures each category shows, in the order of the table's columns. */
export const CATEGORY_MEASURES: Record<Category, Measure[]> = {
  tshirt: ['chest', 'length', 'shoulders', 'sleeve'],
  longsleeve: ['chest', 'length', 'shoulders', 'sleeve'],
  hoodie: ['chest', 'length', 'shoulders', 'sleeve'],
  zip: ['chest', 'length', 'shoulders', 'sleeve'],
  knit: ['chest', 'length', 'shoulders', 'sleeve'],
  jacket: ['chest', 'length', 'shoulders', 'sleeve'],
  jeans: ['waist', 'length', 'inseam', 'thigh', 'opening'],
  jogging: ['waist', 'length', 'inseam', 'thigh', 'opening'],
  shorts: ['waist', 'length', 'inseam', 'opening'],
};

/** An elastic waistband stretches: its waist is given at rest. */
export const ELASTIC_WAIST: Record<Category, boolean> = {
  tshirt: false,
  longsleeve: false,
  hoodie: false,
  zip: false,
  knit: false,
  jacket: false,
  jeans: false,
  jogging: true,
  shorts: true,
};

/**
 * Size M in a regular fit, in cm, garment laid flat: widths are half the
 * circumference (chest, thigh, opening), the waist is the full
 * circumference, lengths are measured from the highest point of the shoulder
 * (tops), or from the waistband (bottoms). Sleeves are measured from the
 * shoulder seam.
 */
type Table = Partial<Record<Measure, number>>;

export const BASE_M: Record<Category, Table> = {
  tshirt: {chest: 55, length: 71, shoulders: 48, sleeve: 21},
  longsleeve: {chest: 55, length: 71, shoulders: 47, sleeve: 64},
  hoodie: {chest: 59, length: 70, shoulders: 52, sleeve: 64},
  zip: {chest: 59, length: 69, shoulders: 52, sleeve: 64},
  knit: {chest: 56, length: 68, shoulders: 50, sleeve: 62},
  jacket: {chest: 61, length: 72, shoulders: 52, sleeve: 65},
  jeans: {waist: 85, length: 105, inseam: 80, thigh: 31, opening: 21},
  jogging: {waist: 74, length: 102, inseam: 76, thigh: 32, opening: 16},
  shorts: {waist: 76, length: 52, inseam: 18, opening: 31},
};

/**
 * What the cut changes against a regular fit. A wider cut on a top drops the
 * shoulder seam down the arm, so the sleeve measured from that seam gets
 * shorter — except on a short sleeve, which an oversized tee makes longer.
 */
const FIT_DELTA_TOP: Record<Fit, Table> = {
  slim: {chest: -4, length: -1, shoulders: -2, sleeve: 0},
  regular: {},
  relaxed: {chest: 3, length: 1, shoulders: 4, sleeve: -2},
  oversized: {chest: 6, length: 2, shoulders: 8, sleeve: -4},
};

const FIT_DELTA_SHORT_SLEEVE: Partial<Record<Fit, number>> = {
  slim: -1,
  relaxed: 1,
  oversized: 2,
};

const FIT_DELTA_BOTTOM: Record<Fit, Table> = {
  slim: {thigh: -2, opening: -2},
  regular: {},
  relaxed: {thigh: 2, opening: 1},
  oversized: {waist: 2, thigh: 4, opening: 3, length: 1},
};

/** Shorts: an "extended", oversized short is also longer. */
const FIT_DELTA_SHORTS: Partial<Record<Fit, Table>> = {
  oversized: {waist: 2, length: 4, inseam: 3, opening: 3},
  relaxed: {length: 2, inseam: 1, opening: 2},
};

/** Bottoms: the shape of the leg, against a straight leg. */
const LEG_DELTA: Record<LegShape, Table> = {
  straight: {},
  flared: {thigh: -2, opening: 6},
  wide: {thigh: 3, opening: 12},
  tapered: {thigh: 0, opening: -3},
};

/** Change per size step (S → M → L…), in cm. */
const GRADE: Record<Category, Table> = {
  tshirt: {chest: 3, length: 2, shoulders: 1.5, sleeve: 0.5},
  longsleeve: {chest: 3, length: 2, shoulders: 1.5, sleeve: 1},
  hoodie: {chest: 3, length: 2, shoulders: 1.5, sleeve: 1},
  zip: {chest: 3, length: 2, shoulders: 1.5, sleeve: 1},
  knit: {chest: 3, length: 2, shoulders: 1.5, sleeve: 1},
  jacket: {chest: 3, length: 2, shoulders: 1.5, sleeve: 1},
  jeans: {waist: 4, length: 1, inseam: 0.5, thigh: 1.5, opening: 0.5},
  jogging: {waist: 4, length: 1.5, inseam: 1, thigh: 1.5, opening: 0.5},
  shorts: {waist: 4, length: 1, inseam: 0.5, opening: 1.5},
};

/**
 * Letter sizes as steps away from M. A product whose sizes aren't letters
 * (a waist in inches, "one size") gets no estimate: the guide then shows
 * only its sizes and availability, as before.
 */
const SIZE_STEPS: Record<string, number> = {
  XXS: -3,
  XS: -2,
  S: -1,
  M: 0,
  L: 1,
  XL: 2,
  XXL: 3,
  '2XL': 3,
  XXXL: 4,
  '3XL': 4,
};

export function sizeStep(size: string): number | null {
  const step = SIZE_STEPS[size.trim().toUpperCase()];
  return step === undefined ? null : step;
}

/** Estimated garment measurements, in cm, for one size of one cut. */
export function estimateMeasures(
  category: Category,
  fit: Fit,
  legShape: LegShape | undefined,
  step: number,
): Table {
  const group = CATEGORY_GROUP[category];
  const base = BASE_M[category];
  const fitDelta =
    group === 'top'
      ? FIT_DELTA_TOP[fit]
      : category === 'shorts'
        ? (FIT_DELTA_SHORTS[fit] ?? {})
        : FIT_DELTA_BOTTOM[fit];
  const legDelta =
    group === 'bottom' && category !== 'shorts' && legShape
      ? LEG_DELTA[legShape]
      : {};
  const grade = GRADE[category];

  const out: Table = {};
  for (const measure of CATEGORY_MEASURES[category]) {
    let value = base[measure] ?? 0;
    if (category === 'tshirt' && measure === 'sleeve') {
      value += FIT_DELTA_SHORT_SLEEVE[fit] ?? 0;
    } else {
      value += fitDelta[measure] ?? 0;
    }
    value += legDelta[measure] ?? 0;
    value += (grade[measure] ?? 0) * step;
    out[measure] = Math.round(value);
  }
  return out;
}

/**
 * The usual body behind each letter size, men's ready-to-wear, in cm: the
 * centre of each size's range, one step apart. Used only to turn a height
 * and a weight into "the size this person usually wears".
 */
export const BODY_M = {chest: 97, waist: 83, height: 178};
export const BODY_STEP = {chest: 6, waist: 6, height: 5};
