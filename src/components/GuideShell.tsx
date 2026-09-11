import { ReactNode } from "react";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import FaqSection, { FaqItem } from "@/components/FaqSection";
import RelatedGuides from "@/components/RelatedGuides";
import { getOtherGuides } from "@/lib/guides-data";

interface GuideShellProps {
  slug: string;
  title: string;
  intro: string;
  updated: string;
  /** Short "typical range" callout, as JSX (a couple of headline numbers) */
  costSummary: ReactNode;
  /** Cost breakdown table/list, as JSX */
  breakdown: ReactNode;
  /** "What affects the price" factors, as JSX */
  factors: ReactNode;
  /** DIY vs. professional cost comparison, as JSX */
  diyVsPro: ReactNode;
  faqItems: FaqItem[];
  calculatorSlug: string;
  calculatorName: string;
}

/**
 * Shared page layout for cost guides — a distinct content type from the
 * calculator pages. Calculators answer "how much material do I need";
 * guides answer "how much will this cost me", which is a much broader,
 * higher-volume search intent. Every guide ends by pointing the reader to
 * its matching calculator for a number specific to their own project.
 */
export default function GuideShell({
  slug,
  title,
  intro,
  updated,
  costSummary,
  breakdown,
  factors,
  diyVsPro,
  faqItems,
  calculatorSlug,
  calculatorName,
}: GuideShellProps) {
  const otherGuides = getOtherGuides(slug);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header>
        <p className="text-sm font-medium text-emerald-700">Cost guide</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">{intro}</p>
        <p className="mt-2 text-xs text-slate-400">Updated {updated}</p>
      </header>

      <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        {costSummary}
      </div>

      <div className="mt-8">
        <AdSlot variant="in-content" />
      </div>

      <div className="mt-12 space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Cost breakdown</h2>
        <div className="text-sm leading-relaxed text-slate-600">{breakdown}</div>
      </div>

      <div className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">
          What affects the price
        </h2>
        <div className="text-sm leading-relaxed text-slate-600">{factors}</div>
      </div>

      <div className="mt-10">
        <AdSlot variant="mid-article" />
      </div>

      <div className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">DIY vs. hiring a pro</h2>
        <div className="text-sm leading-relaxed text-slate-600">{diyVsPro}</div>
      </div>

      <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-slate-900">
          Want your exact material cost?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
          These figures are national averages. Enter your own project
          dimensions in the {calculatorName} for a materials estimate built
          around your numbers, not a national average.
        </p>
        <Link
          href={`/calculators/${calculatorSlug}`}
          className="mt-4 inline-flex items-center justify-center rounded-md bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          Open the {calculatorName}
        </Link>
      </div>

      <div className="mt-10">
        <FaqSection items={faqItems} />
      </div>

      <div className="mt-10">
        <AdSlot variant="footer" />
      </div>

      <div className="mt-10">
        <RelatedGuides guides={otherGuides} />
      </div>
    </div>
  );
}
