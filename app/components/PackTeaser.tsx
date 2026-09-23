import {Link} from 'react-router';
import {Reveal} from '~/components/Reveal';
import {PACK_ENABLED, PACK_PATH} from '~/lib/packOffer';
import {useT} from '~/lib/i18n';

/**
 * The homepage's mention of the essential pack.
 *
 * Deliberately a paragraph between two hairlines rather than a banner: it
 * sits in the middle of the page among the collections, says what the offer
 * is in one sentence and links to it. Nothing flashes, nothing counts down,
 * and it takes the width of a paragraph rather than the height of a screen.
 */
export function PackTeaser() {
  const t = useT();

  if (!PACK_ENABLED) return null;

  return (
    <Reveal as="section" className="pack-teaser">
      <p className="pack-teaser__eyebrow">{t('pack.eyebrow')}</p>
      <h2 className="pack-teaser__title">{t('pack.teaserTitle')}</h2>
      <p className="pack-teaser__text">{t('pack.teaserText')}</p>
      <Link to={PACK_PATH} className="pack-teaser__link">
        {t('pack.teaserLink')}
      </Link>
    </Reveal>
  );
}
