import { CalculatorVariant } from "@/lib/calculator-variants";

export const roofingVariants: CalculatorVariant[] = [
  {
    slug: "shingle-calculator",
    title: "Roof Shingle Calculator",
    metaDescription:
      "Calculate how many shingle bundles you need for your roof — enter footprint and pitch for squares, bundles, and cost.",
    intro:
      "Find out exactly how many bundles of shingles to order based on your roof's size and pitch.",
    extraGuidance:
      "Always order slightly more bundles than the calculator shows if your roof has an unusual shape — L-shaped roofs, multiple dormers, or chimneys all create extra cuts that eat into your material faster than a simple rectangle. It's cheaper to have a couple of spare bundles than to place a second small order later.",
    extraFaq: [
      {
        question: "How many shingles come in a bundle?",
        answer:
          "A bundle typically covers about 33 square feet (1/3 of a 100 sq ft square), so 3 bundles make one square. The exact shingle count per bundle varies by product — check the wrapper for your specific brand.",
      },
    ],
  },
  {
    slug: "roof-pitch-calculator",
    title: "Roof Pitch Calculator",
    metaDescription:
      "Calculate your roof's pitch multiplier and true surface area from rise and run — plus shingle bundles and material cost.",
    intro:
      "Convert your roof's pitch (rise per 12″ of run) into true roof surface area, roofing squares, and shingle bundles.",
    extraGuidance:
      "To measure your roof pitch without going up on the roof, use a level and tape measure in the attic: hold the level horizontal against a rafter, measure 12 inches out from the wall along the level, then measure straight down to the rafter — that measurement in inches is your rise (e.g. an 8-inch drop over 12 inches is an 8/12 pitch).",
    extraFaq: [
      {
        question: "How do I measure my roof pitch?",
        answer:
          "In the attic, hold a level horizontally against a rafter, mark a point 12 inches out along the level, then measure straight down to the rafter at that mark. That distance in inches is your rise — for example, an 8-inch measurement means an 8/12 pitch.",
      },
    ],
    exampleOverride: (
      <>
        <p>
          <strong>Project:</strong> a 24 ft × 36 ft footprint with a steep
          8/12 pitch, 10% waste, 3 bundles per square.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Footprint area = 24 × 36 = 864 ft²</li>
          <li>Pitch multiplier = √(8² + 12²) ÷ 12 ≈ 1.202</li>
          <li>Roof area = 864 × 1.202 ≈ 1,038.5 ft²</li>
          <li>With 10% waste ≈ 1,142.3 ft²</li>
          <li>Roofing squares = 1,142.3 ÷ 100 ≈ 11.42 squares</li>
          <li>Bundles = 11.42 × 3 ≈ 35 bundles</li>
        </ul>
        <p className="mt-3">
          Notice the pitch multiplier alone adds almost 20% more surface
          area than the flat footprint suggests — the steeper the pitch,
          the bigger that gap gets, which is exactly why footprint size
          alone can't tell you how much material to buy.
        </p>
      </>
    ),
  },
  {
    slug: "roofing-squares-calculator",
    title: "Roofing Squares Calculator",
    metaDescription:
      "Calculate how many roofing squares your roof needs from footprint and pitch — the standard unit roofers and suppliers use for quotes.",
    intro:
      "Convert your roof's footprint and pitch into roofing squares — the standard unit contractors and suppliers use to quote materials and labor.",
    extraGuidance:
      "\"Squares\" is the unit roofers actually work in when quoting a job — 1 square always equals 100 square feet of roof surface, regardless of material (shingles, metal, or tile). Knowing your square count lets you compare quotes and material costs across different roofing products on an apples-to-apples basis.",
    extraFaq: [
      {
        question: "What is a roofing square?",
        answer:
          "A roofing square is 100 square feet of roof surface area. It's the standard unit roofing contractors and material suppliers use for quotes and pricing, regardless of the roofing material chosen.",
      },
    ],
    exampleOverride: (
      <>
        <p>
          <strong>Project:</strong> a 50 ft × 26 ft footprint with a gentle
          4/12 pitch, 10% waste.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Footprint area = 50 × 26 = 1,300 ft²</li>
          <li>Pitch multiplier = √(4² + 12²) ÷ 12 ≈ 1.054</li>
          <li>Roof area = 1,300 × 1.054 ≈ 1,370.2 ft²</li>
          <li>With 10% waste ≈ 1,507.2 ft²</li>
          <li>Roofing squares = 1,507.2 ÷ 100 ≈ 15.07 squares</li>
        </ul>
        <p className="mt-3">
          That&rsquo;s the number you&rsquo;d give a contractor or
          supplier: &ldquo;just over 15 squares.&rdquo; From there, bundle
          count depends on the material — 3 bundles per square for
          standard 3-tab shingles, more for architectural or metal.
        </p>
      </>
    ),
  },
  {
    slug: "architectural-shingle-calculator",
    title: "Architectural Shingle Calculator",
    metaDescription:
      "Calculate how many bundles of architectural (dimensional) shingles you need — adjust bundles-per-square for your specific product line.",
    intro:
      "Calculate bundle counts for architectural (dimensional) shingles, which often cover less area per bundle than standard 3-tab shingles.",
    extraGuidance:
      "Architectural shingles are heavier and thicker than 3-tab, so many product lines use 4 bundles per square instead of the standard 3 — check your chosen product's packaging or spec sheet for its exact coverage before ordering, since this varies by manufacturer. They also typically carry longer warranties (25–30 years vs. 15–20 for 3-tab) and better wind ratings, which is worth factoring into a cost comparison beyond just the per-bundle price.",
    extraFaq: [
      {
        question: "How many bundles of architectural shingles cover a square?",
        answer:
          "Most architectural shingle lines use 4 bundles per square (100 sq ft), compared to 3 bundles for standard 3-tab shingles — but this varies by manufacturer, so always confirm on the product's own packaging before calculating your total order.",
      },
    ],
    exampleOverride: (
      <>
        <p>
          <strong>Project:</strong> a 35 ft × 28 ft footprint, 6/12 pitch,
          10% waste, 4 bundles per square (architectural).
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Footprint area = 35 × 28 = 980 ft²</li>
          <li>Pitch multiplier = √(6² + 12²) ÷ 12 ≈ 1.118</li>
          <li>Roof area = 980 × 1.118 ≈ 1,095.6 ft²</li>
          <li>With 10% waste ≈ 1,205.2 ft²</li>
          <li>Roofing squares = 1,205.2 ÷ 100 ≈ 12.05 squares</li>
          <li>Bundles = 12.05 × 4 ≈ 49 bundles</li>
        </ul>
        <p className="mt-3">
          The same roof in standard 3-tab shingles would need only about
          37 bundles (3 per square) — architectural shingles cost more
          per bundle and need more bundles, so confirm your product&rsquo;s
          exact coverage before ordering.
        </p>
      </>
    ),
  },
  {
    slug: "roof-replacement-cost-calculator",
    title: "Roof Replacement Cost Calculator",
    metaDescription:
      "Estimate roof replacement cost from your footprint and pitch — shingle bundles, roofing squares, and a material cost estimate.",
    intro:
      "Get a starting-point cost estimate for a roof replacement based on your footprint, pitch, and shingle price — for materials, not labor.",
    extraGuidance:
      "This calculator estimates material cost only (shingle bundles × your entered price per bundle) — full roof replacement quotes also include tear-off and disposal of the old roof, underlayment, flashing, ridge cap, and labor, which together are often 50% or more of the total project cost. Use the material estimate here as one input to compare against contractor quotes, not as a full replacement budget on its own.",
    extraFaq: [
      {
        question: "Does this calculator include labor cost?",
        answer:
          "No — it estimates shingle bundle quantities and material cost only. Labor, tear-off/disposal, underlayment, flashing, and ridge cap typically add significantly more on top of material cost, so use this as a starting point alongside contractor quotes.",
      },
    ],
    exampleOverride: (
      <>
        <p>
          <strong>Project:</strong> a 45 ft × 32 ft footprint, 6/12 pitch,
          10% waste, architectural shingles at $130 per bundle.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Footprint area = 45 × 32 = 1,440 ft²</li>
          <li>Pitch multiplier = √(6² + 12²) ÷ 12 ≈ 1.118</li>
          <li>Roof area = 1,440 × 1.118 ≈ 1,610 ft²</li>
          <li>With 10% waste ≈ 1,771 ft²</li>
          <li>Roofing squares ≈ 17.71, bundles (3/square) ≈ 53</li>
          <li>Material cost = 53 × $130 ≈ $6,890</li>
        </ul>
        <p className="mt-3">
          That $6,890 is shingles only. Tear-off, disposal, underlayment,
          flashing, ridge cap, and labor typically add as much again or
          more — full replacement quotes for a roof this size commonly
          land in the $13,000&ndash;$18,000 range total.
        </p>
      </>
    ),
  },
];
