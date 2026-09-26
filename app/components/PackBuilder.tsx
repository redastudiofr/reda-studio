import {useState} from 'react';
import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {
  PACK_ADDS_FREE_LINE,
  PACK_DISCOUNT_CODE,
  PACK_SLOTS,
} from '~/lib/packOffer';
import type {PackData, PackPiece, PackVariant} from '~/lib/packProducts';
import type {TranslationKey} from '~/lib/i18n';
import {useI18n, useT} from '~/lib/i18n';

/**
 * The pack, composed where it is announced: three pieces, each with its model
 * and size, then the offered tee, then one button that puts the four lines in
 * the basket and attaches the pack's code (see `pack` on AddToCartButton).
 *
 * Nothing here decides a price. Each piece is shown at its own price, the tee
 * is shown as given, and FREEBSN is what makes it so at checkout.
 */
export function PackBuilder({pack}: {pack: PackData}) {
  const {slots, free} = pack;
  const {locale} = useI18n();
  const {open: openAside} = useAside();
  const t = useT();

  const [choice, setChoice] = useState<
    Record<string, {product: string; variant: string}>
  >(() =>
    Object.fromEntries(
      PACK_SLOTS.map((slot) => {
        const piece = slots[slot]?.[0];
        return [
          slot,
          {
            product: piece?.id ?? '',
            variant: piece ? (firstAvailable(piece)?.id ?? '') : '',
          },
        ];
      }),
    ),
  );

  // The offered tee has a size of its own: it is a piece the customer will
  // wear, not a line item that happens to cost nothing.
  const [freeSize, setFreeSize] = useState(() =>
    free ? (firstAvailable(free)?.id ?? '') : '',
  );
  const freeVariant = free?.variants.nodes.find((node) => node.id === freeSize);

  const selection = PACK_SLOTS.map((slot) => {
    const pieces = slots[slot] ?? [];
    const piece = pieces.find((node) => node.id === choice[slot]?.product);
    const variant = piece?.variants.nodes.find(
      (node) => node.id === choice[slot]?.variant,
    );
    return {slot, pieces, piece, variant};
  });

  // Without the tee's line the code has nothing to take off, and the
  // customer would pay for a pack the page called complete.
  const complete =
    selection.every(({variant}) => variant?.availableForSale) &&
    (!PACK_ADDS_FREE_LINE || Boolean(freeVariant?.availableForSale));

  const currency = selection[0]?.variant?.price.currencyCode ?? 'EUR';
  const total = selection.reduce(
    (sum, {variant}) => sum + Number(variant?.price.amount ?? 0),
    0,
  );
  const money = (amount: number) =>
    new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
      style: 'currency',
      currency,
    }).format(amount);

  const chosenLines = selection
    .filter(({variant}) => variant)
    .map(({variant}) => ({merchandiseId: variant!.id, quantity: 1}));

  // The offered tee goes into the basket at its normal price: the code is
  // what brings it to zero, and a code cannot discount a line that is not
  // there. See PACK_ADDS_FREE_LINE.
  const lines =
    PACK_ADDS_FREE_LINE && freeVariant
      ? [...chosenLines, {merchandiseId: freeVariant.id, quantity: 1}]
      : chosenLines;

  const selectPiece = (slot: string, piece: PackPiece) =>
    setChoice((current) => ({
      ...current,
      // A size only means something on the piece it belongs to: changing the
      // piece starts its sizes over.
      [slot]: {product: piece.id, variant: firstAvailable(piece)?.id ?? ''},
    }));

  const selectSize = (slot: string, variant: string) =>
    setChoice((current) => ({
      ...current,
      [slot]: {product: current[slot]?.product ?? '', variant},
    }));

  return (
    <div className="pack-builder">
      <div className="pack-builder__equation">
        {selection.map(({slot, pieces, piece, variant}, index) => (
          <article
            className="pack-card"
            key={slot}
            aria-label={`${t('pack.piece', {n: index + 1})} — ${t(
              `pack.slot.${slot}` as TranslationKey,
            )}`}
          >
            <div
              className="pack-card__shot"
              data-sign={index === 0 ? undefined : '+'}
            >
              {piece?.featuredImage && (
                <Image
                  data={piece.featuredImage}
                  alt={piece.featuredImage.altText || piece.title}
                  sizes="(min-width: 64em) 15rem, 40vw"
                  loading="lazy"
                />
              )}
            </div>

            <div className="pack-card__body">
              <p className="pack-card__slot">
                <span className="pack-card__index">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {t(`pack.slot.${slot}` as TranslationKey)}
              </p>

              {piece ? (
                <Link
                  to={`/products/${piece.handle}`}
                  className="pack-card__name"
                >
                  {piece.title}
                </Link>
              ) : (
                <p className="pack-card__name">{t('pack.unavailable')}</p>
              )}

              {/* Un div, pas un p : Money rend lui-même un div, qu'un p ne
                  peut pas contenir — le navigateur le couperait en deux et
                  l'hydratation échouerait. */}
              <div className="pack-card__price">
                {variant ? <Money data={variant.price} /> : null}
              </div>

              {pieces.length > 1 && (
                <div
                  className="pack-card__models"
                  role="radiogroup"
                  aria-label={t('pack.model')}
                >
                  {pieces.map((node) => (
                    <button
                      type="button"
                      role="radio"
                      key={node.id}
                      className="pack-card__model"
                      aria-checked={node.id === piece?.id}
                      aria-label={node.title}
                      title={node.title}
                      onClick={() => selectPiece(slot, node)}
                    >
                      {node.featuredImage && (
                        <Image
                          data={node.featuredImage}
                          alt=""
                          width={96}
                          height={96}
                          crop="center"
                          loading="lazy"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {piece && (
                <Sizes
                  variants={piece.variants.nodes}
                  selected={variant?.id}
                  onSelect={(id) => selectSize(slot, id)}
                />
              )}
            </div>
          </article>
        ))}

        {free && (
          <article
            className="pack-card pack-card--free"
            aria-label={t('pack.freeSlot')}
          >
            <div className="pack-card__shot" data-sign="=">
              {free.featuredImage && (
                <Image
                  data={free.featuredImage}
                  alt={free.featuredImage.altText || free.title}
                  sizes="(min-width: 64em) 15rem, 40vw"
                  loading="lazy"
                />
              )}
              <span className="pack-card__badge">{t('pack.freeTag')}</span>
            </div>

            <div className="pack-card__body">
              <p className="pack-card__slot">{t('pack.freeSlot')}</p>
              <p className="pack-card__name">{free.title}</p>
              <p className="pack-card__price pack-card__price--free">
                {t('pack.freeTag')}
              </p>
              <Sizes
                variants={free.variants.nodes}
                selected={freeSize}
                onSelect={setFreeSize}
              />
            </div>
          </article>
        )}
      </div>

      <div className="pack-builder__checkout">
        <div className="pack-builder__total">
          <span>{t('pack.total')}</span>
          <strong>{money(total)}</strong>
        </div>
        <p className="pack-builder__total pack-builder__total--free">
          <span>{free?.title ?? t('pack.freeSlot')}</span>
          <span>{t('pack.freeTag')}</span>
        </p>

        <AddToCartButton
          pack
          lines={lines}
          disabled={!complete}
          className="btn btn--full pack-builder__add"
          onClick={() => openAside('cart')}
        >
          {complete ? t('pack.add') : t('pack.unavailable')}
        </AddToCartButton>
      </div>

      <ul className="pack-builder__points">
        <li>{t('pack.point.choice')}</li>
        <li>{t('pack.point.free')}</li>
        <li>{t('pack.point.cart', {code: PACK_DISCOUNT_CODE})}</li>
      </ul>
    </div>
  );
}

function Sizes({
  variants,
  selected,
  onSelect,
}: {
  variants: PackVariant[];
  selected?: string;
  onSelect: (id: string) => void;
}) {
  const t = useT();

  // A piece sold in one size has nothing to choose.
  if (variants.length < 2) return null;

  return (
    <div
      className="pack-card__sizes"
      role="radiogroup"
      aria-label={t('pack.size')}
    >
      {variants.map((node) => (
        <button
          type="button"
          role="radio"
          key={node.id}
          className="option-btn pack-card__size"
          aria-checked={node.id === selected}
          data-selected={node.id === selected}
          data-unavailable={!node.availableForSale}
          disabled={!node.availableForSale}
          aria-label={
            node.availableForSale
              ? sizeLabel(node)
              : `${sizeLabel(node)} — ${t('product.soldOut')}`
          }
          onClick={() => onSelect(node.id)}
        >
          {sizeLabel(node)}
        </button>
      ))}
    </div>
  );
}

/** The size on a variant, from the size option when there is one. */
function sizeLabel(variant: PackVariant): string {
  const option = variant.selectedOptions.find(({name}) =>
    /taille|size|pointure/i.test(name),
  );
  return option?.value ?? variant.title;
}

function firstAvailable(piece: PackPiece): PackVariant | undefined {
  return (
    piece.variants.nodes.find((variant) => variant.availableForSale) ??
    piece.variants.nodes[0]
  );
}
