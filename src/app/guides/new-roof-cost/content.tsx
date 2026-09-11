import { FaqItem } from "@/components/FaqSection";

export function NewRoofCostSummary() {
  return (
    <>
      <p className="text-sm font-medium uppercase tracking-wide text-emerald-800">
        Typical range
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900">
        $350&ndash;$550 per roofing square installed
      </p>
      <p className="mt-2 text-sm text-emerald-900">
        Most homeowners spend <strong>$8,000&ndash;$14,000</strong> to
        replace an average-size asphalt shingle roof (about 17 squares).
        Metal roofing runs considerably higher.
      </p>
    </>
  );
}

export function NewRoofCostBreakdown() {
  return (
    <>
      <p>
        Roofers quote by the &quot;square&quot; &mdash; 100 sq ft of roof
        surface &mdash; not by square footage of your house. A single-story
        home's roof typically covers more area than its floor plan once
        pitch and overhangs are factored in.
      </p>
      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Roof size</th>
              <th className="px-4 py-3 font-medium">Roofing squares</th>
              <th className="px-4 py-3 font-medium">Asphalt shingle cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="px-4 py-3">Small (~1,200 sq ft footprint)</td>
              <td className="px-4 py-3 tabular-nums">~12 squares</td>
              <td className="px-4 py-3 tabular-nums">$4,200&ndash;$6,600</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Average (~1,700 sq ft footprint)</td>
              <td className="px-4 py-3 tabular-nums">~17 squares</td>
              <td className="px-4 py-3 tabular-nums">$6,000&ndash;$9,400</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Large (~2,500 sq ft footprint)</td>
              <td className="px-4 py-3 tabular-nums">~25 squares</td>
              <td className="px-4 py-3 tabular-nums">$8,800&ndash;$13,800</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-4">Shingle material choice moves the price per square significantly:</p>
      <ul className="mt-3 list-disc space-y-1.5 pl-5">
        <li>3-tab asphalt: $350&ndash;$450 per square installed</li>
        <li>Architectural (dimensional) asphalt: $400&ndash;$550 per square installed</li>
        <li>Standing-seam metal: $800&ndash;$1,500+ per square installed</li>
      </ul>
    </>
  );
}

export function NewRoofCostFactors() {
  return (
    <ul className="list-disc space-y-2.5 pl-5">
      <li>
        <strong>Tear-off and disposal.</strong> Removing one or more
        layers of old shingles and hauling them away typically adds
        $1,000&ndash;$3,000 to a full roof replacement.
      </li>
      <li>
        <strong>Roof pitch.</strong> Steep roofs are slower and riskier to
        work on, so most roofers add a steep-slope surcharge once pitch
        exceeds roughly 6/12 (a 6-inch rise per 12 inches of run).
      </li>
      <li>
        <strong>Roof complexity.</strong> Valleys, dormers, skylights, and
        multiple roof planes all mean more cuts, flashing, and labor time
        than a simple rectangular roof of the same square footage.
      </li>
      <li>
        <strong>Decking repair.</strong> If the tear-off reveals rotted or
        damaged plywood decking underneath, replacing it is priced
        separately and can add several hundred to a few thousand dollars.
      </li>
      <li>
        <strong>Underlayment and flashing upgrades.</strong> Synthetic
        underlayment, ice-and-water shield in cold climates, and new
        flashing around chimneys/vents all add incremental cost over
        base-grade materials.
      </li>
      <li>
        <strong>Local permits and labor rates.</strong> Most municipalities
        require a roofing permit, and labor cost varies significantly by
        region &mdash; always get multiple local quotes.
      </li>
    </ul>
  );
}

export function NewRoofCostDiyVsPro() {
  return (
    <>
      <p>
        Shingle material alone typically costs $100&ndash;$150 per square
        &mdash; a fraction of the $350&ndash;$550 installed price. On paper
        that's a large potential saving, but full roof replacement is one
        of the DIY projects worth thinking hardest about before
        attempting:
      </p>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>
          Working at height on a pitched roof carries real fall risk, and
          most homeowners' insurance and manufacturer shingle warranties
          assume professional installation.
        </li>
        <li>
          Improper flashing or underlayment installation is one of the
          most common causes of roof leaks &mdash; and leaks often aren't
          visible until they've already caused interior damage.
        </li>
        <li>
          A full roof tear-off and re-shingle is a large, time-pressured
          job (you generally can't leave a roof partially open overnight
          in bad weather), which usually means needing a crew, not solo
          DIY.
        </li>
      </ul>
      <p className="mt-3">
        DIY re-roofing is more realistic for small, low-pitch structures
        like a shed or detached garage than for a full house roof. For a
        primary residence, most homeowners get several contractor quotes
        rather than attempting the tear-off and install themselves.
      </p>
    </>
  );
}

export const newRoofCostFaq: FaqItem[] = [
  {
    question: "How much does a new roof cost on average?",
    answer:
      "For an average-size home (roughly 17 roofing squares), asphalt shingle replacement typically costs $6,000–$9,400 installed. Larger roofs, steeper pitches, or upgrading to architectural shingles or metal push that higher.",
  },
  {
    question: "How much more does a metal roof cost than asphalt shingles?",
    answer:
      "Standing-seam metal roofing typically runs $800–$1,500+ per square installed, roughly 2–3x the cost of architectural asphalt shingles ($400–$550 per square). Metal roofs generally last much longer, which is the usual trade-off homeowners weigh.",
  },
  {
    question: "Does tearing off the old roof cost extra?",
    answer:
      "Yes — removing and disposing of existing shingles (especially if there are multiple layers) typically adds $1,000–$3,000 on top of the new roof installation cost, and is usually quoted as a separate line item.",
  },
  {
    question: "Can I install a roof myself to save money?",
    answer:
      "You could save the $250–$400 per square labor portion, but full roof replacement carries real fall risk and most shingle manufacturer warranties assume professional installation. DIY is more realistic for a shed or low, small outbuilding than a full house roof.",
  },
];
