# Methodology

This document mirrors the in-app [Methodology](src/app/methodology/page.tsx) page with full formulas and their implementation locations. All logic lives in `src/lib/` and is unit-tested in `src/lib/__tests__/`.

## Historical Metrics (`src/lib/financials.ts`)

| Metric | Formula |
|---|---|
| EBIT | `EBITDA − D&A` |
| Net Income | `(EBIT − Interest Expense) × (1 − Tax Rate)` |
| EBITDA / EBIT / Net Margin | line item ÷ Revenue |
| Revenue / EBITDA CAGR | `(Ending / Beginning)^(1/years) − 1` |
| CFO / Net Income | Cash from Operations ÷ Net Income |
| Net Working Capital | Current Assets − Current Liabilities |
| Net Debt | Total Debt − Cash |
| Debt / EBITDA, Net Debt / EBITDA | Debt or Net Debt ÷ EBITDA |
| DSO | `(Receivables / Revenue) × 365` |
| DIO | `(Inventory / COGS) × 365` |
| DPO | `(Payables / COGS) × 365` |
| Cash Conversion Cycle | `DSO + DIO − DPO` |

Nothing here is a stored value in the JSON data — every one of these is computed in `deriveYears()` from raw line items (Revenue, COGS, SG&A, EBITDA, D&A, Interest, Tax Rate, CFO, Capex, Cash, Debt, Receivables, Payables, Inventory, Current Assets/Liabilities).

## Beneish M-Score (`src/lib/forensic.ts` → `beneishMScore`)

8-variable, 1999 model:

```
M = −4.84 + 0.920·DSRI + 0.528·GMI + 0.404·AQI + 0.892·SGI
    + 0.115·DEPI − 0.172·SGAI + 4.679·TATA − 0.327·LVGI
```

- **DSRI** — Days Sales in Receivables Index: `(Receivables_t/Sales_t) / (Receivables_t-1/Sales_t-1)`
- **GMI** — Gross Margin Index: `GrossMargin_t-1 / GrossMargin_t`
- **AQI** — Asset Quality Index: share of assets that are neither current nor PP&E, year-over-year ratio
- **SGI** — Sales Growth Index: `Sales_t / Sales_t-1`
- **DEPI** — Depreciation Index: prior depreciation rate ÷ current depreciation rate
- **SGAI** — SG&A Index: `(SGA_t/Sales_t) / (SGA_t-1/Sales_t-1)`
- **TATA** — Total Accruals to Total Assets: `(Net Income_t − CFO_t) / Total Assets_t`
- **LVGI** — Leverage Index: `((CurrentLiab_t+Debt_t)/Assets_t) / ((CurrentLiab_t-1+Debt_t-1)/Assets_t-1)`

**Known simplification:** net PP&E is approximated with the gross PP&E balance because accumulated depreciation is not separately modeled in this illustrative dataset (see [LIMITATIONS.md](LIMITATIONS.md)). The M-Score is treated throughout the app as a **screening indicator requiring further investigation** — never as proof of manipulation. A commonly cited reference threshold (scores above roughly −1.78) is used to trigger a diligence finding, but the finding language never asserts wrongdoing.

## Altman Z'-Score (`src/lib/forensic.ts` → `altmanZPrime`)

Private-company variant (uses book value of equity rather than market capitalization, since this illustrative company has no traded share price):

```
Z' = 0.717·(WC/TA) + 0.847·(RE/TA) + 3.107·(EBIT/TA) + 0.420·(BVE/TL) + 0.998·(Sales/TA)
```

Zones: `Z' > 2.9` = Safe, `1.23–2.9` = Grey, `< 1.23` = Distress. Originally calibrated on public manufacturers — results for a software company should be read directionally, not literally.

## WACC (`src/lib/wacc.ts`)

```
Cost of Equity (CAPM) = Risk-Free Rate + Beta × Equity Risk Premium
WACC = (E/V)·CostOfEquity + (D/V)·CostOfDebt·(1 − TaxRate)
```

## FCFF DCF (`src/lib/dcf.ts` → `runDcf`)

For each forecast year `t`:

```
Revenue(t)   = Revenue(t-1) × (1 + RevenueGrowth)
EBITDA(t)    = Revenue(t) × EBITDA Margin
D&A(t)       = Revenue(t) × D&A % of Revenue
EBIT(t)      = EBITDA(t) − D&A(t)
Taxes(t)     = EBIT(t) × Tax Rate
NOPAT(t)     = EBIT(t) − Taxes(t)
Capex(t)     = Revenue(t) × Capex % of Revenue
ΔNWC(t)      = (Revenue(t) − Revenue(t-1)) × NWC % of Revenue
FCFF(t)      = NOPAT(t) + D&A(t) − Capex(t) − ΔNWC(t)
DiscountFactor(t) = 1 / (1 + WACC)^t
PV[FCFF(t)]  = FCFF(t) × DiscountFactor(t)

TerminalValue     = FCFF(final) × (1 + g) / (WACC − g)
PV[TerminalValue] = TerminalValue × DiscountFactor(final)

EnterpriseValue = Σ PV[FCFF] + PV[TerminalValue]
EquityValue     = EnterpriseValue − TotalDebt + Cash
ValuePerShare   = EquityValue / SharesOutstanding
```

The sensitivity table (`dcfSensitivityTable`) reruns the exact same `runDcf` function across a WACC × terminal-growth grid — there is no separate/approximated sensitivity formula.

## Scenarios (`src/lib/scenarios.ts`)

Three named `DcfAssumptions` sets (downside / base / upside) run through the identical `runDcf` engine. No scenario is flagged as more likely or "correct" in the UI or code.

## Natural-Language Assumption Parsing (`src/lib/nlParser.ts`)

Deterministic only. The input text is lower-cased, number words are normalized to digits, then split into clauses on commas/periods/" and " so that a keyword in one clause never picks up a percentage from a neighboring clause. Each clause is tested against a fixed set of keyword regexes (revenue growth, EBITDA margin, tax rate, capex, NWC, WACC, terminal growth, forecast years); the first percentage found in a matching clause is used. No LLM is called. Text with no recognized pattern returns an empty result and the UI shows "Unable to parse this assumption. Please enter it manually."

## Diligence Engine (`src/lib/diligence.ts`)

A list of independent, plain conditional rules evaluated against the derived years, Beneish series, Altman series, DCF sensitivity grid, and the commentary-check results (`src/lib/commentaryCheck.ts`). Each rule that fires produces a `DiligenceFinding` with: the finding statement, the exact supporting metric values, why it matters, context/caveats, a suggested diligence question, and a severity. Rules implemented:

- Growth moderation (YoY revenue growth deceleration > 1pp)
- Cash conversion weakened (CFO/NI down > 0.05x YoY)
- Leverage increased (Net Debt/EBITDA up > 0.1x YoY)
- Beneish M-Score above the reference threshold
- Altman Z'-Score outside the "Safe" zone
- Rising capex intensity (Capex/Revenue up > 0.2pp YoY)
- Wide DCF valuation sensitivity (>60% spread across the WACC × TGR grid)
- Management commentary claims not supported by the reported metrics

## Management Commentary Check (`src/lib/commentaryCheck.ts`)

Each sample commentary quote (`src/data/commentary.json`) is tagged with structured `claims` (e.g. `margin_expansion`, `healthy_cash_conversion`). Each claim has a dedicated evaluator function that compares the claim to the actual computed metrics for that year and returns `supported`, `not supported`, `mixed`, or `not evaluable`, with a plain-language explanation — always in neutral, non-accusatory language.

## AI Limitations

To be explicit: the diligence engine and the natural-language parser are the only two features that use the phrase "AI-assisted" in the app, and both are fixed, auditable rule sets, not learned or generative models. That means:

- They cannot handle inputs outside their coded patterns — the parser reports "unable to parse" rather than guessing, and the diligence engine will simply not fire a rule it wasn't written for (it does not infer novel risks).
- Rule thresholds (e.g. "growth deceleration > 1pp") are illustrative judgment calls, not calibrated against a large historical dataset.
- Nothing here should be read as a claim that the system "understands" the business the way an analyst does — it recognizes patterns in numbers and phrasing that were explicitly coded for.
