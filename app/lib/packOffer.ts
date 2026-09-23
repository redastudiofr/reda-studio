import {isPreorderHandle} from './preorder';

/**
 * The essential pack: three pieces chosen by the customer — a pair of jeans,
 * a longsleeve and a tee — and a fourth tee given by Shopify.
 *
 * **Nothing here decides a price.** The reduction is a native "Buy X get Y"
 * discount configured in Shopify Admin; the storefront only picks the pieces,
 * says what the offer is and puts the lines in the basket. That division
 * matters: a storefront cannot take money off, so anything it announces has
 * to be something Shopify is already configured to do.
 *
 * What this file *does* decide is which products the pack page offers — and
 * that list has to be the same one the discount rule targets, or the customer
 * is promised a free tee that never materialises at checkout. Hence two
 * sources, in this order:
 *
 *  1. The `pack-essentiel` collection in Shopify Admin, if it exists. Point
 *     the discount rule at that same collection and the two can never drift:
 *     adding a product to the collection adds it to the page, with no deploy.
 *  2. Otherwise the explicit handles below, which must be kept in step with
 *     the rule by hand.
 *
 * See docs/pack-essentiel.md.
 */

/** Set to false to take the pack off the storefront entirely. */
export const PACK_ENABLED = true;

/** Where the pack page lives. */
export const PACK_PATH = '/pack';

/**
 * The collection that defines what belongs to the pack — create it in Shopify
 * Admin and point the Buy X get Y rule at it. Until it exists, the page falls
 * back to the handles below.
 */
export const PACK_COLLECTION_HANDLE = 'pack-essentiel';

export type PackSlot = 'jean' | 'longsleeve' | 'tshirt';

/**
 * The three choices, in the order the page presents them — the order the
 * offer is said out loud: un tshirt, un jean, un longsleeve.
 */
export const PACK_SLOTS: PackSlot[] = ['tshirt', 'jean', 'longsleeve'];

/** The slot the free piece comes from. */
export const PACK_FREE_SLOT: PackSlot = 'tshirt';

/**
 * The piece that is given — a named product, not "a tee".
 *
 * It is shown as the fourth piece of the pack, marked as free, and added to
 * the basket with the other three: a discount code takes money off a line
 * that exists, it does not create one. If this handle ever stops matching the
 * product the discount is written for, the customer is charged for it.
 */
export const PACK_FREE_HANDLE = 'tshirt-business-after-hour-white';

/**
 * The code that makes that tee free, exactly as spelled in Shopify — no
 * spaces, uppercase.
 *
 * The customer never types it: app/routes/cart.tsx attaches it to the cart
 * after every change. It is shown so they can recognise it on the basket and
 * check it themselves.
 */
export const PACK_DISCOUNT_CODE = 'REDA1120';


/**
 * Fallback selection, used while `pack-essentiel` does not exist in Shopify.
 *
 * Every one of these is a real handle, in stock at the time of writing, and
 * none is the pre-ordered piece (the cart refuses those lines outright, so a
 * pack containing one could never be added).
 */
export const PACK_FALLBACK_HANDLES: Record<PackSlot, string[]> = {
  jean: [
    'reda-jeans-raw-denim-blue-1',
    'kaizen-jeans-raw-denim-blue',
    'sherif-jeans-washed-blue-blue',
    'money-jeans-flared-grey',
  ],
  longsleeve: [
    'reda-longsleeve-black',
    'reda-longsleeve-white',
    'focused-on-million-longsleeve-blanc',
    'i-only-want-baddies-longsleeve-white',
  ],
  tshirt: ['tshirt-business-after-hour-white', 'im-scared-of-girls-tshirt-white'],
};

/** Every fallback handle, in slot order, with the pre-ordered piece removed. */
export const PACK_FALLBACK_LIST: string[] = PACK_SLOTS.flatMap((slot) =>
  PACK_FALLBACK_HANDLES[slot].filter((handle) => !isPreorderHandle(handle)),
);

/**
 * Whether the free tee is added to the basket alongside the three chosen
 * pieces.
 *
 * On, because a discount takes money off a line that exists — it does not
 * create one. The tee has to be in the basket for REDA1120 to bring it to
 * zero, which is also why the page shows it as the fourth piece rather than
 * as a promise about checkout.
 *
 * Off only if the discount is ever rewritten so that one of the three chosen
 * pieces is itself the free one.
 */
export const PACK_ADDS_FREE_LINE = true;

/**
 * Which slot a product belongs to, read from what it is rather than from a
 * list: a product added to the pack collection in Shopify lands in the right
 * slot on its own. Falls back to null for anything that matches none of them,
 * which the page then leaves out rather than filing under a guess.
 */
export function slotForProduct(product: {
  handle: string;
  title: string;
  productType?: string | null;
}): PackSlot | null {
  const text = `${product.productType ?? ''} ${product.title} ${product.handle}`;

  // Order matters: "longsleeve" must be tested before "tee", and a t-shirt
  // whose name mentions a colour must not be caught by the jeans test.
  if (/long\s*-?\s*sleeve/i.test(text)) return 'longsleeve';
  if (/t-?\s?shirt|\btee\b/i.test(text)) return 'tshirt';
  if (/jean|denim/i.test(text)) return 'jean';
  return null;
}

/** Whether a product page should mention the pack. */
export function isPackProduct(
  handle: string,
  eligible: string[] = PACK_FALLBACK_LIST,
): boolean {
  return PACK_ENABLED && eligible.includes(handle);
}
