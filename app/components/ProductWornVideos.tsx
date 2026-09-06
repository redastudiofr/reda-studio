import {useEffect, useRef, useState, type RefObject} from 'react';
import {useHorizontalRail} from '~/lib/useHorizontalRail';
import {RailArrows} from '~/components/RailArrows';

/**
 * "Your Product Worn" — vertical UGC/TikTok-style clips of the piece
 * actually worn, on every product page. Real social proof, not studio
 * photography: this is deliberately kept separate from the reviews section
 * further down the page.
 *
 * The clips are the ones dropped into public/videos/worn/ with `ssstik` in
 * their filename (from ssstik.io, a TikTok downloader) — that naming is
 * exactly how source clips are told apart from anything else that ends up
 * in that folder. Add a new one by dropping the file in unrenamed and
 * adding its path below; nothing else in the component depends on it.
 */
const VIDEO_FILES = [
  'ssstik.io_@mr.flared_1788699148494.mp4',
  'ssstik.io_@cvndido_1788700037319.mp4',
  'ssstik.io_@deluneatelier_1788700286824.mp4',
  'ssstik.io_@jovenclothing_1788700524218.mp4',
  'ssstik.io_@shoticallmxney_1788700356010.mp4',
  'ssstik.io_@shoticallmxney_1788700468111.mp4',
];

const VIDEOS = VIDEO_FILES.map((file, index) => ({
  src: `/videos/worn/${file}`,
  label: `reda studio piece worn, clip ${index + 1}`,
}));

/**
 * A single clip. The list is rendered three times over (see
 * useHorizontalRail's `loop`) so the rail can wrap seamlessly in both
 * directions — every copy of a given clip points at the same URL, so the
 * browser's own HTTP cache means it is only ever actually fetched once.
 */
function WornVideoTile({
  src,
  label,
  railRef,
}: {
  src: string;
  label: string;
  railRef: RefObject<HTMLDivElement | null>;
}) {
  const itemRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [near, setNear] = useState(false);

  // Attach the source once the tile is within about one rail's width of
  // being visible — near enough that swiping to it feels instant, without
  // pulling all eighteen tiles' worth of video the moment the section
  // scrolls into view. `autoPlay` below then takes it from there natively:
  // once a clip has a source, the browser loads and plays it itself, no
  // manual play()/pause() orchestration (and no risk of a race between
  // "src just got attached" and "is this tile currently visible").
  useEffect(() => {
    const node = itemRef.current;
    const root = railRef.current;
    if (!node || !root) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      {root, rootMargin: '0px 150%'},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [railRef]);

  return (
    <div className="worn-rail__item" ref={itemRef}>
      <video
        ref={videoRef}
        className="worn-rail__video"
        src={near ? src : undefined}
        aria-label={label}
        autoPlay={near}
        muted
        loop
        playsInline
        preload="none"
        draggable={false}
      />
    </div>
  );
}

export function ProductWornVideos() {
  const {ref, scrollByCard} = useHorizontalRail<HTMLDivElement>({loop: true});

  if (!VIDEOS.length) return null;

  // Three copies back to back so the rail can be scrolled infinitely in
  // either direction — see useHorizontalRail's loop mode.
  const looped = [...VIDEOS, ...VIDEOS, ...VIDEOS];

  return (
    <section className="pdp__worn" aria-labelledby="worn-heading">
      <h2 className="pdp__section-title" id="worn-heading">
        Your Product Worn
      </h2>

      <div className="rail-wrap">
        <div className="worn-rail" ref={ref}>
          {looped.map((video, index) => (
            <WornVideoTile
              key={`${video.src}-${index}`}
              src={video.src}
              label={video.label}
              railRef={ref}
            />
          ))}
        </div>
        <RailArrows
          onPrev={() => scrollByCard(-1)}
          onNext={() => scrollByCard(1)}
          prevLabel="Vidéo précédente"
          nextLabel="Vidéo suivante"
        />
      </div>
    </section>
  );
}
