"use client";

import { useId, useMemo, useState } from "react";
import { stampDutyStates } from "./stamp-duty-data";

type Gender = "male" | "female";

export default function StampDutyWidget() {
  const [propertyValue, setPropertyValue] = useState("5000000");
  const [stateName, setStateName] = useState(stampDutyStates[0].name);
  const [gender, setGender] = useState<Gender>("male");

  const selectedState = useMemo(
    () => stampDutyStates.find((s) => s.name === stateName) ?? stampDutyStates[0],
    [stateName]
  );

  const result = useMemo(() => {
    const value = parseFloat(propertyValue) || 0;
    const stampDutyPct =
      gender === "female" ? selectedState.stampDutyFemale : selectedState.stampDutyMale;
    const stampDutyAmount = value * (stampDutyPct / 100);
    let registrationAmount = value * (selectedState.registrationPct / 100);
    if (selectedState.registrationCap) {
      registrationAmount = Math.min(registrationAmount, selectedState.registrationCap);
    }
    const totalCharges = stampDutyAmount + registrationAmount;
    const totalCost = value + totalCharges;

    return { stampDutyPct, stampDutyAmount, registrationAmount, totalCharges, totalCost };
  }, [propertyValue, gender, selectedState]);

  const formatINR = (value: number) =>
    value.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Property value (₹)" value={propertyValue} onChange={setPropertyValue} />
        <div>
          <label htmlFor="stamp-duty-state" className="block text-xs font-medium text-slate-500">
            State
          </label>
          <select
            id="stamp-duty-state"
            value={stateName}
            onChange={(e) => setStateName(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-sm"
          >
            {stampDutyStates.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="stamp-duty-gender" className="block text-xs font-medium text-slate-500">
            Property registered in name of
          </label>
          <select
            id="stamp-duty-gender"
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-sm"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ResultCard
          label="Stamp duty"
          value={`₹${formatINR(result.stampDutyAmount)}`}
          sub={`${result.stampDutyPct}% of property value`}
        />
        <ResultCard
          label="Registration charge"
          value={`₹${formatINR(result.registrationAmount)}`}
          sub={
            selectedState.registrationCap
              ? `${selectedState.registrationPct}%, capped at ₹${formatINR(selectedState.registrationCap)}`
              : `${selectedState.registrationPct}% of property value`
          }
        />
        <ResultCard
          label="Total charges"
          value={`₹${formatINR(result.totalCharges)}`}
          sub="stamp duty + registration"
        />
      </div>

      <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
        Total cost (property + charges):{" "}
        <span className="font-semibold text-slate-900">₹{formatINR(result.totalCost)}</span>
      </div>

      {selectedState.note && (
        <p className="mt-3 text-xs text-slate-500">{selectedState.note}</p>
      )}
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
