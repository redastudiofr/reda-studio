import {useEffect, useRef, type ReactNode} from 'react';
import {Link} from 'react-router';
import {motion} from 'framer-motion';
import {useHeaderTone} from '~/lib/header-tone';

type HeroCta = {text: string; href: string};

// Matches the fixed header's visual height so it flips from transparent to
// solid exactly as its own bottom edge clears the hero, not before.
const HEADER_OFFSET_PX = 56;

// Same stagger/entrance timing as the reference AnimatedHero component:
// container staggers its children, each item slides up 20px while fading in.
const containerVariants = {
  hidden: {opacity: 0},
  visible: {
    opacity: 1,
    transition: {staggerChildren: 0.15, delayChildren: 0.2},
  },
};

const itemVariants = {
  hidden: {y: 20, opacity: 0},
  visible: {y: 0, opacity: 1, transition: {duration: 0.6, ease: 'easeOut' as const}},
};

// `hero__cta` carries the white text colour (see app.css). It can't be left
// to Tailwind's `text-white`: that utility sits in `@layer utilities`, while
// reset.css's `a { color: var(--color-ink) }` is unlayered — and unlayered
// declarations beat layered ones, so the utility loses on these links.
const glassButtonClassName =
  'hero__cta inline-flex items-center justify-center border border-white/25 bg-white/10 px-6 py-3 text-[11px] uppercase tracking-[0.14em] backdrop-blur-sm transition-colors duration-200 hover:bg-white/20 sm:px-8 sm:py-4 sm:text-xs';

/**
 * Homepage hero banner: full-bleed photo with a dark overlay, staggered
 * fade-in for eyebrow/title/description/buttons, and glass (blurred) CTA
 * buttons — adapted from the reference AnimatedHero pattern using
 * framer-motion, without the shadcn/radix Button layer this project doesn't
 * otherwise use.
 */
export function AnimatedHero({
  imageMobileSrc,
  imageDesktopSrc,
  imageMobileAlt,
  imageDesktopAlt,
  eyebrow,
  title,
  description,
  ctaButton,
  secondaryCta,
}: {
  imageMobileSrc: string;
  imageDesktopSrc: string;
  // Split rather than one shared `imageAlt`: mobile and desktop are free to
  // be two entirely different photographs, not just two crops of the same
  // one, so only a description per image is ever accurate.
  imageMobileAlt: string;
  imageDesktopAlt: string;
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  ctaButton: HeroCta;
  secondaryCta?: HeroCta;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const {setTransparent} = useHeaderTone();

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setTransparent(entry.isIntersecting),
      {rootMargin: `-${HEADER_OFFSET_PX}px 0px 0px 0px`},
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      setTransparent(false);
    };
  }, [setTransparent]);

  return (
    <section className="hero" ref={sectionRef}>
      <motion.div
        className="hero__media"
        initial={{opacity: 0, scale: 1.05}}
        animate={{opacity: 1, scale: 1}}
        transition={{duration: 1.3, ease: [0.16, 1, 0.3, 1]}}
      >
        <img
          src={imageMobileSrc}
          alt={imageMobileAlt}
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="hero__img hero__img--mobile"
        />
        <img
          src={imageDesktopSrc}
          alt={imageDesktopAlt}
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="hero__img hero__img--desktop"
        />
        {/* Lighter veil on mobile so the photo itself stays visible; the
            larger desktop hero can afford the darker overlay for legibility. */}
        <div className="absolute inset-0 bg-black/25 md:bg-black/55" />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-[1] flex h-full w-full max-w-xl flex-col items-start justify-end px-6 pb-10 text-left sm:px-8 sm:pb-14 md:px-12 md:pb-20"
      >
        {eyebrow && (
          <motion.p variants={itemVariants} className="text-[11px] uppercase tracking-[0.14em] text-white/70 sm:text-xs">
            {eyebrow}
          </motion.p>
        )}
        <motion.h1
          variants={itemVariants}
          className="mt-3 text-3xl font-bold leading-[1.1] text-white sm:mt-4 sm:text-5xl md:text-6xl"
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p variants={itemVariants} className="mt-4 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
            {description}
          </motion.p>
        )}
        <motion.div variants={itemVariants} className="mt-7 flex flex-wrap items-center gap-3 sm:mt-9">
          <Link to={ctaButton.href} prefetch="intent" className={glassButtonClassName}>
            {ctaButton.text}
          </Link>
          {secondaryCta && (
            <Link to={secondaryCta.href} prefetch="intent" className={glassButtonClassName}>
              {secondaryCta.text}
            </Link>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
