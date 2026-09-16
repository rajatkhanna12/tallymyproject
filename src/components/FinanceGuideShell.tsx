import { ReactNode } from "react";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqSection, { FaqItem } from "@/components/FaqSection";
import RelatedGuides from "@/components/RelatedGuides";
import { getGuide, getOtherGuides } from "@/lib/guides-data";

interface FinanceGuideShellProps {
  slug: string;
  title: string;
  intro: string;
  updated: string;
  /** Short "headline numbers" callout, as JSX */
  quickAnswer: ReactNode;
  /** How the thing actually works, as JSX */
  howItWorks: ReactNode;
  /** What changes the number for a given reader, as JSX */
  keyFactors: ReactNode;
  /** Mistakes to avoid, as JSX */
  commonMistakes: ReactNode;
  faqItems: FaqItem[];
  calculatorSlug: string;
  calculatorName: string;
}

/**
 * Shared page layout for real-estate & finance guides. Mirrors GuideShell's
 * structure and ad placements, but with section framing suited to a
 * financial decision rather than a materials cost estimate (no
 * "DIY vs. hiring a pro" section, which doesn't apply here).
 */
export default function FinanceGuideShell({
  slug,
  title,
  intro,
  updated,
  quickAnswer,
  howItWorks,
  keyFactors,
  commonMistakes,
  faqItems,
  calculatorSlug,
  calculatorName,
}: FinanceGuideShellProps) {
  const otherGuides = getOtherGuides(slug);
  const guideMeta = getGuide(slug);
  const marketLabel = guideMeta?.category === "finance" ? "India Real Estate" : "Home Improvement";
  const marketAnchor = guideMeta?.category === "finance" ? "/#india-real-estate" : "/#home-improvement";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: marketLabel, href: marketAnchor },
          { label: "Guides", href: "/guides" },
          { label: title },
        ]}
      />

      <header>
        <p className="text-sm font-medium text-emerald-700">Guide</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">{intro}</p>
        <p className="mt-2 text-xs text-slate-400">Updated {updated}</p>
      </header>

      <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        {quickAnswer}
      </div>

      <div className="mt-8">
        <AdSlot variant="in-content" />
      </div>

      <div className="mt-12 space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">How it works</h2>
        <div className="text-sm leading-relaxed text-slate-600">{howItWorks}</div>
      </div>

      <div className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">
          What changes the number for you
        </h2>
        <div className="text-sm leading-relaxed text-slate-600">{keyFactors}</div>
      </div>

      <div className="mt-10">
        <AdSlot variant="mid-article" />
      </div>

      <div className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">
          Common mistakes to avoid
        </h2>
        <div className="text-sm leading-relaxed text-slate-600">{commonMistakes}</div>
      </div>

      <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-slate-900">
          Want this worked out for your own numbers?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
          The figures above are illustrative examples. Enter your own numbers
          in the {calculatorName} for a result built around your situation,
          not a general example.
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
        <RelatedGuides guides={otherGuides} heading="More guides" />
      </div>
    </div>
  );
}
