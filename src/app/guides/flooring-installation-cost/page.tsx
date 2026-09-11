import type { Metadata } from "next";
import GuideShell from "@/components/GuideShell";
import { getGuide } from "@/lib/guides-data";
import {
  FlooringInstallationCostSummary,
  FlooringInstallationCostBreakdown,
  FlooringInstallationCostFactors,
  FlooringInstallationCostDiyVsPro,
  flooringInstallationCostFaq,
} from "./content";

const guide = getGuide("flooring-installation-cost")!;

export const metadata: Metadata = {
  title: `${guide.title} (2026)`,
  description: guide.metaDescription,
  alternates: { canonical: "/guides/flooring-installation-cost" },
};

export default function FlooringInstallationCostPage() {
  return (
    <GuideShell
      slug={guide.slug}
      title={guide.title}
      intro={guide.intro}
      updated="September 2026"
      costSummary={<FlooringInstallationCostSummary />}
      breakdown={<FlooringInstallationCostBreakdown />}
      factors={<FlooringInstallationCostFactors />}
      diyVsPro={<FlooringInstallationCostDiyVsPro />}
      faqItems={flooringInstallationCostFaq}
      calculatorSlug={guide.calculatorSlug}
      calculatorName={guide.calculatorName}
    />
  );
}
