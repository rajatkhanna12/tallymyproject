import { FaqItem } from "@/components/FaqSection";

export function ConcreteDrivewayCostSummary() {
  return (
    <>
      <p className="text-sm font-medium uppercase tracking-wide text-emerald-800">
        Typical range
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900">
        $5&ndash;$7 per sq ft installed
      </p>
      <p className="mt-2 text-sm text-emerald-900">
        Most homeowners spend <strong>$4,000&ndash;$8,000</strong> on a
        standard 2-car driveway with a basic broom finish. Material alone
        (no labor) runs closer to $2&ndash;$3 per sq ft.
      </p>
    </>
  );
}

export function ConcreteDrivewayCostBreakdown() {
  return (
    <>
      <p>
        Concrete driveways are usually priced per square foot installed, and
        the total scales almost linearly with size once you're past a
        minimum-job charge. Here's roughly what a standard 4-inch,
        broom-finished driveway costs at $5&ndash;$7/sq ft:
      </p>
      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Driveway size</th>
              <th className="px-4 py-3 font-medium">Approx. area</th>
              <th className="px-4 py-3 font-medium">Installed cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="px-4 py-3">Single-car (12&times;25 ft)</td>
              <td className="px-4 py-3 tabular-nums">~300 sq ft</td>
              <td className="px-4 py-3 tabular-nums">$1,500&ndash;$2,100</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Double-car (20&times;40 ft)</td>
              <td className="px-4 py-3 tabular-nums">~800 sq ft</td>
              <td className="px-4 py-3 tabular-nums">$4,000&ndash;$5,600</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Long / extended (24&times;50 ft)</td>
              <td className="px-4 py-3 tabular-nums">~1,200 sq ft</td>
              <td className="px-4 py-3 tabular-nums">$6,000&ndash;$8,400</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-4">
        That's for a plain broom finish &mdash; the most common and cheapest
        option. Decorative finishes add on top of that base price:
      </p>
      <ul className="mt-3 list-disc space-y-1.5 pl-5">
        <li>Colored or stained concrete: +$2&ndash;$4 per sq ft</li>
        <li>Exposed aggregate: +$2&ndash;$5 per sq ft</li>
        <li>Stamped concrete (pattern + color): +$8&ndash;$12 per sq ft</li>
      </ul>
    </>
  );
}

export function ConcreteDrivewayCostFactors() {
  return (
    <ul className="list-disc space-y-2.5 pl-5">
      <li>
        <strong>Site prep and excavation.</strong> A sloped, rocky, or
        poorly draining site costs more to grade and compact before any
        concrete gets poured. This is one of the biggest swing factors on a
        quote.
      </li>
      <li>
        <strong>Old driveway removal.</strong> Demolishing and hauling away
        an existing asphalt or concrete driveway typically adds $1&ndash;$3
        per sq ft before the new pour even starts.
      </li>
      <li>
        <strong>Thickness and reinforcement.</strong> Standard 4-inch
        driveways cost less than the 5&ndash;6-inch slabs recommended for
        trucks or RVs, and rebar/wire mesh reinforcement adds material and
        labor cost.
      </li>
      <li>
        <strong>Truck access.</strong> If a concrete truck can't get close
        to the pour site, the crew may need pump trucks or wheelbarrow
        relays &mdash; both add labor cost.
      </li>
      <li>
        <strong>Local labor rates.</strong> Concrete labor cost varies
        significantly by region &mdash; the same driveway can cost 30&ndash;50%
        more in a high-cost metro area than in a rural market.
      </li>
      <li>
        <strong>Permits.</strong> Many municipalities require a permit for
        new or replacement driveways, typically $50&ndash;$300 depending on
        your local building department.
      </li>
    </ul>
  );
}

export function ConcreteDrivewayCostDiyVsPro() {
  return (
    <>
      <p>
        Concrete material alone (delivered ready-mix or bagged mix) runs
        roughly $2&ndash;$3 per sq ft &mdash; the rest of that $5&ndash;$7 installed
        price is labor, forming, finishing, and equipment. That gap is
        exactly what a confident DIYer can save, but concrete driveways are
        one of the less forgiving DIY projects to take on:
      </p>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>
          You typically have 60&ndash;90 minutes of working time once concrete
          is poured before it starts to set &mdash; a driveway-sized pour
          usually needs a crew, not one or two people.
        </li>
        <li>
          Getting the base compacted correctly and the slab properly sloped
          for drainage is easy to get wrong and expensive to fix afterward.
        </li>
        <li>
          Renting a concrete mixer, bull float, and other finishing tools
          typically costs $150&ndash;$300 for a weekend, which narrows the
          savings on a smaller pour.
        </li>
      </ul>
      <p className="mt-3">
        DIY tends to make the most sense for smaller pours (a single-car
        driveway or less) where you can order ready-mix delivered by the
        truck rather than hand-mixing dozens of bags. For anything larger,
        most homeowners find the labor savings don't offset the risk of a
        cracked or poorly finished slab.
      </p>
    </>
  );
}

export const concreteDrivewayCostFaq: FaqItem[] = [
  {
    question: "Is it cheaper to pour concrete yourself?",
    answer:
      "Yes, on materials — DIY saves you the $3–$4 per sq ft labor portion of the price. But driveway-sized pours are unforgiving: concrete starts setting within 60–90 minutes, so a large pour usually needs a full crew, not a solo DIY effort, and mistakes in base prep or finishing are expensive to fix.",
  },
  {
    question: "How much more does stamped concrete cost than plain concrete?",
    answer:
      "Stamped concrete typically adds $8–$12 per sq ft on top of a standard broom-finish price, roughly doubling the total driveway cost. Exposed aggregate and colored/stained finishes are cheaper upgrades, adding $2–$5 per sq ft.",
  },
  {
    question: "Does removing an old driveway cost extra?",
    answer:
      "Yes — demolishing and hauling away an existing asphalt or concrete driveway typically adds $1–$3 per sq ft before the new pour begins, since it's priced separately from the new installation.",
  },
  {
    question: "How much does a concrete driveway cost per square foot?",
    answer:
      "$5–$7 per square foot installed is typical for a standard 4-inch broom-finished driveway, including basic site prep and labor. Material alone is closer to $2–$3 per square foot if you're comparing against a DIY pour.",
  },
];
