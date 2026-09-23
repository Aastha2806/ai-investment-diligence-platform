import type { DerivedYear, FinancialStatementYear } from "./types";
import financialsData from "@/data/financials.json";

export function getRawStatements(): FinancialStatementYear[] {
  return financialsData.statements as FinancialStatementYear[];
}

/**
 * Derives every calculated metric from the raw disclosed/illustrative line items.
 * Nothing here is hard-coded: EBIT, net income, margins, growth rates, and
 * working-capital days are all computed from the underlying statement fields.
 */
export function deriveYears(statements: FinancialStatementYear[]): DerivedYear[] {
  return statements.map((stmt, i) => {
    const prev = i > 0 ? statements[i - 1] : null;

    const ebit = stmt.ebitda - stmt.da;
    const ebt = ebit - stmt.interestExpense;
    const taxes = ebt * stmt.taxRate;
    const netIncome = ebt - taxes;

    const ebitdaMargin = stmt.revenue !== 0 ? stmt.ebitda / stmt.revenue : 0;
    const ebitMargin = stmt.revenue !== 0 ? ebit / stmt.revenue : 0;
    const netMargin = stmt.revenue !== 0 ? netIncome / stmt.revenue : 0;

    const revenueGrowth = prev ? (stmt.revenue - prev.revenue) / prev.revenue : null;
    const ebitdaGrowth = prev ? (stmt.ebitda - prev.ebitda) / prev.ebitda : null;

    const netWorkingCapital = stmt.currentAssets - stmt.currentLiabilities;
    const netDebt = stmt.totalDebt - stmt.cash;

    const cfoToNetIncome = netIncome !== 0 ? stmt.cfo / netIncome : null;
    const capexToRevenue = stmt.revenue !== 0 ? stmt.capex / stmt.revenue : 0;
    const netDebtToEbitda = stmt.ebitda !== 0 ? netDebt / stmt.ebitda : null;
    const debtToEbitda = stmt.ebitda !== 0 ? stmt.totalDebt / stmt.ebitda : null;

    const dso = stmt.revenue !== 0 ? (stmt.receivables / stmt.revenue) * 365 : 0;
    const dio = stmt.cogs !== 0 ? (stmt.inventory / stmt.cogs) * 365 : 0;
    const dpo = stmt.cogs !== 0 ? (stmt.payables / stmt.cogs) * 365 : 0;
    const cashConversionCycle = dso + dio - dpo;

    return {
      ...stmt,
      ebit,
      netIncome,
      ebitdaMargin,
      ebitMargin,
      netMargin,
      revenueGrowth,
      ebitdaGrowth,
      netWorkingCapital,
      netDebt,
      cfoToNetIncome,
      capexToRevenue,
      netDebtToEbitda,
      debtToEbitda,
      dso,
      dio,
      dpo,
      cashConversionCycle,
    };
  });
}

export function getDerivedYears(): DerivedYear[] {
  return deriveYears(getRawStatements());
}

/** Compound annual growth rate between the first and last value in a series. */
export function cagr(first: number, last: number, periods: number): number {
  if (first <= 0 || periods <= 0) return 0;
  return Math.pow(last / first, 1 / periods) - 1;
}

export function revenueCagr(years: DerivedYear[]): number {
  if (years.length < 2) return 0;
  return cagr(years[0].revenue, years[years.length - 1].revenue, years.length - 1);
}

export function ebitdaCagr(years: DerivedYear[]): number {
  if (years.length < 2) return 0;
  return cagr(years[0].ebitda, years[years.length - 1].ebitda, years.length - 1);
}

export function latestYear(years: DerivedYear[]): DerivedYear {
  return years[years.length - 1];
}
