import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CalculatorVariantShell from "@/components/CalculatorVariantShell";
import RoofingCalculatorWidget from "../RoofingCalculatorWidget";
import { RoofingFormula, RoofingExample, RoofingMaterialGuidance, roofingBaseFaq } from "../content";
import { roofingVariants } from "../variants";

export function generateStaticParams() {
  return roofingVariants.map((v) => ({ variant: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ variant: string }>;
}): Promise<Metadata> {
  const { variant: variantSlug } = await params;
  const variant = roofingVariants.find((v) => v.slug === variantSlug);
  if (!variant) return {};
  return {
    title: variant.title,
    description: variant.metaDescription,
    alternates: { canonical: `/calculators/roofing/${variant.slug}` },
  };
}

export default async function RoofingVariantPage({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  const { variant: variantSlug } = await params;
  const variant = roofingVariants.find((v) => v.slug === variantSlug);
  if (!variant) notFound();

  return (
    <CalculatorVariantShell
      baseSlug="roofing"
      baseName="Roofing Calculator"
      variant={variant}
      calculator={<RoofingCalculatorWidget />}
      formula={<RoofingFormula />}
      example={<RoofingExample />}
      materialGuidance={<RoofingMaterialGuidance />}
      baseFaq={roofingBaseFaq}
    />
  );
}
