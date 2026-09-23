"use client";

import { useMemo, useState } from "react";
import { runDcf, dcfSensitivityTable, defaultAssumptions, type DcfBase } from "@/lib/dcf";
import type { DcfAssumptions } from "@/lib/types";
import { parseAssumptions, hasAnyParsedValue, NL_PARSER_EXAMPLE, NL_UNPARSEABLE_MESSAGE } from "@/lib/nlParser";
import { formatCurrency, formatMillions, formatPercent } from "@/lib/format";
import { Card } from "@/components/PageShell";
import DataTable, { type DataTableRow } from "@/components/DataTable";

const WACC_STEPS = [-0.02, -0.01, 0, 0.01, 0.02];
const TGR_STEPS = [-0.01, -0.005, 0, 0.005, 0.01];

interface AssumptionField {
  key: keyof DcfAssumptions;
  label: string;
  min: number;
  max: number;
  step: number;
  isPercent: boolean;
}

const FIELDS: AssumptionField[] = [
  { key: "revenueGrowth", label: "Revenue Growth (annual)", min: -0.05, max: 0.4, step: 0.005, isPercent: true },
  { key: "ebitdaMargin", label: "EBITDA Margin", min: 0.05, max: 0.5, step: 0.005, isPercent: true },
  { key: "taxRate", label: "Tax Rate", min: 0, max: 0.4, step: 0.005, isPercent: true },
  { key: "capexPctRevenue", label: "Capex % of Revenue", min: 0.01, max: 0.15, step: 0.0025, isPercent: true },
  { key: "nwcPctRevenue", label: "NWC % of Revenue (of revenue change)", min: 0, max: 0.2, step: 0.0025, isPercent: true },
  { key: "wacc", label: "WACC", min: 0.04, max: 0.2, step: 0.0025, isPercent: true },
  { key: "terminalGrowth", label: "Terminal Growth", min: 0, max: 0.06, step: 0.0025, isPercent: true },
];

export default function DcfWorkbench({ base }: { base: DcfBase }) {
  const [assumptions, setAssumptions] = useState<DcfAssumptions>(defaultAssumptions());
  const [nlInput, setNlInput] = useState(NL_PARSER_EXAMPLE);
  const [parsedPreview, setParsedPreview] = useState<ReturnType<typeof parseAssumptions> | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const result = useMemo(() => runDcf(base, assumptions), [base, assumptions]);

  const waccRange = WACC_STEPS.map((d) => +(assumptions.wacc + d).toFixed(4)).filter((w) => w > assumptions.terminalGrowth);
  const tgrRange = TGR_STEPS.map((d) => +(assumptions.terminalGrowth + d).toFixed(4));
  const sensitivity = useMemo(
    () => dcfSensitivityTable(base, assumptions, waccRange, tgrRange),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [base, assumptions]
  );

  function updateField(key: keyof DcfAssumptions, value: number) {
    setAssumptions((prev) => ({ ...prev, [key]: value }));
  }

  function handleParse() {
    const parsed = parseAssumptions(nlInput);
    if (!hasAnyParsedValue(parsed)) {
      setParseError(NL_UNPARSEABLE_MESSAGE);
      setParsedPreview(null);
      return;
    }
    setParseError(null);
    setParsedPreview(parsed);
  }

  function applyParsed() {
    if (!parsedPreview) return;
    setAssumptions((prev) => ({ ...prev, ...parsedPreview }));
    setParsedPreview(null);
  }

  const forecastColumns = result.forecast.map((f) => `FY${f.year}`);
  const forecastRows: DataTableRow[] = [
    { label: "Revenue", values: result.forecast.map((f) => formatMillions(f.revenue)) },
    { label: "EBITDA", values: result.forecast.map((f) => formatMillions(f.ebitda)) },
    { label: "D&A", values: result.forecast.map((f) => formatMillions(f.da)) },
    { label: "EBIT", values: result.forecast.map((f) => formatMillions(f.ebit)) },
    { label: "Taxes", values: result.forecast.map((f) => formatMillions(f.taxes)) },
    { label: "NOPAT", values: result.forecast.map((f) => formatMillions(f.nopat)) },
    { label: "+ D&A Add-back", values: result.forecast.map((f) => formatMillions(f.da)) },
    { label: "- Capex", values: result.forecast.map((f) => formatMillions(-f.capex)) },
    { label: "- Change in NWC", values: result.forecast.map((f) => formatMillions(-f.changeInNwc)) },
    { label: "FCFF", values: result.forecast.map((f) => formatMillions(f.fcff)), emphasize: true },
    { label: "Discount Factor", values: result.forecast.map((f) => f.discountFactor.toFixed(3)) },
    { label: "PV of FCFF", values: result.forecast.map((f) => formatMillions(f.pvFcff)), emphasize: true },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
          Natural-Language Assumption Input
        </p>
        <p className="mt-1 text-xs text-foreground-muted">
          Deterministic parsing only — no LLM. Try: &ldquo;{NL_PARSER_EXAMPLE}&rdquo;
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={nlInput}
            onChange={(e) => setNlInput(e.target.value)}
            className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
            placeholder={NL_PARSER_EXAMPLE}
          />
          <button
            onClick={handleParse}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-strong"
          >
            Parse
          </button>
        </div>
        {parseError && <p className="mt-2 text-sm text-negative">{parseError}</p>}
        {parsedPreview && (
          <div className="mt-3 rounded-md border border-border bg-surface-muted p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">Parsed Assumptions</p>
            <ul className="mt-2 space-y-1 text-sm">
              {Object.entries(parsedPreview).map(([k, v]) => (
                <li key={k} className="font-tabular">
                  {FIELDS.find((f) => f.key === k)?.label ?? k}:{" "}
                  <span className="font-semibold">{k === "forecastYears" ? v : formatPercent(v as number)}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={applyParsed}
              className="mt-3 rounded-md border border-accent px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent hover:text-white"
            >
              Apply assumptions
            </button>
          </div>
        )}
      </Card>

      <Card>
        <p className="mb-4 text-xs font-medium uppercase tracking-wide text-foreground-muted">
          Interactive Assumptions — recalculates immediately
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <div key={field.key}>
              <div className="flex items-center justify-between text-sm">
                <label htmlFor={field.key}>{field.label}</label>
                <span className="font-tabular font-semibold text-accent-strong">
                  {formatPercent(assumptions[field.key] as number)}
                </span>
              </div>
              <input
                id={field.key}
                type="range"
                min={field.min}
                max={field.max}
                step={field.step}
                value={assumptions[field.key] as number}
                onChange={(e) => updateField(field.key, parseFloat(e.target.value))}
                className="mt-1 w-full accent-[#1c3d5a]"
              />
            </div>
          ))}
          <div>
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="forecastYears">Forecast Period</label>
              <span className="font-tabular font-semibold text-accent-strong">{assumptions.forecastYears} years</span>
            </div>
            <input
              id="forecastYears"
              type="range"
              min={3}
              max={10}
              step={1}
              value={assumptions.forecastYears}
              onChange={(e) => updateField("forecastYears", parseInt(e.target.value, 10))}
              className="mt-1 w-full accent-[#1c3d5a]"
            />
          </div>
        </div>
      </Card>

      <Card className="bg-accent-strong text-white">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <ResultStat label="Enterprise Value" value={formatMillions(result.enterpriseValue)} />
          <ResultStat label="Equity Value" value={formatMillions(result.equityValue)} />
          <ResultStat label="Implied Value / Share" value={formatCurrency(result.impliedValuePerShare, { decimals: 2 })} highlight />
          <ResultStat label="Terminal Value (PV)" value={formatMillions(result.pvTerminalValue)} />
        </div>
      </Card>

      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-foreground-muted">FCFF Forecast Build</p>
        <DataTable columns={forecastColumns} rows={forecastRows} />
      </div>

      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-foreground-muted">
          DCF Sensitivity — Implied Value per Share
        </p>
        <p className="mb-3 text-sm text-foreground-muted">WACC (rows) x Terminal Growth (columns), centered on current assumptions</p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted">
                <th className="px-3 py-2 text-left font-medium text-foreground-muted">WACC \ TGR</th>
                {tgrRange.map((tg) => (
                  <th key={tg} className="px-3 py-2 text-right font-medium text-foreground-muted">
                    {formatPercent(tg)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sensitivity.map((row, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 font-medium text-foreground-muted">{formatPercent(waccRange[i])}</td>
                  {row.map((cell, j) => {
                    const isCenter = Math.abs(cell.wacc - assumptions.wacc) < 1e-6 && Math.abs(cell.terminalGrowth - assumptions.terminalGrowth) < 1e-6;
                    return (
                      <td
                        key={j}
                        className={`px-3 py-2 text-right font-tabular ${isCenter ? "bg-accent/10 font-semibold text-accent-strong" : "text-foreground"}`}
                      >
                        {formatCurrency(cell.impliedValuePerShare, { decimals: 2 })}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ResultStat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-white/70">{label}</p>
      <p className={`mt-1 font-tabular font-semibold ${highlight ? "text-2xl" : "text-lg"}`}>{value}</p>
    </div>
  );
}
