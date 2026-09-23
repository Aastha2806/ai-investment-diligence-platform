import { describe, it, expect } from "vitest";
import { generateDiligenceFindings } from "../diligence";
import { deriveYears, getRawStatements } from "../financials";
import { beneishSeries, altmanZSeries } from "../forensic";
import { dcfSensitivityTable } from "../dcf";
import { defaultAssumptions } from "../dcf";
import { checkCommentary } from "../commentaryCheck";

describe("generateDiligenceFindings (real illustrative dataset)", () => {
  const raw = getRawStatements();
  const years = deriveYears(raw);
  const beneish = beneishSeries(raw);
  const altman = altmanZSeries(raw);
  const sensitivity = dcfSensitivityTable(
    { baseYear: 2025, baseRevenue: 761, cash: 215, debt: 145, sharesOutstandingMillions: 42 },
    defaultAssumptions(),
    [0.08, 0.1, 0.12],
    [0.02, 0.03, 0.04]
  );
  const findings = generateDiligenceFindings(years, beneish, altman, sensitivity);

  it("flags cash conversion weakening in the constructed FY2025 dataset", () => {
    expect(findings.some((f) => f.id === "cash-conversion-weakened")).toBe(true);
  });

  it("flags rising capex intensity in FY2025", () => {
    expect(findings.some((f) => f.id === "capex-intensity-rising")).toBe(true);
  });

  it("does not flag leverage increase, since net debt/EBITDA improves every year in this dataset", () => {
    expect(findings.some((f) => f.id === "leverage-increased")).toBe(false);
  });

  it("every finding cites a supporting metric string", () => {
    for (const f of findings) {
      expect(f.supportingMetric.length).toBeGreaterThan(0);
      expect(f.suggestedQuestion.length).toBeGreaterThan(0);
    }
  });
});

describe("generateDiligenceFindings (synthetic edge cases)", () => {
  it("flags growth moderation when growth decelerates by more than 1pp", () => {
    const years = deriveYears([
      { ...baseStmt(2023), revenue: 100 },
      { ...baseStmt(2024), revenue: 130 },
      { ...baseStmt(2025), revenue: 145 },
    ]);
    const findings = generateDiligenceFindings(years, [], [], []);
    expect(findings.some((f) => f.id === "growth-moderation")).toBe(true);
  });

  it("flags leverage increase when net debt/EBITDA rises materially", () => {
    const years = deriveYears([
      { ...baseStmt(2024), totalDebt: 100, cash: 50, ebitda: 50 },
      { ...baseStmt(2025), totalDebt: 130, cash: 20, ebitda: 50 },
    ]);
    const findings = generateDiligenceFindings(years, [], [], []);
    expect(findings.some((f) => f.id === "leverage-increased")).toBe(true);
  });

  it("flags an elevated Beneish M-Score above the threshold", () => {
    const years = deriveYears([baseStmt(2025)]);
    const findings = generateDiligenceFindings(years, [
      { year: 2025, dsri: 1, gmi: 1, aqi: 1, sgi: 1, depi: 1, sgai: 1, tata: 0, lvgi: 1, mScore: -1.0 },
    ], [], []);
    expect(findings.some((f) => f.id === "beneish-elevated")).toBe(true);
  });

  it("flags a non-Safe Altman zone", () => {
    const years = deriveYears([baseStmt(2025)]);
    const findings = generateDiligenceFindings(years, [], [
      {
        year: 2025,
        workingCapitalToAssets: 0,
        retainedEarningsToAssets: 0,
        ebitToAssets: 0,
        equityToLiabilities: 0,
        salesToAssets: 0,
        zScore: 1.5,
        zone: "Grey",
      },
    ], []);
    expect(findings.some((f) => f.id === "altman-zone")).toBe(true);
  });

  it("flags wide DCF valuation sensitivity", () => {
    const years = deriveYears([baseStmt(2025)]);
    const sensitivity = [
      [{ wacc: 0.08, terminalGrowth: 0.02, impliedValuePerShare: 10 }],
      [{ wacc: 0.12, terminalGrowth: 0.02, impliedValuePerShare: 20 }],
    ];
    const findings = generateDiligenceFindings(years, [], [], sensitivity);
    expect(findings.some((f) => f.id === "valuation-sensitive-wacc-tgr")).toBe(true);
  });
});

describe("checkCommentary contradiction wiring", () => {
  it("produces at least one commentary-derived finding when a claim is not supported", () => {
    const years = deriveYears(getRawStatements());
    const results = checkCommentary(years);
    const unsupported = results.filter((r) => r.assessment === "not supported");
    expect(unsupported.length).toBeGreaterThan(0);

    const findings = generateDiligenceFindings(years, [], [], []);
    expect(findings.some((f) => f.id.startsWith("commentary-"))).toBe(true);
  });
});

function baseStmt(year: number) {
  return {
    year,
    revenue: 100,
    cogs: 40,
    sgaExpense: 30,
    ebitda: 30,
    da: 5,
    interestExpense: 2,
    taxRate: 0.25,
    cfo: 25,
    capex: 8,
    cash: 20,
    totalDebt: 50,
    receivables: 15,
    payables: 10,
    inventory: 0,
    currentAssets: 40,
    currentLiabilities: 20,
    ppeGross: 60,
    totalAssets: 200,
    retainedEarnings: 50,
    sharesOutstandingMillions: 10,
  };
}
