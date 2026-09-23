import {useEffect, type RefObject} from 'react';

/**
 * Keeps the review at the centre of a rail perfectly sharp, and softens the
 * others by how much further out they are.
 *
 * The rule is relative, not absolute, and that is the whole design. Measuring
 * each card's own distance to the centre looks right and reads wrong: the row
 * drifts continuously and never snaps, so a card is exactly centred for an
 * instant and merely "the most centred one" for the rest of the time — which
 * left the card everybody is actually reading carrying blur of its own.
 *
 * So softness is the distance *in excess of the nearest card's*. The nearest
 * card's excess is zero by construction, at every frame, whatever the scroll
 * position: the one in the middle can never be blurred, not even part way
 * through a swipe or a hand-off. When two cards are equally close — the
 * moment the seam between them crosses the centre — both are sharp, which is
 * the honest picture: there is no single middle card just then, and forcing
 * one would make the other pop.
 *
 * Positions are measured once and cached. Reading the geometry of fifty cards
 * on every frame would mean a layout pass per frame, on a row that is already
 * drifting by itself — so each frame here is arithmetic on numbers taken
 * earlier, and the browser is only ever asked to paint.
 */

/**
 * How far past the nearest card a card must be to reach full softness, as a
 * share of the gap between two cards. Below 1 the neighbours settle into
 * their soft state rather than easing towards it for the whole journey.
 */
const RAMP = 0.75;

/** Rounding step for the softness. Fine enough to be invisible as steps. */
const STEP = 0.05;

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
    let ramp = 0;
    let frame = 0;

    const measure = () => {
      cards = Array.from(rail.children) as HTMLElement[];
      written = [];

      const railLeft = rail.getBoundingClientRect().left - rail.scrollLeft;
      centres = cards.map((card) => {
        const rect = card.getBoundingClientRect();
        return rect.left - railLeft + rect.width / 2;
      });

      // The step from one card to the next. Every card is the same width, so
      // the first pair is enough; the half-width is only a fallback for a row
      // holding a single card.
      const pitch =
        centres.length > 1 ? centres[1] - centres[0] : rail.clientWidth / 2;
      ramp = Math.max(1, pitch * RAMP);
    };

    const paint = () => {
      frame = 0;
      const half = rail.clientWidth / 2;
      if (!half || !cards.length) return;

      const centre = rail.scrollLeft + half;

      // First pass: how far each card is, and how far the nearest one is.
      let nearest = Infinity;
      const distances = new Array<number>(cards.length);
      for (let i = 0; i < cards.length; i += 1) {
        const distance = Math.abs(centres[i] - centre);
        distances[i] = distance;
        if (distance < nearest) nearest = distance;
      }

      // Second pass: softness measured from the nearest card, so the nearest
      // card is always exactly zero.
      for (let i = 0; i < cards.length; i += 1) {
        const soft = Math.min(1, (distances[i] - nearest) / ramp);
        // toFixed: in binary, a 0.05 step lands on 0.35000000000000003 — a
        // different string every frame, so a style write every frame, which
        // is exactly what the comparison below is there to avoid.
        const value = (Math.round(soft / STEP) * STEP).toFixed(2);

        if (written[i] === value) continue;
        written[i] = value;

        /*
         * The sharp card carries no filter at all, rather than a blur of
         * zero: a filter puts an element on its own layer and resamples it,
         * which can soften text by itself — and it is the one card that has
         * to be exactly as crisp as the rest of the page.
         */
        if (Number(value) > 0) {
          cards[i].style.setProperty('--soft', value);
          cards[i].dataset.soft = '';
        } else {
          cards[i].style.removeProperty('--soft');
          delete cards[i].dataset.soft;
        }
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    /*
     * Repaints straight away rather than waiting for a frame. A resize is
     * rare, and until the repaint every card carries a value computed for the
     * old layout.
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
        delete card.dataset.soft;
        card.style.removeProperty('--soft');
      }
    };
  }, [ref]);
}
