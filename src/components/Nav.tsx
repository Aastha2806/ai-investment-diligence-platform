"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/company", label: "Company" },
  { href: "/financials", label: "Financials" },
  { href: "/analysis", label: "Analysis" },
  { href: "/forensic", label: "Forensic" },
  { href: "/dcf", label: "DCF" },
  { href: "/scenarios", label: "Scenarios" },
  { href: "/diligence", label: "Diligence" },
  { href: "/memo", label: "Memo" },
  { href: "/methodology", label: "Methodology" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-serif-heading text-lg font-semibold tracking-tight text-accent-strong">
              AI Investment Diligence &amp; Valuation Platform
            </span>
          </Link>
          <span className="rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-foreground-muted">
            Illustrative Demo Data · Zero-Cost Prototype
          </span>
        </div>
        <nav className="-mb-px flex flex-wrap gap-x-1 gap-y-1 overflow-x-auto text-sm">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`whitespace-nowrap rounded-t-md border-b-2 px-3 py-2 transition-colors ${
                  isActive
                    ? "border-accent text-accent-strong font-semibold"
                    : "border-transparent text-foreground-muted hover:border-border hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
