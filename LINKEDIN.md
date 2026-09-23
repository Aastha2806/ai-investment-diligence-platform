# LinkedIn Materials

## Context This Was Written Against

Last post: CFA Level I result, June 2026. Nothing posted since. It's now September 2026. The goal
here is **not** to turn this into a content-creator cadence — it's a realistic continuation of a
finance graduate's profile: CFA Level I cleared, quiet for a few months while actually building
something, then an occasional, genuine post when there's something real to say. Targeting
Investment Banking, Private Equity / Private Markets, VC, Hedge Fund / Buy-Side, Equity Research,
and Valuation / Transaction Advisory roles.

## Live Demo / Source

**Live Demo:** https://aastha2806.github.io/ai-investment-diligence-platform/
**Source Code:** https://github.com/Aastha2806/ai-investment-diligence-platform

## Demo Video

`public/screenshots/demo.webm` in the repo (~82s, real screen recording — Dashboard through Methodology, including the DCF's WACC slider actually changing the valuation). Download it and attach it as a **native LinkedIn video upload** on Post 1 — LinkedIn's own player performs far better than a link to a GitHub-hosted file, and native video gets more reach than a link-out post.

---

## Post 1 — The Project (publish now)

> I wanted to see how far I could push some finance concepts into something I actually built, rather than just something I knew on paper.
>
> Over the past few weeks I put together an **Investment Diligence & Valuation** — a small end-to-end tool that walks through the kind of workflow I'd expect to see in diligence or research: company financials → historical analysis → forensic accounting screens → a full FCFF DCF → scenario analysis → a rule-based diligence layer → an investment memo.
>
> A few things I was deliberate about:
> — Every ratio, CAGR, and DCF output is computed live from the underlying financials, not hard-coded.
> — The "deterministic" diligence engine is actually deterministic, rule-based logic — I didn't want to imply a language model is doing anything it isn't. There is no LLM API in the project.
> — The company data is illustrative, not real filings, and I say so clearly throughout.
> — It doesn't generate buy/sell/hold calls or price targets — just valuation ranges, scenario outputs, and diligence questions.
>
> It's a fully static site (Next.js/TypeScript), hosted on GitHub Pages, with no backend or database behind it.
>
> Still very much a graduate project, not a production tool — but it was a genuinely useful way to turn some CFA-level concepts (DCF mechanics, WACC, working-capital analysis) into something I had to actually implement and get right, down to writing tests for the calculations.
>
> Live demo and source code below — happy to hear feedback, especially from anyone who's done this kind of work professionally.
>
> Live demo: https://aastha2806.github.io/ai-investment-diligence-platform/
> GitHub: https://github.com/Aastha2806/ai-investment-diligence-platform

---

## Post 2 — A Lesson From the Build (~1-2 weeks after Post 1)

> Building the DCF piece of that valuation project taught me a few things the CFA curriculum doesn't really make you feel.
>
> The curriculum gives you the FCFF formula and the terminal value formula. It doesn't really make you feel how much the whole valuation leans on that terminal value — in my base case, the terminal value is well over half of enterprise value. Once I built a sensitivity table (WACC × terminal growth) and watched the implied share value swing significantly across a fairly narrow range of "reasonable" assumptions, that stopped being a textbook caveat and became something I had to actually sit with.
>
> Two smaller things stuck with me too:
> — Writing unit tests for the DCF math forced me to be precise about things I'd have handwaved in an exam answer (exactly what "change in NWC" should be relative to, how to handle WACC ≤ terminal growth without the model silently breaking).
> — Deciding not to bolt on a fake AI layer was harder than it sounds. It would've been easy to wrap a chatbot around the outputs. Being upfront that the "diligence engine" is deterministic rules, not a model, felt like the more honest thing to ship.
>
> Small project, but a useful gap between knowing a formula and actually having to implement it end to end.

---

## Post 3 — Forensic Screens & Diligence Questions (~1-2 weeks after Post 2)

> Added a forensic accounting section to that valuation project — Beneish M-Score and Altman Z-Score — and it changed how I think about "diligence" as a concept.
>
> Both are screening models from academic research, not verdicts. Beneish combines eight ratios (receivables growth, gross-margin change, asset quality, accruals, leverage, and a few others) into a score that was correlated with a higher likelihood of earnings manipulation in the original research sample. That's a meaningfully different claim from "this company is manipulating earnings," and I tried to keep that distinction explicit in the UI rather than let a single number imply more certainty than it has.
>
> What I found more useful than the score itself was writing the rule that turns a flagged metric into an actual question — e.g. "cash conversion fell from 1.22x to 1.12x, coinciding with a working-capital build; what's driving the increase in net working capital, and are there any changes in revenue recognition or collections?" That's closer to what real diligence looks like than a single flagged number.
>
> Still a small project on illustrative data, but a good exercise in translating "here's a metric that moved" into "here's the question I'd actually ask."

---

## Future Post Ideas (5-8, use as-needed, not on a fixed schedule)

Each of these should only get written up if/when it's actually true — they're prompts, not a content calendar to force through.

1. **WACC vs. terminal growth in practice** — a deeper, more technical follow-up once there's a concrete example worth walking through (e.g. comparing two hypothetical companies with different risk profiles).
2. **What building finance software with zero paid APIs actually involved** — the constraint-driven design decisions (static export, no backend, no LLM), aimed at a slightly more technical audience.
3. **Scenario analysis vs. point estimates** — why a single DCF number is misleading and how a downside/base/upside framework changes the way you present a valuation.
4. **What I'd change if I rebuilt this from scratch** — an honest retrospective once enough time has passed to have real hindsight (e.g. ramped multi-year assumptions instead of flat ones, real comparable-company data).
5. **Combining finance and software engineering** — a reflective post on what each discipline forces you to get right that the other one doesn't (once there's a second project or real work experience to compare against).
6. **A genuinely meaningful project update** — only if the platform gets a real, substantive addition (e.g. comparable-company analysis, a second illustrative company, real historical multiples) — not a cosmetic tweak.
7. **Notes from any research/internship exposure** — if and when real practical experience happens, a short, specific, non-generic observation from it (not a generic "lessons from my internship" listicle).
8. **Working-capital / cash-conversion-cycle deep dive** — a focused technical post on DSO/DIO/DPO and what the cash conversion cycle actually tells you, prompted by something concrete (a real company's filing, a case study, etc.).

**Explicitly avoid:** "N things every investor should know," market outlook takes, stock picks, "AI will replace analysts" hot takes, or anything that reads as generic finance-influencer content.

## Recommended Cadence

Roughly **one post every 1-2 weeks**, and only when there's something specific and real to say. Skipping a week (or several) with nothing genuine to share is completely normal and expected — better to under-post than to post filler. No fixed schedule; let the actual work set the pace.

## Profile Positioning

A recent finance graduate, CFA Level I, who has gained some practical research exposure and is gradually building serious, well-documented finance/modeling projects — not a content creator, not claiming professional PE/IB/HF experience from this project, not claiming production AI engineering or advanced Excel/SQL beyond what's actually demonstrated.

### Headline

> CFA Level I · Finance × Software | Financial Modeling, Valuation & Diligence | Building practical finance projects

(Alternative, shorter: `CFA Level I | Aspiring IB/PE/Equity Research Analyst | Financial Modeling & Valuation`)

### About Section

> I'm a finance graduate working toward roles in Investment Banking, Private Equity/Private Markets, and Equity Research. I cleared CFA Level I in June 2026 and have been focused since on turning that foundation into practical, hands-on work — most recently an Investment Diligence & Valuation: a self-built tool covering financial statement analysis, forensic accounting screens, FCFF DCF valuation, scenario analysis, and a rule-based diligence workflow, built end to end in TypeScript and documented in detail (including its own limitations).
>
> I'm interested in the mechanics of valuation and diligence — not just the outputs, but understanding exactly how a number was derived and where its assumptions can break. I like building things that are honest about what they are: illustrative data stays labeled as illustrative, a rule-based system doesn't get dressed up as more than it is, and I don't generate outputs (like investment recommendations) that I'm not in a position to stand behind.
>
> Open to conversations about Investment Banking, Private Equity/Private Markets, Venture Capital, Hedge Fund/Buy-Side Research, Equity Research, and Valuation/Transaction Advisory roles.

### Featured Section

Pin, in this order:
1. **Post 1** (the project announcement), once published.
2. **Live demo link** — https://aastha2806.github.io/ai-investment-diligence-platform/ (as a Featured link with a short description: "Interactive investment diligence & DCF valuation platform — live demo").
3. **GitHub repository** — https://github.com/Aastha2806/ai-investment-diligence-platform (as a Featured link: "Source code + full documentation").

## Resume Bullets

See [RESUME_BULLETS.md](RESUME_BULLETS.md) for role-specific versions (Investment Banking, Private Equity/Private Markets, Hedge Funds/Buy-Side, Equity Research).
