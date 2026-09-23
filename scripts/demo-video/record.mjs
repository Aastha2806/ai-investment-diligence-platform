// Records a real screencast of the live deployed app using Playwright's native
// video recording (context.recordVideo) — an actual browser drives real
// navigation, scrolling, and pointer interaction (including dragging the DCF
// WACC slider and switching Scenario tabs), and Playwright encodes the frames
// to WebM itself via its own bundled ffmpeg. No screenshot-stitching, no
// external muxing step.

import { chromium } from "playwright";
import { mkdirSync, renameSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE_URL || "https://aastha2806.github.io/ai-investment-diligence-platform";
const OUT_DIR = path.join(__dirname, "recordings");
const FINAL_PATH = process.env.OUT_FILE || path.join(__dirname, "..", "..", "public", "screenshots", "demo.webm");
const VIEWPORT = { width: 1440, height: 900 };

mkdirSync(OUT_DIR, { recursive: true });

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function smoothScroll(page, totalDeltaY, durationMs) {
  const steps = Math.max(8, Math.round(durationMs / 60));
  const per = totalDeltaY / steps;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, per);
    await sleep(durationMs / steps);
  }
}

async function dragSlider(page, selector, fromFrac, toFrac, durationMs) {
  const box = await page.locator(selector).boundingBox();
  const y = box.y + box.height / 2;
  const startX = box.x + fromFrac * box.width;
  const endX = box.x + toFrac * box.width;
  const steps = Math.max(12, Math.round(durationMs / 45));

  await page.mouse.move(startX, y);
  await sleep(150);
  await page.mouse.down();
  await sleep(100);
  for (let i = 1; i <= steps; i++) {
    const x = startX + ((endX - startX) * i) / steps;
    await page.mouse.move(x, y);
    await sleep(durationMs / steps);
  }
  await page.mouse.up();
  await sleep(600);
}

async function goto(page, path_, settleMs = 1200) {
  await page.goto(`${BASE}${path_}`, { waitUntil: "networkidle" });
  await sleep(settleMs);
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: { dir: OUT_DIR, size: VIEWPORT },
  });
  const page = await context.newPage();

  // 1. Dashboard
  await goto(page, "/", 1800);
  await smoothScroll(page, 550, 3500);
  await sleep(900);

  // 2. Financials
  await goto(page, "/financials/", 1200);
  await smoothScroll(page, 700, 4000);
  await sleep(700);

  // 3. Analysis
  await goto(page, "/analysis/", 1200);
  await smoothScroll(page, 700, 4000);
  await sleep(700);

  // 4. Forensic
  await goto(page, "/forensic/", 1800); // let charts settle
  await smoothScroll(page, 750, 4500);
  await sleep(700);

  // 5. DCF — assumptions, forecast, valuation, slider drag, sensitivity
  await goto(page, "/dcf/", 1500);
  await sleep(1000);
  await smoothScroll(page, 350, 1600);
  await sleep(1000);
  await dragSlider(page, "#wacc", 0.375, 0.8, 2200); // visible assumption change
  await sleep(1500); // let the valuation update be visible
  await smoothScroll(page, 550, 2800);
  await sleep(500);
  await smoothScroll(page, 500, 2200); // sensitivity table
  await sleep(1000);

  // 6. Scenarios — Base / Upside / Downside
  await goto(page, "/scenarios/", 1200);
  await sleep(900);
  await page.getByRole("button", { name: "Upside", exact: true }).click();
  await sleep(1500);
  await page.getByRole("button", { name: "Downside", exact: true }).click();
  await sleep(1500);
  await page.getByRole("button", { name: "Base", exact: true }).click();
  await sleep(900);

  // 7. Diligence
  await goto(page, "/diligence/", 1200);
  await smoothScroll(page, 650, 3800);
  await sleep(700);

  // 8. Memo
  await goto(page, "/memo/", 1200);
  await smoothScroll(page, 750, 4200);
  await sleep(800);

  // 9. Methodology / Limitations close
  await goto(page, "/methodology/", 1200);
  await smoothScroll(page, 500, 2500);
  await sleep(1200);

  const video = page.video();
  await context.close();
  await browser.close();

  const recordedPath = await video.path();
  mkdirSync(path.dirname(FINAL_PATH), { recursive: true });
  renameSync(recordedPath, FINAL_PATH);
  console.log(`Video saved to ${FINAL_PATH}`);
  console.log(`Exists: ${existsSync(FINAL_PATH)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
