"use client";

export function MetricsLoginForm() {
  return (
    <form
      action="/admin/metrics/login"
      method="post"
      style={{ marginTop: "1rem", display: "grid", gap: "0.5rem", maxWidth: "20rem" }}
    >
      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        style={{ padding: "0.4rem" }}
      />
      <button type="submit">Enter</button>
    </form>
  );
}
