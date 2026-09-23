import { getDerivedYears, latestYear } from "@/lib/financials";
import { PageHeader, IllustrativeBanner } from "@/components/PageShell";
import ScenarioSwitcher from "@/components/ScenarioSwitcher";

export default function ScenariosPage() {
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
        eyebrow="Scenarios"
        title="Scenario Analysis"
        description="Downside, base, and upside cases through the same DCF engine."
      />
      <IllustrativeBanner />
      <ScenarioSwitcher base={base} />
    </div>
  );
}
