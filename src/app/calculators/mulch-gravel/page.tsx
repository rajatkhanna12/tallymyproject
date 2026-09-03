import type { Metadata } from "next";
import CalculatorShell from "@/components/CalculatorShell";
import MulchGravelCalculatorWidget from "./MulchGravelCalculatorWidget";
import { MulchGravelFormula, MulchGravelExample, MulchGravelMaterialGuidance, mulchGravelBaseFaq } from "./content";
import { mulchGravelVariants } from "./variants";
import VariantLinks from "@/components/VariantLinks";

export const metadata: Metadata = {
  title: "Mulch & Gravel Calculator - Cubic Yards & Bags",
  description:
    "Free mulch, gravel, and topsoil calculator. Enter your area and depth to get cubic yards, bags needed, and estimated bulk delivery cost.",
  alternates: { canonical: "/calculators/mulch-gravel" },
};

export default function MulchGravelCalculatorPage() {
  return (
    <CalculatorShell
      slug="mulch-gravel"
      title="Mulch &amp; Gravel Calculator"
      intro="Calculate how much mulch, gravel, or topsoil you need for a bed, path, or driveway — in cubic yards and bags."
      calculator={<MulchGravelCalculatorWidget />}
      formula={<MulchGravelFormula />}
      example={<MulchGravelExample />}
      materialGuidance={
        <>
          <MulchGravelMaterialGuidance />
          <VariantLinks baseSlug="mulch-gravel" baseName="Mulch &amp; Gravel Calculator" variants={mulchGravelVariants} />
        </>
      }
      faqItems={mulchGravelBaseFaq}
    />
  );
}
