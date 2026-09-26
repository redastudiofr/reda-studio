import {useEffect, useRef, useState} from 'react';
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
      <p className="pack-builder__hint" aria-hidden="true">
        {t('pack.swipe')}
      </p>

      <div className="pack-builder__equation">
        {selection.map(({slot, pieces, piece, variant}, index) => {
          const current = Math.max(
            0,
            pieces.findIndex((node) => node.id === piece?.id),
          );
          const label = t(`pack.slot.${slot}` as TranslationKey);

          return (
            <article
              className="pack-card"
              key={slot}
              data-sign={index === 0 ? undefined : '+'}
              aria-label={`${t('pack.piece', {n: index + 1})} — ${label}`}
            >
              <header className="pack-card__head">
                <p className="pack-card__slot">
                  <span className="pack-card__index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {label}
                </p>
                {pieces.length > 1 && (
                  <span className="pack-card__count" aria-hidden="true">
                    {current + 1} / {pieces.length}
                  </span>
                )}
              </header>

              <PieceSlider
                pieces={pieces}
                index={current}
                sign={index === 0 ? undefined : '+'}
                label={label}
                onIndex={(next) => {
                  const node = pieces[next];
                  if (node && node.id !== piece?.id) selectPiece(slot, node);
                }}
              />

              <div className="pack-card__body">
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
          );
        })}

        {free && (
          <article
            className="pack-card pack-card--free"
            data-sign="="
            aria-label={t('pack.freeSlot')}
          >
            <header className="pack-card__head">
              <p className="pack-card__slot">{t('pack.freeSlot')}</p>
            </header>

            <div className="pack-card__stage" data-sign="=">
              <div className="pack-card__solo">
                {free.featuredImage && (
                  <Image
                    data={free.featuredImage}
                    alt={free.featuredImage.altText || free.title}
                    sizes={SLIDE_SIZES}
                    loading="lazy"
                  />
                )}
                <span className="pack-card__badge">{t('pack.freeTag')}</span>
              </div>
            </div>

            <div className="pack-card__body">
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

/** Width the pack's photos are shown at: a slide on a phone, a column on desktop. */
const SLIDE_SIZES = '(min-width: 64em) 16rem, (min-width: 48em) 22rem, 62vw';

/**
 * The pieces of one slot, side by side in a track that scrolls sideways.
 *
 * The piece in the middle is the piece chosen: swiping is choosing, with no
 * second gesture to confirm. The browser does the scrolling and the snapping
 * — native momentum on iPhone and Android, no library, nothing to drift out
 * of step with the finger — and this only reads where the track stopped.
 *
 * On a phone the neighbours show on either side, so it is plain there is more
 * to see. On desktop the track is one photo wide and the thumbnails under it
 * drive it instead.
 */
function PieceSlider({
  pieces,
  index,
  sign,
  label,
  onIndex,
}: {
  pieces: PackPiece[];
  index: number;
  sign?: string;
  label: string;
  onIndex: (index: number) => void;
}) {
  const t = useT();
  const track = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  // Distance between two slides, read from the layout rather than assumed:
  // it differs between a phone, a tablet and a desktop column.
  const stepOf = (node: HTMLDivElement) => {
    const [first, second] = node.children as unknown as HTMLElement[];
    if (!first) return 1;
    return second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
  };

  const settledIndex = (node: HTMLDivElement) =>
    Math.min(
      pieces.length - 1,
      Math.max(0, Math.round(node.scrollLeft / stepOf(node))),
    );

  const scrollTo = (next: number) => {
    const node = track.current;
    if (!node) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    node.scrollTo({left: next * stepOf(node), behavior: still ? 'auto' : 'smooth'});
  };

  // Chosen from outside — a thumbnail on desktop: bring that slide to the
  // middle. A swipe has already put it there, and this then does nothing.
  useEffect(() => {
    const node = track.current;
    if (node && settledIndex(node) !== index) scrollTo(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const onScroll = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const node = track.current;
      if (!node) return;
      const next = settledIndex(node);
      if (next !== index) onIndex(next);
    });
  };

  return (
    <div className="pack-card__stage" data-sign={sign}>
      <div
        ref={track}
        className="pack-card__track"
        data-single={pieces.length < 2 ? 'true' : undefined}
        role="group"
        aria-roledescription="carousel"
        aria-label={label}
        onScroll={onScroll}
      >
        {pieces.map((node, position) => (
          <button
            type="button"
            key={node.id}
            className="pack-card__slide"
            data-active={position === index ? 'true' : undefined}
            aria-current={position === index ? 'true' : undefined}
            aria-label={`${node.title} — ${t('pack.position', {
              n: position + 1,
              total: pieces.length,
            })}`}
            onClick={() => {
              if (position !== index) {
                scrollTo(position);
                onIndex(position);
              }
            }}
          >
            {node.featuredImage && (
              <Image
                data={node.featuredImage}
                alt=""
                sizes={SLIDE_SIZES}
                loading="lazy"
              />
            )}
          </button>
        ))}
      </div>

      {pieces.length > 1 && (
        <div className="pack-card__dots" aria-hidden="true">
          {pieces.map((node, position) => (
            <span
              key={node.id}
              className="pack-card__dot"
              data-active={position === index ? 'true' : undefined}
            />
          ))}
        </div>
      )}
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
