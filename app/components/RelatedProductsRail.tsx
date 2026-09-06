import type {RecoProductFragment} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {RailArrows} from '~/components/RailArrows';
import {useHorizontalRail} from '~/lib/useHorizontalRail';

/**
 * "You may also like" — a real horizontal carousel at every breakpoint
 * (touch swipe on mobile/tablet, mouse-drag and arrows on desktop; see
 * useHorizontalRail and .related-rail in app.css). Not infinite: it simply
 * runs through however many in-stock products the loader found.
 *
 * `items` is already filtered to available-for-sale, deduplicated products
 * by the route loader — nothing here decides stock, so a product going out
 * of stock between requests drops out on its own rather than needing a
 * client-side check.
 */
export function RelatedProductsRail({items}: {items: RecoProductFragment[]}) {
  const {ref, scrollByCard, atStart, atEnd} = useHorizontalRail<HTMLDivElement>();

  return (
    <section className="pdp__related" aria-labelledby="related-heading">
      <h2 className="pdp__section-title" id="related-heading">
        you may also like
      </h2>

      <div className="rail-wrap">
        <div className="related-rail" ref={ref}>
          {items.map((item) => (
            <div className="related-rail__item" key={item.id}>
              <ProductItem product={item} />
            </div>
          ))}
        </div>
        <RailArrows
          onPrev={() => scrollByCard(-1)}
          onNext={() => scrollByCard(1)}
          disablePrev={atStart}
          disableNext={atEnd}
          prevLabel="Produit précédent"
          nextLabel="Produit suivant"
        />
      </div>
    </section>
  );
}
