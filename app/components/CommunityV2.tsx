import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';
import {RailArrows} from '~/components/RailArrows';
import {INSTAGRAM_URL, TIKTOK_URL} from '~/lib/social';
import {MAIN_PRODUCT_PATH} from '~/lib/visibleProducts';
import {useT} from '~/lib/i18n';
import {useHorizontalRail} from '~/lib/useHorizontalRail';

/*
 * « Rejoins la communauté » — nouvelle version du site.
 *
 * Repris du bloc de Hustle Studio (redastudiofr/hustle-studio,
 * app/components/CommunitySections.tsx), à la demande du propriétaire, et
 * adapté à reda studio : le logo reda studio, ses comptes, l'histoire de la
 * marque, et les photos et vidéos du Royal Longsleeve — White (public/v2/).
 * Styles : la section « Rejoins la communauté » en fin de app/styles/app.css.
 */

const ROYAL = 'Royal Longsleeve — White';

/**
 * The looks in the "become part of the community" carousel: the brand's own
 * photos (560px wide, 3:4), each with the product it shows and a link to it.
 */
const LOOKS = [
  {src: '/v2/look-01-street.webp', product: ROYAL, href: MAIN_PRODUCT_PATH},
  {src: '/v2/look-02-studio.webp', product: ROYAL, href: MAIN_PRODUCT_PATH},
  {src: '/v2/look-03-river.webp', product: ROYAL, href: MAIN_PRODUCT_PATH},
  {src: '/v2/look-04-street-left.webp', product: ROYAL, href: MAIN_PRODUCT_PATH},
  {src: '/v2/look-05-street-right.webp', product: ROYAL, href: MAIN_PRODUCT_PATH},
];

/**
 * The brand's videos in the "follow us" row, in display order: re-encoded
 * for the web (540px wide, no sound — they play muted, on their own — H.264
 * with fast start), each with a poster frame shown until it plays.
 */
const TIKTOK_VIDEOS = [
  {src: '/v2/videos/royal-01.mp4', poster: '/v2/videos/royal-01.webp'},
  {src: '/v2/videos/royal-02.mp4', poster: '/v2/videos/royal-02.webp'},
];

/**
 * "become part of the community": the whole block fills with black from the
 * logo outwards; under the title, a carousel of looks (LookRail).
 *
 * Everything starts visible: without JavaScript, or with reduced motion,
 * nothing is hidden. Once JavaScript runs the block is armed (empty disc,
 * no photos) and plays only when it is really on screen — there is no timer,
 * which used to play it before the visitor had scrolled down to it.
 */
export function CommunityV2() {
  const t = useT();
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<'idle' | 'armed' | 'in'>('idle');

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setState('armed');
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState('in');
          observer.disconnect();
        }
      },
      // Low on purpose: the block is taller than a phone screen.
      {threshold: 0.15},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={`st-community ${state === 'armed' ? 'st-community--armed' : ''} ${state === 'in' ? 'st-community--in' : ''}`}
      aria-labelledby="st-community-title"
    >
      {/* The black that spreads from the logo over the whole block. */}
      <span className="st-community__bg" aria-hidden="true" />
      <span className="st-community__logo" aria-hidden="true">
        <span className="brand-wordmark" />
      </span>
      <h2 className="st-community__title" id="st-community-title">
        {t('v2.communityTitle')}
      </h2>
      <LookRail />
      <div className="st-community__about">
        <Link to="/about" prefetch="intent" className="st-community__story">
          {t('v2.storyButton')}
        </Link>
      </div>
      <FollowUs />
    </section>
  );
}

/**
 * "follow us", inside the black block: the two accounts — Instagram and
 * TikTok — as bold links that open the profile, then the brand's videos
 * (TIKTOK_VIDEOS, above) in a row you can swipe, drag or move with the
 * arrows.
 */
function FollowUs() {
  const t = useT();
  const accounts = [
    {name: 'Instagram', href: INSTAGRAM_URL},
    {name: 'TikTok', href: TIKTOK_URL},
  ].filter((account) => account.href);

  return (
    <section className="st-tiktok" aria-labelledby="st-tiktok-title">
      <h2 className="st-tiktok__title" id="st-tiktok-title">
        {t('v2.followTitle')}
      </h2>
      {accounts.length > 0 && (
        <p className="st-tiktok__accounts">
          {accounts.map((account) => (
            <a
              key={account.name}
              href={account.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {account.name}
            </a>
          ))}
        </p>
      )}
      <p className="st-tiktok__text">{t('v2.tiktokText')}</p>
      {TIKTOK_VIDEOS.length > 0 && <VideoRail />}
    </section>
  );
}

/**
 * The videos' row: endless both ways, swiped on touch, dragged or moved with
 * the arrows with a mouse.
 *
 * Every video plays on its own — muted, looping — once the row comes near
 * the screen: the ones in view or next to it play, those far along the row
 * wait until they come close (the list repeated five times would otherwise
 * all decode at once). A page never scrolled that far downloads none.
 */
/**
 * How many times the video list is repeated in the endless row. Five rather
 * than Hustle Studio's three: with two videos, three copies are barely wider
 * than a computer screen, and the row must always reach past both edges.
 */
const COPIES = 5;

function VideoRail() {
  const t = useT();
  // Drag and arrows from the shared hook; the endless wrap is done here, so
  // that it never fights a finger: see the effect below.
  const {ref, scrollByCard} = useHorizontalRail<HTMLDivElement>();

  /*
   * Endless both ways, smoothly. The list is rendered COPIES times and the
   * row starts in the middle copy. The position is moved back by whole
   * copies only once the row has come to rest (no scroll event for a
   * moment), never during a swipe — moving it mid-flight is what made the
   * phone's momentum scrolling stutter. With three copies there is always
   * plenty of room on both sides before it rests.
   */
  useEffect(() => {
    const rail = ref.current;
    if (!rail) return;
    // One copy is every video plus as many gaps; the row has one gap fewer.
    const copyWidth = () => {
      const track = rail.firstElementChild as HTMLElement | null;
      const gap = track
        ? parseFloat(getComputedStyle(track).columnGap) || 0
        : 0;
      return (rail.scrollWidth + gap) / COPIES;
    };
    rail.scrollLeft = copyWidth() * Math.floor(COPIES / 2);

    let timer = 0;
    // Where the drift last put the row: a scroll event that finds it there
    // is the drift's own, not the visitor's.
    let driftedTo = -1;
    let heldUntil = 0;
    const hold = () => {
      heldUntil = performance.now() + 2500;
    };
    const recentre = () => {
      const width = copyWidth();
      if (!width) return;
      const middle = width * Math.floor(COPIES / 2);
      const offset = rail.scrollLeft - middle;
      const shift = Math.round(offset / width) * width;
      if (shift) rail.scrollLeft -= shift;
    };
    const onScroll = () => {
      if (Math.abs(rail.scrollLeft - driftedTo) < 2) return;
      // The visitor's own scroll (momentum included) holds the drift.
      hold();
      window.clearTimeout(timer);
      timer = window.setTimeout(recentre, 180);
    };
    rail.addEventListener('scroll', onScroll, {passive: true});

    /*
     * Always turning: the row drifts slowly to the left on its own, forever
     * (the copies are re-centred as it goes). A touch, a drag, the wheel or
     * an arrow pauses it; it picks up again a moment after the hand leaves.
     * Off screen, with reduced motion or in a hidden tab, it stays still.
     */
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const SPEED = 34; // px per second
    let frame = 0;
    let last = 0;
    let carry = 0;
    let onScreen = false;
    // Measured once and on resize, never inside the frame loop: reading
    // layout there would force the browser to lay the page out every frame.
    let width = copyWidth();
    const resized = new ResizeObserver(() => {
      width = copyWidth();
    });
    resized.observe(rail);
    const limit = () => width * (Math.floor(COPIES / 2) + 1);

    const step = (now: number) => {
      frame = requestAnimationFrame(step);
      const elapsed = last ? Math.min(now - last, 64) : 0;
      last = now;
      if (reduce.matches || document.hidden) return;
      if (now < heldUntil) {
        carry = 0;
        return;
      }
      carry += (SPEED * elapsed) / 1000;
      const whole = Math.floor(carry);
      if (!whole) return;
      carry -= whole;
      let next = rail.scrollLeft + whole;
      if (width && next > limit()) next -= width;
      rail.scrollLeft = next;
      driftedTo = next;
    };

    // The loop only runs while the row is on screen.
    const seen = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen && !frame) {
        last = 0;
        frame = requestAnimationFrame(step);
      } else if (!onScreen && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    seen.observe(rail);

    const events = ['pointerdown', 'touchstart', 'wheel', 'keydown'] as const;
    events.forEach((name) =>
      rail.addEventListener(name, hold, {passive: true}),
    );
    const wrap = rail.parentElement;
    wrap?.addEventListener('click', hold);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      seen.disconnect();
      resized.disconnect();
      rail.removeEventListener('scroll', onScroll);
      events.forEach((name) => rail.removeEventListener(name, hold));
      wrap?.removeEventListener('click', hold);
    };
  }, [ref]);

  useEffect(() => {
    const rail = ref.current;
    if (!rail || typeof IntersectionObserver === 'undefined') return;
    const videos = [...rail.querySelectorAll('video')];

    /*
     * A video plays only when the row is really on the screen AND the video
     * is in view along the row; everything else is paused. Nothing is
     * fetched before the row comes near: no `autoplay` attribute (which
     * made the browser download and start every video as the page opened,
     * wherever the row was), and the posters are only set when the row gets
     * close.
     */
    const inRow = new Set<HTMLVideoElement>();
    let onScreen = false;
    const sync = () => {
      for (const video of videos) {
        if (onScreen && inRow.has(video)) {
          if (!video.paused) continue;
          video.muted = true;
          video.preload = 'auto';
          video.play().catch(() => {});
        } else if (!video.paused) {
          video.pause();
        }
      }
    };

    const along = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) inRow.add(video);
          else inRow.delete(video);
        }
        sync();
      },
      {root: rail, rootMargin: '0px 60px'},
    );
    videos.forEach((video) => along.observe(video));

    const seen = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    seen.observe(rail);

    // Posters, once the row is near.
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        videos.forEach((video) => {
          if (video.dataset.poster) video.poster = video.dataset.poster;
        });
        near.disconnect();
      },
      {rootMargin: '800px 0px'},
    );
    near.observe(rail);

    /*
     * Safari can refuse to start even muted videos on its own (Low Power
     * Mode, its auto-play setting). The visitor's next touch, click or key
     * lets them play: try again then — still only for the videos on screen.
     */
    // Only a deliberate click (no drag) retries: never the touch that ends a
    // swipe, which is when the videos used to jump on screen.
    const onClick = () => sync();
    document.addEventListener('click', onClick, {passive: true});

    return () => {
      near.disconnect();
      seen.disconnect();
      along.disconnect();
      document.removeEventListener('click', onClick);
    };
  }, [ref]);

  const copies = Array.from({length: COPIES}, (_, copy) => copy);

  return (
    <div className="st-tiktok__rail-wrap">
      <div className="st-tiktok__rail" ref={ref}>
        <div className="st-tiktok__videos">
          {copies.map((copy) =>
            TIKTOK_VIDEOS.map((video) => (
              <video
                key={`${copy}-${video.src}`}
                className="st-tiktok__video"
                src={video.src}
                data-poster={video.poster}
                muted
                loop
                playsInline
                controls={false}
                controlsList="nodownload nofullscreen noremoteplayback"
                disablePictureInPicture
                disableRemotePlayback
                {...{'x-webkit-airplay': 'deny'}}
                preload="none"
                aria-hidden="true"
                tabIndex={-1}
                draggable={false}
              />
            )),
          )}
        </div>
      </div>
      <RailArrows
        onPrev={() => scrollByCard(-1)}
        onNext={() => scrollByCard(1)}
        prevLabel={t('rail.prevVideo')}
        nextLabel={t('rail.nextVideo')}
      />
    </div>
  );
}

/**
 * The looks carousel: the card in the middle full size, its neighbours
 * smaller and tucked behind it. Native horizontal scrolling with centre
 * snapping — a finger swipes it, the mouse drags it, the arrows step it —
 * and each card's size follows its distance from the centre, frame by frame,
 * so it moves with the finger. Card centres are measured once (and on
 * resize), never during the scroll.
 */
function LookRail() {
  const t = useT();
  const {ref, scrollByCard} = useLookRail();

  return (
    <div className="hs-look">
      <div className="hs-look__rail" ref={ref}>
        {LOOKS.map((look, index) => (
          <Link
            // Fixed list, never reordered.
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            to={look.href}
            prefetch="intent"
            className="hs-look__card"
            draggable={false}
          >
            <img
              src={look.src}
              alt={look.product}
              width={560}
              height={747}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
            <span className="hs-look__info">
              <span className="hs-look__name">{look.product}</span>
              <span className="hs-look__cta">
                {t('v2.viewProduct')} <span aria-hidden="true">→</span>
              </span>
            </span>
          </Link>
        ))}
      </div>
      <button
        type="button"
        className="hs-look__arrow hs-look__arrow--prev"
        onClick={() => scrollByCard(-1)}
        aria-label={t('rail.prevProduct')}
      >
        <svg viewBox="0 0 18 18" aria-hidden="true">
          <path d="M16 9H3M8 4L3 9l5 5" />
        </svg>
      </button>
      <button
        type="button"
        className="hs-look__arrow hs-look__arrow--next"
        onClick={() => scrollByCard(1)}
        aria-label={t('rail.nextProduct')}
      >
        <svg viewBox="0 0 18 18" aria-hidden="true">
          <path d="M2 9h13M10 4l5 5-5 5" />
        </svg>
      </button>
    </div>
  );
}

function useLookRail() {
  const ref = useRef<HTMLDivElement | null>(null);
  const centres = useRef<number[]>([]);

  useEffect(() => {
    const rail = ref.current;
    if (!rail) return;
    const cards = [...rail.querySelectorAll<HTMLElement>('.hs-look__card')];
    if (!cards.length) return;

    const measure = () => {
      centres.current = cards.map(
        (card) => card.offsetLeft + card.offsetWidth / 2,
      );
    };
    let frame = 0;
    const paint = () => {
      frame = 0;
      const width = cards[0].offsetWidth || 1;
      const middle = rail.scrollLeft + rail.clientWidth / 2;
      cards.forEach((card, index) => {
        const distance = Math.min(
          3,
          Math.abs(centres.current[index] - middle) / width,
        );
        card.style.setProperty('--look-scale', String(1 - distance * 0.13));
        card.style.zIndex = String(30 - Math.round(distance * 10));
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    measure();
    // Start on the middle look, with neighbours on both sides.
    const first = Math.floor(cards.length / 2);
    rail.scrollLeft = centres.current[first] - rail.clientWidth / 2;
    paint();

    const resized = new ResizeObserver(() => {
      measure();
      schedule();
    });
    resized.observe(rail);
    rail.addEventListener('scroll', schedule, {passive: true});

    // Mouse drag on a computer (touch scrolls natively).
    let drag: {x: number; left: number; moved: boolean} | null = null;
    const down = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      drag = {x: event.clientX, left: rail.scrollLeft, moved: false};
      rail.classList.add('is-dragging');
    };
    const move = (event: PointerEvent) => {
      if (!drag) return;
      const dx = event.clientX - drag.x;
      if (Math.abs(dx) > 4) drag.moved = true;
      rail.scrollLeft = drag.left - dx;
    };
    const up = () => {
      if (!drag) return;
      const moved = drag.moved;
      drag = null;
      rail.classList.remove('is-dragging');
      // Settle on the nearest look.
      const middle = rail.scrollLeft + rail.clientWidth / 2;
      let best = 0;
      centres.current.forEach((centre, index) => {
        if (
          Math.abs(centre - middle) < Math.abs(centres.current[best] - middle)
        )
          best = index;
      });
      rail.scrollTo({
        left: centres.current[best] - rail.clientWidth / 2,
        behavior: 'smooth',
      });
      if (moved) {
        // A drag is not a click on the card under the pointer.
        rail.addEventListener('click', (e) => e.preventDefault(), {
          capture: true,
          once: true,
        });
      }
    };
    rail.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);

    return () => {
      cancelAnimationFrame(frame);
      resized.disconnect();
      rail.removeEventListener('scroll', schedule);
      rail.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, []);

  const scrollByCard = (step: number) => {
    const rail = ref.current;
    if (!rail || !centres.current.length) return;
    const middle = rail.scrollLeft + rail.clientWidth / 2;
    let current = 0;
    centres.current.forEach((centre, index) => {
      if (
        Math.abs(centre - middle) < Math.abs(centres.current[current] - middle)
      )
        current = index;
    });
    const count = centres.current.length;
    // Past either end, go round to the other.
    const target = (current + step + count) % count;
    rail.scrollTo({
      left: centres.current[target] - rail.clientWidth / 2,
      behavior: 'smooth',
    });
  };

  return {ref, scrollByCard};
}
