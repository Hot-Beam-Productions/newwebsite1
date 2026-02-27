/**
 * Lightweight Firebase ID token verification without the Admin SDK.
 * Decodes the JWT and checks basic claims (issuer, audience, expiry, email domain).
 * Used only for the R2 upload API route.
 */

const ALLOWED_DOMAIN = "hotbeamproductions.com";
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "";

export async function verifyAdminToken(
  token: string
): Promise<{ uid: string; email: string }> {
  // Decode the JWT payload (middle segment)
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token format");

  const payload = JSON.parse(
    Buffer.from(parts[1], "base64url").toString("utf-8")
  ) as {
    iss?: string;
    aud?: string;
    exp?: number;
    sub?: string;
    email?: string;
  };

  // Verify issuer
  if (payload.iss !== `https://securetoken.google.com/${PROJECT_ID}`) {
    throw new Error("Invalid token issuer");
  }

  // Verify audience
  if (payload.aud !== PROJECT_ID) {
    throw new Error("Invalid token audience");
  }

  // Verify expiry
  if (!payload.exp || payload.exp * 1000 < Date.now()) {
    throw new Error("Token expired");
  }

  // Verify email domain
  if (!payload.email?.endsWith(`@${ALLOWED_DOMAIN}`)) {
    throw new Error("Unauthorized: account must be @hotbeamproductions.com");
  }

  if (!payload.sub) {
    throw new Error("Token missing subject");
  }

  return { uid: payload.sub, email: payload.email };
}
