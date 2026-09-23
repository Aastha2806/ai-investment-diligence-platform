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
  // Unlevered taxes/NOPAT (EBIT x tax rate), matching the DCF forecast's own methodology —
  // distinct from the levered "Taxes"/"Net Income" shown on the Financials page, which net out
  // actual interest expense. This keeps the Actual column comparable to the forecast columns.
  const unleveredTaxes = latest.ebit * latest.taxRate;
  const historicalContext = {
    revenue: latest.revenue,
    ebitda: latest.ebitda,
    da: latest.da,
    ebit: latest.ebit,
    taxes: unleveredTaxes,
    nopat: latest.ebit - unleveredTaxes,
    capex: latest.capex,
    changeInNwc: latest.changeInNwc,
    fcff: latest.fcff,
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
