import type { ParsedAssumptions } from "./types";

/**
 * Deterministic, rule-based natural-language parser for DCF assumptions.
 * No LLM is involved: this is plain regex + unit handling over a fixed set
 * of recognized phrasings. Anything it can't confidently match is left out
 * of the result rather than guessed.
 */
const NUMBER_WORDS: Record<string, string> = {
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
  ten: "10",
};

function normalizeNumberWords(text: string): string {
  return text.replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\b/g, (w) => NUMBER_WORDS[w]);
}

// Each clause (split on , ; . and) is matched independently so a keyword in
// one clause never picks up a percentage that belongs to a neighboring clause.
function splitClauses(text: string): string[] {
  return text.split(/[,;.]| and /).map((c) => c.trim()).filter(Boolean);
}

function findPercentInClause(clause: string, keywords: RegExp): number | undefined {
  if (!new RegExp(keywords.source, "i").test(clause)) return undefined;
  const percentMatch = clause.match(/(\d+(?:\.\d+)?)\s*%/);
  if (!percentMatch) return undefined;
  return parseFloat(percentMatch[1]) / 100;
}

export function parseAssumptions(input: string): ParsedAssumptions {
  const text = normalizeNumberWords(input.toLowerCase());
  const clauses = splitClauses(text);
  const result: ParsedAssumptions = {};

  const fieldKeywords: Array<[keyof ParsedAssumptions, RegExp]> = [
    ["revenueGrowth", /revenue (?:grows?|growth|growing)|growth rate|top[- ]line/],
    ["ebitdaMargin", /ebitda margin/],
    ["taxRate", /tax rate|taxes?/],
    ["capexPctRevenue", /capex|capital expenditure/],
    ["nwcPctRevenue", /nwc|working capital/],
    ["wacc", /wacc|discount rate|cost of capital/],
    ["terminalGrowth", /terminal growth|perpetuity growth|long[- ]term growth/],
  ];

  for (const clause of clauses) {
    for (const [field, keywords] of fieldKeywords) {
      if (result[field] !== undefined) continue; // first match wins
      const value = findPercentInClause(clause, keywords);
      if (value !== undefined) {
        (result as Record<string, number>)[field] = value;
      }
    }

    if (result.forecastYears === undefined) {
      const forecastYearsMatch = clause.match(
        /(\d+)\s*[- ]?year(?:s)?(?:\s*(?:forecast|period|horizon))?|for\s+(\d+)\s+years/
      );
      if (forecastYearsMatch) {
        const value = forecastYearsMatch[1] ?? forecastYearsMatch[2];
        if (value) result.forecastYears = parseInt(value, 10);
      }
    }
  }

  return result;
}

export function hasAnyParsedValue(parsed: ParsedAssumptions): boolean {
  return Object.keys(parsed).length > 0;
}

export const NL_PARSER_EXAMPLE =
  "Assume revenue grows 12% for five years, EBITDA margin reaches 24%, WACC is 10%, and terminal growth is 4%.";

export const NL_UNPARSEABLE_MESSAGE =
  "Unable to parse this assumption. Please enter it manually.";
