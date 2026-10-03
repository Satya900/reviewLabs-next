// Builds a WhatsApp click-to-chat link for the owner to send a review
// request manually — there's no server-side send without the paid
// WhatsApp Business API, so this is Phase 1's "WhatsApp click-to-chat
// links" scope (see PHASES.md), not an automated send.

// Assumes Indian phone numbers (the PRD's pilot geography) when no country
// code is present: strips everything but digits, then prepends 91 unless
// the number already looks like it has one.
export function toWaMeDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

export function buildWaMeLink(phone: string, message: string): string {
  return `https://wa.me/${toWaMeDigits(phone)}?text=${encodeURIComponent(message)}`;
}
