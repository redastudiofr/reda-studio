import {useEffect, type RefObject} from 'react';

/**
 * Keeps a decorative, muted, looping video playing only while it is actually
 * on screen in a visible tab — and pauses it otherwise.
 *
 * Every video on this site is `autoplay muted loop`, and until this existed
 * nothing ever paused one. Once a clip started it ran forever: scrolled far
 * off screen, and — the part that actually hurt — while the tab sat in the
 * background. A product page carries eighteen of them (six clips, tripled so
 * the rail can loop), so leaving for Instagram or TikTok and coming back
 * meant walking into eighteen still-running videos resuming at once, with
 * the browser free to float one of them over the page in picture-in-picture.
 *
 * Layered deliberately on top of `autoplay` rather than replacing it: if the
 * observer never fires, playback has already started by itself, so the worst
 * case here is a clip that keeps playing — never one that never plays. An
 * earlier attempt drove playback from the observer instead and produced
 * exactly that second failure.
 */
export function useAmbientVideo(videoRef: RefObject<HTMLVideoElement | null>) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let onScreen = false;

    const sync = () => {
      if (onScreen && !document.hidden) {
        // play() rejects if the browser declines (an autoplay policy, a
        // pause racing the call); there is nothing useful to do about it.
        if (video.paused) video.play().catch(() => {});
      } else if (!video.paused) {
        video.pause();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      // A little margin so a clip is already running by the time it is
      // properly in view, rather than visibly starting from a still.
      {rootMargin: '150px'},
    );
    observer.observe(video);
    document.addEventListener('visibilitychange', sync);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [videoRef]);
}
