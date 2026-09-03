export type CalculatorCategory = "Construction" | "Landscaping" | "Flooring & Tile";

export interface CalculatorMeta {
  slug: string;
  name: string;
  shortDescription: string;
  category: CalculatorCategory;
  keywords: string[];
}

export const calculators: CalculatorMeta[] = [
  {
    slug: "concrete",
    name: "Concrete Calculator",
    shortDescription:
      "Calculate concrete volume, bags needed, and cost for slabs, footings, and columns.",
    category: "Construction",
    keywords: [
      "concrete calculator",
      "concrete slab calculator",
      "concrete bags calculator",
      "how much concrete do i need",
      "concrete yardage calculator",
    ],
  },
  {
    slug: "tile",
    name: "Tile Calculator",
    shortDescription:
      "Calculate how many tiles and boxes you need for floors and walls, including waste.",
    category: "Flooring & Tile",
    keywords: [
      "tile calculator",
      "how many tiles do i need",
      "tile boxes calculator",
      "floor tile calculator",
      "bathroom tile calculator",
    ],
  },
  {
    slug: "roofing",
    name: "Roofing Calculator",
    shortDescription:
      "Estimate roofing squares, shingle bundles, and materials from roof size and pitch.",
    category: "Construction",
    keywords: [
      "roofing calculator",
      "roof shingles calculator",
      "roofing squares calculator",
      "how many shingles do i need",
      "roof pitch calculator",
    ],
  },
  {
    slug: "mulch-gravel",
    name: "Mulch & Gravel Calculator",
    shortDescription:
      "Calculate cubic yards and bags of mulch, gravel, or topsoil needed for your yard.",
    category: "Landscaping",
    keywords: [
      "mulch calculator",
      "gravel calculator",
      "how much mulch do i need",
      "gravel driveway calculator",
      "cubic yards calculator",
    ],
  },
  {
    slug: "flooring",
    name: "Flooring Calculator",
    shortDescription:
      "Calculate flooring materials and cost for hardwood, laminate, and vinyl floors.",
    category: "Flooring & Tile",
    keywords: [
      "flooring calculator",
      "hardwood flooring calculator",
      "laminate flooring calculator",
      "how much flooring do i need",
      "square feet flooring calculator",
    ],
  },
];

export function getCalculator(slug: string): CalculatorMeta | undefined {
  return calculators.find((c) => c.slug === slug);
}

export function getRelatedCalculators(slug: string, count = 3): CalculatorMeta[] {
  const current = getCalculator(slug);
  const others = calculators.filter((c) => c.slug !== slug);
  if (!current) return others.slice(0, count);
  // Prefer same-category calculators first
  const sameCategory = others.filter((c) => c.category === current.category);
  const rest = others.filter((c) => c.category !== current.category);
  return [...sameCategory, ...rest].slice(0, count);
}

export const siteConfig = {
  name: "Tally My Project",
  shortName: "Tally My Project",
  tagline: "Tally up what you need for every home improvement project.",
  description:
    "Free calculators that tally the exact materials, quantities, and costs for your concrete, tile, roofing, flooring, and landscaping projects.",
  url: "https://tallymyproject.com",
};
