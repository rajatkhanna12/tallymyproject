"use client";

import { useId, useMemo, useState } from "react";

type Material = "hardwood" | "laminate" | "vinyl";

const DEFAULT_WASTE: Record<Material, string> = {
  hardwood: "10",
  laminate: "10",
  vinyl: "7",
};

export default function FlooringCalculatorWidget() {
  const [material, setMaterial] = useState<Material>("hardwood");
  const [roomLength, setRoomLength] = useState("15");
  const [roomWidth, setRoomWidth] = useState("12");
  const [wastePct, setWastePct] = useState(DEFAULT_WASTE.hardwood);
  const [sqftPerBox, setSqftPerBox] = useState("22");
  const [pricePerBox, setPricePerBox] = useState("85");

  function handleMaterialChange(m: Material) {
    setMaterial(m);
    setWastePct(DEFAULT_WASTE[m]);
  }

  const result = useMemo(() => {
    const roomArea = (parseFloat(roomLength) || 0) * (parseFloat(roomWidth) || 0);
    const waste = (parseFloat(wastePct) || 0) / 100;
    const areaWithWaste = roomArea * (1 + waste);
    const boxCoverage = parseFloat(sqftPerBox) || 0;
    const boxesNeeded = boxCoverage > 0 ? Math.ceil(areaWithWaste / boxCoverage) : 0;
    const totalCost = boxesNeeded * (parseFloat(pricePerBox) || 0);

    return { roomArea, areaWithWaste, boxesNeeded, totalCost };
  }, [roomLength, roomWidth, wastePct, sqftPerBox, pricePerBox]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex gap-2">
        {(["hardwood", "laminate", "vinyl"] as Material[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => handleMaterialChange(m)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
              material === m
                ? "bg-emerald-700 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Room length (ft)" value={roomLength} onChange={setRoomLength} />
        <Field label="Room width (ft)" value={roomWidth} onChange={setRoomWidth} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-3">
        <Field label="Waste allowance (%)" value={wastePct} onChange={setWastePct} small />
        <Field label="Sq ft per box" value={sqftPerBox} onChange={setSqftPerBox} small />
        <Field label="Price per box ($)" value={pricePerBox} onChange={setPricePerBox} small />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ResultCard
          label="Room area"
          value={`${result.roomArea.toFixed(1)} ft²`}
          sub="length × width"
        />
        <ResultCard
          label="Area with waste"
          value={`${result.areaWithWaste.toFixed(1)} ft²`}
          sub={`${wastePct}% allowance`}
        />
        <ResultCard
          label="Boxes to buy"
          value={`${result.boxesNeeded}`}
          sub={`≈ $${result.totalCost.toFixed(2)}`}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  small,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  small?: boolean;
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
        className={`mt-1 w-full rounded-md border border-slate-300 px-3 py-${
          small ? "1.5" : "2"
        } text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200`}
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
