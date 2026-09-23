import {useState} from 'react';
import {Link, useLoaderData} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {Route} from './+types/pack';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {Reveal} from '~/components/Reveal';
import {TierNote} from '~/components/TierNote';
import {tierTotal} from '~/lib/tierDiscount';
import {useI18n, useT} from '~/lib/i18n';

/**
 * The signature pack: three best-sellers presented together, added to the
 * basket in one go, each in the size the customer picks.
 *
 * It creates no product and invents no price. The three pieces are the real
 * Shopify products below, at their real prices; the pack price is what the
 * storefront-wide volume offer (see ~/lib/tierDiscount) makes of those three,
 * and the basket is what actually applies it. Change a piece by changing a
 * handle here — nothing else knows which products these are.
 *
 * The t-shirts are the one piece here that the best-seller collection does not
 * carry. The composition asked for — jeans, longsleeve, tee — wins over where
 * each piece is filed: a "pack" whose third piece is a shirt is not the pack.
 */
const PACK_HANDLES = {
  jean: 'kaizen-jeans-raw-denim-blue',
  longsleeve: 'reda-longsleeve-black',
  third: 'tshirt-business-after-hour-white',
} as const;

/** The pack's lifestyle shot. Replace with a photo of the three pieces worn together. */
const PACK_IMAGE = {
  src: '/images/histoire-cerisiers.webp',
  width: 675,
  height: 1200,
};

type PackVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: {amount: string; currencyCode: string};
  selectedOptions: Array<{name: string; value: string}>;
};

type PackPiece = {
  id: string;
  title: string;
  handle: string;
  featuredImage: {
    id?: string | null;
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  variants: {nodes: PackVariant[]};
};

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'reda studio | pack signature'},
    {
      name: 'description',
      content:
        'Three reda studio pieces together: jeans, longsleeve and tee, in the sizes you choose.',
    },
  ];
};

export async function loader({context}: Route.LoaderArgs) {
  /*
   * Typed here rather than from storefrontapi.generated: those types are
   * produced by codegen at build time, and a query that has never been
   * generated yet would leave this file referring to a type that does not
   * exist.
   */
  const data = (await context.storefront.query(PACK_QUERY, {
    variables: {
      jean: PACK_HANDLES.jean,
      longsleeve: PACK_HANDLES.longsleeve,
      third: PACK_HANDLES.third,
    },
  })) as {
    jean: PackPiece | null;
    longsleeve: PackPiece | null;
    third: PackPiece | null;
  };

  const pieces = [data?.jean, data?.longsleeve, data?.third].filter(
    (piece): piece is PackPiece => Boolean(piece),
  );

  if (pieces.length < 3) {
    // One of the handles no longer matches a product in Shopify. Saying so
    // here beats a page that quietly shows a two-piece "pack".
    console.warn(
      `Pack page: only ${pieces.length} of 3 products found — check PACK_HANDLES against Shopify Admin → Products.`,
    );
  }

  return {pieces};
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

export default function PackPage() {
  const {pieces} = useLoaderData<typeof loader>();
  const {locale} = useI18n();
  const {open: openAside} = useAside();
  const t = useT();

  // One chosen variant per piece, starting on the first in stock — the same
  // thing a product page does when it opens.
  const [chosen, setChosen] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      pieces.map((piece) => [piece.id, firstAvailable(piece)?.id ?? '']),
    ),
  );

  if (!pieces.length) return null;

  const selection = pieces.map((piece) => ({
    piece,
    variant: piece.variants.nodes.find((node) => node.id === chosen[piece.id]),
  }));

  const complete = selection.every(({variant}) => variant?.availableForSale);
  const currency = selection[0]?.variant?.price.currencyCode ?? 'EUR';
  const {full, total, saving} = tierTotal(
    selection.map(({variant}) => Number(variant?.price.amount ?? 0)),
  );

  const money = (amount: number) =>
    new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
      style: 'currency',
      currency,
    }).format(amount);

  const lines = selection
    .filter(({variant}) => variant)
    .map(({variant}) => ({merchandiseId: variant!.id, quantity: 1}));

  return (
    <div className="pack">
      <Reveal as="section" className="pack__hero">
        <img
          className="pack__hero-image"
          src={PACK_IMAGE.src}
          alt={t('pack.imageAlt')}
          width={PACK_IMAGE.width}
          height={PACK_IMAGE.height}
          loading="eager"
          decoding="async"
        />
        <div className="pack__hero-text">
          <p className="pack__eyebrow">{t('pack.eyebrow')}</p>
          <h1 className="pack__title">{t('pack.title')}</h1>
          <p className="pack__intro">{t('pack.intro')}</p>
          <TierNote className="tier-note--pack" />
        </div>
      </Reveal>

      <Reveal as="section" className="pack__picker">
        <h2 className="pack__section-title">{t('pack.piecesTitle')}</h2>

        <ul className="pack__pieces">
          {selection.map(({piece, variant}) => (
            <li className="pack__piece" key={piece.id}>
              <Link to={`/products/${piece.handle}`} className="pack__thumb">
                {piece.featuredImage && (
                  <Image
                    data={piece.featuredImage}
                    alt={piece.featuredImage.altText || piece.title}
                    sizes="96px"
                    loading="lazy"
                  />
                )}
              </Link>

              <div className="pack__piece-body">
                <Link to={`/products/${piece.handle}`} className="pack__piece-name">
                  {piece.title}
                </Link>
                <p className="pack__piece-price">
                  {variant ? <Money data={variant.price} /> : null}
                </p>
              </div>

              <label className="pack__size">
                <span className="pack__size-label">{t('pack.size')}</span>
                <select
                  value={chosen[piece.id] ?? ''}
                  onChange={(event) =>
                    setChosen((current) => ({
                      ...current,
                      [piece.id]: event.target.value,
                    }))
                  }
                >
                  {piece.variants.nodes.map((node) => (
                    <option
                      key={node.id}
                      value={node.id}
                      disabled={!node.availableForSale}
                    >
                      {sizeLabel(node)}
                      {node.availableForSale ? '' : ` — ${t('product.soldOut')}`}
                    </option>
                  ))}
                </select>
              </label>
            </li>
          ))}
        </ul>

        <div className="pack__totals">
          <div className="pack__totals-row">
            <span>{t('pack.separately')}</span>
            <s>{money(full)}</s>
          </div>
          <div className="pack__totals-row pack__totals-row--strong">
            <span>{t('pack.packPrice')}</span>
            <span>{money(total)}</span>
          </div>
          {saving > 0 && (
            <p className="pack__saving">{t('pack.saving', {amount: money(saving)})}</p>
          )}
        </div>

        <AddToCartButton
          lines={lines}
          disabled={!complete}
          onClick={() => openAside('cart')}
        >
          {complete ? t('pack.add') : t('pack.unavailable')}
        </AddToCartButton>

        <p className="pack__note">{t('pack.note')}</p>
      </Reveal>
    </div>
  );
}

const PACK_QUERY = `#graphql
  fragment PackPiece on Product {
    id
    title
    handle
    featuredImage {
      id
      url
      altText
      width
      height
    }
    variants(first: 20) {
      nodes {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
  query PackProducts(
    $jean: String!
    $longsleeve: String!
    $third: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    jean: product(handle: $jean) {
      ...PackPiece
    }
    longsleeve: product(handle: $longsleeve) {
      ...PackPiece
    }
    third: product(handle: $third) {
      ...PackPiece
    }
  }
` as const;
