"use client";

import { useId, useMemo, useState } from "react";

type Shape = "slab" | "round";

const CUBIC_FT_PER_YARD = 27;
const BAG_YIELD_CUFT: Record<string, number> = {
  "40": 0.3,
  "60": 0.45,
  "80": 0.6,
};

export default function ConcreteCalculatorWidget() {
  const [shape, setShape] = useState<Shape>("slab");
  const [length, setLength] = useState("10");
  const [width, setWidth] = useState("10");
  const [diameter, setDiameter] = useState("12");
  const [thicknessIn, setThicknessIn] = useState("4");
  const [wastePct, setWastePct] = useState("10");
  const [bagSize, setBagSize] = useState<"40" | "60" | "80">("80");
  const [pricePerYard, setPricePerYard] = useState("175");
  const [pricePerBag, setPricePerBag] = useState("6.5");

  const result = useMemo(() => {
    const t = parseFloat(thicknessIn) || 0;
    const waste = (parseFloat(wastePct) || 0) / 100;
    let volumeCuFt = 0;

    if (shape === "slab") {
      const l = parseFloat(length) || 0;
      const w = parseFloat(width) || 0;
      volumeCuFt = l * w * (t / 12);
    } else {
      const d = parseFloat(diameter) || 0;
      const radiusFt = d / 12 / 2;
      volumeCuFt = Math.PI * radiusFt * radiusFt * (t / 12);
    }

    const volumeWithWaste = volumeCuFt * (1 + waste);
    const cubicYards = volumeWithWaste / CUBIC_FT_PER_YARD;
    const bagYield = BAG_YIELD_CUFT[bagSize];
    const bagsNeeded = bagYield > 0 ? Math.ceil(volumeWithWaste / bagYield) : 0;

    const readyMixCost = cubicYards * (parseFloat(pricePerYard) || 0);
    const bagsCost = bagsNeeded * (parseFloat(pricePerBag) || 0);

    return {
      cubicFeet: volumeWithWaste,
      cubicYards,
      bagsNeeded,
      readyMixCost,
      bagsCost,
    };
  }, [shape, length, width, diameter, thicknessIn, wastePct, bagSize, pricePerYard, pricePerBag]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex gap-2">
        {(["slab", "round"] as Shape[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setShape(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              shape === s
                ? "bg-emerald-700 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {s === "slab" ? "Rectangular slab / footing" : "Round column / footing"}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {shape === "slab" ? (
          <>
            <Field label="Length (ft)" value={length} onChange={setLength} />
            <Field label="Width (ft)" value={width} onChange={setWidth} />
          </>
        ) : (
          <Field label="Diameter (in)" value={diameter} onChange={setDiameter} />
        )}
        <Field label="Thickness / depth (in)" value={thicknessIn} onChange={setThicknessIn} />
        <Field label="Waste allowance (%)" value={wastePct} onChange={setWastePct} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-3">
        <div>
          <label htmlFor="bag-size" className="block text-xs font-medium text-slate-500">
            Bag size
          </label>
          <select
            id="bag-size"
            value={bagSize}
            onChange={(e) => setBagSize(e.target.value as "40" | "60" | "80")}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="40">40 lb bag</option>
            <option value="60">60 lb bag</option>
            <option value="80">80 lb bag</option>
          </select>
        </div>
        <Field label="Price / bag ($)" value={pricePerBag} onChange={setPricePerBag} small />
        <Field label="Ready-mix price / yd³ ($)" value={pricePerYard} onChange={setPricePerYard} small />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ResultCard label="Concrete needed" value={`${result.cubicYards.toFixed(2)} yd³`} sub={`${result.cubicFeet.toFixed(1)} ft³`} />
        <ResultCard label={`${bagSize} lb bags`} value={`${result.bagsNeeded}`} sub={`≈ $${result.bagsCost.toFixed(2)}`} />
        <ResultCard label="Ready-mix cost" value={`$${result.readyMixCost.toFixed(2)}`} sub="delivered estimate" />
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
