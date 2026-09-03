import Link from "next/link";
import { CalculatorMeta } from "@/lib/calculators-data";

export default function RelatedCalculators({
  calculators,
}: {
  calculators: CalculatorMeta[];
}) {
  return (
    <section aria-labelledby="related-heading">
      <h2 id="related-heading" className="text-xl font-semibold text-slate-900">
        Related calculators
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {calculators.map((calc) => (
          <Link
            key={calc.slug}
            href={`/calculators/${calc.slug}`}
            className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow-sm"
          >
            <div className="font-medium text-slate-900">{calc.name}</div>
            <p className="mt-1 text-sm text-slate-600">{calc.shortDescription}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
