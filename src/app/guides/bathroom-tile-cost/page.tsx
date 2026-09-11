import type { Metadata } from "next";
import GuideShell from "@/components/GuideShell";
import { getGuide } from "@/lib/guides-data";
import {
  BathroomTileCostSummary,
  BathroomTileCostBreakdown,
  BathroomTileCostFactors,
  BathroomTileCostDiyVsPro,
  bathroomTileCostFaq,
} from "./content";

const guide = getGuide("bathroom-tile-cost")!;

export const metadata: Metadata = {
  title: `${guide.title} (2026)`,
  description: guide.metaDescription,
  alternates: { canonical: "/guides/bathroom-tile-cost" },
};

export default function BathroomTileCostPage() {
  return (
    <GuideShell
      slug={guide.slug}
      title={guide.title}
      intro={guide.intro}
      updated="September 2026"
      costSummary={<BathroomTileCostSummary />}
      breakdown={<BathroomTileCostBreakdown />}
      factors={<BathroomTileCostFactors />}
      diyVsPro={<BathroomTileCostDiyVsPro />}
      faqItems={bathroomTileCostFaq}
      calculatorSlug={guide.calculatorSlug}
      calculatorName={guide.calculatorName}
    />
  );
}
