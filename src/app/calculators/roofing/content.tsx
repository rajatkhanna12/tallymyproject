import { FaqItem } from "@/components/FaqSection";

export function RoofingFormula() {
  return (
    <>
      <p>
        Roof area isn&rsquo;t the same as your building&rsquo;s footprint —
        a sloped roof has more surface area than the flat ground it
        covers. This calculator applies a <strong>pitch multiplier</strong>
        : <code>√(rise² + 12²) ÷ 12</code>, where rise is how many inches
        the roof climbs per 12 inches of horizontal run (a &ldquo;6/12
        pitch&rdquo; means 6 inches of rise per 12 inches of run).
      </p>
      <p className="mt-3">
        Roof area = footprint area × pitch multiplier, then a waste
        allowance is added for cuts, hips, valleys, and ridges. That total
        is divided by 100 to get <strong>roofing squares</strong> (1
        square = 100 ft², standard roofing industry unit), and multiplied
        by bundles-per-square (usually 3 for standard shingles) to get
        total bundles.
      </p>
    </>
  );
}

export function RoofingExample() {
  return (
    <>
      <p>
        <strong>Project:</strong> a 40 ft × 30 ft home footprint, 6/12
        roof pitch, 10% waste, 3 bundles per square.
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Footprint area = 40 × 30 = 1,200 ft²</li>
        <li>Pitch multiplier = √(6² + 12²) ÷ 12 ≈ 1.118</li>
        <li>Roof area = 1,200 × 1.118 ≈ 1,342 ft²</li>
        <li>With 10% waste ≈ 1,476 ft²</li>
        <li>Roofing squares = 1,476 ÷ 100 ≈ 14.76 squares</li>
        <li>Bundles = 14.76 × 3 ≈ 45 bundles</li>
      </ul>
    </>
  );
}

export function RoofingMaterialGuidance() {
  return (
    <>
      <p>
        <strong>3-tab shingles</strong> typically come 3 bundles per
        square; <strong>architectural/dimensional shingles</strong> often
        run 3&ndash;4 bundles per square depending on the manufacturer —
        always check the product packaging, since coverage varies by
        brand.
      </p>
      <p className="mt-3">
        Complex roofs with multiple hips, valleys, and dormers should use
        a <strong>15%</strong> waste allowance instead of the standard
        10%, since there are far more angled cuts. Don&rsquo;t forget
        underlayment, starter strip, ridge cap shingles, and
        nails/fasteners — this calculator covers field shingle bundles
        only.
      </p>
    </>
  );
}

export const roofingBaseFaq: FaqItem[] = [
  {
    question: "How many bundles of shingles do I need per square?",
    answer:
      "Most standard 3-tab and architectural shingles come 3 bundles to a square (100 ft² of coverage), though some architectural shingle lines use 4 bundles per square — check the specific product's packaging.",
  },
  {
    question: "How do I calculate roof area from pitch?",
    answer:
      "Multiply your building's footprint area by a pitch multiplier of √(rise² + 12²) ÷ 12, where rise is the inches the roof rises per 12 inches of horizontal run. A steeper pitch means a larger multiplier and more roof surface area than the footprint suggests.",
  },
  {
    question: "What waste percentage should I use for roofing?",
    answer:
      "10% is standard for a simple gable roof. Increase to 15% or more for roofs with multiple hips, valleys, dormers, or a steep pitch, since there are more angled cuts and more waste.",
  },
  {
    question: "How much does a new roof cost?",
    answer:
      "Asphalt shingle roof replacement typically costs $4–$7 per square foot installed (about $400–$700 per roofing square), including tear-off, underlayment, and labor — so a 1,500 ft² footprint roof often lands in the $12,000–$20,000 range depending on pitch, complexity, and region. Materials alone (shingle bundles) are a much smaller share of that total.",
  },
  {
    question: "How long do asphalt shingles last?",
    answer:
      "Standard 3-tab shingles typically last 15–20 years, while architectural (dimensional) shingles last 25–30 years or more with proper ventilation and maintenance. Actual lifespan depends heavily on climate, roof ventilation, and installation quality.",
  },
  {
    question: "How many roofing squares is an average house?",
    answer:
      "A typical single-story home (1,500–2,000 ft² footprint) with a moderate roof pitch works out to roughly 17–25 roofing squares once the pitch multiplier and waste are applied. Larger homes, steeper pitches, or multiple roof planes push this higher — use the calculator above with your actual footprint and pitch for an exact number.",
  },
  {
    question: "Are architectural shingles worth the extra cost over 3-tab?",
    answer:
      "Architectural shingles usually cost 20–30% more than 3-tab but last roughly 10 years longer, carry better wind ratings, and have a more dimensional appearance — most roofers now recommend them as the better long-term value for most homes.",
  },
];
