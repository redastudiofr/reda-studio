import {useEffect, useRef, useState} from 'react';

/**
 * Wraps children in a container that fades + slides up the first time it
 * scrolls into view. Respects prefers-reduced-motion via the CSS (the
 * .reveal transition is neutralised there).
 */
export function Reveal({
  children,
  className = '',
  as: Tag = 'div',
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'figure';
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  // Revealed by the safety net rather than by the observer: shown with no
  // transition at all. A transition can be frozen (a throttled or restored
  // tab keeps CSS animations at their first frame), and a frozen fade from
  // opacity 0 is indistinguishable from content that was never there.
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // No observer support: show the content, skip the animation.
    if (typeof IntersectionObserver === 'undefined') {
      setInstant(true);
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {threshold: 0.08, rootMargin: '0px 0px -40px 0px'},
    );
    observer.observe(node);

    /*
     * Safety net. An observer that never reports — a background or throttled
     * tab, a section whose measurements come out wrong, a browser quirk —
     * used to mean the section simply stayed invisible, forever, refresh
     * included. After this delay the content is shown whatever happened; a
     * section already on screen has revealed long before it fires.
     */
    const failsafe = setTimeout(() => {
      setInstant(true);
      setVisible(true);
    }, 1500);

    return () => {
      clearTimeout(failsafe);
      observer.disconnect();
    };
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${visible ? 'reveal--visible' : ''} ${
        instant ? 'reveal--instant' : ''
      } ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  );
}
