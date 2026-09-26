import {useLoaderData} from 'react-router';
import type {Route} from './+types/pack';
import {PackBuilder} from '~/components/PackBuilder';
import {Reveal} from '~/components/Reveal';
import {loadPack} from '~/lib/packProducts';
import {useT} from '~/lib/i18n';

/**
 * The essential pack: choose a pair of jeans, a longsleeve and a tee, each in
 * your size, and Shopify adds a fourth tee for nothing.
 *
 * This page creates no product, invents no price and calculates no reduction.
 * It shows real products at their real prices, puts the chosen lines in the
 * basket, and leaves the free tee to the discount in Shopify Admin — the only
 * thing that can actually take money off. What the pack contains is decided
 * in ~/lib/packOffer.ts; the composing itself is PackBuilder, the same one the
 * homepage uses.
 */

/** The pack's lifestyle shot. Replace with a photo of the three pieces worn together. */
const PACK_IMAGE = {
  src: '/images/histoire-cerisiers.webp',
  width: 675,
  height: 1200,
};

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'reda studio | pack essentiel'},
    {
      name: 'description',
      content:
        'A top, a bottom and a longsleeve in the sizes you choose — with a tee on us.',
    },
  ];
};

export async function loader({context}: Route.LoaderArgs) {
  return loadPack(context.storefront);
}

export default function PackPage() {
  const pack = useLoaderData<typeof loader>();
  const t = useT();

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
          {/* Dit en une ligne, sans faux prix barré ni pastille : la remise
              est réelle et c'est Shopify qui l'applique — l'annoncer plus
              fort ne la rendrait pas plus vraie. */}
          <p className="pack__free">{t('pack.free')}</p>
        </div>
      </Reveal>

      <Reveal
        as="section"
        className="pack-offer pack-offer--page"
        aria-labelledby="pack-offer-heading"
      >
        <header className="pack-offer__head">
          <h2 className="pack-offer__title" id="pack-offer-heading">
            {t('pack.offerTitle')}
          </h2>
          <p className="pack-offer__intro">{t('pack.offerIntro')}</p>
        </header>

        <PackBuilder pack={pack} />
      </Reveal>
    </div>
  );
}
