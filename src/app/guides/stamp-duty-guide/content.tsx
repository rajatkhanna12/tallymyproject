import { FaqItem } from "@/components/FaqSection";

export function StampDutyGuideQuickAnswer() {
  return (
    <div>
      <p className="text-sm font-medium text-emerald-800">Quick answer</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">
        Stamp duty + registration typically run 5&ndash;10% of your
        property&rsquo;s value in India, and the exact rate is set by your
        state, not by the central government.
      </p>
      <p className="mt-2 text-sm text-slate-700">
        On a &#8377;50,00,000 property in a state charging 6% stamp duty plus
        1% registration, that&rsquo;s &#8377;3,50,000 &mdash; due upfront,
        separately from your down payment and loan.
      </p>
    </div>
  );
}

export function StampDutyGuideHowItWorks() {
  return (
    <div className="space-y-4">
      <p>
        Stamp duty and registration charges are two separate line items that
        almost always get paid together. Stamp duty is a tax on the
        property transaction itself, paid to your state government;
        registration is the fee for officially recording the sale deed in
        your name at the sub-registrar&rsquo;s office. Without both, the
        property transfer isn&rsquo;t legally complete, whatever the sale
        agreement says.
      </p>
      <p>
        Because stamp duty is a state subject under the Indian Constitution,
        there is no single national rate &mdash; each state sets its own
        percentage, and many revise it periodically. That&rsquo;s also why
        the same property price can mean a noticeably different closing
        cost depending on which state it&rsquo;s in.
      </p>
      <p>
        Duty is charged on whichever is higher: the actual transaction value
        you agreed to pay, or the government&rsquo;s circle rate (also
        called ready reckoner rate or guidance value) for that locality.
        Sub-registrars check the circle rate specifically to stop buyers and
        sellers from under-declaring the sale price to reduce their duty.
      </p>
      <p>
        Both charges are paid before or at the time of registration &mdash;
        not spread over the loan tenure like an EMI &mdash; and most lenders
        do not finance them as part of the home loan, so they need to come
        from your own funds on top of the down payment.
      </p>
    </div>
  );
}

export function StampDutyGuideKeyFactors() {
  return (
    <div className="space-y-4">
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>State.</strong> Rates vary widely &mdash; some states sit
          well under 5% combined, others go well above 7%, and a handful cap
          the flat registration fee at a fixed rupee amount regardless of
          property value.
        </li>
        <li>
          <strong>Gender of the buyer.</strong> Several states charge a
          lower stamp duty rate when the property is registered solely (or
          jointly) in a woman&rsquo;s name, as a policy incentive for female
          property ownership. The concession and its exact terms for joint
          ownership vary by state.
        </li>
        <li>
          <strong>Urban vs. rural location.</strong> A few states apply
          different rates or registration caps depending on whether the
          property falls inside municipal limits or in a rural/panchayat
          area.
        </li>
        <li>
          <strong>Property value vs. circle rate.</strong> If your
          agreed price is below the circle rate, duty is still calculated on
          the (higher) circle rate, not on what you&rsquo;re actually
          paying.
        </li>
      </ul>
    </div>
  );
}

export function StampDutyGuideMistakes() {
  return (
    <div className="space-y-4">
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Budgeting only for the down payment.</strong> Stamp duty
          and registration are separate from your loan down payment and
          typically due in cash around the same time &mdash; buyers who
          plan for only the down payment are often short by several lakhs at
          registration.
        </li>
        <li>
          <strong>Assuming the rate is the same everywhere.</strong> If
          you&rsquo;re comparing properties across states or cities, the
          stamp duty difference alone can be a meaningful percentage of the
          property price &mdash; it&rsquo;s worth checking before you
          compare two offers as if they were equivalent.
        </li>
        <li>
          <strong>Not checking the joint-ownership concession rules.</strong>{" "}
          Where a state offers a lower rate for a woman owner, the exact
          treatment for jointly-owned property (with a male co-owner) varies
          by state &mdash; confirm with your sub-registrar&rsquo;s office or
          a property lawyer before assuming you qualify.
        </li>
        <li>
          <strong>Overlooking the Section 80C angle.</strong> Stamp duty and
          registration charges on a self-occupied residential property are
          commonly eligible for deduction under Section 80C in the year of
          payment, within the overall &#8377;1,50,000 combined 80C limit
          &mdash; confirm the current treatment with a chartered accountant,
          since it depends on your full 80C usage that year.
        </li>
        <li>
          <strong>Registering below the circle rate to save money.</strong>{" "}
          Duty is charged on the higher of transaction value or circle rate
          regardless of what&rsquo;s written in the agreement, so
          under-declaring the price doesn&rsquo;t reduce your stamp duty
          &mdash; it mainly creates legal risk.
        </li>
      </ul>
    </div>
  );
}

export const stampDutyGuideFaq: FaqItem[] = [
  {
    question: "Why is stamp duty different in every state?",
    answer:
      "Stamp duty is levied under state law, not central law, so each state government sets and periodically revises its own rate. There's no requirement for states to align, which is why the same property price can carry a different total charge depending on location.",
  },
  {
    question: "Do I pay stamp duty on a home loan too?",
    answer:
      "Stamp duty is charged on the property transaction, not the loan — but most states also charge a smaller separate stamp duty on the loan/mortgage deed itself, on top of the property's registration charges. Ask your lender or sub-registrar for the exact loan-document duty in your state.",
  },
  {
    question: "Can stamp duty be added to my home loan amount?",
    answer:
      "Most lenders exclude stamp duty and registration from the financed amount and lend only against the property's cost, so this typically needs to be paid from your own funds. A small number of lenders offer limited financing for these charges — check with your specific lender.",
  },
  {
    question: "Is the woman-buyer stamp duty concession available everywhere?",
    answer:
      "No — it's offered by some states and not others, and the size of the concession and its rules for joint ownership differ where it does exist. Check your specific state's current stamp duty schedule rather than assuming a uniform rule.",
  },
  {
    question: "What's the difference between circle rate and market rate?",
    answer:
      "The circle rate (also called ready reckoner rate or guidance value, depending on the state) is a government-notified minimum valuation for a locality, used as the floor for stamp duty calculation. The market rate is what a property actually transacts for, which can be higher or lower than the circle rate.",
  },
  {
    question: "When exactly do I pay stamp duty and registration charges?",
    answer:
      "They're paid at the time of registering the sale deed, which typically happens around possession — not spread across the loan tenure. Most buyers pay this as a lump sum from savings, separate from the loan disbursal.",
  },
];
