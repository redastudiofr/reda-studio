/**
 * The one inbox every best-effort notification on this site converges on.
 * Kept as a constant, not an env var: it's the store's own address, not a
 * secret, and a form that "sends to whatever RESEND_TO happens to be set to"
 * is a harder thing to reason about than one that always goes here.
 */
export const STORE_NOTIFICATION_EMAIL = 'redastudio.fr@gmail.com';

/**
 * Sends a plain-text notification via Resend, straight to
 * `STORE_NOTIFICATION_EMAIL`. Returns whether it actually went out.
 *
 * Silent no-op when `RESEND_API_KEY` isn't set — callers decide for
 * themselves whether that's fine (a bonus mirror, like the phone pop-up) or
 * means the submission has nowhere else to go (like the review form).
 *
 * Sent from Resend's own sandbox address rather than a reda studio one,
 * since sending from a custom "from" domain needs that domain verified with
 * Resend first — a step nobody has to take for this to work. The sandbox
 * address can only deliver to the e-mail the Resend account itself was
 * created with, which is exactly why docs/store-notifications.md has the
 * account created as redastudio.fr@gmail.com.
 */
export async function sendNotificationEmail({
  env,
  subject,
  text,
}: {
  env: Env;
  subject: string;
  text: string;
}): Promise<boolean> {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) return false;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'reda studio <onboarding@resend.dev>',
        to: [STORE_NOTIFICATION_EMAIL],
        subject,
        text,
      }),
    });
    if (!res.ok) {
      console.error('Resend send failed', res.status, await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error('Resend send failed', error);
    return false;
  }
}
