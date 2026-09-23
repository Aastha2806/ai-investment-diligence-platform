import type { DcfAssumptions, ScenarioDefinition, ScenarioName } from "./types";
import { defaultAssumptions } from "./dcf";

/**
 * Three named scenarios with distinct forward assumptions. None is labeled
 * as the "correct" one — the UI presents them side by side.
 */
export function getScenarios(): ScenarioDefinition[] {
  return [
    {
      name: "downside",
      label: "Downside",
      description:
        "Growth decelerates faster than the historical trend and margin expansion stalls, reflecting increased competitive or macro pressure.",
      assumptions: defaultAssumptions({
        revenueGrowth: 0.07,
        ebitdaMargin: 0.24,
        capexPctRevenue: 0.055,
        nwcPctRevenue: 0.09,
        wacc: 0.115,
        terminalGrowth: 0.02,
      }),
    },
    {
      name: "base",
      label: "Base",
      description:
        "Growth and margin trends continue roughly in line with the FY2021–FY2025 historical trajectory.",
      assumptions: defaultAssumptions(),
    },
    {
      name: "upside",
      label: "Upside",
      description:
        "Growth reaccelerates and operating leverage drives further margin expansion beyond the historical run-rate.",
      assumptions: defaultAssumptions({
        revenueGrowth: 0.2,
        ebitdaMargin: 0.32,
        capexPctRevenue: 0.045,
        nwcPctRevenue: 0.07,
        wacc: 0.095,
        terminalGrowth: 0.035,
      }),
    },
  ];
}

export function getScenario(name: ScenarioName): ScenarioDefinition {
  const scenario = getScenarios().find((s) => s.name === name);
  if (!scenario) throw new Error(`Unknown scenario: ${name}`);
  return scenario;
}

export function scenarioAssumptions(name: ScenarioName): DcfAssumptions {
  return getScenario(name).assumptions;
}
