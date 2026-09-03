import { CalculatorVariant } from "@/lib/calculator-variants";

export const concreteVariants: CalculatorVariant[] = [
  {
    slug: "driveway-calculator",
    title: "Concrete Driveway Calculator",
    metaDescription:
      "Calculate how much concrete you need for a driveway — cubic yards, bags, and cost, with the right thickness and base prep guidance.",
    intro:
      "Estimate concrete volume and cost for a driveway slab, with guidance on the thickness and base prep driveways specifically need.",
    extraGuidance:
      "Driveways carry vehicle loads, so they need to be thicker than a patio or walkway: 4 inches is the minimum for cars, and 5–6 inches is recommended if you expect trucks or RVs. Always compact a 4–6 inch gravel base underneath before pouring, and use control joints every 8–10 feet to prevent random cracking as the slab expands and contracts with temperature.",
    extraFaq: [
      {
        question: "How thick should a concrete driveway be?",
        answer:
          "4 inches is the minimum for standard passenger vehicles. If the driveway will regularly see trucks, RVs, or other heavy loads, increase thickness to 5–6 inches and consider reinforcing with rebar or wire mesh.",
      },
    ],
  },
  {
    slug: "patio-calculator",
    title: "Concrete Patio Calculator",
    metaDescription:
      "Calculate concrete volume, bags, and cost for a patio slab — including the right thickness and finish tips for outdoor living spaces.",
    intro:
      "Work out how much concrete you need for a patio slab, plus practical guidance on thickness, slope, and finish for outdoor spaces.",
    extraGuidance:
      "A standard 4-inch slab is sufficient for most patios since they only carry foot traffic and furniture. Slope the surface slightly (about 1/8 inch per foot) away from your house so water drains properly instead of pooling near the foundation. A broom finish is the standard choice for patios since it adds slip resistance when wet.",
    extraFaq: [
      {
        question: "Does a concrete patio need to be sloped?",
        answer:
          "Yes — patios should slope away from the house at roughly 1/8 inch per foot of run to drain water away from your foundation instead of letting it pool.",
      },
    ],
  },
  {
    slug: "footing-calculator",
    title: "Concrete Footing Calculator",
    metaDescription:
      "Calculate concrete volume for footings — cubic yards, bags, and cost, with depth and frost-line guidance for a solid foundation.",
    intro:
      "Estimate the concrete you need for footings, with guidance on depth and sizing so your foundation meets code in your area.",
    extraGuidance:
      "Footing depth is usually determined by your local frost line — footings need to sit below it so freeze-thaw cycles don't heave the foundation. This varies significantly by climate (a few inches in warm regions, 3–4+ feet in cold ones), so always check your local building code before digging. Footings are typically wider than the wall or post they support, to spread the load over more soil.",
    extraFaq: [
      {
        question: "How deep should a concrete footing be?",
        answer:
          "Footing depth depends on your local frost line, which varies by climate — check your local building code. In cold climates footings often need to be 3-4 feet deep or more; in warm climates a few inches below grade may be sufficient.",
      },
    ],
  },
];
