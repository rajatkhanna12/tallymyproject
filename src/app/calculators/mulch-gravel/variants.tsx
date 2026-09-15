import { CalculatorVariant } from "@/lib/calculator-variants";

export const mulchGravelVariants: CalculatorVariant[] = [
  {
    slug: "mulch-calculator",
    title: "Mulch Calculator",
    metaDescription:
      "Calculate exactly how much mulch you need for your garden beds — cubic yards, bags, and cost from area and depth.",
    intro:
      "Find out how many bags or cubic yards of mulch to buy for your garden beds and landscaping.",
    extraGuidance:
      "Keep mulch a few inches away from tree trunks and plant stems — piling it directly against them (a \"mulch volcano\") traps moisture and encourages rot and pests. Refresh mulch annually since organic types break down and lose their weed-suppressing depth over a season.",
    extraFaq: [
      {
        question: "How often should I replace mulch?",
        answer:
          "Organic mulch (wood chips, bark) typically breaks down and needs topping up once a year. You often won't need a full fresh layer — just enough to bring the depth back to 2-3 inches.",
      },
    ],
  },
  {
    slug: "gravel-calculator",
    title: "Gravel Calculator",
    metaDescription:
      "Calculate how much gravel you need for a path, bed, or base layer — cubic yards, bags, and cost from area and depth.",
    intro:
      "Calculate gravel volume for a pathway, drainage bed, or decorative ground cover.",
    extraGuidance:
      "Gravel is sold by size grade as well as volume — pea gravel and decorative stone are typically 1-2 inches deep for walkways, while a compactable base layer (like crushed limestone) for a patio or shed foundation is usually 4 inches deep, compacted in stages rather than dumped all at once.",
    extraFaq: [
      {
        question: "What size gravel should I use for a path?",
        answer:
          "Pea gravel (3/8″) is the most common choice for walkways since it's comfortable underfoot. For a more stable, walkable surface, crushed/angular gravel (3/4″) locks together better than smooth pea gravel.",
      },
    ],
    exampleOverride: (
      <>
        <p>
          <strong>Project:</strong> a 3 ft × 50 ft pea gravel walkway path,
          2 inches deep.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Area = 3 × 50 = 150 ft²</li>
          <li>Volume = 150 × (2 ÷ 12) = 25 ft³</li>
          <li>Cubic yards = 25 ÷ 27 ≈ 0.93 yd³</li>
          <li>0.5 ft³ bags needed = 25 ÷ 0.5 = 50 bags</li>
        </ul>
        <p className="mt-3">
          Under 1 cubic yard usually means bagged gravel is more practical
          than bulk delivery, since most suppliers have a 1-yard minimum
          order (or a short-load fee below it) — 50 bags at roughly
          $4&ndash;$5 each runs about $200&ndash;$250.
        </p>
      </>
    ),
  },
  {
    slug: "gravel-driveway-calculator",
    title: "Gravel Driveway Calculator",
    metaDescription:
      "Calculate how much gravel you need for a driveway — cubic yards and cost, with the layered base depth a driveway actually needs.",
    intro:
      "Estimate gravel volume and cost for a driveway, which needs more depth and layering than a garden path.",
    extraGuidance:
      "A gravel driveway needs a layered base, not a single dump: typically 4 inches of larger crushed base rock compacted first, then a 2-inch top layer of smaller decorative gravel — so plan on roughly 6 inches of total depth across two material types rather than one calculation. Recalculate this tool separately for the base layer and the top layer using their respective depths.",
    extraFaq: [
      {
        question: "How much gravel do I need for a driveway?",
        answer:
          "Plan for two layers: a compacted base of about 4 inches (larger crushed stone) and a top layer of about 2 inches (smaller decorative gravel). Run this calculator once per layer using each layer's depth for an accurate total.",
      },
    ],
    exampleOverride: (
      <>
        <p>
          <strong>Project:</strong> a 30 ft × 12 ft driveway, run twice —
          once for the 4 in compacted base layer, once for the 2 in top
          layer.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Area = 30 × 12 = 360 ft² (same for both layers)</li>
          <li>Base layer: 360 × (4 ÷ 12) = 120 ft³ = 4.44 yd³</li>
          <li>Top layer: 360 × (2 ÷ 12) = 60 ft³ = 2.22 yd³</li>
          <li>Combined total ≈ 6.67 yd³</li>
        </ul>
        <p className="mt-3">
          At roughly $45&ndash;$65 delivered per yard (base rock is
          usually cheaper than decorative top gravel), expect around
          $300&ndash;$430 total for both layers on a driveway this size.
        </p>
      </>
    ),
  },
  {
    slug: "topsoil-calculator",
    title: "Topsoil Calculator",
    metaDescription:
      "Calculate how many cubic yards or bags of topsoil you need for a new lawn, garden bed, or grading project.",
    intro:
      "Work out how much topsoil to order for a new lawn, raised bed, or grading project, in cubic yards or bags.",
    extraGuidance:
      "New lawns typically need 4–6 inches of topsoil, raised garden beds 8–12 inches (or more, depending on what you're growing), and minor grading or leveling work often just 1–2 inches. Bulk topsoil is sold by the cubic yard and is almost always cheaper than bags once you need more than about 1 yard — set the bag size field to 0.75 or 1 cubic foot (check your product) if you're comparing against bagged topsoil instead.",
    extraFaq: [
      {
        question: "How much topsoil do I need for a new lawn?",
        answer:
          "Plan for 4–6 inches of topsoil depth for a new lawn — more if the existing grade is uneven or the subsoil is poor quality. Enter your lawn's area and that depth into the calculator above for an exact cubic yard figure.",
      },
    ],
    exampleOverride: (
      <>
        <p>
          <strong>Project:</strong> an 8 ft × 4 ft raised garden bed,
          filled 10 inches deep.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Area = 8 × 4 = 32 ft²</li>
          <li>Volume = 32 × (10 ÷ 12) = 26.7 ft³</li>
          <li>Cubic yards = 26.7 ÷ 27 ≈ 0.99 yd³</li>
          <li>1 ft³ bags needed = 26.7 ÷ 1 ≈ 27 bags</li>
        </ul>
        <p className="mt-3">
          Right around 1 cubic yard is the tipping point — a bulk delivery
          (roughly $45&ndash;$55 for 1 yard) usually beats buying 27
          individual bags once you&rsquo;re this close to a full yard.
        </p>
      </>
    ),
  },
  {
    slug: "playground-mulch-calculator",
    title: "Playground Mulch Calculator",
    metaDescription:
      "Calculate how much engineered wood fiber or rubber mulch you need for a playground's fall-height safety depth.",
    intro:
      "Calculate safety surfacing mulch for a playground, which needs significantly more depth than a standard garden bed.",
    extraGuidance:
      "Playground safety surfacing needs far more depth than garden mulch — engineered wood fiber (EWF) or rubber mulch should be installed at a minimum of 9–12 inches, depending on the fall height of your play equipment (check ASTM/CPSC fall-height guidelines for your specific structure). Because this material compacts over time, order slightly more than the calculated volume and expect to top it up periodically to maintain safe depth.",
    extraFaq: [
      {
        question: "How deep should playground mulch be?",
        answer:
          "A minimum of 9 inches is standard for engineered wood fiber under equipment with a fall height up to about 7 feet; taller equipment needs more depth per CPSC/ASTM guidelines. Always check the fall-height rating for your specific play structure.",
      },
    ],
    exampleOverride: (
      <>
        <p>
          <strong>Project:</strong> a 20 ft × 20 ft play area, filled to
          the 9 in minimum safety depth for equipment under 7 ft fall
          height.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Area = 20 × 20 = 400 ft²</li>
          <li>Volume = 400 × (9 ÷ 12) = 300 ft³</li>
          <li>Cubic yards = 300 ÷ 27 ≈ 11.1 yd³</li>
        </ul>
        <p className="mt-3">
          At this volume, bulk delivery (by the yard or a super sack) is
          almost always more practical than bagged material — a 2 ft³ bag
          only covers a few square feet at 9 inches deep. Order a bit more
          than 11.1 yards since this material compacts and needs
          topping up over time.
        </p>
      </>
    ),
  },
];
