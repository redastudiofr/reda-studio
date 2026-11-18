/*
 * Les requêtes des produits de l'ancien accueil (grille « tous les produits »
 * et vitrines de collections), retirées de l'accueil de la nouvelle version
 * mais gardées ici : leurs fragments HomeProduct et ShowcaseProduct donnent
 * leurs types à ProductItem et CollectionProductShowcase, que les pages
 * collection utilisent encore. Prêtes à resservir si l'accueil retrouve
 * une grille de produits.
 */

export const ALL_PRODUCTS_QUERY = `#graphql
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
export const COLLECTION_PRODUCTS_QUERY = `#graphql
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
