import { FaqItem } from "@/components/FaqSection";

export function RentVsBuyFormula() {
  return (
    <>
      <p>
        <strong>Buying scenario:</strong> your net worth after the
        comparison period is the property&rsquo;s projected future value
        (grown at your assumed appreciation rate) minus whatever loan
        balance is still outstanding.
      </p>
      <p className="mt-3">
        <strong>Renting scenario:</strong> instead of a down payment and
        one-time buying costs, you invest that same amount in something
        else (index funds, FDs, etc.). Each month, whenever the EMI you
        would have paid is higher than your actual rent, you invest that
        difference too. Your net worth is the resulting investment
        portfolio, compounded monthly at your assumed return.
      </p>
      <p className="mt-3">
        The calculator runs this month-by-month for your chosen comparison
        period (not just a one-shot estimate), so rising rent, a shrinking
        loan balance, and compounding returns are all reflected in the
        final numbers.
      </p>
    </>
  );
}

export function RentVsBuyExample() {
  return (
    <>
      <p>
        <strong>Scenario:</strong> a &#8377;60,00,000 property, 20% down
        payment, 8.5% home loan for 20 years, versus renting an equivalent
        home for &#8377;20,000/month (rising 5% a year), comparing over 10
        years, with property appreciating 6%/year and alternative
        investments returning 10%/year.
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>EMI &asymp; &#8377;41,676/month</li>
        <li>Property value after 10 years &asymp; &#8377;1.07 crore</li>
        <li>Renter invests the &#8377;12,00,000 down payment + costs, plus the EMI&ndash;rent gap every month</li>
      </ul>
      <p className="mt-3">
        Whether buying or renting comes out ahead depends heavily on how
        the appreciation rate compares to the alternative investment
        return &mdash; try adjusting those two numbers in the calculator
        above to see how sensitive the result is.
      </p>
    </>
  );
}

export function RentVsBuyGuidance() {
  return (
    <>
      <p>
        This is a <strong>purely financial comparison</strong> &mdash; it
        doesn&rsquo;t account for the non-financial value of owning (stability,
        the ability to renovate, no landlord risk) or of renting
        (flexibility to relocate, no maintenance liability, lower upfront
        commitment). Both are legitimate reasons to choose one over the
        other even when the numbers favor the alternative.
      </p>
      <p className="mt-3">
        The result is <strong>highly sensitive to your appreciation and
        investment-return assumptions</strong>, which are genuinely
        uncertain over long periods. It&rsquo;s worth running the
        calculator a few times with conservative, moderate, and optimistic
        assumptions rather than trusting a single result.
      </p>
      <p className="mt-3">
        The model assumes you invest the EMI&ndash;rent gap only when it&rsquo;s
        positive (i.e., it doesn&rsquo;t model withdrawing from investments
        if rent later exceeds EMI), and it excludes recurring costs like
        property maintenance, society charges, and home insurance on the
        buying side, and security deposits on the renting side &mdash;
        factor those in separately for a fuller picture.
      </p>
      <p className="mt-3 text-xs text-slate-500">
        This calculator is for illustration only and isn&rsquo;t financial
        advice. Consult a financial advisor for guidance specific to your
        situation.
      </p>
    </>
  );
}

export const rentVsBuyBaseFaq: FaqItem[] = [
  {
    question: "Is it better to rent or buy a home in India?",
    answer:
      "It depends on your specific numbers — property price, rent for an equivalent home, loan rate, how long you plan to stay, and what return you could earn by investing instead. There's no universal answer; use the calculator above with your own figures rather than a general rule of thumb.",
  },
  {
    question: "What does this calculator actually compare?",
    answer:
      "It compares your projected net worth in two scenarios after a chosen number of years: buying (property value minus any remaining loan) versus renting and investing the down payment plus the monthly EMI–rent difference in an alternative investment.",
  },
  {
    question: "Why does the result change so much when I adjust appreciation or investment return?",
    answer:
      "Because both compound over the comparison period, even small differences in the assumed annual rate produce large differences in the final numbers over 10–20 years. This is the single most sensitive input in the model — test a range of realistic assumptions rather than one guess.",
  },
  {
    question: "Does this include stamp duty and registration charges?",
    answer:
      "Yes, as a one-time buying cost percentage you can set (default 7%, covering stamp duty, registration, and brokerage). Use the Stamp Duty Calculator above for an India state-wise estimate of that specific charge.",
  },
  {
    question: "Does the calculator account for rent deposits or maintenance charges?",
    answer:
      "No — it excludes security deposits, society/maintenance charges, property insurance, and repair costs on both sides to keep the model focused on the core financial trade-off. These recurring costs matter in practice and should be factored in separately.",
  },
  {
    question: "What if I plan to sell before the loan is fully repaid?",
    answer:
      "The calculator already handles this — set the comparison period to however many years you actually plan to hold the property, and it computes the remaining loan balance owed at that point, subtracting it from the projected property value.",
  },
  {
    question: "Should I trust a single result from this calculator?",
    answer:
      "Treat it as a starting point, not a verdict. Run it with conservative, moderate, and optimistic assumptions for appreciation and investment returns, since both are genuinely uncertain over long horizons, and weigh the result alongside non-financial factors like stability and flexibility.",
  },
];
