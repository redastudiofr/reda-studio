import {InstagramIcon, TiktokIcon} from '~/components/Icons';
import {RailArrows} from '~/components/RailArrows';
import {Reveal} from '~/components/Reveal';
import {COMMUNITY_IMAGES} from '~/lib/communityImages';
import {INSTAGRAM_URL, TIKTOK_URL} from '~/lib/social';
import {useHorizontalRail} from '~/lib/useHorizontalRail';

/**
 * "notre communauté" — a single row of customer photos under the products.
 *
 * Photos come from app/assets/community/ (see communityImages.ts): drop
 * files in, they appear here. The section renders nothing at all while that
 * folder is empty, rather than leaving a titled but blank band on the page.
 *
 * Scrolling is the browser's own — an overflow-x rail with scroll-snap, the
 * same mechanics as every other rail on the site. That's deliberate for
 * touch: the browser decides whether a given gesture is a horizontal swipe
 * of the rail or a vertical scroll of the page, which is something no
 * JavaScript drag handler does as well. Mouse drag and the arrows are
 * layered on top by useHorizontalRail, and never touch the touch path.
 */
export function CommunitySlider() {
  // Looping needs enough photos to fill the rail three times over; below
  // that it would just be the same two pictures repeating on screen.
  const loop = COMMUNITY_IMAGES.length >= 3;
  const {ref, scrollByCard, atStart, atEnd} = useHorizontalRail<HTMLDivElement>({
    loop,
  });

  if (!COMMUNITY_IMAGES.length) return null;

  const tiles = loop
    ? [...COMMUNITY_IMAGES, ...COMMUNITY_IMAGES, ...COMMUNITY_IMAGES]
    : COMMUNITY_IMAGES;

  return (
    <Reveal as="section" className="community" aria-labelledby="community-heading">
      <h2 className="section-title" id="community-heading">
        notre communauté
      </h2>

      <div className="rail-wrap">
        <div className="community__rail" ref={ref}>
          {tiles.map((image, index) => (
            <div className="community__item" key={`${image.name}-${index}`}>
              <img
                src={image.src}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
                className="community__img"
              />
            </div>
          ))}
        </div>
        <RailArrows
          onPrev={() => scrollByCard(-1)}
          onNext={() => scrollByCard(1)}
          disablePrev={atStart}
          disableNext={atEnd}
          prevLabel="Photo précédente"
          nextLabel="Photo suivante"
        />
      </div>

      {/* One button-shaped block: the label, then the two accounts as the
          things you actually click. A single <a> wrapping both couldn't
          lead to two places, and nesting links isn't valid markup. */}
      <div className="community__socials">
        <span className="community__socials-label">nos réseaux</span>
        <span className="community__socials-links">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram — @redastudio.fr"
          >
            <InstagramIcon />
          </a>
          <a
            href={TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok — @redastudio.fr"
          >
            <TiktokIcon />
          </a>
        </span>
      </div>
    </Reveal>
  );
}
