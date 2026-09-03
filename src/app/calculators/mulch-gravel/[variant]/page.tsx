import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CalculatorVariantShell from "@/components/CalculatorVariantShell";
import MulchGravelCalculatorWidget from "../MulchGravelCalculatorWidget";
import { MulchGravelFormula, MulchGravelExample, MulchGravelMaterialGuidance, mulchGravelBaseFaq } from "../content";
import { mulchGravelVariants } from "../variants";

export function generateStaticParams() {
  return mulchGravelVariants.map((v) => ({ variant: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ variant: string }>;
}): Promise<Metadata> {
  const { variant: variantSlug } = await params;
  const variant = mulchGravelVariants.find((v) => v.slug === variantSlug);
  if (!variant) return {};
  return {
    title: variant.title,
    description: variant.metaDescription,
    alternates: { canonical: `/calculators/mulch-gravel/${variant.slug}` },
  };
}

export default async function MulchGravelVariantPage({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  const { variant: variantSlug } = await params;
  const variant = mulchGravelVariants.find((v) => v.slug === variantSlug);
  if (!variant) notFound();

  return (
    <CalculatorVariantShell
      baseSlug="mulch-gravel"
      baseName="Mulch & Gravel Calculator"
      variant={variant}
      calculator={<MulchGravelCalculatorWidget />}
      formula={<MulchGravelFormula />}
      example={<MulchGravelExample />}
      materialGuidance={<MulchGravelMaterialGuidance />}
      baseFaq={mulchGravelBaseFaq}
    />
  );
}
