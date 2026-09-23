# Data Sources

## Summary

This project uses **illustrative, fictional company data**, not real filings. This was a deliberate choice, not a shortcut:

- It guarantees zero risk of misrepresenting a real company's actual financials as something they are not (this project computes forensic "red flag" scores and diligence findings, which would be inappropriate to run against a real company's real numbers in a portfolio demo without their filings' full context).
- It lets the dataset be constructed to be **exactly internally consistent** (e.g. `Revenue − COGS − SG&A = EBITDA` holds precisely in every year — see the `dataset integrity` tests in `src/lib/__tests__/financials.test.ts`), so every ratio, CAGR, and DCF output in the app is a genuine computed result rather than a number that happens to look right.
- It allows the story in the data (a deceleration in growth, a working-capital build, a commentary claim that doesn't hold up) to be constructed on purpose, so the Forensic and Diligence pages have something real to demonstrate.

**If you want to point this platform at a real company**, replace the three files in `src/data/` (`company.json`, `financials.json`, `commentary.json`) with real data sourced from that company's 10-K/10-Q filings (or local-market equivalent) — every calculation in `src/lib/` operates on the same schema regardless of whether the underlying numbers are real or illustrative, so no application code needs to change.

## The Company

**Meridian Analytics, Inc. (MRDN)** — a fictional B2B SaaS / vertical-analytics company, headquartered in Austin, TX, with FY2021–FY2025 financials. It does not correspond to any real company, living or defunct. See `company.json` → `dataDisclaimer` for the same statement embedded in the data itself.

## Construction Method

All figures in `src/data/financials.json` were built from a small set of driving assumptions applied consistently across five fiscal years:

- **Revenue**: starts at $420.0M in FY2021, grows in a realistic decelerating-then-mature SaaS growth pattern to $761.0M in FY2025 (17.9%, 13.1%, 17.9%, 15.3% YoY), with growth intentionally moderating in the final year.
- **Cost structure**: COGS fixed at 40% of revenue (60% gross margin, typical for enterprise SaaS); SG&A set as the residual needed to produce a steadily improving EBITDA margin (18% → 25.5%), reflecting operating leverage.
- **D&A, interest, tax**: D&A and interest expense scale down modestly as revenue scales up; a flat 25% tax rate is applied throughout.
- **Capex, cash, debt**: Capex set around 5–6% of revenue with an intentional uptick in FY2025; debt amortizes from $180M to $145M; cash accumulates from retained cash flow.
- **Working capital**: Receivables (DSO ≈ 45–46 days), payables (DPO ≈ 40 days), and a deliberate FY2025 net-working-capital build used to demonstrate the cash-conversion/forensic findings on the Forensic and Diligence pages.
- **Balance sheet (for Beneish/Altman inputs)**: total assets, current assets/liabilities, gross PP&E, and retained earnings were set directly to produce a coherent, if simplified, balance sheet — see [LIMITATIONS.md](LIMITATIONS.md) for what is and isn't modeled (e.g. no separate accumulated depreciation).
- **Shares outstanding**: held flat at 42.0 million across all years for simplicity (no buybacks or issuance modeled).

## Management Commentary (`src/data/commentary.json`)

Sample shareholder-letter-style quotes were authored specifically for this project to sound like typical earnings-call language, tagged with structured `claims` (e.g. `margin_expansion`, `healthy_cash_conversion`). They are not quoted from any real company's filings. The FY2025 quote intentionally claims "no notable change in working-capital dynamics" even though the underlying FY2025 data shows a working-capital build — this is by design, to give the commentary-check feature (`src/lib/commentaryCheck.ts`) and the Diligence page something genuine to flag.

## Transformation Log

| Field | Source | Transformation |
|---|---|---|
| Revenue, EBITDA, D&A, Interest, Tax Rate | Constructed | Direct inputs |
| COGS, SG&A | Constructed | `COGS = 0.40 × Revenue`; `SGA = 0.60 × Revenue − EBITDA` (residual, to hit target EBITDA margin) |
| EBIT, Net Income | Computed in `src/lib/financials.ts` | `EBIT = EBITDA − D&A`; `NetIncome = (EBIT − Interest) × (1 − TaxRate)` |
| Receivables, Payables | Constructed | `Receivables ≈ Revenue × 45/365`; `Payables ≈ COGS × 40/365` |
| DSO, DPO, CCC | Computed in `src/lib/financials.ts` | See [METHODOLOGY.md](METHODOLOGY.md) |

## If You Use Real Data Instead

Cite, for each figure: the exact source document (e.g. "FY2024 Form 10-K, Item 8, Consolidated Statement of Operations"), the filing date, and any unit/currency conversion applied. Keep the same JSON schema in `src/data/financials.json` so the calculation engine in `src/lib/` works unmodified.
