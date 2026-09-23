import {Link} from 'react-router';
import type {Review} from '~/data/reviews';
import {StarRating} from '~/components/StarRating';
import {RailArrows} from '~/components/RailArrows';
import {Reveal} from '~/components/Reveal';
import {useHorizontalRail} from '~/lib/useHorizontalRail';
import {useAutoScroll} from '~/lib/useAutoScroll';
import {useCenterFocus} from '~/lib/useCenterFocus';
import {useI18n, useT} from '~/lib/i18n';

/**
 * One review: the stars and the customer's name on the same line, then the
 * review in the words it was written in, then where and when it was left.
 * No avatar, no badge — what the customer said, and nothing invented around
 * it.
 */
function ReviewCard({review}: {review: Review}) {
  const {locale} = useI18n();
  const [open, close] = locale === 'fr' ? ['« ', ' »'] : ['“', '”'];

  return (
    <article className="review-card">
      <header className="review-card__head">
        <StarRating rating={review.rating} className="review-card__stars" />
        <span className="review-card__name">{review.name}</span>
      </header>

      <p className="review-card__text">
        {open}
        {review.text}
        {close}
      </p>

      <p className="review-card__meta">
        {review.city}, {review.country} · {review.date}
      </p>
    </article>
  );
}

/**
 * One row of reviews: drifting on its own, and scrollable by hand at the same
 * time.
 *
 * Both are the same mechanism — the row is a plain scroll container, and the
 * drift only nudges its scroll position (see useAutoScroll). So a finger, a
 * trackpad or the arrows take over instantly, the drift pauses while they do,
 * and it resumes from wherever the visitor stopped. `loop` renders the row
 * three times over so the travel never reaches an end; the two extra copies
 * are hidden from screen readers, which would otherwise read every review
 * three times.
 *
 * Two things blur the cards, and they are not the same thing. Reveal blurs
 * the row on arrival and clears it — and can never leave it blurred, since it
 * shows its content with no transition at all when its observer never
 * reports. useCenterFocus then keeps whatever is passing the middle sharp and
 * lets the rest soften, for as long as the row travels.
 */
function ReviewRow({
  reviews,
  direction,
}: {
  reviews: Review[];
  direction: 'left' | 'right';
}) {
  const t = useT();
  const {ref, scrollByCard} = useHorizontalRail<HTMLDivElement>({loop: true});
  useAutoScroll(ref, {direction});
  useCenterFocus(ref);

  if (!reviews.length) return null;

  const copies = [0, 1, 2];

  return (
    <Reveal as="div" className="rail-wrap">
      <div className="reviews-row" ref={ref}>
        {copies.map((copy) =>
          reviews.map((review) => (
            <div
              className="reviews-row__item"
              key={`${copy}-${review.id}`}
              aria-hidden={copy === 0 ? undefined : true}
            >
              <ReviewCard review={review} />
            </div>
          )),
        )}
      </div>
      <RailArrows
        onPrev={() => scrollByCard(-1)}
        onNext={() => scrollByCard(1)}
        prevLabel={t('reviews.prev')}
        nextLabel={t('reviews.next')}
      />
    </Reveal>
  );
}

/**
 * One row, travelling right.
 *
 * It was two, in opposite directions. One row shows fewer reviews at a time
 * and reads as a single thing going somewhere, rather than as a wall of text
 * sliding both ways at once — and it leaves the cards the room to be bigger.
 */
const ROW_DIRECTION = 'right' as const;

/**
 * Customer reviews, shared by the homepage and every product page.
 *
 * One row, holding every review in the order they were left, travelling on
 * its own and scrollable by hand. The same cards are shown at every screen
 * width; only how many fit changes.
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
        <ReviewRow reviews={reviews} direction={ROW_DIRECTION} />
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
