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
  {
    slug: "fence-post-calculator",
    title: "Concrete Calculator for Fence Posts",
    metaDescription:
      "Calculate how many bags of concrete you need per fence post — use the round footing mode with your post hole diameter and depth.",
    intro:
      "Work out how many bags of concrete each fence post footing needs, then multiply by your total number of posts.",
    extraGuidance:
      "Use the \"Round column / footing\" mode above: enter your post hole's diameter (typically 3× the post width — a 4″ post usually gets a 10–12″ hole) and depth (generally 1/3 to 1/2 of the post's above-ground height, and always below your local frost line). The calculator gives you bags needed for one hole — multiply that number by your total post count to get the full material list. Most residential fence posts use one to two 50–80 lb bags per hole.",
    extraFaq: [
      {
        question: "How many bags of concrete per fence post?",
        answer:
          "A typical fence post hole (10–12″ diameter, 24″ deep) takes about 1.5–2 bags of 80 lb concrete mix. Use the round footing mode with your exact hole diameter and depth for a precise number, then multiply by your post count.",
      },
    ],
  },
  {
    slug: "concrete-steps-calculator",
    title: "Concrete Steps Calculator",
    metaDescription:
      "Estimate concrete volume, bags, and cost for a set of steps by calculating each step as its own slab and adding them together.",
    intro:
      "Estimate the concrete needed for a set of steps by treating each step as its own small slab, then adding up the totals.",
    extraGuidance:
      "This calculator doesn't have a dedicated stair shape, but steps are easy to estimate accurately with the rectangular slab mode: run the calculator once per step, using that step's tread length, width, and riser height as the thickness, then add up the cubic yards and bags across all steps. Add a 10% waste allowance per step since hand-forming stair edges creates more spillage than a flat slab.",
    extraFaq: [
      {
        question: "How do I calculate concrete for stairs?",
        answer:
          "Treat each step as its own rectangular slab — its tread length × width × riser height — and run the calculator once per step, then add the results together. This is more accurate than trying to estimate the whole staircase as one shape.",
      },
    ],
  },
];
