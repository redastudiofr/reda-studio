import {useState} from 'react';
import type {MappedProductOptions} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductForm} from '~/components/ProductForm';
import {AddToCartButton} from '~/components/AddToCartButton';
import {BuyNowButton} from '~/components/BuyNowButton';
import {QuantitySelector} from '~/components/QuantitySelector';
import {ProductSizeGuide, type SizeEntry} from '~/components/ProductSizeGuide';
import {PreorderForm} from '~/components/PreorderForm';
import {StarRating} from '~/components/StarRating';
import {useAside} from '~/components/Aside';
import type {ProductRating} from '~/lib/rating';
import {useT} from '~/lib/i18n';

/**
 * The buy box: everything the customer needs to pick a variant and add it to
 * the cart, in the order the brief specifies — title, price, short blurb,
 * variants, size guide, quantity, add to cart, then delivery/returns.
 *
 * Long-form content (full description, characteristics, FAQ) deliberately
 * lives in full-width sections below the gallery instead of in here: keeping
 * this panel shorter than the viewport is what lets it be sticky on desktop
 * without trapping its own lower half off-screen.
 */
export function ProductPurchase({
  title,
  price,
  compareAtPrice,
  productOptions,
  sizes,
  available,
  quantityAvailable,
  shortDescription,
  variantId,
  rating,
  preorder = false,
}: {
  title: string;
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  productOptions: MappedProductOptions[];
  sizes: SizeEntry[];
  available: boolean;
  quantityAvailable: number | null;
  shortDescription: string;
  variantId?: string;
  rating?: ProductRating | null;
  // Scoped to exactly one product (app/lib/preorder.ts) — every other
  // product renders exactly as before, this prop simply defaults to false.
  preorder?: boolean;
}) {
  const {open: openAside} = useAside();
  const [quantity, setQuantity] = useState(1);
  const t = useT();

  const priceAmount = Number(price?.amount ?? 0);
  const compareAmount = Number(compareAtPrice?.amount ?? 0);
  const discountPct =
    compareAmount > priceAmount && compareAmount > 0
      ? Math.round((1 - priceAmount / compareAmount) * 100)
      : 0;

  const stock = !available
    ? {className: 'buybox__stock--out', label: t('product.soldOut')}
    : quantityAvailable !== null && quantityAvailable > 0 && quantityAvailable <= 5
      ? {
          className: 'buybox__stock--low',
          label: t('product.lowStock', {count: quantityAvailable}),
        }
      : {className: 'buybox__stock--in', label: t('product.inStock')};

  const lines = variantId ? [{merchandiseId: variantId, quantity}] : [];

  return (
    <div className="buybox">
      {/* Rating line above the title — only when the shop publishes real
          review metafields, never a placeholder score. */}
      {rating && (
        <div className="rating-summary">
          <StarRating rating={rating.value} size={14} />
          <span className="rating-summary__text">
            {t('product.ratedOutOf', {value: rating.value.toString()})}
            {typeof rating.count === 'number' && (
              <> {t('product.fromReviews', {count: rating.count})}</>
            )}
          </span>
        </div>
      )}

      <h1 className="buybox__title">{title}</h1>

      <div className="buybox__price">
        <ProductPrice price={price} compareAtPrice={compareAtPrice} />
        {discountPct > 0 && <span className="buybox__discount">−{discountPct}%</span>}
      </div>

      <p className="buybox__tax">
        {t('product.taxIncluded')}{' '}
        <a href="/legal/shipping">{t('product.shipping')}</a>{' '}
        {t('product.calculatedAtCheckout')}
      </p>

      {shortDescription && <p className="buybox__blurb">{shortDescription}</p>}

      {preorder ? (
        // No stock badge, size picker or quantity selector — there is
        // nothing to pick yet, only interest to register. See
        // app/components/PreorderForm.tsx and app/lib/preorder.ts.
        <div className="buybox__actions">
          <PreorderForm productTitle={title} />
        </div>
      ) : (
        <>
          <div className={`buybox__stock ${stock.className}`}>
            <span className="buybox__stock-dot" />
            {stock.label}
          </div>

          <ProductForm productOptions={productOptions} />

          <ProductSizeGuide sizes={sizes} />

          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            max={quantityAvailable}
            disabled={!available}
          />

          <div className="buybox__actions">
            <AddToCartButton
              className="btn btn--full btn--outline"
              disabled={!available}
              onClick={() => openAside('cart')}
              lines={lines}
            >
              {available ? t('product.addToCart') : t('product.soldOut')}
            </AddToCartButton>
            <BuyNowButton disabled={!available} lines={lines}>
              {t('product.buyNow')}
            </BuyNowButton>
          </div>
        </>
      )}

      <ul className="buybox__perks">
        <li>{t('product.perk.delivery')}</li>
        <li>{t('product.perk.returns')}</li>
        <li>{t('product.perk.payment')}</li>
      </ul>
    </div>
  );
}
