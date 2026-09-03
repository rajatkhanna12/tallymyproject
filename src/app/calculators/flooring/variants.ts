import { CalculatorVariant } from "@/lib/calculator-variants";

export const flooringVariants: CalculatorVariant[] = [
  {
    slug: "hardwood-flooring-calculator",
    title: "Hardwood Flooring Calculator",
    metaDescription:
      "Calculate how much solid or engineered hardwood flooring you need — square footage, boxes, and cost with the right waste allowance.",
    intro:
      "Estimate hardwood flooring materials and cost, with guidance on waste allowance and acclimation for solid and engineered wood.",
    extraGuidance:
      "Solid hardwood expands and contracts more with humidity than engineered wood, so leave a 3/4″ expansion gap around the room's perimeter (covered later by baseboard or trim) — this isn't extra material to buy, but it does slightly reduce your usable floor width, so round up rather than cutting it close.",
    extraFaq: [
      {
        question: "Solid or engineered hardwood — which needs more waste allowance?",
        answer:
          "Solid hardwood generally needs a slightly higher waste allowance (10-15%) than engineered hardwood (7-10%) because it's more prone to warping from humidity changes and often involves more selective cutting to match grain patterns.",
      },
    ],
  },
  {
    slug: "laminate-flooring-calculator",
    title: "Laminate Flooring Calculator",
    metaDescription:
      "Calculate how much laminate flooring you need — square footage, boxes, and cost, with the standard 10% waste allowance.",
    intro:
      "Work out laminate flooring quantities and cost for any room, with the standard waste allowance for click-lock planks.",
    extraGuidance:
      "Laminate planks click together in rows, so measure your room's longest wall to decide plank orientation — running planks parallel to the longest wall generally looks best and minimizes the number of end-cuts needed per row. Buy a couple of extra planks beyond the calculated amount specifically for future repairs, since laminate colors are frequently discontinued.",
    extraFaq: [
      {
        question: "Which direction should laminate flooring run?",
        answer:
          "As a general rule, run planks parallel to the room's longest wall or the main light source (like a row of windows) — this typically looks most natural and can also reduce the number of cuts needed.",
      },
    ],
  },
  {
    slug: "vinyl-flooring-calculator",
    title: "Vinyl Flooring Calculator",
    metaDescription:
      "Calculate how much vinyl plank or sheet flooring you need — square footage, boxes, and cost with a lower waste allowance.",
    intro:
      "Estimate vinyl plank or sheet flooring quantities, which typically need less waste allowance than wood or laminate.",
    extraGuidance:
      "Vinyl plank (LVP) is one of the most forgiving flooring types to estimate for, since planks are uniform and waste is usually just 5-7%. It can also be installed directly over most existing hard flooring, which can simplify the subfloor prep this calculator doesn't otherwise account for.",
    extraFaq: [
      {
        question: "Can vinyl plank flooring go over existing tile or laminate?",
        answer:
          "In many cases, yes — vinyl plank can often be installed over an existing hard, flat floor if it's in good condition, which saves on removal cost. Always check the manufacturer's installation guidelines first, since this varies by product.",
      },
    ],
  },
];
