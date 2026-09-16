import type { Metadata } from "next";
import CalculatorShell from "@/components/CalculatorShell";
import RentVsBuyWidget from "./RentVsBuyWidget";
import {
  RentVsBuyFormula,
  RentVsBuyExample,
  RentVsBuyGuidance,
  rentVsBuyBaseFaq,
} from "./content";

export const metadata: Metadata = {
  title: "Rent vs Buy Calculator - India",
  description:
    "Free rent vs buy calculator for India. Compare your projected net worth from buying a home versus renting and investing the difference, over any time horizon.",
  alternates: { canonical: "/calculators/rent-vs-buy" },
};

export default function RentVsBuyCalculatorPage() {
  return (
    <CalculatorShell
      slug="rent-vs-buy"
      title="Rent vs Buy Calculator"
      intro="Compare your projected net worth from buying a home versus renting an equivalent one and investing the difference — over any time horizon you choose."
      calculator={<RentVsBuyWidget />}
      formula={<RentVsBuyFormula />}
      example={<RentVsBuyExample />}
      materialGuidance={<RentVsBuyGuidance />}
      materialGuidanceHeading="How to use this comparison"
      faqItems={rentVsBuyBaseFaq}
    />
  );
}
