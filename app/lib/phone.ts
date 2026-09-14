/**
 * Normalizes a phone number to E.164 (+33612345678) so every stored number
 * has one shape, whatever the visitor typed or their phone autofilled.
 *
 * Only the digits and a leading + are looked at; everything else is dropped.
 * That matters more than it sounds: iOS and several Android browsers autofill
 * a contact's number wrapped in invisible direction marks (U+202A…U+202C) and
 * with non-breaking hyphens, none of which a "strip spaces, dots and dashes"
 * rule removes — so a perfectly valid autofilled number used to be rejected.
 *
 * Accepted:
 * - a French national number: 10 digits starting with 0 (06 12 34 56 78);
 * - a French mobile typed without its 0 (6 12 34 56 78);
 * - 33 followed by the 9 national digits, with or without + / 00, including
 *   the "+33 (0)6 …" habit of keeping the trunk 0;
 * - any other number given with an explicit + or 00 country code.
 *
 * A bare run of digits that fits none of these is rejected rather than guessed
 * at: the shop ships from France, and assuming a country code that was never
 * typed would silently misrecord a foreign number.
 */
export function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let digits = trimmed.replace(/\D/g, '');
  let international = /^[^\d]*\+/.test(trimmed);
  // 00 is an international prefix only when a real country code follows it —
  // otherwise "0000000000" would come out as "+00000000".
  if (!international && /^00[1-9]/.test(digits)) {
    digits = digits.slice(2);
    international = true;
  }

  // "+33 (0)6 12 34 56 78" — the French trunk 0 kept after the country code.
  if (/^330[1-9]\d{8}$/.test(digits)) {
    digits = `33${digits.slice(3)}`;
  }

  if (/^33[1-9]\d{8}$/.test(digits)) {
    return `+${digits}`;
  }

  if (international) {
    // No country code starts with 0.
    return /^[1-9]\d{7,14}$/.test(digits) ? `+${digits}` : null;
  }

  if (/^0[1-9]\d{8}$/.test(digits)) {
    return `+33${digits.slice(1)}`;
  }

  if (/^[67]\d{8}$/.test(digits)) {
    return `+33${digits}`;
  }

  return null;
}

/** How many digits a raw entry contains — shown back when a number is refused. */
export function countDigits(raw: string): number {
  return raw.replace(/\D/g, '').length;
}
