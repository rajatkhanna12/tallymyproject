"use client";

import { useId, useMemo, useState } from "react";

type Material = "mulch" | "gravel" | "topsoil";

const DEFAULTS: Record<Material, { depth: string; bagCuFt: string; pricePerYard: string }> = {
  mulch: { depth: "3", bagCuFt: "2", pricePerYard: "40" },
  gravel: { depth: "2", bagCuFt: "0.5", pricePerYard: "55" },
  topsoil: { depth: "4", bagCuFt: "1.5", pricePerYard: "35" },
};

const CUBIC_FT_PER_YARD = 27;

export default function MulchGravelCalculatorWidget() {
  const [material, setMaterial] = useState<Material>("mulch");
  const [length, setLength] = useState("20");
  const [width, setWidth] = useState("10");
  const [depthIn, setDepthIn] = useState(DEFAULTS.mulch.depth);
  const [bagCuFt, setBagCuFt] = useState(DEFAULTS.mulch.bagCuFt);
  const [pricePerYard, setPricePerYard] = useState(DEFAULTS.mulch.pricePerYard);

  function handleMaterialChange(m: Material) {
    setMaterial(m);
    setDepthIn(DEFAULTS[m].depth);
    setBagCuFt(DEFAULTS[m].bagCuFt);
    setPricePerYard(DEFAULTS[m].pricePerYard);
  }

  const result = useMemo(() => {
    const area = (parseFloat(length) || 0) * (parseFloat(width) || 0);
    const depth = parseFloat(depthIn) || 0;
    const volumeCuFt = area * (depth / 12);
    const cubicYards = volumeCuFt / CUBIC_FT_PER_YARD;
    const bagSize = parseFloat(bagCuFt) || 0;
    const bagsNeeded = bagSize > 0 ? Math.ceil(volumeCuFt / bagSize) : 0;
    const bulkCost = cubicYards * (parseFloat(pricePerYard) || 0);

    return { area, volumeCuFt, cubicYards, bagsNeeded, bulkCost };
  }, [length, width, depthIn, bagCuFt, pricePerYard]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {(["mulch", "gravel", "topsoil"] as Material[]).map((m) => (
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

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Area length (ft)" value={length} onChange={setLength} />
        <Field label="Area width (ft)" value={width} onChange={setWidth} />
        <Field label="Depth (in)" value={depthIn} onChange={setDepthIn} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
        <Field label="Bag size (ft³)" value={bagCuFt} onChange={setBagCuFt} small />
        <Field label="Bulk price / yd³ ($)" value={pricePerYard} onChange={setPricePerYard} small />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ResultCard
          label={`${material[0].toUpperCase()}${material.slice(1)} needed`}
          value={`${result.cubicYards.toFixed(2)} yd³`}
          sub={`${result.volumeCuFt.toFixed(1)} ft³ • ${result.area.toFixed(0)} ft² area`}
        />
        <ResultCard label="Bags needed" value={`${result.bagsNeeded}`} sub="at chosen bag size" />
        <ResultCard label="Bulk delivery cost" value={`$${result.bulkCost.toFixed(2)}`} sub="estimate only" />
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
