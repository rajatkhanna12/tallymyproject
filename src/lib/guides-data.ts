export interface CostGuide {
  slug: string;
  title: string;
  shortTitle: string;
  metaDescription: string;
  intro: string;
  calculatorSlug: string;
  calculatorName: string;
}

export const guides: CostGuide[] = [
  {
    slug: "concrete-driveway-cost",
    title: "How Much Does a Concrete Driveway Cost?",
    shortTitle: "Concrete Driveway Cost",
    metaDescription:
      "See real 2026 concrete driveway costs per square foot, by size, and by finish — plus what drives the price up or down.",
    intro:
      "A breakdown of what a concrete driveway actually costs — by size, by finish, and by what your specific site adds to the bill.",
    calculatorSlug: "concrete",
    calculatorName: "Concrete Calculator",
  },
  {
    slug: "bathroom-tile-cost",
    title: "How Much Does It Cost to Tile a Bathroom?",
    shortTitle: "Bathroom Tile Cost",
    metaDescription:
      "Real 2026 bathroom tiling costs — floor only, floor plus shower, and by tile type — plus what makes a quote run high.",
    intro:
      "What a bathroom tiling job actually costs, broken down by floor-only vs. floor-and-shower and by tile material.",
    calculatorSlug: "tile",
    calculatorName: "Tile Calculator",
  },
  {
    slug: "new-roof-cost",
    title: "How Much Does a New Roof Cost?",
    shortTitle: "New Roof Cost",
    metaDescription:
      "2026 roof replacement costs by roof size and shingle type — asphalt 3-tab, architectural, and metal — plus what changes your quote.",
    intro:
      "A realistic breakdown of roof replacement cost by size and shingle type, and the site factors that push a quote above the average.",
    calculatorSlug: "roofing",
    calculatorName: "Roofing Calculator",
  },
  {
    slug: "mulching-cost",
    title: "How Much Does It Cost to Mulch a Yard?",
    shortTitle: "Mulching Cost",
    metaDescription:
      "Mulch cost per cubic yard and per bag in 2026, plus typical professional installation pricing and what changes it.",
    intro:
      "What mulching a yard costs — bagged vs. bulk, by mulch type, and what a professional installer typically adds on top of material.",
    calculatorSlug: "mulch-gravel",
    calculatorName: "Mulch & Gravel Calculator",
  },
  {
    slug: "flooring-installation-cost",
    title: "How Much Does It Cost to Install New Flooring?",
    shortTitle: "Flooring Installation Cost",
    metaDescription:
      "2026 flooring installation costs per square foot for hardwood, laminate, vinyl, and tile — material vs. labor, broken down.",
    intro:
      "Installed flooring cost per square foot across hardwood, laminate, and vinyl — and how much of that is material vs. labor.",
    calculatorSlug: "flooring",
    calculatorName: "Flooring Calculator",
  },
];

export function getGuide(slug: string): CostGuide | undefined {
  return guides.find((g) => g.slug === slug);
}

export function getOtherGuides(slug: string, count = 3): CostGuide[] {
  return guides.filter((g) => g.slug !== slug).slice(0, count);
}
