import type {Category, Fit, LegShape, Measure} from './catalog';

export type SizeProfile = {
  category: Category;
  fit: Fit;
  legShape?: LegShape;
  /**
   * Real measurements, in cm, garment laid flat (see BASE_M in catalog.ts
   * for how each one is taken), by size: `{M: {chest: 58, length: 71}}`.
   * Any value given here replaces the estimate for that size and measure,
   * and the guide shows it as verified. Empty everywhere for now — no
   * measurement has been taken yet.
   */
  verified?: Partial<Record<string, Partial<Record<Measure, number>>>>;
};

/**
 * One line per product, keyed by Shopify handle: what its category and cut
 * are, read from its own title and description (quoted in the comment).
 * The handle, not the title, is the key — some titles say another colour
 * than their handle, and a title can be edited in the admin at any time.
 *
 * A product missing from this list still gets a guide: inferProfile() in
 * index.ts reads its category and cut from its title and description. Add a
 * line here when that guess is wrong, or to record real measurements.
 */
export const SIZE_PROFILES: Record<string, SizeProfile> = {
  // Joggings
  // "relaxed, wide-leg fit", "slightly oversized", drawcords at the ankles
  'asap-jogging-black': {category: 'jogging', fit: 'relaxed', legShape: 'wide'},
  'asap-jogging-grey': {category: 'jogging', fit: 'relaxed', legShape: 'wide'},
  // Its description is the Vercetti hoodie's, word for word: only the title
  // says what it is. Estimated as a regular jogger.
  'vercetti-jogging-gris': {category: 'jogging', fit: 'regular', legShape: 'tapered'},

  // Jeans
  // "fitted silhouette through the waist and thighs before gradually flaring"
  'jeans-flared-visionary-bleu': {category: 'jeans', fit: 'slim', legShape: 'flared'},
  'jeans-flared-visionary-noir': {category: 'jeans', fit: 'slim', legShape: 'flared'},
  'reda-jeans-raw-denim-blue-1': {category: 'jeans', fit: 'slim', legShape: 'flared'},
  // "fitted-to-relaxed waist and thigh with a gradual flare"
  'money-jeans-flared-grey': {category: 'jeans', fit: 'regular', legShape: 'flared'},
  // "relaxed straight-leg silhouette"
  'kaizen-jeans-raw-denim-blue': {category: 'jeans', fit: 'relaxed', legShape: 'straight'},
  'sherif-jeans-washed-blue-blue': {category: 'jeans', fit: 'relaxed', legShape: 'straight'},

  // Shorts — "oversized fit with an extended silhouette", elastic waistband
  'win-short-blue': {category: 'shorts', fit: 'oversized'},
  'win-short-pink': {category: 'shorts', fit: 'oversized'},
  'reda-short-raw-denim-bleu': {category: 'shorts', fit: 'oversized'},

  // T-shirts
  // "relaxed, slightly baggy silhouette"
  'tshirt-business-after-hour-white': {category: 'tshirt', fit: 'relaxed'},
  // Its description is the I Only Want Baddies longsleeve's; the title says
  // T-shirt, and the copied text says "relaxed, slightly oversized".
  'im-scared-of-girls-tshirt-white': {category: 'tshirt', fit: 'relaxed'},

  // Longsleeves, close-fitting — "slim fit", "close-fitting silhouette",
  // "coupe près du corps", "fitted silhouette"
  'flower-long-sleeve': {category: 'longsleeve', fit: 'slim'},
  'montana-long-sleeve-blanc': {category: 'longsleeve', fit: 'slim'},
  'heritage-long-sleeve-blanc': {category: 'longsleeve', fit: 'slim'},
  'wayne-long-sleeve-noir': {category: 'longsleeve', fit: 'slim'},
  'focused-on-million-longsleeve-blanc': {category: 'longsleeve', fit: 'slim'},
  'focused-on-million-longsleeve-noir': {category: 'longsleeve', fit: 'slim'},
  'signature-long-sleeve-noir': {category: 'longsleeve', fit: 'slim'},
  'royal-longsleeve-white': {category: 'longsleeve', fit: 'slim'},

  // Longsleeves, loose — "relaxed fit … slightly oversized silhouette"
  'i-only-want-baddies-longsleeve-white': {category: 'longsleeve', fit: 'relaxed'},
  'sakura-longsleeve-white': {category: 'longsleeve', fit: 'relaxed'},
  'reda-longsleeve-black': {category: 'longsleeve', fit: 'relaxed'},
  'reda-longsleeve-white': {category: 'longsleeve', fit: 'relaxed'},

  // Hoodies — "relaxed, structured fit", "comfortable, tailored fit"; the
  // brand says one size up for an oversized look, so it isn't cut oversized
  'vercetti-hoodie-noir-1': {category: 'hoodie', fit: 'regular'},
  'vercetti-hoodie-noir': {category: 'hoodie', fit: 'regular'},

  // Zip hoodies
  // "oversized, relaxed fit … loose streetwear fit"
  'leopard-zip-dark-grey': {category: 'zip', fit: 'oversized'},
  'leopard-zip-light-grey': {category: 'zip', fit: 'oversized'},
  // "relaxed fit … slightly oversized silhouette"
  'nebraska-classic-zip-grey': {category: 'zip', fit: 'relaxed'},

  // Knit — "relaxed fit … slightly oversized silhouette"
  'money-knit-black': {category: 'knit', fit: 'relaxed'},
  'money-knit-grey': {category: 'knit', fit: 'relaxed'},

  // Jacket — "relaxed silhouette designed for … easy layering"
  'rain-jacket-leopard-black': {category: 'jacket', fit: 'relaxed'},
};
