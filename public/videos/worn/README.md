Drop "Your Product Worn" clips here.

The carousel (`app/components/ProductWornVideos.tsx`) only picks up files
whose name contains `ssstik` — that's the marker used to tell a real
source clip apart from anything else in this folder. Keep the filename
exactly as uploaded (no renaming) and add it to `VIDEO_FILES` in that
component.

The `worn-01.mp4` … `worn-04.mp4` / `.webp` files here are earlier
placeholders (plain animated-gradient tiles, `worn-01.mp4` briefly a real
clip under its old name) that the component no longer references — left in
place rather than deleted, per the site owner's request not to remove
existing video files, but they don't show up on the site.

See `docs/product-worn-videos.md` for the carousel's full behaviour
(infinite loop, drag, playback).
