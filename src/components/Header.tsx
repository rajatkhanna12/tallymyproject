import Link from "next/link";
import { siteConfig } from "@/lib/calculators-data";

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
        <nav className="hidden gap-6 text-sm font-medium text-slate-600 sm:flex">
          <Link href="/calculators/concrete" className="hover:text-emerald-700">
            Concrete
          </Link>
          <Link href="/calculators/tile" className="hover:text-emerald-700">
            Tile
          </Link>
          <Link href="/calculators/roofing" className="hover:text-emerald-700">
            Roofing
          </Link>
          <Link href="/calculators/mulch-gravel" className="hover:text-emerald-700">
            Mulch &amp; Gravel
          </Link>
          <Link href="/calculators/flooring" className="hover:text-emerald-700">
            Flooring
          </Link>
        </nav>
      </div>
    </header>
  );
}
