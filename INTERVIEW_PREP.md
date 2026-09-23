# Interview Preparation

Straightforward, technically accurate answers appropriate for a recent graduate discussing a self-built portfolio project.

**Why did you build this?**
I wanted a portfolio piece that demonstrated real financial-modeling literacy — DCF, forensic accounting, ratio analysis — alongside real software engineering, without spending anything on APIs or hosting. Most student finance projects are Excel-only or a thin UI over hard-coded numbers; I wanted every number to actually be computed, and to be transparent about what's real (the math) versus illustrative (the company data).

**How does the DCF work?**
It's a standard Free Cash Flow to Firm (FCFF) model. For each forecast year I grow revenue at a flat assumed rate, apply an assumed EBITDA margin, subtract D&A-derived EBIT and taxes to get NOPAT, then add back D&A and subtract capex and the change in net working capital to get FCFF. Each year's FCFF is discounted at the WACC, the years are summed, a Gordon Growth terminal value is added (discounted back too), and I bridge from enterprise value to equity value by subtracting debt and adding cash, then divide by shares outstanding.

**What is FCFF?**
Free Cash Flow to the Firm — the cash available to all capital providers (debt and equity) after operating expenses, taxes, and reinvestment (capex and working-capital changes), before any financing cash flows. It's what you discount at WACC to get enterprise value, as opposed to FCFE (levered free cash flow), which you'd discount at the cost of equity to get equity value directly.

**How did you calculate WACC?**
`WACC = (E/V)×CostOfEquity + (D/V)×CostOfDebt×(1−TaxRate)`, with cost of equity from CAPM (`risk-free rate + beta × equity risk premium`). In this project WACC is a direct slider input on the DCF page for interactivity, but the underlying formula is implemented in `src/lib/wacc.ts` and unit-tested.

**How does terminal value work?**
It captures the value of all cash flows beyond the explicit forecast period, using the Gordon Growth (perpetuity growth) formula: `TerminalValue = FCFF(final year) × (1+g) / (WACC − g)`, then discounted back to present value at the same rate as the final forecast year. In this model, the terminal value is typically the majority of enterprise value — which is realistic and something I make visible, not something I hide.

**Why use sensitivity analysis?**
A single-point DCF output implies false precision — small changes in WACC or terminal growth swing the valuation substantially, especially because terminal value dominates. The WACC × terminal-growth grid makes that sensitivity visible instead of presenting one number as if it were certain. My diligence engine also automatically flags when the sensitivity spread is wide.

**How do scenarios work?**
Three independent sets of DCF assumptions (downside/base/upside) run through the identical DCF function — there's no separate "scenario logic," just different inputs to the same engine, which is the right way to build this: one tested code path, many assumption sets.

**What is CFO conversion?**
Cash from Operations divided by Net Income. A ratio consistently near or above 1.0x suggests reported earnings are backed by actual cash generation; a declining ratio can indicate a working-capital build, revenue-recognition timing issues, or other accrual-quality concerns worth investigating.

**What does DSO/DIO/DPO tell you?**
Days Sales Outstanding (how long it takes to collect receivables), Days Inventory Outstanding (how long inventory sits before use/sale), and Days Payables Outstanding (how long the company takes to pay suppliers). Together as the Cash Conversion Cycle (`DSO+DIO−DPO`) they show how many days of cash are tied up in the operating cycle — a rising CCC is a real working-capital risk to watch.

**What is the Beneish M-Score?**
An 8-variable academic model (Beneish, 1999) that combines ratios like receivables growth, gross margin change, asset quality, and accruals into a single score correlated with a higher likelihood of earnings manipulation in the original research sample. I'm careful in the UI to call it a "screening indicator requiring further investigation," not evidence of fraud — that's a real methodological limitation of the model, not just a legal disclaimer.

**What is Altman Z?**
A bankruptcy-risk score combining working capital, retained earnings, EBIT, equity, and sales, each scaled by total assets. I used the "Z'" private-company variant (book equity instead of market cap) since this illustrative company has no share price. I'm upfront that it was calibrated on manufacturers, so it's directional for a software company, not a precise probability.

**Why did you not use a paid LLM?**
The brief I set for myself was a genuinely zero-cost, static, GitHub-Pages-hostable project. A paid LLM API would break that (cost, and it would also require a backend to hide the API key, which breaks the "static export" architecture). Instead I built the "AI-assisted" pieces — the diligence engine and natural-language parser — as deterministic rule logic, and I say so explicitly in the UI rather than implying an LLM is involved.

**How does your natural-language parser work?**
Plain regular expressions, not an LLM. I split the input into clauses on punctuation and "and," normalize number words to digits, then check each clause against a fixed set of keyword patterns (revenue growth, EBITDA margin, WACC, etc.) and extract the nearest percentage in that clause. Splitting into clauses first was actually a bug fix — my first version let a keyword in one clause accidentally grab a percentage from a neighboring clause, which the unit tests caught.

**Why is the application static?**
So it can be hosted for free on GitHub Pages with zero backend, zero database, and zero ongoing cost or maintenance. Every calculation that would normally hit a server (DCF, forensic scores, diligence rules) runs as pure client-side TypeScript instead.

**Why GitHub Pages?**
Free static hosting tied directly to the GitHub repo, which keeps the "LinkedIn → Live Demo" and "LinkedIn → GitHub → Source" flows both pointing at the same place, with no separate hosting account to manage.

**What are the limitations?**
See [LIMITATIONS.md](LIMITATIONS.md) in full — the short version: illustrative (not real) company data, a simplified balance sheet behind the Beneish inputs, flat (not ramped) DCF forecast assumptions, and screening models (Beneish/Altman) that are statistical indicators, not verdicts.

**What would you add if given a budget?**
Real company financials sourced from actual filings (with full citations), a real market price to run a standard (not book-value) Altman Z-Score and compare DCF output to trading value, comparable-company analysis, and possibly a real LLM integration for the natural-language layer — clearly labeled as such, with the deterministic parser kept as a fallback.

**What would you change for a real investment team?**
Move from flat DCF assumptions to a proper multi-year ramp, add scenario-weighted (probability-weighted) valuation output, add sensitivity to more than two variables, pull in real historical multiples for a comparable-companies cross-check, and add source citations/audit trail for every input number — which real diligence work requires and a portfolio demo can skip.
