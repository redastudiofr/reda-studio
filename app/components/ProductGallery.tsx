import {useCallback, useEffect, useState} from 'react';
import {Image} from '@shopify/hydrogen';
import {useHorizontalRail} from '~/lib/useHorizontalRail';
import {useT} from '~/lib/i18n';

type GalleryImage = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

/**
 * Product gallery — one horizontal slider at every width. The image in the
 * middle is full size; its neighbours peek in at the edges, slightly smaller
 * and softer, and grow back as they're swiped towards the centre.
 *
 * Scrolling is the browser's own: an overflow-x track with scroll-snap. That
 * is what keeps a swipe fluid and free of conflict with the page's vertical
 * scroll — the browser itself decides whether a gesture is a horizontal
 * swipe of the gallery or a vertical scroll of the page, with native momentum
 * and axis locking, which no JavaScript touch handler reproduces as well.
 * Mouse drag is layered on top for desktop by useHorizontalRail, which only
 * ever listens to mouse pointers and so never touches the touch path.
 *
 * The centre effect is not a timed animation but a function of the scroll
 * position: each frame, every slide gets --gallery-progress (0 when centred,
 * 1 a full slide away) and CSS derives its scale and opacity from it. It is
 * therefore progressive by construction and follows the finger exactly —
 * mid-swipe, both images sit between the two sizes.
 *
 * The image list is rendered once; nothing is duplicated or downloaded twice.
 * Each slide is a fixed-aspect box with `object-fit: contain`, so the space is
 * reserved before the image loads and no source ratio is stretched or cropped.
 */
export function ProductGallery({
  images,
  title,
}: {
  images: GalleryImage[];
  title: string;
}) {
  const t = useT();
  const {ref: trackRef} = useHorizontalRail<HTMLDivElement>();
  const [active, setActive] = useState(0);
  const multiple = images.length > 1;
  // The images array is a new object every time the route's data reloads —
  // picking a size does that — so effects key off the image ids instead.
  // Otherwise choosing a size would throw the gallery back to its first image.
  const imagesKey = images.map((image) => image.id ?? image.url).join('|');

  // This component is reused across product routes: a new product starts
  // back on its first image.
  useEffect(() => {
    setActive(0);
    const track = trackRef.current;
    if (track) track.scrollLeft = 0;
  }, [imagesKey, trackRef]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !multiple) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const slides = Array.from(track.children) as HTMLElement[];
      const centre = track.scrollLeft + track.clientWidth / 2;

      // Every read first, then every write: setting a custom property between
      // two offsetLeft reads would force a fresh layout for each slide.
      const distances = slides.map((slide) =>
        Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - centre),
      );
      const width = slides[0]?.offsetWidth || 1;

      let nearest = 0;
      distances.forEach((distance, index) => {
        slides[index].style.setProperty(
          '--gallery-progress',
          Math.min(distance / width, 1).toFixed(3),
        );
        if (distance < distances[nearest]) nearest = index;
      });
      setActive(nearest);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    track.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', schedule);
    return () => {
      track.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [imagesKey, multiple, trackRef]);

  const select = useCallback(
    (index: number) => {
      const track = trackRef.current;
      const clamped = Math.max(0, Math.min(index, images.length - 1));
      const slide = track?.children[clamped] as HTMLElement | undefined;
      if (!track || !slide) return;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      track.scrollTo({
        left: slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2,
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
    },
    [images.length, trackRef],
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      select(active + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      select(active - 1);
    }
  };

  if (images.length === 0) {
    return <div className="gallery gallery--empty" aria-hidden="true" />;
  }

  return (
    <div
      className={`gallery ${multiple ? 'gallery--multiple' : 'gallery--single'}`}
      aria-roledescription={multiple ? t('gallery.carousel') : undefined}
      aria-label={multiple ? `${t('gallery.label')} — ${title}` : undefined}
    >
      {multiple && (
        <div className="gallery__thumbs" role="tablist" aria-label={t('gallery.label')}>
          {images.map((image, index) => (
            <button
              type="button"
              key={image.id ?? `thumb-${image.url}-${index}`}
              className={`gallery__thumb ${index === active ? 'gallery__thumb--active' : ''}`}
              onClick={() => select(index)}
              role="tab"
              aria-selected={index === active}
              aria-label={t('gallery.view', {index: index + 1, total: images.length})}
            >
              <Image
                data={image}
                alt={image.altText || t('gallery.thumbAlt', {title, index: index + 1})}
                sizes="80px"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      <div
        className="gallery__track"
        ref={trackRef}
        tabIndex={multiple ? 0 : undefined}
        onKeyDown={multiple ? onKeyDown : undefined}
      >
        {images.map((image, index) => (
          <div
            className={`gallery__slide ${index === active ? 'gallery__slide--active' : ''}`}
            key={image.id ?? `${image.url}-${index}`}
            role={multiple ? 'group' : undefined}
            aria-roledescription={multiple ? t('gallery.image') : undefined}
            aria-label={multiple ? t('gallery.position', {index: index + 1, total: images.length}) : undefined}
          >
            <div className="gallery__slide-inner">
              <Image
                data={image}
                alt={
                  image.altText ||
                  (multiple ? t('gallery.imageAlt', {title, index: index + 1}) : title)
                }
                sizes="(min-width: 64em) 40vw, 84vw"
                loading={index === 0 ? 'eager' : 'lazy'}
                draggable={false}
              />
            </div>
          </div>
        ))}
      </div>

      {multiple && (
        <div className="gallery__dots">
          {images.map((image, index) => (
            <button
              type="button"
              key={image.id ?? `dot-${image.url}-${index}`}
              className={`gallery__dot ${index === active ? 'gallery__dot--active' : ''}`}
              onClick={() => select(index)}
              aria-label={t('gallery.view', {index: index + 1, total: images.length})}
              aria-current={index === active}
            />
          ))}
        </div>
      )}
    </div>
  );
}
