import { PageHeader, Section, Card } from "@/components/PageShell";

export default function MethodologyPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Methodology"
        title="Methodology"
        description="How every number on this site is calculated. Full technical detail also lives in METHODOLOGY.md, DATA_SOURCES.md, and LIMITATIONS.md in the repository."
      />

      <Section title="Deterministic vs. AI-Assisted — What's Actually Running">
        <Card>
          <p className="text-sm leading-relaxed text-foreground">
            <strong>Everything on this site is a deterministic calculation or a plain conditional rule.
            There is no LLM call anywhere in this application</strong> — no OpenAI, Anthropic, Gemini,
            or any other paid or free language model API. Where the UI uses the phrase
            &ldquo;AI-assisted,&rdquo; it specifically means: structured, rule-based reasoning written
            in TypeScript that mimics the *shape* of an analyst&apos;s checklist (condition → finding →
            question), not a model that generates novel text. Two features carry that label:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-foreground-muted">
            <li>
              <strong>The Diligence Engine</strong> (<code>src/lib/diligence.ts</code>) — a fixed list of
              conditional rules (e.g. &ldquo;if YoY revenue growth decelerates by more than 1 percentage
              point, emit a Growth Moderation finding citing the exact percentages&rdquo;) evaluated
              against the calculated metrics.
            </li>
            <li>
              <strong>The Natural-Language Assumption Parser</strong> (<code>src/lib/nlParser.ts</code>) —
              regular-expression matching against a fixed set of recognized phrasings, not open-ended
              language understanding.
            </li>
          </ul>
          <p className="mt-3 text-sm text-foreground-muted">
            Everything else — every margin, ratio, CAGR, DCF output, Beneish/Altman score, and sensitivity
            cell — is a direct mathematical formula with no &ldquo;AI&rdquo; framing at all; formulas are listed below.
          </p>
        </Card>
      </Section>

      <Section title="Data">
        <p className="text-sm leading-relaxed text-foreground-muted">
          Meridian Analytics, Inc. is a fictional company created for this project. Its financial
          statements are illustrative demo data, constructed to be internally consistent (e.g. Revenue
          − COGS − SG&amp;A = EBITDA holds exactly in every year) so that every downstream ratio, growth
          rate, and valuation output is computed rather than hard-coded. No real market or company data
          is used anywhere in this application.
        </p>
      </Section>

      <Section title="Historical Metrics">
        <FormulaList
          items={[
            ["EBIT", "EBITDA − D&A"],
            ["Net Income", "(EBIT − Interest Expense) × (1 − Tax Rate)"],
            ["EBITDA / EBIT / Net Margin", "Line item ÷ Revenue"],
            ["Revenue / EBITDA CAGR", "(Ending ÷ Beginning)^(1 ÷ years) − 1"],
            ["CFO / Net Income", "Cash from Operations ÷ Net Income"],
            ["Net Working Capital", "Current Assets − Current Liabilities"],
            ["Net Debt", "Total Debt − Cash"],
            ["Debt / EBITDA, Net Debt / EBITDA", "Debt or Net Debt ÷ EBITDA"],
          ]}
        />
      </Section>

      <Section title="Working Capital Days">
        <FormulaList
          items={[
            ["DSO", "(Receivables ÷ Revenue) × 365"],
            ["DIO", "(Inventory ÷ COGS) × 365"],
            ["DPO", "(Payables ÷ COGS) × 365"],
            ["Cash Conversion Cycle", "DSO + DIO − DPO"],
          ]}
        />
        <p className="mt-3 text-sm text-foreground-muted">
          Inventory is modeled at zero for this SaaS business, so DIO is 0 by construction and the CCC
          is driven by DSO and DPO.
        </p>
      </Section>

      <Section title="Beneish M-Score (8-variable, 1999 model)">
        <Card>
          <p className="font-tabular text-sm text-foreground">
            M = −4.84 + 0.920·DSRI + 0.528·GMI + 0.404·AQI + 0.892·SGI + 0.115·DEPI − 0.172·SGAI + 4.679·TATA − 0.327·LVGI
          </p>
        </Card>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-foreground-muted">
          <li>DSRI — Days Sales in Receivables Index (receivables/sales, YoY ratio)</li>
          <li>GMI — Gross Margin Index (prior margin ÷ current margin)</li>
          <li>AQI — Asset Quality Index (non-current, non-PP&amp;E asset share, YoY ratio)</li>
          <li>SGI — Sales Growth Index (current ÷ prior revenue)</li>
          <li>DEPI — Depreciation Index (prior depreciation rate ÷ current)</li>
          <li>SGAI — SG&amp;A Index (SG&amp;A/sales, YoY ratio)</li>
          <li>TATA — Total Accruals to Total Assets ((Net Income − CFO) ÷ Total Assets)</li>
          <li>LVGI — Leverage Index ((Current Liabilities + Debt)/Assets, YoY ratio)</li>
        </ul>
        <p className="mt-3 text-sm text-foreground-muted">
          <strong>Limitation:</strong> net PP&amp;E is approximated using the gross PP&amp;E balance because
          accumulated depreciation is not separately modeled in this illustrative dataset. This is a
          simplification appropriate for a screening exercise, not a substitute for full balance-sheet
          detail. The M-Score is a probabilistic screening indicator from academic research — a score
          above the common reference threshold is a prompt for further investigation, never proof of
          earnings manipulation.
        </p>
      </Section>

      <Section title="Altman Z'-Score (private-company variant)">
        <Card>
          <p className="font-tabular text-sm text-foreground">
            Z&apos; = 0.717·(WC/TA) + 0.847·(RE/TA) + 3.107·(EBIT/TA) + 0.420·(BVE/TL) + 0.998·(Sales/TA)
          </p>
        </Card>
        <p className="mt-3 text-sm text-foreground-muted">
          This uses book value of equity (BVE) in place of market capitalization, since this illustrative
          company has no traded share price — the standard adaptation for private or non-public entities.
          Zones: Z&apos; &gt; 2.9 = Safe, 1.23–2.9 = Grey, &lt; 1.23 = Distress. The model was originally
          calibrated on public manufacturers, so results for a software company should be read directionally.
        </p>
      </Section>

      <Section title="FCFF DCF">
        <FormulaList
          items={[
            ["Revenue(t)", "Revenue(t−1) × (1 + Revenue Growth)"],
            ["EBITDA(t)", "Revenue(t) × EBITDA Margin"],
            ["EBIT(t)", "EBITDA(t) − D&A(t), where D&A(t) = Revenue(t) × D&A % of Revenue"],
            ["NOPAT(t)", "EBIT(t) × (1 − Tax Rate)"],
            ["FCFF(t)", "NOPAT(t) + D&A(t) − Capex(t) − ΔNWC(t)"],
            ["PV of FCFF(t)", "FCFF(t) ÷ (1 + WACC)^t"],
            ["Terminal Value", "FCFF(final) × (1 + g) ÷ (WACC − g)"],
            ["Enterprise Value", "Σ PV(FCFF) + PV(Terminal Value)"],
            ["Equity Value", "Enterprise Value − Total Debt + Cash"],
            ["Implied Value / Share", "Equity Value ÷ Diluted Shares Outstanding"],
          ]}
        />
      </Section>

      <Section title="WACC">
        <FormulaList
          items={[
            ["Cost of Equity (CAPM)", "Risk-Free Rate + Beta × Equity Risk Premium"],
            ["WACC", "(E/V) × Cost of Equity + (D/V) × Cost of Debt × (1 − Tax Rate)"],
          ]}
        />
      </Section>

      <Section title="Natural-Language Assumption Parsing">
        <p className="text-sm leading-relaxed text-foreground-muted">
          The natural-language input box on the DCF page uses a deterministic, rule-based parser — plain
          regular expressions matched clause-by-clause against a fixed set of recognized phrasings (e.g.
          &ldquo;revenue grows 12%&rdquo;, &ldquo;WACC is 10%&rdquo;). No language model is called. Number
          words (&ldquo;five years&rdquo;) are normalized to digits before matching. Anything outside the
          recognized patterns is left unparsed and the UI shows &ldquo;Unable to parse this assumption.
          Please enter it manually.&rdquo; rather than guessing.
        </p>
      </Section>

      <Section title="Diligence Engine">
        <p className="text-sm leading-relaxed text-foreground-muted">
          The diligence engine is a set of plain conditional rules over the calculated metrics above — for
          example, flagging when year-over-year revenue growth decelerates by more than one percentage
          point, or when CFO / Net Income falls by more than 0.05x year-over-year. Every finding cites the
          exact metric and values that triggered it. &ldquo;AI-assisted&rdquo; describes the structured,
          rule-based reasoning approach, not a generative model — there is no LLM API call anywhere in
          this application.
        </p>
      </Section>

      <Section title="What This Tool Does Not Do">
        <ul className="list-disc space-y-2 pl-5 text-sm text-foreground-muted">
          <li>It does not call any paid or free LLM API — all logic is deterministic TypeScript.</li>
          <li>It does not generate buy, sell, or hold recommendations, trading signals, or price targets.</li>
          <li>It does not use real market data, real financial statements, or any paid data provider.</li>
          <li>Screening indicators (Beneish, Altman) are not proof of fraud or insolvency risk.</li>
        </ul>
      </Section>
    </div>
  );
}

function FormulaList({ items }: { items: [string, string][] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {items.map(([label, formula], i) => (
        <div
          key={label}
          className={`flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
            i % 2 === 0 ? "bg-surface" : "bg-surface-muted"
          }`}
        >
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="font-tabular text-sm text-foreground-muted">{formula}</span>
        </div>
      ))}
    </div>
  );
}
