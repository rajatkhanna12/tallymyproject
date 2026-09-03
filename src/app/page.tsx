import { calculators, siteConfig } from "@/lib/calculators-data";
import SearchableCalculatorGrid from "@/components/SearchableCalculatorGrid";
import AdSlot from "@/components/AdSlot";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Home Improvement Calculators
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          Tally the exact materials, quantities, and project costs in seconds
          &mdash; free, no sign-up required.
        </p>
      </div>

      <div className="mt-10">
        <SearchableCalculatorGrid calculators={calculators} />
      </div>

      <div className="mt-14">
        <AdSlot variant="footer" />
      </div>

      <section className="mt-16 rounded-xl border border-slate-200 bg-slate-50 p-8">
        <h2 className="text-xl font-semibold text-slate-900">
          Why use {siteConfig.name}?
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
          Every calculator here is built to answer one question well: how much
          material do I actually need? Enter your project dimensions and
          get a straight answer &mdash; plus the formula behind it, a worked
          example, and guidance on what to buy &mdash; so you can head to the
          store with confidence instead of guessing (or over-ordering).
        </p>
      </section>
    </div>
  );
}
