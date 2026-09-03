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
  },
];
