import {Link} from 'react-router';
import type {ShowcaseProductFragment} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {RailArrows} from '~/components/RailArrows';
import {Reveal} from '~/components/Reveal';
import {useHorizontalRail} from '~/lib/useHorizontalRail';
import {useT} from '~/lib/i18n';

/**
 * One collection's homepage showcase: a large photo with the collection's
 * name, description and a "shop now" link over a dark gradient (same
 * caption layout as the homepage hero — see .collection-feature__cta,
 * copied from AnimatedHero's glass buttons for the same look), then a
 * horizontal slider of its real products (same card as everywhere else on
 * the site — image, name, price, link).
 *
 * Deliberately generic — nothing here is specific to "Automne Drop" — so
 * adding another collection later is one more query in the route loader
 * (see app/routes/_index.tsx's COLLECTION_PRODUCTS_QUERY) plus one more of
 * these, not a new component.
 */
export function CollectionProductShowcase({
  title,
  description,
  imageSrc,
  imageAlt,
  collectionHandle,
  products,
}: {
  title: string;
  // Shopify's own collection description — only shown when the merchant has
  // actually written one (see collections.$handle.tsx's own page, same
  // rule): nothing here invents copy that isn't in the store's own data.
  description?: string | null;
  imageSrc: string;
  imageAlt: string;
  collectionHandle: string;
  products: ShowcaseProductFragment[];
}) {
  const t = useT();
  const {ref, scrollByCard, atStart, atEnd} = useHorizontalRail<HTMLDivElement>();

  if (!products.length) return null;

  const headingId = `${collectionHandle}-heading`;

  return (
    <Reveal as="section" className="collection-feature" aria-labelledby={headingId}>
      <div className="collection-feature__media">
        <img
          src={imageSrc}
          alt={imageAlt}
          loading="lazy"
          decoding="async"
          className="collection-feature__img"
        />
        <span className="collection-feature__overlay" aria-hidden="true" />

        <div className="collection-feature__caption">
          <h2 className="collection-feature__title" id={headingId}>
            {title}
          </h2>
          {description && (
            <p className="collection-feature__description">{description}</p>
          )}
          <Link
            to={`/collections/${collectionHandle}`}
            prefetch="intent"
            className="collection-feature__cta"
          >
            {t('home.shopNow')}
          </Link>
        </div>
      </div>

      <div className="rail-wrap">
        <div className="collection-feature__rail" ref={ref}>
          {products.map((product) => (
            <div className="collection-feature__item" key={product.id}>
              <ProductItem product={product} />
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
    </Reveal>
  );
}
