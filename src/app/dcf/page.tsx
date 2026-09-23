import { getDerivedYears, latestYear } from "@/lib/financials";
import { PageHeader, IllustrativeBanner } from "@/components/PageShell";
import DcfWorkbench from "@/components/DcfWorkbench";

export default function DcfPage() {
  const years = getDerivedYears();
  const latest = latestYear(years);

  const base = {
    baseYear: latest.year,
    baseRevenue: latest.revenue,
    cash: latest.cash,
    debt: latest.totalDebt,
    sharesOutstandingMillions: latest.sharesOutstandingMillions,
  };

  return (
    <div>
      <PageHeader
        eyebrow="DCF"
        title="Interactive FCFF DCF Valuation"
        description="A full free-cash-flow-to-firm discounted cash flow model, built from the FY2025 base year. Every assumption below is editable, and the entire forecast, discounting, and per-share output recalculates live in the browser."
      />
      <IllustrativeBanner />
      <DcfWorkbench base={base} />
    </div>
  );
}
