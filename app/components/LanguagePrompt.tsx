import {useEffect, useState} from 'react';
import {Link, useLocation} from 'react-router';
import {LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE} from '~/lib/i18n/locale';
import {rememberConsent, type ConsentChoice} from '~/lib/cookieConsent';
import {useT} from '~/lib/i18n';

/** Mirrors the cookie: a choice survives a cookie the browser drops on its own. */
const CHOICE_STORAGE_KEY = 'reda-studio-locale-choice';

/**
 * The one dialog a visitor ever sees on arrival: the language, and the cookies.
 *
 * Both questions live here on purpose — asking them one after the other would
 * mean two interruptions on the first page, which is exactly what a shop
 * should not do. Neither is asked twice: the server only renders this when the
 * request carries no answer (see root.tsx's `localeChosen` / `consentChosen`),
 * so it never flashes for someone who has already been through it, and never
 * comes back page after page.
 *
 * The two answers stay independent. Accepting cookies does not pick a
 * language, and picking a language does not accept cookies: closing on a
 * language without touching the cookie row records "essential only", the
 * answer that grants nothing. Consent has to be given, not collected by
 * default.
 *
 * It works with JavaScript off: the language answers are submit buttons of a
 * real form, and /locale does the rest.
 */
export function LanguagePrompt({
  askLanguage,
  askCookies,
}: {
  askLanguage: boolean;
  askCookies: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState<ConsentChoice | null>(null);
  const {pathname, search} = useLocation();
  const t = useT();

  useEffect(() => {
    // The server already established what is missing. This only covers the
    // reverse case: a cookie the browser dropped although the visitor did
    // answer — no reason to ask them twice.
    try {
      if (askLanguage && window.localStorage.getItem(CHOICE_STORAGE_KEY)) return;
    } catch {
      // Storage blocked (private browsing): fall through and ask.
    }
    setOpen(true);
  }, [askLanguage]);

  function rememberLanguageAsked() {
    try {
      window.localStorage.setItem(CHOICE_STORAGE_KEY, '1');
    } catch {
      // The cookie is the real record; this is only a second copy.
    }
  }

  /** Nothing was clicked in the cookie row: record the answer that grants nothing. */
  function settleCookies() {
    if (askCookies && !consent) rememberConsent('essential');
  }

  function chooseConsent(choice: ConsentChoice) {
    setConsent(choice);
    rememberConsent(choice);
    // When the language was already settled, this row is the only question on
    // screen — answering it closes the dialog.
    if (!askLanguage) setOpen(false);
  }

  function continueInEnglish() {
    rememberLanguageAsked();
    settleCookies();
    try {
      const secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `${LOCALE_COOKIE}=en; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
    } catch {
      // Without the cookie the question comes back on the next visit; the site
      // stays in English either way, which is what they just asked for.
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="lang-prompt"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-prompt-title"
    >
      <div className="lang-prompt__panel">
        <div className="lang-prompt__media">
          <img
            src="/images/lookbook-casquette.webp"
            alt="reda studio outfit: ecru top, embroidered washed flare jeans and a blue cap"
            width="788"
            height="1200"
            loading="eager"
            decoding="async"
          />
        </div>

        <div className="lang-prompt__body">
          <p className="lang-prompt__eyebrow">reda studio</p>

          {askLanguage && (
            <>
              <h2 className="lang-prompt__title" id="lang-prompt-title">
                Choose your language
                <span lang="fr">Choisissez votre langue</span>
              </h2>

              <form method="post" action="/locale" className="lang-prompt__actions">
                <input
                  type="hidden"
                  name="redirectTo"
                  value={`${pathname}${search}`}
                />

                {/* English is what the page already shows, so this answer needs
                    no round trip; it stays a submit button so the form still
                    works when the click handler never runs. */}
                <button
                  type="submit"
                  name="locale"
                  value="en"
                  className="lang-prompt__btn lang-prompt__btn--primary"
                  onClick={(event) => {
                    event.preventDefault();
                    continueInEnglish();
                  }}
                >
                  Continue in English
                </button>

                <button
                  type="submit"
                  name="locale"
                  value="fr"
                  className="lang-prompt__btn"
                  lang="fr"
                  onClick={() => {
                    rememberLanguageAsked();
                    settleCookies();
                  }}
                >
                  Traduire en français
                </button>
              </form>
            </>
          )}

          {askCookies && (
            <div className="lang-prompt__cookies">
              {!askLanguage && (
                <h2 className="lang-prompt__title" id="lang-prompt-title">
                  {t('cookies.title')}
                </h2>
              )}
              <p className="lang-prompt__cookies-text">
                {t('cookies.text')}{' '}
                <Link to="/legal/privacy">{t('cookies.more')}</Link>
              </p>
              <div className="lang-prompt__cookies-actions">
                <button
                  type="button"
                  className="lang-prompt__link"
                  data-chosen={consent === 'essential' ? 'true' : undefined}
                  onClick={() => chooseConsent('essential')}
                >
                  {t('cookies.essential')}
                </button>
                <button
                  type="button"
                  className="lang-prompt__link"
                  data-chosen={consent === 'all' ? 'true' : undefined}
                  onClick={() => chooseConsent('all')}
                >
                  {consent === 'all' ? t('cookies.accepted') : t('cookies.accept')}
                </button>
              </div>
            </div>
          )}

          {askLanguage && (
            <p className="lang-prompt__note">
              You can change this at any time in the menu
              <span lang="fr"> · Modifiable à tout moment dans le menu</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
