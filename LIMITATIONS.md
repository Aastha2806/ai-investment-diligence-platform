# Limitations

This is an educational/portfolio project. Read this before treating any output as more than illustrative.

## Data

- **All company data is fictional.** Meridian Analytics, Inc. does not exist. Figures are constructed to be internally consistent, not sourced from any real filing. See [DATA_SOURCES.md](DATA_SOURCES.md).
- **No real market data.** There is no share price, so the DCF's "implied value per share" cannot be compared to a trading price, and the Altman Z-Score uses the book-value ("Z'") variant rather than the standard market-value formula.
- **Simplified balance sheet.** The dataset does not separately model accumulated depreciation, inventory (set to zero, appropriate for a SaaS business but not general-purpose), goodwill/intangibles detail, or a full liabilities breakdown. The Beneish M-Score's Asset Quality Index (AQI) and Depreciation Index (DEPI) use gross PP&E as a proxy for net PP&E as a result — see [METHODOLOGY.md](METHODOLOGY.md).
- **Flat share count.** No dilution, buybacks, or issuance is modeled across the historical or forecast period.

## Modeling

- **Flat forecast assumptions.** The DCF applies a single flat revenue-growth rate and a single flat EBITDA margin across the entire forecast window, rather than a year-by-year ramp. This is a deliberate simplification for an interactive, slider-driven UI — a production model would typically ramp assumptions toward a terminal-year target.
- **No mid-year discounting convention.** Cash flows are discounted as if received at year-end, which is standard but understates value slightly relative to a mid-year-convention DCF.
- **Screening models, not verdicts.** The Beneish M-Score and Altman Z-Score are statistical screening tools from academic research with known false-positive rates. This app treats a triggered score strictly as "requires further investigation" and never as evidence of fraud or insolvency risk — see the explicit language throughout the Forensic and Diligence pages.
- **The natural-language parser is intentionally narrow.** It recognizes a fixed set of phrasings via regex, not open-ended language. It will correctly decline to parse anything outside that set rather than guess — see [METHODOLOGY.md](METHODOLOGY.md).
- **The diligence engine's thresholds are illustrative.** Rule thresholds (e.g. "growth deceleration > 1pp", "CFO/NI down > 0.05x") were chosen to be reasonable and to exercise the constructed dataset, not calibrated against a large real-world sample.

## Scope

- **No recommendations.** By design, nothing in this application outputs a buy/sell/hold call, a trading signal, or a price target — only valuation ranges, scenario outputs, and diligence questions.
- **No real-time or live data.** Everything is static, pre-computed from a fixed JSON snapshot at build time (though the DCF and scenario math itself runs live, client-side, on top of that snapshot).
- **Single-company demo.** The platform is not built as a multi-company screener or comparable-company analysis tool.

## Known Technical Quirk

Under static export with the App Router, Next.js's client-side link-prefetching occasionally issues background requests for RSC payload files that don't exist on a static host (harmless 404s visible in the browser console). This does not affect page rendering or navigation — clicking a link falls back to a normal full-page navigation, which was verified to work correctly. See the build-verification notes for how this was tested.

## What Would Change With a Real Budget / Real Team

See the "What would you add if given a budget?" and "What would you change for a real investment team?" questions in [INTERVIEW_PREP.md](INTERVIEW_PREP.md).
