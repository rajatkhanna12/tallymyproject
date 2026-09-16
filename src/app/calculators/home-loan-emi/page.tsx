import type { Metadata } from "next";
import CalculatorShell from "@/components/CalculatorShell";
import HomeLoanEmiWidget from "./HomeLoanEmiWidget";
import {
  HomeLoanEmiFormula,
  HomeLoanEmiExample,
  HomeLoanEmiGuidance,
  homeLoanEmiBaseFaq,
} from "./content";

export const metadata: Metadata = {
  title: "Home Loan EMI Calculator - Free & Instant",
  description:
    "Free home loan EMI calculator for India. Instantly see your monthly EMI, total interest, and total repayment for any loan amount, rate, and tenure.",
  alternates: { canonical: "/calculators/home-loan-emi" },
};

export default function HomeLoanEmiCalculatorPage() {
  return (
    <CalculatorShell
      slug="home-loan-emi"
      title="Home Loan EMI Calculator"
      intro="Calculate your monthly home loan EMI, total interest payable, and total repayment amount — instantly, for any loan amount, interest rate, and tenure."
      calculator={<HomeLoanEmiWidget />}
      formula={<HomeLoanEmiFormula />}
      example={<HomeLoanEmiExample />}
      materialGuidance={<HomeLoanEmiGuidance />}
      materialGuidanceHeading="EMI & repayment guidance"
      faqItems={homeLoanEmiBaseFaq}
    />
  );
}
