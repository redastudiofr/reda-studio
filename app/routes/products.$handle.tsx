import {Await, useLoaderData} from 'react-router';
import {Suspense} from 'react';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductGallery} from '~/components/ProductGallery';
import {ProductPurchase} from '~/components/ProductPurchase';
import {ProductDescription} from '~/components/ProductDescription';
import {VisionSection} from '~/components/VisionSection';
import {CollectionShowcase} from '~/components/CollectionShowcase';
import {BundleOffer} from '~/components/BundleOffer';
import type {SizeEntry} from '~/components/ProductSizeGuide';
import {Accordion} from '~/components/Accordion';
import {ProductItem} from '~/components/ProductItem';
import {ProductReviews} from '~/components/ProductReviews';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {getProductFaq} from '~/data/faq';
import {parseRating} from '~/lib/rating';
import {onlyShowcaseCollections} from '~/lib/collections';
import {getRatingForSeed} from '~/data/reviews';
import {useT} from '~/lib/i18n';

export const meta: Route.MetaFunction = ({data}) => {
  const product = data?.product;
  return [
    {title: `reda studio | ${product?.title ?? ''}`},
    {
      name: 'description',
      content: product?.seo?.description || product?.description?.slice(0, 155) || '',
    },
    {rel: 'canonical', href: `/products/${product?.handle}`},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  const deferredData = loadDeferredData(
    args,
    criticalData.product.id,
    criticalData.product.handle,
  );
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {product};
}

const MAX_RECOMMENDATIONS = 8;

/**
 * Shopify's `productRecommendations` often returns fewer than a full row (and
 * nothing at all for a brand-new product). To keep the row filled we top it up
 * with best sellers, de-duplicated and with the current product removed — real
 * catalogue products either way, never placeholders.
 */
function loadDeferredData(
  {context}: Route.LoaderArgs,
  productId: string,
  handle: string,
) {
  const recommended = Promise.all([
    context.storefront
      .query(PRODUCT_RECOMMENDATIONS_QUERY, {variables: {productId}})
      .catch((error: Error) => {
        console.error(error);
        return null;
      }),
    context.storefront
      .query(FALLBACK_PRODUCTS_QUERY, {variables: {first: 12}})
      .catch((error: Error) => {
        console.error(error);
        return null;
      }),
  ]).then(([recos, fallback]) => {
    const seen = new Set<string>([productId]);
    const merged = [];
    for (const item of [
      ...(recos?.productRecommendations ?? []),
      ...(fallback?.products?.nodes ?? []),
    ]) {
      // Recommending something the visitor can't actually buy defeats the
      // point of the row, so an out-of-stock product is skipped rather than
      // shown with a "sold out" badge here.
      if (!item || seen.has(item.id) || item.handle === handle || !item.availableForSale) {
        continue;
      }
      seen.add(item.id);
      merged.push(item);
      if (merged.length >= MAX_RECOMMENDATIONS) break;
    }
    return merged;
  });

  /*
   * The "join the community" showcase closing the page. It is deliberately
   * restricted to the drops named in ~/lib/collections — an allowlist, so a
   * new collection created in Shopify does not silently appear here. Every
   * tile still comes from a real Shopify collection, so none of them 404.
   */
  const showcaseCollections = context.storefront
    .query(SHOWCASE_COLLECTIONS_QUERY, {variables: {first: 50}})
    .then((data) => onlyShowcaseCollections(data?.collections?.nodes ?? []))
    .catch((error: Error) => {
      console.error(error);
      return [];
    });

  /*
   * The pieces the customer can choose from as the second half of the pair.
   *
   * Was a single hardcoded search for "casquette" — which made the offer look
   * like a cap promotion when it has never been one: the Shopify discount
   * applies to any second item. Now it offers a real choice, drawn from the
   * catalogue, and the customer picks.
   */
  const pairChoices = context.storefront
    .query(PAIR_CHOICES_QUERY, {variables: {first: 12}})
    .then((data) =>
      (data?.products?.nodes ?? [])
        .filter(
          (node) =>
            // Never offer the product the customer is already looking at, and
            // never offer something that can't be bought.
            node.handle !== handle &&
            node.availableForSale &&
            node.variants?.nodes?.some((variant) => variant.availableForSale),
        )
        .map((node) => {
          const variant = node.variants.nodes.find(
            (candidate) => candidate.availableForSale,
          )!;
          return {
            id: node.id,
            title: node.title,
            handle: node.handle,
            featuredImage: node.featuredImage,
            variantId: variant.id,
            price: variant.price,
          };
        })
        .slice(0, MAX_PAIR_CHOICES),
    )
    .catch((error: Error) => {
      console.error(error);
      return [];
    });

  return {recommended, showcaseCollections, pairChoices};
}

/** First sentence of the product description, for the short blurb in the buy box. */
function shortenDescription(description: string): string {
  const trimmed = description.trim();
  if (!trimmed) return '';
  const firstSentence = trimmed.split(/(?<=[.!?])\s/)[0];
  const blurb = firstSentence.length > 20 ? firstSentence : trimmed;
  return blurb.length > 180 ? `${blurb.slice(0, 177).trimEnd()}…` : blurb;
}

export default function Product() {
  const {product, recommended, showcaseCollections, pairChoices} =
    useLoaderData<typeof loader>();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const t = useT();
  const {title, description, descriptionHtml, vendor} = product;

  const galleryImages = product.images.nodes.length
    ? product.images.nodes
    : selectedVariant?.image
      ? [selectedVariant.image]
      : [];

  const available = Boolean(selectedVariant?.availableForSale);

  // Real size values for this product, with their live availability. Used by
  // the size guide; empty for products that have no size option at all.
  const sizeOption = productOptions.find((option) =>
    /taille|size|pointure/i.test(option.name),
  );
  const sizes: SizeEntry[] = (sizeOption?.optionValues ?? []).map((value) => ({
    name: value.name,
    available: value.available,
  }));

  return (
    <div className="pdp">
      {/* Gallery + buy box only. A sticky element is clamped to its grid
          CONTAINER's box (not to its own grid area), so every section that
          comes after the gallery must stay OUTSIDE this wrapper — otherwise
          the sticky panel can travel down over them. */}
      <div className="pdp__main">
        <div className="pdp__gallery">
          <ProductGallery images={galleryImages} title={title} />
        </div>

        <aside className="pdp__buy">
          <ProductPurchase
            title={title}
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
            productOptions={productOptions}
            sizes={sizes}
            available={available}
            quantityAvailable={selectedVariant?.quantityAvailable ?? null}
            shortDescription={shortenDescription(description ?? '')}
            variantId={selectedVariant?.id}
            rating={
              // A real review app's score always wins; otherwise we summarise
              // the reviews actually displayed further down the page.
              parseRating(product.rating, product.ratingCount) ??
              getRatingForSeed(product.id)
            }
          />

          {/* Limited offer: this product plus a second one the customer picks. */}
          <Suspense fallback={null}>
            <Await resolve={pairChoices}>
              {(choices) => (
                <BundleOffer
                  productTitle={title}
                  productImage={product.images.nodes[0] ?? selectedVariant?.image}
                  productPrice={selectedVariant?.price}
                  productVariantId={selectedVariant?.id}
                  choices={choices}
                  available={available}
                />
              )}
            </Await>
          </Suspense>

          {/* Description, characteristics and FAQ sit in the right column,
              directly under the payment buttons. */}
          <div className="pdp__details">
            {descriptionHtml && (
              <section className="pdp__section">
                <ProductDescription
                  html={descriptionHtml}
                  intro={shortenDescription(description ?? '')}
                />
              </section>
            )}

            <section className="pdp__section">
              <h2 className="pdp__section-title">{t('product.faqTitle')}</h2>
              <div className="pdp__accordions">
                {getProductFaq(description ?? '').map((item) => (
                  <Accordion key={item.question} title={item.question}>
                    <p>{item.answer}</p>
                  </Accordion>
                ))}
              </div>
            </section>
          </div>
        </aside>
      </div>

      <Suspense fallback={null}>
        <Await resolve={recommended}>
          {(items) =>
            items.length ? (
              <section className="pdp__related" aria-labelledby="related-heading">
                <h2 className="pdp__section-title" id="related-heading">
                  you may also like
                </h2>
                {/* Grid on desktop, touch slider on mobile — same markup, CSS
                    switches between them (see .related-rail). */}
                <div className="related-rail">
                  {items.map((item) => (
                    <div className="related-rail__item" key={item.id}>
                      <ProductItem product={item} />
                    </div>
                  ))}
                </div>
              </section>
            ) : null
          }
        </Await>
      </Suspense>

      <VisionSection />

      <div className="pdp__reviews">
        <ProductReviews productId={product.id} productTitle={title} />
      </div>

      {/* Closing the page: full-bleed collection tiles. */}
      <Suspense fallback={null}>
        <Await resolve={showcaseCollections}>
          {(collections) => (
            <CollectionShowcase
              collections={collections}
              heading="join the community"
            />
          )}
        </Await>
      </Suspense>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    quantityAvailable
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    # Standard Shopify review metafields, written by review apps. Absent when
    # the shop has no review app — no rating is then shown at all.
    rating: metafield(namespace: "reviews", key: "rating") {
      value
    }
    ratingCount: metafield(namespace: "reviews", key: "rating_count") {
      value
    }
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 12) {
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
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const RECO_PRODUCT_FRAGMENT = `#graphql
  fragment RecoMoney on MoneyV2 {
    amount
    currencyCode
  }
  fragment RecoProduct on Product {
    id
    title
    handle
    availableForSale
    # Standard Shopify review metafields, written by review apps. Absent when
    # the shop has no review app — the UI then shows no rating at all.
    rating: metafield(namespace: "reviews", key: "rating") {
      value
    }
    ratingCount: metafield(namespace: "reviews", key: "rating_count") {
      value
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
    priceRange {
      minVariantPrice {
        ...RecoMoney
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...RecoMoney
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
          ...RecoMoney
        }
        compareAtPrice {
          ...RecoMoney
        }
      }
    }
  }
` as const;

const PRODUCT_RECOMMENDATIONS_QUERY = `#graphql
  query ProductRecommendations(
    $productId: ID!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId) {
      ...RecoProduct
    }
  }
  ${RECO_PRODUCT_FRAGMENT}
` as const;

/**
 * How many pieces the offer proposes. Enough to feel like a real choice,
 * few enough that the box stays a box rather than a second catalogue.
 */
const MAX_PAIR_CHOICES = 6;

const PAIR_CHOICES_QUERY = `#graphql
  query PdpPairChoices(
    $first: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, sortKey: BEST_SELLING) {
      nodes {
        id
        title
        handle
        availableForSale
        featuredImage {
          id
          url
          altText
          width
          height
        }
        variants(first: 10) {
          nodes {
            id
            availableForSale
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
` as const;

/** Collections for the showcase tiles that close the product page. */
const SHOWCASE_COLLECTIONS_QUERY = `#graphql
  query PdpShowcaseCollections(
    $first: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collections(first: $first, sortKey: UPDATED_AT, reverse: true) {
      nodes {
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
    }
  }
` as const;

/** Tops the recommendation row up to a full set with real catalogue products. */
const FALLBACK_PRODUCTS_QUERY = `#graphql
  query PdpFallbackProducts(
    $first: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, sortKey: BEST_SELLING) {
      nodes {
        ...RecoProduct
      }
    }
  }
  ${RECO_PRODUCT_FRAGMENT}
` as const;
