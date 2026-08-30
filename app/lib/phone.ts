/**
 * Normalizes a phone number to E.164 (+33612345678) so every stored number
 * has one shape, whatever the visitor typed — spaces, dots, dashes, or the
 * leading 0.
 *
 * Only a French national number (10 digits starting with 0) or a number
 * already given with a country code (+ or 00 prefix) is accepted. A bare
 * run of digits with no prefix is rejected rather than guessed at: the shop
 * ships from France, so assuming a country code that was never typed would
 * silently misrecord a foreign number.
 */
export function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const cleaned = trimmed.replace(/[\s().-]/g, '');

  if (cleaned.startsWith('00')) {
    return normalizePhone(`+${cleaned.slice(2)}`);
  }

  if (cleaned.startsWith('+')) {
    const digits = cleaned.slice(1);
    return /^\d{8,15}$/.test(digits) ? `+${digits}` : null;
  }

  if (/^0\d{9}$/.test(cleaned)) {
    return `+33${cleaned.slice(1)}`;
  }

  return null;
}
