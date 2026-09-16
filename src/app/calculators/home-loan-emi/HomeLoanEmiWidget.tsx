"use client";

import { useId, useMemo, useState } from "react";

export default function HomeLoanEmiWidget() {
  const [loanAmount, setLoanAmount] = useState("3500000");
  const [interestRate, setInterestRate] = useState("8.5");
  const [tenureYears, setTenureYears] = useState("20");

  const result = useMemo(() => {
    const P = parseFloat(loanAmount) || 0;
    const annualRate = parseFloat(interestRate) || 0;
    const years = parseFloat(tenureYears) || 0;
    const n = Math.round(years * 12);
    const r = annualRate / 12 / 100;

    let emi = 0;
    if (P > 0 && n > 0) {
      if (r > 0) {
        const factor = Math.pow(1 + r, n);
        emi = (P * r * factor) / (factor - 1);
      } else {
        emi = P / n;
      }
    }

    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;
    const interestShare = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;
    const principalShare = 100 - interestShare;

    return { emi, totalPayment, totalInterest, interestShare, principalShare };
  }, [loanAmount, interestRate, tenureYears]);

  const formatINR = (value: number) =>
    value.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Loan amount (₹)" value={loanAmount} onChange={setLoanAmount} />
        <Field
          label="Interest rate (% p.a.)"
          value={interestRate}
          onChange={setInterestRate}
          step="0.05"
        />
        <Field label="Loan tenure (years)" value={tenureYears} onChange={setTenureYears} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ResultCard
          label="Monthly EMI"
          value={`₹${formatINR(result.emi)}`}
          sub="fixed monthly payment"
        />
        <ResultCard
          label="Total interest"
          value={`₹${formatINR(result.totalInterest)}`}
          sub={`${result.interestShare.toFixed(1)}% of total payment`}
        />
        <ResultCard
          label="Total payment"
          value={`₹${formatINR(result.totalPayment)}`}
          sub="principal + interest"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-full bg-slate-100">
        <div className="flex h-3 w-full">
          <div
            className="h-full bg-emerald-700"
            style={{ width: `${result.principalShare}%` }}
            title="Principal"
          />
          <div
            className="h-full bg-emerald-200"
            style={{ width: `${result.interestShare}%` }}
            title="Interest"
          />
        </div>
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-500">
        <span>Principal ({result.principalShare.toFixed(1)}%)</span>
        <span>Interest ({result.interestShare.toFixed(1)}%)</span>
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
