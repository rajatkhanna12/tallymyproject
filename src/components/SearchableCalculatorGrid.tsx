"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalculatorMeta } from "@/lib/calculators-data";

export default function SearchableCalculatorGrid({
  calculators,
}: {
  calculators: CalculatorMeta[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return calculators;
    return calculators.filter((calc) => {
      const haystack = [calc.name, calc.shortDescription, calc.category, ...calc.keywords]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [calculators, query]);

  return (
    <div>
      <label htmlFor="calculator-search" className="sr-only">
        Search calculators
      </label>
      <div className="relative mx-auto max-w-xl">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
          🔍
        </span>
        <input
          id="calculator-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to calculate?"
          className="w-full rounded-full border border-slate-300 bg-white py-3 pl-11 pr-4 text-slate-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((calc) => (
          <Link
            key={calc.slug}
            href={`/calculators/${calc.slug}`}
            className="group rounded-xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
          >
            <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              {calc.category}
            </span>
            <h2 className="mt-3 text-lg font-semibold text-slate-900 group-hover:text-emerald-700">
              {calc.name}
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">{calc.shortDescription}</p>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-slate-500">
            No calculators match &ldquo;{query}&rdquo; yet &mdash; more coming soon.
          </p>
        )}
      </div>
    </div>
  );
}
