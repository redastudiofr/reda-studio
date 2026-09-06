import {useLoaderData, data, type HeadersFunction} from 'react-router';
import type {Route} from './+types/cart';
import type {CartQueryDataReturn} from '@shopify/hydrogen';
import {CartForm} from '@shopify/hydrogen';
import {CartMain} from '~/components/CartMain';
import {BUNDLE_ADD_ACTION, OFFER_DISCOUNT_CODE} from '~/lib/offers';
import {PREORDER_BLOCKED_VARIANT_IDS} from '~/lib/preorder';

export const meta: Route.MetaFunction = () => {
  return [{title: `reda studio | cart`}];
};

export const headers: HeadersFunction = ({actionHeaders}) => actionHeaders;

/**
 * Attaches the offer's discount code to the cart after any change to its
 * lines.
 *
 * **Normally does nothing.** The offer runs on a Shopify *automatic* discount:
 * Shopify evaluates the basket itself and puts the reduction in the totals,
 * with no code involved and nothing for the storefront to apply. This only
 * comes alive if `OFFER_DISCOUNT_CODE` is filled in — the escape hatch
 * described in app/lib/offers.ts.
 *
 * Never throws. Whatever happens to the discount, the line mutation that
 * preceded it stands — that is the sale.
 */
async function withOfferDiscount(
  cart: Route.ActionArgs['context']['cart'],
  result: CartQueryDataReturn,
): Promise<CartQueryDataReturn> {
  if (!OFFER_DISCOUNT_CODE || !result?.cart) return result;

  try {
    const codes = (result.cart.discountCodes ?? []).map(
      (discount) => discount.code,
    );
    if (codes.includes(OFFER_DISCOUNT_CODE)) return result;

    const discounted = await cart.updateDiscountCodes([
      ...codes,
      OFFER_DISCOUNT_CODE,
    ]);
    return discounted?.cart ? discounted : result;
  } catch (error) {
    console.error('Offer discount could not be applied', error);
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
    case CartForm.ACTIONS.LinesUpdate:
      result = await withOfferDiscount(cart, await cart.updateLines(inputs.lines));
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await withOfferDiscount(cart, await cart.removeLines(inputs.lineIds));
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
  const cart = useLoaderData<typeof loader>();

  return (
    <div className="page page--wide">
      <h1>cart</h1>
      <CartMain layout="page" cart={cart} />
    </div>
  );
}
