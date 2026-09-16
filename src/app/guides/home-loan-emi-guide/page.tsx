import type { Metadata } from "next";
import FinanceGuideShell from "@/components/FinanceGuideShell";
import { getGuide } from "@/lib/guides-data";
import {
  HomeLoanEmiGuideQuickAnswer,
  HomeLoanEmiGuideHowItWorks,
  HomeLoanEmiGuideKeyFactors,
  HomeLoanEmiGuideMistakes,
  homeLoanEmiGuideFaq,
} from "./content";

const guide = getGuide("home-loan-emi-guide")!;

export const metadata: Metadata = {
  title: `${guide.shortTitle} (2026)`,
  description: guide.metaDescription,
  alternates: { canonical: "/guides/home-loan-emi-guide" },
};

export default function HomeLoanEmiGuidePage() {
  return (
    <FinanceGuideShell
      slug={guide.slug}
      title={guide.title}
      intro={guide.intro}
      updated="September 2026"
      quickAnswer={<HomeLoanEmiGuideQuickAnswer />}
      howItWorks={<HomeLoanEmiGuideHowItWorks />}
      keyFactors={<HomeLoanEmiGuideKeyFactors />}
      commonMistakes={<HomeLoanEmiGuideMistakes />}
      faqItems={homeLoanEmiGuideFaq}
      calculatorSlug={guide.calculatorSlug}
      calculatorName={guide.calculatorName}
    />
  );
}
