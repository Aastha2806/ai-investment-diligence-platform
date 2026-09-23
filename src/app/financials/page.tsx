import { getDerivedYears } from "@/lib/financials";
import { formatMillions, formatPercent, formatMultiple } from "@/lib/format";
import { PageHeader, Section, IllustrativeBanner } from "@/components/PageShell";
import DataTable, { type DataTableRow } from "@/components/DataTable";

export default function FinancialsPage() {
  const years = getDerivedYears();
  const columns = years.map((y) => `FY${y.year}`);

  const incomeStatementRows: DataTableRow[] = [
    { label: "Revenue", values: years.map((y) => formatMillions(y.revenue)), emphasize: true },
    { label: "COGS", values: years.map((y) => formatMillions(y.cogs)), indent: true },
    { label: "Gross Profit", values: years.map((y) => formatMillions(y.grossProfit)), emphasize: true },
    { label: "SG&A", values: years.map((y) => formatMillions(y.sgaExpense)), indent: true },
    { label: "EBITDA", values: years.map((y) => formatMillions(y.ebitda)), emphasize: true },
    { label: "D&A", values: years.map((y) => formatMillions(y.da)), indent: true },
    { label: "EBIT", values: years.map((y) => formatMillions(y.ebit)), emphasize: true },
    { label: "Interest Expense", values: years.map((y) => formatMillions(y.interestExpense)), indent: true },
    { label: "EBT", values: years.map((y) => formatMillions(y.ebt)), emphasize: true },
    { label: "Taxes", values: years.map((y) => formatMillions(y.taxes)), indent: true },
    { label: "Net Income", values: years.map((y) => formatMillions(y.netIncome)), emphasize: true },
  ];

  const cashFlowRows: DataTableRow[] = [
    { label: "Cash from Operations (CFO)", values: years.map((y) => formatMillions(y.cfo)) },
    { label: "Capex", values: years.map((y) => formatMillions(y.capex)) },
    { label: "D&A", values: years.map((y) => formatMillions(y.da)) },
    { label: "Change in NWC", values: years.map((y) => (y.changeInNwc !== null ? formatMillions(y.changeInNwc) : "—")) },
    { label: "Unlevered FCFF", values: years.map((y) => (y.fcff !== null ? formatMillions(y.fcff) : "—")), emphasize: true },
  ];

  const balanceSheetRows: DataTableRow[] = [
    { label: "Cash", values: years.map((y) => formatMillions(y.cash)) },
    { label: "Accounts Receivable", values: years.map((y) => formatMillions(y.receivables)) },
    { label: "Inventory", values: years.map((y) => formatMillions(y.inventory)) },
    { label: "Total Assets", values: years.map((y) => formatMillions(y.totalAssets)), emphasize: true },
    { label: "Accounts Payable", values: years.map((y) => formatMillions(y.payables)) },
    { label: "Total Debt", values: years.map((y) => formatMillions(y.totalDebt)) },
    { label: "Total Liabilities", values: years.map((y) => formatMillions(y.totalLiabilities)), emphasize: true },
    { label: "Equity", values: years.map((y) => formatMillions(y.equity)), emphasize: true },
    { label: "Net Working Capital", values: years.map((y) => formatMillions(y.netWorkingCapital)) },
  ];

  const growthRows: DataTableRow[] = [
    { label: "Revenue YoY Growth", values: years.slice(1).map((y) => formatPercent(y.revenueGrowth)) },
    { label: "EBITDA YoY Growth", values: years.slice(1).map((y) => formatPercent(y.ebitdaGrowth)) },
  ];

  const marginRows: DataTableRow[] = [
    { label: "Gross Margin", values: years.map((y) => formatPercent(y.grossMargin)) },
    { label: "EBITDA Margin", values: years.map((y) => formatPercent(y.ebitdaMargin)) },
    { label: "EBIT Margin", values: years.map((y) => formatPercent(y.ebitMargin)) },
    { label: "Net Margin", values: years.map((y) => formatPercent(y.netMargin)) },
    { label: "Capex / Revenue", values: years.map((y) => formatPercent(y.capexToRevenue)) },
    { label: "Capex / D&A", values: years.map((y) => formatMultiple(y.capexToDA)) },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Financials"
        title="Financial Statements"
        description="Five-year statement history, cash flow, and balance sheet."
      />
      <IllustrativeBanner />

      <Section title="Income Statement" description="USD millions">
        <DataTable columns={columns} rows={incomeStatementRows} />
      </Section>

      <Section title="Cash Flow" description="USD millions">
        <DataTable columns={columns} rows={cashFlowRows} />
      </Section>

      <Section title="Balance Sheet" description="USD millions">
        <DataTable columns={columns} rows={balanceSheetRows} />
      </Section>

      <Section title="Year-over-Year Growth">
        <DataTable columns={columns.slice(1)} rows={growthRows} />
      </Section>

      <Section title="Margins & Capital Intensity">
        <DataTable columns={columns} rows={marginRows} />
      </Section>
    </div>
  );
}
