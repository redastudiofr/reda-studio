import {useLoaderData, data, type HeadersFunction} from 'react-router';
import type {Route} from './+types/cart';
import type {CartQueryDataReturn} from '@shopify/hydrogen';
import {CartForm} from '@shopify/hydrogen';
import {CartMain} from '~/components/CartMain';
import {useT} from '~/lib/i18n';
import {BUNDLE_ADD_ACTION, OFFER_DISCOUNT_CODE} from '~/lib/offers';
import {PACK_ADD_ACTION, PACK_DISCOUNT_CODE} from '~/lib/packOffer';
import {PREORDER_BLOCKED_VARIANT_IDS} from '~/lib/preorder';

export const meta: Route.MetaFunction = () => {
  return [{title: `reda studio | cart`}];
};

export const headers: HeadersFunction = ({actionHeaders}) => actionHeaders;

/** The shop's own offer codes — one per offer, and never two on one basket. */
const OFFER_CODES = [OFFER_DISCOUNT_CODE, PACK_DISCOUNT_CODE].filter(Boolean);

/**
 * Attaches an offer's discount code to the cart after something is added.
 *
 * The customer never has to type a code: adding through the pack attaches the
 * pack's, adding anything else attaches the other offer's. A basket carries
 * one of them at a time, never both — see the comment inside.
 *
 * Never throws. Whatever happens to the discount, the line mutation that
 * preceded it stands: that is the sale.
 */
async function withOfferDiscount(
  cart: Route.ActionArgs['context']['cart'],
  result: CartQueryDataReturn,
  code: string = OFFER_DISCOUNT_CODE,
  {replaceOffers = false}: {replaceOffers?: boolean} = {},
): Promise<CartQueryDataReturn> {
  if (!code || !result?.cart) return result;

  try {
    const codes = (result.cart.discountCodes ?? []).map(
      (discount) => discount.code,
    );
    if (codes.includes(code)) return result;

    /*
     * One offer code at a time. Whether two of the shop's codes stack, fight
     * or silently cancel each other depends on how each is set to combine in
     * Shopify — so the storefront never puts the question: a basket that
     * already carries an offer keeps the one it has, and only the pack, which
     * was just promised something specific, takes the place.
     */
    const carriesAnOffer = codes.some((existing) =>
      OFFER_CODES.includes(existing),
    );
    if (carriesAnOffer && !replaceOffers) return result;

    // Codes the customer typed themselves are kept either way.
    const kept = replaceOffers
      ? codes.filter((existing) => !OFFER_CODES.includes(existing))
      : codes;

    const discounted = await cart.updateDiscountCodes([...kept, code]);
    return discounted?.cart ? discounted : result;
  } catch (error) {
    console.error('Offer discount could not be applied', error);
    return result;
  }
}

/**
 * Runs a change to existing lines, and gives the basket back the offer code it
 * was carrying if the change knocked it off.
 *
 * Shopify drops a code from the cart the moment the basket stops satisfying
 * it, and it does not put it back when the basket satisfies it again. So
 * emptying a pack piece and adding it back used to cost the customer the free
 * tee for good — worse, the next change attached the *other* offer's code, and
 * the tee they had been promised free was quietly billed at 80%.
 *
 * Nothing here judges whether the basket qualifies; that is Shopify's to
 * decide, and it will mark the code inapplicable if it does not. This only
 * refuses to let an edit change which offer the basket is under.
 */
async function keepingOfferCode(
  cart: Route.ActionArgs['context']['cart'],
  mutate: () => Promise<CartQueryDataReturn>,
): Promise<CartQueryDataReturn> {
  let carried: string[] = [];

  try {
    const before = await cart.get();
    carried = (before?.discountCodes ?? [])
      .map((discount) => discount.code)
      .filter((code) => OFFER_CODES.includes(code));
  } catch (error) {
    console.error('Cart could not be read before the change', error);
  }

  const result = await mutate();
  if (!carried.length || !result?.cart) return result;

  try {
    const now = (result.cart.discountCodes ?? []).map(
      (discount) => discount.code,
    );
    const lost = carried.filter((code) => !now.includes(code));
    if (!lost.length) return result;

    const restored = await cart.updateDiscountCodes([...now, ...lost]);
    return restored?.cart ? restored : result;
  } catch (error) {
    console.error('Offer code could not be kept on the cart', error);
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
      result = await withOfferDiscount(cart, await cart.addLines(inputs.lines));
      break;
    }
    /*
     * Pair add: both lines in one request. The offer's code is attached
     * afterwards by `withOfferDiscount`, like every other line mutation.
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
      result = await withOfferDiscount(cart, await cart.addLines(bundleLines));
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
      result = await withOfferDiscount(
        cart,
        await cart.addLines(packLines),
        PACK_DISCOUNT_CODE,
        {replaceOffers: true},
      );
      break;
    }
    /*
     * Changing or removing a line never changes which offer the basket is
     * under: it keeps the code it had. Attaching one here is what used to
     * swap a pack for the other offer behind the customer's back.
     */
    case CartForm.ACTIONS.LinesUpdate:
      result = await keepingOfferCode(cart, () => cart.updateLines(inputs.lines));
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await keepingOfferCode(cart, () =>
        cart.removeLines(inputs.lineIds),
      );
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
