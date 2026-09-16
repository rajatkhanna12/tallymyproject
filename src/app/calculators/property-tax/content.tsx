import { FaqItem } from "@/components/FaqSection";

export function PropertyTaxFormula() {
  return (
    <>
      <p>
        <strong>Annual property tax</strong> = Assessed/annual value
        &times; your municipal corporation&rsquo;s tax rate, minus any
        early-payment rebate. Unlike stamp duty, property tax isn&rsquo;t
        set by the state &mdash; each municipal corporation (ULB) sets its
        own rate and valuation method, so there&rsquo;s no single
        &ldquo;India rate&rdquo; to plug in automatically. Enter the
        figures from your own tax bill or municipal portal above.
      </p>
      <p className="mt-3">
        Indian cities use one of three valuation systems: the{" "}
        <strong>Annual Rental Value (ARV)</strong> system (tax based on
        expected annual rent), the <strong>Capital Value System (CVS)</strong>{" "}
        (tax based on the property&rsquo;s market value, used in Mumbai),
        or the <strong>Unit Area System (UAS)</strong> (tax based on
        built-up area &times; a per-unit-area value that varies by
        location and usage, used in Delhi, Bengaluru, Kolkata, and others).
      </p>
    </>
  );
}

export function PropertyTaxExample() {
  return (
    <>
      <p>
        <strong>Property:</strong> assessed/annual value of &#8377;3,00,000,
        at a 15% tax rate, with a 5% rebate for early online payment.
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Gross tax = 3,00,000 &times; 15% = &#8377;45,000</li>
        <li>Rebate = 45,000 &times; 5% = &#8377;2,250</li>
        <li>Net tax = 45,000 &minus; 2,250 = &#8377;42,750/year</li>
        <li>Monthly equivalent &asymp; &#8377;3,563</li>
      </ul>
      <p className="mt-3">
        Your own assessed value and rate will look different depending on
        your city&rsquo;s valuation system &mdash; check your municipal
        corporation&rsquo;s property tax portal or your last paid receipt
        for the exact figures.
      </p>
    </>
  );
}

export function PropertyTaxGuidance() {
  return (
    <>
      <p>
        Most municipal corporations offer a{" "}
        <strong>rebate of 2&ndash;10% for paying online or before the due
        date</strong>, and many offer additional concessions for senior
        citizens, women owners, ex-servicemen, or properties with rainwater
        harvesting/solar installations &mdash; check your city&rsquo;s
        portal for what applies to you.
      </p>
      <p className="mt-3">
        <strong>Self-occupied vs. rented-out</strong> properties are taxed
        differently in several cities, usually with a higher rate or
        valuation multiplier for rented property. If your property is let
        out, confirm whether your city applies a different rate before
        using your self-occupied bill as a reference.
      </p>
      <p className="mt-3">
        Property tax is typically due once or twice a year (many cities
        split it into two half-yearly installments) and is separate from
        stamp duty &amp; registration (paid once, at purchase) and from any
        society or maintenance charges your building levies.
      </p>
      <p className="mt-3 text-xs text-slate-500">
        This calculator applies whatever rate and value you enter — it
        doesn&rsquo;t look up your specific city&rsquo;s rules. Confirm your
        assessed value, applicable rate, and any rebates directly with your
        municipal corporation before paying.
      </p>
    </>
  );
}

export const propertyTaxBaseFaq: FaqItem[] = [
  {
    question: "How is property tax calculated in India?",
    answer:
      "It's calculated as your property's assessed or annual value multiplied by your municipal corporation's tax rate, minus any rebate for early or online payment. The exact valuation method (ARV, Capital Value, or Unit Area System) and rate are set independently by each city's municipal corporation.",
  },
  {
    question: "Why does property tax vary so much between cities?",
    answer:
      "Property tax is a municipal-level tax in India, not a state or national one — each municipal corporation (ULB) sets its own valuation system and rate, so even two cities in the same state can have very different property tax structures.",
  },
  {
    question: "What's the difference between ARV, Capital Value System, and Unit Area System?",
    answer:
      "ARV (Annual Rental Value) taxes based on the rent the property could reasonably fetch annually. The Capital Value System (used in Mumbai) taxes based on the property's market value. The Unit Area System (used in Delhi, Bengaluru, Kolkata, and others) taxes based on built-up area multiplied by a per-unit value that varies by location, usage, and construction type.",
  },
  {
    question: "Where do I find my property's assessed value and tax rate?",
    answer:
      "Check your last property tax bill or receipt, or search your municipal corporation's official property tax portal using your property ID / PID number — most major cities now let you look this up online.",
  },
  {
    question: "Are there rebates for paying property tax early?",
    answer:
      "Many municipal corporations offer a rebate (commonly 2–10%) for paying the full year's tax early, online, or before a set due date. Some also offer separate concessions for senior citizens, women owners, or properties with rainwater harvesting or solar installations — check your city's specific rules.",
  },
  {
    question: "Do self-occupied and rented properties pay different property tax?",
    answer:
      "In several cities, yes — rented-out properties are often taxed at a higher rate or valuation multiplier than self-occupied ones. Confirm with your municipal corporation whether this applies before using a self-occupied bill as your reference rate.",
  },
  {
    question: "What happens if I don't pay property tax on time?",
    answer:
      "Most municipal corporations charge a monthly or annual penalty interest on overdue property tax, and prolonged non-payment can eventually lead to legal action or restrictions on property transactions. Due dates and penalty rates vary by city.",
  },
  {
    question: "Is property tax the same as stamp duty?",
    answer:
      "No — stamp duty and registration charges are one-time state-government charges paid when you purchase a property. Property tax is a recurring (usually annual or half-yearly) municipal charge paid for as long as you own the property.",
  },
];
