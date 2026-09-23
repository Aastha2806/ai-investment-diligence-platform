import Link from "next/link";
import { getDerivedYears, getRawStatements, latestYear, revenueCagr, ebitdaCagr } from "@/lib/financials";
import { beneishSeries, altmanZSeries } from "@/lib/forensic";
import { runDcf, dcfSensitivityTable, defaultAssumptions } from "@/lib/dcf";
import { getScenarios } from "@/lib/scenarios";
import { generateDiligenceFindings } from "@/lib/diligence";
import { formatCurrency, formatMillions, formatMultiple, formatPercent } from "@/lib/format";
import companyData from "@/data/company.json";
import { PageHeader, Section, Card, IllustrativeBanner } from "@/components/PageShell";

export default function MemoPage() {
  const raw = getRawStatements();
  const years = getDerivedYears();
  const latest = latestYear(years);
  const first = years[0];
  const beneish = beneishSeries(raw);
  const altman = altmanZSeries(raw);
  const latestAltman = altman[altman.length - 1];
  const latestBeneish = beneish[beneish.length - 1];

  const base = {
    baseYear: latest.year,
    baseRevenue: latest.revenue,
    cash: latest.cash,
    debt: latest.totalDebt,
    sharesOutstandingMillions: latest.sharesOutstandingMillions,
  };
  const dcf = runDcf(base, defaultAssumptions());
  const scenarios = getScenarios().map((s) => ({ ...s, result: runDcf(base, s.assumptions) }));
  const sensitivity = dcfSensitivityTable(base, defaultAssumptions(), [0.08, 0.1, 0.12], [0.02, 0.03, 0.04]);
  const findings = generateDiligenceFindings(years, beneish, altman, sensitivity);

  return (
    <div>
      <PageHeader
        eyebrow="Memo"
        title="Investment Memo"
        description={`${companyData.name} (${companyData.ticker}) — FY${first.year}–FY${latest.year} review and valuation summary.`}
      />
      <IllustrativeBanner />

      <Section title="Executive Summary">
        <Card>
          <p className="text-sm leading-relaxed text-foreground-muted">
            {companyData.name} grew revenue at a {formatPercent(revenueCagr(years))} CAGR and EBITDA at a{" "}
            {formatPercent(ebitdaCagr(years))} CAGR from FY{first.year} to FY{latest.year}, with EBITDA margin
            expanding from {formatPercent(first.ebitdaMargin)} to {formatPercent(latest.ebitdaMargin)}. The base-case
            DCF implies an enterprise value of {formatMillions(dcf.enterpriseValue)} and{" "}
            {formatCurrency(dcf.impliedValuePerShare, { decimals: 2 })} per share; the downside-to-upside scenario
            range is {formatCurrency(scenarios[0].result.impliedValuePerShare, { decimals: 2 })} to{" "}
            {formatCurrency(scenarios[2].result.impliedValuePerShare, { decimals: 2 })} per share. The most recent
            fiscal year shows a moderation in cash conversion alongside a working-capital build, which is the
            primary item flagged for further diligence below. This memo presents valuation outputs and risk
            findings only — it does not make a buy, sell, or hold recommendation.
          </p>
        </Card>
      </Section>

      <Section title="Business Overview">
        <p className="text-sm leading-relaxed text-foreground-muted">{companyData.overview}</p>
      </Section>

      <Section title="Historical Financial Performance">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MiniStat label="Revenue CAGR" value={formatPercent(revenueCagr(years))} />
          <MiniStat label="EBITDA CAGR" value={formatPercent(ebitdaCagr(years))} />
          <MiniStat label={`FY${latest.year} EBITDA Margin`} value={formatPercent(latest.ebitdaMargin)} />
          <MiniStat label="CFO / Net Income (latest)" value={formatMultiple(latest.cfoToNetIncome)} />
        </div>
      </Section>

      <Section title="Accounting / Forensic Review">
        <p className="text-sm leading-relaxed text-foreground-muted">
          The Beneish M-Score for FY{latestBeneish.year} is {latestBeneish.mScore.toFixed(2)}, and the Altman
          Z&apos;-Score is {latestAltman.zScore.toFixed(2)} ({latestAltman.zone} zone). Both are treated as
          screening indicators requiring further investigation, not conclusions. Full component detail is on the{" "}
          <Link href="/forensic" className="underline">Forensic</Link> page.
        </p>
      </Section>

      <Section
        title="DCF Assumptions"
        description="The base-case forward assumptions behind the valuation below — editable interactively on the DCF page."
      >
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full text-sm">
            <tbody>
              {(
                [
                  ["Forecast Period", `${defaultAssumptions().forecastYears} years`],
                  ["Revenue Growth (annual)", formatPercent(defaultAssumptions().revenueGrowth)],
                  ["EBITDA Margin", formatPercent(defaultAssumptions().ebitdaMargin)],
                  ["Tax Rate", formatPercent(defaultAssumptions().taxRate)],
                  ["Capex % of Revenue", formatPercent(defaultAssumptions().capexPctRevenue)],
                  ["WACC", formatPercent(defaultAssumptions().wacc)],
                  ["Terminal Growth", formatPercent(defaultAssumptions().terminalGrowth)],
                ] as [string, string][]
              ).map(([label, value], i) => (
                <tr key={label} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-surface" : "bg-surface-muted"}`}>
                  <td className="px-4 py-2 text-foreground-muted">{label}</td>
                  <td className="px-4 py-2 text-right font-tabular font-medium text-foreground">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Valuation">
        <Card>
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <MemoStat label="Enterprise Value" value={formatMillions(dcf.enterpriseValue)} />
            <MemoStat label="Equity Value" value={formatMillions(dcf.equityValue)} />
            <MemoStat label="Implied Value / Share" value={formatCurrency(dcf.impliedValuePerShare, { decimals: 2 })} />
            <MemoStat label="WACC / Terminal Growth" value={`${formatPercent(defaultAssumptions().wacc)} / ${formatPercent(defaultAssumptions().terminalGrowth)}`} />
          </dl>
        </Card>
      </Section>

      <Section title="Scenario Analysis">
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted text-left">
                <th className="px-4 py-2.5 font-medium text-foreground-muted">Scenario</th>
                <th className="px-4 py-2.5 text-right font-medium text-foreground-muted">Enterprise Value</th>
                <th className="px-4 py-2.5 text-right font-medium text-foreground-muted">Equity Value</th>
                <th className="px-4 py-2.5 text-right font-medium text-foreground-muted">Value / Share</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s) => (
                <tr key={s.name} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 font-medium text-foreground">{s.label}</td>
                  <td className="px-4 py-2 text-right font-tabular">{formatMillions(s.result.enterpriseValue)}</td>
                  <td className="px-4 py-2 text-right font-tabular">{formatMillions(s.result.equityValue)}</td>
                  <td className="px-4 py-2 text-right font-tabular font-semibold">
                    {formatCurrency(s.result.impliedValuePerShare, { decimals: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Key Risks">
        <ul className="list-disc space-y-2 pl-5 text-sm text-foreground-muted">
          {findings
            .filter((f) => f.category === "Financial Risk" || f.category === "Business Risk")
            .map((f) => (
              <li key={f.id}>
                <span className="font-medium text-foreground">{f.finding}</span> — {f.supportingMetric}
              </li>
            ))}
        </ul>
      </Section>

      <Section title="Key Diligence Questions">
        <ul className="list-disc space-y-2 pl-5 text-sm text-foreground-muted">
          {findings.map((f) => (
            <li key={f.id}>{f.suggestedQuestion}</li>
          ))}
        </ul>
      </Section>

      <Section title="Open Questions & Areas for Further Investigation">
        <ul className="list-disc space-y-2 pl-5 text-sm text-foreground-muted">
          <li>Customer concentration and contract-level ARR detail.</li>
          <li>Detailed AR aging schedule behind the DSO / cash-conversion trend.</li>
          <li>Debt covenant terms and maturity schedule.</li>
          <li>Segment-level margin detail behind the consolidated EBITDA margin trend.</li>
        </ul>
      </Section>

      <Section title="Limitations">
        <ul className="list-disc space-y-2 pl-5 text-sm text-foreground-muted">
          <li>All company data is illustrative/fictional, not real filings — see the Methodology page and DATA_SOURCES.md.</li>
          <li>DCF forecast assumptions are held flat across the forecast window rather than ramped year by year.</li>
          <li>Beneish M-Score and Altman Z&apos;-Score are statistical screening indicators, not conclusions or proof of any finding.</li>
          <li>No real market price exists for this illustrative company, so equity value cannot be benchmarked against a trading price.</li>
        </ul>
      </Section>

      <div className="rounded-md border border-border bg-surface-muted px-4 py-3 text-xs text-foreground-muted">
        No buy, sell, hold, or price-target recommendation is made.
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">{label}</p>
      <p className="mt-1 font-tabular text-lg font-semibold text-foreground">{value}</p>
    </Card>
  );
}

function MemoStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-foreground-muted">{label}</dt>
      <dd className="mt-1 font-tabular text-lg font-semibold text-foreground">{value}</dd>
    </div>
  );
}
