import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { MetricsLoginForm } from "./MetricsLoginForm";

export const dynamic = "force-dynamic";

const COOKIE_NAME = "ef_admin_metrics";

type LudwittMetrics = {
  unique_users?: number;
  qualified_users?: number;
};

async function fetchLudwittMetrics(): Promise<{
  ok: boolean;
  data?: LudwittMetrics;
  error?: string;
  status?: number;
}> {
  const appId = process.env.LUDWITT_APP_ID;
  const apiKey = process.env.LUDWITT_API_KEY;
  const base = (
    process.env.LUDWITT_API_BASE_URL || "http://localhost:4000/v1"
  ).replace(/\/$/, "");

  if (!appId || !apiKey) {
    return { ok: false, error: "LUDWITT_APP_ID or LUDWITT_API_KEY is not set" };
  }

  try {
    const res = await fetch(`${base}/apps/${appId}/metrics`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    const text = await res.text();
    let parsed: unknown = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error:
          typeof parsed === "object" &&
          parsed !== null &&
          "error" in parsed &&
          typeof (parsed as { error: unknown }).error === "string"
            ? (parsed as { error: string }).error
            : text || `HTTP ${res.status}`,
      };
    }

    return { ok: true, status: res.status, data: parsed as LudwittMetrics };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function isAuthed(): Promise<boolean> {
  const expected = process.env.ADMIN_METRICS_PASSWORD;
  if (!expected) return false;
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value === expected;
}

export default async function AdminMetricsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const passwordConfigured = Boolean(process.env.ADMIN_METRICS_PASSWORD);

  if (!passwordConfigured) {
    return (
      <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
        <h1>Admin metrics</h1>
        <p>Set ADMIN_METRICS_PASSWORD in .env.local to enable this page.</p>
      </main>
    );
  }

  if (!(await isAuthed())) {
    return (
      <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
        <h1>Admin metrics</h1>
        <p style={{ color: "#555" }}>Internal only — password required.</p>
        {params.error ? (
          <p style={{ color: "#a00" }}>Incorrect password.</p>
        ) : null}
        <MetricsLoginForm />
      </main>
    );
  }

  const ludwitt = await fetchLudwittMetrics();

  let pathCompletionsCount: number | null = null;
  let pathCompletionsError: string | null = null;
  try {
    const supabase = createAdminClient();
    const { count, error } = await supabase
      .from("path_completions")
      .select("*", { count: "exact", head: true });
    if (error) {
      pathCompletionsError = error.message;
    } else {
      pathCompletionsCount = count ?? 0;
    }
  } catch (err) {
    pathCompletionsError = err instanceof Error ? err.message : String(err);
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Admin metrics</h1>
      <p style={{ color: "#555", maxWidth: "36rem" }}>
        Side-by-side: Ludwitt&apos;s counted users vs our stricter
        path_completions rows (full path finished in this app).
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
          marginTop: "1.5rem",
          maxWidth: "40rem",
        }}
      >
        <section style={{ border: "1px solid #ccc", padding: "1rem" }}>
          <h2 style={{ fontSize: "1rem", marginTop: 0 }}>Ludwitt metrics</h2>
          {ludwitt.ok ? (
            <>
              <p style={{ fontSize: "2rem", margin: "0.5rem 0" }}>
                {ludwitt.data?.qualified_users ?? 0}
              </p>
              <p style={{ margin: 0, color: "#555" }}>qualified_users</p>
              <p style={{ marginTop: "0.75rem", fontSize: "0.9rem" }}>
                unique_users: {ludwitt.data?.unique_users ?? 0}
              </p>
            </>
          ) : (
            <p style={{ color: "#a00" }}>
              Failed{ludwitt.status ? ` (${ludwitt.status})` : ""}:{" "}
              {ludwitt.error}
            </p>
          )}
        </section>

        <section style={{ border: "1px solid #ccc", padding: "1rem" }}>
          <h2 style={{ fontSize: "1rem", marginTop: 0 }}>
            Our path_completions
          </h2>
          {pathCompletionsError ? (
            <p style={{ color: "#a00" }}>{pathCompletionsError}</p>
          ) : (
            <>
              <p style={{ fontSize: "2rem", margin: "0.5rem 0" }}>
                {pathCompletionsCount}
              </p>
              <p style={{ margin: 0, color: "#555" }}>
                rows in path_completions
              </p>
            </>
          )}
        </section>
      </div>

      <form
        action="/admin/metrics/logout"
        method="post"
        style={{ marginTop: "2rem" }}
      >
        <button type="submit">Log out</button>
      </form>
    </main>
  );
}
