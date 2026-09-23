# LinkedIn Materials

## Project Title

**AI Investment Diligence & Valuation Platform**

## Live Demo / Source

**Live Demo:** https://aastha2806.github.io/ai-investment-diligence-platform/
**Source Code:** https://github.com/Aastha2806/ai-investment-diligence-platform

## Short LinkedIn Description (for the Featured/Projects section)

A zero-cost, fully static investment diligence and DCF valuation web app — interactive FCFF DCF with live sensitivity analysis, forensic accounting screens (Beneish M-Score, Altman Z-Score), a rule-based diligence engine, and a full investment memo. Built with Next.js, TypeScript, and no paid APIs.

## Longer LinkedIn Project Description

I built an end-to-end investment diligence and valuation platform to demonstrate both financial-modeling depth and software-engineering ability, entirely at zero cost.

It walks through a full diligence workflow — Company → Financials → Historical Analysis → Forensic Analysis → DCF Valuation → Scenario Analysis → Diligence → Investment Memo — with every calculated figure (margins, CAGRs, credit ratios, DCF outputs, forensic scores) computed live from the underlying data, not hard-coded.

The centerpiece is a fully interactive FCFF DCF: drag any assumption and the entire forecast, enterprise value, equity value, and implied value per share recalculate instantly, alongside a live WACC × terminal-growth sensitivity table and a deterministic natural-language assumption parser. I also built a forensic accounting layer (Beneish M-Score, Altman Z'-Score) and a rule-based "diligence engine" that auto-generates financial-risk and accounting-flag findings — clearly labeled as deterministic logic, not a language model, since the project runs on zero paid infrastructure.

The whole thing is a statically exported Next.js/TypeScript app, hosted free on GitHub Pages, with 65 automated numerical unit tests covering the calculation engine.

It does not generate investment recommendations — only valuation ranges, scenario outputs, and diligence questions.

**Live Demo:** https://aastha2806.github.io/ai-investment-diligence-platform/
**Source Code:** https://github.com/Aastha2806/ai-investment-diligence-platform

## Resume Bullets

See [RESUME_BULLETS.md](RESUME_BULLETS.md) for role-specific versions (Investment Banking, Private Equity/Private Markets, Hedge Funds/Buy-Side, Equity Research).

---

## Launch Post (a separate, standalone post — not the project-page description above)

This is meant to read like a genuine update from a person, not a startup announcement. It explains what I built, why, what the project actually does, and what I learned — and is explicit that this doesn't replace analysts or investment professionals.

> I spent the last stretch building something I'd been wanting to make for a while: an **AI Investment Diligence & Valuation Platform** — a small, self-contained tool that walks through the kind of workflow I'd expect on the buy-side or in IB: company profile → historical financials → forensic accounting screens → a full DCF → scenario analysis → a diligence write-up → an investment memo.
>
> Why I built it: I wanted a portfolio piece that actually demonstrates financial-modeling literacy, not just a UI wrapped around some hard-coded numbers. So every ratio, CAGR, DCF output, and forensic score on the site is computed live from a small set of underlying financials — nothing is a pasted-in result.
>
> What it does: the DCF is fully interactive (drag an assumption, the whole forecast and valuation recalculate instantly, including a live WACC × terminal-growth sensitivity table). There's a rule-based "diligence engine" that turns financial signals into cited findings and follow-up questions, and forensic screens (Beneish M-Score, Altman Z-Score) that I was careful to frame as *screening indicators*, not verdicts.
>
> What I learned: mostly how much discipline it takes to build something that's honest about its own limitations. I didn't use a paid LLM anywhere — the "AI-assisted" pieces are deterministic rule logic, and I say so explicitly in the app, because I didn't want to imply capability that isn't there. I also learned a lot re-deriving DCF and forensic-accounting math carefully enough to unit test it (65 tests) rather than just eyeballing it.
>
> To be clear: this is a learning/portfolio project, not a production tool, and it doesn't replace real analysts, real data, or real diligence work.
>
> Live demo and source code below — happy to talk through any part of the build.
>
> 🔗 Live demo: https://aastha2806.github.io/ai-investment-diligence-platform/
> 🔗 Source: https://github.com/Aastha2806/ai-investment-diligence-platform
>
> #InvestmentBanking #PrivateEquity #ValuationModeling #FinancialModeling #dcf #softwareengineering
