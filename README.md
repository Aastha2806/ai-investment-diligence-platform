# AI Investment Diligence & Valuation Platform

A zero-cost, fully static investment diligence and DCF valuation web application. It models a full sell-side/buy-side diligence workflow — historical analysis, forensic accounting screens, an interactive FCFF DCF, scenario analysis, and a structured "AI-assisted" diligence engine — entirely with deterministic TypeScript running in the browser. No backend, no database, no paid APIs, no LLM calls.

Built as a portfolio project for Investment Banking, Private Equity, Private Markets, Venture Capital, Hedge Fund, and Equity/Buy-Side Research applications.

## Live Demo

**[https://YOUR_GITHUB_USERNAME.github.io/ai-investment-diligence-platform/](https://YOUR_GITHUB_USERNAME.github.io/ai-investment-diligence-platform/)**

*(Replace `YOUR_GITHUB_USERNAME` after publishing — see [GitHub Pages](#github-pages) below.)*

## Screenshots

*(Add screenshots here after running the app locally: Dashboard, Financials, Forensic, DCF, Scenarios, Memo. See [DEMO_SCRIPT.md](DEMO_SCRIPT.md) for a suggested capture flow.)*

## Features

- **Dashboard** — company snapshot, revenue/EBITDA trend charts, DCF and scenario summary.
- **Company** — business model, segments, geography, capital structure.
- **Financials** — five years of statements, growth, and margins, all computed from raw inputs.
- **Analysis** — CAGR, margin trend, leverage trend, full historical ratio table.
- **Forensic** — cash conversion, DSO/DIO/DPO/CCC, Capex vs. D&A, leverage, Beneish M-Score, Altman Z'-Score, and a management-commentary-vs-metrics check.
- **DCF** — a fully interactive FCFF DCF: edit any assumption with a slider and watch the forecast, enterprise value, equity value, and implied value per share recalculate instantly, plus a live WACC × terminal-growth sensitivity table and a deterministic natural-language assumption parser.
- **Scenarios** — downside / base / upside cases run through the same DCF engine, none presented as "correct."
- **Diligence** — a rule-based "AI-assisted" diligence engine that generates financial risks, accounting flags, business risks, and valuation sensitivities, each citing the metric that triggered it.
- **Memo** — a polished investment memo assembled from the same calculations, with no buy/sell/hold recommendation.
- **Methodology** — every formula used on the site, in plain language, with stated limitations.

## Finance Methodology

Full formulas for every metric — CAGR, margins, working-capital days, Beneish M-Score, Altman Z'-Score, WACC, and the FCFF DCF — are documented on the in-app [Methodology](https://YOUR_GITHUB_USERNAME.github.io/ai-investment-diligence-platform/methodology/) page and in [METHODOLOGY.md](METHODOLOGY.md).

## Technology

- **Next.js 16** (App Router, static export) + **React 19** + **TypeScript**
- **Tailwind CSS 4** for styling
- **Recharts** for charts
- **Vitest** for numerical unit testing
- Deployed as a fully static site — no server, no database, no API routes

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the module layout: the calculation engine in `src/lib/`, illustrative data in `src/data/`, and the UI in `src/app/` and `src/components/`.

## Data Sources

This project uses **illustrative, internally-consistent demo data** for a fictional company, Meridian Analytics, Inc. — not real filings. See [DATA_SOURCES.md](DATA_SOURCES.md) for exactly how the dataset was constructed and why.

## Testing

54 numerical unit tests cover CAGR, margins, working-capital days, the Beneish and Altman models, the full FCFF DCF build (forecast → discounting → terminal value → enterprise/equity bridge), the sensitivity grid, scenario assumptions, the natural-language parser, and the diligence rule engine.

```bash
npm test
```

## Limitations

See [LIMITATIONS.md](LIMITATIONS.md) — most notably: illustrative (not real) company data, simplified balance-sheet detail behind the Beneish M-Score, and a private-company Altman Z'-Score variant since there is no traded market price.

## Local Setup

```bash
npm install --legacy-peer-deps
npm run dev
```

Then open `http://localhost:3000`.

To produce the static export locally:

```bash
npm run build   # runs `next build` with output: "export"; writes to /out
```

## GitHub Pages

This app is pre-configured for GitHub Pages via `next.config.ts` (`output: "export"`, and a `basePath`/`assetPrefix` that automatically becomes `/ai-investment-diligence-platform` when built inside GitHub Actions). See the repository setup steps in the final delivery notes, or:

1. Push this repository to GitHub as `ai-investment-diligence-platform`.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main` — `.github/workflows/deploy.yml` builds and deploys the static export automatically.
4. The site is served at `https://<username>.github.io/ai-investment-diligence-platform/`.

## Disclaimer

This is an educational/portfolio project, not a production financial system. It uses illustrative demo data for a fictional company, does not call any paid or free LLM API, and does not generate buy, sell, hold, trading signals, or price targets. Nothing on this site is investment advice.
