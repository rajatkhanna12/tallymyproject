import type { Metadata } from "next";
import GuideShell from "@/components/GuideShell";
import { getGuide } from "@/lib/guides-data";
import {
  MulchingCostSummary,
  MulchingCostBreakdown,
  MulchingCostFactors,
  MulchingCostDiyVsPro,
  mulchingCostFaq,
} from "./content";

const guide = getGuide("mulching-cost")!;

export const metadata: Metadata = {
  title: `${guide.title} (2026)`,
  description: guide.metaDescription,
  alternates: { canonical: "/guides/mulching-cost" },
};

export default function MulchingCostPage() {
  return (
    <GuideShell
      slug={guide.slug}
      title={guide.title}
      intro={guide.intro}
      updated="September 2026"
      costSummary={<MulchingCostSummary />}
      breakdown={<MulchingCostBreakdown />}
      factors={<MulchingCostFactors />}
      diyVsPro={<MulchingCostDiyVsPro />}
      faqItems={mulchingCostFaq}
      calculatorSlug={guide.calculatorSlug}
      calculatorName={guide.calculatorName}
    />
  );
}
