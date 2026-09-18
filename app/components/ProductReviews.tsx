import {getReviewsForSeed} from '~/data/reviews';
import {ReviewsSection} from '~/components/ReviewsSection';
import {useT} from '~/lib/i18n';

export function ProductReviews({
  productId,
  productTitle,
  count,
}: {
  productId: string;
  productTitle: string;
  /**
   * How many reviews this product shows. Comes from the route so that the
   * rating printed in the buy box is the average of exactly these reviews —
   * see reviewCountForProduct.
   */
  count: number;
}) {
  const t = useT();
  const reviews = getReviewsForSeed(productId, count);

  if (!reviews.length) return null;
  return (
    <ReviewsSection
      heading={t('reviews.forProduct', {product: productTitle.toLowerCase()})}
      reviews={reviews}
      productTitle={productTitle}
    />
  );
}
