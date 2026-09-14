import type {Route} from './+types/newsletter';
import {normalizePhone} from '~/lib/phone';
import {NEWSLETTER_PROMO_CODE, PROMO_SIGNUP_COOKIE} from '~/lib/newsletterPromo';
import {localeFromRequest} from '~/lib/i18n/locale';
import {sendNotificationEmail} from '~/lib/email';

/** Sign-up points allowed to tag themselves, so the tag stays a closed set. */
const SOURCES = new Set(['popup', 'footer']);

const NOTION_VERSION = '2022-06-28';
const NOTION_TIMEOUT_MS = 8000;
const SIGNUP_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/**
 * Resource route behind both sign-up points. Everything here runs on the
 * server: the Notion token is read from the environment and never reaches the
 * browser.
 *
 * - **Pop-up (-15%, phone number)** — Notion is the record. The number is
 *   normalised, looked up in the Notion database, and added only if it isn't
 *   there yet; the promo code is returned only once that has succeeded. If
 *   Notion is unreachable or not configured the visitor gets an error, never
 *   a code for a sign-up that wasn't saved. A copy then goes to Shopify's
 *   customer list and by e-mail, best-effort.
 * - **Footer (e-mail)** — unchanged: forwarded to the store's native customer
 *   form, tagged `newsletter, newsletter-footer`.
 *
 * Setup, and how to read either list: docs/emails-newsletter.md.
 */
export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return Response.json({ok: false}, {status: 405});
  }

  const incoming = await request.formData();
  const email = String(incoming.get('contact[email]') || '').trim();
  const rawPhone = String(incoming.get('contact[phone]') || '').trim();
  const phone = rawPhone ? normalizePhone(rawPhone) : null;
  // The source is supplied by the browser, so it is matched against a fixed
  // list instead of being trusted as-is.
  const rawSource = String(incoming.get('source') || '').trim();
  const source = SOURCES.has(rawSource) ? rawSource : null;

  if (source === 'popup') {
    // Checked again here: the pop-up's own check can always be bypassed.
    if (!phone) {
      return Response.json({ok: false, error: 'phone'}, {status: 400});
    }
    return popupSignup({phone, request, context});
  }

  if (!email && !rawPhone) {
    return Response.json({ok: false, error: 'email ou téléphone requis'}, {status: 400});
  }
  if (rawPhone && !phone) {
    return Response.json({ok: false, error: 'téléphone invalide'}, {status: 400});
  }

  const accepted = await forwardToShopify({
    context,
    tags: `newsletter${source ? `, newsletter-${source}` : ''}${phone ? ', phone-optin' : ''}`,
    field: phone ? 'phone' : 'email',
    value: phone || email,
  });
  return Response.json({ok: accepted}, {status: accepted ? 200 : 502});
}

async function popupSignup({
  phone,
  request,
  context,
}: {
  phone: string;
  request: Request;
  context: Route.ActionArgs['context'];
}) {
  const notion = notionSettings(context.env);
  if (!notion) {
    // The pop-up is hidden while this is unset (see root.tsx), so reaching
    // this means a stale page or a hand-made request. Refusing is the only
    // honest answer: there is nowhere to keep the number.
    console.error('Promo pop-up: NOTION_API_KEY or NOTION_PHONE_DATABASE_ID is not set');
    return Response.json({ok: false, error: 'unavailable'}, {status: 503});
  }

  const locale = localeFromRequest(request);
  let alreadyRegistered: boolean;
  try {
    alreadyRegistered = await isPhoneInNotion(notion, phone);
    if (!alreadyRegistered) {
      await addPhoneToNotion(notion, {phone, locale});
    }
  } catch (error) {
    console.error('Promo pop-up: Notion request failed', error);
    const ref = `N${error instanceof NotionError ? error.status : 0}`;
    return Response.json({ok: false, error: 'storage', ref}, {status: 502});
  }

  // Secondary copies, only for a genuinely new number. Awaited so they aren't
  // cut off when the response is sent, but their outcome never changes the
  // answer: the number is already safe in Notion.
  if (!alreadyRegistered) {
    await Promise.allSettled([
      forwardToShopify({
        context,
        tags: 'newsletter, newsletter-popup, phone-optin',
        field: 'phone',
        value: phone,
      }),
      sendNotificationEmail({
        env: context.env,
        subject: 'Nouveau numéro collecté — pop-up',
        text: [
          `Téléphone : ${phone}`,
          `Langue : ${locale}`,
          `Code promo : ${NEWSLETTER_PROMO_CODE}`,
        ].join('\n'),
      }),
    ]);
  }

  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return Response.json(
    {ok: true, code: NEWSLETTER_PROMO_CODE, alreadyRegistered},
    {
      headers: {
        'Set-Cookie': `${PROMO_SIGNUP_COOKIE}=1; Path=/; Max-Age=${SIGNUP_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`,
      },
    },
  );
}

type NotionSettings = {token: string; databaseId: string};

function notionSettings(env: Env): NotionSettings | null {
  const token = env.NOTION_API_KEY;
  const databaseId = env.NOTION_PHONE_DATABASE_ID;
  return token && databaseId ? {token, databaseId} : null;
}

/**
 * The duplicate check. Numbers are stored normalised (+33612345678), so
 * "06 12 34 56 78" and "+33 6 12 34 56 78" are recognised as the same person.
 */
async function isPhoneInNotion(notion: NotionSettings, phone: string) {
  const result = (await notionPost(notion, `databases/${notion.databaseId}/query`, {
    filter: {property: 'Téléphone', title: {equals: phone}},
    page_size: 1,
  })) as {results?: unknown[]};
  return (result.results?.length ?? 0) > 0;
}

/** "Date d'inscription" is a created-time column: Notion fills it in itself. */
async function addPhoneToNotion(
  notion: NotionSettings,
  {phone, locale}: {phone: string; locale: string},
) {
  await notionPost(notion, 'pages', {
    parent: {database_id: notion.databaseId},
    properties: {
      'Téléphone': {title: [{text: {content: phone}}]},
      'Code promo': {rich_text: [{text: {content: NEWSLETTER_PROMO_CODE}}]},
      'Langue': {select: {name: locale}},
    },
  });
}

/**
 * A failed Notion call. `status` is Notion's HTTP status (0 when the request
 * never got an answer), and is what the pop-up shows as a short reference —
 * enough to tell a wrong token (401) from a database not shared with the
 * integration (404) or a missing capability (403), without exposing anything.
 */
class NotionError extends Error {
  status: number;

  constructor(status: number, detail: string) {
    super(`Notion → ${status} ${detail}`);
    this.status = status;
  }
}

/** Throws on any failure, including a timeout, so callers can't mistake one for success. */
async function notionPost(notion: NotionSettings, path: string, body: unknown) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), NOTION_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`https://api.notion.com/v1/${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${notion.token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    throw new NotionError(0, controller.signal.aborted ? 'timeout' : String(error));
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    throw new NotionError(res.status, `${path} ${await res.text()}`);
  }
  return (await res.json()) as unknown;
}

/**
 * Forwards a sign-up to the store's native customer form. Shopify redirects
 * (302) on success; any non-5xx is treated as accepted.
 */
async function forwardToShopify({
  context,
  tags,
  field,
  value,
}: {
  context: Route.ActionArgs['context'];
  tags: string;
  field: 'phone' | 'email';
  value: string;
}) {
  const body = new URLSearchParams({
    form_type: 'customer',
    utf8: '✓',
    'contact[tags]': tags,
    [`contact[${field}]`]: value,
  });
  try {
    const res = await fetch(`https://${context.env.PUBLIC_STORE_DOMAIN}/contact`, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: body.toString(),
    });
    return res.status < 500;
  } catch (error) {
    console.error('Newsletter forward failed', error);
    return false;
  }
}

// Visiting /newsletter directly is not meaningful — send them home.
export async function loader() {
  return Response.redirect('/', 302);
}
