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
    exampleOverride: (
      <>
        <p>
          <strong>Project:</strong> a 12 ft × 11 ft bedroom in laminate,
          boxes covering 18 ft² each, 10% waste.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Room area = 12 × 11 = 132 ft²</li>
          <li>With 10% waste = 132 × 1.10 = 145.2 ft²</li>
          <li>Boxes needed = 145.2 ÷ 18 ≈ 9 boxes</li>
        </ul>
      </>
    ),
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
    exampleOverride: (
      <>
        <p>
          <strong>Project:</strong> a 14 ft × 9 ft kitchen in vinyl plank,
          boxes covering 20 ft² each, 6% waste.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Room area = 14 × 9 = 126 ft²</li>
          <li>With 6% waste = 126 × 1.06 = 133.6 ft²</li>
          <li>Boxes needed = 133.6 ÷ 20 ≈ 7 boxes</li>
        </ul>
        <p className="mt-3">
          Notice the lower waste percentage compared to hardwood or
          laminate — vinyl plank&rsquo;s uniform sizing means fewer boxes for
          the same room.
        </p>
      </>
    ),
  },
  {
    slug: "bamboo-flooring-calculator",
    title: "Bamboo Flooring Calculator",
    metaDescription:
      "Calculate how much bamboo flooring you need — square footage, boxes, and cost, with the waste allowance bamboo planks need.",
    intro:
      "Estimate bamboo flooring quantities and cost, using the hardwood or laminate tab as your base depending on your product's install type.",
    extraGuidance:
      "Use the \"hardwood\" tab above if your bamboo is solid/tongue-and-groove, or the \"laminate\" tab if it's a click-lock engineered bamboo product — both share bamboo's typical 7–10% waste allowance. Bamboo is harder and more dimensionally stable than most hardwoods but still expands and contracts with humidity, so let it acclimate in the install room for 48–72 hours beforehand, same as solid hardwood.",
    extraFaq: [
      {
        question: "How much waste allowance does bamboo flooring need?",
        answer:
          "7–10% is typical for bamboo flooring, similar to hardwood and laminate. Strand-woven bamboo in a herringbone or complex pattern may need closer to 15% due to the extra cuts involved.",
      },
    ],
    exampleOverride: (
      <>
        <p>
          <strong>Project:</strong> a 13 ft × 10 ft dining room in bamboo,
          boxes covering 19 ft² each, 8% waste.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Room area = 13 × 10 = 130 ft²</li>
          <li>With 8% waste = 130 × 1.08 = 140.4 ft²</li>
          <li>Boxes needed = 140.4 ÷ 19 ≈ 8 boxes</li>
        </ul>
      </>
    ),
  },
  {
    slug: "flooring-cost-calculator",
    title: "Flooring Cost Calculator",
    metaDescription:
      "Estimate total flooring project cost from square footage, waste allowance, and price per box — for any hardwood, laminate, or vinyl.",
    intro:
      "Get a materials-cost estimate for a flooring project by entering your room size, waste allowance, and box price.",
    extraGuidance:
      "This estimate covers flooring material cost only (boxes needed × price per box) — it doesn't include underlayment, transition strips, baseboard/trim, or installation labor, which together commonly add 30–50% on top of material cost for a professionally installed floor. For a full budget, get the material total here first, then add underlayment (typically $0.30–$1/ft²) and a labor quote from a local installer.",
    extraFaq: [
      {
        question: "What does flooring cost include besides the material?",
        answer:
          "Beyond the boxes of flooring itself, budget for underlayment, transition strips between rooms, removal of old flooring if needed, and installation labor — these commonly add 30–50% on top of material cost for a professionally installed floor.",
      },
    ],
    exampleOverride: (
      <>
        <p>
          <strong>Project:</strong> a 15 ft × 12 ft living room, 10% waste,
          boxes covering 22 ft² each at $85 per box.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Room area = 15 × 12 = 180 ft²</li>
          <li>With 10% waste = 180 × 1.10 = 198 ft²</li>
          <li>Boxes needed = 198 ÷ 22 = 9 boxes</li>
          <li>Material cost = 9 × $85 = $765</li>
        </ul>
        <p className="mt-3">
          That $765 is flooring material only. Add underlayment (roughly
          $0.30&ndash;$1/ft², or about $55&ndash;$180 here) and a labor
          quote, and a professionally installed room this size commonly
          lands in the $1,500&ndash;$2,200 range total.
        </p>
      </>
    ),
  },
];
