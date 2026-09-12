/**
 * The photos in the "notre communauté" slider.
 *
 * Everything in app/assets/community/ is picked up automatically — drop a
 * file in that folder and it appears in the slider on the next deploy, with
 * no code change. Nothing outside that folder is ever included, so the
 * years of product and banner shots living in public/images/ stay out of it.
 *
 * app/assets rather than public/: files here go through the build, which
 * fingerprints each URL. That matters because replacing a photo under the
 * same name in public/ leaves every browser that already cached it showing
 * the old one — a trap this site has already fallen into once.
 */
const modules = import.meta.glob<string>(
  '../assets/community/*.{jpg,jpeg,png,webp,avif}',
  {eager: true, query: '?url', import: 'default'},
);

export type CommunityImage = {src: string; name: string};

/**
 * Sorted by filename so the order is deterministic rather than whatever the
 * bundler happens to walk first — name the files 01-…, 02-… to arrange them.
 */
export const COMMUNITY_IMAGES: CommunityImage[] = Object.entries(modules)
  .map(([path, src]) => ({
    src,
    name: path.split('/').pop() ?? '',
  }))
  .sort((a, b) => a.name.localeCompare(b.name));
