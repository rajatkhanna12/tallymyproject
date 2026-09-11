import type { Metadata } from "next";
import GuideShell from "@/components/GuideShell";
import { getGuide } from "@/lib/guides-data";
import {
  NewRoofCostSummary,
  NewRoofCostBreakdown,
  NewRoofCostFactors,
  NewRoofCostDiyVsPro,
  newRoofCostFaq,
} from "./content";

const guide = getGuide("new-roof-cost")!;

export const metadata: Metadata = {
  title: `${guide.title} (2026)`,
  description: guide.metaDescription,
  alternates: { canonical: "/guides/new-roof-cost" },
};

export default function NewRoofCostPage() {
  return (
    <GuideShell
      slug={guide.slug}
      title={guide.title}
      intro={guide.intro}
      updated="September 2026"
      costSummary={<NewRoofCostSummary />}
      breakdown={<NewRoofCostBreakdown />}
      factors={<NewRoofCostFactors />}
      diyVsPro={<NewRoofCostDiyVsPro />}
      faqItems={newRoofCostFaq}
      calculatorSlug={guide.calculatorSlug}
      calculatorName={guide.calculatorName}
    />
  );
}
