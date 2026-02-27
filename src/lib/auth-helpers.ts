/**
 * Firebase ID token verification without the Admin SDK.
 * Uses Google Identity Toolkit to validate signature + claims server-side.
 * Used only for the R2 upload API route.
 */

const ALLOWED_DOMAIN = "hotbeamproductions.com";
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "";
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "";

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
  if (!PROJECT_ID || !FIREBASE_API_KEY) {
    throw new Error("Firebase auth is not configured");
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(FIREBASE_API_KEY)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
      cache: "no-store",
    }
  );

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

  // Verify email domain
  if (!user.email.endsWith(`@${ALLOWED_DOMAIN}`)) {
    throw new Error("Unauthorized: account must be @hotbeamproductions.com");
  }

  return { uid: user.localId, email: user.email };
}
