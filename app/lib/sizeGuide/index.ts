import {
  BODY_M,
  BODY_STEP,
  CATEGORY_GROUP,
  CATEGORY_MEASURES,
  ELASTIC_WAIST,
  estimateMeasures,
  sizeStep,
  type Category,
  type Fit,
  type LegShape,
  type Measure,
} from './catalog';
import {SIZE_PROFILES, type SizeProfile} from './products';

export type {Category, Fit, LegShape, Measure} from './catalog';

/*
 * Size guide logic: which category and cut a product is, its estimated
 * measurements per size, and a size recommendation from a height, a weight
 * and a preferred fit. No React here — see app/components/ProductSizeGuide.
 */

export type Preference = 'fitted' | 'regular' | 'oversized';

export type ResolvedProfile = SizeProfile & {
  /** True when the profile was guessed from the product's text. */
  inferred: boolean;
};

const CATEGORY_PATTERNS: Array<[Category, RegExp]> = [
  // Order matters: a "zip hoodie" is a zip, "short" must win over "denim".
  ['shorts', /\bshorts?\b|\bbermuda/],
  ['zip', /\bzip\b|zip[- ]?up|zipped hoodie|zip hoodie/],
  ['hoodie', /hoodie|sweat à capuche|\bsweat(shirt)?\b|crewneck/],
  ['longsleeve', /long ?sleeve|manches longues/],
  ['tshirt', /\bt-?shirts?\b|\btshirts?\b|\btee\b/],
  ['knit', /\bknit|maille|\bpull\b|sweater|jumper/],
  ['jacket', /jacket|veste|blouson|coat|manteau/],
  ['jogging', /jogging|jogger|sweatpants?|track ?pants?|survêtement/],
  ['jeans', /\bjeans?\b|\bpants?\b|trousers?|pantalon|cargo/],
];

function categoryOf(text: string): Category | null {
  for (const [category, pattern] of CATEGORY_PATTERNS) {
    if (pattern.test(text)) return category;
  }
  return null;
}

function fitOf(raw: string): Fit {
  // Sizing advice ("one size up for a more oversized look", "une taille
  // au-dessus") describes another way to wear it, not the cut itself.
  const text = raw
    .split(/[.!?\n]/)
    .filter(
      (sentence) =>
        !/size (up|down)|sizes? (up|down)|one size|une taille|taille au-dessus|taille en dessous/.test(
          sentence,
        ),
    )
    .join('.');
  if (/fitted-to-relaxed/.test(text)) return 'regular';
  if (/slightly (oversized|baggy)|légèrement (oversize|ample)/.test(text)) return 'relaxed';
  if (/oversized?|baggy/.test(text)) return 'oversized';
  if (/\bslim\b|close-fitting|\bfitted\b|près du corps|coupe (fine|ajustée)/.test(text)) {
    return 'slim';
  }
  if (/relaxed|\bloose\b|ample|décontract/.test(text)) return 'relaxed';
  return 'regular';
}

function legShapeOf(text: string, category: Category): LegShape | undefined {
  if (CATEGORY_GROUP[category] !== 'bottom' || category === 'shorts') return undefined;
  if (/flare|évasé|pattes d'éph/.test(text)) return 'flared';
  if (/wide[- ]leg|jambe large|\blarge\b/.test(text)) return 'wide';
  if (/straight|jambe droite/.test(text)) return 'straight';
  if (/tapered|cuffed|fuselé|resserré/.test(text)) return 'tapered';
  return category === 'jogging' ? 'tapered' : 'straight';
}

/**
 * The product's category and cut. A line in products.ts wins; otherwise
 * they are read from the title (the most reliable source — several
 * descriptions in the shop are copied from another product), then from the
 * description. Returns null when nothing says what kind of garment it is.
 */
export function resolveProfile(product: {
  handle: string;
  title: string;
  description?: string | null;
}): ResolvedProfile | null {
  const known = SIZE_PROFILES[product.handle];
  if (known) return {...known, inferred: false};

  const title = product.title.toLowerCase();
  const description = (product.description ?? '').toLowerCase();
  const category = categoryOf(title) ?? categoryOf(description);
  if (!category) return null;
  const text = `${title} ${description}`;
  return {
    category,
    fit: fitOf(text),
    legShape: legShapeOf(text, category),
    inferred: true,
  };
}

export type MeasureValue = {value: number; verified: boolean};

export type GuideRow = {
  size: string;
  step: number;
  available: boolean;
  measures: Partial<Record<Measure, MeasureValue>>;
};

export type Guide = {
  profile: ResolvedProfile;
  measures: Measure[];
  rows: GuideRow[];
  elasticWaist: boolean;
  /** At least one value in the table is a real measurement. */
  anyVerified: boolean;
};

/**
 * The size table for this product: one row per size it really has in
 * Shopify, in Shopify's order, each measure verified when products.ts has
 * the real value and estimated otherwise. Null when a size isn't a letter
 * size (nothing to grade from) or the garment type is unknown.
 */
export function buildGuide(
  profile: ResolvedProfile | null,
  sizes: Array<{name: string; available: boolean}>,
): Guide | null {
  if (!profile || !sizes.length) return null;
  const steps = sizes.map((size) => sizeStep(size.name));
  if (steps.some((step) => step === null)) return null;

  const measures = CATEGORY_MEASURES[profile.category];
  let anyVerified = false;
  const rows = sizes.map((size, index) => {
    const step = steps[index] as number;
    const estimate = estimateMeasures(profile.category, profile.fit, profile.legShape, step);
    const real = profile.verified?.[size.name.trim().toUpperCase()] ?? {};
    const values: GuideRow['measures'] = {};
    for (const measure of measures) {
      const verifiedValue = real[measure];
      if (typeof verifiedValue === 'number') {
        anyVerified = true;
        values[measure] = {value: verifiedValue, verified: true};
      } else if (typeof estimate[measure] === 'number') {
        values[measure] = {value: estimate[measure] as number, verified: false};
      }
    }
    return {size: size.name.trim(), step, available: size.available, measures: values};
  });

  return {
    profile,
    measures,
    rows,
    elasticWaist: ELASTIC_WAIST[profile.category],
    anyVerified,
  };
}

const FIT_LEVEL: Record<Fit, number> = {slim: 0, regular: 1, relaxed: 2, oversized: 3};
const STEP_LABEL: Record<number, string> = {
  [-3]: 'XXS',
  [-2]: 'XS',
  [-1]: 'S',
  0: 'M',
  1: 'L',
  2: 'XL',
  3: 'XXL',
  4: '3XL',
};

export const HEIGHT_RANGE = {min: 140, max: 215};
export const WEIGHT_RANGE = {min: 35, max: 180};

/** Why a size was suggested — rendered into words by the component. */
export type Reason =
  | {code: 'usualTop'; size: string; chest: number}
  | {code: 'usualBottom'; size: string; waist: number}
  | {code: 'sizeUp'; fit: Fit}
  | {code: 'sizeDown'; fit: Fit}
  | {code: 'asIntended'; fit: Fit}
  | {code: 'waistFixed'}
  | {code: 'largestAvailable'; size: string}
  | {code: 'smallestAvailable'; size: string}
  | {code: 'soldOut'; size: string};

export type Recommendation = {
  row: GuideRow;
  reasons: Reason[];
  /**
   * Room between body and garment, in cm, around the chest (tops) or the
   * waist (fixed-waist bottoms). Absent for elastic waists.
   */
  ease?: {measure: 'chest' | 'waist'; value: number};
};

/**
 * The body behind a height and a weight, in cm. A rough population average
 * — two people of the same height and weight can differ by a size — which
 * is why the guide presents the result as a suggestion.
 */
function estimateBody(heightCm: number, weightKg: number) {
  const bmi = weightKg / (heightCm / 100) ** 2;
  return {
    chest: 97 + (bmi - 23.5) * 2.4 + (heightCm - BODY_M.height) * 0.3,
    waist: 83 + (bmi - 23.5) * 3 + (heightCm - BODY_M.height) * 0.25,
  };
}

export function recommendSize(
  guide: Guide,
  input: {heightCm: number; weightKg: number; preference: Preference},
): Recommendation {
  const {profile} = guide;
  const group = CATEGORY_GROUP[profile.category];
  const body = estimateBody(input.heightCm, input.weightKg);
  const heightSteps = (input.heightCm - BODY_M.height) / BODY_STEP.height;
  const bodySteps =
    group === 'top'
      ? (body.chest - BODY_M.chest) / BODY_STEP.chest
      : (body.waist - BODY_M.waist) / BODY_STEP.waist;
  // Mostly the girth that decides the size, a little the height (length).
  const usual = Math.max(-3, Math.min(4, Math.round(bodySteps * 0.75 + heightSteps * 0.25)));

  const reasons: Reason[] = [
    group === 'top'
      ? {code: 'usualTop', size: STEP_LABEL[usual], chest: Math.round(body.chest)}
      : {code: 'usualBottom', size: STEP_LABEL[usual], waist: Math.round(body.waist)},
  ];

  // The brand's own advice, per product: your usual size gives the intended
  // cut; one up for a looser wear on a close or regular cut, one down for a
  // closer wear on a loose one. A fixed waist (jeans) is chosen by the waist.
  const level = FIT_LEVEL[profile.fit];
  const fixedWaist = group === 'bottom' && !guide.elasticWaist;
  let adjust = 0;
  if (input.preference === 'oversized' && level <= 2) adjust = 1;
  if (input.preference === 'fitted' && level >= 2) adjust = -1;
  if (fixedWaist && adjust !== 0) {
    adjust = 0;
    reasons.push({code: 'waistFixed'});
  } else if (adjust > 0) {
    reasons.push({code: 'sizeUp', fit: profile.fit});
  } else if (adjust < 0) {
    reasons.push({code: 'sizeDown', fit: profile.fit});
  } else {
    reasons.push({code: 'asIntended', fit: profile.fit});
  }

  const target = usual + adjust;
  let best = guide.rows[0];
  for (const row of guide.rows) {
    const gap = Math.abs(row.step - target);
    const bestGap = Math.abs(best.step - target);
    if (gap < bestGap || (gap === bestGap && row.step > best.step)) best = row;
  }
  if (best.step < target) reasons.push({code: 'largestAvailable', size: best.size});
  if (best.step > target) reasons.push({code: 'smallestAvailable', size: best.size});
  if (!best.available) reasons.push({code: 'soldOut', size: best.size});

  let ease: Recommendation['ease'];
  const chest = best.measures.chest?.value;
  const waist = best.measures.waist?.value;
  if (group === 'top' && chest) {
    ease = {measure: 'chest', value: Math.round(chest * 2 - body.chest)};
  } else if (fixedWaist && waist) {
    ease = {measure: 'waist', value: Math.round(waist - body.waist)};
  }

  return {row: best, reasons, ease};
}
