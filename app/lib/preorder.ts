/**
 * Pre-order / waitlist — see docs/preorder-royal-longsleeve.md for the full
 * picture. Everything that scopes the feature to one product lives here, so
 * turning it on for a product (or off entirely) is a change in one file.
 *
 * Off since 14 November 2026: the Royal Longsleeve — White, the only product
 * it was ever used for, is on sale normally, with the usual buy box. To run
 * a pre-order again, put that product's handle here and its variant ids in
 * PREORDER_BLOCKED_VARIANT_IDS below.
 */
export const PREORDER_PRODUCT_HANDLE: string | null = null;

export function isPreorderHandle(handle: string): boolean {
  return PREORDER_PRODUCT_HANDLE !== null && handle === PREORDER_PRODUCT_HANDLE;
}

/**
 * This product's variant IDs, as of the pre-order going live — checked in
 * app/routes/cart.tsx so a request crafted straight against the cart action
 * (bypassing the buy box, which never renders an add-to-cart control for
 * this product at all) still can't add it.
 *
 * Hardcoded rather than looked up, so a normal add-to-cart for every *other*
 * product never pays for an extra query. The trade-off: if a size is ever
 * added to this product while the pre-order is active, it must be added
 * here too — Shopify Admin → Products → Royal Longsleeve — White →
 * Variants → copy the numeric id from each variant's URL.
 */
export const PREORDER_BLOCKED_VARIANT_IDS = new Set<string>([
  // Empty while no product is on pre-order. The Royal Longsleeve's were
  // 54873314263379 (XS) to 54873314394451 (XL) — they must stay out of here
  // now that it is for sale, or the cart would refuse it.
]);

/**
 * The discount promised to waitlist members once this product actually
 * launches. Only a constant, referenced nowhere that sends it automatically
 * — see docs/preorder-royal-longsleeve.md for how to run that campaign by
 * hand, once, when the piece is actually ready to sell.
 */
export const PREORDER_LAUNCH_PROMO_CODE = 'ROYALVIP10';

/**
 * The tag every waitlist sign-up gets in Shopify Admin → Customers. Kept on
 * the Royal Longsleeve's handle: that is how the people who signed up for it
 * are found in the admin.
 */
export const PREORDER_CUSTOMER_TAG = 'preorder-royal-longsleeve-white';
