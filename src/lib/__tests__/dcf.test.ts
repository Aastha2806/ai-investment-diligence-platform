import { describe, it, expect } from "vitest";
import { runDcf, dcfSensitivityTable, defaultAssumptions } from "../dcf";

const base = {
  baseYear: 2025,
  baseRevenue: 100,
  cash: 50,
  debt: 20,
  sharesOutstandingMillions: 10,
};

describe("runDcf", () => {
  it("forecasts revenue by compounding the flat growth rate", () => {
    const result = runDcf(base, defaultAssumptions({ forecastYears: 3, revenueGrowth: 0.1 }));
    expect(result.forecast[0].revenue).toBeCloseTo(110, 6);
    expect(result.forecast[1].revenue).toBeCloseTo(121, 6);
    expect(result.forecast[2].revenue).toBeCloseTo(133.1, 6);
  });

  it("computes EBITDA, D&A, EBIT, taxes, NOPAT correctly for one forecast year", () => {
    const result = runDcf(base, defaultAssumptions({
      forecastYears: 1,
      revenueGrowth: 0,
      ebitdaMargin: 0.3,
      daPctRevenue: 0.05,
      taxRate: 0.25,
    }));
    const f = result.forecast[0];
    expect(f.revenue).toBeCloseTo(100, 6);
    expect(f.ebitda).toBeCloseTo(30, 6);
    expect(f.da).toBeCloseTo(5, 6);
    expect(f.ebit).toBeCloseTo(25, 6);
    expect(f.taxes).toBeCloseTo(6.25, 6);
    expect(f.nopat).toBeCloseTo(18.75, 6);
  });

  it("computes FCFF as NOPAT + D&A - Capex - change in NWC", () => {
    const result = runDcf(base, defaultAssumptions({
      forecastYears: 1,
      revenueGrowth: 0.1,
      ebitdaMargin: 0.3,
      daPctRevenue: 0.05,
      capexPctRevenue: 0.06,
      nwcPctRevenue: 0.1,
      taxRate: 0.25,
    }));
    const f = result.forecast[0];
    const expectedFcff = f.nopat + f.da - f.capex - f.changeInNwc;
    expect(f.fcff).toBeCloseTo(expectedFcff, 6);
    expect(f.capex).toBeCloseTo(f.revenue * 0.06, 6);
    expect(f.changeInNwc).toBeCloseTo((f.revenue - 100) * 0.1, 6);
  });

  it("discounts FCFF using 1/(1+wacc)^t", () => {
    const result = runDcf(base, defaultAssumptions({ forecastYears: 2, wacc: 0.1 }));
    expect(result.forecast[0].discountFactor).toBeCloseTo(1 / 1.1, 8);
    expect(result.forecast[1].discountFactor).toBeCloseTo(1 / Math.pow(1.1, 2), 8);
    expect(result.forecast[0].pvFcff).toBeCloseTo(result.forecast[0].fcff * result.forecast[0].discountFactor, 8);
  });

  it("computes terminal value via Gordon growth and discounts it back", () => {
    const result = runDcf(base, defaultAssumptions({ forecastYears: 2, wacc: 0.1, terminalGrowth: 0.03 }));
    const last = result.forecast[result.forecast.length - 1];
    const expectedTv = (last.fcff * 1.03) / (0.1 - 0.03);
    expect(result.terminalValue).toBeCloseTo(expectedTv, 6);
    expect(result.pvTerminalValue).toBeCloseTo(expectedTv * last.discountFactor, 6);
  });

  it("bridges enterprise value to equity value and per-share value", () => {
    const result = runDcf(base, defaultAssumptions({ forecastYears: 3 }));
    expect(result.enterpriseValue).toBeCloseTo(result.sumPvFcff + result.pvTerminalValue, 6);
    expect(result.equityValue).toBeCloseTo(result.enterpriseValue - base.debt + base.cash, 6);
    expect(result.impliedValuePerShare).toBeCloseTo(result.equityValue / base.sharesOutstandingMillions, 6);
  });

  it("returns 0 terminal value when WACC does not exceed terminal growth (no divide-by-zero blowup)", () => {
    const result = runDcf(base, defaultAssumptions({ wacc: 0.03, terminalGrowth: 0.05 }));
    expect(result.terminalValue).toBe(0);
  });
});

describe("dcfSensitivityTable", () => {
  it("produces a grid matching runDcf for each WACC/terminal-growth pair", () => {
    const waccRange = [0.08, 0.1, 0.12];
    const tgRange = [0.02, 0.03];
    const table = dcfSensitivityTable(base, defaultAssumptions(), waccRange, tgRange);
    expect(table).toHaveLength(3);
    expect(table[0]).toHaveLength(2);
    const expected = runDcf(base, defaultAssumptions({ wacc: 0.12, terminalGrowth: 0.03 }));
    expect(table[2][1].impliedValuePerShare).toBeCloseTo(expected.impliedValuePerShare, 6);
  });

  it("shows higher implied value per share for lower WACC (all else equal)", () => {
    const table = dcfSensitivityTable(base, defaultAssumptions(), [0.08, 0.12], [0.03]);
    expect(table[0][0].impliedValuePerShare).toBeGreaterThan(table[1][0].impliedValuePerShare);
  });
});
