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

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // No observer support: show the content, skip the animation.
    if (typeof IntersectionObserver === 'undefined') {
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
    const failsafe = setTimeout(() => setVisible(true), 1500);

    return () => {
      clearTimeout(failsafe);
      observer.disconnect();
    };
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${visible ? 'reveal--visible' : ''} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  );
}
