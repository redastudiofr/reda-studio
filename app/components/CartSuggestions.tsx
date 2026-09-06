import {Suspense} from 'react';
import {Await, Link, useRouteLoaderData} from 'react-router';
import {Image, Money, type OptimisticCart} from '@shopify/hydrogen';
import type {
  CartApiQueryFragment,
  CartSuggestionsQuery,
  SuggestedProductFragment,
} from 'storefrontapi.generated';
import type {loader as rootLoader} from '~/root';
import {AddToCartButton} from '~/components/AddToCartButton';
import type {CartLayout} from '~/components/CartMain';
import {isPreorderHandle} from '~/lib/preorder';
import {useT} from '~/lib/i18n';

/** How many suggestions the drawer offers before it starts nagging. */
const MAX_SUGGESTIONS = 3;

/**
 * "You might also like", inside the cart.
 *
 * The data comes from the root loader, already in flight before anyone opens
 * the drawer, so the panel is populated rather than spinning at the exact
 * moment someone is trying to check out.
 */
export function CartSuggestions({
  cart,
  layout,
}: {
  // The optimistic cart, same as CartSummary takes — so a line added a moment
  // ago already counts as "in the cart" and isn't suggested straight back.
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
}) {
  const rootData = useRouteLoaderData<typeof rootLoader>('root');
  const t = useT();
  if (!rootData?.cartSuggestions) return null;

  // Everything already in the basket, so we never suggest it back.
  const inCart = new Set(
    (cart?.lines?.nodes ?? []).map((line) =>
      'merchandise' in line ? line.merchandise.product.id : '',
    ),
  );

  return (
    <Suspense fallback={null}>
      <Await resolve={rootData.cartSuggestions} errorElement={null}>
        {(data: CartSuggestionsQuery | null) => {
          const products = (data?.products?.nodes ?? [])
            .filter(
              (product) =>
                product.availableForSale &&
                !inCart.has(product.id) &&
                // Never suggest a pre-order-only product straight into the
                // cart from here — see app/lib/preorder.ts.
                !isPreorderHandle(product.handle),
            )
            .slice(0, MAX_SUGGESTIONS);

          if (products.length === 0) return null;

          return (
            <section
              className={`cart-suggest cart-suggest--${layout}`}
              aria-labelledby="cart-suggest-heading"
            >
              <h3 className="cart-suggest__title" id="cart-suggest-heading">
                {t('cart.suggestTitle')}
              </h3>
              <ul className="cart-suggest__list">
                {products.map((product) => (
                  <SuggestionRow key={product.id} product={product} />
                ))}
              </ul>
            </section>
          );
        }}
      </Await>
    </Suspense>
  );
}

function SuggestionRow({product}: {product: SuggestedProductFragment}) {
  const t = useT();
  const variants = product.variants.nodes.filter(
    (variant) => variant.availableForSale,
  );

  if (variants.length === 0) return null;

  const single = variants.length === 1;

  return (
    <li className="cart-suggest__row">
      <Link
        to={`/products/${product.handle}`}
        className="cart-suggest__media"
        prefetch="intent"
        tabIndex={-1}
        aria-hidden="true"
      >
        {product.featuredImage && (
          <Image
            data={product.featuredImage}
            alt={product.featuredImage.altText || product.title}
            aspectRatio="1/1"
            sizes="72px"
            loading="lazy"
          />
        )}
      </Link>

      <div className="cart-suggest__body">
        <Link
          to={`/products/${product.handle}`}
          className="cart-suggest__name"
          prefetch="intent"
        >
          {product.title.toLowerCase()}
        </Link>
        <p className="cart-suggest__price">
          <Money data={product.priceRange.minVariantPrice} />
        </p>

        {/*
          A product with sizes cannot have a single "add" button without the
          storefront choosing a size for the customer — which is how people end
          up with the wrong one. So the sizes *are* the buttons: one tap picks
          and adds. Only a genuinely single-variant product gets a plain "add".
        */}
        <div className="cart-suggest__variants">
          {variants.map((variant) => (
            <AddToCartButton
              key={variant.id}
              className="cart-suggest__add"
              lines={[{merchandiseId: variant.id, quantity: 1}]}
              shiny={false}
            >
              {single ? t('cart.add') : variant.title.toLowerCase()}
            </AddToCartButton>
          ))}
        </div>
      </div>
    </li>
  );
}
