/** Builds an E.164 number (+<calling code><national number without trunk 0>). */
export function toE164(dial: string, national: string): string | null {
  const digits = national.replace(/\D/g, '').replace(/^0+/, '');
  const full = `${dial}${digits}`;
  return /^[1-9]\d{6,14}$/.test(full) ? `+${full}` : null;
}
