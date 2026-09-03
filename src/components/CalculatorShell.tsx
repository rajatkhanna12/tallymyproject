import { ReactNode } from "react";
import AdSlot from "@/components/AdSlot";
import FaqSection, { FaqItem } from "@/components/FaqSection";
import RelatedCalculators from "@/components/RelatedCalculators";
import { getRelatedCalculators } from "@/lib/calculators-data";

interface CalculatorShellProps {
  slug: string;
  title: string;
  intro: string;
  /** The interactive calculator widget (client component) */
  calculator: ReactNode;
  /** Formula / how-it-works explanation, as JSX */
  formula: ReactNode;
  /** Worked example, as JSX */
  example: ReactNode;
  /** Material recommendation / buying-guidance section, as JSX */
  materialGuidance: ReactNode;
  faqItems: FaqItem[];
}

/**
 * Shared page layout for every calculator: hero + calculator widget, ad,
 * formula explanation, worked example, material guidance, ad, FAQ, ad,
 * related calculators. Keeping this consistent across all calculator pages
 * makes it easy to add new calculators later without re-deciding layout.
 */
export default function CalculatorShell({
  slug,
  title,
  intro,
  calculator,
  formula,
  example,
  materialGuidance,
  faqItems,
}: CalculatorShellProps) {
  const related = getRelatedCalculators(slug);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">{intro}</p>
      </header>

      <div className="mt-8">{calculator}</div>

      <div className="mt-8">
        <AdSlot variant="in-content" />
      </div>

      <div className="mt-12 space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">
          How this calculator works
        </h2>
        <div className="prose-sm max-w-none text-sm leading-relaxed text-slate-600">
          {formula}
        </div>
      </div>

      <div className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Example calculation</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
          {example}
        </div>
      </div>

      <div className="mt-10">
        <AdSlot variant="mid-article" />
      </div>

      <div className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">
          Buying &amp; material guidance
        </h2>
        <div className="text-sm leading-relaxed text-slate-600">{materialGuidance}</div>
      </div>

      <div className="mt-10">
        <FaqSection items={faqItems} />
      </div>

      <div className="mt-10">
        <AdSlot variant="footer" />
      </div>

      <div className="mt-10">
        <RelatedCalculators calculators={related} />
      </div>
    </div>
  );
}
