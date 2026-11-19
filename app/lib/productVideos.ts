import type {Storefront} from '@shopify/hydrogen';

/**
 * Nouvelle version : les vidéos téléversées sur la fiche Shopify d'un
 * produit, pour la rangée « suis-nous » du bloc communauté et les vidéos
 * portées de la fiche. Le propriétaire les ajoute dans Shopify (Produits →
 * le produit → Médias) : elles apparaissent sur le site sans toucher au code,
 * avant les vidéos de public/v2/videos/.
 */
export type SiteVideo = {src: string; poster?: string};

export const PRODUCT_VIDEOS_QUERY = `#graphql
  query ProductVideos(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      media(first: 30) {
        nodes {
          mediaContentType
          ... on Video {
            id
            previewImage {
              url
            }
            sources {
              url
              mimeType
              height
            }
          }
        }
      }
    }
  }
` as const;

/**
 * Shopify sert chaque vidéo en plusieurs qualités ; on prend le MP4 le plus
 * proche de 720 p sans le dépasser (assez net pour une vignette, léger sur
 * mobile), à défaut le plus petit MP4 disponible.
 */
function pickMp4(
  sources: Array<{url: string; mimeType: string; height: number}>,
) {
  const mp4 = sources.filter((source) => source.mimeType === 'video/mp4');
  if (!mp4.length) return null;
  const upTo720 = mp4.filter((source) => source.height <= 720);
  const pool = upTo720.length ? upTo720 : mp4;
  return pool.reduce((best, source) =>
    upTo720.length
      ? source.height > best.height
        ? source
        : best
      : source.height < best.height
        ? source
        : best,
  );
}

export async function loadProductVideos(
  storefront: Storefront,
  handle: string,
): Promise<SiteVideo[]> {
  try {
    const data = await storefront.query(PRODUCT_VIDEOS_QUERY, {
      variables: {handle},
    });
    const videos: SiteVideo[] = [];
    for (const node of data?.product?.media?.nodes ?? []) {
      if (node.mediaContentType !== 'VIDEO' || !('sources' in node)) continue;
      const source = pickMp4(node.sources);
      if (!source) continue;
      videos.push({src: source.url, poster: node.previewImage?.url});
    }
    return videos;
  } catch (error) {
    console.error(error);
    return [];
  }
}
