# Architecture

## Overview

A single Next.js (App Router) application, statically exported (`output: "export"`) to a folder of plain HTML/CSS/JS with no server, no API routes, and no database. Every "backend" computation (DCF, forensic scores, diligence rules) runs as plain TypeScript functions executed in the browser at render/interaction time.

```
Browser
  └── Static HTML/CSS/JS (from `next build` → /out)
        ├── React Server Components (pre-rendered at build time) — page shells, tables, static content
        └── Client Components ("use client") — DCF workbench, scenario switcher, charts (interactive state)
              └── src/lib/*  — pure, deterministic calculation functions
                    └── src/data/*.json — illustrative input data
```

## Directory Layout

```
src/
  app/                    Next.js App Router routes (one folder per page)
    page.tsx              Dashboard (/)
    company/page.tsx
    financials/page.tsx
    analysis/page.tsx
    forensic/page.tsx
    dcf/page.tsx
    scenarios/page.tsx
    diligence/page.tsx
    memo/page.tsx
    methodology/page.tsx
    layout.tsx             Root layout: fonts, <Nav>, <Footer>
    globals.css             Design tokens (CSS variables) + Tailwind
  components/
    Nav.tsx, Footer.tsx      Site chrome
    PageShell.tsx            PageHeader, Section, Card, StatCard, Pill, IllustrativeBanner
    DataTable.tsx            Generic financial-statement table
    TrendChart.tsx, DashboardCharts.tsx   Recharts wrappers
    DcfWorkbench.tsx          Client component: interactive DCF + sensitivity + NL parser UI
    ScenarioSwitcher.tsx      Client component: scenario tabs + comparison table
  lib/                      The calculation engine — no React, no I/O, fully unit-testable
    types.ts                 Shared TypeScript interfaces
    financials.ts             Derives EBIT/NI/margins/growth/ratios from raw statements
    forensic.ts                Beneish M-Score, Altman Z'-Score
    dcf.ts                      FCFF DCF engine + sensitivity grid
    wacc.ts                      CAPM cost of equity, WACC
    scenarios.ts                 Downside/base/upside assumption sets
    nlParser.ts                   Deterministic natural-language assumption parser
    diligence.ts                   Rule-based diligence finding generator
    commentaryCheck.ts              Compares commentary claims against computed metrics
    format.ts                        Currency/percent/day/multiple formatting helpers
    __tests__/                        Vitest unit tests, one file per module
  data/
    company.json              Company profile, segments, geography, capital structure
    financials.json             Five years of raw financial-statement line items
    commentary.json              Sample management commentary with tagged claims
```

## Why This Shape

- **`src/lib/` has zero React or Next.js imports.** Every function takes plain data in and returns plain data out, which is what makes the 80-test Vitest suite possible without any component-rendering or mocking machinery, and is what guarantees the DCF/forensic/diligence outputs used in server-rendered pages and the interactive client components are computed by the *exact same code path*.
- **Derived values are never stored.** `financials.json` holds only line items a real filing would disclose (Revenue, EBITDA, D&A, CFO, Capex, balance-sheet items). EBIT, margins, CAGR, ratios, DCF outputs, and diligence findings are all computed at request time in `src/lib/`.
- **Client components are the exception, not the default.** Only the interactive DCF workbench and scenario switcher are `"use client"` (they need `useState`/`useMemo` for live recalculation and the NL-parser UI); every other page is a server component that renders once at build time, which keeps the exported bundle small.
- **Static export compatibility drove every framework choice.** No API routes, no server actions, no `next/image` optimization (set to `unoptimized: true`), no cookies/headers/dynamic rendering — everything Next.js needs to statically export cleanly. See `next.config.ts` for the `output: "export"` + `basePath`/`assetPrefix` configuration that makes the exported site work under a GitHub Pages subpath.

## Data Flow Example (DCF page)

1. `src/app/dcf/page.tsx` (server component) reads `getDerivedYears()` from `src/lib/financials.ts`, takes the latest year, and builds a `DcfBase` (base revenue, cash, debt, shares).
2. It renders `<DcfWorkbench base={base} />`, a client component.
3. `DcfWorkbench` holds `DcfAssumptions` in `useState`, and on every change calls `runDcf(base, assumptions)` from `src/lib/dcf.ts` inside a `useMemo` — the entire forecast, discounting, and per-share value recompute synchronously in the browser.
4. The sensitivity grid calls `dcfSensitivityTable`, which just calls `runDcf` again for each WACC × terminal-growth pair — no separate formula.
5. The natural-language box calls `parseAssumptions()` from `src/lib/nlParser.ts` on demand; on "Apply assumptions," the parsed fields are merged into the same `useState` object, triggering the same recalculation path.
