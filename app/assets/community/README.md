# "notre communauté" — the homepage photo slider

Drop community photos in this folder and they appear in the slider on the
homepage, under the products. Nothing else is needed: the list is built by
globbing this folder at build time (see `app/lib/communityImages.ts`), so
adding a file is the whole job.

Nothing outside this folder is ever shown, which is the point — the
hundreds of product and banner images in `public/images/` stay out of it.

## Adding photos

- Any of `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`.
- They're displayed as squares, cropped from the centre (`object-fit:
  cover`), so every tile is exactly the same shape whatever you upload.
  A roughly square or portrait crop survives that best; a very wide photo
  loses its sides.
- Around 1000-1400px on the long edge is plenty. Anything larger just costs
  the visitor bandwidth.
- Filenames set the order — they're sorted alphabetically. Name them
  `01-…`, `02-…` if you care which comes first.
- The slider loops endlessly once there are three or more photos; with one
  or two it simply shows them.

## Why here and not public/images/

Files in this folder go through the build, so each one gets a URL with a
content hash. Replacing a photo therefore always reaches everyone. A file
replaced under the same name in `public/images/` does not: browsers that
already cached it keep showing the old one.
