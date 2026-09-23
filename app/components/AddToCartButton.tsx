import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {BUNDLE_ADD_ACTION} from '~/lib/offers';
import {PACK_ADD_ACTION} from '~/lib/packOffer';
import {ShinyButton} from '~/components/ShinyButton';
import {useT} from '~/lib/i18n';

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  className = 'btn btn--full',
  bundle = false,
  pack = false,
  shiny = true,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  className?: string;
  /**
   * Routes the submit through the cart's bundle action, which adds the lines
   * and applies the offer's discount code in the same request.
   */
  bundle?: boolean;
  /**
   * Same idea for the pack, which has a different code — see
   * ~/lib/packOffer.ts. The two are separate offers and must not borrow each
   * other's code.
   */
  pack?: boolean;
  /**
   * The sweeping highlight. On the page's main call to action it earns its
   * keep; on a row of small size chips it would mean a dozen animation loops
   * running for as long as the drawer is open, for an effect nobody would see
   * on a 60px button. Those pass `shiny={false}`.
   */
  shiny?: boolean;
}) {
  const t = useT();
  const action = pack
    ? PACK_ADD_ACTION
    : bundle
      ? BUNDLE_ADD_ACTION
      : CartForm.ACTIONS.LinesAdd;
  const Button = shiny ? ShinyButton : 'button';

  return (
    <CartForm route="/cart" inputs={{lines}} action={action}>
      {(fetcher: FetcherWithComponents<any>) => (
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <Button
            type="submit"
            className={className}
            onClick={onClick}
            disabled={disabled ?? fetcher.state !== 'idle'}
          >
            {fetcher.state !== 'idle' ? t('product.adding') : children}
          </Button>
        </>
      )}
    </CartForm>
  );
}
