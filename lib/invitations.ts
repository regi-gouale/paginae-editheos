import { createHash, randomBytes } from "node:crypto";

const INVITATION_TTL_HOURS = 72;

export function generateInvitationToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashInvitationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function getInvitationExpiresAt(): Date {
  return new Date(Date.now() + INVITATION_TTL_HOURS * 60 * 60 * 1000);
}

export function buildInvitationLink(
  rawToken: string,
  email: string,
  name: string,
): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000";

  const url = new URL("/auth/register", baseUrl);
  url.searchParams.set("invitation", rawToken);
  url.searchParams.set("email", email);
  url.searchParams.set("name", name);

  return url.toString();
}
