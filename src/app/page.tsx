import type { Metadata } from "next";
import Link from "next/link";
import { calculators, siteConfig } from "@/lib/calculators-data";
import SearchableCalculatorGrid from "@/components/SearchableCalculatorGrid";
import AdSlot from "@/components/AdSlot";

export const metadata: Metadata = {
  title: "Home Improvement, India Real Estate & House Plan Calculators",
  description:
    "Free calculators for home improvement (concrete, tile, roofing, flooring), India real estate (home loan EMI, stamp duty, rent vs buy, property tax), and AI-generated house floor plans — no sign-up needed.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Home Improvement, India Real Estate &amp; House Planning
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          Free calculators and tools for home improvement projects, Indian
          real estate decisions, and house floor plans &mdash; no sign-up
          required.
        </p>
      </div>

      {/* Featured New Tool: AI Floor Plan Generator */}
      <div className="mt-8 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-slate-50 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-700 px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wider text-white">
                New Tool
              </span>
              <span className="text-xs font-semibold text-emerald-800">
                🇮🇳 House Plans &middot; Vector CAD Layouts
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              AI Floor Plan Generator
            </h2>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-600">
              Describe your house requirements in plain English and generate an editable, dimension-aware 2D floor plan for Indian residential plots.
            </p>
          </div>
          <Link
            href="/floor-plan"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800"
          >
            Create Free Floor Plan &rarr;
          </Link>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-xl font-bold text-slate-900">Calculators</h2>
          <Link href="/guides" className="text-xs font-semibold text-emerald-700 hover:underline">
            View Guides &rarr;
          </Link>
        </div>
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
          Whether you&apos;re estimating materials for a home improvement
          project, working out the numbers on an Indian property purchase, or
          sketching a house floor plan, every tool here is built to give you
          a straight, usable answer &mdash; the formula behind it, a worked
          example, and guidance on what to do next &mdash; so you&apos;re not
          left guessing.
        </p>
      </section>
    </div>
  );
}
