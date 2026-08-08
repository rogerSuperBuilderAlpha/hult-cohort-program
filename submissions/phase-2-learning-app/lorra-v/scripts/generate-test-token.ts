/**
 * Local-only helper: sign a fake Ludwitt launch JWT for /launch?token=... testing.
 *
 * Usage:
 *   npx tsx scripts/generate-test-token.ts
 *   npx tsx scripts/generate-test-token.ts --expired
 *   npx tsx scripts/generate-test-token.ts --blocked
 *   npx tsx scripts/generate-test-token.ts --sub=user-123 --email=learner@example.com
 *
 * Requires LUDWITT_JWT_SECRET and LUDWITT_APP_ID in .env.local
 */
import { config } from "dotenv";
import { SignJWT } from "jose";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const args = process.argv.slice(2);
  const expired = args.includes("--expired");
  const blocked = args.includes("--blocked");
  const wrongApp = args.includes("--wrong-app");

  const subArg = args.find((a) => a.startsWith("--sub="))?.slice("--sub=".length);
  const emailArg = args
    .find((a) => a.startsWith("--email="))
    ?.slice("--email=".length);

  const secret = process.env.LUDWITT_JWT_SECRET;
  const appId = process.env.LUDWITT_APP_ID;

  if (!secret) {
    console.error("LUDWITT_JWT_SECRET is not set in .env.local");
    process.exit(1);
  }
  if (!appId) {
    console.error("LUDWITT_APP_ID is not set in .env.local");
    process.exit(1);
  }

  const sub = blocked
    ? "test-user-lorra-v-blocked"
    : (subArg ?? `test-user-${Date.now()}`);
  const email = blocked
    ? "lorra-v@example.com"
    : (emailArg ?? "learner@example.com");
  const tokenAppId = wrongApp ? "wrong-app-id" : appId;

  const now = Math.floor(Date.now() / 1000);
  let builder = new SignJWT({
    sub,
    email,
    app_id: tokenAppId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(expired ? now - 7200 : now);

  if (expired) {
    builder = builder.setExpirationTime(now - 3600);
  } else {
    builder = builder.setExpirationTime("1h");
  }

  const token = await builder.sign(new TextEncoder().encode(secret));
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  console.log("\nLaunch JWT claims:");
  console.log({ sub, email, app_id: tokenAppId, expired, blocked, wrongApp });
  console.log("\nToken:\n");
  console.log(token);
  console.log(`\nOpen:\n${siteUrl}/launch?token=${token}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
