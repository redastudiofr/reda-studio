import {useEffect, type RefObject} from 'react';

/**
 * Sharpens what is at the centre of a rail and lets the rest drift slightly
 * out of focus.
 *
 * The blur is a `--blur` custom property written on each child, not a class:
 * the value is continuous, and the row moves continuously, so anything
 * threshold-based would step visibly as a card crosses it.
 *
 * Positions are measured once and cached. Reading the geometry of fifty cards
 * on every frame would mean a layout pass per frame, on a row that is already
 * drifting by itself — so each frame here is arithmetic on numbers taken
 * earlier, and the browser is only ever asked to paint.
 */

/** Blur at the edge of the rail, in pixels. */
const MAX_BLUR = 2.6;

/**
 * The share of the half-width around the centre kept perfectly sharp. Without
 * it nothing is ever quite in focus: a card is only exactly centred for an
 * instant, and the whole row would read as permanently soft.
 */
const SHARP_BAND = 0.3;

/** Rounding step. Finer than the eye, coarse enough to skip most writes. */
const STEP = 0.2;

export function useCenterFocus<T extends HTMLElement>(
  ref: RefObject<T | null>,
) {
  useEffect(() => {
    const rail = ref.current;
    if (!rail) return;

    // "Moins d'animations" : la rangée reste nette d'un bout à l'autre.
    if (
      typeof matchMedia === 'function' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    let cards: HTMLElement[] = [];
    let centres: number[] = [];
    let written: string[] = [];
    let frame = 0;

    const measure = () => {
      cards = Array.from(rail.children) as HTMLElement[];
      written = [];
      const railLeft = rail.getBoundingClientRect().left - rail.scrollLeft;
      centres = cards.map((card) => {
        const rect = card.getBoundingClientRect();
        return rect.left - railLeft + rect.width / 2;
      });
    };

    const paint = () => {
      frame = 0;
      const half = rail.clientWidth / 2;
      if (!half || !cards.length) return;

      const centre = rail.scrollLeft + half;

      for (let i = 0; i < cards.length; i += 1) {
        const distance = Math.min(1, Math.abs(centres[i] - centre) / half);
        const ramp = Math.max(0, distance - SHARP_BAND) / (1 - SHARP_BAND);
        const blur = Math.round((ramp * MAX_BLUR) / STEP) * STEP;
        // toFixed: in binary, a 0.2 step lands on 0.4000000000000001 — a
        // different string every frame, so a style write every frame, which
        // is exactly what the comparison below is there to avoid.
        const value = `${blur.toFixed(1)}px`;

        // Writing the same value again would dirty the style for nothing.
        if (written[i] === value) continue;
        written[i] = value;

        /*
         * A sharp card carries no filter at all, rather than a blur of zero:
         * filtering an element puts it on its own layer, and the whole point
         * is that most of the row costs nothing most of the time. The
         * attribute is what the stylesheet keys on.
         */
        if (blur > 0) {
          cards[i].style.setProperty('--blur', value);
          cards[i].dataset.blur = '';
        } else {
          cards[i].style.removeProperty('--blur');
          delete cards[i].dataset.blur;
        }
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    /*
     * Repaints straight away rather than waiting for a frame. A resize is
     * rare, and until the repaint every card carries a blur computed for the
     * old layout — a wait that lasts as long as frames are throttled, which
     * is precisely what happens to a tab that was resized in the background.
     */
    const remeasure = () => {
      measure();
      paint();
    };

    measure();
    paint();

    rail.addEventListener('scroll', schedule, {passive: true});

    // The row is laid out in percentages: a rotation or a resized window moves
    // every card, and cached positions would then sharpen the wrong one.
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(remeasure);
    observer?.observe(rail);
    window.addEventListener('resize', remeasure);

    // Web fonts land after the first paint and reflow the text inside the
    // cards; the cards themselves keep their width, but the row's padding and
    // any wrapping do not.
    document.fonts?.ready.then(remeasure).catch(() => {});

    return () => {
      if (frame) cancelAnimationFrame(frame);
      rail.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', remeasure);
      observer?.disconnect();
      for (const card of cards) {
        delete card.dataset.blur;
        card.style.removeProperty('--blur');
      }
    };
  }, [ref]);
}
