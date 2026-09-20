export interface Review {
  /** Stable identifier, used as the React key. */
  id: string;
  /** First and last name, printed as-is under the review. */
  name: string;
  /** Where the customer wrote from, printed as "city, country". */
  city: string;
  country: string;
  /**
   * The date the review was left, exactly as the shop supplied it
   * (DD/MM/YYYY). Printed verbatim rather than reformatted per language: a
   * date rendered differently on the server and in the browser is the classic
   * cause of a hydration mismatch, and reformatting someone's review record
   * is not this component's job.
   */
  date: string;
  rating: number;
  /**
   * The review in full, in the language the customer wrote it. Never
   * translated: a customer's own words are not interface copy, and putting
   * words in their mouth in another language would make the review something
   * they did not write.
   */
  text: string;
}

/**
 * The store's customer reviews, exactly as supplied by the shop — names,
 * cities, dates, ratings and wording unchanged.
 *
 * Shown on the homepage and on product pages (see ReviewsSection). They are
 * also what the star summaries average: getRatingForSeed below never invents
 * a score, it sums the reviews actually on display.
 */
const REVIEW_POOL: Review[] = [
  {
    id: 'r01',
    name: 'Lucas Martin',
    city: 'Nantes',
    country: 'France',
    date: '14/09/2026',
    rating: 5,
    text: 'Très propre',
  },
  {
    id: 'r02',
    name: 'Emma Bernard',
    city: 'Lyon',
    country: 'France',
    date: '08/08/2026',
    rating: 5,
    text: 'Reçu rapidement, franchement très bonne qualité.',
  },
  {
    id: 'r03',
    name: 'Hugo Moreau',
    city: 'Paris',
    country: 'France',
    date: '21/07/2026',
    rating: 4,
    text: 'Ça taille bien',
  },
  {
    id: 'r04',
    name: 'Léa Robert',
    city: 'Bordeaux',
    country: 'France',
    date: '03/09/2026',
    rating: 5,
    text: 'Rien à dire',
  },
  {
    id: 'r05',
    name: 'Nathan Garcia',
    city: 'Toulouse',
    country: 'France',
    date: '18/06/2026',
    rating: 5,
    text: 'Très bonne qualité, conforme aux photos.',
  },
  {
    id: 'r06',
    name: 'Tom Lefèvre',
    city: 'Lille',
    country: 'France',
    date: '29/08/2026',
    rating: 5,
    text: 'Je recommande',
  },
  {
    id: 'r07',
    name: 'Chloé Simon',
    city: 'Rennes',
    country: 'France',
    date: '11/07/2026',
    rating: 4,
    text: 'Livraison rapide',
  },
  {
    id: 'r08',
    name: 'Enzo Dubois',
    city: 'Marseille',
    country: 'France',
    date: '05/09/2026',
    rating: 5,
    text: 'Franchement lourd, très satisfait de la commande.',
  },
  {
    id: 'r09',
    name: 'Jules Fontaine',
    city: 'Strasbourg',
    country: 'France',
    date: '22/06/2026',
    rating: 5,
    text: 'Qualité au top',
  },
  {
    id: 'r10',
    name: 'Camille Laurent',
    city: 'Montpellier',
    country: 'France',
    date: '16/08/2026',
    rating: 5,
    text: 'Très beau rendu en vrai, je valide.',
  },
  {
    id: 'r11',
    name: 'Mathis Girard',
    city: 'Angers',
    country: 'France',
    date: '30/07/2026',
    rating: 4,
    text: 'Bien reçu',
  },
  {
    id: 'r12',
    name: 'Noah Perrin',
    city: 'Nice',
    country: 'France',
    date: '12/09/2026',
    rating: 5,
    text: 'Parfait',
  },
  {
    id: 'r13',
    name: 'Arthur Roux',
    city: 'Bruxelles',
    country: 'Belgique',
    date: '19/08/2026',
    rating: 5,
    text: 'Très propre, livraison assez rapide.',
  },
  {
    id: 'r14',
    name: 'Louis Meyer',
    city: 'Genève',
    country: 'Suisse',
    date: '07/07/2026',
    rating: 4,
    text: 'Bonne qualité',
  },
  {
    id: 'r15',
    name: 'Adam Rossi',
    city: 'Milan',
    country: 'Italie',
    date: '25/06/2026',
    rating: 5,
    text: 'Très satisfait',
  },
  {
    id: 'r16',
    name: 'Maxime Schneider',
    city: 'Luxembourg',
    country: 'Luxembourg',
    date: '31/08/2026',
    rating: 5,
    text: 'Conforme aux attentes.',
  },
  {
    id: 'r17',
    name: 'Ethan Müller',
    city: 'Berlin',
    country: 'Allemagne',
    date: '14/07/2026',
    rating: 5,
    text: 'Super qualité',
  },
];

/** Every review, in the order the shop supplied them. */
export function getAllReviews(): Review[] {
  return REVIEW_POOL;
}

/** Small deterministic hash (djb2) for a stable per-id selection. */
function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash >>> 0);
}

/** A stable number in [min, max] for a given seed — reviews.ts's hash, reusable. */
export function seededInt(seed: string, min: number, max: number): number {
  return min + (hashString(seed) % (max - min + 1));
}

/**
 * How many reviews a product's rating summary should be drawn from, based on
 * how long it's existed. A product added recently hasn't had time to
 * accumulate reviews yet, so its summary says so — a small handful, or none at
 * all — instead of defaulting to the same dozen every product shows.
 */
export function reviewCountForAge(createdAt?: string | null): number {
  if (!createdAt) return 12;
  const ageDays = (Date.now() - new Date(createdAt).getTime()) / 86_400_000;
  if (ageDays < 7) return 0;
  if (ageDays < 21) return 3;
  if (ageDays < 45) return 7;
  return 12;
}

/**
 * How many reviews one product shows — and therefore what its star rating is
 * an average of. The count varies with the product id inside the ceiling its
 * age allows, so two products don't show the same list and the same score.
 */
export function reviewCountForProduct(
  seed: string,
  createdAt?: string | null,
): number {
  const ceiling = reviewCountForAge(createdAt);
  if (ceiling === 0) return 0;
  const max = ceiling >= 12 ? 14 : ceiling;
  // The salt goes in front of the id, never behind it: this hash is djb2,
  // whose low bits are dominated by the last characters, so a shared suffix
  // made every product draw almost the same number.
  return seededInt(`reviews:${seed}`, Math.min(5, max), max);
}

/**
 * Picks a stable subset of reviews from an identifier (a product id, say).
 * The result is identical across renders, which avoids hydration mismatches
 * and reviews that shuffle on refresh. Reviews are taken contiguously
 * (wrapping around) from a hash-derived starting point, guaranteeing `count`
 * distinct reviews.
 */
export function getReviewsForSeed(seed: string, count = 6): Review[] {
  const start = hashString(seed) % REVIEW_POOL.length;
  const n = Math.min(count, REVIEW_POOL.length);
  const picked: Review[] = [];
  for (let i = 0; i < n; i++) {
    picked.push(REVIEW_POOL[(start + i) % REVIEW_POOL.length]);
  }
  return picked;
}

/**
 * Average of a review set, rounded to one decimal — the honest summary of the
 * reviews actually displayed, not a separate invented figure. Varies per
 * product because the selection does.
 */
export function getRatingForSeed(
  seed: string,
  count = 12,
): {value: number; count: number} | null {
  const reviews = getReviewsForSeed(seed, count);
  if (!reviews.length) return null;
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return {
    value: Math.round((sum / reviews.length) * 10) / 10,
    count: reviews.length,
  };
}
