import type { Metadata } from "next";
import CalculatorShell from "@/components/CalculatorShell";
import ConcreteCalculatorWidget from "./ConcreteCalculatorWidget";
import { ConcreteFormula, ConcreteExample, ConcreteMaterialGuidance, concreteBaseFaq } from "./content";
import { concreteVariants } from "./variants";
import VariantLinks from "@/components/VariantLinks";
import GuideLink from "@/components/GuideLink";

export const metadata: Metadata = {
  title: "Concrete Calculator - Yards, Bags & Cost Estimate",
  description:
    "Free concrete calculator for slabs, footings, and columns. Get cubic yards, number of 40/60/80 lb bags, and estimated cost instantly.",
  alternates: { canonical: "/calculators/concrete" },
};

export default function ConcreteCalculatorPage() {
  return (
    <CalculatorShell
      slug="concrete"
      title="Concrete Calculator"
      intro="Find out how much concrete you need for a slab, footing, or column — in cubic yards, bags, and estimated cost."
      calculator={<ConcreteCalculatorWidget />}
      formula={<ConcreteFormula />}
      example={<ConcreteExample />}
      materialGuidance={
        <>
          <ConcreteMaterialGuidance />
          <VariantLinks baseSlug="concrete" baseName="Concrete Calculator" variants={concreteVariants} />
          <GuideLink guideSlug="concrete-driveway-cost" guideTitle="How Much Does a Concrete Driveway Cost?" />
        </>
      }
      faqItems={concreteBaseFaq}
    />
  );
}
