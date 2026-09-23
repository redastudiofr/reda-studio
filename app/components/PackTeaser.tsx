import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {AllProductsQuery} from 'storefrontapi.generated';
import {Reveal} from '~/components/Reveal';
import {PACK_ENABLED, PACK_PATH} from '~/lib/packOffer';
import {isPreorderHandle} from '~/lib/preorder';
import {useT} from '~/lib/i18n';

type HomeProduct = AllProductsQuery['products']['nodes'][number];

/** How many pieces the offer asks for, and how many the block shows. */
const PIECES = 3;

/**
 * The homepage's mention of the pack: three pieces from the shop, drawn for
 * the day, and a link.
 *
 * They are drawn from the whole catalogue rather than from a fixed trio
 * because the offer is about *three pieces*, not about one particular outfit
 * — a hoodie or a zip says that better than the same jeans every day. The
 * draw is stable for a day (see `draw`, handed down by the loader), which
 * also keeps the server's page and the browser's identical.
 *
 * Still a paragraph between two hairlines, not a banner: three small images,
 * one sentence, one link.
 */
export function PackTeaser({
  products,
  draw,
}: {
  products: Promise<AllProductsQuery | null>;
  draw: string;
}) {
  const t = useT();

  if (!PACK_ENABLED) return null;

  return (
    <Reveal as="section" className="pack-teaser">
      <Suspense fallback={null}>
        <Await resolve={products} errorElement={null}>
          {(response) => <PackTeaserPieces nodes={response?.products.nodes} draw={draw} />}
        </Await>
      </Suspense>

      <p className="pack-teaser__eyebrow">{t('pack.eyebrow')}</p>
      <h2 className="pack-teaser__title">{t('pack.teaserTitle')}</h2>
      <p className="pack-teaser__text">{t('pack.teaserText')}</p>
      <Link to={PACK_PATH} className="pack-teaser__link">
        {t('pack.teaserLink')}
      </Link>
    </Reveal>
  );
}

function PackTeaserPieces({
  nodes,
  draw,
}: {
  nodes?: HomeProduct[];
  draw: string;
}) {
  const pieces = drawPieces(nodes ?? [], draw);
  if (pieces.length < PIECES) return null;

  return (
    <ul className="pack-teaser__pieces">
      {pieces.map((piece) => (
        <li className="pack-teaser__piece" key={piece.id}>
          <Link to={`/products/${piece.handle}`}>
            {piece.featuredImage && (
              <Image
                data={piece.featuredImage}
                alt={piece.featuredImage.altText || piece.title}
                sizes="(min-width: 48em) 14rem, 30vw"
                loading="lazy"
              />
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Three pieces, always the same three for a given day and never the same two
 * days running.
 *
 * Sorting by a hash of the day and the product's id is what makes it both:
 * the order is arbitrary, which is what "random" has to mean here, and it is
 * arrived at by calculation, so every visitor — and the server — gets the
 * same three.
 */
function drawPieces(nodes: HomeProduct[], draw: string): HomeProduct[] {
  const eligible = nodes.filter(
    (node) =>
      node.availableForSale &&
      node.featuredImage &&
      !isPreorderHandle(node.handle),
  );

  return eligible
    .map((node) => ({node, rank: hash(`${draw}:${node.id}`)}))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, PIECES)
    .map(({node}) => node);
}

function hash(input: string): number {
  let value = 0;
  for (let i = 0; i < input.length; i += 1) {
    value = (value * 31 + input.charCodeAt(i)) >>> 0;
  }
  return value;
}
