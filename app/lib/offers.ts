import {SECOND_ITEM_PERCENT} from './tierDiscount';
import {PACK_DISCOUNT_CODE} from './packOffer';

/**
 * Second-piece offer — 30% off the second item in the basket.
 *
 * A storefront cannot change a price: what the customer pays is decided by
 * Shopify at cart and checkout. So the offer is driven by a real Shopify
 * discount, and this file only says how to talk about it. The procedure to
 * create that discount is in docs/second-item-offer.md.
 *
 * Everything here is display only. If these figures and the Shopify discount
 * ever disagree, the customer is shown one price and charged another — change
 * both together, never one alone.
 */

/**
 * Percentage taken off the second piece.
 *
 * Read from the storefront-wide volume offer rather than written twice: the
 * tiered app in Shopify Admin now decides what a second piece costs, and the
 * "take two" block on the product page has to say the same number as the line
 * under the price two centimetres above it.
 */
export const SECOND_ITEM_DISCOUNT_PERCENT = SECOND_ITEM_PERCENT;

/** Set to false to switch the offer off across the storefront. */
export const OFFER_ENABLED = true;

/**
 * The code the cart carries, attached by app/routes/cart.tsx after every
 * change.
 *
 * It is the pack's code — REDA1120, the one that makes the offered tee free
 * — and it is written in app/lib/packOffer.ts. One code is attached to the
 * cart, not two: running a second one alongside it would mean two reductions
 * for the same basket, stacking or fighting depending on how each is set to
 * combine in Shopify.
 *
 * Emptying it stops the storefront applying anything at all.
 */
export const OFFER_DISCOUNT_CODE: string = PACK_DISCOUNT_CODE;

/**
 * Custom cart action: adds the pair's two lines in one request.
 *
 * Kept registered in the cart route even when the offer is off — a browser
 * holding a cached page from when it was on would otherwise submit an action
 * the route no longer knows, and fall through to the "not defined" throw.
 */
export const BUNDLE_ADD_ACTION = 'CustomBundleAdd' as const;

/**
 * What the offer takes off a pair, following Shopify's own rule for
 * "buy X get Y": the reduction lands on the **cheapest** eligible item, not on
 * the one the customer happens to have added second.
 *
 * Used for the product page's estimate. The cart doesn't use it — it reports
 * the figure Shopify actually allocated, so the two can never drift.
 */
export function pairSaving(firstAmount: number, secondAmount: number): number {
  if (!OFFER_ENABLED) return 0;
  const cheapest = Math.min(firstAmount, secondAmount);
  return (cheapest * SECOND_ITEM_DISCOUNT_PERCENT) / 100;
}
