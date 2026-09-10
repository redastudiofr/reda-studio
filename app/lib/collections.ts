/**
 * Collections deliberately kept off the homepage carousel. They stay reachable
 * everywhere else — header, /collections, the product page showcase — they
 * just don't sit among the "our basics" tiles.
 *
 * "automne drop" and "summer" are here for a different reason than the
 * others: each already has its own full-width showcase further down the
 * homepage (photo, name, description, its own product rail — see
 * CollectionProductShowcase), so a small tile for them up in the carousel
 * too would just be the same collection twice on one page.
 *
 * Matching is done on the handle AND on the normalised title, so it keeps
 * working whatever Shopify's handle looks like ("summer-drop", "summerdrop",
 * a renamed title, and so on). Note "summer" and "summer drop" are two
 * different collections in this store, so both are listed.
 */
const HIDDEN_FROM_HOME = [
  'summer',
  'summer drop',
  'all in drop',
  'win drop',
  'automne drop',
];

/**
 * The only collections shown in the "join the community" showcase closing each
 * product page. An allowlist rather than an exclusion list: new collections
 * created in Shopify stay out of it until they are named here on purpose.
 */
const SHOWCASE_ONLY = ['win drop', 'all in drop'];

/** "SUMMER DROP" / "summer-drop" → "summer drop". */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** True when either the handle or the title matches one of `names`. */
function matches(
  collection: {handle: string; title: string},
  names: string[],
): boolean {
  const handle = normalize(collection.handle);
  const title = normalize(collection.title);
  return names.some((name) => name === handle || name === title);
}

/**
 * Drops the collection Shopify creates by itself.
 *
 * Every store gets a "Home page" collection (handle `frontpage`) whether the
 * merchant wants it or not. It is a theme fixture rather than a category, and
 * listing it beside the real collections is confusing. Both the header nav and
 * the collections index filter it out through here, so the rule lives once.
 */
export function withoutAutoCollections<
  T extends {handle: string; title: string},
>(collections: T[]): T[] {
  return collections.filter(
    (collection) =>
      collection.handle !== 'frontpage' &&
      normalize(collection.title) !== 'home page',
  );
}

/** True when the collection must not appear on the homepage. */
export function isHiddenFromHome(collection: {
  handle: string;
  title: string;
}): boolean {
  return matches(collection, HIDDEN_FROM_HOME);
}

/** Drops the collections hidden from the homepage. */
export function withoutHomeHiddenCollections<
  T extends {handle: string; title: string},
>(collections: T[]): T[] {
  return collections.filter((collection) => !isHiddenFromHome(collection));
}

/**
 * Keeps only the showcase collections, in the order given by SHOWCASE_ONLY
 * rather than the order Shopify happens to return — so the row reads the same
 * every time.
 */
export function onlyShowcaseCollections<
  T extends {handle: string; title: string},
>(collections: T[]): T[] {
  return SHOWCASE_ONLY.flatMap(
    (name) => collections.filter((collection) => matches(collection, [name])),
  );
}
