import { FaqItem } from "@/components/FaqSection";

export function FlooringInstallationCostSummary() {
  return (
    <>
      <p className="text-sm font-medium uppercase tracking-wide text-emerald-800">
        Typical range
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900">
        $6&ndash;$12 per sq ft installed
      </p>
      <p className="mt-2 text-sm text-emerald-900">
        A whole-house flooring project (around 1,500 sq ft) with
        mid-range material typically runs
        <strong> $9,000&ndash;$18,000</strong> installed, depending on
        material choice.
      </p>
    </>
  );
}

export function FlooringInstallationCostBreakdown() {
  return (
    <>
      <p>
        Installed flooring cost is driven mostly by material choice &mdash;
        labor cost per square foot is fairly consistent across types, but
        material price varies widely:
      </p>
      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Flooring type</th>
              <th className="px-4 py-3 font-medium">Material only</th>
              <th className="px-4 py-3 font-medium">Installed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="px-4 py-3">Vinyl plank (LVP)</td>
              <td className="px-4 py-3 tabular-nums">$2&ndash;$5 / sq ft</td>
              <td className="px-4 py-3 tabular-nums">$6&ndash;$10 / sq ft</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Laminate</td>
              <td className="px-4 py-3 tabular-nums">$1.50&ndash;$4 / sq ft</td>
              <td className="px-4 py-3 tabular-nums">$6&ndash;$9 / sq ft</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Engineered hardwood</td>
              <td className="px-4 py-3 tabular-nums">$4&ndash;$9 / sq ft</td>
              <td className="px-4 py-3 tabular-nums">$8&ndash;$15 / sq ft</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Solid hardwood</td>
              <td className="px-4 py-3 tabular-nums">$6&ndash;$12 / sq ft</td>
              <td className="px-4 py-3 tabular-nums">$10&ndash;$22 / sq ft</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-4">
        These figures cover material and installation only &mdash; budget
        separately for underlayment ($0.30&ndash;$1/sq ft), transition
        strips between rooms, and removal of your existing flooring if
        needed.
      </p>
    </>
  );
}

export function FlooringInstallationCostFactors() {
  return (
    <ul className="list-disc space-y-2.5 pl-5">
      <li>
        <strong>Old flooring removal.</strong> Tearing out and hauling
        away existing carpet, tile, or hardwood typically adds
        $1&ndash;$3 per sq ft, more if it involves prying up glued-down
        material.
      </li>
      <li>
        <strong>Subfloor condition.</strong> An uneven, squeaky, or
        damaged subfloor needs leveling or repair before new flooring
        goes down &mdash; a common source of quotes running higher than
        the sq ft price alone suggests.
      </li>
      <li>
        <strong>Stairs.</strong> Flooring stairs costs significantly more
        per square foot than open floor area &mdash; expect $40&ndash;$100+
        per step depending on material, since each step is essentially
        its own small installation.
      </li>
      <li>
        <strong>Room shape and cuts.</strong> Irregular rooms, lots of
        closets, or complex layouts increase both waste (more cut-offs)
        and labor time compared to a simple rectangular room.
      </li>
      <li>
        <strong>Underlayment requirements.</strong> Some products
        (especially solid hardwood and certain vinyl) need a specific
        underlayment or moisture barrier, which adds material cost some
        estimates leave out.
      </li>
      <li>
        <strong>Moving furniture.</strong> Many installers charge extra to
        move and replace furniture rather than having the room fully
        cleared beforehand.
      </li>
    </ul>
  );
}

export function FlooringInstallationCostDiyVsPro() {
  return (
    <>
      <p>
        How much DIY actually saves you depends heavily on the flooring
        type &mdash; some products are specifically designed for
        easy self-installation, while others really do need a
        professional:
      </p>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>
          <strong>Vinyl plank and laminate</strong> click together without
          nails or glue, making them the most DIY-friendly options &mdash;
          this is a large part of why they've become so popular. Expect
          to save most of the $4&ndash;$6 per sq ft labor cost.
        </li>
        <li>
          <strong>Engineered hardwood</strong> is DIY-feasible for
          click-lock products but trickier for glue-down or nail-down
          versions, which need specific tools and technique.
        </li>
        <li>
          <strong>Solid hardwood</strong> is the hardest to DIY well &mdash;
          it's typically nailed down with a pneumatic flooring nailer,
          needs precise acclimation and expansion gaps, and mistakes are
          highly visible and expensive to redo.
        </li>
      </ul>
      <p className="mt-3">
        A reasonable rule of thumb: if the product is marketed as
        &quot;floating&quot; or &quot;click-lock,&quot; DIY is realistic
        for most homeowners. If it requires nailing, gluing, or sanding
        and finishing on-site, professional installation is worth
        strongly considering.
      </p>
    </>
  );
}

export const flooringInstallationCostFaq: FaqItem[] = [
  {
    question: "What's the cheapest flooring to have installed?",
    answer:
      "Laminate and vinyl plank (LVP) are the cheapest options to have installed, typically $6–$10 per sq ft total. They're also the most DIY-friendly, so installing them yourself can bring the material-only cost down to $1.50–$5 per sq ft.",
  },
  {
    question: "How much does it cost to floor stairs?",
    answer:
      "Flooring stairs costs significantly more per square foot than open floor area — typically $40–$100+ per step depending on material — because each step is essentially its own small, labor-intensive installation.",
  },
  {
    question: "Is engineered hardwood cheaper than solid hardwood?",
    answer:
      "Yes — engineered hardwood typically installs for $8–$15 per sq ft versus $10–$22 for solid hardwood. Engineered wood also tends to be more dimensionally stable in humidity, though solid hardwood can be refinished more times over its life.",
  },
  {
    question: "What does flooring installation cost not usually include?",
    answer:
      "Most per-square-foot installation quotes cover material and labor only — budget separately for removal of your old flooring, underlayment ($0.30–$1 per sq ft), transition strips between rooms, and baseboard/trim work.",
  },
];
