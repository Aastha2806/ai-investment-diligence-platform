import type { CommentaryCheckResult, DerivedYear } from "./types";
import commentaryData from "@/data/commentary.json";

interface CommentaryEntry {
  year: number;
  source: string;
  quote: string;
  claims: string[];
}

const CLAIM_LABELS: Record<string, string> = {
  margin_expansion: "EBITDA margin expanded year-over-year",
  strong_growth: "Revenue growth exceeded 10% for the year",
  growth_acceleration: "Revenue growth accelerated versus the prior year",
  healthy_cash_conversion: "Cash conversion (CFO / Net Income) was healthy and stable",
  strong_fcf: "Cash conversion (CFO / Net Income) was healthy and stable",
  stable_working_capital: "Working capital grew roughly in line with revenue",
};

function evaluateClaim(
  claim: string,
  years: DerivedYear[],
  yearIndex: number
): { assessment: CommentaryCheckResult["assessment"]; explanation: string } {
  const curr = years[yearIndex];
  const prev = yearIndex > 0 ? years[yearIndex - 1] : null;

  switch (claim) {
    case "margin_expansion": {
      if (!prev) return { assessment: "not evaluable", explanation: "No prior year to compare." };
      const delta = curr.ebitdaMargin - prev.ebitdaMargin;
      return delta > 0.001
        ? {
            assessment: "supported",
            explanation: `EBITDA margin moved from ${(prev.ebitdaMargin * 100).toFixed(1)}% to ${(curr.ebitdaMargin * 100).toFixed(1)}% (+${(delta * 100).toFixed(1)}pp).`,
          }
        : {
            assessment: "not supported",
            explanation: `EBITDA margin moved from ${(prev.ebitdaMargin * 100).toFixed(1)}% to ${(curr.ebitdaMargin * 100).toFixed(1)}%, which is not an expansion.`,
          };
    }
    case "strong_growth": {
      return curr.revenueGrowth !== null && curr.revenueGrowth > 0.1
        ? {
            assessment: "supported",
            explanation: `Revenue growth was ${(curr.revenueGrowth * 100).toFixed(1)}%, above the 10% reference threshold used here.`,
          }
        : {
            assessment: "not supported",
            explanation: `Revenue growth was ${curr.revenueGrowth !== null ? (curr.revenueGrowth * 100).toFixed(1) + "%" : "not available"}, at or below the 10% reference threshold used here.`,
          };
    }
    case "growth_acceleration": {
      if (!prev || prev.revenueGrowth === null || curr.revenueGrowth === null)
        return { assessment: "not evaluable", explanation: "Insufficient prior-year growth data." };
      return curr.revenueGrowth > prev.revenueGrowth
        ? {
            assessment: "supported",
            explanation: `Growth moved from ${(prev.revenueGrowth * 100).toFixed(1)}% to ${(curr.revenueGrowth * 100).toFixed(1)}%.`,
          }
        : {
            assessment: "not supported",
            explanation: `Growth moved from ${(prev.revenueGrowth * 100).toFixed(1)}% to ${(curr.revenueGrowth * 100).toFixed(1)}%, which is a deceleration, not an acceleration.`,
          };
    }
    case "healthy_cash_conversion":
    case "strong_fcf": {
      if (curr.cfoToNetIncome === null)
        return { assessment: "not evaluable", explanation: "Net income was zero or unavailable." };
      if (!prev || prev.cfoToNetIncome === null) {
        return curr.cfoToNetIncome >= 1.0
          ? { assessment: "supported", explanation: `CFO / Net Income was ${curr.cfoToNetIncome.toFixed(2)}x.` }
          : { assessment: "not supported", explanation: `CFO / Net Income was ${curr.cfoToNetIncome.toFixed(2)}x, below 1.0x.` };
      }
      const delta = curr.cfoToNetIncome - prev.cfoToNetIncome;
      if (curr.cfoToNetIncome >= 1.0 && delta >= -0.05) {
        return {
          assessment: "supported",
          explanation: `CFO / Net Income was ${curr.cfoToNetIncome.toFixed(2)}x versus ${prev.cfoToNetIncome.toFixed(2)}x in the prior year.`,
        };
      }
      if (curr.cfoToNetIncome >= 1.0) {
        return {
          assessment: "mixed",
          explanation: `CFO / Net Income remained above 1.0x at ${curr.cfoToNetIncome.toFixed(2)}x but declined from ${prev.cfoToNetIncome.toFixed(2)}x in the prior year.`,
        };
      }
      return {
        assessment: "not supported",
        explanation: `CFO / Net Income fell to ${curr.cfoToNetIncome.toFixed(2)}x from ${prev.cfoToNetIncome.toFixed(2)}x.`,
      };
    }
    case "stable_working_capital": {
      if (!prev || curr.revenueGrowth === null)
        return { assessment: "not evaluable", explanation: "Insufficient prior-year data." };
      const nwcGrowth = prev.netWorkingCapital !== 0
        ? (curr.netWorkingCapital - prev.netWorkingCapital) / prev.netWorkingCapital
        : 0;
      const gap = Math.abs(nwcGrowth - curr.revenueGrowth);
      return gap <= 0.08
        ? {
            assessment: "supported",
            explanation: `Net working capital grew ${(nwcGrowth * 100).toFixed(1)}% versus revenue growth of ${(curr.revenueGrowth * 100).toFixed(1)}%.`,
          }
        : {
            assessment: "not supported",
            explanation: `Net working capital grew ${(nwcGrowth * 100).toFixed(1)}%, materially faster than revenue growth of ${(curr.revenueGrowth * 100).toFixed(1)}%.`,
          };
    }
    default:
      return { assessment: "not evaluable", explanation: "No evaluator defined for this claim." };
  }
}

export function checkCommentary(years: DerivedYear[]): CommentaryCheckResult[] {
  const entries = commentaryData.entries as CommentaryEntry[];
  const results: CommentaryCheckResult[] = [];

  for (const entry of entries) {
    const yearIndex = years.findIndex((y) => y.year === entry.year);
    if (yearIndex === -1) continue;

    for (const claim of entry.claims) {
      const { assessment, explanation } = evaluateClaim(claim, years, yearIndex);
      results.push({
        year: entry.year,
        source: entry.source,
        quote: entry.quote,
        claim: CLAIM_LABELS[claim] ?? claim,
        assessment,
        explanation,
      });
    }
  }

  return results;
}
