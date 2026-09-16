import { FaqItem } from "@/components/FaqSection";

export function HomeLoanEmiFormula() {
  return (
    <>
      <p>
        EMI is calculated using the standard reducing-balance formula:{" "}
        <strong>EMI = P &times; r &times; (1+r)&#8319; / ((1+r)&#8319; &minus; 1)</strong>,
        where P is the loan principal, r is the monthly interest rate
        (annual rate &divide; 12 &divide; 100), and n is the total number of
        monthly installments (tenure in years &times; 12).
      </p>
      <p className="mt-3">
        This produces a <strong>fixed monthly payment</strong> for the
        entire tenure. In the early months, a larger share of each EMI goes
        toward interest; as the outstanding principal shrinks, more of each
        later EMI goes toward principal &mdash; even though the EMI amount
        itself stays the same throughout.
      </p>
      <p className="mt-3">
        Total interest payable is simply total payment (EMI &times; n)
        minus the original loan amount &mdash; that&rsquo;s what the
        &ldquo;total interest&rdquo; figure above shows.
      </p>
    </>
  );
}

export function HomeLoanEmiExample() {
  return (
    <>
      <p>
        <strong>Loan:</strong> &#8377;35,00,000 at 8.5% per annum for 20
        years (240 months).
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Monthly rate = 8.5 &divide; 12 &divide; 100 = 0.007083</li>
        <li>EMI &asymp; &#8377;30,376 per month</li>
        <li>Total payment over 20 years = 30,376 &times; 240 &asymp; &#8377;72,90,300</li>
        <li>Total interest = 72,90,300 &minus; 35,00,000 &asymp; &#8377;37,90,300</li>
      </ul>
      <p className="mt-3">
        Notice the total interest (&asymp;&#8377;37.9 lakh) is actually
        higher than the principal itself (&#8377;35 lakh) &mdash; typical
        for long tenures, and why shortening the tenure (even with a
        slightly higher EMI) usually saves far more over the life of the
        loan than chasing a marginally lower interest rate.
      </p>
    </>
  );
}

export function HomeLoanEmiGuidance() {
  return (
    <>
      <p>
        A <strong>longer tenure lowers your EMI</strong> but increases
        total interest paid significantly, since you carry the outstanding
        balance for longer. A <strong>shorter tenure raises your EMI</strong>{" "}
        but can cut total interest substantially &mdash; many borrowers
        choose the longest tenure their lender offers for eligibility
        purposes, then make voluntary prepayments to shorten the effective
        tenure once income grows.
      </p>
      <p className="mt-3">
        Lenders generally prefer your total EMI obligations (this loan plus
        any other loans) to stay within roughly 40&ndash;50% of your
        monthly take-home income, though the exact threshold varies by
        lender and credit profile. A larger down payment reduces the loan
        principal directly, which lowers both the EMI and the total
        interest paid.
      </p>
      <p className="mt-3">
        Home loans in India are usually offered on a floating rate linked
        to an external benchmark (such as the repo rate), meaning your EMI
        or tenure can change when the lender revises rates. Compare the
        annual percentage rate, processing fees, and prepayment/foreclosure
        charges across lenders &mdash; not just the headline interest rate
        &mdash; before choosing.
      </p>
      <p className="mt-3 text-xs text-slate-500">
        This calculator is for estimation only and isn&rsquo;t financial
        advice. Actual EMI, eligibility, and applicable rates depend on
        your lender&rsquo;s policies and your credit profile &mdash;
        confirm exact figures with your bank or housing finance company
        before committing.
      </p>
    </>
  );
}

export const homeLoanEmiBaseFaq: FaqItem[] = [
  {
    question: "How is home loan EMI calculated?",
    answer:
      "EMI is calculated with the formula EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ − 1), where P is the loan amount, r is the monthly interest rate, and n is the number of monthly installments. This gives a fixed monthly payment for the entire loan tenure.",
  },
  {
    question: "Does a longer loan tenure reduce my EMI?",
    answer:
      "Yes — a longer tenure spreads the same loan amount over more monthly installments, lowering each EMI. However, it also significantly increases the total interest paid over the life of the loan, since you carry the outstanding balance for longer.",
  },
  {
    question: "What is a good EMI-to-income ratio?",
    answer:
      "Most lenders prefer your total monthly EMI obligations (including existing loans) to stay within roughly 40–50% of your net monthly income, though the exact threshold varies by lender, income stability, and credit profile.",
  },
  {
    question: "Does prepayment reduce my EMI or my tenure?",
    answer:
      "It depends on what you choose with your lender. Most banks let you either reduce the tenure (keeping EMI the same) or reduce the EMI (keeping tenure the same) after a part-prepayment. Reducing tenure usually saves more total interest.",
  },
  {
    question: "How does a higher down payment affect my EMI?",
    answer:
      "A higher down payment reduces the loan principal directly, which lowers both your monthly EMI and the total interest paid over the loan's life — since interest is calculated on the outstanding principal.",
  },
  {
    question: "Fixed vs floating interest rate — which is better for a home loan?",
    answer:
      "A fixed rate keeps your EMI constant for the chosen period, offering predictability. A floating rate is usually linked to an external benchmark (like the repo rate) and can rise or fall over the loan tenure — most Indian home loans are floating-rate by default.",
  },
  {
    question: "How much of my EMI goes toward interest vs principal?",
    answer:
      "In the early years of the loan, a much larger share of each EMI goes toward interest. As the outstanding principal reduces over time, later EMIs shift toward repaying more principal — even though the EMI amount itself doesn't change.",
  },
  {
    question: "Is this EMI calculator accurate for all banks?",
    answer:
      "It calculates the standard reducing-balance EMI from your loan amount, rate, and tenure. It doesn't include processing fees, insurance premiums, or other lender-specific charges, so your actual monthly outgo may be slightly higher — confirm the exact figure with your lender.",
  },
];
