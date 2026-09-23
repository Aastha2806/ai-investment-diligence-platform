import type { ReactNode } from "react";
import Link from "next/link";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8 border-b border-border pb-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-accent">{eyebrow}</p>
      <h1 className="mt-1 font-serif-heading text-3xl font-semibold text-foreground">{title}</h1>
      {description && <p className="mt-2 max-w-3xl text-sm text-foreground-muted">{description}</p>}
    </div>
  );
}

export function Section({
  title,
  description,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`mb-10 ${className}`}>
      {title && <h2 className="font-serif-heading text-xl font-semibold text-foreground">{title}</h2>}
      {description && <p className="mt-1 max-w-3xl text-sm text-foreground-muted">{description}</p>}
      <div className={title ? "mt-4" : ""}>{children}</div>
    </section>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  // A caller-supplied "bg-*" utility must win over the default bg-surface. Since Tailwind's
  // cascade order (not className string order) decides which same-specificity rule applies,
  // simply appending className isn't enough — bg-surface has to be omitted outright when the
  // caller overrides the background, otherwise it can silently win and hide light-on-dark text.
  const hasBackgroundOverride = /(^|\s)bg-/.test(className);
  return (
    <div
      className={`rounded-lg border border-border p-5 shadow-sm ${hasBackgroundOverride ? "" : "bg-surface"} ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sublabel,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sublabel?: string;
  tone?: "neutral" | "positive" | "negative" | "watch";
}) {
  const toneClass =
    tone === "positive"
      ? "text-positive"
      : tone === "negative"
        ? "text-negative"
        : tone === "watch"
          ? "text-watch"
          : "text-foreground";
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">{label}</p>
      <p className={`mt-2 font-tabular text-2xl font-semibold ${toneClass}`}>{value}</p>
      {sublabel && <p className="mt-1 text-xs text-foreground-muted">{sublabel}</p>}
    </Card>
  );
}

export function IllustrativeBanner() {
  return (
    <p className="mb-6 text-xs text-foreground-muted">
      Illustrative data for a fictional company — see{" "}
      <Link href="/methodology" className="underline">
        Methodology
      </Link>
      .
    </p>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "positive" | "negative" | "watch" | "elevated" }) {
  const toneClass =
    tone === "positive"
      ? "bg-[#e7f5ee] text-positive border-positive/30"
      : tone === "negative" || tone === "elevated"
        ? "bg-[#fbeceb] text-negative border-negative/30"
        : tone === "watch"
          ? "bg-[#fdf6e8] text-watch border-watch/30"
          : "bg-surface-muted text-foreground-muted border-border";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneClass}`}>
      {children}
    </span>
  );
}
