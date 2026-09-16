import Link from "next/link";
import { calculators, getCalculatorMarket, siteConfig } from "@/lib/calculators-data";

export default function Footer() {
  const homeImprovement = calculators.filter((c) => getCalculatorMarket(c.category) === "US");
  const indiaRealEstate = calculators.filter((c) => getCalculatorMarket(c.category) === "India");

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
            <div className="mt-3 text-2xs font-semibold uppercase tracking-wide text-slate-400">
              🇺🇸 Home Improvement
            </div>
            <ul className="mt-2 space-y-2 text-sm text-slate-600">
              {homeImprovement.map((calc) => (
                <li key={calc.slug}>
                  <Link href={`/calculators/${calc.slug}`} className="hover:text-emerald-700">
                    {calc.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-2xs font-semibold uppercase tracking-wide text-slate-400">
              🇮🇳 India Real Estate
            </div>
            <ul className="mt-2 space-y-2 text-sm text-slate-600">
              {indiaRealEstate.map((calc) => (
                <li key={calc.slug}>
                  <Link href={`/calculators/${calc.slug}`} className="hover:text-emerald-700">
                    {calc.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Features &amp; Site</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/" className="hover:text-emerald-700">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/floor-plan" className="font-medium text-emerald-700 hover:text-emerald-800">
                  House Plans (Floor Plan Generator)
                </Link>
              </li>
              <li>
                <Link href="/guides" className="hover:text-emerald-700">
                  Guides
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
            estimates only &mdash; always confirm quantities and figures with
            a qualified professional before making a purchase or financial
            decision.
          </p>
        </div>
      </div>
    </footer>
  );
}
