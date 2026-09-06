import {useEffect, useId, useState, type FormEvent} from 'react';
import {CloseIcon} from '~/components/Icons';
import {ShinyButton} from '~/components/ShinyButton';
import {lockScroll, unlockScroll} from '~/lib/scrollLock';
import {normalizePhone} from '~/lib/phone';
import {useT} from '~/lib/i18n';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = 'idle' | 'loading' | 'done' | 'required' | 'invalidEmail' | 'invalidPhone' | 'error';

/**
 * The "pre-order" button and its waitlist form, together — see
 * app/lib/preorder.ts and docs/preorder-royal-longsleeve.md. Rendered by
 * ProductPurchase *instead of* the normal add-to-cart/buy-now actions, only
 * for the one product gated there; every other product keeps those exactly
 * as they were.
 *
 * The button reuses the site's own `.btn` classes, and the dialog reuses
 * NewsletterPopup's `.popup*` classes (see app.css) — same shell, same
 * animation, same fonts and colours, just this component's own copy and
 * fields, so it never reads as a bolted-on widget.
 */
export function PreorderForm({productTitle}: {productTitle: string}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const t = useT();
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    document.addEventListener(
      'keydown',
      (event) => event.key === 'Escape' && close(),
      {signal: controller.signal},
    );
    lockScroll();
    return () => {
      controller.abort();
      unlockScroll();
    };
  }, [open]);

  function close() {
    setOpen(false);
    // So re-opening later starts fresh instead of showing a stale result.
    setStatus('idle');
  }

  async function submit(form: HTMLFormElement) {
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
    const rawPhone = (form.elements.namedItem('phone') as HTMLInputElement).value.trim();

    if (!email && !rawPhone) {
      setStatus('required');
      return;
    }
    if (email && !EMAIL_RE.test(email)) {
      setStatus('invalidEmail');
      return;
    }
    // Checked here, before the request, same as the phone number in the
    // newsletter pop-up — a mistyped number never reaches the network.
    if (rawPhone && !normalizePhone(rawPhone)) {
      setStatus('invalidPhone');
      return;
    }

    setStatus('loading');
    try {
      const body = new URLSearchParams();
      if (email) body.set('email', email);
      if (rawPhone) body.set('phone', rawPhone);
      const res = await fetch('/preorder', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: body.toString(),
      });
      setStatus(res.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit(event.currentTarget);
  }

  return (
    <>
      {/* Same ShinyButton "add to cart"/"buy now" use — identical shape,
          colour and sweep, so this reads as the same kind of button. */}
      <ShinyButton type="button" className="btn btn--full" onClick={() => setOpen(true)}>
        {t('preorder.cta')}
      </ShinyButton>

      {open && (
        <div
          className="popup-overlay"
          role="dialog"
          aria-modal
          aria-labelledby={titleId}
        >
          <button
            className="popup-overlay__close-outside"
            onClick={close}
            aria-label={t('preorder.close')}
          />
          <div className="popup popup--compact">
            <button
              type="button"
              className="popup__close"
              onClick={close}
              aria-label={t('preorder.close')}
            >
              <CloseIcon />
            </button>

            <div className="popup__body">
              <h2 id={titleId}>{productTitle}</h2>

              {status === 'done' ? (
                <div className="popup__code">
                  <p className="popup__code-value">{t('preorder.successTitle')}</p>
                  <p className="popup__code-hint">
                    {t('preorder.successBody', {product: productTitle})}
                  </p>
                </div>
              ) : (
                <>
                  <p className="popup__text">
                    {t('preorder.subtitle', {product: productTitle})}
                  </p>
                  <form className="popup__form" onSubmit={onSubmit}>
                    <label className="popup__field">
                      <span className="popup__field-label">{t('preorder.emailLabel')}</span>
                      <input
                        type="email"
                        name="email"
                        placeholder={t('preorder.emailPlaceholder')}
                        autoComplete="email"
                      />
                    </label>
                    <label className="popup__field">
                      <span className="popup__field-label">{t('preorder.phoneLabel')}</span>
                      <input
                        type="tel"
                        name="phone"
                        placeholder={t('preorder.phonePlaceholder')}
                        autoComplete="tel"
                        inputMode="tel"
                      />
                    </label>
                    <button type="submit" className="btn btn--full" disabled={status === 'loading'}>
                      {status === 'loading' ? t('preorder.submitting') : t('preorder.submit')}
                    </button>
                    {status === 'required' && (
                      <p className="form-error" role="alert">
                        {t('preorder.errorRequired')}
                      </p>
                    )}
                    {status === 'invalidEmail' && (
                      <p className="form-error" role="alert">
                        {t('preorder.errorEmail')}
                      </p>
                    )}
                    {status === 'invalidPhone' && (
                      <p className="form-error" role="alert">
                        {t('preorder.errorPhone')}
                      </p>
                    )}
                    {status === 'error' && (
                      <p className="form-error" role="alert">
                        {t('preorder.errorGeneric')}
                      </p>
                    )}
                  </form>
                  <p className="popup__fineprint">{t('preorder.fineprint')}</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
