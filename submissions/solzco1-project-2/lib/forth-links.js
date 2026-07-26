const DEFAULT_PM_BASE = "https://forth-bice.vercel.app";

export function normalizePmBaseUrl(base) {
  const trimmed = (base ?? DEFAULT_PM_BASE).trim().replace(/\/+$/, "");
  return trimmed || DEFAULT_PM_BASE;
}

export function buildForthTaskDeepLink(taskId, baseUrl) {
  const base = normalizePmBaseUrl(baseUrl);
  return `${base}/?taskId=${encodeURIComponent(taskId)}`;
}

export function parseForthTaskUrl(url, baseUrl) {
  try {
    const parsed = new URL(url.trim());
    const base = normalizePmBaseUrl(baseUrl);
    const expected = new URL(base);
    if (parsed.origin !== expected.origin) return null;
    const taskId = parsed.searchParams.get("taskId");
    if (!taskId) return null;
    return { taskId };
  } catch {
    return null;
  }
}

export function extractForthLinks(text, baseUrl) {
  const base = normalizePmBaseUrl(baseUrl);
  const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`${escaped}/\\?taskId=([^\\s&]+)`, "gi");
  const seen = new Set();
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    const taskId = m[1];
    if (!taskId || seen.has(taskId)) continue;
    seen.add(taskId);
    out.push({ url: m[0], taskId });
  }
  return out;
}

export function mentionPattern() {
  return /@([a-zA-Z0-9._-]+)/g;
}

export function findMentionHandles(text) {
  const re = mentionPattern();
  const handles = new Set();
  let m;
  while ((m = re.exec(text)) !== null) {
    handles.add(m[1].toLowerCase());
  }
  return [...handles];
}
