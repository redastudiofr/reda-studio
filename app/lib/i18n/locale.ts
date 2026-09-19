/**
 * The site's languages, and how the choice is remembered.
 *
 * English is the default: a visitor who has never chosen gets EN, whatever
 * their browser says. That is deliberate — the brand's voice is English, and
 * silently switching on `Accept-Language` would mean two visitors seeing two
 * different sites from the same link.
 *
 * The choice lives in its own cookie rather than in the session, because it
 * has to be readable on the very first request, before any session work, and
 * it carries nothing private.
 */

export const LOCALES = ['en', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_COOKIE = 'locale';

/** A year: long enough that a returning customer never has to choose twice. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Reads the chosen language off a request. Falls back to English. */
export function localeFromRequest(request: Request): Locale {
  const header = request.headers.get('Cookie');
  if (!header) return DEFAULT_LOCALE;

  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === LOCALE_COOKIE) {
      const value = decodeURIComponent(rest.join('='));
      if (isLocale(value)) return value;
    }
  }

  return DEFAULT_LOCALE;
}

/**
 * Has this visitor already answered the language question?
 *
 * The cookie is the record of the choice — English included, which is why
 * choosing English writes one too. No cookie means the question has never
 * been put to them, and the prompt is rendered (see LanguagePrompt).
 */
export function localeChosen(request: Request): boolean {
  const header = request.headers.get('Cookie');
  if (!header) return false;

  return header
    .split(';')
    .some((part) => part.trim().startsWith(`${LOCALE_COOKIE}=`));
}

/** The Set-Cookie value that remembers a choice. */
export function localeCookie(locale: Locale): string {
  return `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
}

/**
 * The Shopify language code for a locale.
 *
 * This is what makes Shopify return *its* content — product titles,
 * descriptions, collection names — in the right language, provided those
 * translations have been published in Shopify Admin. Without them Shopify
 * returns the original text, which no storefront code can change.
 */
export function shopifyLanguage(locale: Locale): 'EN' | 'FR' {
  return locale === 'fr' ? 'FR' : 'EN';
}
