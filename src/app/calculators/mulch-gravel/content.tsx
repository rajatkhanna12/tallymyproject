import { FaqItem } from "@/components/FaqSection";

export function MulchGravelFormula() {
  return (
    <>
      <p>
        Volume = <strong>Area × Depth</strong>. Area is your length ×
        width in square feet; depth is entered in inches and converted to
        feet (divided by 12) so the units match. The result in cubic feet
        is divided by 27 to get <strong>cubic yards</strong>, which is how
        bulk mulch, gravel, and topsoil are typically sold and delivered.
      </p>
      <p className="mt-3">
        For bagged material, the same cubic-foot volume is divided by the
        coverage of one bag — a standard mulch bag covers 2 cubic feet, a
        gravel bag is often 0.5 cubic feet, and topsoil bags vary (this
        calculator lets you set the exact bag size).
      </p>
    </>
  );
}

export function MulchGravelExample() {
  return (
    <>
      <p>
        <strong>Project:</strong> a 20 ft × 10 ft garden bed, 3 inches of
        mulch depth.
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Area = 20 × 10 = 200 ft²</li>
        <li>Volume = 200 × (3 ÷ 12) = 50 ft³</li>
        <li>Cubic yards = 50 ÷ 27 ≈ 1.85 yd³</li>
        <li>2 ft³ bags needed = 50 ÷ 2 = 25 bags</li>
      </ul>
      <p className="mt-3">
        At around $40 per cubic yard delivered in bulk, that&rsquo;s
        roughly $74 — usually cheaper than buying 25 individual bags once
        you&rsquo;re covering more than a couple hundred square feet.
      </p>
    </>
  );
}

export function MulchGravelMaterialGuidance() {
  return (
    <>
      <p>
        <strong>Mulch</strong> depth of 2&ndash;3 inches is standard for
        garden beds — more than 4 inches can suffocate roots and promote
        fungal growth. <strong>Gravel</strong> for pathways is usually 2
        inches deep over landscape fabric; driveways need 4&ndash;6 inches
        in multiple compacted layers. <strong>Topsoil</strong> for new
        lawns or beds is typically 4&ndash;6 inches.
      </p>
      <p className="mt-3">
        Bulk delivery is almost always cheaper than bags once you need
        more than about 1 cubic yard (roughly 13&ndash;14 bags of mulch),
        and saves you from hauling dozens of heavy bags yourself.
      </p>
    </>
  );
}

export const mulchGravelBaseFaq: FaqItem[] = [
  {
    question: "How much mulch do I need for 200 square feet?",
    answer:
      "At a standard 3-inch depth, 200 square feet needs about 1.85 cubic yards of mulch, or roughly 25 bags if using 2-cubic-foot bags.",
  },
  {
    question: "How deep should mulch be?",
    answer:
      "2 to 3 inches is the standard recommendation for garden beds. Going deeper than 4 inches can suffocate plant roots and encourage fungal problems.",
  },
  {
    question: "Is it cheaper to buy mulch or gravel in bulk or bags?",
    answer:
      "Bulk delivery is typically cheaper once you need more than about 1 cubic yard (roughly 13-14 standard bags). For smaller areas, bagged material is often more convenient despite the slightly higher per-yard cost.",
  },
];
