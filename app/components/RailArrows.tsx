/** Discreet prev/next controls for a `useHorizontalRail` carousel — desktop only (see `.rail-arrow` in app.css), mouse-drag and touch swipe cover the rest. */
export function RailArrows({
  onPrev,
  onNext,
  disablePrev,
  disableNext,
  prevLabel,
  nextLabel,
}: {
  onPrev: () => void;
  onNext: () => void;
  disablePrev?: boolean;
  disableNext?: boolean;
  prevLabel: string;
  nextLabel: string;
}) {
  return (
    <>
      <button
        type="button"
        className="rail-arrow rail-arrow--prev"
        onClick={onPrev}
        disabled={disablePrev}
        aria-label={prevLabel}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            d="M15 5l-7 7 7 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        type="button"
        className="rail-arrow rail-arrow--next"
        onClick={onNext}
        disabled={disableNext}
        aria-label={nextLabel}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            d="M9 5l7 7-7 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </>
  );
}
