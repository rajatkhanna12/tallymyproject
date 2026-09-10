import { FaqItem } from "@/components/FaqSection";

export function ConcreteFormula() {
  return (
    <>
      <p>
        Concrete volume is calculated as{" "}
        <strong>Length × Width × Thickness</strong> for rectangular slabs
        and footings, or <strong>π × radius² × depth</strong> for round
        columns and footings. Thickness is entered in inches and converted
        to feet (divide by 12) before multiplying, since length and width
        are measured in feet.
      </p>
      <p className="mt-3">
        The result in cubic feet is divided by 27 to convert to{" "}
        <strong>cubic yards</strong> (27 ft³ = 1 yd³), which is how
        ready-mix concrete is sold and priced. A waste allowance
        (typically 5–10%) is added to cover spillage, uneven subgrade, and
        over-excavation.
      </p>
      <p className="mt-3">
        For bagged concrete, the total volume (including waste) is divided
        by the yield of a single bag: an 80 lb bag yields about 0.6 ft³, a
        60 lb bag about 0.45 ft³, and a 40 lb bag about 0.3 ft³ of mixed
        concrete.
      </p>
    </>
  );
}

export function ConcreteExample() {
  return (
    <>
      <p>
        <strong>Project:</strong> a 10 ft × 10 ft patio slab, 4 inches
        thick, with a 10% waste allowance.
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Volume = 10 × 10 × (4 ÷ 12) = 33.3 ft³</li>
        <li>With 10% waste = 33.3 × 1.10 = 36.7 ft³</li>
        <li>Cubic yards = 36.7 ÷ 27 = 1.36 yd³</li>
        <li>80 lb bags needed = 36.7 ÷ 0.6 ≈ 62 bags</li>
      </ul>
      <p className="mt-3">
        At roughly $6.50 per 80 lb bag, that&rsquo;s about $400 in bagged
        concrete — or around $175&ndash;$200 delivered per yard
        (≈$240&ndash;$270 total) if you order ready-mix instead, which is
        usually cheaper and faster for anything over 1 cubic yard.
      </p>
    </>
  );
}

export function ConcreteMaterialGuidance() {
  return (
    <>
      <p>
        For pours <strong>under about 1 cubic yard</strong>, bagged
        concrete mixed on-site is usually more practical than ordering
        ready-mix (most concrete companies have a minimum order, often 1
        yard or more, plus a short-load fee below that). For anything
        larger — driveways, large patios, foundations — ready-mix
        delivered by truck is almost always cheaper per yard and far less
        labor.
      </p>
      <p className="mt-3">
        Always round up to the nearest full bag or, for ready-mix, round
        up to at least the next quarter-yard — running short mid-pour
        means a cold joint and a weaker slab. Standard concrete mixes
        (3000–4000 PSI) are fine for most residential slabs; driveways and
        areas exposed to freeze-thaw cycles typically call for 4000 PSI or
        air-entrained mix.
      </p>
    </>
  );
}

export const concreteBaseFaq: FaqItem[] = [
  {
    question: "How much concrete do I need for a 10x10 slab?",
    answer:
      "For a 10 ft × 10 ft slab at the common 4-inch thickness, you need about 1.23 cubic yards before waste, or roughly 1.35 cubic yards with a 10% waste allowance — about 62 bags of 80 lb concrete mix.",
  },
  {
    question: "How many 80 lb bags of concrete make a yard?",
    answer:
      "One 80 lb bag yields about 0.6 cubic feet of mixed concrete. Since a cubic yard is 27 cubic feet, it takes about 45 bags of 80 lb concrete mix to make one full cubic yard.",
  },
  {
    question: "Should I use ready-mix or bagged concrete?",
    answer:
      "As a rule of thumb, bagged concrete is more cost-effective for pours under 1 cubic yard. For larger pours, ready-mix delivered by truck is typically cheaper per yard and requires far less manual mixing labor.",
  },
  {
    question: "How much waste allowance should I add?",
    answer:
      "Most contractors add 5–10% extra to account for spillage, uneven or over-excavated subgrade, and minor form leaks. Complex shapes or hand-dug footings often warrant closer to 10%.",
  },
  {
    question: "How much does a concrete slab cost per square foot?",
    answer:
      "Ready-mix concrete alone typically runs $5–$7 per square foot installed for a standard 4-inch slab, including basic labor and finishing. Material cost alone (just the concrete) is usually $2–$3 per square foot. Decorative finishes, reinforcement, or site prep can push the total well above this range.",
  },
  {
    question: "How thick should a concrete slab be?",
    answer:
      "4 inches is standard for patios, walkways, and shed floors. Driveways for cars typically need 4–6 inches (6 inches or more if heavier vehicles will use it), and footings are usually sized separately based on local building code and frost depth requirements.",
  },
  {
    question: "How many yards of concrete do I need for a driveway?",
    answer:
      "A typical single-car driveway (about 10 ft × 20 ft) at 4 inches thick needs roughly 2.5 cubic yards before waste. A two-car driveway (20 ft × 20 ft or larger) can need 5–7 cubic yards or more — plug your exact dimensions into the calculator above for a precise figure.",
  },
  {
    question: "Is it cheaper to mix my own concrete or order ready-mix?",
    answer:
      "For pours under about 1 cubic yard, bagged concrete mixed on-site is usually cheaper once you account for ready-mix minimum-order and short-load fees. Above 1 cubic yard, ready-mix is almost always cheaper per yard and dramatically less labor, since mixing that much concrete by hand or with a small mixer is impractical.",
  },
];
