import photo01 from '../assets/community/01-community.jpg';
import photo02 from '../assets/community/02-community.webp';
import photo03 from '../assets/community/03-community.jpg';
import photo04 from '../assets/community/04-community.webp';
import photo05 from '../assets/community/05-community.jpg';
import photo06 from '../assets/community/06-community.webp';

/**
 * The photos in the "notre communauté" slider.
 *
 * Listed one by one on purpose. This started as an `import.meta.glob` of the
 * folder so that dropping a file in was the whole job — but the glob resolved
 * during the server render and came back empty in the browser, so the section
 * rendered into the HTML and then vanished the moment React hydrated. Plain
 * static imports resolve identically on both sides, which is worth more than
 * saving a line per photo.
 *
 * Adding a photo is therefore two steps: put the file in
 * app/assets/community/, then add it here, in the order you want it shown.
 *
 * app/assets rather than public/: files here go through the build, which
 * fingerprints each URL. That matters because replacing a photo under the
 * same name in public/ leaves every browser that already cached it showing
 * the old one — a trap this site has already fallen into once.
 */
export type CommunityImage = {src: string; name: string};

export const COMMUNITY_IMAGES: CommunityImage[] = [
  {src: photo01, name: '01'},
  {src: photo02, name: '02'},
  {src: photo03, name: '03'},
  {src: photo04, name: '04'},
  {src: photo05, name: '05'},
  {src: photo06, name: '06'},
];
