"use client";

import { useId, useMemo, useState } from "react";

export default function PropertyTaxWidget() {
  const [assessedValue, setAssessedValue] = useState("300000");
  const [taxRatePct, setTaxRatePct] = useState("15");
  const [rebatePct, setRebatePct] = useState("0");

  const result = useMemo(() => {
    const value = parseFloat(assessedValue) || 0;
    const rate = parseFloat(taxRatePct) || 0;
    const rebate = parseFloat(rebatePct) || 0;

    const grossTax = value * (rate / 100);
    const rebateAmount = grossTax * (rebate / 100);
    const netTax = grossTax - rebateAmount;
    const monthlyEquivalent = netTax / 12;

    return { grossTax, rebateAmount, netTax, monthlyEquivalent };
  }, [assessedValue, taxRatePct, rebatePct]);

  const formatINR = (value: number) =>
    value.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field
          label="Assessed / annual value (₹)"
          value={assessedValue}
          onChange={setAssessedValue}
        />
        <Field
          label="Your property tax rate (%)"
          value={taxRatePct}
          onChange={setTaxRatePct}
        />
        <Field
          label="Early-payment rebate (%)"
          value={rebatePct}
          onChange={setRebatePct}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Find your assessed/annual value and tax rate on your last property
        tax bill or your municipal corporation&rsquo;s online portal — they
        differ by city, so there&rsquo;s no single national rate to default
        to here.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ResultCard
          label="Gross annual tax"
          value={`₹${formatINR(result.grossTax)}`}
          sub="before rebate"
        />
        <ResultCard
          label="Net annual tax"
          value={`₹${formatINR(result.netTax)}`}
          sub={`after ₹${formatINR(result.rebateAmount)} rebate`}
        />
        <ResultCard
          label="Monthly equivalent"
          value={`₹${formatINR(result.monthlyEquivalent)}`}
          sub="net tax ÷ 12"
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
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
