import {useCallback, useEffect, useRef, useState} from 'react';

/**
 * Turns a native `overflow-x: auto; scroll-snap-type: x` rail into a proper
 * carousel: mouse click-and-drag on desktop (touch is left entirely to the
 * browser's own momentum scrolling — this only ever attaches to
 * `pointerType === 'mouse'`), an arrow-driven `scrollByCard`, and — when
 * `loop` is on — a seamless infinite wrap.
 *
 * Infinite looping expects the caller to render its items three times in a
 * row (`[...items, ...items, ...items]`, unique React keys per copy). The
 * rail starts scrolled to the middle copy; once the user scrolls into the
 * first or third copy, the position is silently snapped back by exactly one
 * copy's width — same content, so nothing visibly changes.
 */
export function useHorizontalRail<T extends HTMLElement>({
  loop = false,
}: {loop?: boolean} = {}) {
  const ref = useRef<T | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const dragState = useRef({startX: 0, startScroll: 0, active: false, moved: false});

  // Seamless infinite wrap: start centred in the middle copy, then correct
  // back into it whenever a scroll carries the viewport into a flanking one.
  useEffect(() => {
    const node = ref.current;
    if (!node || !loop) return;

    node.scrollLeft = node.scrollWidth / 3;

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const oneCopy = node.scrollWidth / 3;
        if (node.scrollLeft < oneCopy * 0.5) {
          node.scrollLeft += oneCopy;
        } else if (node.scrollLeft > oneCopy * 1.5) {
          node.scrollLeft -= oneCopy;
        }
      });
    };
    node.addEventListener('scroll', onScroll, {passive: true});
    return () => {
      node.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [loop]);

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

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      dragState.current = {
        startX: e.clientX,
        startScroll: node.scrollLeft,
        active: true,
        moved: false,
      };
      node.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      const drag = dragState.current;
      if (!drag.active) return;
      const dx = e.clientX - drag.startX;
      if (Math.abs(dx) > 3) drag.moved = true;
      node.scrollLeft = drag.startScroll - dx;
    };
    const endDrag = (e: PointerEvent) => {
      if (!dragState.current.active) return;
      dragState.current.active = false;
      if (node.hasPointerCapture(e.pointerId)) {
        node.releasePointerCapture(e.pointerId);
      }
    };
    // A drag that actually moved the rail shouldn't also fire a click on
    // whatever it was dragging over (e.g. a product card's link).
    const onClickCapture = (e: MouseEvent) => {
      if (dragState.current.moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    node.addEventListener('pointerdown', onPointerDown);
    node.addEventListener('pointermove', onPointerMove);
    node.addEventListener('pointerup', endDrag);
    node.addEventListener('pointercancel', endDrag);
    node.addEventListener('click', onClickCapture, true);
    return () => {
      node.removeEventListener('pointerdown', onPointerDown);
      node.removeEventListener('pointermove', onPointerMove);
      node.removeEventListener('pointerup', endDrag);
      node.removeEventListener('pointercancel', endDrag);
      node.removeEventListener('click', onClickCapture, true);
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
