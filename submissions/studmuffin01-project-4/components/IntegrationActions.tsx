"use client";

import { useState } from "react";

type Props = {
  fullyWired: boolean;
  hasSession: boolean;
};

export function IntegrationActions({ fullyWired, hasSession }: Props) {
  const [log, setLog] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function pingEvent() {
    setBusy(true);
    setLog("");
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "lesson_started",
          metadata: { source: "integration-ping", module: "wiring-check" },
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        mode?: string;
        error?: string;
      };
      if (!res.ok) {
        setLog(`FAIL ${res.status}: ${data.error ?? res.statusText}`);
      } else {
        setLog(
          `OK — mode=${data.mode ?? "unknown"}. ${
            data.mode === "dry-run"
              ? "Keys missing or incomplete; event only logged in the server console."
              : "Event accepted by Ludwitt API (or sandbox)."
          }`,
        );
      }
    } catch (err) {
      setLog(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel">
      <h2>Smoke test</h2>
      <p className="muted">
        {fullyWired
          ? "Env looks complete. Start a session, then ping an event."
          : "Env incomplete — ping will dry-run until app id + api key are set."}
      </p>
      {!hasSession ? (
        <p className="faint">
          Start a session first (bypass or real launch), or the ping returns
          401.
        </p>
      ) : null}
      <button
        type="button"
        className="btn"
        style={{ marginTop: "0.75rem" }}
        disabled={busy || !hasSession}
        onClick={pingEvent}
      >
        {busy ? "Sending…" : "Ping lesson_started"}
      </button>
      {log ? (
        <pre
          style={{
            marginTop: "1rem",
            whiteSpace: "pre-wrap",
            fontFamily: "var(--font-body)",
            fontSize: "0.95rem",
          }}
        >
          {log}
        </pre>
      ) : null}
    </div>
  );
}
