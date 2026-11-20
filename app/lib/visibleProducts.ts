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
export const VISIBLE_PRODUCT_HANDLES: readonly string[] = [
  'royal-longsleeve-white',
];

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
  // Plus rien pour le Royal : le studio blanc et la rue en paysage, seules
  // photos ajoutées ici, sont celles des bannières mobile et ordinateur de
  // l'accueil (public/v2/banner-*.webp), retirées de la galerie à la demande
  // du propriétaire pour ne pas montrer deux fois la même image.
  'royal-longsleeve-white': [],
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
