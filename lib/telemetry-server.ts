const DEFAULT_UPSTREAM =
  "https://cohorts.algorithmacy.org/api/telemetry";

export function getUpstreamTelemetryUrl(): string {
  return process.env.TELEMETRY_UPSTREAM_URL?.trim() || DEFAULT_UPSTREAM;
}

export async function forwardTelemetry(payload: {
  app: string;
  type: string;
  details: Record<string, unknown>;
  jwt?: string | null;
}): Promise<{ ok: boolean; status: number; upstreamError?: string }> {
  const jwt = payload.jwt ?? null;
  const upstream = getUpstreamTelemetryUrl();

  try {
    const res = await fetch(upstream, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
      body: JSON.stringify({
        app: payload.app,
        type: payload.type,
        details: payload.details,
        jwt,
      }),
    });

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        upstreamError: await res.text().catch(() => res.statusText),
      };
    }

    return { ok: true, status: res.status };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      upstreamError:
        error instanceof Error ? error.message : "Upstream telemetry failed",
    };
  }
}
