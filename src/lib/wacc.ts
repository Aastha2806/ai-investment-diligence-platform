export interface WaccInputs {
  costOfEquity: number;
  costOfDebt: number;
  taxRate: number;
  marketValueEquity: number;
  marketValueDebt: number;
}

/** Standard weighted-average cost of capital, computed from its components. */
export function computeWacc(inputs: WaccInputs): number {
  const { costOfEquity, costOfDebt, taxRate, marketValueEquity, marketValueDebt } = inputs;
  const total = marketValueEquity + marketValueDebt;
  if (total <= 0) return 0;
  const weightEquity = marketValueEquity / total;
  const weightDebt = marketValueDebt / total;
  return weightEquity * costOfEquity + weightDebt * costOfDebt * (1 - taxRate);
}

export interface CapmInputs {
  riskFreeRate: number;
  beta: number;
  equityRiskPremium: number;
}

/** Capital Asset Pricing Model cost of equity. */
export function capmCostOfEquity(inputs: CapmInputs): number {
  return inputs.riskFreeRate + inputs.beta * inputs.equityRiskPremium;
}
