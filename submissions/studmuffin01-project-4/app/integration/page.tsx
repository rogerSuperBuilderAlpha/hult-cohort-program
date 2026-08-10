import type { Metadata } from "next";
import Link from "next/link";
import { IntegrationActions } from "@/components/IntegrationActions";
import { ludwittIntegrationStatus } from "@/lib/ludwitt";
import { readSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Ludwitt integration",
};

function StatusRow({
  label,
  ok,
  detail,
}: {
  label: string;
  ok: boolean;
  detail: string;
}) {
  return (
    <li
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: "0.75rem",
        padding: "0.65rem 0",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <span
        aria-hidden
        style={{
          color: ok ? "var(--accent)" : "var(--warn)",
          fontWeight: 700,
        }}
      >
        {ok ? "OK" : "!"}
      </span>
      <span>
        <strong>{label}</strong>
        <div className="faint">{detail}</div>
      </span>
    </li>
  );
}

export default async function IntegrationPage() {
  const status = ludwittIntegrationStatus();
  const session = await readSession();

  return (
    <section>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "2rem",
          marginBottom: "0.5rem",
        }}
      >
        Ludwitt wiring checklist
      </h1>
      <p className="muted" style={{ marginBottom: "1.25rem", maxWidth: "40rem" }}>
        Use this page to confirm env vars and smoke-test events. Secrets are
        never shown here — only whether they are set.
      </p>

      <div className="panel">
        <h2>Configuration</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <StatusRow
            label="LUDWITT_APP_ID"
            ok={status.hasAppId}
            detail={status.hasAppId ? "Set" : "Missing — register the app, then paste the id"}
          />
          <StatusRow
            label="LUDWITT_API_KEY"
            ok={status.hasApiKey}
            detail={status.hasApiKey ? "Set" : "Missing — needed to POST events"}
          />
          <StatusRow
            label="LUDWITT_JWT_SECRET"
            ok={status.hasJwt}
            detail={
              status.hasJwt
                ? "Set — /launch can verify tokens"
                : "Missing — launch tokens will be rejected"
            }
          />
          <StatusRow
            label="Events API base"
            ok={Boolean(status.apiBaseUrl)}
            detail={status.apiBaseUrl}
          />
          <StatusRow
            label="Public launch URL (for Ludwitt registration)"
            ok={Boolean(status.launchUrl)}
            detail={status.launchUrl}
          />
          <StatusRow
            label="Dev bypass"
            ok={true}
            detail={
              status.allowDevBypass
                ? "ON — local walks allowed without a token"
                : "OFF — production-like; Ludwitt launch required"
            }
          />
        </ul>
      </div>

      <div className="panel">
        <h2>Session</h2>
        {session ? (
          <p className="muted">
            Active session via <strong>{session.source}</strong>
            {session.email ? ` · ${session.email}` : ""} · session{" "}
            <code>{session.sessionId.slice(0, 8)}…</code>
          </p>
        ) : (
          <p className="muted">
            No session yet.{" "}
            <Link href="/launch" style={{ color: "var(--accent)", fontWeight: 600 }}>
              Open /launch
            </Link>{" "}
            (Ludwitt token or local bypass).
          </p>
        )}
      </div>

      <div className="panel">
        <h2>What you do outside this repo</h2>
        <ol className="beats">
          <li>
            Register at{" "}
            <a
              href="https://ludwitt.com/developers"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--accent)", fontWeight: 600 }}
            >
              ludwitt.com/developers
            </a>{" "}
            (or use the local API package for sandbox practice).
          </li>
          <li>
            Set launch URL to <code>{status.launchUrl}</code> (update after
            Vercel deploy).
          </li>
          <li>
            Copy <code>app_id</code>, <code>api_key</code>,{" "}
            <code>jwt_secret</code> into <code>.env.local</code> (and Vercel
            env for production). Restart <code>npm run dev</code>.
          </li>
          <li>
            Mint a test token locally with{" "}
            <code>node scripts/mint-launch-token.mjs</code>, or ask Ludwitt for
            a launcher test user.
          </li>
          <li>
            Open the printed <code>/launch?token=…</code> URL — you should land
            in Module 01, not the gate message.
          </li>
        </ol>
      </div>

      <IntegrationActions
        fullyWired={status.fullyWired}
        hasSession={Boolean(session)}
      />
    </section>
  );
}
