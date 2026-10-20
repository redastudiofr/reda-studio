import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense, useEffect, useState} from 'react';
import type {AllProductsQuery} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {CollectionsSlider} from '~/components/CollectionsSlider';
import {CollectionProductShowcase} from '~/components/CollectionProductShowcase';
import {CommunitySlider} from '~/components/CommunitySlider';
import {AnimatedHero} from '~/components/AnimatedHero';
import {Reveal} from '~/components/Reveal';
import {Newsletter} from '~/components/Newsletter';
import {HomeReviews} from '~/components/HomeReviews';
import {HelpFaq} from '~/components/HelpFaq';
import {withoutHomeHiddenCollections} from '~/lib/collections';
import {useT} from '~/lib/i18n';

/**
 * Le catalogue de l'accueil se remplit par lignes entières, jamais par
 * défilement : au chargement puis à chaque clic sur « voir plus de
 * produits », autant de produits par écran.
 *
 * - mobile, 2 colonnes : 10 (5 lignes) ;
 * - tablette, 3 colonnes : 12 (4 lignes) ;
 * - ordinateur, 4 colonnes : 12 (3 lignes).
 *
 * Le total affiché s'arrête au dernier multiple du nombre de colonnes, pour
 * que la dernière ligne ne soit jamais à moitié vide ; les produits restants
 * sont dans « tout voir ». Seules les cartes à afficher sont rendues.
 */
const HOME_PRODUCTS_PER_STEP: Record<GridColumns, number> = {2: 10, 3: 12, 4: 12};

/**
 * Avant que le navigateur ait dit sa largeur (rendu serveur), 12 cartes :
 * lignes pleines en 2, 3 comme en 4 colonnes. Sur mobile, les deux de trop
 * sont masquées jusqu'à l'hydratation (voir .product-grid--home dans
 * app.css), le temps d'un instant.
 */
const HOME_PRODUCTS_BEFORE_HYDRATION = 12;

type GridColumns = 2 | 3 | 4;

/** Le nombre de colonnes de .product-grid, aux mêmes seuils que app.css. */
function useGridColumns(): GridColumns | null {
  const [columns, setColumns] = useState<GridColumns | null>(null);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 64em)');
    const tablet = window.matchMedia('(min-width: 48em)');
    const update = () =>
      setColumns(desktop.matches ? 4 : tablet.matches ? 3 : 2);
    update();
    desktop.addEventListener('change', update);
    tablet.addEventListener('change', update);
    return () => {
      desktop.removeEventListener('change', update);
      tablet.removeEventListener('change', update);
    };
  }, []);
  return columns;
}

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'reda studio'},
    {name: 'description', content: 'reda studio — minimalist essentials.'},
  ];
};

/**
 * Preload the hero image (LCP element on the homepage).
 *
 * One entry per breakpoint, each behind the same media query the <picture>
 * uses, so a phone only ever fetches the mobile photo and a desktop only the
 * desktop one. The mobile line became possible once that photo stopped
 * alternating per page load: `links` is static and could not have known
 * which of two shots the request would render.
 */
export function links() {
  return [
    {
      rel: 'preload',
      as: 'image',
      href: '/images/hero3-mobile.webp',
      media: '(max-width: 47.99em)',
    },
    {
      rel: 'preload',
      as: 'image',
      href: '/images/home-hero-desktop-milan.webp',
      media: '(min-width: 48em)',
    },
  ];
}

/**
 * The mobile hero. One photo, always the same: the shop asked for the
 * rooftop shot only, so the two-photo rotation that used to alternate them
 * per page load (and the cookie behind it) is gone with it.
 */
const HERO_IMAGE_MOBILE = {
  src: '/images/hero3-mobile.webp',
  alt: 'A man from behind in a reda studio t-shirt and jeans, looking out over a rooftop pool and the city skyline',
};

const HERO_IMAGE_DESKTOP = {
  src: '/images/home-hero-desktop-milan.webp',
  alt: 'A man in a black leopard-print zip hoodie, white tee and black baggy jeans, sitting on a block in front of a tower covered in greenery',
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context}: Route.LoaderArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(HOME_COLLECTIONS_QUERY),
  ]);
  // « summer drop » et « all in drop » restent visibles dans le header, sur
  // /collections et dans la vitrine des pages produit, mais pas sur l'accueil.
  const visible = withoutHomeHiddenCollections(collections.nodes);
  return {collections: visible};
}

function loadDeferredData({context}: Route.LoaderArgs) {
  // "first: 100" shows the full catalog on the homepage — the point isn't a
  // paginated slice, it's every product, dynamically from Shopify.
  const allProducts = context.storefront
    .query(ALL_PRODUCTS_QUERY, {variables: {first: 100}})
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  /*
   * One homepage showcase — the collection's photo, its name and a slider of
   * its real products (see CollectionProductShowcase). Adding another is one
   * more call here plus one more <CollectionProductShowcase> below.
   *
   * A handle that no longer exists in Shopify is logged. That silence is what
   * made the Best Seller section disappear without a trace when the store
   * renamed "brest-seller" (a typo) to "best-seller": the query answered
   * politely with no collection, the section rendered nothing, and nothing
   * anywhere said why.
   */
  const showcase = (handle: string) =>
    context.storefront
      .query(COLLECTION_PRODUCTS_QUERY, {variables: {handle, first: 20}})
      .then((response) => {
        if (!response?.collection) {
          console.warn(
            `Homepage showcase: no collection "${handle}" in Shopify — that section will not render. Check the handle in Shopify Admin → Collections.`,
          );
        }
        return response;
      })
      .catch((error: Error) => {
        console.error(error);
        return null;
      });

  const automneDrop = showcase('automne-drop');
  const summer = showcase('summer');
  const bestSeller = showcase('best-seller');

  return {allProducts, automneDrop, summer, bestSeller};
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  const t = useT();

  return (
    <div className="home">
      <AnimatedHero
        imageMobile={HERO_IMAGE_MOBILE}
        imageDesktop={HERO_IMAGE_DESKTOP}
        badge={{
          mobile: '/images/trustpilot-mobile.webp',
          desktop: '/images/trustpilot-desktop.webp',
          alt: t('home.trustAlt'),
        }}
        eyebrow={t('home.eyebrow')}
        title="reda studio"
        description={t('home.tagline')}
        // "shop now" opens the collections index rather than dropping the
        // visitor into whichever collection happens to be newest — from the
        // hero, the useful next step is seeing what there is to choose from.
        ctaButton={{text: t('home.shopNow'), href: '/collections'}}
        secondaryCta={{text: t('home.ourStory'), href: '/about'}}
      />

      <CollectionsSlider collections={data.collections} />

      <AllProducts products={data.allProducts} />

      {/* Plus de section pack ici : le propriétaire la trouvait envahissante
          sur l'accueil. L'offre reste sur /pack et au panier. */}

      <HomeReviews />

      <CommunitySlider />

      <Suspense fallback={null}>
        <Await resolve={data.automneDrop}>
          {(response) =>
            response?.collection ? (
              <CollectionProductShowcase
                title={response.collection.title}
                description={response.collection.description}
                imageSrcMobile="/images/collection-automne-drop-v2-mobile.jpg"
                imageSrcDesktop="/images/collection-automne-drop-v2-desktop.jpg"
                imageAlt="A man in a reda studio black tee and grey sweatpants on a wet autumn street"
                mobileRatio="3 / 4"
                desktopRatio="21 / 9"
                collectionHandle={response.collection.handle}
                products={response.collection.products.nodes}
              />
            ) : null
          }
        </Await>
      </Suspense>

      <Suspense fallback={null}>
        <Await resolve={data.summer}>
          {(response) =>
            response?.collection ? (
              <CollectionProductShowcase
                title={response.collection.title}
                description={response.collection.description}
                // Renamed rather than overwritten: the previous file at
                // collection-summer-mobile.jpg was a taller crop, and
                // browsers that already had it cached kept serving that one
                // — a new URL is the only reliable way to replace an image.
                imageSrcMobile="/images/collection-summer-mobile-3x4.jpg"
                imageSrcDesktop="/images/collection-summer-desktop.jpg"
                imageAlt="Two men in reda studio white tees and shorts on a sunlit Barcelona street corner"
                // Same 3:4 mobile frame as Automne Drop — the mobile file is
                // cropped to exactly that ratio, so the two sections are the
                // same size on a phone with nothing trimmed at render.
                mobileRatio="3 / 4"
                desktopRatio="16 / 9"
                collectionHandle={response.collection.handle}
                products={response.collection.products.nodes}
              />
            ) : null
          }
        </Await>
      </Suspense>

      <Suspense fallback={null}>
        <Await resolve={data.bestSeller}>
          {(response) =>
            response?.collection ? (
              <CollectionProductShowcase
                title={response.collection.title}
                description={response.collection.description}
                imageSrcMobile="/images/collection-best-seller-mobile.jpg"
                imageSrcDesktop="/images/collection-best-seller-desktop.jpg"
                imageAlt="A man in a reda studio white longsleeve and raw denim jeans on a Paris street"
                mobileRatio="3 / 4"
                desktopRatio="4 / 3"
                collectionHandle={response.collection.handle}
                products={response.collection.products.nodes}
              />
            ) : null
          }
        </Await>
      </Suspense>

      <HelpFaq />

      <Reveal as="section">
        <Newsletter />
      </Reveal>
    </div>
  );
}

function AllProducts({
  products,
}: {
  products: Promise<AllProductsQuery | null>;
}) {
  const t = useT();
  const columns = useGridColumns();
  // Nombre de clics sur « voir plus », plutôt qu'un nombre de produits : il
  // reste juste si l'écran change de nombre de colonnes.
  const [steps, setSteps] = useState(1);

  return (
    <section aria-labelledby="catalogue-heading">
      <Reveal as="section">
        <h2 id="catalogue-heading" className="section-title">
          {t('home.allProducts')}
        </h2>
      </Reveal>
      <Suspense fallback={<div className="product-grid" aria-hidden="true" />}>
        <Await resolve={products}>
          {(response) => {
            if (!response) return null;
            const products = response.products.nodes;
            // Lignes pleines jusqu'au bout : un catalogue plus court qu'une
            // ligne s'affiche quand même en entier.
            const fullRows = columns
              ? products.length < columns
                ? products.length
                : products.length - (products.length % columns)
              : products.length;
            const visible = Math.min(
              fullRows,
              columns
                ? HOME_PRODUCTS_PER_STEP[columns] * steps
                : HOME_PRODUCTS_BEFORE_HYDRATION,
            );
            return (
              <>
                <div
                  className="product-grid product-grid--home"
                  data-columns={columns ?? undefined}
                >
                  {products.slice(0, visible).map((product, index) => (
                    <ProductItem
                      key={product.id}
                      product={product}
                      loading={index < 4 ? 'eager' : undefined}
                    />
                  ))}
                </div>
                {columns !== null && visible < fullRows && (
                  <button
                    type="button"
                    className="view-more"
                    onClick={() => setSteps((count) => count + 1)}
                  >
                    {t('home.viewMore')}
                  </button>
                )}
              </>
            );
          }}
        </Await>
      </Suspense>
      <div className="view-all">
        <Link to="/collections/all">{t('home.viewAll')}</Link>
      </div>
    </section>
  );
}

const HOME_COLLECTIONS_QUERY = `#graphql
  fragment HomeCollection on Collection {
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
  }
  query HomeCollections($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    # Fetched well above what the carousel shows, because
    # withoutHomeHiddenCollections then removes several (the drops, and every
    # collection that has its own showcase further down the page). At
    # first: 10 those exclusions were eating into the ten most recently
    # updated, so real categories — knit, short — silently never reached the
    # carousel at all.
    collections(first: 25, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...HomeCollection
      }
    }
  }
` as const;

const ALL_PRODUCTS_QUERY = `#graphql
  fragment HomeMoney on MoneyV2 {
    amount
    currencyCode
  }
  fragment HomeProduct on Product {
    id
    title
    handle
    availableForSale
    priceRange {
      minVariantPrice {
        ...HomeMoney
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...HomeMoney
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
    images(first: 2) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    media(first: 3) {
      nodes {
        mediaContentType
        ... on Video {
          id
          previewImage {
            id
            url
            altText
            width
            height
          }
          sources {
            url
            mimeType
            format
          }
        }
      }
    }
    options {
      name
      optionValues {
        name
      }
    }
    variants(first: 20) {
      nodes {
        id
        availableForSale
        selectedOptions {
          name
          value
        }
        price {
          ...HomeMoney
        }
        compareAtPrice {
          ...HomeMoney
        }
      }
    }
  }
  query AllProducts ($country: CountryCode, $language: LanguageCode, $first: Int)
    @inContext(country: $country, language: $language) {
    products(first: $first, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...HomeProduct
      }
    }
  }
` as const;

/**
 * Real products for one collection's homepage showcase — see
 * CollectionProductShowcase. Same shape as HomeProduct above so ProductItem
 * renders identically in both places; kept as its own query (rather than
 * reusing ALL_PRODUCTS_QUERY) because it's scoped to one collection handle.
 */
const COLLECTION_PRODUCTS_QUERY = `#graphql
  fragment ShowcaseMoney on MoneyV2 {
    amount
    currencyCode
  }
  fragment ShowcaseProduct on Product {
    id
    title
    handle
    availableForSale
    priceRange {
      minVariantPrice {
        ...ShowcaseMoney
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...ShowcaseMoney
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
    images(first: 2) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
      }
    }
    variants(first: 20) {
      nodes {
        id
        availableForSale
        selectedOptions {
          name
          value
        }
        price {
          ...ShowcaseMoney
        }
        compareAtPrice {
          ...ShowcaseMoney
        }
      }
    }
  }
  query CollectionProducts(
    $handle: String!
    $first: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(first: $first) {
        nodes {
          ...ShowcaseProduct
        }
      }
    }
  }
` as const;
