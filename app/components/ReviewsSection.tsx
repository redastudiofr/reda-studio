import {Link} from 'react-router';
import type {Review} from '~/data/reviews';
import {StarRating} from '~/components/StarRating';
import {RailArrows} from '~/components/RailArrows';
import {Reveal} from '~/components/Reveal';
import {useHorizontalRail} from '~/lib/useHorizontalRail';
import {useI18n, useT} from '~/lib/i18n';

/**
 * One review: the rating, the review in the words it was written in, then who
 * left it and when. No avatar, no initials disc, no badge — the card carries
 * what the customer actually said and nothing invented around it.
 */
function ReviewCard({review}: {review: Review}) {
  const {locale} = useI18n();
  const [open, close] = locale === 'fr' ? ['« ', ' »'] : ['“', '”'];

  return (
    <article className="review-card">
      <StarRating rating={review.rating} className="review-card__stars" />

      <p className="review-card__text">
        {open}
        {review.text}
        {close}
      </p>

      <footer className="review-card__author">
        <span className="review-card__name">{review.name}</span>
        <span className="review-card__meta">
          {review.city}, {review.country} · {review.date}
        </span>
      </footer>
    </article>
  );
}

/**
 * One row of reviews, scrolled by hand.
 *
 * Same mechanics as every other row on the site (useHorizontalRail): the
 * browser's own overflow scrolling, with mouse drag and arrows layered on top
 * for desktop. Nothing moves on its own.
 *
 * The row is wrapped in Reveal so its cards can arrive out of focus and sharpen
 * — and, more importantly, so they can never stay that way: Reveal shows its
 * content with no transition at all when the observer never reports (a
 * throttled tab, a page restored from the back/forward cache), which is the
 * only reason a blur effect is safe on text.
 */
function ReviewRow({reviews}: {reviews: Review[]}) {
  const t = useT();
  const {ref, scrollByCard, atStart, atEnd} = useHorizontalRail<HTMLDivElement>();

  if (!reviews.length) return null;

  return (
    <Reveal as="div" className="rail-wrap">
      <div className="reviews-row" ref={ref}>
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
      <RailArrows
        onPrev={() => scrollByCard(-1)}
        onNext={() => scrollByCard(1)}
        disablePrev={atStart}
        disableNext={atEnd}
        prevLabel={t('reviews.prev')}
        nextLabel={t('reviews.next')}
      />
    </Reveal>
  );
}

const ROW_COUNT = 2;

/**
 * Customer reviews, shared by the homepage and every product page.
 *
 * Two rows, dealt one review at a time so consecutive reviews never land in
 * the same row: each row mixes cities, dates and ratings, the two come out
 * the same length give or take one, and no review appears twice — not across
 * rows, not within one, and not at any screen width, since every size shows
 * the same cards. Rows are scrolled by the visitor, never on a timer.
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

  const rows: Review[][] = Array.from({length: ROW_COUNT}, () => []);
  reviews.forEach((review, index) => rows[index % ROW_COUNT].push(review));

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
        {rows
          .filter((row) => row.length > 0)
          .map((row) => (
            // The first review of a row is a stable identity for it: the rows
            // are dealt from the same list in the same order every render.
            <ReviewRow key={row[0].id} reviews={row} />
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
