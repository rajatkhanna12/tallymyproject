import { FaqItem } from "@/components/FaqSection";

export function RentVsBuyGuideQuickAnswer() {
  return (
    <div>
      <p className="text-sm font-medium text-emerald-800">Quick answer</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">
        Divide the property price by one year&rsquo;s rent for an equivalent
        home. Above ~20, renting usually comes out ahead financially; below
        ~15, buying usually does; in between, it&rsquo;s genuinely close.
      </p>
      <p className="mt-2 text-sm text-slate-700">
        A &#8377;60,00,000 property renting for &#8377;20,000/month works out
        to a ratio of 25 (&#8377;60,00,000 &divide; &#8377;2,40,000/year)
        &mdash; on the rent-favoring side, which lines up with what the full
        month-by-month comparison shows for that same scenario.
      </p>
    </div>
  );
}

export function RentVsBuyGuideHowItWorks() {
  return (
    <div className="space-y-4">
      <p>
        The price-to-rent ratio is a quick screening heuristic, not a
        verdict &mdash; it&rsquo;s a starting point that tells you which
        direction the full comparison is likely to lean before you run the
        numbers properly. The logic underneath it, and underneath any real
        rent-vs-buy comparison, comes down to opportunity cost.
      </p>
      <p>
        When you buy, your down payment and upfront costs (stamp duty,
        registration, brokerage) stop being available for anything else
        &mdash; they&rsquo;re now equity locked into one asset, which grows
        (or shrinks) with property appreciation. When you rent, that same
        money can be invested elsewhere, and the gap between what you would
        have paid in EMI and what you actually pay in rent can be invested
        too.
      </p>
      <p>
        Over your comparison horizon, buying wins financially when property
        appreciation plus the equity you build through EMI payments beats
        what the renter&rsquo;s invested portfolio grows to. Renting wins
        when the alternative investment return outpaces property
        appreciation by enough to offset the EMI-rent gap being invested
        instead. Neither outcome is guaranteed in advance &mdash; both
        appreciation and investment returns are assumptions, not facts.
      </p>
    </div>
  );
}

export function RentVsBuyGuideKeyFactors() {
  return (
    <div className="space-y-4">
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>How long you plan to stay.</strong> Buying carries large
          one-time costs (stamp duty, registration, brokerage on both ends)
          that get amortized over however long you hold the property.
          Staying 3 years makes those costs weigh much more heavily than
          staying 15.
        </li>
        <li>
          <strong>Local price-to-rent ratio.</strong> The same salary and
          savings can favor buying in one city and renting in another,
          purely because property prices relative to rents differ that
          much city to city.
        </li>
        <li>
          <strong>Your assumed appreciation and investment return.</strong>{" "}
          These are the two numbers the comparison is most sensitive to, and
          both are genuinely uncertain over a 10&ndash;20 year horizon.
          It&rsquo;s worth testing conservative, moderate, and optimistic
          assumptions rather than trusting one run.
        </li>
        <li>
          <strong>Non-financial value.</strong> Stability, the freedom to
          renovate, not depending on a landlord&rsquo;s decisions, versus
          the flexibility to relocate for work or downsize without selling
          &mdash; these matter and don&rsquo;t show up in a net-worth
          number at all.
        </li>
      </ul>
    </div>
  );
}

export function RentVsBuyGuideMistakes() {
  return (
    <div className="space-y-4">
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Comparing EMI to rent directly.</strong> EMI and rent
          aren&rsquo;t the same kind of number &mdash; EMI includes a
          principal (equity-building) portion, while rent is a pure expense.
          Comparing them one-to-one ignores that a buyer is also
          accumulating an asset.
        </li>
        <li>
          <strong>Ignoring the opportunity cost of the down payment.</strong>{" "}
          A large down payment is money that stops earning a separate return
          the moment it goes into the property &mdash; leaving it out of the
          comparison quietly tilts the math toward buying.
        </li>
        <li>
          <strong>Assuming property always appreciates at a healthy rate.</strong>{" "}
          Appreciation varies enormously by city, locality, and market cycle
          &mdash; running the comparison with a single optimistic assumption
          can make buying look better than it&rsquo;s likely to be.
        </li>
        <li>
          <strong>Forgetting ownership&rsquo;s recurring costs.</strong>{" "}
          Maintenance, society charges, property tax, and home insurance are
          real, recurring costs of owning that don&rsquo;t show up in the
          EMI &mdash; leaving them out overstates how much buying actually
          saves versus renting.
        </li>
        <li>
          <strong>Not accounting for transaction costs if you might move again.</strong>{" "}
          Stamp duty, registration, and brokerage on both the purchase and
          an eventual sale can add up to a meaningful percentage of the
          property value &mdash; a real cost if there&rsquo;s a real chance
          you sell within a few years.
        </li>
      </ul>
    </div>
  );
}

export const rentVsBuyGuideFaq: FaqItem[] = [
  {
    question: "Is the price-to-rent ratio accurate enough to decide on its own?",
    answer:
      "It's a fast screening tool, not a final answer — it ignores your specific loan rate, tenure, holding period, and investment return assumptions. Use it to get a quick read, then run the full month-by-month comparison for a decision that reflects your actual numbers.",
  },
  {
    question: "Is buying always better in the long run?",
    answer:
      "Not necessarily. Over long horizons, buying tends to look more favorable because upfront transaction costs get spread over more years and equity compounds — but this isn't guaranteed, and depends heavily on your local price-to-rent ratio and how property appreciation compares to what you could otherwise earn investing.",
  },
  {
    question: "How much does the down payment amount matter?",
    answer:
      "A lot — it changes both how much you borrow (and therefore your EMI) and how much capital the renting scenario has available to invest from day one. A larger down payment lowers EMI but also removes more money from the renter's potential investment pool in the comparison.",
  },
  {
    question: "Should I include rental deposit and maintenance charges?",
    answer:
      "For the most accurate personal comparison, yes — a security deposit (commonly refundable, but tied up for the tenancy) and monthly maintenance or society charges on the ownership side both affect the real numbers, even though they're often left out of simplified comparisons for clarity.",
  },
  {
    question: "What if I'm not sure how long I'll stay in one city?",
    answer:
      "That uncertainty itself is useful information — the shorter and less certain your expected stay, the more the balance tips toward renting, since buying's upfront costs need time to be worth it and selling on short notice adds its own costs and risk.",
  },
  {
    question: "Does this account for tax benefits on home loans?",
    answer:
      "This comparison focuses on the core cash-flow and investment trade-off and doesn't factor in home loan interest or principal tax deductions, which depend on your personal tax situation and the tax regime you've chosen. Factor those in separately with a tax advisor if they're relevant to you.",
  },
];
