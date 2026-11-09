import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {RailArrows} from '~/components/RailArrows';
import {Reveal} from '~/components/Reveal';
import {useT} from '~/lib/i18n';
import {useHorizontalRail} from '~/lib/useHorizontalRail';

type SliderCollection = {
  id: string;
  handle: string;
  title: string;
  image?: {
    id?: string | null;
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
};

/**
 * Horizontal, swipeable collections slider shown under the hero. Each tile
 * links to its collection page. Scroll-snap gives the native "slider" feel;
 * touch stays the browser's own, and useHorizontalRail adds mouse drag and
 * the arrows on desktop, like every other rail on the site.
 */
export function CollectionsSlider({
  collections,
}: {
  collections: SliderCollection[];
}) {
  const t = useT();
  const {ref, scrollByCard, atStart, atEnd} =
    useHorizontalRail<HTMLDivElement>();
  if (!collections.length) return null;

  return (
    <Reveal
      as="section"
      className="collections-slider"
      aria-labelledby="basics-heading"
    >
      <h2 className="section-title" id="basics-heading">
        {t('home.basics')}
      </h2>

      <div className="rail-wrap">
        <div className="collections-slider__track" ref={ref}>
          {collections.map((collection) => (
            <Link
              key={collection.id}
              to={`/collections/${collection.handle}`}
              prefetch="intent"
              className="collections-slider__tile"
            >
              <div className="collections-slider__media">
                {collection.image ? (
                  <Image
                    data={collection.image}
                    alt={collection.image.altText || collection.title}
                    sizes="(min-width: 48em) 40vw, 80vw"
                  />
                ) : (
                  <div
                    className="collections-slider__placeholder"
                    aria-hidden="true"
                  />
                )}
                <span className="collections-slider__label">
                  {collection.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
        <RailArrows
          onPrev={() => scrollByCard(-1)}
          onNext={() => scrollByCard(1)}
          disablePrev={atStart}
          disableNext={atEnd}
          prevLabel={t('rail.prevCollection')}
          nextLabel={t('rail.nextCollection')}
        />
      </div>
    </Reveal>
  );
}
