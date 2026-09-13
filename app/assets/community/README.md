# "notre communauté" — the homepage photo slider

Community photos for the slider on the homepage, under the products.
Nothing outside this folder is ever shown, which is the point — the
hundreds of product and banner images in `public/images/` stay out of it.

## Adding photos

Two steps: put the file here, then add a line for it in
`app/lib/communityImages.ts`.

It did briefly work off a glob of this folder, so that dropping a file in
was the whole job — but the glob resolved during the server render and came
back empty in the browser, and the section disappeared the moment React
hydrated. The explicit list is the reliable version.

- Any of `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`.
- They're displayed in 9:16 portrait — TikTok / Reels shape — cropped from
  the centre (`object-fit: cover`), so every tile is exactly the same shape
  whatever you upload. A photo shot vertically on a phone fits with nothing
  lost; a landscape one keeps only its middle strip, so crop it yourself
  first if the subject isn't centred.
- Around 1000-1400px on the long edge is plenty. Anything larger just costs
  the visitor bandwidth.
- Clicking any photo opens the brand's Instagram in a new tab.
- The order is the order of the list in `communityImages.ts`. Name the
  files `01-…`, `02-…` to keep the two in step.
- The slider loops endlessly once there are three or more photos; with one
  or two it simply shows them.

## Why here and not public/images/

Files in this folder go through the build, so each one gets a URL with a
content hash. Replacing a photo therefore always reaches everyone. A file
replaced under the same name in `public/images/` does not: browsers that
already cached it keep showing the old one.
