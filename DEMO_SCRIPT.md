# Demo Script

A ~5-minute walkthrough for a recruiter, interviewer, or LinkedIn video/GIF.

## 1. Dashboard (30s)

Open the live site. Point out: five-year revenue/EBITDA trend, the current-year snapshot grid, and the DCF/scenario summary cards. This immediately signals "financial model," not "generic dashboard template."

> "This is a full investment diligence workflow — company profile through DCF and memo — for a fictional SaaS company I built the data for, so every number here is internally consistent and I can explain exactly where it comes from."

## 2. Financials → Analysis (45s)

Show the five-year statement table, then move to Analysis. Point out the CAGR stat cards and the leverage/growth trend charts.

> "Nothing here is hard-coded — EBIT, margins, CAGR, and every ratio are computed in the browser from the raw line items."

## 3. Forensic (60s)

Scroll through Cash Conversion, Working Capital (DSO/DIO/DPO/CCC), then the Beneish M-Score and Altman Z'-Score tables. Point out the "Management Commentary vs. Reported Metrics" section at the bottom — this is the standout feature.

> "I built in a forensic accounting layer — Beneish M-Score and Altman Z-Score, both correctly framed as screening indicators, not verdicts — and a commentary-checker that flags when a shareholder-letter claim doesn't match the underlying trend."

## 4. DCF (90s) — the centerpiece

Go to the DCF page. Drag the Revenue Growth or WACC slider and let the implied value per share, forecast table, and sensitivity grid all update live. Then use the natural-language box with the pre-filled example sentence and click Parse → Apply.

> "This is a full FCFF DCF, fully interactive — every assumption recalculates the entire model instantly, including a live WACC-by-terminal-growth sensitivity table. And this box parses plain-English assumptions deterministically — no LLM, just structured parsing — which shows I can build natural-language features without needing a paid API."

## 5. Scenarios (30s)

Click between Downside / Base / Upside. Show the comparison table.

> "Same DCF engine, three assumption sets — none presented as the 'right' one."

## 6. Diligence (45s)

Scroll the findings. Point at the FY2025 cash-conversion finding and the linked commentary finding.

> "This is the 'deterministic' diligence engine — and I'm upfront that it's deterministic rule logic, not a language model, because I built this with a static portfolio constraint. Each finding cites the exact metric that triggered it and suggests a follow-up diligence question."

## 7. Memo (30s)

Scroll the full memo top to bottom.

> "Everything rolls up into a memo — no recommendation, just a structured summary an analyst could start from."

## 8. Methodology (15s, optional)

Show that every formula is documented in plain language, and the explicit "what this tool does not do" section.

## Screenshots

Six screenshots (Dashboard, DCF, Forensic, Diligence, Memo, Methodology) are captured from the live deployed site and embedded directly in [README.md](README.md#screenshots) / stored under `public/screenshots/`. To refresh them after a UI change, re-run headless Chrome against the live URL for each route, e.g.:

```bash
chrome --headless=new --window-size=1440,1000 --screenshot=public/screenshots/dashboard.png https://aastha2806.github.io/ai-investment-diligence-platform/
```

## Video Recording

The repository includes a real browser-recorded walkthrough at `public/screenshots/demo.webm`. It was captured with Playwright against the deployed app and includes navigation through the workflow plus the interactive DCF WACC adjustment.
