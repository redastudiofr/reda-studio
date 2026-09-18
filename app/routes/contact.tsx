import {Form, useActionData, useNavigation} from 'react-router';
import {useT} from '~/lib/i18n';
import type {Route} from './+types/contact';

export const meta: Route.MetaFunction = () => {
  return [{title: 'reda studio | contact'}];
};

type ActionData = {ok: boolean; error?: string};

export async function action({request, context}: Route.ActionArgs): Promise<ActionData> {
  const formData = await request.formData();
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const message = String(formData.get('message') || '').trim();

  if (!name || !email || !message) {
    return {ok: false, error: 'fields'};
  }

  const shopDomain = context.env.PUBLIC_STORE_DOMAIN;
  try {
    const body = new URLSearchParams({
      form_type: 'contact',
      utf8: '✓',
      'contact[name]': name,
      'contact[email]': email,
      'contact[body]': message,
    });
    const res = await fetch(`https://${shopDomain}/contact`, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: body.toString(),
    });
    if (res.status >= 500) throw new Error(`status ${res.status}`);
    return {ok: true};
  } catch (error) {
    console.error('Contact form failed', error);
    return {ok: false, error: 'send'};
  }
}

export default function Contact() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const t = useT();
  const submitting = navigation.state === 'submitting';

  return (
    <div className="page">
      <h1>{t('contact.title')}</h1>
      <p>{t('contact.intro')}</p>

      {actionData?.ok ? (
        <p className="form-success" role="status">
          {t('contact.thanks')}
        </p>
      ) : (
        <Form method="post" className="contact-form" replace>
          <label htmlFor="name">{t('contact.name')}</label>
          <input id="name" name="name" type="text" required autoComplete="name" />

          <label htmlFor="email">{t('contact.email')}</label>
          <input id="email" name="email" type="email" required autoComplete="email" />

          <label htmlFor="message">{t('contact.message')}</label>
          <textarea id="message" name="message" rows={5} required />

          {actionData?.error && (
            <p className="form-error" role="alert">
              {actionData.error === 'fields' ? t('contact.errorFields') : t('contact.errorSend')}
            </p>
          )}

          <br />
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? t('contact.sending') : t('contact.send')}
          </button>
        </Form>
      )}
    </div>
  );
}
