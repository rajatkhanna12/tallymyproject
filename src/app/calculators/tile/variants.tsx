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
    exampleOverride: (
      <>
        <p>
          <strong>Project:</strong> a 16 ft × 14 ft living room floor, using
          24&Prime; × 24&Prime; tiles sold in boxes covering 16 ft² each,
          with 10% waste.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Room area = 16 × 14 = 224 ft²</li>
          <li>With 10% waste = 224 × 1.10 = 246.4 ft²</li>
          <li>One tile = (24 × 24) ÷ 144 = 4 ft²</li>
          <li>Tiles needed = 246.4 ÷ 4 ≈ 62 tiles</li>
          <li>Boxes needed = 246.4 ÷ 16 ≈ 16 boxes</li>
        </ul>
      </>
    ),
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
    exampleOverride: (
      <>
        <p>
          <strong>Project:</strong> a 10 ft × 8 ft kitchen floor, using
          18&Prime; × 18&Prime; tiles sold in boxes covering 13.5 ft² each,
          with 10% waste.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Room area = 10 × 8 = 80 ft²</li>
          <li>With 10% waste = 80 × 1.10 = 88 ft²</li>
          <li>One tile = (18 × 18) ÷ 144 = 2.25 ft²</li>
          <li>Tiles needed = 88 ÷ 2.25 ≈ 40 tiles</li>
          <li>Boxes needed = 88 ÷ 13.5 ≈ 7 boxes</li>
        </ul>
      </>
    ),
  },
  {
    slug: "backsplash-tile-calculator",
    title: "Backsplash Tile Calculator",
    metaDescription:
      "Calculate how many tiles and boxes you need for a kitchen or bathroom backsplash — enter your wall area for an instant estimate.",
    intro:
      "Work out tile and box quantities for a kitchen or bathroom backsplash, which needs a different waste allowance than a floor.",
    extraGuidance:
      "Measure backsplash area as total wall length × height (typically 18\" between counter and upper cabinets, more for a full-height design), and subtract outlets and windows only if they're large — small outlet cutouts are easier to fold into your waste buffer. Mosaic sheet tile (sold per sheet, not per piece) needs less waste than individual field tile since sheets flex around minor irregularities; larger format tile or a herringbone layout needs 15–20% given the frequent cuts around outlets and cabinet edges.",
    extraFaq: [
      {
        question: "How much tile do I need for a kitchen backsplash?",
        answer:
          "Measure your counter-to-cabinet wall length times height (commonly 18 inches) for the base area, add any exposed wall beside the range or window, then apply a 15% waste allowance for a standard layout — higher for mosaic or herringbone patterns with more cuts.",
      },
    ],
    exampleOverride: (
      <>
        <p>
          <strong>Project:</strong> a 10 ft counter run at 18 in tall (1.5
          ft), plus 3 ft² of exposed wall beside the range, using mosaic
          sheet tile that covers 1 ft² per sheet, with 15% waste.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Counter wall = 10 × 1.5 = 15 ft²</li>
          <li>Plus exposed wall = 15 + 3 = 18 ft²</li>
          <li>With 15% waste = 18 × 1.15 = 20.7 ft²</li>
          <li>Sheets needed = 20.7 ÷ 1 ≈ 21 sheets</li>
        </ul>
        <p className="mt-3">
          At roughly $10&ndash;$18 per sheet, that&rsquo;s about
          $210&ndash;$380 in tile — backsplashes are usually bought by
          coverage area rather than individual piece count since mosaic
          sheets are the standard format.
        </p>
      </>
    ),
  },
  {
    slug: "shower-tile-calculator",
    title: "Shower Tile Calculator",
    metaDescription:
      "Calculate tile and box quantities for a shower wall — with the higher waste allowance showers need for niches, corners, and plumbing.",
    intro:
      "Estimate tile and box quantities for shower walls, accounting for the niches, corners, and plumbing cutouts showers typically have.",
    extraGuidance:
      "Measure each shower wall separately (height × width, typically 7–8 ft tall for a full surround) and add them together before entering the total into the calculator. Use a 15–20% waste allowance rather than the standard 10% — corner returns, a niche, and plumbing valve cutouts all create small, unreusable offcuts. If the shower floor uses a different (usually smaller-format, slip-resistant) tile than the walls, calculate it as a separate area.",
    extraFaq: [
      {
        question: "How much waste allowance do I need for shower tile?",
        answer:
          "Use 15–20% instead of the standard 10% for shower walls — corners, a niche, and plumbing cutouts create more small cuts than a typical floor or backsplash, so the higher allowance avoids running short mid-installation.",
      },
    ],
    exampleOverride: (
      <>
        <p>
          <strong>Project:</strong> a 3-wall shower surround, 7 ft tall —
          two 2.5 ft side walls plus one 5 ft back wall, tiled with an 18%
          waste allowance for corners and a niche.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Side walls = 2 × (2.5 × 7) = 35 ft²</li>
          <li>Back wall = 5 × 7 = 35 ft²</li>
          <li>Total wall area = 35 + 35 = 70 ft²</li>
          <li>With 18% waste = 70 × 1.18 = 82.6 ft²</li>
          <li>Boxes needed (covering 10 ft² each) = 82.6 ÷ 10 ≈ 9 boxes</li>
        </ul>
        <p className="mt-3">
          This is walls only — if the shower floor uses a different tile
          (usually smaller-format and slip-resistant), run the calculator
          again for that area separately.
        </p>
      </>
    ),
  },
];
