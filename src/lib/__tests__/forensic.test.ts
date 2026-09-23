import { describe, it, expect } from "vitest";
import { beneishMScore, beneishSeries, altmanZPrime, altmanZSeries } from "../forensic";
import { getRawStatements } from "../financials";
import { computeWacc, capmCostOfEquity } from "../wacc";

describe("beneishMScore", () => {
  const prev = {
    year: 2024,
    revenue: 100,
    cogs: 40,
    sgaExpense: 20,
    ebitda: 40,
    da: 5,
    interestExpense: 2,
    taxRate: 0.25,
    cfo: 30,
    capex: 8,
    cash: 20,
    totalDebt: 50,
    receivables: 10,
    payables: 8,
    inventory: 0,
    currentAssets: 40,
    currentLiabilities: 20,
    ppeGross: 60,
    totalAssets: 200,
    retainedEarnings: 50,
    sharesOutstandingMillions: 10,
  };

  it("returns identical-year components equal to 1 (no distortion) when nothing changes proportionally", () => {
    const curr = { ...prev, year: 2025 };
    const result = beneishMScore(prev, curr);
    expect(result.dsri).toBeCloseTo(1, 6);
    expect(result.gmi).toBeCloseTo(1, 6);
    expect(result.sgi).toBeCloseTo(1, 6);
    expect(result.lvgi).toBeCloseTo(1, 6);
  });

  it("increases DSRI when receivables grow faster than revenue", () => {
    const curr = { ...prev, year: 2025, receivables: 20, revenue: 110 };
    const result = beneishMScore(prev, curr);
    // DSRI = (20/110) / (10/100) = 1.818
    expect(result.dsri).toBeCloseTo((20 / 110) / (10 / 100), 6);
    expect(result.dsri).toBeGreaterThan(1);
  });

  it("computes SGI as current/prior revenue ratio", () => {
    const curr = { ...prev, year: 2025, revenue: 120 };
    const result = beneishMScore(prev, curr);
    expect(result.sgi).toBeCloseTo(1.2, 6);
  });

  it("beneishSeries produces one fewer entry than the number of years", () => {
    const raw = getRawStatements();
    const series = beneishSeries(raw);
    expect(series).toHaveLength(raw.length - 1);
  });
});

describe("altmanZPrime", () => {
  it("computes the five component ratios and weighted Z-score", () => {
    const stmt = {
      year: 2025,
      revenue: 100,
      cogs: 40,
      sgaExpense: 20,
      ebitda: 30,
      da: 5,
      interestExpense: 2,
      taxRate: 0.25,
      cfo: 25,
      capex: 8,
      cash: 20,
      totalDebt: 30,
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
    const result = altmanZPrime(stmt);
    const totalLiabilities = 20 + 30;
    const bookEquity = 200 - totalLiabilities;
    const expected =
      0.717 * ((40 - 20) / 200) +
      0.847 * (50 / 200) +
      3.107 * ((30 - 5) / 200) +
      0.42 * (bookEquity / totalLiabilities) +
      0.998 * (100 / 200);
    expect(result.zScore).toBeCloseTo(expected, 6);
  });

  it("classifies zones using the standard 1.23 / 2.9 thresholds", () => {
    const strongStmt = {
      year: 2025, revenue: 400, cogs: 100, sgaExpense: 50, ebitda: 250, da: 5,
      interestExpense: 1, taxRate: 0.25, cfo: 200, capex: 5, cash: 300, totalDebt: 10,
      receivables: 10, payables: 5, inventory: 0, currentAssets: 320, currentLiabilities: 15,
      ppeGross: 20, totalAssets: 400, retainedEarnings: 300, sharesOutstandingMillions: 10,
    };
    const weakStmt = {
      year: 2025, revenue: 50, cogs: 45, sgaExpense: 10, ebitda: -5, da: 5,
      interestExpense: 8, taxRate: 0.25, cfo: -10, capex: 2, cash: 2, totalDebt: 150,
      receivables: 10, payables: 15, inventory: 0, currentAssets: 15, currentLiabilities: 60,
      ppeGross: 40, totalAssets: 200, retainedEarnings: -50, sharesOutstandingMillions: 10,
    };
    expect(altmanZPrime(strongStmt).zone).toBe("Safe");
    expect(altmanZPrime(weakStmt).zone).toBe("Distress");
  });

  it("altmanZSeries returns one result per year of raw data", () => {
    const raw = getRawStatements();
    const series = altmanZSeries(raw);
    expect(series).toHaveLength(raw.length);
  });
});

describe("computeWacc", () => {
  it("weights cost of equity and after-tax cost of debt by market-value capital structure", () => {
    const wacc = computeWacc({
      costOfEquity: 0.12,
      costOfDebt: 0.06,
      taxRate: 0.25,
      marketValueEquity: 800,
      marketValueDebt: 200,
    });
    const expected = 0.8 * 0.12 + 0.2 * 0.06 * 0.75;
    expect(wacc).toBeCloseTo(expected, 6);
  });

  it("returns 0 when total capital is zero", () => {
    expect(computeWacc({ costOfEquity: 0.1, costOfDebt: 0.05, taxRate: 0.25, marketValueEquity: 0, marketValueDebt: 0 })).toBe(0);
  });
});

describe("capmCostOfEquity", () => {
  it("computes risk-free rate + beta * equity risk premium", () => {
    expect(capmCostOfEquity({ riskFreeRate: 0.04, beta: 1.2, equityRiskPremium: 0.05 })).toBeCloseTo(0.1, 6);
  });
});
