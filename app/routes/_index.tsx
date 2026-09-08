import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense, useState} from 'react';
import type {AllProductsQuery} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {CollectionsSlider} from '~/components/CollectionsSlider';
import {CollectionProductShowcase} from '~/components/CollectionProductShowcase';
import {AnimatedHero} from '~/components/AnimatedHero';
import {Reveal} from '~/components/Reveal';
import {Newsletter} from '~/components/Newsletter';
import {HomeReviews} from '~/components/HomeReviews';
import {HelpFaq} from '~/components/HelpFaq';
import {withoutHomeHiddenCollections} from '~/lib/collections';
import {useT} from '~/lib/i18n';

/** Products beyond this many are hidden on mobile behind "view more" — see
 * .product-grid's nth-child rule in app.css, mobile-only there too, so
 * desktop always shows the full grid exactly as before. */
const MOBILE_INITIAL_PRODUCT_COUNT = 12;

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'reda studio'},
    {name: 'description', content: 'reda studio — minimalist essentials.'},
  ];
};

/**
 * Preload the hero image (LCP element on the homepage). Mobile and desktop
 * use different crops, so each preload is scoped with `media` to avoid
 * downloading both.
 */
export function links() {
  return [
    {
      rel: 'preload',
      as: 'image',
      // The first of the two mobile photos that crossfade in the hero — see
      // HERO_IMAGES_MOBILE below. Only this one needs preloading: it's the
      // LCP element; the second only appears a few seconds later.
      href: '/images/hero3-mobile.webp',
      media: '(max-width: 47.99em)',
    },
    {
      rel: 'preload',
      as: 'image',
      href: '/images/home-hero-desktop.jpg',
      media: '(min-width: 48em)',
    },
  ];
}

/**
 * The mobile hero crossfades between these — see AnimatedHero's
 * `imagesMobile`. Add a third by adding a third entry here; nothing else
 * needs to change.
 */
const HERO_IMAGES_MOBILE = [
  {
    src: '/images/hero3-mobile.webp',
    alt: 'A man from behind in a reda studio t-shirt and jeans, looking out over a rooftop pool and the city skyline',
  },
  {
    src: '/images/home-hero-mobile-2.jpg',
    alt: 'A man in a reda studio t-shirt and sweatpants leaning against a black Porsche, a horse behind him',
  },
];

const HERO_IMAGE_DESKTOP = {
  src: '/images/home-hero-desktop.jpg',
  alt: 'A man in a reda studio t-shirt and sweatpants leaning against a black Porsche, a horse behind him',
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

  // The "Automne Drop" showcase — real products from that one Shopify
  // collection. See app/components/CollectionProductShowcase.tsx for how
  // this feeds a reusable image + horizontal slider section; to add another
  // collection later, query it the same way and render another
  // <CollectionProductShowcase>.
  const automneDrop = context.storefront
    .query(COLLECTION_PRODUCTS_QUERY, {
      variables: {handle: 'automne-drop', first: 20},
    })
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {allProducts, automneDrop};
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  const t = useT();

  return (
    <div className="home">
      <AnimatedHero
        imagesMobile={HERO_IMAGES_MOBILE}
        imageDesktop={HERO_IMAGE_DESKTOP}
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

      <Suspense fallback={null}>
        <Await resolve={data.automneDrop}>
          {(response) =>
            response?.collection ? (
              <CollectionProductShowcase
                title={response.collection.title}
                description={response.collection.description}
                imageSrc="/images/collection-automne-drop-portrait.jpg"
                imageAlt="Two men in reda studio pieces beside a white Ferrari Testarossa, a doberman at their feet, in front of a château"
                collectionHandle={response.collection.handle}
                products={response.collection.products.nodes}
              />
            ) : null
          }
        </Await>
      </Suspense>

      <HomeReviews />

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
  // Mobile-only — see .product-grid's nth-child rule in app.css, which is
  // itself scoped to the same breakpoint. Desktop ignores this entirely and
  // always renders every product, exactly as before.
  const [expanded, setExpanded] = useState(false);

  return (
    <section aria-labelledby="catalogue-heading">
      <Reveal as="section">
        <h2 id="catalogue-heading" className="section-title">
          {t('home.allProducts')}
        </h2>
      </Reveal>
      <Suspense fallback={<div className="product-grid" aria-hidden="true" />}>
        <Await resolve={products}>
          {(response) =>
            response ? (
              <>
                <div className={`product-grid ${expanded ? 'product-grid--expanded' : ''}`}>
                  {response.products.nodes.map((product, index) => (
                    <ProductItem
                      key={product.id}
                      product={product}
                      loading={index < 4 ? 'eager' : undefined}
                    />
                  ))}
                </div>
                {!expanded && response.products.nodes.length > MOBILE_INITIAL_PRODUCT_COUNT && (
                  <button
                    type="button"
                    className="view-more-mobile"
                    onClick={() => setExpanded(true)}
                  >
                    {t('home.viewMore')}
                  </button>
                )}
              </>
            ) : null
          }
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
    collections(first: 10, sortKey: UPDATED_AT, reverse: true) {
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
