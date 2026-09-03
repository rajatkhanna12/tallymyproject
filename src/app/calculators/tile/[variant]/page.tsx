import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CalculatorVariantShell from "@/components/CalculatorVariantShell";
import TileCalculatorWidget from "../TileCalculatorWidget";
import { TileFormula, TileExample, TileMaterialGuidance, tileBaseFaq } from "../content";
import { tileVariants } from "../variants";

export function generateStaticParams() {
  return tileVariants.map((v) => ({ variant: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ variant: string }>;
}): Promise<Metadata> {
  const { variant: variantSlug } = await params;
  const variant = tileVariants.find((v) => v.slug === variantSlug);
  if (!variant) return {};
  return {
    title: variant.title,
    description: variant.metaDescription,
    alternates: { canonical: `/calculators/tile/${variant.slug}` },
  };
}

export default async function TileVariantPage({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  const { variant: variantSlug } = await params;
  const variant = tileVariants.find((v) => v.slug === variantSlug);
  if (!variant) notFound();

  return (
    <CalculatorVariantShell
      baseSlug="tile"
      baseName="Tile Calculator"
      variant={variant}
      calculator={<TileCalculatorWidget />}
      formula={<TileFormula />}
      example={<TileExample />}
      materialGuidance={<TileMaterialGuidance />}
      baseFaq={tileBaseFaq}
    />
  );
}
