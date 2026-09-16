export interface CostGuide {
  slug: string;
  title: string;
  shortTitle: string;
  metaDescription: string;
  intro: string;
  calculatorSlug: string;
  calculatorName: string;
  category?: "construction" | "finance";
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
    category: "construction",
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
    category: "construction",
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
    category: "construction",
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
    category: "construction",
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
    category: "construction",
  },
  {
    slug: "home-loan-emi-guide",
    title: "How Home Loan EMI Actually Works (and How to Lower It)",
    shortTitle: "Home Loan EMI, Explained",
    metaDescription:
      "How home loan EMI is actually calculated, why your early payments are mostly interest, and the moves that genuinely reduce what you pay.",
    intro:
      "What determines your EMI, why most of your early payments go toward interest rather than principal, and the levers that actually reduce your total cost.",
    calculatorSlug: "home-loan-emi",
    calculatorName: "Home Loan EMI Calculator",
    category: "finance",
  },
  {
    slug: "stamp-duty-guide",
    title: "Stamp Duty & Registration Charges: A First-Time Buyer's Guide",
    shortTitle: "Stamp Duty, Explained",
    metaDescription:
      "What stamp duty and registration charges actually cover, why the rate depends on your state and gender, and the budgeting mistakes buyers make.",
    intro:
      "Stamp duty and registration together can add 5-10% on top of your property price — what they actually pay for, and how to budget for them on time.",
    calculatorSlug: "stamp-duty",
    calculatorName: "Stamp Duty & Registration Calculator",
    category: "finance",
  },
  {
    slug: "rent-vs-buy-guide",
    title: "Rent vs Buy in India: How to Actually Decide",
    shortTitle: "Rent vs Buy, Decided",
    metaDescription:
      "A practical framework for the rent-vs-buy decision in India — the price-to-rent heuristic, the real trade-offs, and common mistakes in the comparison.",
    intro:
      "There's no single right answer to rent vs. buy — but there is a practical way to think it through, starting with a number you can check in a few minutes.",
    calculatorSlug: "rent-vs-buy",
    calculatorName: "Rent vs Buy Calculator",
    category: "finance",
  },
];

export function getGuide(slug: string): CostGuide | undefined {
  return guides.find((g) => g.slug === slug);
}

export function getOtherGuides(slug: string, count = 3): CostGuide[] {
  const current = guides.find((g) => g.slug === slug);
  const rest = guides.filter((g) => g.slug !== slug);
  if (!current?.category) return rest.slice(0, count);

  const sameCategory = rest.filter((g) => g.category === current.category);
  const otherCategory = rest.filter((g) => g.category !== current.category);
  return [...sameCategory, ...otherCategory].slice(0, count);
}
