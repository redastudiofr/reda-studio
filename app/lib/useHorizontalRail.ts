import {useCallback, useEffect, useRef, useState} from 'react';

/**
 * Turns a native `overflow-x: auto; scroll-snap-type: x` rail into a proper
 * carousel: mouse click-and-drag on desktop (touch is left entirely to the
 * browser's own momentum scrolling — this only ever attaches to
 * `pointerType === 'mouse'`), an arrow-driven `scrollByCard`, and — when
 * `loop` is on — a seamless infinite wrap.
 *
 * Infinite looping expects the caller to render its items `copies` times in
 * a row (`[...items, ...items, ...items]`, unique React keys per copy, an odd
 * count). The rail starts on the middle copy; once a gesture has come to
 * rest, the position is moved back by whole copies to the middle one — same
 * content at the same place, so nothing visibly changes.
 */
export function useHorizontalRail<T extends HTMLElement>({
  loop = false,
  copies = 3,
}: {loop?: boolean; copies?: number} = {}) {
  const ref = useRef<T | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const dragState = useRef({startX: 0, startScroll: 0, active: false, moved: false});

  // Seamless infinite wrap.
  useEffect(() => {
    const node = ref.current;
    if (!node || !loop) return;

    /*
     * One copy's exact width, measured between the first item of two
     * consecutive copies. `scrollWidth / copies` is not that: it also
     * shares out the rail's side padding and is one gap short, so every wrap
     * used to land the photos a few pixels off.
     */
    const copyWidth = () => {
      const perCopy = node.children.length / copies;
      const first = node.children[0] as HTMLElement | undefined;
      const next = node.children[perCopy] as HTMLElement | undefined;
      return first && next ? next.offsetLeft - first.offsetLeft : 0;
    };
    const middle = (copy: number) => copy * Math.floor(copies / 2);

    /*
     * Moving the rail by one copy has to move the drag's own reference point
     * with it. Without this, a mouse drag that crossed a copy boundary was
     * corrected here and then immediately undone by the next pointermove —
     * which sets scrollLeft from the position the drag started at.
     */
    const shiftBy = (delta: number) => {
      node.scrollTo({left: node.scrollLeft + delta, behavior: 'instant'});
      if (dragState.current.active) dragState.current.startScroll += delta;
    };

    // Back to the same spot inside the middle copy, by whole copies.
    const recentre = () => {
      const copy = copyWidth();
      if (!copy) return;
      const base = middle(copy);
      const offset = node.scrollLeft - base;
      const wrapped = ((((offset + copy / 2) % copy) + copy) % copy) - copy / 2;
      const delta = wrapped - offset;
      if (Math.abs(delta) >= 1) shiftBy(delta);
    };

    node.scrollTo({left: middle(copyWidth()), behavior: 'instant'});

    /*
     * The wrap waits for the rail to be at rest. Moving scrollLeft while a
     * finger is still on the rail, or while its momentum is still carrying
     * it, makes the browser lose the gesture: the swipe jumped back, then
     * fought the correction, and ended up barely moving at all — the
     * "stuck" carousel. The flanking copies are there so a single swipe,
     * however strong, never reaches the real end before it comes to rest.
     * Only if it gets within a quarter of a copy of that end is the rail
     * moved mid-gesture, as a last resort.
     */
    let touching = false;
    let settle = 0;
    const onScroll = () => {
      const copy = copyWidth();
      const max = node.scrollWidth - node.clientWidth;
      if (copy && (node.scrollLeft < copy / 4 || node.scrollLeft > max - copy / 4)) {
        recentre();
      }
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        if (!touching && !dragState.current.active) recentre();
      }, 150);
    };
    const onTouchStart = () => {
      touching = true;
      window.clearTimeout(settle);
    };
    const onTouchEnd = () => {
      touching = false;
      // A tap, or a swipe that ended exactly at rest, fires no more scroll
      // events: give it the same settle delay.
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        if (!dragState.current.active) recentre();
      }, 150);
    };
    const onPointerUp = () => {
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        if (!touching) recentre();
      }, 150);
    };
    // Item widths are percentages of the rail: a resize changes the copy
    // width, so the position is re-measured.
    const resize = new ResizeObserver(() => recentre());
    resize.observe(node);

    node.addEventListener('scroll', onScroll, {passive: true});
    node.addEventListener('touchstart', onTouchStart, {passive: true});
    node.addEventListener('touchend', onTouchEnd, {passive: true});
    node.addEventListener('touchcancel', onTouchEnd, {passive: true});
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      node.removeEventListener('scroll', onScroll);
      node.removeEventListener('touchstart', onTouchStart);
      node.removeEventListener('touchend', onTouchEnd);
      node.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('pointerup', onPointerUp);
      resize.disconnect();
      window.clearTimeout(settle);
    };
  }, [loop, copies]);

  // Non-looping rails track their ends so the caller can disable/hide an
  // arrow that would otherwise scroll nowhere.
  useEffect(() => {
    const node = ref.current;
    if (!node || loop) return;

    const update = () => {
      setAtStart(node.scrollLeft <= 1);
      setAtEnd(node.scrollLeft + node.clientWidth >= node.scrollWidth - 1);
    };
    update();
    node.addEventListener('scroll', update, {passive: true});
    window.addEventListener('resize', update);
    return () => {
      node.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [loop]);

  // Desktop mouse drag-to-scroll. Touch pointers are ignored entirely so the
  // rail keeps native touch scrolling (momentum, axis-locking) untouched.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    /*
     * `scroll-snap-type: x mandatory` re-snaps the rail on every programmatic
     * scrollLeft, so a drag would spring straight back to the card it started
     * on unless it crossed half a card in one go — the rail never followed the
     * cursor. Snapping is switched off for the duration of a mouse drag and
     * restored on release, which is also when it's actually wanted: the rail
     * then settles onto the nearest card. Touch scrolling is native and never
     * comes through here, so it keeps snapping throughout.
     */
    let snapBeforeDrag = '';

    const onPointerMove = (e: PointerEvent) => {
      const drag = dragState.current;
      if (!drag.active) return;
      const dx = e.clientX - drag.startX;
      if (Math.abs(dx) > 3) drag.moved = true;
      node.scrollLeft = drag.startScroll - dx;
    };
    const endDrag = () => {
      if (dragState.current.active) {
        node.style.scrollSnapType = snapBeforeDrag;
      }
      dragState.current.active = false;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      dragState.current = {
        startX: e.clientX,
        startScroll: node.scrollLeft,
        active: true,
        moved: false,
      };
      snapBeforeDrag = node.style.scrollSnapType;
      node.style.scrollSnapType = 'none';
      /*
       * Tracked on the window rather than through setPointerCapture, which
       * this used to call. Capturing the pointer here also retargets the
       * click that follows to the rail itself — so a plain click on a
       * product card inside it never reached the card's link, and nothing
       * navigated. Window listeners keep the drag working past the rail's
       * edges without touching where the click lands.
       */
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', endDrag);
      window.addEventListener('pointercancel', endDrag);
    };
    // A drag that actually moved the rail shouldn't also fire a click on
    // whatever it was dragging over (e.g. a product card's link). Cleared
    // once used, so a later click that follows no drag at all — a keyboard
    // Enter on a focused card, say — is never swallowed by a stale flag.
    const onClickCapture = (e: MouseEvent) => {
      if (dragState.current.moved) {
        dragState.current.moved = false;
        e.preventDefault();
        e.stopPropagation();
      }
    };

    node.addEventListener('pointerdown', onPointerDown);
    node.addEventListener('click', onClickCapture, true);
    return () => {
      node.removeEventListener('pointerdown', onPointerDown);
      node.removeEventListener('click', onClickCapture, true);
      endDrag();
    };
  }, []);

  const scrollByCard = useCallback((direction: 1 | -1) => {
    const node = ref.current;
    if (!node) return;
    const first = node.children[0] as HTMLElement | undefined;
    const second = node.children[1] as HTMLElement | undefined;
    const step =
      first && second
        ? second.offsetLeft - first.offsetLeft
        : node.clientWidth * 0.8;
    node.scrollBy({left: direction * step, behavior: 'smooth'});
  }, []);

  return {ref, scrollByCard, atStart: loop ? false : atStart, atEnd: loop ? false : atEnd};
}
