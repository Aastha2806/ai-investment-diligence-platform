import { describe, it, expect } from "vitest";
import { parseAssumptions, hasAnyParsedValue, NL_PARSER_EXAMPLE } from "../nlParser";

describe("parseAssumptions", () => {
  it("parses the documented example sentence completely", () => {
    const result = parseAssumptions(NL_PARSER_EXAMPLE);
    expect(result.revenueGrowth).toBeCloseTo(0.12, 6);
    expect(result.forecastYears).toBe(5);
    expect(result.ebitdaMargin).toBeCloseTo(0.24, 6);
    expect(result.wacc).toBeCloseTo(0.1, 6);
    expect(result.terminalGrowth).toBeCloseTo(0.04, 6);
  });

  it("parses tax rate and capex assumptions", () => {
    const result = parseAssumptions("Tax rate of 21% and capex at 6% of revenue.");
    expect(result.taxRate).toBeCloseTo(0.21, 6);
    expect(result.capexPctRevenue).toBeCloseTo(0.06, 6);
  });

  it("parses working capital assumptions", () => {
    const result = parseAssumptions("Assume NWC of 9% of revenue.");
    expect(result.nwcPctRevenue).toBeCloseTo(0.09, 6);
  });

  it("parses numeric forecast periods without a written-out number word", () => {
    const result = parseAssumptions("Use a 7 year forecast period.");
    expect(result.forecastYears).toBe(7);
  });

  it("returns an empty object for unrecognized text", () => {
    const result = parseAssumptions("The sky is blue today.");
    expect(hasAnyParsedValue(result)).toBe(false);
  });

  it("is case-insensitive", () => {
    const result = parseAssumptions("WACC IS 11%");
    expect(result.wacc).toBeCloseTo(0.11, 6);
  });
});

describe("hasAnyParsedValue", () => {
  it("returns true when at least one field was parsed", () => {
    expect(hasAnyParsedValue({ wacc: 0.1 })).toBe(true);
  });
  it("returns false for an empty object", () => {
    expect(hasAnyParsedValue({})).toBe(false);
  });
});
