import {seededInt} from '~/data/reviews';

/**
 * What the buy box says about availability.
 *
 * Shopify's own inventory always wins. `quantityAvailable` is a real number
 * whenever the shop lets the Storefront API publish it; when it does, a low
 * count is shown exactly as Shopify reports it and nothing here invents
 * anything.
 *
 * When Shopify publishes no quantity at all (inventory not tracked, or not
 * exposed to the storefront), part of the catalogue instead shows an
 * illustrative "only N left" — at the store owner's explicit request, and in
 * the same spirit as the illustrative reviews documented in
 * docs/synthetic-ratings.md. Two rules keep it from becoming noise or a lie
 * that shifts under the customer:
 *
 * - it is derived from the product id, so the same product always shows the
 *   same number, on every visit, for every visitor and on every page;
 * - it is shown on a minority of products (see SHOW_ONE_IN), the rest keep a
 *   plain "in stock".
 *
 * See docs/stock-display.md.
 */
export type StockState =
  | {kind: 'out'}
  | {kind: 'low'; count: number}
  | {kind: 'in'};

/** Shopify's own count is called "low" at or under this many units. */
const REAL_LOW_THRESHOLD = 10;

/** Roughly two products in five carry an illustrative count. */
const SHOW_ONE_IN = 100;
const SHOW_BELOW = 38;

export function stockState({
  available,
  quantityAvailable,
  seed,
}: {
  available: boolean;
  /** Shopify's figure, or null when the store doesn't publish one. */
  quantityAvailable: number | null;
  /** Stable per product — the product id. */
  seed: string;
}): StockState {
  if (!available) return {kind: 'out'};

  if (quantityAvailable !== null) {
    return quantityAvailable > 0 && quantityAvailable <= REAL_LOW_THRESHOLD
      ? {kind: 'low', count: quantityAvailable}
      : {kind: 'in'};
  }

  /*
   * Two independent draws off the same id: one decides whether this product
   * shows a count at all, the other is the count itself. The salt goes in
   * front of the id, never behind it — the hash is djb2, whose low bits are
   * dominated by the final characters, so a shared suffix had half the
   * catalogue announcing the same "only 3 left".
   */
  if (seededInt(`show:${seed}`, 0, SHOW_ONE_IN - 1) >= SHOW_BELOW) {
    return {kind: 'in'};
  }

  return {kind: 'low', count: seededInt(`units:${seed}`, 1, 10)};
}
