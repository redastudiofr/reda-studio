import {Form, Link, useActionData, useNavigation, useSearchParams} from 'react-router';
import type {Route} from './+types/reviews';
import {sendNotificationEmail} from '~/lib/email';
import {useT} from '~/lib/i18n';

export const meta: Route.MetaFunction = () => {
  return [{title: 'reda studio | write a review'}];
};

type ActionData = {
  ok: boolean;
  error?: 'missing' | 'unavailable' | 'failed';
};

const RATINGS = [5, 4, 3, 2, 1] as const;

/**
 * Not a review the site publishes — the shop has no reviews app wired up
 * here, and inventing a display for these would risk mixing real,
 * unmoderated submissions in with the curated reviews shown elsewhere. This
 * only ever forwards the review by e-mail (see docs/store-notifications.md),
 * for a human to read and act on.
 */
export async function action({request, context}: Route.ActionArgs): Promise<ActionData> {
  const formData = await request.formData();
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const rating = String(formData.get('rating') || '').trim();
  const product = String(formData.get('product') || '').trim();
  const text = String(formData.get('text') || '').trim();

  if (!name || !email || !rating || !text) {
    return {ok: false, error: 'missing'};
  }

  const subject = product
    ? `Nouvel avis client — ${product} (${rating}/5)`
    : `Nouvel avis client (${rating}/5)`;
  const body = [
    `Note : ${rating}/5`,
    product && `Produit : ${product}`,
    `Nom : ${name}`,
    `E-mail : ${email}`,
    '',
    text,
  ]
    .filter(Boolean)
    .join('\n');

  const sent = await sendNotificationEmail({env: context.env, subject, text: body});
  return sent ? {ok: true} : {ok: false, error: 'unavailable'};
}

export default function WriteAReview() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const submitting = navigation.state === 'submitting';
  const t = useT();
  const productPrefill = searchParams.get('product') || '';

  return (
    <div className="page">
      <h1>{t('reviewForm.title')}</h1>
      <p>{t('reviewForm.intro')}</p>

      {actionData?.ok ? (
        <p className="form-success" role="status">
          {t('reviewForm.thanks')}
        </p>
      ) : (
        <Form method="post" className="contact-form" replace>
          <label htmlFor="review-name">{t('reviewForm.name')}</label>
          <input id="review-name" name="name" type="text" required autoComplete="name" />

          <label htmlFor="review-email">{t('reviewForm.email')}</label>
          <input id="review-email" name="email" type="email" required autoComplete="email" />

          <label htmlFor="review-rating">{t('reviewForm.rating')}</label>
          <select id="review-rating" name="rating" defaultValue="5" required>
            {RATINGS.map((value) => (
              <option key={value} value={value}>
                {'★'.repeat(value)}
              </option>
            ))}
          </select>

          <label htmlFor="review-product">{t('reviewForm.product')}</label>
          <input
            id="review-product"
            name="product"
            type="text"
            defaultValue={productPrefill}
            placeholder={t('reviewForm.productPlaceholder')}
          />

          <label htmlFor="review-text">{t('reviewForm.text')}</label>
          <textarea id="review-text" name="text" rows={5} required />

          {actionData?.error === 'missing' && (
            <p className="form-error" role="alert">
              {t('reviewForm.missingFields')}
            </p>
          )}
          {actionData?.error === 'unavailable' && (
            <p className="form-error" role="alert">
              {t('reviewForm.unavailable')}{' '}
              <Link to="/contact">{t('reviewForm.contactLink')}</Link>
            </p>
          )}
          {actionData?.error === 'failed' && (
            <p className="form-error" role="alert">
              {t('reviewForm.error')}
            </p>
          )}

          <br />
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? t('reviewForm.sending') : t('reviewForm.submit')}
          </button>
        </Form>
      )}
    </div>
  );
}
