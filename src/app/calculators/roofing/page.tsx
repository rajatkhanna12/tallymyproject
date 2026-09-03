import type { Metadata } from "next";
import CalculatorShell from "@/components/CalculatorShell";
import RoofingCalculatorWidget from "./RoofingCalculatorWidget";
import { RoofingFormula, RoofingExample, RoofingMaterialGuidance, roofingBaseFaq } from "./content";
import { roofingVariants } from "./variants";
import VariantLinks from "@/components/VariantLinks";

export const metadata: Metadata = {
  title: "Roofing Calculator - Squares, Shingle Bundles & Cost",
  description:
    "Free roofing calculator. Enter your building footprint and roof pitch to get roofing squares, shingle bundles needed, and an estimated material cost.",
  alternates: { canonical: "/calculators/roofing" },
};

export default function RoofingCalculatorPage() {
  return (
    <CalculatorShell
      slug="roofing"
      title="Roofing Calculator"
      intro="Estimate roofing squares, shingle bundles, and material cost from your building's footprint and roof pitch."
      calculator={<RoofingCalculatorWidget />}
      formula={<RoofingFormula />}
      example={<RoofingExample />}
      materialGuidance={
        <>
          <RoofingMaterialGuidance />
          <VariantLinks baseSlug="roofing" baseName="Roofing Calculator" variants={roofingVariants} />
        </>
      }
      faqItems={roofingBaseFaq}
    />
  );
}
