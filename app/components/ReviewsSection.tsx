import {Link} from 'react-router';
import type {Review} from '~/data/reviews';
import {StarRating} from '~/components/StarRating';
import {useT} from '~/lib/i18n';

const AVATAR_PALETTE = ['#111111', '#3d3d3a', '#6b6b66', '#8a8a86'];

/** Initials of the first and last name, for the avatar disc. */
function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/** Colour derived from the id, stable from one render to the next. */
function avatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

/**
 * Review card: rating, the review in full, then the author.
 *
 * One block of copy, printed whole — no headline that would double as a
 * summary, no truncation. The "verified review" badge only shows when the data
 * carries `certified: true`.
 */
function ReviewCard({review}: {review: Review}) {
  const t = useT();
  return (
    <article className="review-card">
      <StarRating rating={review.rating} className="review-card__stars" />

      <p className="review-card__text">&ldquo;{review.text}&rdquo;</p>

      <footer className="review-card__author">
        <span
          className="review-card__avatar"
          style={{background: avatarColor(review.id)}}
          aria-hidden="true"
        >
          {initials(review.name)}
        </span>
        <span className="review-card__identity">
          <span className="review-card__name">{review.name}</span>
          {review.certified && (
            <span className="review-card__certified">
              <CheckIcon />
              {t('reviews.verified')}
            </span>
          )}
        </span>
      </footer>
    </article>
  );
}

function CheckIcon() {
  return (
    <svg
      className="review-card__check"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="7" fill="currentColor" />
      <path
        d="M3.9 7.2l2.1 2.1 4.1-4.4"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * One continuously scrolling row.
 *
 * The row's reviews are rendered twice, back to back, and the track is
 * translated by exactly -50%. At the end of the cycle the second copy sits
 * precisely where the first began, so the loop restarts with nothing to see —
 * no jump, no visible start or end. Each card still carries a single review;
 * only the track is duplicated, and the duplicate is hidden from screen
 * readers so reviews are never announced twice.
 */
function ScrollingRow({
  reviews,
  direction,
  duration,
}: {
  reviews: Review[];
  direction: 'left' | 'right';
  duration: string;
}) {
  if (!reviews.length) return null;

  return (
    <div className="reviews-row">
      <div
        className={`reviews-row__track reviews-row__track--${direction}`}
        style={{'--marquee-duration': duration} as React.CSSProperties}
      >
        <div className="reviews-row__group">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
        <div className="reviews-row__group" aria-hidden="true">
          {reviews.map((review) => (
            <ReviewCard key={`clone-${review.id}`} review={review} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Row settings: right, then left, then right. */
const ROWS: Array<{direction: 'left' | 'right'; duration: string}> = [
  {direction: 'right', duration: '58s'},
  {direction: 'left', duration: '46s'},
  {direction: 'right', duration: '64s'},
];

/**
 * Customer reviews, shared by the homepage and every product page.
 *
 * Three rows scrolling continuously in alternating directions. Reviews are
 * dealt across the rows, so no review shows up in more than one of them.
 */
export function ReviewsSection({
  heading,
  subheading,
  reviews,
  // Threaded through from the product page so the "write a review" link can
  // arrive with the product already filled in — see ProductReviews.tsx. Left
  // unset on the homepage, where there's no single product to attach it to.
  productTitle,
}: {
  heading: string;
  subheading?: string;
  reviews: Review[];
  productTitle?: string;
}) {
  const t = useT();
  if (!reviews.length) return null;

  const rows: Review[][] = [[], [], []];
  reviews.forEach((review, index) => rows[index % rows.length].push(review));

  const writeReviewHref = productTitle
    ? `/reviews?product=${encodeURIComponent(productTitle)}`
    : '/reviews';

  return (
    <section className="reviews">
      <div className="reviews__head">
        <h2 className="reviews__title">{heading}</h2>
        {subheading ? <p className="reviews__subtitle">{subheading}</p> : null}
      </div>

      <div className="reviews__rows">
        {rows.map((row, index) => (
          <ScrollingRow
            // eslint-disable-next-line react/no-array-index-key -- fixed-length static array, never reordered
            key={index}
            reviews={row}
            direction={ROWS[index].direction}
            duration={ROWS[index].duration}
          />
        ))}
      </div>

      <div className="reviews__cta">
        <p>{t('reviews.ctaText')}</p>
        <Link to={writeReviewHref} className="btn btn--outline">
          {t('reviews.ctaButton')}
        </Link>
      </div>
    </section>
  );
}
