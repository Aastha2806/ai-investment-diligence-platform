"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { DerivedYear } from "@/lib/types";

const ACCENT = "#1c3d5a";
const ACCENT_LIGHT = "#7896ab";
const POSITIVE = "#1a7a4c";

export default function DashboardCharts({ years }: { years: DerivedYear[] }) {
  const data = years.map((y) => ({
    year: `FY${y.year}`,
    revenue: Math.round(y.revenue),
    ebitda: Math.round(y.ebitda),
    ebitdaMargin: Math.round(y.ebitdaMargin * 1000) / 10,
  }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground-muted">
          Revenue &amp; EBITDA ($M)
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e5eb" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="revenue" name="Revenue" fill={ACCENT_LIGHT} radius={[3, 3, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="ebitda" name="EBITDA" fill={ACCENT} radius={[3, 3, 0, 0]} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground-muted">
          EBITDA Margin (%)
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e5eb" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} unit="%" />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Line
              type="monotone"
              dataKey="ebitdaMargin"
              name="EBITDA Margin"
              stroke={POSITIVE}
              strokeWidth={2}
              dot={{ r: 3 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
