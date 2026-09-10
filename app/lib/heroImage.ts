/**
 * Which of the mobile hero photos this visit gets.
 *
 * The homepage alternates between them one per page load — first visit gets
 * the first shot, the next load the second, and so on round the list. Only
 * ever one of them is rendered.
 *
 * The choice is made on the server from a cookie, not in the browser from
 * localStorage, for three reasons: the HTML then already contains the right
 * photo (nothing flashes the wrong one while React hydrates), only that one
 * photo is ever downloaded, and server and client render the same markup so
 * there's no hydration mismatch to introduce.
 *
 * Same shape as the locale cookie next door (app/lib/i18n/locale.ts): its
 * own cookie rather than the session, readable on the very first request,
 * carrying nothing private.
 */

export const HERO_COOKIE = 'hero-shot';

/** A year — the alternation just carries on across visits. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * The index to show for this request. Anything missing or unparseable —
 * a first visit, a cleared cookie, a hand-edited value — falls back to the
 * first photo.
 */
export function heroIndexFromRequest(request: Request, count: number): number {
  if (count < 1) return 0;

  const header = request.headers.get('Cookie');
  if (!header) return 0;

  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name !== HERO_COOKIE) continue;
    const value = Number.parseInt(rest.join('='), 10);
    if (Number.isInteger(value) && value >= 0) return value % count;
  }

  return 0;
}

/** The Set-Cookie that hands the *next* load the other photo. */
export function heroCookie(shownIndex: number, count: number): string {
  const next = count > 0 ? (shownIndex + 1) % count : 0;
  return `${HERO_COOKIE}=${next}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}
