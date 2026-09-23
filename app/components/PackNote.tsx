import {Link} from 'react-router';
import {isPackProduct, PACK_PATH} from '~/lib/packOffer';
import {useT} from '~/lib/i18n';

/**
 * One line under the price of a piece that belongs to the essential pack.
 *
 * A line of text and a link, nothing else: the offer is worth mentioning
 * where someone is already looking at one of its pieces, but a badge or a
 * coloured strip on a product page is how a shop stops looking like this one.
 *
 * Eligibility comes from the list in ~/lib/packOffer.ts, which has to stay
 * equal to what the Shopify discount rule targets — see docs/pack-essentiel.md.
 */
export function PackNote({handle}: {handle: string}) {
  const t = useT();

  if (!isPackProduct(handle)) return null;

  return (
    <p className="pack-note">
      <Link to={PACK_PATH}>{t('pack.badge')}</Link>
    </p>
  );
}
