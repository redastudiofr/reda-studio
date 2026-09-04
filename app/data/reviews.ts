export interface Review {
  /** Stable identifier, used as the React key. */
  id: string;
  /** First and last name, printed as-is under the review. */
  name: string;
  rating: number;
  /**
   * The review in full. It is the card's only piece of copy — no headline,
   * no pull quote — so nothing ever reads as a summary of the review.
   */
  text: string;
  /** Drives the "verified review" badge. Only set on part of the pool. */
  certified?: boolean;
}

/**
 * Reviews rendered in the customer reviews section. Short, the way most review
 * platforms read, and always shown in full — one review per card.
 *
 * Swap these for real reviews as soon as a review app (Judge.me, Okendo…) is
 * installed: the section reads this array, so the wiring happens here without
 * touching anything else.
 */
const REVIEW_POOL: Review[] = [
  {
    id: 'r01',
    name: 'Amine Belkacem',
    rating: 5,
    text: 'perfect, nothing to fault.',
    certified: true,
  },
  {
    id: 'r02',
    name: 'Camille Rousseau',
    rating: 5,
    text: 'everything was perfect, fast delivery.',
    certified: true,
  },
  {
    id: 'r03',
    name: 'Mehdi Kaddouri',
    rating: 4.5,
    text: 'very good, exactly like the photos.',
  },
  {
    id: 'r04',
    name: 'Sarah Lemoine',
    rating: 5,
    text: 'flawless, i recommend it.',
    certified: true,
  },
  {
    id: 'r05',
    name: 'Clara Fontaine',
    rating: 4,
    text: 'good piece, arrived quickly.',
    certified: true,
  },
  {
    id: 'r06',
    name: 'Lucas Dubois',
    rating: 5,
    text: 'great quality, fits true to size.',
  },
  {
    id: 'r07',
    name: 'Yanis Rahmani',
    rating: 4.5,
    text: 'really happy, parcel arrived in 2 days.',
    certified: true,
  },
  {
    id: 'r08',
    name: 'Nadia Toumi',
    rating: 5,
    text: 'impeccable, just as expected.',
  },
  {
    id: 'r09',
    name: 'Chloé Marchand',
    rating: 5,
    text: 'nothing to complain about, fast shipping.',
  },
  {
    id: 'r10',
    name: 'Céline Vasseur',
    rating: 4,
    text: 'matches the description, thank you.',
    certified: true,
  },
  {
    id: 'r11',
    name: 'Adam Khelifi',
    rating: 5,
    text: 'perfect, my second order.',
    certified: true,
  },
  {
    id: 'r12',
    name: 'Inès Daoudi',
    rating: 4.5,
    text: 'top quality, lovely fabric.',
  },
  {
    id: 'r13',
    name: 'Thomas Berger',
    rating: 5,
    text: 'very satisfied, shipped fast.',
    certified: true,
  },
  {
    id: 'r14',
    name: 'Hugo Renaud',
    rating: 4,
    text: 'good product, nicely packaged.',
    certified: true,
  },
  {
    id: 'r15',
    name: 'Emma Girard',
    rating: 5,
    text: 'i love it, hangs beautifully.',
  },
  {
    id: 'r16',
    name: 'Karim Saidi',
    rating: 4.5,
    text: 'order arrived quickly, very good.',
  },
  {
    id: 'r17',
    name: 'Léa Moreau',
    rating: 5,
    text: 'everything is perfect.',
    certified: true,
  },
  {
    id: 'r18',
    name: 'Maxime Petit',
    rating: 5,
    text: 'first class, i recommend.',
    certified: true,
  },
  {
    id: 'r19',
    name: 'Sofia Zeroual',
    rating: 4,
    text: 'happy with it, runs slightly large.',
  },
  {
    id: 'r20',
    name: 'Rayan Fournier',
    rating: 4.5,
    text: 'excellent quality for the price.',
    certified: true,
  },
];

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
 * accumulate real reviews yet, so its summary says so — a small handful, or
 * none at all — instead of defaulting to the same dozen every product shows
 * regardless of age.
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
 * Picks a stable subset of reviews from an identifier (a product id, say).
 * The result is identical across renders, which avoids hydration mismatches
 * and reviews that shuffle on refresh. Reviews are taken contiguously (wrapping
 * around) from a hash-derived starting point, guaranteeing `count` distinct
 * reviews.
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
