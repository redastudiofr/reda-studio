# "Your Product Worn" — the video row on every product page

A row of four vertical clips, directly under the FAQ on `/products/*`,
showing the piece actually worn — TikTok/Reels-style UGC, not studio
photography. Same section on every product page; it isn't tied to which
product is being viewed.

## Where it lives

- `app/components/ProductWornVideos.tsx` — the component, and the only file
  that needs editing to change a video.
- `public/videos/worn/` — the video files and their posters.
- `app/routes/products.$handle.tsx` renders `<ProductWornVideos />` right
  after the two-column gallery/buy-box block closes — the FAQ sits inside
  that block's narrow sticky column, and a four-across row needs the page's
  full width, which only starts once that column ends. That's "directly
  under the FAQ" in practice.

## Adding or replacing a clip

1. Drop the video file and its poster into `public/videos/worn/`, using the
   same base name for both (e.g. `worn-01.mp4` and `worn-01.webp`).
2. Open `ProductWornVideos.tsx` and edit the matching entry in the `VIDEOS`
   array — `src`, `poster`, and a short `label` (used as the accessible name
   for screen readers, since the video itself carries no caption track).

Nothing else changes: no other component or query references these files.

## Why exactly four, always

The brief calls for exactly four clips, always in the list — not "up to
four" or "at least four". `VIDEOS` should always have exactly four entries;
if a fifth is ever added, the desktop grid (`repeat(4, ...)` in
`.worn-rail`, `app/styles/app.css`) would need to change too, since it's
sized for exactly this count rather than trimming an overflow the way
`.related-rail` does for recommendations.

## Format

- **Vertical, close to 9:16.** The frame itself is fixed at that ratio in
  CSS (`aspect-ratio: 9 / 16` with `object-fit: cover`), so a source that
  isn't exactly 9:16 gets cropped to fit rather than stretched or letterboxed
  — but starting from a genuinely vertical clip means barely any cropping at
  all.
- **MP4 (H.264), no audio track needed.** Every clip plays `muted` — browsers
  require that for autoplay on mobile, so nothing softens that requirement;
  strip the audio track when exporting to save weight for nothing anyone
  will hear.
- **Keep each file small.** A phone connection loads this row after
  scrolling through the whole buy box, gallery and FAQ — a few seconds of a
  vertical clip, well compressed, is normally a few hundred KB to a couple
  of MB. Four heavy files here is the one thing that could make this section
  feel slow rather than premium.
- **The poster matters.** It's what shows before the clip has loaded (the
  video is only fetched once the row scrolls near the viewport — see
  `useNearViewport` in the component) — use the video's own first frame so
  there's no flash between the poster and the clip starting.

## Playback

`autoplay muted loop playsinline`, no play button, exactly as specified.
`preload="none"` and `useNearViewport` together mean the four files aren't
fetched until the row is about to be scrolled into view, so they don't
compete with the gallery images and the rest of the page for bandwidth on
first load.
