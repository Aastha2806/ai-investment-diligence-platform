import type { DcfAssumptions, DcfForecastYear, DcfResult } from "./types";

export interface DcfBase {
  baseYear: number;
  baseRevenue: number;
  cash: number;
  debt: number;
  sharesOutstandingMillions: number;
}

/**
 * Builds a full FCFF DCF from a flat set of forward assumptions. Every line
 * (forecast, discounting, terminal value, enterprise/equity bridge, implied
 * value per share) is computed here — nothing is a hard-coded output.
 */
export function runDcf(base: DcfBase, assumptions: DcfAssumptions): DcfResult {
  const {
    forecastYears,
    revenueGrowth,
    ebitdaMargin,
    taxRate,
    capexPctRevenue,
    daPctRevenue,
    nwcPctRevenue,
    wacc,
    terminalGrowth,
  } = assumptions;

  const forecast: DcfForecastYear[] = [];
  let priorRevenue = base.baseRevenue;

  for (let t = 1; t <= forecastYears; t++) {
    const revenue = priorRevenue * (1 + revenueGrowth);
    const ebitda = revenue * ebitdaMargin;
    const da = revenue * daPctRevenue;
    const ebit = ebitda - da;
    const taxes = ebit * taxRate;
    const nopat = ebit - taxes;
    const capex = revenue * capexPctRevenue;
    const changeInNwc = (revenue - priorRevenue) * nwcPctRevenue;
    const fcff = nopat + da - capex - changeInNwc;
    const discountFactor = 1 / Math.pow(1 + wacc, t);
    const pvFcff = fcff * discountFactor;

    forecast.push({
      year: base.baseYear + t,
      revenue,
      ebitda,
      da,
      ebit,
      taxes,
      nopat,
      capex,
      changeInNwc,
      fcff,
      discountFactor,
      pvFcff,
    });

    priorRevenue = revenue;
  }

  const sumPvFcff = forecast.reduce((sum, f) => sum + f.pvFcff, 0);

  const lastFcff = forecast[forecast.length - 1].fcff;
  const lastDiscountFactor = forecast[forecast.length - 1].discountFactor;
  const terminalValue =
    wacc > terminalGrowth
      ? (lastFcff * (1 + terminalGrowth)) / (wacc - terminalGrowth)
      : 0;
  const pvTerminalValue = terminalValue * lastDiscountFactor;

  const enterpriseValue = sumPvFcff + pvTerminalValue;
  const equityValue = enterpriseValue - base.debt + base.cash;
  const impliedValuePerShare = equityValue / base.sharesOutstandingMillions;

  return {
    forecast,
    sumPvFcff,
    terminalValue,
    pvTerminalValue,
    enterpriseValue,
    cash: base.cash,
    debt: base.debt,
    equityValue,
    sharesOutstandingMillions: base.sharesOutstandingMillions,
    impliedValuePerShare,
  };
}

export interface SensitivityCell {
  wacc: number;
  terminalGrowth: number;
  impliedValuePerShare: number;
}

/** WACC x terminal-growth grid of implied value per share, recomputed live. */
export function dcfSensitivityTable(
  base: DcfBase,
  assumptions: DcfAssumptions,
  waccRange: number[],
  terminalGrowthRange: number[]
): SensitivityCell[][] {
  return waccRange.map((wacc) =>
    terminalGrowthRange.map((terminalGrowth) => {
      const result = runDcf(base, { ...assumptions, wacc, terminalGrowth });
      return { wacc, terminalGrowth, impliedValuePerShare: result.impliedValuePerShare };
    })
  );
}

export function defaultAssumptions(overrides: Partial<DcfAssumptions> = {}): DcfAssumptions {
  return {
    forecastYears: 5,
    revenueGrowth: 0.15,
    ebitdaMargin: 0.28,
    taxRate: 0.25,
    capexPctRevenue: 0.05,
    daPctRevenue: 0.045,
    nwcPctRevenue: 0.08,
    wacc: 0.1,
    terminalGrowth: 0.03,
    ...overrides,
  };
}
