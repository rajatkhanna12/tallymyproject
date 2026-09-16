import type { Metadata } from "next";
import FinanceGuideShell from "@/components/FinanceGuideShell";
import { getGuide } from "@/lib/guides-data";
import {
  StampDutyGuideQuickAnswer,
  StampDutyGuideHowItWorks,
  StampDutyGuideKeyFactors,
  StampDutyGuideMistakes,
  stampDutyGuideFaq,
} from "./content";

const guide = getGuide("stamp-duty-guide")!;

export const metadata: Metadata = {
  title: `${guide.shortTitle} (2026)`,
  description: guide.metaDescription,
  alternates: { canonical: "/guides/stamp-duty-guide" },
};

export default function StampDutyGuidePage() {
  return (
    <FinanceGuideShell
      slug={guide.slug}
      title={guide.title}
      intro={guide.intro}
      updated="September 2026"
      quickAnswer={<StampDutyGuideQuickAnswer />}
      howItWorks={<StampDutyGuideHowItWorks />}
      keyFactors={<StampDutyGuideKeyFactors />}
      commonMistakes={<StampDutyGuideMistakes />}
      faqItems={stampDutyGuideFaq}
      calculatorSlug={guide.calculatorSlug}
      calculatorName={guide.calculatorName}
    />
  );
}
