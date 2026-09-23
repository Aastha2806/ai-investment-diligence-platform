import { describe, it, expect } from "vitest";
import { getScenarios, getScenario, scenarioAssumptions } from "../scenarios";
import { runDcf } from "../dcf";

const base = { baseYear: 2025, baseRevenue: 761, cash: 215, debt: 145, sharesOutstandingMillions: 42 };

describe("getScenarios", () => {
  it("returns exactly downside, base, and upside", () => {
    const names = getScenarios().map((s) => s.name);
    expect(names).toEqual(["downside", "base", "upside"]);
  });

  it("gives upside the highest revenue growth and downside the lowest", () => {
    const [downside, base_, upside] = getScenarios();
    expect(upside.assumptions.revenueGrowth).toBeGreaterThan(base_.assumptions.revenueGrowth);
    expect(base_.assumptions.revenueGrowth).toBeGreaterThan(downside.assumptions.revenueGrowth);
  });

  it("gives upside the highest EBITDA margin and downside the lowest", () => {
    const [downside, base_, upside] = getScenarios();
    expect(upside.assumptions.ebitdaMargin).toBeGreaterThan(base_.assumptions.ebitdaMargin);
    expect(base_.assumptions.ebitdaMargin).toBeGreaterThan(downside.assumptions.ebitdaMargin);
  });
});

describe("getScenario / scenarioAssumptions", () => {
  it("retrieves a scenario by name", () => {
    expect(getScenario("upside").label).toBe("Upside");
  });

  it("throws for an unknown scenario name", () => {
    // @ts-expect-error intentional invalid input
    expect(() => getScenario("wrong")).toThrow();
  });

  it("produces a higher implied value per share for upside than downside via the DCF engine", () => {
    const downResult = runDcf(base, scenarioAssumptions("downside"));
    const upResult = runDcf(base, scenarioAssumptions("upside"));
    expect(upResult.impliedValuePerShare).toBeGreaterThan(downResult.impliedValuePerShare);
  });
});
