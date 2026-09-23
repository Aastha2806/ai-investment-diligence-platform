"use client";

import { useMemo, useState } from "react";
import { getScenarios } from "@/lib/scenarios";
import { runDcf, type DcfBase } from "@/lib/dcf";
import type { ScenarioName } from "@/lib/types";
import { formatCurrency, formatMillions, formatPercent } from "@/lib/format";
import { Card } from "@/components/PageShell";

export default function ScenarioSwitcher({ base }: { base: DcfBase }) {
  const scenarios = getScenarios();
  const [active, setActive] = useState<ScenarioName>("base");

  const results = useMemo(
    () => scenarios.map((s) => ({ ...s, result: runDcf(base, s.assumptions) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [base]
  );

  const activeResult = results.find((r) => r.name === active)!;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {results.map((s) => (
          <button
            key={s.name}
            onClick={() => setActive(s.name)}
            className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
              active === s.name
                ? "border-accent bg-accent text-white"
                : "border-border bg-surface text-foreground-muted hover:border-accent hover:text-accent"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <Card>
        <p className="text-sm text-foreground-muted">{activeResult.description}</p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Revenue Growth" value={formatPercent(activeResult.assumptions.revenueGrowth)} />
          <Stat label="EBITDA Margin" value={formatPercent(activeResult.assumptions.ebitdaMargin)} />
          <Stat label="WACC" value={formatPercent(activeResult.assumptions.wacc)} />
          <Stat label="Terminal Growth" value={formatPercent(activeResult.assumptions.terminalGrowth)} />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label={`FY${activeResult.result.forecast[activeResult.result.forecast.length - 1].year} Revenue`} value={formatMillions(activeResult.result.forecast[activeResult.result.forecast.length - 1].revenue)} card />
        <Stat label="Terminal EBITDA" value={formatMillions(activeResult.result.forecast[activeResult.result.forecast.length - 1].ebitda)} card />
        <Stat label="Terminal FCFF" value={formatMillions(activeResult.result.forecast[activeResult.result.forecast.length - 1].fcff)} card />
        <Stat label="Enterprise Value" value={formatMillions(activeResult.result.enterpriseValue)} card />
        <Stat label="Equity Value" value={formatMillions(activeResult.result.equityValue)} card />
        <Stat label="Value / Share" value={formatCurrency(activeResult.result.impliedValuePerShare, { decimals: 2 })} card emphasize />
      </div>

      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-foreground-muted">
          Scenario Comparison — Implied Value per Share
        </p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted text-left">
                <th className="px-4 py-2.5 font-medium text-foreground-muted">Scenario</th>
                <th className="px-4 py-2.5 text-right font-medium text-foreground-muted">Revenue Growth</th>
                <th className="px-4 py-2.5 text-right font-medium text-foreground-muted">EBITDA Margin</th>
                <th className="px-4 py-2.5 text-right font-medium text-foreground-muted">Enterprise Value</th>
                <th className="px-4 py-2.5 text-right font-medium text-foreground-muted">Equity Value</th>
                <th className="px-4 py-2.5 text-right font-medium text-foreground-muted">Value / Share</th>
              </tr>
            </thead>
            <tbody>
              {results.map((s) => (
                <tr key={s.name} className={`border-b border-border last:border-0 ${s.name === active ? "bg-accent/5" : ""}`}>
                  <td className="px-4 py-2 font-medium text-foreground">{s.label}</td>
                  <td className="px-4 py-2 text-right font-tabular">{formatPercent(s.assumptions.revenueGrowth)}</td>
                  <td className="px-4 py-2 text-right font-tabular">{formatPercent(s.assumptions.ebitdaMargin)}</td>
                  <td className="px-4 py-2 text-right font-tabular">{formatMillions(s.result.enterpriseValue)}</td>
                  <td className="px-4 py-2 text-right font-tabular">{formatMillions(s.result.equityValue)}</td>
                  <td className="px-4 py-2 text-right font-tabular font-semibold">
                    {formatCurrency(s.result.impliedValuePerShare, { decimals: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, card = false, emphasize = false }: { label: string; value: string; card?: boolean; emphasize?: boolean }) {
  const content = (
    <>
      <p className="text-xs uppercase tracking-wide text-foreground-muted">{label}</p>
      <p className={`mt-1 font-tabular font-semibold ${emphasize ? "text-xl text-accent-strong" : "text-foreground"}`}>{value}</p>
    </>
  );
  return card ? <Card>{content}</Card> : <div>{content}</div>;
}
