import type { Metadata } from "next";
import GuideShell from "@/components/GuideShell";
import { getGuide } from "@/lib/guides-data";
import {
  ConcreteDrivewayCostSummary,
  ConcreteDrivewayCostBreakdown,
  ConcreteDrivewayCostFactors,
  ConcreteDrivewayCostDiyVsPro,
  concreteDrivewayCostFaq,
} from "./content";

const guide = getGuide("concrete-driveway-cost")!;

export const metadata: Metadata = {
  title: `${guide.title} (2026)`,
  description: guide.metaDescription,
  alternates: { canonical: "/guides/concrete-driveway-cost" },
};

export default function ConcreteDrivewayCostPage() {
  return (
    <GuideShell
      slug={guide.slug}
      title={guide.title}
      intro={guide.intro}
      updated="September 2026"
      costSummary={<ConcreteDrivewayCostSummary />}
      breakdown={<ConcreteDrivewayCostBreakdown />}
      factors={<ConcreteDrivewayCostFactors />}
      diyVsPro={<ConcreteDrivewayCostDiyVsPro />}
      faqItems={concreteDrivewayCostFaq}
      calculatorSlug={guide.calculatorSlug}
      calculatorName={guide.calculatorName}
    />
  );
}
