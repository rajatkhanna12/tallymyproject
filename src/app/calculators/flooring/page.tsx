import type { Metadata } from "next";
import CalculatorShell from "@/components/CalculatorShell";
import FlooringCalculatorWidget from "./FlooringCalculatorWidget";
import { FlooringFormula, FlooringExample, FlooringMaterialGuidance, flooringBaseFaq } from "./content";
import { flooringVariants } from "./variants";
import VariantLinks from "@/components/VariantLinks";

export const metadata: Metadata = {
  title: "Flooring Calculator - Hardwood, Laminate & Vinyl",
  description:
    "Free flooring calculator for hardwood, laminate, and vinyl. Enter your room size to get square footage, boxes needed, and estimated material cost.",
  alternates: { canonical: "/calculators/flooring" },
};

export default function FlooringCalculatorPage() {
  return (
    <CalculatorShell
      slug="flooring"
      title="Flooring Calculator"
      intro="Calculate how much hardwood, laminate, or vinyl flooring you need — including a waste allowance and estimated box count."
      calculator={<FlooringCalculatorWidget />}
      formula={<FlooringFormula />}
      example={<FlooringExample />}
      materialGuidance={
        <>
          <FlooringMaterialGuidance />
          <VariantLinks baseSlug="flooring" baseName="Flooring Calculator" variants={flooringVariants} />
        </>
      }
      faqItems={flooringBaseFaq}
    />
  );
}
