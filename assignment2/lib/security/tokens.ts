import {
  createHash,
  createHmac,
  randomBytes,
  randomInt,
} from "node:crypto";

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateVerificationCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashVerificationCode(code: string): string {
  const secret = process.env.VERIFICATION_CODE_SECRET;

  if (!secret) {
    throw new Error(
      "VERIFICATION_CODE_SECRET environment variable is not configured.",
    );
  }

  return createHmac("sha256", secret).update(code).digest("hex");
}