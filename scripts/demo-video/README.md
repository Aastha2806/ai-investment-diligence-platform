# Demo Video — Reproduction

`public/screenshots/demo.webm` is a real screen recording of the live deployed
app — not screenshots stitched together. It was captured with
[Playwright](https://playwright.dev)'s native `context.recordVideo`, which
drives an actual Chromium instance (real navigation, real `mouse.wheel`
scrolling, a real pointer drag on the DCF WACC slider, real clicks on the
Scenario tabs) and encodes the frames to WebM itself via Playwright's bundled
ffmpeg. There is no screenshot-muxing step.

- Duration: ~82s (target was 60–90s)
- Resolution: 1440×900
- Sequence: Dashboard → Financials → Analysis → Forensic → DCF (drag WACC,
  watch the valuation and sensitivity table update) → Scenarios (Upside →
  Downside → Base) → Diligence → Memo → Methodology

Playwright is a `devDependency` used only by this script — it is not part of
the deployed application.

## Rerunning it

```bash
npx playwright install chromium   # one-time, downloads Playwright's managed browser
node scripts/demo-video/record.mjs
```

By default it records against the live site
(`https://aastha2806.github.io/ai-investment-diligence-platform`). Point it at
a local dev server instead with:

```bash
BASE_URL=http://localhost:3000 node scripts/demo-video/record.mjs
```

Output is written to `public/screenshots/demo.webm`, overwriting the previous
recording; override the destination with `OUT_FILE=/path/to/out.webm`.

## Verifying the output

Confirm it's a real, playable recording (not an empty container) before
trusting it:

```bash
node -e "console.log(require('fs').statSync('public/screenshots/demo.webm').size)"
```

A few MB+ for ~80s at 1440×900 is expected. To eyeball the actual frames,
serve the folder and open it in a browser (`npx serve public/screenshots`),
or seek `document.querySelector('video').currentTime = N` in devtools at a
few points and confirm the page shown matches what should be on screen at
that timestamp.
