import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/collections._index';
import {Image} from '@shopify/hydrogen';
import type {StoreCollectionFragment} from 'storefrontapi.generated';
import {Reveal} from '~/components/Reveal';
import {withoutAutoCollections} from '~/lib/collections';
import {useT} from '~/lib/i18n';
import {redirectHomeIfSingleProduct} from '~/lib/singleProduct';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'reda studio | collections'},
    {
      name: 'description',
      content: 'Every reda studio collection, in one place.',
    },
  ];
};

/**
 * Where "shop now" lands: every collection, two per row, scrolling.
 *
 * Deliberately not paginated. The store has a handful of collections, and
 * making someone click "next" to see the fourth one would be worse than
 * loading them all — `first: 100` covers the catalogue many times over.
 */
export async function loader({context}: Route.LoaderArgs) {
  redirectHomeIfSingleProduct();
  const {collections} = await context.storefront.query(COLLECTIONS_QUERY, {
    variables: {first: 100},
  });

  return {collections: withoutAutoCollections(collections.nodes)};
}

export default function Collections() {
  const {collections} = useLoaderData<typeof loader>();
  const t = useT();

  return (
    <div className="shop-index">
      <header className="shop-index__header">
        <p className="shop-index__eyebrow">{t('collections.eyebrow')}</p>
        <h1 className="shop-index__title">{t('collections.title')}</h1>
        <p className="shop-index__intro">{t('collections.intro')}</p>
      </header>

      {collections.length > 0 ? (
        <div className="shop-index__grid">
          {collections.map((collection, index) => (
            <CollectionTile
              key={collection.id}
              collection={collection}
              index={index}
            />
          ))}
        </div>
      ) : (
        <p className="shop-index__empty">
          {t('collections.empty')}{' '}
          <Link to="/collections/all">{t('home.allProducts')}</Link>.
        </p>
      )}

      <div className="shop-index__foot">
        <Link to="/collections/all" className="btn">
          {t('collections.browseAll')}
        </Link>
      </div>
    </div>
  );
}

function CollectionTile({
  collection,
  index,
}: {
  collection: StoreCollectionFragment;
  index: number;
}) {
  /*
   * Collections often have no image of their own in Shopify. Rather than a
   * grey box, fall back to the first product's photo — which is what the
   * collection is anyway.
   */
  const image = collection.image ?? collection.products.nodes[0]?.featuredImage;

  return (
    <Reveal as="div">
      <Link
        className="shop-tile"
        to={`/collections/${collection.handle}`}
        prefetch="intent"
      >
        <span className="shop-tile__media">
          {image ? (
            <Image
              alt={image.altText || collection.title}
              aspectRatio="4/5"
              data={image}
              // The first row is above the fold on every viewport.
              loading={index < 2 ? 'eager' : 'lazy'}
              sizes="(min-width: 64em) 520px, 50vw"
            />
          ) : (
            <span className="shop-tile__placeholder" aria-hidden="true" />
          )}
        </span>
        <span className="shop-tile__name">{collection.title.toLowerCase()}</span>
      </Link>
    </Reveal>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment StoreCollection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
    # Only ever used as the tile's fallback image when the collection itself
    # has none — hence first: 1.
    products(first: 1) {
      nodes {
        id
        featuredImage {
          id
          url
          altText
          width
          height
        }
      }
    }
  }
  query StoreCollections(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
  ) @inContext(country: $country, language: $language) {
    collections(first: $first, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...StoreCollection
      }
    }
  }
` as const;
