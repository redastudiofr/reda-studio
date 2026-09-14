/**
 * The code the welcome pop-up hands out: -15%. One constant, read only by the
 * /newsletter route — the pop-up displays whatever code the server returns, so
 * the code shown and the code recorded in Notion can never drift apart.
 *
 * It must also exist as an active discount in Shopify Admin → Discounts, or
 * checkout will refuse it: see docs/emails-newsletter.md.
 */
export const NEWSLETTER_PROMO_CODE = 'REDA15';

/**
 * Set by the server once a phone number is safely stored, and read by the
 * pop-up to never ask that visitor again. Not HttpOnly on purpose — it holds
 * nothing but "1", and the pop-up needs to see it.
 */
export const PROMO_SIGNUP_COOKIE = 'reda_promo_signup';
