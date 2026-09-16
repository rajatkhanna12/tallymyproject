import { FaqItem } from "@/components/FaqSection";

export function StampDutyFormula() {
  return (
    <>
      <p>
        <strong>Stamp duty</strong> = Property value &times; the stamp duty
        rate for your state (and, in several states, your gender/ownership
        type). <strong>Registration charge</strong> = Property value &times;
        the registration rate for your state &mdash; some states cap this at
        a fixed rupee amount regardless of property value (Karnataka at
        &#8377;15,000, Telangana at &#8377;20,000, for example).
      </p>
      <p className="mt-3">
        <strong>Total government charges</strong> = Stamp duty + Registration
        charge, paid on top of the property&rsquo;s sale price at the time of
        registration.
      </p>
      <p className="mt-3">
        In practice, duty is charged on the{" "}
        <strong>higher of the actual transaction value or the government&rsquo;s
        circle rate / ready reckoner rate / guidance value</strong> for that
        locality &mdash; not necessarily the price you negotiated.
      </p>
    </>
  );
}

export function StampDutyExample() {
  return (
    <>
      <p>
        <strong>Property:</strong> &#8377;50,00,000 flat in Maharashtra.
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Registered in a man&rsquo;s name: stamp duty = 50,00,000 &times; 5% = &#8377;2,50,000</li>
        <li>Registration charge = 50,00,000 &times; 1% = &#8377;50,000</li>
        <li>Total charges = &#8377;3,00,000 &rarr; total cost = &#8377;53,00,000</li>
      </ul>
      <p className="mt-3">
        Registered solely in a woman&rsquo;s name instead: stamp duty drops to
        4% (&#8377;2,00,000) &mdash; a &#8377;50,000 saving purely from the
        gender-based concession Maharashtra offers, before any other charges
        change.
      </p>
    </>
  );
}

export function StampDutyGuidance() {
  return (
    <>
      <p>
        Many states offer a <strong>1&ndash;2 percentage point stamp duty
        concession</strong> when a property is registered solely in a
        woman&rsquo;s name. Rules on whether joint male + female ownership
        qualifies for the discount vary by state &mdash; confirm with your
        sub-registrar before assuming it applies.
      </p>
      <p className="mt-3">
        Stamp duty and registration are <strong>one-time charges paid at
        registration</strong>, separate from GST (on under-construction
        property), brokerage, and home loan processing fees. Some lenders
        will include these charges in your loan amount if asked, though not
        all do by default.
      </p>
      <p className="mt-3">
        Rates and caps shown here are indicative state-level figures. Many
        states add municipal or local-body surcharges, apply different
        slabs for urban vs. rural areas, or revise rates during the year
        &mdash; always confirm the exact, current figure with your local
        sub-registrar office or the state&rsquo;s official stamp duty portal
        before budgeting or registering.
      </p>
    </>
  );
}

export const stampDutyBaseFaq: FaqItem[] = [
  {
    question: "What is stamp duty on property in India?",
    answer:
      "Stamp duty is a state government tax paid to legally register a property transaction, calculated as a percentage of the property's value (or the government's circle rate, whichever is higher). It's a one-time charge paid at the time of registration, in addition to the property's price.",
  },
  {
    question: "Do women get a stamp duty discount?",
    answer:
      "In several states (including Maharashtra, Delhi, Uttar Pradesh, Haryana, Rajasthan, and Punjab), stamp duty is 1–2 percentage points lower when the property is registered solely in a woman's name. Rules for joint ownership vary by state, so confirm with your local sub-registrar.",
  },
  {
    question: "Is stamp duty calculated on the sale price or the circle rate?",
    answer:
      "It's calculated on whichever is higher — the actual transaction value you agreed to pay, or the government's circle rate (also called ready reckoner rate or guidance value) for that locality. You can't reduce your stamp duty by simply under-declaring the sale price.",
  },
  {
    question: "What's the difference between stamp duty and registration charges?",
    answer:
      "Stamp duty is the tax on the property transaction itself, while the registration charge is a separate fee (commonly around 1% of property value) paid to record the transaction in the government's official records. Both are paid together at the sub-registrar's office.",
  },
  {
    question: "Do these rates apply to every city within a state?",
    answer:
      "Not necessarily. Many states apply different rates or caps for urban vs. rural areas, and some cities add a local-body surcharge or metro cess on top of the state rate. This calculator shows the typical state-level rate — check your specific municipal corporation for any additional surcharge.",
  },
  {
    question: "Can stamp duty be included in a home loan?",
    answer:
      "Some lenders will finance stamp duty and registration charges as part of the home loan if you ask, but many exclude these charges from the loan-to-value calculation by default and expect them to be paid separately from your own funds. Confirm this with your lender before budgeting.",
  },
  {
    question: "Are stamp duty and registration charges tax-deductible?",
    answer:
      "In India, stamp duty and registration charges paid on a residential property purchase are generally eligible for deduction under Section 80C of the Income Tax Act, within the overall ₹1.5 lakh combined limit, in the year they're paid. Eligibility conditions apply — consult a tax advisor for your specific situation.",
  },
  {
    question: "Why does stamp duty vary so much between states?",
    answer:
      "Stamp duty is a state subject under India's constitution, so each state sets and revises its own rates, concessions, and caps independently — there's no single national rate. Rates can also change mid-year, so always verify the current rate before transacting.",
  },
];
