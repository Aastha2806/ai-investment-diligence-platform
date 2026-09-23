import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-foreground-muted sm:px-6 lg:px-8">
        <p className="max-w-3xl">
          Educational portfolio project. Not investment advice — no buy, sell, or hold recommendations. See{" "}
          <Link href="/methodology" className="underline">
            Methodology
          </Link>{" "}
          for how it works.
        </p>
      </div>
    </footer>
  );
}
