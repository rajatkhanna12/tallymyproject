import Link from "next/link";
import { FaqItem } from "@/components/FaqSection";

export function NewRoofCostSummary() {
  return (
    <>
      <p className="text-sm font-medium uppercase tracking-wide text-emerald-800">
        Typical cost range (2026)
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900">
        $350&ndash;$550 per roofing square installed
      </p>
      <p className="mt-1 text-xs font-medium text-emerald-700">
        ($3.50&ndash;$5.50 per sq ft of roof area)
      </p>
      <p className="mt-2 text-sm text-emerald-900">
        For an average single-family home (~17 roofing squares or 1,700 sq ft of roof surface),
        base asphalt shingle installation runs <strong>$6,000&ndash;$9,400</strong>.
        A complete roof replacement including old shingle tear-off and disposal ($1,000&ndash;$3,000)
        typically totals <strong>$7,000&ndash;$12,500</strong>.
      </p>
    </>
  );
}

export function NewRoofCostBreakdown() {
  return (
    <>
      <p>
        Roofing contractors quote jobs by the &quot;<strong>roofing square</strong>&quot; &mdash;
        which equals <strong>100 square feet</strong> of roof surface &mdash; rather than by
        the interior floor plan of your home. On a per-square-foot basis, installing asphalt
        shingles averages <strong>$3.50 to $5.50 per sq ft</strong> of actual roof surface.
      </p>
      <p className="mt-3">
        Because of roof pitch (slope) and exterior eaves/overhangs, your roof&rsquo;s surface area
        is typically <strong>10% to 30% larger</strong> than your home&rsquo;s ground footprint.
        For example, a single-story 1,500 sq ft footprint with a moderate 6/12 pitch has
        roughly 1,700 to 1,800 sq ft of roof area (17 to 18 squares). You can calculate your
        exact roof area and squares with our{" "}
        <Link
          href="/calculators/roofing"
          className="font-medium text-emerald-700 underline hover:text-emerald-800"
        >
          Roofing Calculator
        </Link>
        .
      </p>
      <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Home footprint</th>
              <th className="px-4 py-3 font-medium">Roof surface area</th>
              <th className="px-4 py-3 font-medium">Roofing squares</th>
              <th className="px-4 py-3 font-medium">Installation only ($350&ndash;$550/sq)</th>
              <th className="px-4 py-3 font-medium">Full replacement (incl. tear-off)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="px-4 py-3 font-medium text-slate-900">Small (~1,000&ndash;1,200 sq ft)</td>
              <td className="px-4 py-3 tabular-nums">~1,200 sq ft</td>
              <td className="px-4 py-3 tabular-nums">~12 squares</td>
              <td className="px-4 py-3 tabular-nums">$4,200&ndash;$6,600</td>
              <td className="px-4 py-3 tabular-nums font-medium text-slate-900">$5,000&ndash;$8,400</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium text-slate-900">Average (~1,500&ndash;1,800 sq ft)</td>
              <td className="px-4 py-3 tabular-nums">~1,700 sq ft</td>
              <td className="px-4 py-3 tabular-nums">~17 squares</td>
              <td className="px-4 py-3 tabular-nums">$6,000&ndash;$9,400</td>
              <td className="px-4 py-3 tabular-nums font-medium text-slate-900">$7,000&ndash;$12,500</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium text-slate-900">Large (~2,200&ndash;2,500+ sq ft)</td>
              <td className="px-4 py-3 tabular-nums">~2,500 sq ft</td>
              <td className="px-4 py-3 tabular-nums">~25 squares</td>
              <td className="px-4 py-3 tabular-nums">$8,800&ndash;$13,800</td>
              <td className="px-4 py-3 tabular-nums font-medium text-slate-900">$10,500&ndash;$17,500</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        *Estimates based on typical architectural or 3-tab asphalt shingles. Tear-off and disposal
        typically add $1,000&ndash;$3,000 ($60&ndash;$150 per square) depending on existing shingle layers
        and roof pitch.
      </p>

      <h3 className="mt-6 text-base font-semibold text-slate-900">
        Cost by Roofing Material (Installed)
      </h3>
      <p className="mt-2 text-sm text-slate-600">
        Material selection is the biggest variable in your total roofing quote. Here is how common
        residential roofing materials compare per square (and per square foot) installed:
      </p>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>
          <strong>3-tab asphalt shingles:</strong> $350&ndash;$450 per square ($3.50&ndash;$4.50/sq ft)
          installed. The most economical option, offering a 15&ndash;20 year lifespan. Best for rental
          properties, budget-conscious projects, or detached outbuildings.
        </li>
        <li>
          <strong>Architectural (dimensional) asphalt shingles:</strong> $400&ndash;$550 per square
          ($4.00&ndash;$5.50/sq ft) installed. The current residential standard. Features multi-layered
          construction, superior wind resistance (up to 130 mph), and a 25&ndash;30+ year lifespan.
        </li>
        <li>
          <strong>Designer / luxury asphalt shingles:</strong> $550&ndash;$800 per square
          ($5.50&ndash;$8.00/sq ft) installed. Heavier composite shingles engineered to mimic the look
          of natural cedar shakes or slate.
        </li>
        <li>
          <strong>Standing-seam metal roofing:</strong> $800&ndash;$1,500+ per square
          ($8.00&ndash;$15.00+/sq ft) installed. Lasts 40&ndash;70 years with superior hail, fire,
          and wind ratings, but requires specialized installer labor and higher upfront investment.
        </li>
      </ul>
    </>
  );
}

export function NewRoofCostFactors() {
  return (
    <ul className="list-disc space-y-2.5 pl-5">
      <li>
        <strong>Full tear-off vs. reroofing (overlay).</strong> If your current roof has only a single
        layer of shingles in fair condition, some local codes allow &ldquo;reroofing&rdquo; &mdash; placing
        a new shingle layer directly over the existing one. This saves $1,000&ndash;$2,500 in tear-off and
        disposal fees. However, overlays prevent roofers from inspecting the wood deck for hidden rot,
        add weight to your roof structure, and cannot be done if two layers already exist.
      </li>
      <li>
        <strong>Tear-off and disposal costs.</strong> Stripping one layer of old shingles, cleaning
        the deck, and hauling away debris typically adds $1,000&ndash;$3,000 ($60&ndash;$150 per square).
        Removing multiple existing layers or heavy tile increases labor and dumpster fees accordingly.
      </li>
      <li>
        <strong>Roof pitch (steepness).</strong> Roofs with a pitch steeper than 6/12 (a 6-inch vertical
        rise per 12-inch horizontal run) require extra safety harnesses, scaffolding, and staging time.
        Contractors usually add a steep-slope surcharge of 10% to 25% for high-pitch roofs.
      </li>
      <li>
        <strong>Roof complexity and layout.</strong> Valleys, dormers, chimneys, skylights, and multiple
        intersecting roof facets require extensive custom cuts, step flashing, and valley liners,
        adding 15% to 30% more labor compared to a simple rectangular gable roof.
      </li>
      <li>
        <strong>Decking inspection and repair.</strong> Once old shingles are removed, any water-damaged,
        delaminated, or rotted plywood sheathing must be replaced before installing new underlayment.
        Replacing roof decking typically costs $60&ndash;$100 per 4x8-foot sheet installed.
      </li>
      <li>
        <strong>Underlayment and ventilation upgrades.</strong> Standard roofing quotes include basic
        felt, but investing in breathable synthetic underlayment, ice-and-water shields along eaves
        and valleys, and modern ridge vents ensures long-term leak prevention and attic ventilation.
      </li>
      <li>
        <strong>Local labor rates and building permits.</strong> Roofing costs vary by geographic region,
        local contractor labor availability, and municipal permit and inspection fees (typically $150&ndash;$500).
        Always get at least two to three written, itemized bids from licensed local roofers.
      </li>
    </ul>
  );
}

export function NewRoofCostDiyVsPro() {
  return (
    <>
      <p>
        Asphalt shingle materials alone cost roughly $100&ndash;$160 per square ($1.00&ndash;$1.60 per sq ft)
        &mdash; which represents only about 25% to 35% of the total professional invoice. While installing
        a roof yourself appears to offer large labor savings on paper, roof replacement is among the
        highest-risk DIY home improvement projects:
      </p>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>
          <strong>Fall safety and physical risk:</strong> Working on steep, elevated surfaces while
          handling heavy materials and pneumatic nailers carries genuine fall hazard without professional
          fall-arrest systems.
        </li>
        <li>
          <strong>Warranty requirements:</strong> Major shingle manufacturers (such as GAF, Owens Corning,
          and CertainTeed) often require certified installation according to strict nailing patterns and
          ventilation standards to honor enhanced non-prorated system warranties.
        </li>
        <li>
          <strong>Weather exposure risk:</strong> A professional crew can tear off, dry in, and re-shingle
          an entire house roof in 1 to 2 days. A solo DIYer often takes multiple weekends, leaving the
          home vulnerable to sudden rain, wind, or interior water leaks while the decking is exposed.
        </li>
        <li>
          <strong>Flashing and moisture detailing:</strong> Over 80% of roof leaks originate around
          valleys, step flashing, vent boots, and chimneys &mdash; precision detailing where DIY errors
          frequently lead to costly hidden moisture damage.
        </li>
      </ul>
      <p className="mt-3">
        DIY installation is best reserved for smaller, low-pitch structures such as detached storage
        sheds, carports, or small workshops. For your primary residential home, hiring an insured,
        licensed roofing contractor with an established local track record provides critical warranty
        protection and peace of mind.
      </p>
    </>
  );
}

export const newRoofCostFaq: FaqItem[] = [
  {
    question: "How much does a new roof cost on average?",
    answer:
      "For an average-size home with approximately 17 roofing squares (1,700 sq ft of roof area), installing a new asphalt shingle roof typically costs $6,000 to $9,400 for shingle installation ($350–$550 per square). A complete roof replacement including old shingle tear-off and disposal ($1,000–$3,000) generally totals $7,000 to $12,500. Steeper pitches, complex rooflines, or premium materials will push total costs higher.",
  },
  {
    question: "How much does a new roof cost per square foot?",
    answer:
      "Installing asphalt shingles typically costs $3.50 to $5.50 per square foot of roof surface ($350 to $550 per roofing square). Including tear-off and disposal of old shingles, total replacement cost generally runs $4.00 to $7.00 per square foot of roof area. Note that actual roof surface area is usually 10% to 30% larger than the home's ground floor footprint due to roof pitch and overhangs.",
  },
  {
    question: "What is a roofing square?",
    answer:
      "A roofing square is the standard unit of measurement used in the roofing industry, equal to exactly 100 square feet of roof surface. For example, a roof with 1,700 square feet of surface area measures 17 roofing squares. Shingles, underlayment, and roofing quotes are calculated and priced per square.",
  },
  {
    question: "Does tearing off the old roof cost extra?",
    answer:
      "Yes. Removing and disposing of existing shingles typically adds $1,000 to $3,000 (roughly $60 to $150 per roofing square) on top of new installation costs. Multiple existing shingle layers, steep pitches, or rotted plywood decking requiring replacement will add additional labor and disposal fees.",
  },
  {
    question: "What is the difference between reroofing and a full roof replacement?",
    answer:
      "A full roof replacement involves completely stripping off existing shingles down to the plywood decking, inspecting and repairing any rotten wood, and installing fresh underlayment, flashing, and shingles. Reroofing (also called an overlay) installs a second shingle layer directly over an existing single layer, saving $1,000 to $2,500 in tear-off and disposal costs. However, overlays cannot be performed if two layers already exist or if the underlying decking is damaged.",
  },
  {
    question: "How much more does a metal roof cost than asphalt shingles?",
    answer:
      "Standing-seam metal roofing typically costs $800 to $1,500+ per square installed ($8 to $15+ per square foot), which is roughly two to three times the cost of architectural asphalt shingles ($400 to $550 per square). However, metal roofs offer a 40- to 70-year lifespan compared to 20 to 30 years for asphalt shingles, along with superior energy efficiency and wind resistance.",
  },
];
