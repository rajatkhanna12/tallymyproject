import type { Metadata } from "next";
import CalculatorShell from "@/components/CalculatorShell";
import StampDutyWidget from "./StampDutyWidget";
import {
  StampDutyFormula,
  StampDutyExample,
  StampDutyGuidance,
  stampDutyBaseFaq,
} from "./content";

export const metadata: Metadata = {
  title: "Stamp Duty & Registration Calculator - India",
  description:
    "Free stamp duty and registration charges calculator for 15 Indian states. Instantly estimate government charges and total cost for your property purchase.",
  alternates: { canonical: "/calculators/stamp-duty" },
};

export default function StampDutyCalculatorPage() {
  return (
    <CalculatorShell
      slug="stamp-duty"
      title="Stamp Duty & Registration Calculator"
      intro="Estimate stamp duty and registration charges for your property purchase — by state, and by whether the property is registered in a man's or woman's name."
      calculator={<StampDutyWidget />}
      formula={<StampDutyFormula />}
      example={<StampDutyExample />}
      materialGuidance={<StampDutyGuidance />}
      materialGuidanceHeading="Stamp duty guidance"
      faqItems={stampDutyBaseFaq}
    />
  );
}
