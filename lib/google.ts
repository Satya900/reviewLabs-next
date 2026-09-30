// Google Business Profile integration. OAuth uses the standard Google
// endpoints; review read/reply still lives on the legacy "My Business API
// v4" — Google's newer Account Management / Business Information APIs
// cover accounts and locations but haven't absorbed reviews yet.

const GOOGLE_OAUTH_SCOPES = ["https://www.googleapis.com/auth/business.manage"];

export function hasGoogleEnv(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function buildGoogleAuthUrl(outletId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: GOOGLE_OAUTH_SCOPES.join(" "),
    state: outletId,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string, redirectUri: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Google token exchange failed: ${await res.text()}`);
  return res.json() as Promise<{ access_token: string; refresh_token: string; expires_in: number }>;
}

export async function refreshGoogleAccessToken(refreshToken: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Google token refresh failed: ${await res.text()}`);
  return res.json() as Promise<{ access_token: string; expires_in: number }>;
}

export async function listGoogleAccounts(accessToken: string) {
  const res = await fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Could not list Google accounts: ${await res.text()}`);
  return res.json() as Promise<{ accounts?: { name: string; accountName: string }[] }>;
}

export async function listGoogleLocations(accessToken: string, accountName: string) {
  const url = `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(`Could not list Google locations: ${await res.text()}`);
  return res.json() as Promise<{ locations?: { name: string; title: string }[] }>;
}

export async function listGoogleReviews(accessToken: string, accountId: string, locationId: string) {
  const url = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(`Could not list reviews: ${await res.text()}`);
  return res.json() as Promise<{
    reviews?: {
      reviewId: string;
      reviewer?: { displayName?: string };
      starRating: string; // "ONE".."FIVE"
      comment?: string;
      createTime: string;
      updateTime: string;
      reviewReply?: { comment: string };
    }[];
  }>;
}

export async function replyToGoogleReview(
  accessToken: string,
  accountId: string,
  locationId: string,
  reviewId: string,
  comment: string
) {
  const url = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews/${reviewId}/reply`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ comment }),
  });
  if (!res.ok) throw new Error(`Could not publish reply: ${await res.text()}`);
  return res.json();
}

const starWordToNumber: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

export function starWordToStars(word: string): number {
  return starWordToNumber[word] ?? 0;
}
