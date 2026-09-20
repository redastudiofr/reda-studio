import {useEffect, type RefObject} from 'react';

/**
 * Drifts a horizontal rail sideways, slowly and continuously, without taking
 * it away from the visitor.
 *
 * It moves `scrollLeft` rather than transforming a track, which is the whole
 * point: the rail stays an ordinary scroll container, so a finger, a
 * trackpad, the arrows and the keyboard all keep working exactly as they did,
 * and the drift simply carries on from wherever the visitor left it. A CSS
 * marquee would have had to be fought with to scroll by hand.
 *
 * It stops while it isn't wanted — during any interaction, off screen, or in
 * a hidden tab — and resumes a moment later. Nothing runs when the visitor
 * asked for reduced motion.
 *
 * Endless motion needs the rail to loop: use it with
 * useHorizontalRail({loop: true}), which renders three copies of the row and
 * silently keeps the scroll position inside the middle one.
 */
export function useAutoScroll<T extends HTMLElement>(
  ref: RefObject<T | null>,
  {
    direction,
    pixelsPerSecond = 20,
    resumeAfterMs = 2500,
  }: {
    /** Which way the cards travel. 'right' means they slide to the right. */
    direction: 'left' | 'right';
    pixelsPerSecond?: number;
    resumeAfterMs?: number;
  },
) {
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let lastTime = 0;
    let paused = false;
    let onScreen = true;
    let resumeTimer = 0;

    const step = (time: number) => {
      frame = requestAnimationFrame(step);

      // A first frame, or a frame after a pause, has no usable delta.
      if (!lastTime) {
        lastTime = time;
        return;
      }
      // Capped so a tab coming back from the background doesn't jump.
      const elapsed = Math.min(time - lastTime, 50);
      lastTime = time;

      if (paused || !onScreen || document.hidden) return;

      const distance = (pixelsPerSecond * elapsed) / 1000;
      node.scrollLeft += direction === 'right' ? -distance : distance;
    };

    const pause = () => {
      paused = true;
      window.clearTimeout(resumeTimer);
    };

    const resumeSoon = () => {
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => {
        paused = false;
        lastTime = 0;
      }, resumeAfterMs);
    };

    const controller = new AbortController();
    const {signal} = controller;
    const on = (type: string, handler: () => void) =>
      node.addEventListener(type, handler, {passive: true, signal});

    // Any sign of a hand on it stops the drift; it picks up again a couple of
    // seconds after that hand leaves.
    on('pointerdown', pause);
    on('pointerenter', pause);
    on('wheel', pause);
    on('touchstart', pause);
    on('focusin', pause);
    on('pointerup', resumeSoon);
    on('pointercancel', resumeSoon);
    on('pointerleave', resumeSoon);
    on('touchend', resumeSoon);
    on('focusout', resumeSoon);
    document.addEventListener('visibilitychange', () => {
      lastTime = 0;
    }, {signal});

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        lastTime = 0;
      },
      {rootMargin: '100px'},
    );
    observer.observe(node);

    frame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(resumeTimer);
      controller.abort();
      observer.disconnect();
    };
  }, [ref, direction, pixelsPerSecond, resumeAfterMs]);
}
