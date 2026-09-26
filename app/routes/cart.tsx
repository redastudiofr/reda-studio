import {useLoaderData, data, type HeadersFunction} from 'react-router';
import type {Route} from './+types/cart';
import type {CartQueryDataReturn} from '@shopify/hydrogen';
import {CartForm} from '@shopify/hydrogen';
import {CartMain} from '~/components/CartMain';
import {useT} from '~/lib/i18n';
import {
  BUNDLE_ADD_ACTION,
  OFFER_DISCOUNT_CODE,
  OFFER_MIN_PIECES,
  RETIRED_OFFER_CODES,
} from '~/lib/offers';
import {PACK_ADD_ACTION, PACK_DISCOUNT_CODE} from '~/lib/packOffer';
import {PREORDER_BLOCKED_VARIANT_IDS} from '~/lib/preorder';

export const meta: Route.MetaFunction = () => {
  return [{title: `reda studio | cart`}];
};

export const headers: HeadersFunction = ({actionHeaders}) => actionHeaders;

/** The shop's own offer codes — one per offer, and never two on one basket. */
const OFFER_CODES = [OFFER_DISCOUNT_CODE, PACK_DISCOUNT_CODE].filter(Boolean);

/** A retired code of the second-piece offer is read as the current one. */
const current = (code: string) =>
  RETIRED_OFFER_CODES.includes(code) ? OFFER_DISCOUNT_CODE : code;

const isShopCode = (code: string) =>
  OFFER_CODES.includes(code) || RETIRED_OFFER_CODES.includes(code);

/**
 * Runs a change to the cart and settles which offer code it comes out with.
 *
 * One rule, for every kind of change: **a basket keeps the offer it is
 * already under.** Only an add can put it under one, only the pack can take
 * the place of another, and nothing else ever swaps one code for the other.
 *
 * That rule exists because of a way this went wrong. Shopify removes a code
 * from the cart the moment the basket stops satisfying it, and never puts it
 * back when the basket satisfies it again. So any change — adding a piece,
 * emptying one, a quantity — could leave the pack's code off the basket; the
 * storefront then saw a basket with no offer, attached the *other* offer's
 * code, and the tee the customer had been promised free was quietly billed at
 * 80% of its price. Reading the codes only after the change is what made that
 * invisible: it looks exactly like a basket that never had one.
 *
 * So the codes are read before as well, and anything the basket was carrying
 * is put back. Nothing here decides whether the basket *deserves* the
 * reduction — that is Shopify's to judge, and it marks a code inapplicable
 * when it isn't. Codes the customer typed themselves are never touched.
 *
 * Never throws. Whatever happens to the discount, the line change that
 * preceded it stands: that is the sale.
 */
async function withOfferCode(
  cart: Route.ActionArgs['context']['cart'],
  mutate: () => Promise<CartQueryDataReturn>,
  {attach = '', replace = false}: {attach?: string; replace?: boolean} = {},
): Promise<CartQueryDataReturn> {
  let carried: string[] = [];

  try {
    const before = await cart.get();
    carried = (before?.discountCodes ?? [])
      .map((discount) => current(discount.code))
      .filter((code) => OFFER_CODES.includes(code));
  } catch (error) {
    console.error('Cart could not be read before the change', error);
  }

  const result = await mutate();
  if (!result?.cart) return result;

  try {
    const now = (result.cart.discountCodes ?? []).map(
      (discount) => discount.code,
    );

    // Which offer the basket should end up under.
    const chosen =
      replace && attach
        ? [attach]
        : carried.length
          ? carried
          : attach
            ? [attach]
            : [];

    // The second-piece code only once there is a second piece.
    const pieces = result.cart.totalQuantity ?? 0;
    const offer = [...new Set(chosen)].filter(
      (code) => code !== OFFER_DISCOUNT_CODE || pieces >= OFFER_MIN_PIECES,
    );

    const typedByTheCustomer = now.filter((code) => !isShopCode(code));
    const wanted = [...typedByTheCustomer, ...offer];

    const unchanged =
      wanted.length === now.length && wanted.every((code) => now.includes(code));
    if (unchanged) return result;

    const updated = await cart.updateDiscountCodes(wanted);
    return updated?.cart ? updated : result;
  } catch (error) {
    console.error('Offer code could not be settled on the cart', error);
    return result;
  }
}

/**
 * Blocks adding "Royal Longsleeve — White" to the cart while its pre-order
 * is active (see app/lib/preorder.ts) — even from a request crafted
 * straight against this action, bypassing the buy box entirely, which for
 * that one product never renders an add-to-cart control in the first
 * place. Every other product's lines pass through untouched.
 */
function rejectPreorderLines(
  lines: Array<{merchandiseId?: string | null}> | undefined,
) {
  const blocked = lines?.some(
    (line) => line.merchandiseId && PREORDER_BLOCKED_VARIANT_IDS.has(line.merchandiseId),
  );
  if (!blocked) return null;

  return data(
    {
      cart: null,
      errors: [{message: 'This product is available for pre-order only.'}],
      warnings: [],
      analytics: {cartId: undefined},
    },
    {status: 400},
  );
}

export async function action({request, context}: Route.ActionArgs) {
  const {cart} = context;

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result: CartQueryDataReturn;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd: {
      const rejected = rejectPreorderLines(inputs.lines);
      if (rejected) return rejected;
      result = await withOfferCode(cart, () => cart.addLines(inputs.lines), {
        attach: OFFER_DISCOUNT_CODE,
      });
      break;
    }
    /*
     * Pair add: both lines in one request. The offer's code is attached
     * afterwards by `withOfferCode`, like every other line change.
     *
     * The case stays registered even when the offer is off, so a browser
     * holding a cached page from when it was on still adds to cart instead of
     * hitting the "not defined" throw below.
     */
    case BUNDLE_ADD_ACTION: {
      // A custom action's inputs are untyped, so the lines are narrowed here.
      const bundleLines = inputs.lines as Parameters<typeof cart.addLines>[0];
      const rejected = rejectPreorderLines(bundleLines);
      if (rejected) return rejected;
      result = await withOfferCode(cart, () => cart.addLines(bundleLines), {
        attach: OFFER_DISCOUNT_CODE,
      });
      break;
    }
    /*
     * Pack add: the three chosen pieces plus the offered tee, and the pack's
     * own code — the one that brings that tee to zero. It replaces any other
     * offer code on the basket, because it is the offer the customer was just
     * shown.
     */
    case PACK_ADD_ACTION: {
      const packLines = inputs.lines as Parameters<typeof cart.addLines>[0];
      const rejected = rejectPreorderLines(packLines);
      if (rejected) return rejected;
      result = await withOfferCode(cart, () => cart.addLines(packLines), {
        attach: PACK_DISCOUNT_CODE,
        replace: true,
      });
      break;
    }
    /*
     * Changing or removing a line never changes which offer the basket is
     * under: it keeps the code it had. A quantity raised to two pieces on a
     * basket under no offer yet gets the second-piece code, like an add —
     * a basket under the pack keeps the pack's (`withOfferCode`).
     */
    case CartForm.ACTIONS.LinesUpdate:
      result = await withOfferCode(cart, () => cart.updateLines(inputs.lines), {
        attach: OFFER_DISCOUNT_CODE,
      });
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await withOfferCode(cart, () => cart.removeLines(inputs.lineIds));
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = (
        formDiscountCode ? [formDiscountCode] : []
      ) as string[];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesAdd: {
      const formGiftCardCode = inputs.giftCardCode;

      const giftCardCodes = (
        formGiftCardCode ? [formGiftCardCode] : []
      ) as string[];

      result = await cart.addGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesRemove: {
      const appliedGiftCardIds = inputs.giftCardCodes as string[];
      result = await cart.removeGiftCardCodes(appliedGiftCardIds);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  /*
   * "Buy now" posts this flag and expects the server to send the customer
   * straight to checkout. Redirecting here rather than from the browser keeps
   * the whole thing one navigation: nothing is fetched client-side, so nothing
   * can be aborted mid-flight and surface as an error.
   *
   * If the cart came back without a checkout URL we simply fall through to the
   * cart page — a missing URL must not cost the customer their basket.
   */
  if (formData.get('checkoutAfterAdd') === 'true') {
    status = 303;
    headers.set('Location', cartResult?.checkoutUrl ?? '/cart');
  }

  return data(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

export async function loader({context}: Route.LoaderArgs) {
  const {cart} = context;
  return await cart.get();
}

export default function Cart() {
  const t = useT();
  const cart = useLoaderData<typeof loader>();

  return (
    <div className="page page--wide">
      <h1>{t('cart.title')}</h1>
      <CartMain layout="page" cart={cart} />
    </div>
  );
}
