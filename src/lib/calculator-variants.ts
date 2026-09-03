import { ReactNode } from "react";
import { FaqItem } from "@/components/FaqSection";

/**
 * A "variant" is a long-tail landing page that reuses a calculator's
 * underlying widget and core explanation, but targets a different search
 * query with its own title, intro, and extra guidance/FAQ specific to
 * that use case (e.g. "Concrete Driveway Calculator" vs the base
 * "Concrete Calculator"). This is how the site scales from 5 core tools
 * into dozens of indexable pages without duplicating calculator logic.
 */
export interface CalculatorVariant {
  /** URL segment: /calculators/<baseSlug>/<slug> */
  slug: string;
  /** Page <title> and <h1> */
  title: string;
  /** Meta description */
  metaDescription: string;
  /** Intro paragraph shown under the H1 */
  intro: string;
  /** Extra paragraph(s) specific to this variant's use case, appended to the shared buying/material guidance section */
  extraGuidance: ReactNode;
  /** FAQ items specific to this variant, shown before the shared base FAQ */
  extraFaq: FaqItem[];
}
