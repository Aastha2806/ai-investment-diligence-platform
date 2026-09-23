import type { FinancialStatementYear } from "./types";

export interface BeneishComponents {
  year: number;
  dsri: number;
  gmi: number;
  aqi: number;
  sgi: number;
  depi: number;
  sgai: number;
  tata: number;
  lvgi: number;
  mScore: number;
}

export interface AltmanZResult {
  year: number;
  workingCapitalToAssets: number;
  retainedEarningsToAssets: number;
  ebitToAssets: number;
  equityToLiabilities: number;
  salesToAssets: number;
  zScore: number;
  zone: "Distress" | "Grey" | "Safe";
}

/**
 * Beneish M-Score (8-variable, 1999 model). Requires two consecutive years.
 * PP&E "net" is approximated with the gross PP&E balance because accumulated
 * depreciation is not separately modeled in this illustrative dataset — see
 * LIMITATIONS.md. This is a screening indicator, not evidence of manipulation.
 */
export function beneishMScore(
  prev: FinancialStatementYear,
  curr: FinancialStatementYear
): BeneishComponents {
  const dsri = curr.receivables / curr.revenue / (prev.receivables / prev.revenue);

  const grossMarginPrev = (prev.revenue - prev.cogs) / prev.revenue;
  const grossMarginCurr = (curr.revenue - curr.cogs) / curr.revenue;
  const gmi = grossMarginPrev / grossMarginCurr;

  const nonCurrentNonPpeShareCurr =
    1 - (curr.currentAssets + curr.ppeGross) / curr.totalAssets;
  const nonCurrentNonPpeSharePrev =
    1 - (prev.currentAssets + prev.ppeGross) / prev.totalAssets;
  const aqi = nonCurrentNonPpeShareCurr / nonCurrentNonPpeSharePrev;

  const sgi = curr.revenue / prev.revenue;

  const depRatePrev = prev.da / (prev.da + prev.ppeGross);
  const depRateCurr = curr.da / (curr.da + curr.ppeGross);
  const depi = depRatePrev / depRateCurr;

  const sgaiCurr = curr.sgaExpense / curr.revenue;
  const sgaiPrev = prev.sgaExpense / prev.revenue;
  const sgai = sgaiCurr / sgaiPrev;

  const ebtCurr = curr.ebitda - curr.da - curr.interestExpense;
  const netIncomeCurr = ebtCurr - ebtCurr * curr.taxRate;
  const tata = (netIncomeCurr - curr.cfo) / curr.totalAssets;

  const lvgiCurr = (curr.currentLiabilities + curr.totalDebt) / curr.totalAssets;
  const lvgiPrev = (prev.currentLiabilities + prev.totalDebt) / prev.totalAssets;
  const lvgi = lvgiCurr / lvgiPrev;

  const mScore =
    -4.84 +
    0.92 * dsri +
    0.528 * gmi +
    0.404 * aqi +
    0.892 * sgi +
    0.115 * depi -
    0.172 * sgai +
    4.679 * tata -
    0.327 * lvgi;

  return { year: curr.year, dsri, gmi, aqi, sgi, depi, sgai, tata, lvgi, mScore };
}

export function beneishSeries(statements: FinancialStatementYear[]): BeneishComponents[] {
  const out: BeneishComponents[] = [];
  for (let i = 1; i < statements.length; i++) {
    out.push(beneishMScore(statements[i - 1], statements[i]));
  }
  return out;
}

/**
 * Altman Z'-Score (private-company variant, using book value of equity in
 * place of market capitalization, since this illustrative company has no
 * traded market price). See METHODOLOGY.md for the formula and limitations.
 */
export function altmanZPrime(stmt: FinancialStatementYear): AltmanZResult {
  const totalLiabilities = stmt.currentLiabilities + stmt.totalDebt;
  const bookEquity = stmt.totalAssets - totalLiabilities;
  const ebit = stmt.ebitda - stmt.da;
  const workingCapital = stmt.currentAssets - stmt.currentLiabilities;

  const workingCapitalToAssets = workingCapital / stmt.totalAssets;
  const retainedEarningsToAssets = stmt.retainedEarnings / stmt.totalAssets;
  const ebitToAssets = ebit / stmt.totalAssets;
  const equityToLiabilities = totalLiabilities !== 0 ? bookEquity / totalLiabilities : 0;
  const salesToAssets = stmt.revenue / stmt.totalAssets;

  const zScore =
    0.717 * workingCapitalToAssets +
    0.847 * retainedEarningsToAssets +
    3.107 * ebitToAssets +
    0.42 * equityToLiabilities +
    0.998 * salesToAssets;

  let zone: AltmanZResult["zone"] = "Grey";
  if (zScore > 2.9) zone = "Safe";
  else if (zScore < 1.23) zone = "Distress";

  return {
    year: stmt.year,
    workingCapitalToAssets,
    retainedEarningsToAssets,
    ebitToAssets,
    equityToLiabilities,
    salesToAssets,
    zScore,
    zone,
  };
}

export function altmanZSeries(statements: FinancialStatementYear[]): AltmanZResult[] {
  return statements.map(altmanZPrime);
}
