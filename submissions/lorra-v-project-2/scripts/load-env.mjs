import fs from "node:fs";
import path from "node:path";

/**
 * Load key=value pairs from .env.local (and optionally .env) into process.env.
 * .env.local always wins so parent-shell DATABASE_URL from other projects cannot leak in.
 */
export function loadEnvLocal(cwd = process.cwd()) {
  for (const file of [".env", ".env.local"]) {
    const full = path.join(cwd, file);
    if (!fs.existsSync(full)) continue;
    const text = fs.readFileSync(full, "utf8");
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}
