export type CalculatorCategory = "Construction" | "Landscaping" | "Flooring & Tile" | "Real Estate & Finance";

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
  {
    slug: "home-loan-emi",
    name: "Home Loan EMI Calculator",
    shortDescription:
      "Calculate your monthly home loan EMI, total interest, and total repayment instantly.",
    category: "Real Estate & Finance",
    keywords: [
      "home loan emi calculator",
      "housing loan emi calculator",
      "emi calculator india",
      "home loan calculator",
      "loan emi calculator online",
    ],
  },
  {
    slug: "stamp-duty",
    name: "Stamp Duty & Registration Calculator",
    shortDescription:
      "Estimate stamp duty and registration charges for your property purchase, by state.",
    category: "Real Estate & Finance",
    keywords: [
      "stamp duty calculator",
      "stamp duty calculator india",
      "property registration charges calculator",
      "registration charges calculator",
      "stamp duty calculator by state",
    ],
  },
  {
    slug: "rent-vs-buy",
    name: "Rent vs Buy Calculator",
    shortDescription:
      "Compare your projected net worth from buying vs. renting and investing, over any time horizon.",
    category: "Real Estate & Finance",
    keywords: [
      "rent vs buy calculator",
      "rent vs buy calculator india",
      "should i rent or buy",
      "buy vs rent calculator",
      "home buying vs renting calculator",
    ],
  },
  {
    slug: "property-tax",
    name: "Property Tax Calculator",
    shortDescription:
      "Estimate your annual property tax from assessed value, tax rate, and rebates.",
    category: "Real Estate & Finance",
    keywords: [
      "property tax calculator",
      "property tax calculator india",
      "annual property tax calculator",
      "municipal property tax calculator",
      "house tax calculator",
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

/**
 * Which market a calculator belongs to. The site currently serves two
 * distinct audiences on one domain: US home-improvement calculators
 * (Construction / Landscaping / Flooring & Tile) and India real-estate
 * calculators ("Real Estate & Finance"). Used to group navigation,
 * breadcrumbs, and the homepage grid.
 */
export function getCalculatorMarket(category: CalculatorCategory): "US" | "India" {
  return category === "Real Estate & Finance" ? "India" : "US";
}

export const siteConfig = {
  name: "Tally My Project",
  shortName: "Tally My Project",
  tagline: "Home improvement calculators, India real estate tools, and house planning.",
  description:
    "Free calculators for home improvement projects (concrete, tile, roofing, flooring), India real estate (home loan EMI, stamp duty, rent vs buy, property tax), and AI-generated house floor plans.",
  url: "https://tallymyproject.com",
};
