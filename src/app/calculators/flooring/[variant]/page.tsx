import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CalculatorVariantShell from "@/components/CalculatorVariantShell";
import FlooringCalculatorWidget from "../FlooringCalculatorWidget";
import { FlooringFormula, FlooringExample, FlooringMaterialGuidance, flooringBaseFaq } from "../content";
import { flooringVariants } from "../variants";

export function generateStaticParams() {
  return flooringVariants.map((v) => ({ variant: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ variant: string }>;
}): Promise<Metadata> {
  const { variant: variantSlug } = await params;
  const variant = flooringVariants.find((v) => v.slug === variantSlug);
  if (!variant) return {};
  return {
    title: variant.title,
    description: variant.metaDescription,
    alternates: { canonical: `/calculators/flooring/${variant.slug}` },
  };
}

export default async function FlooringVariantPage({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  const { variant: variantSlug } = await params;
  const variant = flooringVariants.find((v) => v.slug === variantSlug);
  if (!variant) notFound();

  return (
    <CalculatorVariantShell
      baseSlug="flooring"
      baseName="Flooring Calculator"
      variant={variant}
      calculator={<FlooringCalculatorWidget />}
      formula={<FlooringFormula />}
      example={<FlooringExample />}
      materialGuidance={<FlooringMaterialGuidance />}
      baseFaq={flooringBaseFaq}
    />
  );
}
