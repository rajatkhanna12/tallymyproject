import Link from "next/link";
import { calculators, siteConfig } from "@/lib/calculators-data";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2">
            <div className="text-lg font-semibold text-slate-900">
              {siteConfig.shortName}
            </div>
            <p className="mt-2 max-w-sm text-sm text-slate-600">
              {siteConfig.description}
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Calculators</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {calculators.map((calc) => (
                <li key={calc.slug}>
                  <Link href={`/calculators/${calc.slug}`} className="hover:text-emerald-700">
                    {calc.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Site</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/" className="hover:text-emerald-700">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-700">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-6 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. Results are
            estimates only &mdash; always confirm quantities with your supplier
            or contractor before purchasing materials.
          </p>
        </div>
      </div>
    </footer>
  );
}
