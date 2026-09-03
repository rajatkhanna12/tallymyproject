"use client";

import { useId, useMemo, useState } from "react";

export default function RoofingCalculatorWidget() {
  const [length, setLength] = useState("40");
  const [width, setWidth] = useState("30");
  const [pitchRise, setPitchRise] = useState("6");
  const [wastePct, setWastePct] = useState("10");
  const [bundlesPerSquare, setBundlesPerSquare] = useState("3");
  const [pricePerBundle, setPricePerBundle] = useState("38");

  const result = useMemo(() => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const rise = parseFloat(pitchRise) || 0;
    const waste = (parseFloat(wastePct) || 0) / 100;

    const footprintArea = l * w;
    const pitchMultiplier = Math.sqrt(rise * rise + 144) / 12;
    const roofArea = footprintArea * pitchMultiplier;
    const roofAreaWithWaste = roofArea * (1 + waste);
    const squares = roofAreaWithWaste / 100;
    const bundles = Math.ceil(squares * (parseFloat(bundlesPerSquare) || 0));
    const cost = bundles * (parseFloat(pricePerBundle) || 0);

    return { footprintArea, pitchMultiplier, roofArea, roofAreaWithWaste, squares, bundles, cost };
  }, [length, width, pitchRise, wastePct, bundlesPerSquare, pricePerBundle]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold text-slate-700">Building footprint</div>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Length (ft)" value={length} onChange={setLength} />
        <Field label="Width (ft)" value={width} onChange={setWidth} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pitch-rise" className="block text-xs font-medium text-slate-500">
            Roof pitch (rise per 12&Prime; run)
          </label>
          <input
            id="pitch-rise"
            type="number"
            inputMode="decimal"
            value={pitchRise}
            onChange={(e) => setPitchRise(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
          />
          <p className="mt-1 text-xs text-slate-500">
            e.g. enter 6 for a &ldquo;6/12&rdquo; pitch
          </p>
        </div>
        <Field label="Waste allowance (%)" value={wastePct} onChange={setWastePct} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
        <Field label="Bundles per square" value={bundlesPerSquare} onChange={setBundlesPerSquare} small />
        <Field label="Price per bundle ($)" value={pricePerBundle} onChange={setPricePerBundle} small />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ResultCard
          label="Roof area"
          value={`${result.roofAreaWithWaste.toFixed(0)} ft²`}
          sub={`pitch multiplier ${result.pitchMultiplier.toFixed(3)}`}
        />
        <ResultCard label="Roofing squares" value={`${result.squares.toFixed(2)}`} sub="1 square = 100 ft²" />
        <ResultCard
          label="Shingle bundles"
          value={`${result.bundles}`}
          sub={`≈ $${result.cost.toFixed(2)} materials`}
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
