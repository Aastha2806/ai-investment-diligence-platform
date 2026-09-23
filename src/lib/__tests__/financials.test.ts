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

  it("computes gross profit and gross margin from revenue and COGS", () => {
    const years = deriveYears([stmt({ revenue: 100, cogs: 40 })]);
    expect(years[0].grossProfit).toBeCloseTo(60, 6);
    expect(years[0].grossMargin).toBeCloseTo(0.6, 6);
  });

  it("exposes EBT and taxes consistently with net income (EBT - taxes = net income)", () => {
    const years = deriveYears([stmt({ ebitda: 30, da: 5, interestExpense: 2, taxRate: 0.25 })]);
    const y = years[0];
    expect(y.ebt).toBeCloseTo(y.ebit - 2, 6);
    expect(y.taxes).toBeCloseTo(y.ebt * 0.25, 6);
    expect(y.ebt - y.taxes).toBeCloseTo(y.netIncome, 10);
  });

  it("computes total liabilities and equity from the balance sheet fields", () => {
    const years = deriveYears([stmt({ currentLiabilities: 20, totalDebt: 50, totalAssets: 200 })]);
    const y = years[0];
    expect(y.totalLiabilities).toBeCloseTo(70, 6);
    expect(y.equity).toBeCloseTo(130, 6);
    expect(y.totalAssets).toBeCloseTo(y.totalLiabilities + y.equity, 10); // balance sheet balances
  });

  it("computes capex/D&A and leaves it null when D&A is zero", () => {
    const years = deriveYears([stmt({ capex: 8, da: 5 }), stmt({ year: 2022, da: 0 })]);
    expect(years[0].capexToDA).toBeCloseTo(1.6, 6);
    expect(years[1].capexToDA).toBeNull();
  });

  it("leaves changeInNwc and fcff null for the first year, then computes them from the prior year", () => {
    const y1 = stmt({ year: 2021, currentAssets: 40, currentLiabilities: 20 });
    const y2 = stmt({ year: 2022, currentAssets: 50, currentLiabilities: 22 });
    const years = deriveYears([y1, y2]);
    expect(years[0].changeInNwc).toBeNull();
    expect(years[0].fcff).toBeNull();
    expect(years[1].changeInNwc).toBeCloseTo((50 - 22) - (40 - 20), 6); // 28 - 20 = 8

    const nopat = years[1].ebit - years[1].ebit * years[1].taxRate;
    const expectedFcff = nopat + years[1].da - years[1].capex - years[1].changeInNwc!;
    expect(years[1].fcff).toBeCloseTo(expectedFcff, 6);
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

  it("provides at least 4 complete historical actual fiscal years, including FY2022-FY2025", () => {
    const years = getDerivedYears();
    expect(years.length).toBeGreaterThanOrEqual(4);
    const yearNumbers = years.map((y) => y.year);
    for (const required of [2022, 2023, 2024, 2025]) {
      expect(yearNumbers).toContain(required);
    }
    expect(years.map((y) => y.year)).toEqual([2021, 2022, 2023, 2024, 2025]);
  });

  it("reconciles the full income statement chain for every year: Revenue -> Gross Profit -> EBITDA -> EBIT -> EBT -> Net Income", () => {
    const years = getDerivedYears();
    for (const y of years) {
      expect(y.grossProfit).toBeCloseTo(y.revenue - y.cogs, 6);
      expect(y.grossProfit - y.sgaExpense).toBeCloseTo(y.ebitda, 6);
      expect(y.ebit).toBeCloseTo(y.ebitda - y.da, 6);
      expect(y.ebt).toBeCloseTo(y.ebit - y.interestExpense, 6);
      expect(y.taxes).toBeCloseTo(y.ebt * y.taxRate, 6);
      expect(y.netIncome).toBeCloseTo(y.ebt - y.taxes, 10);
    }
  });

  it("reconciles the balance sheet for every year: Total Assets = Total Liabilities + Equity", () => {
    const years = getDerivedYears();
    for (const y of years) {
      expect(y.totalLiabilities).toBeCloseTo(y.currentLiabilities + y.totalDebt, 6);
      expect(y.totalAssets).toBeCloseTo(y.totalLiabilities + y.equity, 6);
    }
  });

  it("has no NaN or undefined in any numeric field across every historical year", () => {
    const years = getDerivedYears();
    for (const y of years) {
      for (const [key, value] of Object.entries(y)) {
        if (typeof value === "number") {
          expect(Number.isNaN(value), `${key} is NaN in FY${y.year}`).toBe(false);
        } else {
          expect(value === undefined, `${key} is undefined in FY${y.year}`).toBe(false);
        }
      }
    }
  });

  it("computes ChangeInNwc/FCFF for every year except the first, never silently substituting a fabricated value", () => {
    const years = getDerivedYears();
    expect(years[0].changeInNwc).toBeNull();
    expect(years[0].fcff).toBeNull();
    for (const y of years.slice(1)) {
      expect(y.changeInNwc).not.toBeNull();
      expect(y.fcff).not.toBeNull();
    }
  });
});
