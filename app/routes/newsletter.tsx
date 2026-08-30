import type {Route} from './+types/newsletter';
import {normalizePhone} from '~/lib/phone';
import {NEWSLETTER_PROMO_CODE} from '~/lib/newsletterPromo';
import {localeFromRequest} from '~/lib/i18n/locale';

/** Sign-up points allowed to tag themselves, so the tag stays a closed set. */
const SOURCES = new Set(['popup', 'footer']);

/**
 * Resource route: forwards a newsletter sign-up to the Shopify store's
 * native customer form endpoint, server-side. Keeps the storefront free of
 * any third-party email integration. Returns a small JSON status; the
 * client component only cares whether it was accepted.
 *
 * Two shapes come through here: the footer still asks for an e-mail, the
 * pop-up now asks for a phone number. Each ends up in Shopify Admin →
 * Clients, tagged `newsletter` plus its origin (`newsletter-popup` /
 * `newsletter-footer`) — how to read, filter and export that list is written
 * up in docs/emails-newsletter.md. A phone number is additionally recorded
 * in a Notion database, once `NOTION_API_KEY` and `NOTION_PHONE_DATABASE_ID`
 * are set — same doc, "Configurer l'envoi vers Notion".
 */
export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return Response.json({ok: false}, {status: 405});
  }

  const incoming = await request.formData();
  const email = String(incoming.get('contact[email]') || '').trim();
  const rawPhone = String(incoming.get('contact[phone]') || '').trim();
  const phone = rawPhone ? normalizePhone(rawPhone) : null;

  if (!email && !rawPhone) {
    return Response.json({ok: false, error: 'email ou téléphone requis'}, {status: 400});
  }
  if (rawPhone && !phone) {
    return Response.json({ok: false, error: 'téléphone invalide'}, {status: 400});
  }

  // The source is supplied by the browser, so it is matched against a fixed
  // list instead of being written into the customer record as-is.
  const source = String(incoming.get('source') || '').trim();
  const originTag = SOURCES.has(source) ? `, newsletter-${source}` : '';
  const tags = `newsletter${originTag}${phone ? ', phone-optin' : ''}`;

  const shopDomain = context.env.PUBLIC_STORE_DOMAIN;
  const shopifyBody = new URLSearchParams({
    form_type: 'customer',
    utf8: '✓',
    'contact[tags]': tags,
  });
  shopifyBody.set(phone ? 'contact[phone]' : 'contact[email]', phone || email);

  const [shopifyResult] = await Promise.allSettled([
    fetch(`https://${shopDomain}/contact`, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: shopifyBody.toString(),
    }),
    phone
      ? recordPhoneInNotion({phone, request, context})
      : Promise.resolve(),
  ]);

  if (shopifyResult.status === 'rejected') {
    console.error('Newsletter forward failed', shopifyResult.reason);
    return Response.json({ok: false}, {status: 502});
  }

  // Shopify redirects (302) on success; treat any non-5xx as accepted.
  const accepted = shopifyResult.value.status < 500;
  return Response.json({ok: accepted}, {status: accepted ? 200 : 502});
}

/**
 * Best-effort copy of a collected phone number into Notion, so it can be
 * read without opening Shopify Admin. Silent no-op until the two Oxygen
 * environment variables below are set — a marketing pop-up must never fail a
 * real sign-up because an optional mirror isn't configured yet — and any
 * Notion error is logged, not thrown, for the same reason.
 */
async function recordPhoneInNotion({
  phone,
  request,
  context,
}: {
  phone: string;
  request: Request;
  context: Route.ActionArgs['context'];
}) {
  const token = context.env.NOTION_API_KEY;
  const databaseId = context.env.NOTION_PHONE_DATABASE_ID;
  if (!token || !databaseId) return;

  try {
    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: {database_id: databaseId},
        properties: {
          'Téléphone': {title: [{text: {content: phone}}]},
          'Langue': {select: {name: localeFromRequest(request)}},
          'Code promo': {rich_text: [{text: {content: NEWSLETTER_PROMO_CODE}}]},
        },
      }),
    });
    if (!res.ok) {
      console.error('Notion phone record failed', res.status, await res.text());
    }
  } catch (error) {
    console.error('Notion phone record failed', error);
  }
}

// Visiting /newsletter directly is not meaningful — send them home.
export async function loader() {
  return Response.redirect('/', 302);
}
