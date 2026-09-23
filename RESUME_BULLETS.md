# Resume Bullets

Pick the set that matches the role you're applying for. Each bullet describes functionality that is actually implemented — nothing here overclaims.

## Investment Banking

- Built a full-stack investment diligence platform implementing a Free Cash Flow to Firm DCF with live, interactive assumption sensitivity (WACC × terminal growth) and a three-scenario (downside/base/upside) valuation framework, deployed as a zero-cost static site.
- Designed a five-year financial model (revenue, EBITDA, EBIT, CFO, capex, leverage) with fully derived — not hard-coded — margins, CAGRs, and credit ratios, validated by 65 automated numerical unit tests.
- Implemented an enterprise-value-to-equity-value bridge and per-share valuation output with a transparent, documented formula set (published in-app and in a methodology doc), demonstrating fluency in standard valuation mechanics.

## Private Equity / Private Markets

- Built a deterministic diligence-finding engine that screens historical financials, forensic accounting metrics, and DCF sensitivity to auto-generate financial-risk, accounting-flag, and valuation-sensitivity findings, each citing its supporting metric and a suggested diligence question.
- Implemented forensic accounting screens (Beneish M-Score, Altman Z'-Score) with academically accurate formulas and appropriately cautious "screening indicator, not proof" framing — demonstrating understanding of accounting-quality analysis beyond headline metrics.
- Built a management-commentary-vs.-metrics checker that flags when qualitative claims (e.g. "margin expansion," "stable working capital") diverge from the computed financial trend, using neutral, non-accusatory language.

## Hedge Funds / Buy-Side

- Built an interactive DCF valuation tool with real-time assumption sensitivity and a natural-language assumption parser (deterministic regex-based, no paid LLM), demonstrating both financial-modeling depth and the ability to ship a usable analyst tool.
- Implemented a full working-capital and cash-quality analysis module (DSO/DIO/DPO/Cash Conversion Cycle, CFO/Net Income trend) to surface accrual-quality and liquidity signals independent of headline earnings.
- Shipped the entire platform as a statically exported, zero-infrastructure web app (Next.js/TypeScript, GitHub Pages), demonstrating the ability to build and ship production-quality tooling without relying on paid infrastructure.

## Equity Research

- Built a research-workflow web application covering company profile, five-year historical financial analysis, forensic accounting screens, DCF valuation, scenario analysis, and a structured investment memo, computed end-to-end from a single financial dataset with no hard-coded derived figures.
- Implemented and unit-tested (65 automated tests) a financial calculation engine covering CAGR, margin trends, leverage ratios, working-capital days, Beneish/Altman screening models, and a full FCFF DCF with sensitivity analysis.
- Authored a transparent, publication-quality methodology document explaining every formula and stated limitation, mirroring the documentation standard expected of sell-side/buy-side research output.
