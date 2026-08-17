const requiredKeys = [
  "LUDWITT_CLIENT_ID",
  "LUDWITT_CLIENT_SECRET",
  "SESSION_SECRET",
  "LUDWITT_REDIRECT_URI",
];

export function getRequiredEnv() {
  const missing = requiredKeys.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  return Object.fromEntries(requiredKeys.map((key) => [key, process.env[key]]));
}
