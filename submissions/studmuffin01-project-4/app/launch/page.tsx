import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DevBypassButton } from "@/components/DevBypassButton";
import { ludwittConfig } from "@/lib/ludwitt";

export const metadata: Metadata = {
  title: "Launch",
};

type Props = {
  searchParams: Promise<{ token?: string; error?: string }>;
};

const ERROR_COPY: Record<string, string> = {
  missing_secret:
    "Launch credentials are not configured on this deployment yet.",
  invalid: "Launch from Ludwitt/Hult",
  app_mismatch: "Launch from Ludwitt/Hult",
  missing_token: "Launch from Ludwitt/Hult",
};

export default async function LaunchPage({ searchParams }: Props) {
  const { token, error } = await searchParams;
  const { allowDevBypass } = ludwittConfig();

  if (token?.trim()) {
    redirect(`/api/launch?token=${encodeURIComponent(token)}`);
  }

  const message = (error && ERROR_COPY[error]) || "Launch from Ludwitt/Hult";

  return (
    <section className="launch-gate">
      <h1>{message}</h1>
      <p className="muted" style={{ maxWidth: "32rem", margin: "0 auto" }}>
        This course starts through the Ludwitt/Hult launcher, which sends a
        signed token to <code>/launch?token=…</code>. Open the app from your
        Ludwitt listing so learning events can be counted.
      </p>
      {error === "missing_secret" || error === "app_mismatch" ? (
        <p className="faint" style={{ marginTop: "1rem" }}>
          Wiring hint: check{" "}
          <a href="/integration" style={{ color: "var(--accent)" }}>
            /integration
          </a>
          {error === "app_mismatch"
            ? " — token app_id does not match LUDWITT_APP_ID."
            : " — set LUDWITT_JWT_SECRET."}
        </p>
      ) : null}
      {allowDevBypass ? (
        <>
          <p className="faint" style={{ marginTop: "1.25rem" }}>
            Local development: bypass is enabled via{" "}
            <code>ALLOW_DEV_BYPASS=true</code>.
          </p>
          <DevBypassButton />
        </>
      ) : null}
    </section>
  );
}
