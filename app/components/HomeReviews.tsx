import {getAllReviews} from '~/data/reviews';
import {ReviewsSection} from '~/components/ReviewsSection';
import {useT} from '~/lib/i18n';

export function HomeReviews() {
  const t = useT();
  // Every review the shop has, dealt across the three rows by ReviewsSection.
  const reviews = getAllReviews();
  return (
    <ReviewsSection
      heading={t('reviews.title')}
      subheading={t('reviews.subtitle')}
      reviews={reviews}
    />
  );
}
