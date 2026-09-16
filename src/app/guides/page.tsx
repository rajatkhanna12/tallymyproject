import type { Metadata } from "next";
import Link from "next/link";
import { CostGuide, guides } from "@/lib/guides-data";
import { siteConfig } from "@/lib/calculators-data";
import AdSlot from "@/components/AdSlot";

export const metadata: Metadata = {
  title: "Home Improvement & India Real Estate Guides",
  description:
    "In-depth guides covering home improvement project costs (concrete, tile, roofing, flooring) and India real estate topics (home loan EMI, stamp duty, rent vs buy) — practical, no-nonsense breakdowns.",
  alternates: { canonical: "/guides" },
};

const homeImprovementGuides = guides.filter((g) => g.category !== "finance");
const indiaRealEstateGuides = guides.filter((g) => g.category === "finance");

function GuideCard({ guide }: { guide: CostGuide }) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="rounded-xl border border-slate-200 bg-white p-6 transition hover:border-emerald-300 hover:shadow-sm"
    >
      <div className="text-lg font-semibold text-slate-900">{guide.title}</div>
      <p className="mt-2 text-sm text-slate-600">{guide.intro}</p>
      <span className="mt-3 inline-block text-sm font-medium text-emerald-700">
        Read the guide &rarr;
      </span>
    </Link>
  );
}

export default function GuidesIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Home Improvement &amp; India Real Estate Guides
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          Practical breakdowns &mdash; what things cost for home improvement
          projects, and how the numbers work for real estate decisions in
          India.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          🇺🇸 Home Improvement
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {homeImprovementGuides.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          🇮🇳 India Real Estate
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {indiaRealEstateGuides.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} />
          ))}
        </div>
      </section>

      <div className="mt-14">
        <AdSlot variant="footer" />
      </div>

      <section className="mt-16 rounded-xl border border-slate-200 bg-slate-50 p-8">
        <h2 className="text-xl font-semibold text-slate-900">
          Guides vs. calculators
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
          These guides explain how things generally work. For a number based
          on your own numbers, use one of {siteConfig.name}&apos;s{" "}
          <Link href="/" className="font-medium text-emerald-700 hover:underline">
            free calculators
          </Link>{" "}
          instead &mdash; each guide links to the matching one.
        </p>
      </section>
    </div>
  );
}
