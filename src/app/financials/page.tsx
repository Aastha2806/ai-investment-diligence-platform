import { getDerivedYears } from "@/lib/financials";
import { formatMillions, formatPercent } from "@/lib/format";
import { PageHeader, Section, IllustrativeBanner } from "@/components/PageShell";
import DataTable, { type DataTableRow } from "@/components/DataTable";

export default function FinancialsPage() {
  const years = getDerivedYears();
  const columns = years.map((y) => `FY${y.year}`);

  const statementRows: DataTableRow[] = [
    { label: "Revenue", values: years.map((y) => formatMillions(y.revenue)), emphasize: true },
    { label: "EBITDA", values: years.map((y) => formatMillions(y.ebitda)) },
    { label: "D&A", values: years.map((y) => formatMillions(y.da)) },
    { label: "EBIT", values: years.map((y) => formatMillions(y.ebit)), emphasize: true },
    { label: "Interest Expense", values: years.map((y) => formatMillions(y.interestExpense)) },
    { label: "Net Income", values: years.map((y) => formatMillions(y.netIncome)), emphasize: true },
    { label: "Cash from Operations (CFO)", values: years.map((y) => formatMillions(y.cfo)) },
    { label: "Capex", values: years.map((y) => formatMillions(y.capex)) },
    { label: "Total Debt", values: years.map((y) => formatMillions(y.totalDebt)) },
    { label: "Cash", values: years.map((y) => formatMillions(y.cash)) },
    { label: "Net Working Capital", values: years.map((y) => formatMillions(y.netWorkingCapital)) },
  ];

  const growthRows: DataTableRow[] = [
    { label: "Revenue YoY Growth", values: years.map((y) => formatPercent(y.revenueGrowth)) },
    { label: "EBITDA YoY Growth", values: years.map((y) => formatPercent(y.ebitdaGrowth)) },
  ];

  const marginRows: DataTableRow[] = [
    { label: "EBITDA Margin", values: years.map((y) => formatPercent(y.ebitdaMargin)) },
    { label: "EBIT Margin", values: years.map((y) => formatPercent(y.ebitMargin)) },
    { label: "Net Margin", values: years.map((y) => formatPercent(y.netMargin)) },
    { label: "Capex / Revenue", values: years.map((y) => formatPercent(y.capexToRevenue)) },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Financials"
        title="Financial Statements"
        description="Five-year statement history, growth, and margins."
      />
      <IllustrativeBanner />

      <Section title="Annual Financial Statement" description="USD millions">
        <DataTable columns={columns} rows={statementRows} />
      </Section>

      <Section title="Year-over-Year Growth">
        <DataTable columns={columns.slice(1)} rows={growthRows.map((r) => ({ ...r, values: r.values.slice(1) }))} />
      </Section>

      <Section title="Margins & Capital Intensity">
        <DataTable columns={columns} rows={marginRows} />
      </Section>
    </div>
  );
}
