/** Generate a unique id with an optional prefix (crypto when available). */
export function newId(prefix: string): string {
  const core =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${core}`;
}
