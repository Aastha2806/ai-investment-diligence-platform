export interface FinancialStatementYear {
  year: number;
  revenue: number;
  cogs: number;
  sgaExpense: number;
  ebitda: number;
  da: number;
  interestExpense: number;
  taxRate: number;
  cfo: number;
  capex: number;
  cash: number;
  totalDebt: number;
  receivables: number;
  payables: number;
  inventory: number;
  currentAssets: number;
  currentLiabilities: number;
  ppeGross: number;
  totalAssets: number;
  retainedEarnings: number;
  sharesOutstandingMillions: number;
}

export interface DerivedYear extends FinancialStatementYear {
  ebit: number;
  netIncome: number;
  ebitdaMargin: number;
  ebitMargin: number;
  netMargin: number;
  revenueGrowth: number | null;
  ebitdaGrowth: number | null;
  netWorkingCapital: number;
  netDebt: number;
  cfoToNetIncome: number | null;
  capexToRevenue: number;
  netDebtToEbitda: number | null;
  debtToEbitda: number | null;
  dso: number;
  dio: number;
  dpo: number;
  cashConversionCycle: number;
}

export interface DcfAssumptions {
  forecastYears: number;
  revenueGrowth: number; // annual, applied flat across forecast unless a ramp is desired
  ebitdaMargin: number; // target/terminal-year style flat margin applied across forecast
  taxRate: number;
  capexPctRevenue: number;
  daPctRevenue: number;
  nwcPctRevenue: number;
  wacc: number;
  terminalGrowth: number;
}

export interface DcfForecastYear {
  year: number;
  revenue: number;
  ebitda: number;
  da: number;
  ebit: number;
  taxes: number;
  nopat: number;
  capex: number;
  changeInNwc: number;
  fcff: number;
  discountFactor: number;
  pvFcff: number;
}

export interface DcfResult {
  forecast: DcfForecastYear[];
  sumPvFcff: number;
  terminalValue: number;
  pvTerminalValue: number;
  enterpriseValue: number;
  cash: number;
  debt: number;
  equityValue: number;
  sharesOutstandingMillions: number;
  impliedValuePerShare: number;
}

export type ScenarioName = "downside" | "base" | "upside";

export interface ScenarioDefinition {
  name: ScenarioName;
  label: string;
  description: string;
  assumptions: DcfAssumptions;
}

export interface ParsedAssumptions {
  revenueGrowth?: number;
  forecastYears?: number;
  ebitdaMargin?: number;
  taxRate?: number;
  capexPctRevenue?: number;
  nwcPctRevenue?: number;
  wacc?: number;
  terminalGrowth?: number;
}

export interface DiligenceFinding {
  id: string;
  category: "Financial Risk" | "Accounting Flag" | "Business Risk" | "Valuation Sensitivity";
  finding: string;
  supportingMetric: string;
  whyItMatters: string;
  context: string;
  suggestedQuestion: string;
  severity: "info" | "watch" | "elevated";
}

export interface CommentaryCheckResult {
  year: number;
  source: string;
  quote: string;
  claim: string;
  assessment: "supported" | "not supported" | "mixed" | "not evaluable";
  explanation: string;
}
