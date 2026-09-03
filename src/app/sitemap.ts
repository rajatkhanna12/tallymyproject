import type { MetadataRoute } from "next";
import { calculators, siteConfig } from "@/lib/calculators-data";
import { concreteVariants } from "./calculators/concrete/variants";
import { tileVariants } from "./calculators/tile/variants";
import { roofingVariants } from "./calculators/roofing/variants";
import { mulchGravelVariants } from "./calculators/mulch-gravel/variants";
import { flooringVariants } from "./calculators/flooring/variants";

const variantsBySlug: Record<string, { slug: string }[]> = {
  concrete: concreteVariants,
  tile: tileVariants,
  roofing: roofingVariants,
  "mulch-gravel": mulchGravelVariants,
  flooring: flooringVariants,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const calculatorEntries: MetadataRoute.Sitemap = calculators.map((calc) => ({
    url: `${siteConfig.url}/calculators/${calc.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const variantEntries: MetadataRoute.Sitemap = calculators.flatMap((calc) =>
    (variantsBySlug[calc.slug] ?? []).map((variant) => ({
      url: `${siteConfig.url}/calculators/${calc.slug}/${variant.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
  );

  return [
    {
      url: siteConfig.url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    ...calculatorEntries,
    ...variantEntries,
  ];
}
