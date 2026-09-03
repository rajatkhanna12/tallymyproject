import { CalculatorVariant } from "@/lib/calculator-variants";

export const tileVariants: CalculatorVariant[] = [
  {
    slug: "floor-tile-calculator",
    title: "Floor Tile Calculator",
    metaDescription:
      "Calculate how many floor tiles and boxes you need — enter room size and tile dimensions for an instant estimate with waste allowance.",
    intro:
      "Calculate tiles and boxes for a floor installation, from a small bathroom to an open-plan living area.",
    extraGuidance:
      "For floors, factor in doorways and closets as part of the room's total area rather than calculating them separately — it's simpler and the extra material becomes part of your waste buffer. Large-format floor tiles (18″ or bigger) need a very flat subfloor; check for more than 1/8″ of variation over 10 feet before installing.",
    extraFaq: [
      {
        question: "Do I need to tile under cabinets or appliances?",
        answer:
          "Generally no for permanent, built-in cabinets — tiling stops at the cabinet line. But it's common practice to tile under ranges, refrigerators, and dishwashers in case they're replaced later, so include that area in your total.",
      },
    ],
  },
  {
    slug: "bathroom-tile-calculator",
    title: "Bathroom Tile Calculator",
    metaDescription:
      "Calculate tiles and boxes for a bathroom floor or shower wall — with the higher waste allowance bathrooms typically need.",
    intro:
      "Estimate tile and box quantities for a bathroom floor or wall, accounting for the fixtures and cuts bathrooms typically involve.",
    extraGuidance:
      "Bathrooms usually need a higher waste allowance than open rooms — 15% is a safer starting point — because toilets, vanities, and tight corners create more small cuts and offcuts that can't be reused. If you're tiling a shower wall as well as the floor, calculate them as two separate areas since wall tile is often a different size or material than floor tile.",
    extraFaq: [
      {
        question: "How much waste allowance for a bathroom floor?",
        answer:
          "Use 15% instead of the standard 10% for bathrooms — the toilet flange, vanity, and tight corners create more cuts and offcuts than a typical open room.",
      },
    ],
  },
  {
    slug: "how-many-tiles-do-i-need",
    title: "How Many Tiles Do I Need? Calculator",
    metaDescription:
      "Quickly calculate exactly how many tiles you need for any room — enter your measurements and get tiles, boxes, and estimated cost.",
    intro:
      "Enter your room and tile measurements to get a straight answer: exactly how many tiles and boxes to buy.",
    extraGuidance:
      "If you're not sure of your exact tile size, check the box label — most tile is labeled in inches (e.g. 12×24) but sold with a slightly different actual size due to rectified edges. Use the labeled size for this calculator; the small difference won't meaningfully change your box count.",
    extraFaq: [
      {
        question: "What information do I need before using a tile calculator?",
        answer:
          "You need your room's length and width (or total square footage), your chosen tile's length and width, and how many square feet one box covers — all of this is usually printed on the tile box or product page.",
      },
    ],
  },
];
