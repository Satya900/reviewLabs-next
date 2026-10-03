// Cloudflare Turnstile verification for the public /api/feedback endpoint.
// Not configured -> don't block submissions, same demo-friendliness as
// every other optional integration in lib/ (hasRazorpayEnv, hasEmailEnv...).

export const hasTurnstileEnv = Boolean(process.env.TURNSTILE_SECRET_KEY);

export async function verifyTurnstileToken(token: string, remoteIp?: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
        ...(remoteIp ? { remoteip: remoteIp } : {}),
      }),
    });
    const data = await res.json();
    return Boolean(data.success);
  } catch {
    return false;
  }
}
