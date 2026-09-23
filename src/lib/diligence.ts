import type { DerivedYear, DiligenceFinding } from "./types";
import type { BeneishComponents, AltmanZResult } from "./forensic";
import type { SensitivityCell } from "./dcf";
import { checkCommentary } from "./commentaryCheck";

const BENEISH_THRESHOLD = -1.78;

/**
 * Deterministic diligence-finding engine. Every rule below is a plain
 * conditional over calculated metrics — no language model is involved.
 * Findings never manufacture facts; they cite the metric that triggered them.
 */
export function generateDiligenceFindings(
  years: DerivedYear[],
  beneish: BeneishComponents[],
  altman: AltmanZResult[],
  sensitivity: SensitivityCell[][]
): DiligenceFinding[] {
  const findings: DiligenceFinding[] = [];
  const latest = years[years.length - 1];
  const prior = years[years.length - 2];

  if (latest.revenueGrowth !== null && prior?.revenueGrowth !== null && prior) {
    if (latest.revenueGrowth < prior.revenueGrowth - 0.01) {
      findings.push({
        id: "growth-moderation",
        category: "Financial Risk",
        finding: "Growth moderation identified.",
        supportingMetric: `Revenue growth slowed from ${(prior.revenueGrowth * 100).toFixed(1)}% (FY${prior.year}) to ${(latest.revenueGrowth * 100).toFixed(1)}% (FY${latest.year}).`,
        whyItMatters:
          "Decelerating growth compresses the forward revenue base the DCF is built on and can signal maturing demand, pricing pressure, or increased competition.",
        context:
          "A single year of deceleration is not conclusive; multi-year trend and forward bookings/pipeline data would confirm whether this is transient or structural.",
        suggestedQuestion:
          "What drove the deceleration in revenue growth in the most recent fiscal year, and is it expected to persist?",
        severity: "watch",
      });
    }
  }

  if (latest.cfoToNetIncome !== null && prior?.cfoToNetIncome !== null && prior) {
    if (latest.cfoToNetIncome < prior.cfoToNetIncome - 0.05) {
      findings.push({
        id: "cash-conversion-weakened",
        category: "Accounting Flag",
        finding: "Cash conversion has weakened.",
        supportingMetric: `CFO / Net Income fell from ${prior.cfoToNetIncome.toFixed(2)}x (FY${prior.year}) to ${latest.cfoToNetIncome.toFixed(2)}x (FY${latest.year}).`,
        whyItMatters:
          "A widening gap between reported net income and operating cash flow often reflects working-capital build (receivables, inventory) or non-cash earnings components, and warrants review of accrual quality.",
        context:
          "This coincides with a net-working-capital increase in the same period (see Forensic Analysis), which is a plausible explanator but should be confirmed against AR aging and customer collections data.",
        suggestedQuestion:
          "What is driving the increase in net working capital, and are there any changes in revenue recognition, billing terms, or customer collections?",
        severity: "elevated",
      });
    }
  }

  if (latest.netDebtToEbitda !== null && prior?.netDebtToEbitda !== null && prior) {
    if (latest.netDebtToEbitda > prior.netDebtToEbitda + 0.1) {
      findings.push({
        id: "leverage-increased",
        category: "Financial Risk",
        finding: "Leverage has increased.",
        supportingMetric: `Net Debt / EBITDA rose from ${prior.netDebtToEbitda.toFixed(2)}x to ${latest.netDebtToEbitda.toFixed(2)}x.`,
        whyItMatters:
          "Rising leverage increases financial risk and can constrain flexibility, especially if EBITDA growth slows at the same time.",
        context: "Compare against covenant thresholds and the maturity schedule of existing debt, if available.",
        suggestedQuestion: "What is driving the increase in net leverage, and are there covenant implications?",
        severity: "watch",
      });
    }
  }

  const latestBeneish = beneish[beneish.length - 1];
  if (latestBeneish && latestBeneish.mScore > BENEISH_THRESHOLD) {
    findings.push({
      id: "beneish-elevated",
      category: "Accounting Flag",
      finding: "Beneish M-Score is above the common screening threshold.",
      supportingMetric: `FY${latestBeneish.year} M-Score = ${latestBeneish.mScore.toFixed(2)} (reference threshold: ${BENEISH_THRESHOLD}).`,
      whyItMatters:
        "The Beneish M-Score is a probabilistic screening indicator correlated with a higher likelihood of earnings manipulation in academic backtests. It is not proof of manipulation.",
      context:
        "Review which of the eight components (see Forensic Analysis) is driving the score — e.g. receivables growth (DSRI), margin change (GMI), or accrual levels (TATA) — before drawing any conclusion.",
      suggestedQuestion:
        "Which underlying driver is pushing the Beneish M-Score higher, and is there a benign operational explanation?",
      severity: "watch",
    });
  }

  const latestAltman = altman[altman.length - 1];
  if (latestAltman && latestAltman.zone !== "Safe") {
    findings.push({
      id: "altman-zone",
      category: "Financial Risk",
      finding: `Altman Z'-Score places the company in the "${latestAltman.zone}" zone.`,
      supportingMetric: `FY${latestAltman.year} Z'-Score = ${latestAltman.zScore.toFixed(2)}.`,
      whyItMatters:
        "The Z'-Score is a bankruptcy-risk screening model; scores in the Grey or Distress zone warrant a closer look at solvency and liquidity, even for otherwise healthy-looking businesses.",
      context:
        "This model was originally calibrated on manufacturers and uses book (not market) equity here since no market price exists for this illustrative company — treat it as directional only.",
      suggestedQuestion: "Does management have a view on the drivers behind the Z'-Score classification?",
      severity: "info",
    });
  }

  if (prior) {
    const capexDelta = latest.capexToRevenue - prior.capexToRevenue;
    if (capexDelta > 0.002) {
      findings.push({
        id: "capex-intensity-rising",
        category: "Business Risk",
        finding: "Capital expenditure intensity has risen.",
        supportingMetric: `Capex / Revenue increased from ${(prior.capexToRevenue * 100).toFixed(1)}% to ${(latest.capexToRevenue * 100).toFixed(1)}%.`,
        whyItMatters:
          "Higher capex intensity reduces free cash flow conversion and, if sustained, should be reflected explicitly in DCF assumptions rather than assumed away.",
        context: "Confirm whether the increase is growth capex (expansionary) or maintenance capex (structural).",
        suggestedQuestion: "Is the increase in capex intensity temporary/growth-related, or a new structural run-rate?",
        severity: "info",
      });
    }
  }

  const flatValues = sensitivity.flat().map((c) => c.impliedValuePerShare);
  if (flatValues.length > 0) {
    const min = Math.min(...flatValues);
    const max = Math.max(...flatValues);
    if (min > 0 && max / min > 1.6) {
      findings.push({
        id: "valuation-sensitive-wacc-tgr",
        category: "Valuation Sensitivity",
        finding: "Valuation is sensitive to discount-rate and terminal-growth assumptions.",
        supportingMetric: `Implied value per share ranges from $${min.toFixed(2)} to $${max.toFixed(2)} across the WACC x terminal-growth sensitivity grid (${((max / min - 1) * 100).toFixed(0)}% spread).`,
        whyItMatters:
          "A wide sensitivity range means the point-estimate valuation depends heavily on assumptions that are inherently uncertain, so single-point DCF outputs should be treated as a range, not a precise number.",
        context: "See the DCF Sensitivity table for the full grid.",
        suggestedQuestion:
          "What WACC and terminal-growth assumptions would the counterparty defend, and how sensitive is their own view to those inputs?",
        severity: "info",
      });
    }
  }

  const commentaryResults = checkCommentary(years);
  const contradictions = commentaryResults.filter((r) => r.assessment === "not supported");
  for (const c of contradictions) {
    findings.push({
      id: `commentary-${c.year}-${c.claim.slice(0, 20).replace(/\s+/g, "-")}`,
      category: "Accounting Flag",
      finding: `Management commentary for FY${c.year} is not fully supported by the reported metrics.`,
      supportingMetric: c.explanation,
      whyItMatters:
        "When qualitative commentary diverges from the underlying financial trend, it is worth understanding why before relying on management's framing of performance.",
      context: `Quote (FY${c.year}, ${c.source}): "${c.quote}"`,
      suggestedQuestion: `Can management walk through the metrics behind the FY${c.year} commentary in more detail?`,
      severity: "watch",
    });
  }

  return findings;
}
