import { CalculatorVariant } from "@/lib/calculator-variants";

export const mulchGravelVariants: CalculatorVariant[] = [
  {
    slug: "mulch-calculator",
    title: "Mulch Calculator",
    metaDescription:
      "Calculate exactly how much mulch you need for your garden beds — cubic yards, bags, and cost from area and depth.",
    intro:
      "Find out how many bags or cubic yards of mulch to buy for your garden beds and landscaping.",
    extraGuidance:
      "Keep mulch a few inches away from tree trunks and plant stems — piling it directly against them (a \"mulch volcano\") traps moisture and encourages rot and pests. Refresh mulch annually since organic types break down and lose their weed-suppressing depth over a season.",
    extraFaq: [
      {
        question: "How often should I replace mulch?",
        answer:
          "Organic mulch (wood chips, bark) typically breaks down and needs topping up once a year. You often won't need a full fresh layer — just enough to bring the depth back to 2-3 inches.",
      },
    ],
  },
  {
    slug: "gravel-calculator",
    title: "Gravel Calculator",
    metaDescription:
      "Calculate how much gravel you need for a path, bed, or base layer — cubic yards, bags, and cost from area and depth.",
    intro:
      "Calculate gravel volume for a pathway, drainage bed, or decorative ground cover.",
    extraGuidance:
      "Gravel is sold by size grade as well as volume — pea gravel and decorative stone are typically 1-2 inches deep for walkways, while a compactable base layer (like crushed limestone) for a patio or shed foundation is usually 4 inches deep, compacted in stages rather than dumped all at once.",
    extraFaq: [
      {
        question: "What size gravel should I use for a path?",
        answer:
          "Pea gravel (3/8″) is the most common choice for walkways since it's comfortable underfoot. For a more stable, walkable surface, crushed/angular gravel (3/4″) locks together better than smooth pea gravel.",
      },
    ],
  },
  {
    slug: "gravel-driveway-calculator",
    title: "Gravel Driveway Calculator",
    metaDescription:
      "Calculate how much gravel you need for a driveway — cubic yards and cost, with the layered base depth a driveway actually needs.",
    intro:
      "Estimate gravel volume and cost for a driveway, which needs more depth and layering than a garden path.",
    extraGuidance:
      "A gravel driveway needs a layered base, not a single dump: typically 4 inches of larger crushed base rock compacted first, then a 2-inch top layer of smaller decorative gravel — so plan on roughly 6 inches of total depth across two material types rather than one calculation. Recalculate this tool separately for the base layer and the top layer using their respective depths.",
    extraFaq: [
      {
        question: "How much gravel do I need for a driveway?",
        answer:
          "Plan for two layers: a compacted base of about 4 inches (larger crushed stone) and a top layer of about 2 inches (smaller decorative gravel). Run this calculator once per layer using each layer's depth for an accurate total.",
      },
    ],
  },
];
