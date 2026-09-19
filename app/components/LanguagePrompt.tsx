import {useEffect, useState} from 'react';
import {useLocation} from 'react-router';
import {LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE} from '~/lib/i18n/locale';

/** Mirrors the cookie: a choice survives a cookie the browser drops on its own. */
const CHOICE_STORAGE_KEY = 'reda-studio-locale-choice';

/**
 * Asked once, on a visitor's very first page: keep the site in English, or
 * switch it to French.
 *
 * "Once" is decided on the server — the pop-up is only rendered when the
 * request carries no language cookie (see root.tsx's `localeChosen`), so it
 * never flashes on a page for someone who has already answered, and never
 * reappears from one page to the next.
 *
 * The English answer is written straight into the cookie here and the dialog
 * closes: nothing to reload, the page is already in English. The French answer
 * posts to /locale, which stores the choice and sends the visitor back to the
 * same page rendered in French from the server — the whole page, not the parts
 * a client-side swap would have reached.
 *
 * It works with JavaScript off, too: both answers are submit buttons of a real
 * form, and the route does the rest.
 */
export function LanguagePrompt() {
  const [open, setOpen] = useState(false);
  const {pathname, search} = useLocation();

  useEffect(() => {
    // The server already established there is no cookie. This only covers the
    // reverse case: a cookie dropped by the browser although the visitor did
    // answer — no reason to ask them twice.
    try {
      if (window.localStorage.getItem(CHOICE_STORAGE_KEY)) return;
    } catch {
      // Storage blocked (private browsing): fall through and ask.
    }
    setOpen(true);
  }, []);

  function remember() {
    try {
      window.localStorage.setItem(CHOICE_STORAGE_KEY, '1');
    } catch {
      // The cookie below is the real record; this is only a second copy.
    }
  }

  function continueInEnglish() {
    remember();
    try {
      const secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `${LOCALE_COOKIE}=en; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
    } catch {
      // Without the cookie the question comes back on the next visit; the
      // site stays in English either way, which is what they just asked for.
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
        <p className="lang-prompt__eyebrow">reda studio</p>
        <h2 className="lang-prompt__title" id="lang-prompt-title">
          Choose your language
          <span lang="fr"> · Choisissez votre langue</span>
        </h2>

        <form method="post" action="/locale" className="lang-prompt__actions">
          <input type="hidden" name="redirectTo" value={`${pathname}${search}`} />

          {/* English is what the page is already showing, so this one answers
              without a round trip; it stays a submit button so the form still
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
            onClick={remember}
          >
            Traduire en français
          </button>
        </form>

        <p className="lang-prompt__note" lang="fr">
          You can change this at any time in the menu · Modifiable à tout moment
          dans le menu
        </p>
      </div>
    </div>
  );
}
