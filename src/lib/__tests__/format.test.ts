import { describe, it, expect } from "vitest";
import { formatCurrency, formatMillions, formatPercent, formatMultiple, formatDays, formatNumber } from "../format";

describe("formatCurrency", () => {
  it("formats positive values with a leading dollar sign", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.5");
  });

  it("puts the minus sign before the dollar sign for negative values (accounting convention)", () => {
    expect(formatCurrency(-43.8)).toBe("-$43.8");
  });

  it("respects the decimals option", () => {
    expect(formatCurrency(71.891, { decimals: 2 })).toBe("$71.89");
  });

  it("formats zero without a sign", () => {
    expect(formatCurrency(0)).toBe("$0.0");
  });
});

describe("formatMillions", () => {
  it("appends M and keeps the sign before the dollar sign for negatives", () => {
    expect(formatMillions(194.1)).toBe("$194.1M");
    expect(formatMillions(-40)).toBe("-$40.0M");
  });
});

describe("formatPercent", () => {
  it("converts a fraction to a percentage string", () => {
    expect(formatPercent(0.153)).toBe("15.3%");
  });
  it("returns an em dash for null", () => {
    expect(formatPercent(null)).toBe("—");
  });
});

describe("formatMultiple", () => {
  it("formats with an x suffix", () => {
    expect(formatMultiple(1.12)).toBe("1.12x");
  });
  it("returns an em dash for null", () => {
    expect(formatMultiple(null)).toBe("—");
  });
});

describe("formatDays / formatNumber", () => {
  it("formats days with a suffix", () => {
    expect(formatDays(45.2)).toBe("45 days");
  });
  it("formats a plain number with grouping", () => {
    expect(formatNumber(1234.5)).toBe("1,234.5");
  });
});
