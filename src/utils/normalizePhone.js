import { parsePhoneNumber } from 'libphonenumber-js';

export function normalizePhoneE164(raw, defaultCountry = 'UA') {
  try {
    const p = parsePhoneNumber(String(raw), defaultCountry);
    return p?.isValid() ? p.number : null;
  } catch {
    return null;
  }
}

export function normalizePhoneDigits(raw, defaultCountry = 'UA') {
  const e164 = normalizePhoneE164(raw, defaultCountry);
  return e164 ? e164.replace(/^\+/, '') : null;
}

export { normalizePhoneDigits as normalizePhone };
