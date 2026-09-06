import type {Route} from './+types/preorder';
import {normalizePhone} from '~/lib/phone';
import {PREORDER_CUSTOMER_TAG} from '~/lib/preorder';
import {sendNotificationEmail} from '~/lib/email';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Resource route: forwards a "Royal Longsleeve — White" waitlist sign-up to
 * the store's native customer form endpoint, server-side — same mechanism
 * as app/routes/newsletter.tsx, and for the same reason: Shopify already
 * owns consent, unsubscribe and deletion, so this never keeps a second copy
 * of anyone's contact details anywhere else. No order is created here; the
 * product isn't for sale yet.
 *
 * Every sign-up is tagged `preorder-royal-longsleeve-white` in Shopify
 * Admin → Customers — see docs/preorder-royal-longsleeve.md for how to find
 * that list and run the launch campaign against it.
 */
export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return Response.json({ok: false}, {status: 405});
  }

  const incoming = await request.formData();
  const email = String(incoming.get('email') || '').trim();
  const rawPhone = String(incoming.get('phone') || '').trim();
  const phone = rawPhone ? normalizePhone(rawPhone) : null;

  if (!email && !rawPhone) {
    return Response.json({ok: false, error: 'required'}, {status: 400});
  }
  if (email && !EMAIL_RE.test(email)) {
    return Response.json({ok: false, error: 'email'}, {status: 400});
  }
  if (rawPhone && !phone) {
    return Response.json({ok: false, error: 'phone'}, {status: 400});
  }

  const shopDomain = context.env.PUBLIC_STORE_DOMAIN;
  const shopifyBody = new URLSearchParams({
    form_type: 'customer',
    utf8: '✓',
    'contact[tags]': `preorder, ${PREORDER_CUSTOMER_TAG}`,
  });
  // Same single-field choice app/routes/newsletter.tsx makes, and for the
  // same reason: this is the one shape already proven against Shopify's
  // native form. Email wins when both are given, since the launch offer in
  // docs/preorder-royal-longsleeve.md goes out as a Shopify Email campaign.
  shopifyBody.set(email ? 'contact[email]' : 'contact[phone]', email || phone!);

  const [shopifyResult] = await Promise.allSettled([
    fetch(`https://${shopDomain}/contact`, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: shopifyBody.toString(),
    }),
    sendNotificationEmail({
      env: context.env,
      subject: 'Royal Longsleeve — White : nouvelle inscription liste d’attente',
      text: [
        email ? `Email : ${email}` : null,
        phone ? `Téléphone : ${phone}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
    }),
  ]);

  if (shopifyResult.status === 'rejected') {
    console.error('Preorder forward failed', shopifyResult.reason);
    return Response.json({ok: false}, {status: 502});
  }

  // Shopify redirects (302) on success; treat any non-5xx as accepted.
  const accepted = shopifyResult.value.status < 500;
  return Response.json({ok: accepted}, {status: accepted ? 200 : 502});
}

// Visiting /preorder directly is not meaningful — send them home.
export async function loader() {
  return Response.redirect('/', 302);
}
