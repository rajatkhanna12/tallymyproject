import { ReactNode } from "react";
import CalculatorShell from "@/components/CalculatorShell";
import { FaqItem } from "@/components/FaqSection";
import { CalculatorVariant } from "@/lib/calculator-variants";
import Link from "next/link";

interface CalculatorVariantShellProps {
  baseSlug: string;
  baseName: string;
  variant: CalculatorVariant;
  calculator: ReactNode;
  formula: ReactNode;
  example: ReactNode;
  materialGuidance: ReactNode;
  baseFaq: FaqItem[];
}

export default function CalculatorVariantShell({
  baseSlug,
  baseName,
  variant,
  calculator,
  formula,
  example,
  materialGuidance,
  baseFaq,
}: CalculatorVariantShellProps) {
  return (
    <CalculatorShell
      slug={baseSlug}
      title={variant.title}
      intro={variant.intro}
      calculator={calculator}
      formula={formula}
      example={example}
      materialGuidance={
        <>
          {materialGuidance}
          <div className="mt-4">{variant.extraGuidance}</div>
          <p className="mt-4 text-sm text-slate-500">
            This tool uses the same calculation engine as our full{" "}
            <Link href={`/calculators/${baseSlug}`} className="text-emerald-700 hover:underline">
              {baseName}
            </Link>
            , with guidance tailored to this project type.
          </p>
        </>
      }
      faqItems={[...variant.extraFaq, ...baseFaq]}
    />
  );
}
