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
  const historicalContext = {
    revenue: latest.revenue,
    ebitda: latest.ebitda,
    ebit: latest.ebit,
  };

  return (
    <div>
      <PageHeader
        eyebrow="DCF"
        title="DCF Valuation"
        description={`Build an FCFF valuation from FY${latest.year} and test how assumptions affect implied value.`}
      />
      <IllustrativeBanner />
      <DcfWorkbench base={base} historicalContext={historicalContext} />
    </div>
  );
}
