import {redirect} from 'react-router';

/**
 * Nouvelle version du site : les seuls produits montrés, par handle Shopify.
 *
 * Tout autre produit est masqué ici, dans le code, et pas dépublié dans
 * Shopify : la dépublication le retirerait aussi du site en ligne, qui
 * partage la même boutique. Concrètement :
 *
 * - sa page (`/products/…`) renvoie vers le premier produit de la liste ;
 * - il n'apparaît plus dans « vous aimerez aussi », l'offre à associer, ni
 *   les suggestions du panier ;
 * - les pages qui parcourent le catalogue (collections, recherche, pack,
 *   lookbook) renvoient aussi vers ce produit, et les menus de collections,
 *   la recherche et le lien du pack disparaissent.
 *
 * Pour remontrer un produit, ajouter son handle ici.
 */
export const VISIBLE_PRODUCT_HANDLES: readonly string[] = ['royal-longsleeve-white'];

export function isProductVisible(handle: string): boolean {
  return VISIBLE_PRODUCT_HANDLES.includes(handle);
}

/**
 * Photos ajoutées à la galerie d'un produit, après ses photos Shopify : les
 * photos portées envoyées par le propriétaire (public/v2/). Ajoutées ici et
 * non dans Shopify, où elles apparaîtraient aussi sur le site en ligne.
 */
export const EXTRA_GALLERY_IMAGES: Record<
  string,
  Array<{url: string; altText: string; width: number; height: number}>
> = {
  'royal-longsleeve-white': [
    {url: '/v2/photo-street.webp', altText: 'Royal Longsleeve — White, worn on a city street', width: 1125, height: 2000},
    {url: '/v2/photo-studio.webp', altText: 'Royal Longsleeve — White, front and back, in a white studio', width: 941, height: 1672},
    {url: '/v2/photo-river.webp', altText: 'Royal Longsleeve — White, worn by a river', width: 1400, height: 2489},
    {url: '/v2/photo-street-wide.webp', altText: 'Royal Longsleeve — White, worn by two men on a city street', width: 1400, height: 788},
  ],
};

/** La page vers laquelle renvoient les produits et pages masqués. */
export const MAIN_PRODUCT_PATH = `/products/${VISIBLE_PRODUCT_HANDLES[0]}`;

/**
 * Pour les loaders des pages de catalogue : elles n'ont plus que ce produit
 * à montrer, elles renvoient donc vers lui. Redirection temporaire (302) :
 * elles reviennent dès qu'on rouvre le catalogue.
 */
export function redirectCatalogueToMainProduct(): never {
  throw redirect(MAIN_PRODUCT_PATH, 302);
}
