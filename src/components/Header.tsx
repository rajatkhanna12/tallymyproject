import Link from "next/link";
import { siteConfig } from "@/lib/calculators-data";

const HOME_IMPROVEMENT_LINKS = [
  { href: "/calculators/concrete", label: "Concrete" },
  { href: "/calculators/tile", label: "Tile" },
  { href: "/calculators/roofing", label: "Roofing" },
  { href: "/calculators/mulch-gravel", label: "Mulch & Gravel" },
  { href: "/calculators/flooring", label: "Flooring" },
];

const INDIA_REAL_ESTATE_LINKS = [
  { href: "/calculators/home-loan-emi", label: "Home Loan EMI" },
  { href: "/calculators/stamp-duty", label: "Stamp Duty & Registration" },
  { href: "/calculators/rent-vs-buy", label: "Rent vs Buy" },
  { href: "/calculators/property-tax", label: "Property Tax" },
];

function NavDropdown({
  label,
  flag,
  links,
}: {
  label: string;
  flag: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        className="flex items-center gap-1.5 py-2 hover:text-emerald-700"
      >
        <span aria-hidden="true">{flag}</span>
        {label}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
          className="mt-0.5 text-slate-400"
        >
          <path
            d="M2 3.5L5 6.5L8 3.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className="invisible absolute left-0 top-full z-20 w-56 rounded-lg border border-slate-200 bg-white p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-700 text-white">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="5" y1="4" x2="5" y2="20" />
              <line x1="9.5" y1="4" x2="9.5" y2="20" />
              <line x1="14" y1="4" x2="14" y2="20" />
              <line x1="18.5" y1="4" x2="18.5" y2="20" />
              <line x1="2.5" y1="18.5" x2="20.5" y2="4.5" />
            </svg>
          </span>
          <span className="text-lg font-semibold text-slate-900">
            {siteConfig.shortName}
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 sm:flex">
          <NavDropdown label="Home Improvement" flag="🇺🇸" links={HOME_IMPROVEMENT_LINKS} />
          <NavDropdown label="India Real Estate" flag="🇮🇳" links={INDIA_REAL_ESTATE_LINKS} />
          <Link
            href="/floor-plan"
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 hover:text-emerald-900"
          >
            <span>House Plans</span>
            <span className="rounded bg-emerald-700 px-1.5 py-0.5 text-2xs uppercase text-white font-bold">
              New
            </span>
          </Link>
          <Link href="/guides" className="hover:text-emerald-700">
            Guides
          </Link>
        </nav>
        <div className="flex items-center gap-2 sm:hidden">
          <Link
            href="/floor-plan"
            className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800"
          >
            House Plans ✨
          </Link>
        </div>
      </div>
    </header>
  );
}
