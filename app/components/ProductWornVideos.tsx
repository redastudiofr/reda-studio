import {useNearViewport} from '~/lib/useNearViewport';

/**
 * "Your Product Worn" — vertical UGC/TikTok-style clips of the piece
 * actually worn, on every product page. Real social proof, not studio
 * photography: this is deliberately kept separate from the reviews section
 * further down the page.
 *
 * Videos are served from public/videos/worn and listed here — that's the
 * whole structure. Add or replace one by dropping the file in that folder
 * (with its poster, same name) and editing an entry below; nothing else in
 * the component depends on it. The brief calls for exactly four, always —
 * see docs/product-worn-videos.md before changing that number.
 */
const VIDEOS: Array<{src: string; poster: string; label: string}> = [
  {
    src: '/videos/worn/worn-01.mp4',
    poster: '/videos/worn/worn-01.webp',
    label: 'reda studio piece worn, clip 1',
  },
  {
    src: '/videos/worn/worn-02.mp4',
    poster: '/videos/worn/worn-02.webp',
    label: 'reda studio piece worn, clip 2',
  },
  {
    src: '/videos/worn/worn-03.mp4',
    poster: '/videos/worn/worn-03.webp',
    label: 'reda studio piece worn, clip 3',
  },
  {
    src: '/videos/worn/worn-04.mp4',
    poster: '/videos/worn/worn-04.webp',
    label: 'reda studio piece worn, clip 4',
  },
];

/**
 * A single clip. The source is only attached once the tile has scrolled
 * near the viewport — the section sits below the fold, and four videos are
 * not worth pulling on a page that hasn't been scrolled to yet. Once
 * attached, `autoPlay` (muted, so every browser allows it) starts it with no
 * play button and nothing else to click.
 */
function WornVideoTile({
  src,
  poster,
  label,
}: {
  src: string;
  poster: string;
  label: string;
}) {
  const {ref, near} = useNearViewport<HTMLDivElement>('300px');

  return (
    <div className="worn-rail__item" ref={ref}>
      <video
        className="worn-rail__video"
        src={near ? src : undefined}
        poster={poster}
        aria-label={label}
        muted
        loop
        playsInline
        autoPlay
        preload="none"
        draggable={false}
      />
    </div>
  );
}

export function ProductWornVideos() {
  if (!VIDEOS.length) return null;

  return (
    <section className="pdp__worn" aria-labelledby="worn-heading">
      <h2 className="pdp__section-title" id="worn-heading">
        Your Product Worn
      </h2>

      {/* Same rail pattern as the recommendations row below — a touch
          slider on mobile, a fixed grid on desktop (see .worn-rail). */}
      <div className="worn-rail">
        {VIDEOS.map((video) => (
          <WornVideoTile key={video.src} {...video} />
        ))}
      </div>
    </section>
  );
}
