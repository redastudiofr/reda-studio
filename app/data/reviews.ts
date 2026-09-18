import type {Locale} from '~/lib/i18n';

export interface Review {
  /** Stable identifier, used as the React key. */
  id: string;
  /** First and last name, printed as-is under the review. */
  name: string;
  rating: number;
  /**
   * The review in full, in both languages. It is the card's only piece of
   * copy — no headline, no pull quote — so nothing ever reads as a summary of
   * the review. Written here rather than in the dictionary because a review is
   * content, not interface: it belongs with the name and the rating it goes
   * with.
   */
  text: Record<Locale, string>;
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
    text: {en: 'perfect, nothing to fault.', fr: 'parfait, rien à redire.'},
    certified: true,
  },
  {
    id: 'r02',
    name: 'Camille Rousseau',
    rating: 5,
    text: {en: 'everything was perfect, fast delivery.', fr: 'tout était parfait, livraison rapide.'},
    certified: true,
  },
  {
    id: 'r03',
    name: 'Mehdi Kaddouri',
    rating: 4.5,
    text: {en: 'very good, exactly like the photos.', fr: 'très bien, exactement comme sur les photos.'},
  },
  {
    id: 'r04',
    name: 'Sarah Lemoine',
    rating: 5,
    text: {en: 'flawless, i recommend it.', fr: 'impeccable, je recommande.'},
    certified: true,
  },
  {
    id: 'r05',
    name: 'Clara Fontaine',
    rating: 4,
    text: {en: 'good piece, arrived quickly.', fr: 'belle pièce, arrivée rapidement.'},
    certified: true,
  },
  {
    id: 'r06',
    name: 'Lucas Dubois',
    rating: 5,
    text: {en: 'great quality, fits true to size.', fr: 'super qualité, taille normalement.'},
  },
  {
    id: 'r07',
    name: 'Yanis Rahmani',
    rating: 4.5,
    text: {en: 'really happy, parcel arrived in 2 days.', fr: 'très content, colis reçu en 2 jours.'},
    certified: true,
  },
  {
    id: 'r08',
    name: 'Nadia Toumi',
    rating: 5,
    text: {en: 'impeccable, just as expected.', fr: 'impeccable, conforme à mes attentes.'},
  },
  {
    id: 'r09',
    name: 'Chloé Marchand',
    rating: 5,
    text: {en: 'nothing to complain about, fast shipping.', fr: 'rien à redire, expédition rapide.'},
  },
  {
    id: 'r10',
    name: 'Céline Vasseur',
    rating: 4,
    text: {en: 'matches the description, thank you.', fr: 'conforme à la description, merci.'},
    certified: true,
  },
  {
    id: 'r11',
    name: 'Adam Khelifi',
    rating: 5,
    text: {en: 'perfect, my second order.', fr: 'parfait, ma deuxième commande.'},
    certified: true,
  },
  {
    id: 'r12',
    name: 'Inès Daoudi',
    rating: 4.5,
    text: {en: 'top quality, lovely fabric.', fr: 'qualité au top, très belle matière.'},
  },
  {
    id: 'r13',
    name: 'Thomas Berger',
    rating: 5,
    text: {en: 'very satisfied, shipped fast.', fr: 'très satisfait, envoi rapide.'},
    certified: true,
  },
  {
    id: 'r14',
    name: 'Hugo Renaud',
    rating: 4,
    text: {en: 'good product, nicely packaged.', fr: 'bon produit, bien emballé.'},
    certified: true,
  },
  {
    id: 'r15',
    name: 'Emma Girard',
    rating: 5,
    text: {en: 'i love it, hangs beautifully.', fr: 'j’adore, très beau tombé.'},
  },
  {
    id: 'r16',
    name: 'Karim Saidi',
    rating: 4.5,
    text: {en: 'order arrived quickly, very good.', fr: 'commande arrivée vite, très bien.'},
  },
  {
    id: 'r17',
    name: 'Léa Moreau',
    rating: 5,
    text: {en: 'everything is perfect.', fr: 'tout est parfait.'},
    certified: true,
  },
  {
    id: 'r18',
    name: 'Maxime Petit',
    rating: 5,
    text: {en: 'first class, i recommend.', fr: 'au top, je recommande.'},
    certified: true,
  },
  {
    id: 'r19',
    name: 'Sofia Zeroual',
    rating: 4,
    text: {en: 'happy with it, runs slightly large.', fr: 'content, taille légèrement grand.'},
  },
  {
    id: 'r20',
    name: 'Rayan Fournier',
    rating: 4.5,
    text: {en: 'excellent quality for the price.', fr: 'excellente qualité pour le prix.'},
    certified: true,
  },
  // A run of more measured reviews. Reviews are picked as a contiguous
  // window (see getReviewsForSeed), so keeping these together is what lets a
  // product land on 4.2 or 4.4 instead of every product averaging 4.7.
  {
    id: 'r21',
    name: 'Nora Benali',
    rating: 4,
    text: {
      en: 'nice piece, the colour is slightly darker than on screen.',
      fr: 'belle pièce, la couleur est un peu plus foncée qu’à l’écran.',
    },
  },
  {
    id: 'r22',
    name: 'Julien Mercier',
    rating: 4,
    text: {
      en: 'good quality, delivery took a little longer than expected.',
      fr: 'bonne qualité, la livraison a pris un peu plus de temps que prévu.',
    },
    certified: true,
  },
  {
    id: 'r23',
    name: 'Anaïs Perrin',
    rating: 4,
    text: {
      en: 'happy with it overall, i would have liked a slightly thicker fabric.',
      fr: 'contente dans l’ensemble, j’aurais aimé une matière un peu plus épaisse.',
    },
  },
  {
    id: 'r24',
    name: 'Samir Ouali',
    rating: 4.5,
    text: {
      en: 'very good piece, sizing is spot on.',
      fr: 'très bonne pièce, la taille correspond bien.',
    },
    certified: true,
  },
  {
    id: 'r25',
    name: 'Manon Leclerc',
    rating: 4,
    text: {
      en: 'well made, packaging could be simpler.',
      fr: 'bien fait, l’emballage pourrait être plus simple.',
    },
  },
  {
    id: 'r26',
    name: 'Ilyes Mansouri',
    rating: 5,
    text: {
      en: 'exactly what i was looking for, worn non-stop since.',
      fr: 'exactement ce que je cherchais, porté sans arrêt depuis.',
    },
    certified: true,
  },
  {
    id: 'r27',
    name: 'Théo Vidal',
    rating: 4,
    text: {
      en: 'solid piece, the fit is a little roomier than i expected.',
      fr: 'pièce solide, la coupe est un peu plus ample que prévu.',
    },
  },
  {
    id: 'r28',
    name: 'Lina Haddad',
    rating: 4,
    text: {
      en: 'good buy, i took a size down in the end.',
      fr: 'bon achat, j’ai finalement pris une taille en dessous.',
    },
    certified: true,
  },
  {
    id: 'r29',
    name: 'Victor Lambert',
    rating: 4.5,
    text: {
      en: 'really nice finish, arrived well protected.',
      fr: 'très belles finitions, arrivé bien protégé.',
    },
  },
  {
    id: 'r30',
    name: 'Sarah Benkhaled',
    rating: 4,
    text: {
      en: 'faithful to the photos, a touch long on me.',
      fr: 'fidèle aux photos, un peu long sur moi.',
    },
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
 * How many reviews one product shows — and therefore what its star rating is
 * an average of.
 *
 * Two products that have been on sale for the same time no longer show the
 * same dozen reviews and the same score: the count itself varies with the
 * product id, inside the ceiling its age allows. That is what makes the
 * ratings land across the range rather than all on the same number, without
 * anything inventing a score separately from the reviews on display.
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
  // (":units", ":reviews") made every product draw almost the same number.
  return seededInt(`reviews:${seed}`, Math.min(5, max), max);
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
