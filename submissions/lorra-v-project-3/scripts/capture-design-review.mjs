import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "design-review");
fs.mkdirSync(outDir, { recursive: true });

const pages = [
  { name: "home", path: "/" },
  { name: "projects", path: "/projects" },
  { name: "builders", path: "/builders" },
  { name: "partners", path: "/partners" },
];

async function shoot(browser, viewport, label) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  for (const p of pages) {
    await page.goto(`http://localhost:3000${p.path}`, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await page.waitForTimeout(800);
    const file = path.join(outDir, `${p.name}-${label}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log("wrote", file);
  }
  await context.close();
}

const browser = await chromium.launch();
await shoot(browser, { width: 1440, height: 900 }, "desktop");
await shoot(browser, { width: 390, height: 844 }, "mobile");
await browser.close();
