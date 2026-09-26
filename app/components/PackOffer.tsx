import {Suspense} from 'react';
import {Await} from 'react-router';
import {PackBuilder} from '~/components/PackBuilder';
import {Reveal} from '~/components/Reveal';
import {PACK_ENABLED} from '~/lib/packOffer';
import {isPackSellable, type PackData} from '~/lib/packProducts';
import {useT} from '~/lib/i18n';

/**
 * The homepage's pack section: the offer said in one line, then the pack
 * composed and added to the basket right here.
 *
 * Nothing renders until the pack can actually be sold — a piece in every slot
 * and the offered tee found. An offer the button cannot honour is not shown.
 */
export function PackOffer({pack}: {pack: Promise<PackData | null>}) {
  if (!PACK_ENABLED) return null;

  return (
    <Suspense fallback={null}>
      <Await resolve={pack} errorElement={null}>
        {(data) => (isPackSellable(data) ? <PackOfferSection pack={data} /> : null)}
      </Await>
    </Suspense>
  );
}

function PackOfferSection({pack}: {pack: PackData}) {
  const t = useT();

  return (
    <Reveal
      as="section"
      className="pack-offer"
      aria-labelledby="pack-offer-heading"
    >
      <header className="pack-offer__head">
        <p className="pack-offer__eyebrow">{t('pack.eyebrow')}</p>
        <h2 className="pack-offer__title" id="pack-offer-heading">
          {t('pack.offerTitle')}
        </h2>
        <p className="pack-offer__intro">{t('pack.offerIntro')}</p>
      </header>

      <PackBuilder pack={pack} />
    </Reveal>
  );
}
