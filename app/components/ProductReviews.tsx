import {getReviewsForSeed} from '~/data/reviews';
import {ReviewsSection} from '~/components/ReviewsSection';
import {useT} from '~/lib/i18n';

export function ProductReviews({
  productId,
  productTitle,
}: {
  productId: string;
  productTitle: string;
}) {
  const t = useT();
  const reviews = getReviewsForSeed(productId, 12);
  return (
    <ReviewsSection
      heading={t('reviews.forProduct', {product: productTitle.toLowerCase()})}
      reviews={reviews}
      productTitle={productTitle}
    />
  );
}
