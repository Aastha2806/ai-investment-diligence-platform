import companyData from "@/data/company.json";
import { PageHeader, Section, Card, IllustrativeBanner } from "@/components/PageShell";
import { formatPercent } from "@/lib/format";

export default function CompanyPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Company"
        title={`${companyData.name} (${companyData.ticker})`}
        description={companyData.overview}
      />
      <IllustrativeBanner />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Section title="Business Model">
            <p className="text-sm leading-relaxed text-foreground-muted">{companyData.businessModel}</p>
          </Section>

          <Section title="Revenue Segments">
            <div className="space-y-3">
              {companyData.segments.map((seg) => (
                <Card key={seg.name}>
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{seg.name}</p>
                    <p className="font-tabular text-sm text-foreground-muted">{formatPercent(seg.revenueShare, 0)}</p>
                  </div>
                  <p className="mt-1 text-sm text-foreground-muted">{seg.description}</p>
                </Card>
              ))}
            </div>
          </Section>

          <Section title="Geographic Mix">
            <div className="space-y-2">
              {companyData.geography.map((g) => (
                <div key={g.region} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-sm text-foreground-muted">{g.region}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${g.revenueShare * 100}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-tabular text-sm text-foreground-muted">
                    {formatPercent(g.revenueShare, 0)}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div>
          <Section title="Key Facts">
            <Card>
              <dl className="space-y-3 text-sm">
                <Fact label="Sector" value={companyData.sector} />
                <Fact label="Industry" value={companyData.industry} />
                <Fact label="Founded" value={String(companyData.founded)} />
                <Fact label="Headquarters" value={companyData.headquarters} />
                <Fact label="Fiscal Year End" value={companyData.fiscalYearEnd} />
                <Fact label="Currency" value={companyData.currency} />
              </dl>
            </Card>
          </Section>

          <Section title="Operating Metrics">
            <Card>
              <dl className="space-y-3 text-sm">
                {companyData.operatingMetrics.map((m) => (
                  <Fact key={m.label} label={m.label} value={m.value} />
                ))}
              </dl>
            </Card>
          </Section>

          <Section title="Capital Structure">
            <Card>
              <dl className="space-y-3 text-sm">
                <Fact label="Share Class" value={companyData.capitalStructure.shareClass} />
                <Fact
                  label="Shares Outstanding"
                  value={`${companyData.capitalStructure.sharesOutstandingMillions.toFixed(1)}M`}
                />
              </dl>
              <p className="mt-3 text-xs text-foreground-muted">{companyData.capitalStructure.notes}</p>
            </Card>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-foreground-muted">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}
