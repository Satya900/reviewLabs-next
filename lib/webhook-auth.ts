import crypto from "crypto";

// Constant-time comparison, same discipline as the Razorpay webhook's
// signature check (app/api/billing/webhook/route.ts) — a plain !== on a
// secret leaks timing information an attacker could use to guess it byte
// by byte. timingSafeEqual throws on mismatched buffer lengths, so the
// length check has to happen first.
export function isValidWebhookSecret(provided: string | null, expected: string): boolean {
  if (!provided) return false;

  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) return false;

  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}
