import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "@/lib/guides-data";
import { siteConfig } from "@/lib/calculators-data";
import AdSlot from "@/components/AdSlot";

export const metadata: Metadata = {
  title: "Cost Guides",
  description:
    "Real-world cost breakdowns for concrete, tile, roofing, mulching, and flooring projects — by size, material, and what drives the price.",
  alternates: { canonical: "/guides" },
};

export default function GuidesIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Cost Guides
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          What these projects actually cost &mdash; by size, by material, and
          by what typically pushes a quote higher.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="rounded-xl border border-slate-200 bg-white p-6 transition hover:border-emerald-300 hover:shadow-sm"
          >
            <div className="text-lg font-semibold text-slate-900">
              {guide.title}
            </div>
            <p className="mt-2 text-sm text-slate-600">{guide.intro}</p>
            <span className="mt-3 inline-block text-sm font-medium text-emerald-700">
              Read the breakdown &rarr;
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-14">
        <AdSlot variant="footer" />
      </div>

      <section className="mt-16 rounded-xl border border-slate-200 bg-slate-50 p-8">
        <h2 className="text-xl font-semibold text-slate-900">
          Cost guides vs. calculators
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
          These guides answer &quot;what will this cost, roughly&quot; using
          national averages. For a number based on your own project&apos;s
          exact dimensions, use one of {siteConfig.name}&apos;s{" "}
          <Link href="/" className="font-medium text-emerald-700 hover:underline">
            free calculators
          </Link>{" "}
          instead &mdash; each guide links to the matching one.
        </p>
      </section>
    </div>
  );
}
