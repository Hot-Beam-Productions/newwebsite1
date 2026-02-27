/**
 * Firebase ID token verification without the Admin SDK.
 * Uses Google Identity Toolkit to validate signature + claims server-side.
 * Used only for the R2 upload API route.
 */

const DEFAULT_ALLOWED_DOMAIN = "hotbeamproductions.com";
const FIREBASE_API_TIMEOUT_MS = 8_000;
const allowedDomain =
  process.env.ADMIN_EMAIL_DOMAIN?.trim().toLowerCase() || DEFAULT_ALLOWED_DOMAIN;
const firebaseApiKey =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? process.env.FIREBASE_API_KEY;

interface AccountsLookupResponse {
  users?: Array<{
    localId?: string;
    email?: string;
    emailVerified?: boolean;
  }>;
}

export async function verifyAdminToken(
  token: string
): Promise<{ uid: string; email: string }> {
  if (!firebaseApiKey) {
    throw new Error("Firebase auth is not configured");
  }

  if (!token.trim()) {
    throw new Error("Missing auth token");
  }

  let response: Response;
  try {
    response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseApiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
        cache: "no-store",
        signal: AbortSignal.timeout(FIREBASE_API_TIMEOUT_MS),
      }
    );
  } catch {
    throw new Error("Auth verification request failed");
  }

  if (!response.ok) {
    throw new Error("Invalid auth token");
  }

  const payload = (await response.json()) as AccountsLookupResponse;
  const user = payload.users?.[0];

  if (!user?.localId || !user.email) {
    throw new Error("Token missing required claims");
  }

  if (!user.emailVerified) {
    throw new Error("Email must be verified");
  }

  const normalizedEmail = user.email.trim().toLowerCase();
  if (!normalizedEmail.endsWith(`@${allowedDomain}`)) {
    throw new Error(`Unauthorized: account must be @${allowedDomain}`);
  }

  return { uid: user.localId, email: normalizedEmail };
}
