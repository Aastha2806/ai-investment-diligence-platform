export function formatCurrency(value: number, opts: { decimals?: number } = {}): string {
  const decimals = opts.decimals ?? 1;
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatMillions(value: number): string {
  return `${formatCurrency(value)}M`;
}

export function formatPercent(value: number | null, decimals = 1): string {
  if (value === null || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatMultiple(value: number | null, decimals = 2): string {
  if (value === null || Number.isNaN(value)) return "—";
  return `${value.toFixed(decimals)}x`;
}

export function formatDays(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)} days`;
}

export function formatNumber(value: number, decimals = 1): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
