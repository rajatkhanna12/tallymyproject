import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CalculatorVariantShell from "@/components/CalculatorVariantShell";
import ConcreteCalculatorWidget from "../ConcreteCalculatorWidget";
import { ConcreteFormula, ConcreteExample, ConcreteMaterialGuidance, concreteBaseFaq } from "../content";
import { concreteVariants } from "../variants";

export function generateStaticParams() {
  return concreteVariants.map((v) => ({ variant: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ variant: string }>;
}): Promise<Metadata> {
  const { variant: variantSlug } = await params;
  const variant = concreteVariants.find((v) => v.slug === variantSlug);
  if (!variant) return {};
  return {
    title: variant.title,
    description: variant.metaDescription,
    alternates: { canonical: `/calculators/concrete/${variant.slug}` },
  };
}

export default async function ConcreteVariantPage({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  const { variant: variantSlug } = await params;
  const variant = concreteVariants.find((v) => v.slug === variantSlug);
  if (!variant) notFound();

  return (
    <CalculatorVariantShell
      baseSlug="concrete"
      baseName="Concrete Calculator"
      variant={variant}
      calculator={<ConcreteCalculatorWidget />}
      formula={<ConcreteFormula />}
      example={<ConcreteExample />}
      materialGuidance={<ConcreteMaterialGuidance />}
      baseFaq={concreteBaseFaq}
    />
  );
}
