# "Your Product Worn" — the video row on every product page

An infinite, swipeable/draggable carousel of vertical clips, directly under
the FAQ on `/products/*`, showing the piece actually worn — TikTok/Reels-style
UGC, not studio photography. Same section on every product page; it isn't
tied to which product is being viewed.

## Where it lives

- `app/components/ProductWornVideos.tsx` — the component, and the only file
  that needs editing to add, remove or replace a clip.
- `app/lib/useHorizontalRail.ts` — the shared drag/loop/arrow mechanics
  behind this carousel and the "you may also like" one
  (`~/components/RelatedProductsRail.tsx`).
- `public/videos/worn/` — the video files.
- `app/routes/products.$handle.tsx` renders `<ProductWornVideos />` right
  after the two-column gallery/buy-box block closes — the FAQ sits inside
  that block's narrow sticky column, and a full-width row needs the page's
  full width, which only starts once that column ends. That's "directly
  under the FAQ" in practice.

## Which files count as a clip

Only files whose name contains `ssstik` (from ssstik.io, the TikTok
downloader these clips were pulled with) are used — that's the marker that
tells a real source clip apart from anything else that might end up in
`public/videos/worn/`. Files are used **exactly as uploaded, never
renamed** — the `VIDEO_FILES` list in `ProductWornVideos.tsx` spells out
each filename verbatim.

## Adding or replacing a clip

1. Drop the video file into `public/videos/worn/`, keeping its original
   `ssstik`-bearing filename.
2. Add its filename to the `VIDEO_FILES` array at the top of
   `ProductWornVideos.tsx`.

There's no fixed count any more (an earlier version of this section
required exactly four) — the carousel loops through however many entries
are in `VIDEO_FILES`.

## Format

- **Vertical, close to 9:16.** The frame itself is fixed at that ratio in
  CSS (`aspect-ratio: 9 / 16` with `object-fit: cover`), so a source that
  isn't exactly 9:16 gets cropped to fit rather than stretched or letterboxed.
- **MP4, muted.** Every clip plays `muted` — browsers require that for
  autoplay — so an audio track just adds dead weight.
- **No poster image yet.** The placeholder clips this replaced had a
  generated first-frame poster; these real clips don't, since generating one
  needs a tool (e.g. ffmpeg) not available when they were added. The video
  shows blank until it starts playing rather than flashing a mismatched
  poster — worth revisiting once a poster-generation step exists.

## Carousel behaviour

Built on `useHorizontalRail` (`{loop: true}`):

- **Infinite in both directions.** The clip list is rendered three times
  over; the rail starts scrolled into the middle copy and silently snaps
  back into it whenever a scroll carries it into a flanking copy — same
  content, so the wrap is invisible.
- **Touch**: native scroll + `scroll-snap-type: x mandatory`, untouched by
  any JS — this is what keeps mobile swipe feeling native rather than
  simulated.
- **Mouse**: click-and-drag scrolls the rail directly (see
  `useHorizontalRail`'s pointer handlers, gated to `pointerType === 'mouse'`
  so touch is never intercepted).
- **Arrows**: `.rail-arrow` buttons, desktop-only (`min-width: 64em`) — see
  `RailArrows.tsx`.

## Playback

`muted loop playsinline`, no play button. `preload="none"` and an
IntersectionObserver (rooted at the rail, not the page) defer fetching a
clip until it's within about one rail-width of being scrolled into view.
A second observer — 0.6 intersection-ratio threshold — calls `play()`/
`pause()` directly as each tile crosses in and out of view, so only the
clip(s) actually on screen are ever decoding, not all eighteen tiles
(six clips × three loop copies) at once.
