import { FaqItem } from "@/components/FaqSection";

export function MulchingCostSummary() {
  return (
    <>
      <p className="text-sm font-medium uppercase tracking-wide text-emerald-800">
        Typical range
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900">
        $30&ndash;$50 per cubic yard, bulk material
      </p>
      <p className="mt-2 text-sm text-emerald-900">
        A professionally installed 10-cubic-yard job (material + delivery
        + spreading) typically runs
        <strong> $750&ndash;$1,300</strong>. Bagged mulch from a home
        center costs more per yard but has no delivery minimum.
      </p>
    </>
  );
}

export function MulchingCostBreakdown() {
  return (
    <>
      <p>
        Mulch is priced by the cubic yard in bulk, or by the bag (usually
        2 cu ft) for smaller jobs. Bagged mulch is convenient for small
        beds but costs noticeably more per yard than ordering bulk:
      </p>
      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Mulch type</th>
              <th className="px-4 py-3 font-medium">Bulk (per cu yd)</th>
              <th className="px-4 py-3 font-medium">Bagged (per cu yd equiv.)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="px-4 py-3">Basic shredded hardwood</td>
              <td className="px-4 py-3 tabular-nums">$25&ndash;$35</td>
              <td className="px-4 py-3 tabular-nums">$45&ndash;$60</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Dyed/colored mulch</td>
              <td className="px-4 py-3 tabular-nums">$35&ndash;$50</td>
              <td className="px-4 py-3 tabular-nums">$55&ndash;$70</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Cedar or cypress</td>
              <td className="px-4 py-3 tabular-nums">$40&ndash;$60</td>
              <td className="px-4 py-3 tabular-nums">$65&ndash;$85</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-4">
        Professional installation (delivery, spreading, and edging) adds
        roughly $40&ndash;$80 per cubic yard on top of material cost &mdash;
        so a 10-yard job runs about $750&ndash;$1,300 all-in, versus
        $250&ndash;$500 in material alone if you spread it yourself.
      </p>
    </>
  );
}

export function MulchingCostFactors() {
  return (
    <ul className="list-disc space-y-2.5 pl-5">
      <li>
        <strong>Mulch type and quality.</strong> Basic shredded hardwood
        is the cheapest option; dyed mulch, cedar, cypress, and specialty
        mulches like rubber or pine straw all cost more.
      </li>
      <li>
        <strong>Delivery minimums and distance.</strong> Bulk suppliers
        often have a minimum order (commonly 3&ndash;5 cu yd) and charge a
        flat delivery fee, so very small orders can end up costing more
        per yard than they should.
      </li>
      <li>
        <strong>Bed prep.</strong> Removing old, decomposed mulch, edging
        beds, or installing a weed barrier before the new mulch goes down
        all add labor time if you're paying for installation.
      </li>
      <li>
        <strong>Depth needed.</strong> Standard garden beds need 2&ndash;3
        inches; if you're mulching over bare, weedy ground for the first
        time you may need closer to 3&ndash;4 inches, which increases the
        cubic yardage significantly for the same bed area.
      </li>
      <li>
        <strong>Yard accessibility.</strong> If mulch has to be wheeled a
        long distance from the driveway to the beds (rather than dumped
        close by), professional spreading labor costs more.
      </li>
    </ul>
  );
}

export function MulchingCostDiyVsPro() {
  return (
    <>
      <p>
        Mulching is one of the more DIY-friendly yard projects &mdash; there's
        no specialized skill required, just time and physical effort.
        Material-only DIY typically costs $25&ndash;$60 per cubic yard,
        versus $65&ndash;$130 per cubic yard for a fully installed job.
      </p>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>
          The main cost of DIY is your own labor: spreading 10 cubic
          yards by wheelbarrow is a genuinely tiring day of work,
          especially over uneven or large beds.
        </li>
        <li>
          Bulk delivery usually just dumps the pile in your driveway or
          at the curb &mdash; moving it to the beds is on you unless you pay
          for spreading specifically.
        </li>
        <li>
          For small beds (a few cubic yards or less), bagged mulch from a
          home center is often more practical than arranging bulk
          delivery, even though it costs more per yard.
        </li>
      </ul>
      <p className="mt-3">
        DIY makes the most sense for small-to-medium yards where the
        physical work is manageable in a weekend. For large properties or
        anyone who can't do the physical spreading themselves, paying for
        installation is usually worth the added cost.
      </p>
    </>
  );
}

export const mulchingCostFaq: FaqItem[] = [
  {
    question: "How much does it cost to have mulch professionally installed?",
    answer:
      "Professional mulch installation (delivery, spreading, and basic bed edging) typically costs $65–$130 per cubic yard total, compared to $25–$60 per cubic yard for material alone if you spread it yourself.",
  },
  {
    question: "Is bagged mulch or bulk mulch cheaper?",
    answer:
      "Bulk mulch is cheaper per cubic yard — typically $25–$60 versus $45–$85 for the bagged equivalent — but bulk suppliers usually have delivery minimums (often 3–5 cu yd), so bagged mulch can work out more practical for small beds.",
  },
  {
    question: "How much mulch do I need for my yard?",
    answer:
      "It depends on your bed area and desired depth — 2–3 inches is standard for garden beds. Use the mulch calculator above with your bed's square footage to get an exact cubic yard figure instead of estimating.",
  },
  {
    question: "Why is cedar mulch more expensive than regular mulch?",
    answer:
      "Cedar and cypress mulch cost more because they naturally resist rot and repel some insects, lasting longer before needing to be refreshed. Basic shredded hardwood mulch is cheaper but breaks down faster, typically needing a top-up every year.",
  },
];
