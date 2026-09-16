import { FaqItem } from "@/components/FaqSection";

export function HomeLoanEmiGuideQuickAnswer() {
  return (
    <div>
      <p className="text-sm font-medium text-emerald-800">Quick answer</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">
        EMI = P &times; r &times; (1+r)<sup>n</sup> &divide; ((1+r)<sup>n</sup> &minus; 1)
      </p>
      <p className="mt-2 text-sm text-slate-700">
        P is your loan amount, r is your interest rate per month (annual rate
        &divide; 12 &divide; 100), and n is the number of monthly
        instalments. A &#8377;35,00,000 loan at 8.5% for 20 years comes to
        about &#8377;30,374/month &mdash; and roughly &#8377;37,89,715 of that
        is interest by the time the loan is paid off.
      </p>
    </div>
  );
}

export function HomeLoanEmiGuideHowItWorks() {
  return (
    <div className="space-y-4">
      <p>
        Every home loan in India runs on the same reducing-balance method:
        each EMI is split into a principal portion and an interest portion,
        and the interest portion is calculated fresh every month on
        whatever balance is still outstanding. That single mechanic explains
        almost everything people find confusing about EMIs.
      </p>
      <p>
        In month one, the interest is calculated on the full loan amount, so
        a large share of your first EMI goes to interest and only a small
        share reduces the principal. As the outstanding balance shrinks
        month by month, less of each EMI is needed for interest, so more of
        it starts chipping away at the principal. On a 20-year loan, it
        typically takes well over half the tenure before the principal
        portion overtakes the interest portion in a given EMI.
      </p>
      <p>
        This is also why prepaying early in the loan matters so much more
        than prepaying late &mdash; every rupee of principal you remove in
        year 2 stops accruing interest for the remaining 18 years, while the
        same rupee removed in year 18 only saves two years of interest.
      </p>
      <p>
        Most Indian home loans today are floating-rate, linked to an
        external benchmark (commonly the RBI repo rate) rather than a bank&rsquo;s
        internal rate. When the benchmark moves, your bank adjusts either
        your EMI or your tenure &mdash; check your loan agreement to see
        which one your lender defaults to, since it changes how a rate hike
        actually shows up for you.
      </p>
    </div>
  );
}

export function HomeLoanEmiGuideKeyFactors() {
  return (
    <div className="space-y-4">
      <p>
        Four inputs decide your EMI, and they don&rsquo;t all move it by the
        same amount:
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Loan amount</strong> moves EMI in a straight line &mdash;
          borrow 10% more, pay roughly 10% more EMI, all else equal.
        </li>
        <li>
          <strong>Interest rate</strong> has an outsized effect over a long
          tenure. A 1 percentage point difference on a 20-year loan changes
          total interest paid by a noticeably larger margin than the same 1
          point would on a 5-year loan, simply because there are more years
          for it to compound.
        </li>
        <li>
          <strong>Tenure</strong> is the one people underestimate. Stretching
          a &#8377;35,00,000 loan at 8.5% from 20 to 30 years lowers the EMI
          by about &#8377;3,462/month (11% less) &mdash; but raises total
          interest paid from &#8377;37,89,715 to &#8377;61,88,310, an
          increase of nearly 63%.
        </li>
        <li>
          <strong>Prepayments</strong> shorten the effective tenure without
          you having to formally refinance. On a floating-rate loan, banks
          in India cannot charge individual borrowers a prepayment or
          foreclosure penalty (per RBI rules), which makes partial
          prepayment one of the few genuinely free ways to cut your total
          interest.
        </li>
      </ul>
    </div>
  );
}

export function HomeLoanEmiGuideMistakes() {
  return (
    <div className="space-y-4">
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Choosing the longest tenure just to shrink the EMI.</strong>{" "}
          A lower EMI feels safer month to month, but as the tenure table
          above shows, a few thousand rupees of monthly relief can cost
          lakhs in extra interest. It&rsquo;s worth taking the shortest
          tenure your monthly budget can genuinely sustain, not the longest
          one your income qualifies for.
        </li>
        <li>
          <strong>Pushing EMI past a comfortable share of take-home pay.</strong>{" "}
          Most lenders will approve an EMI up to roughly 40&ndash;50% of
          monthly income, but approval isn&rsquo;t the same as comfortable
          &mdash; that ceiling leaves little room for other loans, a rate
          increase, or an income disruption.
        </li>
        <li>
          <strong>Ignoring the processing fee and insurance bundling.</strong>{" "}
          Processing fees (commonly around 0.5&ndash;1% of the loan amount)
          and optional loan-linked insurance add to your real cost but
          don&rsquo;t show up in the EMI figure itself &mdash; ask for the
          all-in cost, not just the headline rate.
        </li>
        <li>
          <strong>Never revisiting the rate after disbursal.</strong> Floating
          rates move with the benchmark in both directions. If your existing
          loan&rsquo;s spread over the benchmark looks wide compared to what
          new customers are quoted, a balance transfer to another lender or
          a renegotiation with your existing one can be worth the paperwork.
        </li>
        <li>
          <strong>Comparing loans by EMI alone.</strong> Two loans with an
          identical EMI can have very different tenures and total interest
          if their rates differ &mdash; always compare the total interest
          and the annual percentage rate (APR), not just the monthly number.
        </li>
      </ul>
    </div>
  );
}

export const homeLoanEmiGuideFaq: FaqItem[] = [
  {
    question: "Is a longer loan tenure always a bad idea?",
    answer:
      "Not always — a longer tenure can make sense if it's the difference between qualifying for the loan you need or not, or if you plan to prepay aggressively once your income grows. The mistake is choosing the longest tenure by default without weighing the extra total interest against the smaller monthly saving.",
  },
  {
    question: "Should I choose a fixed or floating interest rate?",
    answer:
      "Most Indian home loans are floating by default, and floating rates have historically worked out cheaper over long tenures since lenders price in a margin for the certainty a fixed rate offers. Fixed rates can still make sense if you specifically want payment predictability, but check whether it's a true fixed rate for the full tenure or only for an initial period.",
  },
  {
    question: "Does prepaying always help?",
    answer:
      "For a floating-rate loan with no prepayment penalty, prepaying almost always reduces your total interest, and the earlier in the tenure you do it, the more it saves. The main exception is if you'd earn a meaningfully higher after-tax return by investing that money instead — a decision the Rent vs Buy Calculator's underlying logic can help you reason through.",
  },
  {
    question: "How much of my income should go toward EMI?",
    answer:
      "A commonly used guideline is to keep total EMI obligations (including any existing loans) under about 40% of your take-home income, with 50% treated as an upper ceiling rather than a target. The right number for you also depends on how stable your income is and what other financial goals you're funding.",
  },
  {
    question: "Why did my EMI or tenure change without me doing anything?",
    answer:
      "If you have a floating-rate loan, your lender periodically resets the interest rate to track its benchmark. Depending on your loan's terms, that reset either changes your EMI (tenure stays fixed) or your tenure (EMI stays fixed) — check your latest loan statement or ask your lender which applies to you.",
  },
  {
    question: "Is this guide specific to a particular bank or lender?",
    answer:
      "No — the mechanics described here (reducing-balance EMI, benchmark-linked floating rates, no-penalty prepayment on floating loans) are general to how home loans work in India, not specific to any one lender. Exact rates, fees, and policies vary by lender, so confirm the specifics in your own loan agreement.",
  },
];
