import {Link} from 'react-router';
import {PACK_DISCOUNT_CODE, PACK_PATH} from '~/lib/packOffer';
import {useT} from '~/lib/i18n';

/**
 * The offer block on the product page of a piece that belongs to the pack —
 * in place of the "take two" box, which announced a different offer.
 *
 * It borrows that box's own classes rather than inventing a second style for
 * the same slot on the same page: what changed is the offer, not the design.
 *
 * It states the pack and links to it instead of trying to build one here. A
 * pack is three pieces and three sizes; a buy box already has a product and a
 * size of its own, and cramming a second picker under it would ask the
 * customer to hold two purchases in their head at once.
 */
export function PackBundle() {
  const t = useT();

  return (
    <section className="bundle" aria-labelledby="pack-bundle-heading">
      <h2 className="bundle__heading" id="pack-bundle-heading">
        {t('pack.title')}
      </h2>

      <div className="bundle__box">
        <p className="bundle__set-title">{t('pack.bundleTitle')}</p>
        <p className="bundle__set-sub">{t('pack.bundleText')}</p>

        <Link to={PACK_PATH} className="btn btn--full btn--outline">
          {t('pack.bundleCta')}
        </Link>

        <p className="bundle__note">
          {t('pack.freeNote', {code: PACK_DISCOUNT_CODE})}
        </p>
      </div>
    </section>
  );
}
