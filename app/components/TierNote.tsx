import {
  SECOND_ITEM_PERCENT,
  THIRD_ITEM_PERCENT,
  TIER_ENABLED,
} from '~/lib/tierDiscount';
import {useT} from '~/lib/i18n';

/**
 * The volume offer, said in one quiet line under a price: second piece −20%,
 * third −30%.
 *
 * Deliberately a line of text and not a banner: the offer applies to
 * everything in the shop, all the time, so shouting about it on every page
 * would be noise, and a coloured strip would be the one thing on this site
 * that looks like a discount store. The figures come from ~/lib/tierDiscount,
 * the single place they are written.
 */
export function TierNote({className = ''}: {className?: string}) {
  const t = useT();

  if (!TIER_ENABLED) return null;

  return (
    <p className={`tier-note ${className}`.trim()}>
      <span>{t('tier.second', {percent: SECOND_ITEM_PERCENT})}</span>
      <span className="tier-note__sep" aria-hidden="true">
        ·
      </span>
      <span>{t('tier.third', {percent: THIRD_ITEM_PERCENT})}</span>
    </p>
  );
}
