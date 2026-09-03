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
];
