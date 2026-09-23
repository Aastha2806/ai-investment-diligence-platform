import { getDerivedYears, revenueCagr, ebitdaCagr } from "@/lib/financials";
import { formatPercent, formatMultiple } from "@/lib/format";
import { PageHeader, Section, StatCard, Card, IllustrativeBanner } from "@/components/PageShell";
import DataTable, { type DataTableRow } from "@/components/DataTable";
import TrendChart from "@/components/TrendChart";

export default function AnalysisPage() {
  const years = getDerivedYears();
  const columns = years.slice(1).map((y) => `FY${y.year}`);
  const latest = years[years.length - 1];
  const first = years[0];
  const marginChange = latest.ebitdaMargin - first.ebitdaMargin;

  const rows: DataTableRow[] = [
    { label: "Revenue Growth", values: years.slice(1).map((y) => formatPercent(y.revenueGrowth)) },
    { label: "EBITDA Growth", values: years.slice(1).map((y) => formatPercent(y.ebitdaGrowth)) },
    { label: "EBITDA Margin", values: years.slice(1).map((y) => formatPercent(y.ebitdaMargin)) },
    { label: "EBIT Margin", values: years.slice(1).map((y) => formatPercent(y.ebitMargin)) },
    { label: "Net Margin", values: years.slice(1).map((y) => formatPercent(y.netMargin)) },
    { label: "CFO / Net Income", values: years.slice(1).map((y) => formatMultiple(y.cfoToNetIncome)) },
    { label: "Capex / Revenue", values: years.slice(1).map((y) => formatPercent(y.capexToRevenue)) },
    { label: "Capex / D&A", values: years.slice(1).map((y) => formatMultiple(y.capexToDA)) },
    { label: "Cash Conversion Cycle (days)", values: years.slice(1).map((y) => y.cashConversionCycle.toFixed(1)) },
    { label: "Total Debt / EBITDA", values: years.slice(1).map((y) => formatMultiple(y.debtToEbitda)) },
    { label: "Net Debt / EBITDA", values: years.slice(1).map((y) => formatMultiple(y.netDebtToEbitda)) },
    { label: "Net Working Capital ($M)", values: years.slice(1).map((y) => y.netWorkingCapital.toFixed(1)) },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Analysis"
        title="Historical Financial Analysis"
        description={`Growth, margin, and leverage trends, FY${first.year}–FY${latest.year}.`}
      />
      <IllustrativeBanner />

      <Section title="Headline Trend Metrics">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Revenue CAGR" value={formatPercent(revenueCagr(years))} sublabel={`FY${first.year}–FY${latest.year}`} />
          <StatCard label="EBITDA CAGR" value={formatPercent(ebitdaCagr(years))} sublabel={`FY${first.year}–FY${latest.year}`} />
          <StatCard
            label="EBITDA Margin Change"
            value={`${marginChange >= 0 ? "+" : ""}${(marginChange * 100).toFixed(1)}pp`}
            sublabel={`${formatPercent(first.ebitdaMargin)} → ${formatPercent(latest.ebitdaMargin)}`}
            tone={marginChange >= 0 ? "positive" : "negative"}
          />
          <StatCard
            label="Net Debt / EBITDA"
            value={formatMultiple(latest.netDebtToEbitda)}
            sublabel={latest.netDebt < 0 ? "Net cash position" : "Net debt position"}
            tone={latest.netDebt < 0 ? "positive" : "neutral"}
          />
        </div>
      </Section>

      <Section title="Growth & Margin Trends">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground-muted">
              Revenue &amp; EBITDA Growth (%)
            </p>
            <TrendChart
              data={years.slice(1).map((y) => ({
                year: `FY${y.year}`,
                "Revenue Growth": y.revenueGrowth !== null ? +(y.revenueGrowth * 100).toFixed(1) : 0,
                "EBITDA Growth": y.ebitdaGrowth !== null ? +(y.ebitdaGrowth * 100).toFixed(1) : 0,
              }))}
              lines={[
                { key: "Revenue Growth", color: "#1c3d5a" },
                { key: "EBITDA Growth", color: "#1a7a4c" },
              ]}
              unit="%"
            />
          </Card>
          <Card>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground-muted">
              Leverage (Net Debt / EBITDA, x)
            </p>
            <TrendChart
              data={years.map((y) => ({
                year: `FY${y.year}`,
                "Net Debt / EBITDA": y.netDebtToEbitda !== null ? +y.netDebtToEbitda.toFixed(2) : 0,
              }))}
              lines={[{ key: "Net Debt / EBITDA", color: "#b3261e" }]}
              unit="x"
            />
          </Card>
        </div>
      </Section>

      <Section title="Margins & Cash Quality">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground-muted">
              EBITDA / EBIT / Net Margin (%)
            </p>
            <TrendChart
              data={years.map((y) => ({
                year: `FY${y.year}`,
                "EBITDA Margin": +(y.ebitdaMargin * 100).toFixed(1),
                "EBIT Margin": +(y.ebitMargin * 100).toFixed(1),
                "Net Margin": +(y.netMargin * 100).toFixed(1),
              }))}
              lines={[
                { key: "EBITDA Margin", color: "#1c3d5a" },
                { key: "EBIT Margin", color: "#7896ab" },
                { key: "Net Margin", color: "#1a7a4c" },
              ]}
              unit="%"
            />
          </Card>
          <Card>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground-muted">
              CFO vs. Net Income ($M)
            </p>
            <TrendChart
              data={years.map((y) => ({
                year: `FY${y.year}`,
                CFO: Math.round(y.cfo),
                "Net Income": Math.round(y.netIncome),
              }))}
              lines={[
                { key: "CFO", color: "#1c3d5a" },
                { key: "Net Income", color: "#9a6a00" },
              ]}
              unit="M"
            />
          </Card>
        </div>
      </Section>

      <Section title="Capital Intensity & Working Capital">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground-muted">
              Capex vs. D&amp;A ($M)
            </p>
            <TrendChart
              data={years.map((y) => ({ year: `FY${y.year}`, Capex: Math.round(y.capex), "D&A": Math.round(y.da) }))}
              lines={[
                { key: "Capex", color: "#1c3d5a" },
                { key: "D&A", color: "#9a6a00" },
              ]}
              unit="M"
            />
          </Card>
          <Card>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground-muted">
              Cash Conversion Cycle (days)
            </p>
            <TrendChart
              data={years.map((y) => ({ year: `FY${y.year}`, CCC: +y.cashConversionCycle.toFixed(1) }))}
              lines={[{ key: "CCC", color: "#b3261e" }]}
              unit=" d"
            />
          </Card>
        </div>
      </Section>

      <Section title="Full Ratio Table">
        <DataTable columns={columns} rows={rows} />
      </Section>
    </div>
  );
}
