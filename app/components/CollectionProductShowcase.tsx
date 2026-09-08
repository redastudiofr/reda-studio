import {Link} from 'react-router';
import type {ShowcaseProductFragment} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {RailArrows} from '~/components/RailArrows';
import {Reveal} from '~/components/Reveal';
import {useHorizontalRail} from '~/lib/useHorizontalRail';

/**
 * One collection's homepage showcase: a large landscape photo + the
 * collection's name, then a horizontal slider of its real products (same
 * card as everywhere else on the site — image, name, price, link).
 *
 * Deliberately generic — nothing here is specific to "Automne Drop" — so
 * adding another collection later is one more query in the route loader
 * (see app/routes/_index.tsx's COLLECTION_PRODUCTS_QUERY) plus one more of
 * these, not a new component.
 */
export function CollectionProductShowcase({
  title,
  imageSrc,
  imageAlt,
  collectionHandle,
  products,
}: {
  title: string;
  imageSrc: string;
  imageAlt: string;
  collectionHandle: string;
  products: ShowcaseProductFragment[];
}) {
  const {ref, scrollByCard, atStart, atEnd} = useHorizontalRail<HTMLDivElement>();

  if (!products.length) return null;

  return (
    <Reveal as="section" className="collection-feature" aria-labelledby={`${collectionHandle}-heading`}>
      <Link
        to={`/collections/${collectionHandle}`}
        prefetch="intent"
        className="collection-feature__media"
      >
        <img
          src={imageSrc}
          alt={imageAlt}
          loading="lazy"
          decoding="async"
          className="collection-feature__img"
        />
        <span className="collection-feature__overlay" aria-hidden="true" />
        <h2 className="collection-feature__title" id={`${collectionHandle}-heading`}>
          {title}
        </h2>
      </Link>

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
