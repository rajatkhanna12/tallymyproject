import { FaqItem } from "@/components/FaqSection";

export function BathroomTileCostSummary() {
  return (
    <>
      <p className="text-sm font-medium uppercase tracking-wide text-emerald-800">
        Typical range
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900">
        $10&ndash;$15 per sq ft installed
      </p>
      <p className="mt-2 text-sm text-emerald-900">
        A small bathroom floor (about 40 sq ft) with mid-range porcelain
        tile typically runs <strong>$400&ndash;$900</strong>. Add a tiled
        shower and the total commonly reaches
        <strong> $1,800&ndash;$3,500</strong>.
      </p>
    </>
  );
}

export function BathroomTileCostBreakdown() {
  return (
    <>
      <p>
        Bathroom tile cost depends on how much surface you're covering
        (floor only vs. floor plus shower walls) and the tile material you
        choose. Here's a typical small bathroom (5&times;8 ft, ~40 sq ft
        floor):
      </p>
      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Scope</th>
              <th className="px-4 py-3 font-medium">Approx. area</th>
              <th className="px-4 py-3 font-medium">Installed cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="px-4 py-3">Floor only</td>
              <td className="px-4 py-3 tabular-nums">~40 sq ft</td>
              <td className="px-4 py-3 tabular-nums">$400&ndash;$900</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Floor + shower walls</td>
              <td className="px-4 py-3 tabular-nums">~90 sq ft total</td>
              <td className="px-4 py-3 tabular-nums">$1,800&ndash;$3,500</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-4">Tile material itself is a big swing factor too, priced per square foot before labor:</p>
      <ul className="mt-3 list-disc space-y-1.5 pl-5">
        <li>Ceramic: $2&ndash;$7 per sq ft (material only)</li>
        <li>Porcelain: $3&ndash;$10 per sq ft</li>
        <li>Natural stone (marble, travertine, slate): $7&ndash;$20+ per sq ft</li>
      </ul>
      <p className="mt-3">
        Labor typically adds $5&ndash;$10 per sq ft on top of material for a
        standard floor, more for shower walls with corners, a niche, and
        plumbing cutouts.
      </p>
    </>
  );
}

export function BathroomTileCostFactors() {
  return (
    <ul className="list-disc space-y-2.5 pl-5">
      <li>
        <strong>Tile size and layout complexity.</strong> Large-format tile
        (18″+) needs a very flat subfloor and precise leveling, while
        mosaic, herringbone, or patterned layouts take significantly more
        labor time per square foot.
      </li>
      <li>
        <strong>Old tile removal.</strong> Demolishing and hauling away
        existing tile, especially if it's set in a thick mortar bed,
        typically adds $2&ndash;$5 per sq ft before new tile goes down.
      </li>
      <li>
        <strong>Subfloor prep.</strong> An uneven or damaged subfloor needs
        leveling compound or new backer board before tile can be installed
        &mdash; this is a common source of quotes running higher than
        expected.
      </li>
      <li>
        <strong>Waterproofing.</strong> Shower walls and floors need a
        proper waterproof membrane (like a liquid membrane or backer
        board system), which adds material and labor cost that a dry
        floor-only job doesn't need.
      </li>
      <li>
        <strong>Grout and pattern choice.</strong> Epoxy grout costs more
        than standard cement grout but resists stains and cracking better,
        especially in wet areas.
      </li>
      <li>
        <strong>Local labor rates.</strong> Tile setters' rates vary
        widely by region &mdash; get at least two local quotes rather than
        relying on a national average alone.
      </li>
    </ul>
  );
}

export function BathroomTileCostDiyVsPro() {
  return (
    <>
      <p>
        Tile is one of the more approachable DIY flooring projects &mdash;
        unlike concrete, there's no race against a setting clock, and
        mistakes on a small section can often be pulled up and redone.
        That said, the labor savings and risk depend heavily on where
        you're tiling:
      </p>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>
          A flat bathroom floor is a reasonable first DIY tile project for
          most homeowners &mdash; expect a weekend of work for a small room,
          plus renting a wet saw ($40&ndash;$75/day).
        </li>
        <li>
          Shower walls are a different story: a waterproofing mistake
          behind the tile can cause hidden water damage that's far more
          expensive to fix than the tiling job itself. Many DIYers still
          hire a pro specifically for the waterproofing step even if they
          tile the rest themselves.
        </li>
        <li>
          Large-format tile and natural stone are harder to cut and level
          without experience &mdash; the visible seams and lippage from a
          first attempt are hard to fix after the fact.
        </li>
      </ul>
      <p className="mt-3">
        As a rough guide, DIY saves the $5&ndash;$10 per sq ft labor portion
        of the price on a floor, which is meaningful on a full bathroom
        but shrinks once you factor in tool rental and the learning curve
        of a first tiling project.
      </p>
    </>
  );
}

export const bathroomTileCostFaq: FaqItem[] = [
  {
    question: "How much does it cost to tile a small bathroom floor?",
    answer:
      "A typical small bathroom floor (around 40 sq ft) with mid-range porcelain tile costs $400–$900 installed, including the 15% waste allowance bathrooms typically need for cuts around the toilet and vanity.",
  },
  {
    question: "Is it cheaper to tile a shower yourself?",
    answer:
      "Material-wise, yes — DIY skips the $5–$10 per sq ft labor cost. But shower walls need proper waterproofing behind the tile, and a mistake there can cause hidden water damage that costs far more to fix than the tiling itself, which is why many DIYers still hire a pro for that step.",
  },
  {
    question: "Why does natural stone tile cost so much more?",
    answer:
      "Natural stone (marble, travertine, slate) runs $7–$20+ per sq ft in material alone, versus $2–$10 for ceramic or porcelain, because it's quarried and cut rather than manufactured, and it often needs sealing and more careful, slower installation.",
  },
  {
    question: "Does removing old bathroom tile add much to the cost?",
    answer:
      "Yes — demolishing and hauling away existing tile typically adds $2–$5 per sq ft, more if it's set in a thick mortar bed. It's usually quoted as a separate line item from the new tile installation.",
  },
];
