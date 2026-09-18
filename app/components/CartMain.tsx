import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem, type CartLine} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {CartSuggestions} from './CartSuggestions';
import {useT} from '~/lib/i18n';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

export type LineItemChildrenMap = {[parentId: string]: CartLine[]};

function getLineItemChildrenMap(lines: CartLine[]): LineItemChildrenMap {
  const children: LineItemChildrenMap = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!children[parentId]) children[parentId] = [];
      children[parentId].push(line);
    }
    if ('lineComponents' in line) {
      const lineChildren = getLineItemChildrenMap(line.lineComponents);
      for (const [parentId, childIds] of Object.entries(lineChildren)) {
        if (!children[parentId]) children[parentId] = [];
        children[parentId].push(...childIds);
      }
    }
  }
  return children;
}

export function CartMain({layout, cart: originalCart}: CartMainProps) {
  const t = useT();
  const cart = useOptimisticCart(originalCart);
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;
  const childrenMap = getLineItemChildrenMap(cart?.lines?.nodes ?? []);

  if (!cartHasItems) {
    return (
      <>
        <CartEmpty />
        <CartSuggestions cart={cart} layout={layout} />
      </>
    );
  }

  return (
    <>
      <ul className="cart-lines" aria-label={t('cart.items')}>
        {(cart?.lines?.nodes ?? []).map((line) => {
          if ('parentRelationship' in line && line.parentRelationship?.parent) {
            return null;
          }
          return (
            <CartLineItem
              key={line.id}
              line={line}
              layout={layout}
              childrenMap={childrenMap}
            />
          );
        })}
      </ul>
      <CartSummary cart={cart} layout={layout} />
      <CartSuggestions cart={cart} layout={layout} />
    </>
  );
}

function CartEmpty() {
  const {close} = useAside();
  const t = useT();

  return (
    <div className="cart-empty">
      <p>{t('cart.empty')}</p>
      <br />
      <Link to="/collections" onClick={close} prefetch="viewport" className="btn--ghost">
        {t('cart.continue')}
      </Link>
    </div>
  );
}
