import {useCallback, useEffect, useRef, useState} from 'react';
import {useLocation} from 'react-router';
import {CloseIcon} from '~/components/Icons';
import {
  hasCookie,
  readStorage,
  setCookie,
  writeStorage,
  writeToClipboard,
} from '~/components/NewsletterPopup';
import {lockScroll, unlockScroll} from '~/lib/scrollLock';
import {useT} from '~/lib/i18n';

/**
 * Nouvelle version : le code de bienvenue, −10 % sur la première commande.
 * Il doit exister dans Shopify sous ce nom exact (Remises → code REDA10,
 * 10 %, limité à une utilisation par client) : sinon le pop-up annonce une
 * remise que le paiement refuse.
 */
export const WELCOME_CODE = 'REDA10';
export const WELCOME_PERCENT = 10;

/** Vu une fois : plus jamais montré. Noté deux fois, cookie et localStorage
 *  (les navigateurs les effacent selon des règles différentes). */
const SEEN_COOKIE = 'reda_welcome_seen';
const SEEN_STORAGE_KEY = 'reda-studio-welcome-seen';
const SEEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
const OPEN_DELAY_MS = 2500;

function alreadySeen(): boolean {
  return hasCookie(SEEN_COOKIE) || readStorage(SEEN_STORAGE_KEY) !== null;
}

function rememberSeen() {
  writeStorage(SEEN_STORAGE_KEY, String(Date.now()));
  setCookie(SEEN_COOKIE, SEEN_MAX_AGE_SECONDS);
}

/**
 * Le pop-up de bienvenue : une photo, une ligne, le code. Pas de
 * formulaire : le code est donné tel quel, à copier ou à appliquer au
 * panier d'un clic. Il ne s'ouvre qu'une seule fois par visiteur : il est
 * noté comme vu dès qu'il s'affiche, qu'on le ferme ou non.
 */
/**
 * Les autres fenêtres quand elles sont ouvertes : langue et cookies, tiroir
 * (panier, menu ; toujours dans la page, `.expanded` quand il est ouvert),
 * précommande. Celle-ci n'est pas encore dans la page quand on cherche.
 */
const OTHER_OPEN_DIALOGS = '.lang-prompt, .overlay.expanded, .popup-overlay';

export function PromoPopup() {
  const [open, setOpen] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>(
    'idle',
  );
  const codeRef = useRef<HTMLParagraphElement>(null);
  const {pathname} = useLocation();
  const t = useT();

  useEffect(() => {
    if (alreadySeen()) return;
    // Jamais par-dessus une autre fenêtre (choix de la langue et des
    // cookies à la première visite, panier ouvert…) : il serait noté vu sans
    // avoir été lu. On attend qu'aucune ne soit ouverte depuis
    // OPEN_DELAY_MS, puis il s'ouvre.
    let calmSince = Date.now();
    const timer = setInterval(() => {
      if (document.querySelector(OTHER_OPEN_DIALOGS)) {
        calmSince = Date.now();
        return;
      }
      if (Date.now() - calmSince < OPEN_DELAY_MS) return;
      clearInterval(timer);
      rememberSeen();
      setOpen(true);
    }, 250);
    return () => clearInterval(timer);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    document.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Escape') close();
      },
      {signal: controller.signal},
    );
    lockScroll();
    return () => {
      controller.abort();
      unlockScroll();
    };
  }, [open, close]);

  useEffect(() => {
    if (copyState === 'idle') return;
    const timer = setTimeout(() => setCopyState('idle'), 2500);
    return () => clearTimeout(timer);
  }, [copyState]);

  async function copyCode() {
    if (await writeToClipboard(WELCOME_CODE)) {
      setCopyState('copied');
      return;
    }
    // Dernier recours : sélectionner le code à l'écran.
    const node = codeRef.current;
    const selection = window.getSelection();
    if (node && selection) {
      const range = document.createRange();
      range.selectNodeContents(node);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    setCopyState('failed');
  }

  if (!open) return null;

  const title = t('welcome.title', {percent: WELCOME_PERCENT});

  return (
    <div className="popup-overlay" role="dialog" aria-modal aria-label={title}>
      <button
        className="popup-overlay__close-outside"
        onClick={close}
        aria-label={t('nav.close')}
      />
      <div className="popup popup--welcome">
        <button
          type="button"
          className="popup__close"
          onClick={close}
          aria-label={t('nav.close')}
        >
          <CloseIcon />
        </button>

        <div className="popup__media">
          <img
            src="/v2/photo-studio.webp"
            alt=""
            width="941"
            height="1672"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="popup__body">
          <h2>{title}</h2>
          <div className="popup__code">
            <p className="popup__code-label">{t('welcome.label')}</p>
            <p className="popup__code-value" ref={codeRef}>
              {WELCOME_CODE}
            </p>
            <div className="popup__code-actions">
              <button
                type="button"
                className="popup__copy"
                onClick={() => void copyCode()}
              >
                {copyState === 'copied' ? t('popup.copied') : t('popup.copy')}
              </button>
              <a
                className="popup__apply"
                href={`/discount/${encodeURIComponent(WELCOME_CODE)}?redirect=${encodeURIComponent(pathname)}`}
              >
                {t('popup.apply')}
              </a>
            </div>
            <p className="popup__code-hint" role="status" aria-live="polite">
              {copyState === 'failed'
                ? t('popup.copyFailed')
                : t('welcome.hint')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
