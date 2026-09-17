import type { Metadata } from "next";
import CalculatorShell from "@/components/CalculatorShell";
import PropertyTaxWidget from "./PropertyTaxWidget";
import {
  PropertyTaxFormula,
  PropertyTaxExample,
  PropertyTaxGuidance,
  propertyTaxBaseFaq,
} from "./content";

export const metadata: Metadata = {
  title: "Property Tax Calculator - India",
  description: "Free property tax calculator for India. Estimate annual tax from assessed value, tax rate, and early-payment rebate.",
  alternates: { canonical: "/calculators/property-tax" },
};

export default function PropertyTaxCalculatorPage() {
  return (
    <CalculatorShell
      slug="property-tax"
      title="Property Tax Calculator"
      intro="Estimate your annual property tax from your assessed/annual value, local tax rate, and any early-payment rebate — plus how property tax actually works city to city in India."
      calculator={<PropertyTaxWidget />}
      formula={<PropertyTaxFormula />}
      example={<PropertyTaxExample />}
      materialGuidance={<PropertyTaxGuidance />}
      materialGuidanceHeading="Rebates & how rates vary"
      faqItems={propertyTaxBaseFaq}
    />
  );
}
