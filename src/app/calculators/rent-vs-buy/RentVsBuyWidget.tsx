"use client";

import { useId, useMemo, useState } from "react";

interface SimResult {
  emi: number;
  buyingNetWorth: number;
  rentingNetWorth: number;
  propertyValue: number;
  outstandingLoan: number;
  totalEmiPaid: number;
  totalRentPaid: number;
}

function simulate(
  price: number,
  downPaymentPct: number,
  loanRatePct: number,
  loanTenureYears: number,
  monthlyRentStart: number,
  rentIncreasePct: number,
  appreciationPct: number,
  investReturnPct: number,
  holdingYears: number,
  oneTimeCostPct: number
): SimResult {
  const months = Math.max(1, Math.round(holdingYears * 12));
  const loanMonths = Math.max(1, Math.round(loanTenureYears * 12));
  const r = loanRatePct / 12 / 100;
  const downPayment = price * (downPaymentPct / 100);
  const loanAmount = Math.max(0, price - downPayment);
  const oneTimeCosts = price * (oneTimeCostPct / 100);
  const monthlyInvestRate = investReturnPct / 12 / 100;

  let emi = 0;
  if (loanAmount > 0) {
    if (r > 0) {
      const factor = Math.pow(1 + r, loanMonths);
      emi = (loanAmount * r * factor) / (factor - 1);
    } else {
      emi = loanAmount / loanMonths;
    }
  }

  let outstanding = loanAmount;
  let portfolio = downPayment + oneTimeCosts;
  let currentRent = monthlyRentStart;
  let totalEmiPaid = 0;
  let totalRentPaid = 0;

  for (let m = 1; m <= months; m++) {
    const emiThisMonth = m <= loanMonths && outstanding > 0 ? emi : 0;
    if (emiThisMonth > 0) {
      const interest = outstanding * r;
      const principal = Math.min(outstanding, emiThisMonth - interest);
      outstanding = Math.max(0, outstanding - principal);
      totalEmiPaid += emiThisMonth;
    }

    portfolio *= 1 + monthlyInvestRate;
    const gap = emiThisMonth - currentRent;
    if (gap > 0) portfolio += gap;

    totalRentPaid += currentRent;

    if (m % 12 === 0) currentRent *= 1 + rentIncreasePct / 100;
  }

  const propertyValue = price * Math.pow(1 + appreciationPct / 100, holdingYears);
  const buyingNetWorth = propertyValue - outstanding;
  const rentingNetWorth = portfolio;

  return {
    emi,
    buyingNetWorth,
    rentingNetWorth,
    propertyValue,
    outstandingLoan: outstanding,
    totalEmiPaid,
    totalRentPaid,
  };
}

export default function RentVsBuyWidget() {
  const [price, setPrice] = useState("6000000");
  const [downPaymentPct, setDownPaymentPct] = useState("20");
  const [loanRatePct, setLoanRatePct] = useState("8.5");
  const [loanTenureYears, setLoanTenureYears] = useState("20");
  const [monthlyRent, setMonthlyRent] = useState("20000");
  const [rentIncreasePct, setRentIncreasePct] = useState("5");
  const [appreciationPct, setAppreciationPct] = useState("6");
  const [investReturnPct, setInvestReturnPct] = useState("10");
  const [holdingYears, setHoldingYears] = useState("10");
  const [oneTimeCostPct, setOneTimeCostPct] = useState("7");

  const result = useMemo(
    () =>
      simulate(
        parseFloat(price) || 0,
        parseFloat(downPaymentPct) || 0,
        parseFloat(loanRatePct) || 0,
        parseFloat(loanTenureYears) || 1,
        parseFloat(monthlyRent) || 0,
        parseFloat(rentIncreasePct) || 0,
        parseFloat(appreciationPct) || 0,
        parseFloat(investReturnPct) || 0,
        parseFloat(holdingYears) || 1,
        parseFloat(oneTimeCostPct) || 0
      ),
    [
      price,
      downPaymentPct,
      loanRatePct,
      loanTenureYears,
      monthlyRent,
      rentIncreasePct,
      appreciationPct,
      investReturnPct,
      holdingYears,
      oneTimeCostPct,
    ]
  );

  const formatINR = (value: number) =>
    value.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  const diff = result.buyingNetWorth - result.rentingNetWorth;
  const buyingWins = diff >= 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Property price (₹)" value={price} onChange={setPrice} />
        <Field label="Down payment (%)" value={downPaymentPct} onChange={setDownPaymentPct} />
        <Field label="Home loan rate (% p.a.)" value={loanRatePct} onChange={setLoanRatePct} step="0.05" />
        <Field label="Loan tenure (years)" value={loanTenureYears} onChange={setLoanTenureYears} />
        <Field label="Current monthly rent (₹)" value={monthlyRent} onChange={setMonthlyRent} />
        <Field label="Annual rent increase (%)" value={rentIncreasePct} onChange={setRentIncreasePct} />
        <Field label="Property appreciation (% p.a.)" value={appreciationPct} onChange={setAppreciationPct} />
        <Field label="Alt. investment return (% p.a.)" value={investReturnPct} onChange={setInvestReturnPct} />
        <Field label="Comparison period (years)" value={holdingYears} onChange={setHoldingYears} />
      </div>
      <div className="mt-4 max-w-xs">
        <Field
          label="One-time buying costs (%, stamp duty + registration + brokerage)"
          value={oneTimeCostPct}
          onChange={setOneTimeCostPct}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ResultCard label="Monthly EMI" value={`₹${formatINR(result.emi)}`} sub="if you buy" />
        <ResultCard
          label="Net worth if you buy"
          value={`₹${formatINR(result.buyingNetWorth)}`}
          sub={`property value − loan owed, after ${holdingYears || "0"} yrs`}
        />
        <ResultCard
          label="Net worth if you rent & invest"
          value={`₹${formatINR(result.rentingNetWorth)}`}
          sub="invested down payment + EMI-rent gap"
        />
      </div>

      <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
        {buyingWins ? (
          <>
            Buying is projected to leave you{" "}
            <span className="font-semibold text-emerald-700">₹{formatINR(Math.abs(diff))} wealthier</span>{" "}
            than renting &amp; investing, over {holdingYears || "0"} years.
          </>
        ) : (
          <>
            Renting &amp; investing is projected to leave you{" "}
            <span className="font-semibold text-emerald-700">₹{formatINR(Math.abs(diff))} wealthier</span>{" "}
            than buying, over {holdingYears || "0"} years.
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  step,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  step?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-slate-500">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
      />
    </div>
  );
}

function ResultCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-emerald-700">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{sub}</div>
    </div>
  );
}
