import { getDerivedYears, revenueCagr, ebitdaCagr, latestYear } from "@/lib/financials";
import { runDcf, defaultAssumptions } from "@/lib/dcf";
import { getScenarios } from "@/lib/scenarios";
import companyData from "@/data/company.json";
import { formatMillions, formatPercent, formatMultiple, formatCurrency } from "@/lib/format";
import { PageHeader, Section, StatCard, IllustrativeBanner, Card } from "@/components/PageShell";
import DashboardCharts from "@/components/DashboardCharts";

export default function DashboardPage() {
  const years = getDerivedYears();
  const latest = latestYear(years);

  const dcfBase = {
    baseYear: latest.year,
    baseRevenue: latest.revenue,
    cash: latest.cash,
    debt: latest.totalDebt,
    sharesOutstandingMillions: latest.sharesOutstandingMillions,
  };
  const dcf = runDcf(dcfBase, defaultAssumptions());
  const scenarios = getScenarios().map((s) => ({
    ...s,
    result: runDcf(dcfBase, s.assumptions),
  }));

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="Investment Diligence & Valuation"
        description="A working finance workflow connecting financial analysis, forensic screening, valuation, scenario analysis and investment diligence."
      />
      <IllustrativeBanner />

      <Section
        title={`${companyData.name} (${companyData.ticker}) — FY${latest.year} Snapshot`}
        description={`${companyData.sector} · USD millions unless noted`}
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard label="Revenue" value={formatMillions(latest.revenue)} sublabel={`${formatPercent(latest.revenueGrowth)} YoY growth`} />
          <StatCard label="EBITDA" value={formatMillions(latest.ebitda)} sublabel={`${formatPercent(latest.ebitdaMargin)} margin`} />
          <StatCard label="EBIT" value={formatMillions(latest.ebit)} sublabel={`${formatPercent(latest.ebitMargin)} margin`} />
          <StatCard label="Net Income" value={formatMillions(latest.netIncome)} sublabel={`${formatPercent(latest.netMargin)} margin`} />
          <StatCard label="Cash from Operations" value={formatMillions(latest.cfo)} sublabel={`${formatMultiple(latest.cfoToNetIncome)} of net income`} />
          <StatCard label="Capex" value={formatMillions(latest.capex)} sublabel={`${formatPercent(latest.capexToRevenue)} of revenue`} />
          <StatCard
            label="Total Debt"
            value={formatMillions(latest.totalDebt)}
            sublabel={`${formatMultiple(latest.debtToEbitda)} Debt/EBITDA`}
          />
          <StatCard
            label="Cash & Net Debt"
            value={formatMillions(latest.cash)}
            sublabel={latest.netDebt < 0 ? `Net cash of ${formatMillions(Math.abs(latest.netDebt))}` : `Net debt of ${formatMillions(latest.netDebt)}`}
            tone={latest.netDebt < 0 ? "positive" : "neutral"}
          />
        </div>
      </Section>

      <Section
        title="Historical Trends"
        description={`Revenue CAGR ${formatPercent(revenueCagr(years))} · EBITDA CAGR ${formatPercent(ebitdaCagr(years))}, FY${years[0].year}–FY${latest.year}`}
      >
        <DashboardCharts years={years} />
      </Section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="DCF Valuation Summary" description="Base-case assumptions (see DCF page to edit interactively)">
          <Card>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-foreground-muted">Enterprise Value</dt>
                <dd className="font-tabular text-lg font-semibold">{formatMillions(dcf.enterpriseValue)}</dd>
              </div>
              <div>
                <dt className="text-foreground-muted">Equity Value</dt>
                <dd className="font-tabular text-lg font-semibold">{formatMillions(dcf.equityValue)}</dd>
              </div>
              <div>
                <dt className="text-foreground-muted">Implied Value / Share</dt>
                <dd className="font-tabular text-lg font-semibold text-accent-strong">
                  {formatCurrency(dcf.impliedValuePerShare, { decimals: 2 })}
                </dd>
              </div>
              <div>
                <dt className="text-foreground-muted">WACC / Terminal Growth</dt>
                <dd className="font-tabular text-lg font-semibold">
                  {formatPercent(defaultAssumptions().wacc)} / {formatPercent(defaultAssumptions().terminalGrowth)}
                </dd>
              </div>
            </dl>
          </Card>
        </Section>

        <Section title="Scenario Summary" description="Implied value per share across downside / base / upside">
          <Card>
            <ul className="divide-y divide-border">
              {scenarios.map((s) => (
                <li key={s.name} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="font-medium text-foreground">{s.label}</span>
                  <span className="font-tabular text-foreground">
                    {formatCurrency(s.result.impliedValuePerShare, { decimals: 2 })}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </Section>
      </div>
    </div>
  );
}
