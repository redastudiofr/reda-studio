import {useT} from '~/lib/i18n';

/**
 * Quantity stepper. Clamped between 1 and `max` (the variant's available
 * stock when Shopify reports it), so the customer can't submit a quantity
 * the shop can't fulfil.
 */
export function QuantitySelector({
  value,
  onChange,
  max,
  disabled = false,
}: {
  value: number;
  onChange: (next: number) => void;
  max?: number | null;
  disabled?: boolean;
}) {
  const t = useT();
  const ceiling = typeof max === 'number' && max > 0 ? max : Infinity;
  const canDecrease = !disabled && value > 1;
  const canIncrease = !disabled && value < ceiling;

  return (
    <div className="quantity">
      <span className="quantity__label">{t('product.quantity')}</span>
      <div className="quantity__control">
        <button
          type="button"
          className="quantity__btn"
          onClick={() => onChange(Math.max(1, value - 1))}
          disabled={!canDecrease}
          aria-label={t('cart.decrease')}
        >
          −
        </button>
        <output className="quantity__value" aria-live="polite">
          {value}
        </output>
        <button
          type="button"
          className="quantity__btn"
          onClick={() => onChange(Math.min(ceiling, value + 1))}
          disabled={!canIncrease}
          aria-label={t('cart.increase')}
        >
          +
        </button>
      </div>
    </div>
  );
}
