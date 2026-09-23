import { getDerivedYears, getRawStatements, latestYear } from "@/lib/financials";
import { beneishSeries, altmanZSeries } from "@/lib/forensic";
import { dcfSensitivityTable, defaultAssumptions } from "@/lib/dcf";
import { generateDiligenceFindings } from "@/lib/diligence";
import { PageHeader, Section, Card, IllustrativeBanner, Pill } from "@/components/PageShell";
import type { DiligenceFinding } from "@/lib/types";

const CATEGORIES: DiligenceFinding["category"][] = [
  "Financial Risk",
  "Accounting Flag",
  "Business Risk",
  "Valuation Sensitivity",
];

export default function DiligencePage() {
  const raw = getRawStatements();
  const years = getDerivedYears();
  const latest = latestYear(years);
  const beneish = beneishSeries(raw);
  const altman = altmanZSeries(raw);

  const base = {
    baseYear: latest.year,
    baseRevenue: latest.revenue,
    cash: latest.cash,
    debt: latest.totalDebt,
    sharesOutstandingMillions: latest.sharesOutstandingMillions,
  };
  const sensitivity = dcfSensitivityTable(
    base,
    defaultAssumptions(),
    [0.08, 0.09, 0.1, 0.11, 0.12],
    [0.02, 0.025, 0.03, 0.035, 0.04]
  );

  const findings = generateDiligenceFindings(years, beneish, altman, sensitivity);

  return (
    <div>
      <PageHeader
        eyebrow="Diligence"
        title="Diligence"
        description="Translate financial and operating signals into questions for further investigation."
      />
      <IllustrativeBanner />

      {CATEGORIES.map((category) => {
        const items = findings.filter((f) => f.category === category);
        if (items.length === 0) return null;
        return (
          <Section key={category} title={category}>
            <div className="space-y-4">
              {items.map((f) => (
                <FindingCard key={f.id} finding={f} />
              ))}
            </div>
          </Section>
        );
      })}

      {findings.length === 0 && (
        <Card>
          <p className="text-sm text-foreground-muted">No findings triggered against the current rule set.</p>
        </Card>
      )}

      <Section title="Areas Requiring Further Investigation">
        <ul className="list-disc space-y-2 pl-5 text-sm text-foreground-muted">
          <li>Customer concentration and contract-level ARR detail (not modeled in this illustrative dataset).</li>
          <li>Detailed AR aging schedule to substantiate the DSO trend and cash-conversion finding above.</li>
          <li>Debt covenant terms and maturity schedule, to contextualize the leverage trend.</li>
          <li>Segment-level margin detail behind the consolidated EBITDA margin trend.</li>
          <li>Independent verification of any real-world data source, if this framework is applied to actual filings.</li>
        </ul>
      </Section>
    </div>
  );
}

function FindingCard({ finding }: { finding: DiligenceFinding }) {
  const tone = finding.severity === "elevated" ? "negative" : finding.severity === "watch" ? "watch" : "neutral";
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-medium text-foreground">{finding.finding}</p>
        <Pill tone={tone}>{finding.severity}</Pill>
      </div>
      <dl className="mt-3 space-y-2 text-sm">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-foreground-muted">Supporting Metric</dt>
          <dd className="font-tabular text-foreground-muted">{finding.supportingMetric}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-foreground-muted">Why It Matters</dt>
          <dd className="text-foreground-muted">{finding.whyItMatters}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-foreground-muted">Context</dt>
          <dd className="text-foreground-muted">{finding.context}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-foreground-muted">Suggested Diligence Question</dt>
          <dd className="italic text-foreground">{finding.suggestedQuestion}</dd>
        </div>
      </dl>
    </Card>
  );
}
