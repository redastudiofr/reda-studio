import {redirect} from 'react-router';

/**
 * Single-product mode: the whole site sells one piece.
 *
 * The home page is that product's page, under a banner; everything that
 * leads to other products (catalogue pages, collection menus, "you may also
 * like", the pair offer, cart suggestions, the pack) is hidden or sends the
 * visitor back home. Cart, legal pages, contact, FAQ, story and account are
 * unchanged.
 *
 * Set to null to give the site back its full catalogue. See
 * docs/single-product.md.
 */
export const SINGLE_PRODUCT_HANDLE: string | null = 'royal-longsleeve-white';

export function isSingleProductMode(): boolean {
  return SINGLE_PRODUCT_HANDLE !== null;
}

/**
 * For the loaders of catalogue pages (collections, search, pack…): in
 * single-product mode they have nothing to show but the one product, which
 * is the home page — so they send the visitor there. A temporary redirect
 * (302): the pages come back as soon as the mode is turned off.
 */
export function redirectHomeIfSingleProduct() {
  if (isSingleProductMode()) throw redirect('/', 302);
}
