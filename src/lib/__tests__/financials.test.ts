import { describe, it, expect } from "vitest";
import {
  deriveYears,
  cagr,
  revenueCagr,
  ebitdaCagr,
  getRawStatements,
  getDerivedYears,
} from "../financials";
import type { FinancialStatementYear } from "../types";

function stmt(overrides: Partial<FinancialStatementYear>): FinancialStatementYear {
  return {
    year: 2021,
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
    inventory: 5,
    currentAssets: 40,
    currentLiabilities: 20,
    ppeGross: 60,
    totalAssets: 200,
    retainedEarnings: 50,
    sharesOutstandingMillions: 10,
    ...overrides,
  };
}

describe("cagr", () => {
  it("computes compound annual growth rate", () => {
    expect(cagr(100, 121, 2)).toBeCloseTo(0.1, 6);
  });
  it("returns 0 for zero periods or non-positive base", () => {
    expect(cagr(100, 200, 0)).toBe(0);
    expect(cagr(0, 200, 2)).toBe(0);
  });
});

describe("deriveYears", () => {
  it("computes EBIT, taxes, and net income from EBITDA/D&A/interest/tax rate", () => {
    const years = deriveYears([stmt({})]);
    const y = years[0];
    expect(y.ebit).toBeCloseTo(25, 6); // 30 - 5
    const ebt = 25 - 2; // 23
    expect(y.netIncome).toBeCloseTo(ebt * 0.75, 6);
  });

  it("computes margins as fractions of revenue", () => {
    const years = deriveYears([stmt({ revenue: 100, ebitda: 30 })]);
    expect(years[0].ebitdaMargin).toBeCloseTo(0.3, 6);
  });

  it("leaves growth fields null for the first year and computes them thereafter", () => {
    const y1 = stmt({ year: 2021, revenue: 100, ebitda: 30 });
    const y2 = stmt({ year: 2022, revenue: 120, ebitda: 36 });
    const years = deriveYears([y1, y2]);
    expect(years[0].revenueGrowth).toBeNull();
    expect(years[1].revenueGrowth).toBeCloseTo(0.2, 6);
    expect(years[1].ebitdaGrowth).toBeCloseTo(0.2, 6);
  });

  it("computes net working capital and net debt", () => {
    const years = deriveYears([stmt({ currentAssets: 40, currentLiabilities: 20, totalDebt: 50, cash: 20 })]);
    expect(years[0].netWorkingCapital).toBeCloseTo(20, 6);
    expect(years[0].netDebt).toBeCloseTo(30, 6);
  });

  it("computes CFO/Net Income, Capex/Revenue, Debt/EBITDA ratios", () => {
    const years = deriveYears([stmt({ cfo: 25, revenue: 100, capex: 8, ebitda: 30, totalDebt: 50, cash: 20 })]);
    const y = years[0];
    expect(y.cfoToNetIncome).toBeCloseTo(25 / y.netIncome, 6);
    expect(y.capexToRevenue).toBeCloseTo(0.08, 6);
    expect(y.debtToEbitda).toBeCloseTo(50 / 30, 6);
    expect(y.netDebtToEbitda).toBeCloseTo((50 - 20) / 30, 6);
  });

  it("computes DSO, DIO, DPO, and cash conversion cycle from revenue/COGS-based days", () => {
    const years = deriveYears([
      stmt({ revenue: 365, cogs: 365, receivables: 36.5, inventory: 18.25, payables: 36.5 }),
    ]);
    const y = years[0];
    expect(y.dso).toBeCloseTo(36.5, 6);
    expect(y.dio).toBeCloseTo(18.25, 6);
    expect(y.dpo).toBeCloseTo(36.5, 6);
    expect(y.cashConversionCycle).toBeCloseTo(y.dso + y.dio - y.dpo, 6);
  });
});

describe("revenueCagr / ebitdaCagr", () => {
  it("matches the raw cagr() over the full historical window", () => {
    const years = deriveYears(getRawStatements());
    const first = years[0];
    const last = years[years.length - 1];
    expect(revenueCagr(years)).toBeCloseTo(cagr(first.revenue, last.revenue, years.length - 1), 10);
    expect(ebitdaCagr(years)).toBeCloseTo(cagr(first.ebitda, last.ebitda, years.length - 1), 10);
  });
});

describe("dataset integrity", () => {
  it("Revenue - COGS - SG&A equals EBITDA for every historical year (internal consistency)", () => {
    const raw = getRawStatements();
    for (const s of raw) {
      expect(s.revenue - s.cogs - s.sgaExpense).toBeCloseTo(s.ebitda, 6);
    }
  });

  it("loads 5 years of derived data with expected ordering", () => {
    const years = getDerivedYears();
    expect(years).toHaveLength(5);
    expect(years.map((y) => y.year)).toEqual([2021, 2022, 2023, 2024, 2025]);
  });
});
