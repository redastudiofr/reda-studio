/**
 * The visitor's answer to the cookie question, asked once alongside the
 * language choice (see LanguagePrompt).
 *
 * What the answer actually changes: this store sets cookies for the cart, the
 * session and the language — none of which need consent, and none of which can
 * be switched off without breaking the shop — plus Shopify's own visit
 * statistics, which do. "Accept" turns those statistics on; "essential only"
 * leaves them off. That is the whole of it: there is no advertising pixel here
 * to enable or disable (see the privacy policy).
 *
 * Refusing is therefore a real option with a real effect, and it is also what
 * a visitor who answers nothing at all gets.
 */
export const CONSENT_COOKIE = 'reda_cookie_consent';
export const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type ConsentChoice = 'all' | 'essential';

/** Has this visitor already answered? Read on the server, from the request. */
export function consentChosen(request: Request): boolean {
  const header = request.headers.get('Cookie');
  if (!header) return false;

  return header
    .split(';')
    .some((part) => part.trim().startsWith(`${CONSENT_COOKIE}=`));
}

/**
 * Records the answer in the browser and passes it to Shopify.
 *
 * Every step fails soft: a browser with storage blocked, or a Customer Privacy
 * API that hasn't loaded, must not turn a click into an error. The worst case
 * is that the question is asked again on the next visit — never that consent
 * is assumed.
 */
export function rememberConsent(choice: ConsentChoice) {
  try {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${CONSENT_COOKIE}=${choice}; path=/; max-age=${CONSENT_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
  } catch {
    // Nothing to do — without the cookie we simply ask again next time.
  }

  try {
    window.localStorage.setItem(CONSENT_COOKIE, choice);
  } catch {
    // Second copy only.
  }

  applyConsent(choice);
}

/**
 * Hands the answer to Shopify's Customer Privacy API, which is what actually
 * gates the store's analytics. Hydrogen loads that API because root.tsx gives
 * Analytics.Provider a `consent` configuration; if it isn't there yet, the
 * default (no tracking) already matches the safer of the two answers.
 */
export function applyConsent(choice: ConsentChoice) {
  const granted = choice === 'all';

  try {
    const privacy = (
      window as unknown as {
        Shopify?: {
          customerPrivacy?: {
            setTrackingConsent: (
              consent: Record<string, boolean>,
              callback: () => void,
            ) => void;
          };
        };
      }
    ).Shopify?.customerPrivacy;

    privacy?.setTrackingConsent(
      {
        analytics: granted,
        marketing: granted,
        preferences: granted,
        sale_of_data: false,
      },
      () => {},
    );
  } catch {
    // The choice stays recorded in the cookie either way.
  }
}
