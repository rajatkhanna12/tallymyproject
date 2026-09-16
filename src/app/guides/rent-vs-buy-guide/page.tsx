import type { Metadata } from "next";
import FinanceGuideShell from "@/components/FinanceGuideShell";
import { getGuide } from "@/lib/guides-data";
import {
  RentVsBuyGuideQuickAnswer,
  RentVsBuyGuideHowItWorks,
  RentVsBuyGuideKeyFactors,
  RentVsBuyGuideMistakes,
  rentVsBuyGuideFaq,
} from "./content";

const guide = getGuide("rent-vs-buy-guide")!;

export const metadata: Metadata = {
  title: `${guide.shortTitle} (2026)`,
  description: guide.metaDescription,
  alternates: { canonical: "/guides/rent-vs-buy-guide" },
};

export default function RentVsBuyGuidePage() {
  return (
    <FinanceGuideShell
      slug={guide.slug}
      title={guide.title}
      intro={guide.intro}
      updated="September 2026"
      quickAnswer={<RentVsBuyGuideQuickAnswer />}
      howItWorks={<RentVsBuyGuideHowItWorks />}
      keyFactors={<RentVsBuyGuideKeyFactors />}
      commonMistakes={<RentVsBuyGuideMistakes />}
      faqItems={rentVsBuyGuideFaq}
      calculatorSlug={guide.calculatorSlug}
      calculatorName={guide.calculatorName}
    />
  );
}
