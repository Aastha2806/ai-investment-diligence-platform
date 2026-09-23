import { getDerivedYears, getRawStatements } from "@/lib/financials";
import { beneishSeries, altmanZSeries } from "@/lib/forensic";
import { checkCommentary } from "@/lib/commentaryCheck";
import { formatPercent, formatMultiple, formatDays } from "@/lib/format";
import { PageHeader, Section, Card, IllustrativeBanner, Pill } from "@/components/PageShell";
import DataTable, { type DataTableRow } from "@/components/DataTable";
import TrendChart from "@/components/TrendChart";

const BENEISH_THRESHOLD = -1.78;

export default function ForensicPage() {
  const raw = getRawStatements();
  const years = getDerivedYears();
  const beneish = beneishSeries(raw);
  const altman = altmanZSeries(raw);
  const commentary = checkCommentary(years);

  const wcColumns = years.map((y) => `FY${y.year}`);
  const wcRows: DataTableRow[] = [
    { label: "DSO (Days Sales Outstanding)", values: years.map((y) => formatDays(y.dso)) },
    { label: "DIO (Days Inventory Outstanding)", values: years.map((y) => formatDays(y.dio)) },
    { label: "DPO (Days Payables Outstanding)", values: years.map((y) => formatDays(y.dpo)) },
    { label: "Cash Conversion Cycle", values: years.map((y) => formatDays(y.cashConversionCycle)), emphasize: true },
  ];

  const beneishColumns = beneish.map((b) => `FY${b.year}`);
  const beneishRows: DataTableRow[] = [
    { label: "DSRI (Receivables growth)", values: beneish.map((b) => b.dsri.toFixed(3)) },
    { label: "GMI (Gross margin index)", values: beneish.map((b) => b.gmi.toFixed(3)) },
    { label: "AQI (Asset quality index)", values: beneish.map((b) => b.aqi.toFixed(3)) },
    { label: "SGI (Sales growth index)", values: beneish.map((b) => b.sgi.toFixed(3)) },
    { label: "DEPI (Depreciation index)", values: beneish.map((b) => b.depi.toFixed(3)) },
    { label: "SGAI (SG&A index)", values: beneish.map((b) => b.sgai.toFixed(3)) },
    { label: "TATA (Total accruals / assets)", values: beneish.map((b) => b.tata.toFixed(4)) },
    { label: "LVGI (Leverage index)", values: beneish.map((b) => b.lvgi.toFixed(3)) },
    { label: "M-Score", values: beneish.map((b) => b.mScore.toFixed(2)), emphasize: true },
  ];

  const altmanColumns = altman.map((a) => `FY${a.year}`);
  const altmanRows: DataTableRow[] = [
    { label: "Working Capital / Total Assets", values: altman.map((a) => formatPercent(a.workingCapitalToAssets)) },
    { label: "Retained Earnings / Total Assets", values: altman.map((a) => formatPercent(a.retainedEarningsToAssets)) },
    { label: "EBIT / Total Assets", values: altman.map((a) => formatPercent(a.ebitToAssets)) },
    { label: "Book Equity / Total Liabilities", values: altman.map((a) => formatMultiple(a.equityToLiabilities)) },
    { label: "Revenue / Total Assets", values: altman.map((a) => formatMultiple(a.salesToAssets)) },
    { label: "Z'-Score", values: altman.map((a) => a.zScore.toFixed(2)), emphasize: true },
    { label: "Zone", values: altman.map((a) => a.zone) },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Forensic"
        title="Forensic & Accounting Analysis"
        description="Cash-quality, working-capital, leverage, and academic screening-model analysis, computed transparently from the underlying financials."
      />
      <IllustrativeBanner />

      <Section
        title="Cash Conversion"
        description="CFO / Net Income indicates whether reported earnings are backed by cash generation."
      >
        <Card>
          <TrendChart
            data={years.map((y) => ({ year: `FY${y.year}`, "CFO / Net Income": y.cfoToNetIncome !== null ? +y.cfoToNetIncome.toFixed(2) : 0 }))}
            lines={[{ key: "CFO / Net Income", color: "#1c3d5a" }]}
            unit="x"
          />
        </Card>
        <p className="mt-3 text-sm text-foreground-muted">
          A ratio consistently above 1.0x indicates operating cash flow has kept pace with or exceeded
          reported net income. A declining ratio, as seen in the most recent year here, indicates cash
          conversion has weakened and coincides with a working-capital build — see below.
        </p>
      </Section>

      <Section
        title="Working Capital"
        description="Days Sales/Inventory/Payables Outstanding and the resulting Cash Conversion Cycle. Inventory is not a meaningful driver for this SaaS business model and is included at zero for completeness."
      >
        <DataTable columns={wcColumns} rows={wcRows} />
      </Section>

      <Section title="Capex vs. D&A" description="Whether capital spending is running ahead of or behind depreciation.">
        <Card>
          <TrendChart
            data={years.map((y) => ({ year: `FY${y.year}`, Capex: Math.round(y.capex), "D&A": Math.round(y.da) }))}
            lines={[
              { key: "Capex", color: "#1c3d5a" },
              { key: "D&A", color: "#9a6a00" },
            ]}
            unit="M"
          />
        </Card>
      </Section>

      <Section title="Leverage" description="Total Debt / EBITDA and Net Debt / EBITDA over time.">
        <Card>
          <TrendChart
            data={years.map((y) => ({
              year: `FY${y.year}`,
              "Debt / EBITDA": y.debtToEbitda !== null ? +y.debtToEbitda.toFixed(2) : 0,
              "Net Debt / EBITDA": y.netDebtToEbitda !== null ? +y.netDebtToEbitda.toFixed(2) : 0,
            }))}
            lines={[
              { key: "Debt / EBITDA", color: "#1c3d5a" },
              { key: "Net Debt / EBITDA", color: "#b3261e" },
            ]}
            unit="x"
          />
        </Card>
      </Section>

      <Section
        title="Beneish M-Score"
        description="An 8-variable screening indicator correlated with a higher likelihood of earnings manipulation in academic backtests. It is a screening indicator requiring further investigation, not proof of fraud."
      >
        <DataTable columns={beneishColumns} rows={beneishRows} />
        <p className="mt-3 text-sm text-foreground-muted">
          Reference threshold: scores above {BENEISH_THRESHOLD} are more commonly associated with
          manipulator profiles in the original research. Treat this strictly as a prompt for further
          diligence on the underlying driver, not a conclusion.
        </p>
      </Section>

      <Section
        title="Altman Z'-Score"
        description="Private-company variant (book value of equity, since this illustrative company has no market price). A bankruptcy-risk screening model, with limitations — see Methodology."
      >
        <DataTable columns={altmanColumns} rows={altmanRows} />
        <div className="mt-3 flex flex-wrap gap-2">
          {altman.map((a) => (
            <Pill key={a.year} tone={a.zone === "Safe" ? "positive" : a.zone === "Grey" ? "watch" : "negative"}>
              FY{a.year}: {a.zone} zone
            </Pill>
          ))}
        </div>
      </Section>

      <Section
        title="Management Commentary vs. Reported Metrics"
        description="Sample management commentary compared against the metrics it describes, using neutral, non-accusatory language."
      >
        <div className="space-y-4">
          {commentary.map((c, i) => (
            <Card key={i}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
                    FY{c.year} · {c.source}
                  </p>
                  <p className="mt-1 text-sm italic text-foreground">&ldquo;{c.quote}&rdquo;</p>
                </div>
                <Pill
                  tone={
                    c.assessment === "supported"
                      ? "positive"
                      : c.assessment === "not supported"
                        ? "negative"
                        : c.assessment === "mixed"
                          ? "watch"
                          : "neutral"
                  }
                >
                  {c.assessment}
                </Pill>
              </div>
              <p className="mt-2 text-sm text-foreground-muted">
                <span className="font-medium text-foreground">Claim checked:</span> {c.claim}
              </p>
              <p className="mt-1 text-sm text-foreground-muted">{c.explanation}</p>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}
