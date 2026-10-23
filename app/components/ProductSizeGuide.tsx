import {useId, useState, type FormEvent} from 'react';
import {useNavigate} from 'react-router';
import {ChevronDownIcon} from '~/components/Icons';
import {useT} from '~/lib/i18n';
import type {TranslationKey} from '~/lib/i18n/dictionary';
import {
  buildGuide,
  HEIGHT_RANGE,
  recommendSize,
  resolveProfile,
  WEIGHT_RANGE,
  type Guide,
  type Measure,
  type Preference,
  type Reason,
  type Recommendation,
} from '~/lib/sizeGuide';
import {CATEGORY_GROUP} from '~/lib/sizeGuide/catalog';

export type SizeEntry = {
  name: string;
  available: boolean;
  selected: boolean;
  /** The variant query that selects this size, as the size buttons use it. */
  query: string;
};

export type SizeGuideProduct = {
  handle: string;
  title: string;
  description?: string | null;
};

/**
 * Size guide disclosure shown next to the size selector.
 *
 * For each size the product really has in Shopify: its availability and the
 * garment's measurements for that size, cut by cut (see app/lib/sizeGuide).
 * No product in the shop comes with real measurements, so every value is an
 * estimate and is shown as one ("≈", and said in words under the table);
 * real values recorded in app/lib/sizeGuide/products.ts are shown without
 * "≈" and labelled as measured. Below, "find my size" suggests one of the
 * product's sizes from a height, a weight and a preferred fit.
 *
 * A product whose sizes aren't letter sizes, or whose type of garment
 * nothing names, keeps the plain list of sizes and availability.
 */
export function ProductSizeGuide({
  sizes,
  product,
}: {
  sizes: SizeEntry[];
  product: SizeGuideProduct;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  // Pure and cheap: a few dozen numbers, recomputed with the sizes' live
  // availability on every render.
  const guide = buildGuide(resolveProfile(product), sizes);

  if (!sizes.length) return null;

  return (
    <div className="size-guide">
      <button
        type="button"
        className="size-guide__toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {t('product.sizeGuide')}
        <ChevronDownIcon className="size-guide__chevron" />
      </button>

      {open && (
        <div className="size-guide__panel" id={panelId}>
          {guide ? (
            <MeasuredGuide guide={guide} sizes={sizes} />
          ) : (
            <ul className="size-guide__list">
              {sizes.map((size) => (
                <li key={size.name} className="size-guide__row">
                  <span className="size-guide__size">{size.name.toLowerCase()}</span>
                  <StockLabel available={size.available} />
                </li>
              ))}
            </ul>
          )}
          <p className="size-guide__note">
            {t('size.note1')} <a href="/contact">{t('size.writeToUs')}</a>{' '}
            {t('size.note2')}
          </p>
        </div>
      )}
    </div>
  );
}

function StockLabel({available}: {available: boolean}) {
  const t = useT();
  return (
    <span
      className={`size-guide__stock ${
        available ? 'size-guide__stock--in' : 'size-guide__stock--out'
      }`}
    >
      {available ? t('size.available') : t('size.soldOut')}
    </span>
  );
}

/** "A", "B"… — ties each column to its line on the drawing. */
const letter = (index: number) => String.fromCharCode(65 + index);

function MeasuredGuide({guide, sizes}: {guide: Guide; sizes: SizeEntry[]}) {
  const t = useT();
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const {profile, measures, rows} = guide;
  const highlighted = recommendation?.row.size;

  return (
    <>
      <div className="size-guide__head">
        <p className="size-guide__kind">
          {t('sizeGuide.head', {
            category: t(`sizeGuide.category.${profile.category}` as TranslationKey),
            fit: t(`sizeGuide.fit.${profile.fit}` as TranslationKey),
          })}
        </p>
        <span className="size-guide__badge">
          {guide.anyVerified ? t('sizeGuide.partlyVerified') : t('sizeGuide.estimated')}
        </span>
      </div>

      <div className="size-guide__figure">
        <GarmentDrawing guide={guide} />
        <ul className="size-guide__keys">
          {measures.map((measure, index) => (
            <li key={measure}>
              <span className="size-guide__key">{letter(index)}</span>
              {t(`sizeGuide.measure.${measure}` as TranslationKey)}
            </li>
          ))}
        </ul>
      </div>

      <div className="size-guide__scroll">
        <table className="size-guide__table">
          <thead>
            <tr>
              <th scope="col">{t('sizeGuide.sizeCol')}</th>
              {measures.map((measure, index) => (
                <th scope="col" key={measure}>
                  <abbr title={t(`sizeGuide.measure.${measure}` as TranslationKey)}>
                    {letter(index)}
                  </abbr>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.size}
                className={row.size === highlighted ? 'is-recommended' : undefined}
                data-unavailable={!row.available || undefined}
              >
                <th scope="row">
                  <span className="size-guide__size">{row.size}</span>
                  {!row.available && (
                    <span className="size-guide__out">{t('size.soldOut')}</span>
                  )}
                </th>
                {measures.map((measure) => (
                  <td key={measure}>
                    <MeasureCell value={row.measures[measure]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="size-guide__legend">
        {t('sizeGuide.legend')}
        {guide.anyVerified && <> {t('sizeGuide.legendVerified')}</>}
        {guide.elasticWaist && <> {t('sizeGuide.elastic')}</>}
      </p>

      <SizeFinder
        guide={guide}
        sizes={sizes}
        recommendation={recommendation}
        onResult={setRecommendation}
      />
    </>
  );
}

function MeasureCell({value}: {value?: {value: number; verified: boolean}}) {
  if (!value) return <>—</>;
  return value.verified ? (
    <strong>{value.value}</strong>
  ) : (
    <span className="size-guide__estimate">≈ {value.value}</span>
  );
}

const PREFERENCES: Preference[] = ['fitted', 'regular', 'oversized'];

function SizeFinder({
  guide,
  sizes,
  recommendation,
  onResult,
}: {
  guide: Guide;
  sizes: SizeEntry[];
  recommendation: Recommendation | null;
  onResult: (result: Recommendation | null) => void;
}) {
  const t = useT();
  const navigate = useNavigate();
  const formId = useId();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [preference, setPreference] = useState<Preference>('regular');
  const [error, setError] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const heightCm = Number(height.replace(',', '.'));
    const weightKg = Number(weight.replace(',', '.'));
    const valid =
      heightCm >= HEIGHT_RANGE.min &&
      heightCm <= HEIGHT_RANGE.max &&
      weightKg >= WEIGHT_RANGE.min &&
      weightKg <= WEIGHT_RANGE.max;
    setError(!valid);
    onResult(valid ? recommendSize(guide, {heightCm, weightKg, preference}) : null);
  };

  const entry = recommendation
    ? sizes.find((size) => size.name.trim() === recommendation.row.size)
    : undefined;

  return (
    <section className="size-finder" aria-labelledby={`${formId}-title`}>
      <h3 className="size-finder__title" id={`${formId}-title`}>
        {t('sizeGuide.finder.title')}
      </h3>
      <p className="size-finder__intro">{t('sizeGuide.finder.intro')}</p>

      <form className="size-finder__form" onSubmit={submit} noValidate>
        <div className="size-finder__fields">
          <label className="size-finder__field">
            <span>{t('sizeGuide.finder.height')}</span>
            <input
              type="number"
              inputMode="numeric"
              min={HEIGHT_RANGE.min}
              max={HEIGHT_RANGE.max}
              placeholder="178"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
              aria-invalid={error || undefined}
            />
          </label>
          <label className="size-finder__field">
            <span>{t('sizeGuide.finder.weight')}</span>
            <input
              type="number"
              inputMode="numeric"
              min={WEIGHT_RANGE.min}
              max={WEIGHT_RANGE.max}
              placeholder="72"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              aria-invalid={error || undefined}
            />
          </label>
        </div>

        <fieldset className="size-finder__prefs">
          <legend>{t('sizeGuide.finder.fit')}</legend>
          <div className="size-finder__pref-row">
            {PREFERENCES.map((value) => (
              <label key={value} className="size-finder__pref" data-selected={value === preference}>
                <input
                  type="radio"
                  name={`${formId}-pref`}
                  value={value}
                  checked={value === preference}
                  onChange={() => setPreference(value)}
                />
                {t(`sizeGuide.pref.${value}` as TranslationKey)}
              </label>
            ))}
          </div>
        </fieldset>

        {error && (
          <p className="size-finder__error" role="alert">
            {t('sizeGuide.finder.error', {
              hmin: HEIGHT_RANGE.min,
              hmax: HEIGHT_RANGE.max,
              wmin: WEIGHT_RANGE.min,
              wmax: WEIGHT_RANGE.max,
            })}
          </p>
        )}

        <button type="submit" className="btn btn--full btn--outline size-finder__submit">
          {t('sizeGuide.finder.submit')}
        </button>
      </form>

      {recommendation && (
        <div className="size-finder__result" aria-live="polite">
          <p className="size-finder__label">{t('sizeGuide.result.title')}</p>
          <p className="size-finder__size">
            {recommendation.row.size}
            <StockLabel available={recommendation.row.available} />
          </p>

          <ul className="size-finder__reasons">
            {recommendation.reasons.map((reason) => (
              <li key={reason.code}>{reasonText(t, reason)}</li>
            ))}
            {recommendation.ease && (
              <li>
                {t(`sizeGuide.ease.${recommendation.ease.measure}` as TranslationKey, {
                  value: recommendation.ease.value,
                })}
              </li>
            )}
          </ul>

          <p className="size-finder__label">
            {t('sizeGuide.result.measuresOf', {size: recommendation.row.size})}
          </p>
          <dl className="size-finder__measures">
            {guide.measures.map((measure: Measure) => (
              <div key={measure}>
                <dt>{t(`sizeGuide.measure.${measure}` as TranslationKey)}</dt>
                <dd>
                  <MeasureCell value={recommendation.row.measures[measure]} /> cm
                </dd>
              </div>
            ))}
          </dl>

          {entry && entry.available && !entry.selected && (
            <button
              type="button"
              className="btn btn--full size-finder__choose"
              onClick={() =>
                void navigate(`?${entry.query}`, {replace: true, preventScrollReset: true})
              }
            >
              {t('sizeGuide.result.choose', {size: entry.name.trim()})}
            </button>
          )}
          {entry?.selected && (
            <p className="size-finder__selected">
              {t('sizeGuide.result.selected', {size: entry.name.trim()})}
            </p>
          )}

          <p className="size-finder__disclaimer">{t('sizeGuide.result.disclaimer')}</p>
        </div>
      )}
    </section>
  );
}

function reasonText(t: ReturnType<typeof useT>, reason: Reason): string {
  switch (reason.code) {
    case 'usualTop':
      return t('sizeGuide.reason.usualTop', {size: reason.size, chest: reason.chest});
    case 'usualBottom':
      return t('sizeGuide.reason.usualBottom', {size: reason.size, waist: reason.waist});
    case 'asIntended':
    case 'sizeUp':
    case 'sizeDown':
      return t(`sizeGuide.reason.${reason.code}`, {
        fit: t(`sizeGuide.fit.${reason.fit}` as TranslationKey),
      });
    case 'waistFixed':
      return t('sizeGuide.reason.waistFixed');
    case 'largestAvailable':
    case 'smallestAvailable':
    case 'soldOut':
      return t(`sizeGuide.reason.${reason.code}`, {size: reason.size});
  }
}

/**
 * A flat outline of the piece, with one lettered line per measure in the
 * table. Two silhouettes for tops (short or long sleeve), two for bottoms
 * (trousers, shorts) — enough to show where each measure is taken.
 */
function GarmentDrawing({guide}: {guide: Guide}) {
  const {category} = guide.profile;
  const index = (measure: Measure) => guide.measures.indexOf(measure);
  const label = (measure: Measure, x: number, y: number) =>
    index(measure) >= 0 ? (
      <text x={x} y={y} className="size-guide__drawing-letter">
        {letter(index(measure))}
      </text>
    ) : null;

  if (CATEGORY_GROUP[category] === 'top') {
    const short = category === 'tshirt';
    return (
      <svg viewBox="0 0 200 172" className="size-guide__drawing" aria-hidden="true">
        <path
          className="size-guide__drawing-shape"
          d={
            short
              ? 'M85 14 Q100 26 115 14 L145 22 L172 54 L154 66 L140 52 L140 162 L60 162 L60 52 L46 66 L28 54 L55 22 Z'
              : 'M85 14 Q100 26 115 14 L145 22 L182 114 L166 121 L140 64 L140 162 L60 162 L60 64 L34 121 L18 114 L55 22 Z'
          }
        />
        <line x1="60" y1="76" x2="140" y2="76" className="size-guide__drawing-line" />
        {label('chest', 96, 72)}
        <line x1="122" y1="18" x2="122" y2="162" className="size-guide__drawing-line" />
        {label('length', 126, 120)}
        <line x1="55" y1="8" x2="145" y2="8" className="size-guide__drawing-line" />
        {label('shoulders', 96, 6)}
        <line
          x1="147"
          y1="20"
          x2={short ? 165 : 178}
          y2={short ? 56 : 108}
          className="size-guide__drawing-line"
        />
        {label('sleeve', short ? 166 : 176, short ? 44 : 78)}
      </svg>
    );
  }

  if (category === 'shorts') {
    return (
      <svg viewBox="0 0 200 132" className="size-guide__drawing" aria-hidden="true">
        <path
          className="size-guide__drawing-shape"
          d="M62 12 L138 12 L150 112 L106 112 L100 72 L94 112 L50 112 Z"
        />
        <line x1="62" y1="6" x2="138" y2="6" className="size-guide__drawing-line" />
        {label('waist', 96, 4)}
        <line x1="158" y1="12" x2="158" y2="112" className="size-guide__drawing-line" />
        {label('length', 162, 66)}
        <line x1="103" y1="76" x2="108" y2="110" className="size-guide__drawing-line" />
        {label('inseam', 110, 96)}
        <line x1="50" y1="120" x2="94" y2="120" className="size-guide__drawing-line" />
        {label('opening', 68, 130)}
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 200 208" className="size-guide__drawing" aria-hidden="true">
      <path
        className="size-guide__drawing-shape"
        d="M62 12 L138 12 L146 192 L108 192 L100 72 L92 192 L54 192 Z"
      />
      <line x1="62" y1="6" x2="138" y2="6" className="size-guide__drawing-line" />
      {label('waist', 96, 4)}
      <line x1="154" y1="12" x2="154" y2="192" className="size-guide__drawing-line" />
      {label('length', 158, 110)}
      <line x1="104" y1="76" x2="112" y2="190" className="size-guide__drawing-line" />
      {label('inseam', 114, 150)}
      <line x1="59" y1="84" x2="99" y2="84" className="size-guide__drawing-line" />
      {label('thigh', 74, 80)}
      <line x1="54" y1="200" x2="92" y2="200" className="size-guide__drawing-line" />
      {label('opening', 70, 208)}
    </svg>
  );
}
