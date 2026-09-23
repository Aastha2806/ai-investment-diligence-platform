import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-foreground-muted sm:px-6 lg:px-8">
        <p className="max-w-3xl">
          Educational / portfolio project. Not investment advice. This platform does not produce
          buy, sell, or hold recommendations. Figures use illustrative demo data for a fictional
          company. &ldquo;AI-assisted&rdquo; analysis is implemented using deterministic financial rules and
          structured logic — no paid LLM API is used. See{" "}
          <Link href="/methodology" className="underline">
            Methodology
          </Link>{" "}
          for details.
        </p>
      </div>
    </footer>
  );
}
