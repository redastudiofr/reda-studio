import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout, LineItemChildrenMap} from '~/components/CartMain';
import {CartForm, Image, Money, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {useAside} from './Aside';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useT} from '~/lib/i18n';

export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

export function CartLineItem({
  layout,
  line,
  childrenMap,
}: {
  layout: CartLayout;
  line: CartLine;
  childrenMap: LineItemChildrenMap;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const lineItemChildren = childrenMap[id];

  const optionLabel = selectedOptions
    .filter((o) => o.value.toLowerCase() !== 'default title')
    .map((o) => o.value)
    .join(' / ');

  return (
    <li className="cart-line">
      {image && (
        <Link
          to={lineItemUrl}
          prefetch="intent"
          onClick={() => layout === 'aside' && close()}
        >
          <Image
            alt={title}
            aspectRatio="4/5"
            data={image}
            height={90}
            width={72}
            loading="lazy"
            className="cart-line__img"
          />
        </Link>
      )}

      <div className="cart-line__body">
        <div className="cart-line__top">
          <Link
            to={lineItemUrl}
            prefetch="intent"
            onClick={() => layout === 'aside' && close()}
            className="cart-line__title"
          >
            {product.title}
          </Link>
          <Money data={line.cost.totalAmount} />
        </div>
        {optionLabel ? <span className="cart-line__option">{optionLabel}</span> : null}

        <div className="cart-line__controls">
          <CartLineQuantity line={line} />
          <CartLineRemoveButton lineIds={[id]} disabled={!!line.isOptimistic} />
        </div>
      </div>

      {lineItemChildren
        ? lineItemChildren.map((childLine) => (
            <CartLineItem
              childrenMap={childrenMap}
              key={childLine.id}
              line={childLine}
              layout={layout}
            />
          ))
        : null}
    </li>
  );
}

function CartLineQuantity({line}: {line: CartLine}) {
  const t = useT();
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="qty">
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
        <button aria-label={t('cart.decrease')} disabled={quantity <= 1 || !!isOptimistic} name="decrease-quantity" value={prevQuantity}>
          −
        </button>
      </CartLineUpdateButton>
      <span className="qty__value">{quantity}</span>
      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
        <button aria-label={t('cart.increase')} name="increase-quantity" value={nextQuantity} disabled={!!isOptimistic}>
          +
        </button>
      </CartLineUpdateButton>
    </div>
  );
}

function CartLineRemoveButton({lineIds, disabled}: {lineIds: string[]; disabled: boolean}) {
  const t = useT();
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button disabled={disabled} type="submit" className="cart-line__remove">
        {t('cart.remove')}
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({children, lines}: {children: React.ReactNode; lines: CartLineUpdateInput[]}) {
  const lineIds = lines.map((line) => line.id);
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
