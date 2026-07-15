export const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME?.trim() || "saveplate_session";

export function getSessionDurationDays(): number {
  const configuredDays = Number(process.env.SESSION_DURATION_DAYS ?? "7");

  if (
    !Number.isInteger(configuredDays) ||
    configuredDays < 1 ||
    configuredDays > 30
  ) {
    return 7;
  }

  return configuredDays;
}

export function createSessionExpiryDate(): Date {
  const expiresAt = new Date();

  expiresAt.setDate(expiresAt.getDate() + getSessionDurationDays());

  return expiresAt;
}

export function getSessionMaxAgeSeconds(): number {
  return getSessionDurationDays() * 24 * 60 * 60;
}