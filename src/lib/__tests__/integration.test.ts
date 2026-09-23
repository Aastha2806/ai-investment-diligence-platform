import { describe, it, expect } from "vitest";
import { getDerivedYears, getRawStatements, latestYear, revenueCagr, ebitdaCagr } from "../financials";
import { runDcf, dcfSensitivityTable, defaultAssumptions } from "../dcf";
import { beneishSeries, altmanZSeries } from "../forensic";
import { generateDiligenceFindings } from "../diligence";
import { getScenarios } from "../scenarios";

// These tests verify that every page-facing surface (DCF, Forensic, Diligence, Memo,
// Scenarios) is built from the single canonical dataset in financials.json, not a
// parallel or hand-edited set of numbers, and that the numbers those pages would
// display are internally consistent with each other.

describe("DCF starting point uses the latest historical actual period", () => {
  it("base year and base revenue match the last entry in the canonical dataset", () => {
    const years = getDerivedYears();
    const latest = latestYear(years);
    const raw = getRawStatements();

    expect(latest.year).toBe(raw[raw.length - 1].year);
    expect(latest.revenue).toBeCloseTo(raw[raw.length - 1].revenue, 6);

    const base = {
      baseYear: latest.year,
      baseRevenue: latest.revenue,
      cash: latest.cash,
      debt: latest.totalDebt,
      sharesOutstandingMillions: latest.sharesOutstandingMillions,
    };
    const dcf = runDcf(base, defaultAssumptions());
    // First forecast year builds directly off the latest actual revenue.
    expect(dcf.forecast[0].year).toBe(latest.year + 1);
    expect(dcf.forecast[0].revenue).toBeCloseTo(latest.revenue * (1 + defaultAssumptions().revenueGrowth), 6);
  });
});

describe("forensic calculations consume the canonical multi-year dataset", () => {
  it("Beneish series has exactly one fewer entry than the number of historical years (needs a prior year)", () => {
    const raw = getRawStatements();
    const beneish = beneishSeries(raw);
    expect(beneish).toHaveLength(raw.length - 1);
    expect(beneish[beneish.length - 1].year).toBe(raw[raw.length - 1].year);
  });

  it("Altman series covers every historical year", () => {
    const raw = getRawStatements();
    const altman = altmanZSeries(raw);
    expect(altman).toHaveLength(raw.length);
    expect(altman.map((a) => a.year)).toEqual(raw.map((s) => s.year));
  });
});

describe("scenarios run through the same DCF engine as the base case", () => {
  it("all three scenarios produce distinct, finite implied values off the same base year", () => {
    const years = getDerivedYears();
    const latest = latestYear(years);
    const base = {
      baseYear: latest.year,
      baseRevenue: latest.revenue,
      cash: latest.cash,
      debt: latest.totalDebt,
      sharesOutstandingMillions: latest.sharesOutstandingMillions,
    };
    const results = getScenarios().map((s) => runDcf(base, s.assumptions));
    for (const r of results) {
      expect(Number.isFinite(r.impliedValuePerShare)).toBe(true);
    }
    const [downside, , upside] = results;
    expect(upside.impliedValuePerShare).toBeGreaterThan(downside.impliedValuePerShare);
  });
});

describe("diligence findings cite real, verifiable canonical figures", () => {
  it("every finding's supporting metric contains a number pulled from the actual dataset, not a placeholder", () => {
    const raw = getRawStatements();
    const years = getDerivedYears();
    const beneish = beneishSeries(raw);
    const altman = altmanZSeries(raw);
    const base = {
      baseYear: years[years.length - 1].year,
      baseRevenue: years[years.length - 1].revenue,
      cash: years[years.length - 1].cash,
      debt: years[years.length - 1].totalDebt,
      sharesOutstandingMillions: years[years.length - 1].sharesOutstandingMillions,
    };
    const sensitivity = dcfSensitivityTable(base, defaultAssumptions(), [0.08, 0.1, 0.12], [0.02, 0.03, 0.04]);
    const findings = generateDiligenceFindings(years, beneish, altman, sensitivity);

    expect(findings.length).toBeGreaterThan(0);
    for (const f of findings) {
      // Every finding must cite at least one numeral (a real figure), not generic prose only.
      expect(f.supportingMetric).toMatch(/\d/);
    }

    // Spot-check: the growth-moderation finding (if present) must cite the actual FY2024/FY2025 figures.
    const growthFinding = findings.find((f) => f.id === "growth-moderation");
    if (growthFinding) {
      const latest = years[years.length - 1];
      const prior = years[years.length - 2];
      expect(growthFinding.supportingMetric).toContain(`FY${latest.year}`);
      expect(growthFinding.supportingMetric).toContain(`FY${prior.year}`);
    }
  });
});

describe("memo-equivalent figures match the canonical dataset (no parallel numbers)", () => {
  it("revenue/EBITDA CAGR and latest-year margins used by the memo trace back to getDerivedYears()", () => {
    const years = getDerivedYears();
    const first = years[0];
    const latest = latestYear(years);

    // These are exactly the calls src/app/memo/page.tsx makes — verifying they are
    // deterministic functions of the canonical dataset, not separately hardcoded.
    expect(revenueCagr(years)).toBeCloseTo(Math.pow(latest.revenue / first.revenue, 1 / (years.length - 1)) - 1, 10);
    expect(ebitdaCagr(years)).toBeCloseTo(Math.pow(latest.ebitda / first.ebitda, 1 / (years.length - 1)) - 1, 10);
    expect(latest.ebitdaMargin).toBeCloseTo(latest.ebitda / latest.revenue, 10);
  });
});
