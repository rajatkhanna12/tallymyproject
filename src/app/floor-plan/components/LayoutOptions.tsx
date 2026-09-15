"use client";

import { FloorPlan, LayoutStyleVariant } from "../lib/types";

interface LayoutOptionsProps {
  plans: FloorPlan[];
  selectedVariant: LayoutStyleVariant;
  onSelectVariant: (variant: LayoutStyleVariant) => void;
}

const VARIANT_DETAILS: Record<
  LayoutStyleVariant,
  { tag: string; description: string; highlights: string[] }
> = {
  spacious: {
    tag: "Spacious",
    description: "Expansive open-concept living & dining with an enlarged master bedroom.",
    highlights: ["Larger living hall", "Generous room depths", "Front sit-out / verandah"],
  },
  practical: {
    tag: "Practical",
    description: "Classic balanced residential zoning with a central circulation lobby.",
    highlights: ["Dedicated kitchen & utility", "Quiet rear bedrooms", "Optimal privacy"],
  },
  compact: {
    tag: "Compact",
    description: "Zero-wasted-corridor layout designed for maximum usable room space.",
    highlights: ["High space efficiency", "Cost-effective construction", "No dead passages"],
  },
};

export default function LayoutOptions({
  plans,
  selectedVariant,
  onSelectVariant,
}: LayoutOptionsProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">Layout Variations</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Choose from 3 deterministic architectural variations generated for your plot
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {plans.map((plan) => {
          const isSelected = plan.styleVariant === selectedVariant;
          const details = VARIANT_DETAILS[plan.styleVariant];

          return (
            <button
              key={plan.styleVariant}
              type="button"
              onClick={() => onSelectVariant(plan.styleVariant)}
              className={`flex flex-col justify-between rounded-xl border p-4 text-left transition ${
                isSelected
                  ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                      isSelected
                        ? "bg-emerald-700 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {details.tag}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    {plan.totalBuiltUpArea} sq ft
                  </span>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {details.description}
                </p>
              </div>

              <div className="mt-3 border-t border-slate-100 pt-2.5">
                <ul className="space-y-1 text-2xs text-slate-500">
                  {details.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="text-emerald-600">✓</span> {h}
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
