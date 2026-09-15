"use client";

import { FloorPlan } from "../lib/types";

interface FloorPlanToolbarProps {
  plan: FloorPlan;
  activeFloor: number;
  onFloorChange: (floor: number) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onDownloadPNG: () => void;
  onPrintPDF: () => void;
  onRegenerate: () => void;
  showFurniture: boolean;
  onToggleFurniture: () => void;
}

export default function FloorPlanToolbar({
  plan,
  activeFloor,
  onFloorChange,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onDownloadPNG,
  onPrintPDF,
  onRegenerate,
  showFurniture,
  onToggleFurniture,
}: FloorPlanToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      {/* Floor Toggle (if duplex / 2 floors) */}
      <div className="flex items-center gap-2">
        {plan.floorsCount > 1 ? (
          <div className="inline-flex rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => onFloorChange(0)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                activeFloor === 0
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Ground Floor
            </button>
            <button
              type="button"
              onClick={() => onFloorChange(1)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                activeFloor === 1
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              First Floor
            </button>
          </div>
        ) : (
          <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
            Ground Floor Plan
          </span>
        )}

        {plan.isVastuOriented && (
          <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            Vastu-oriented (Opt-in)
          </span>
        )}
      </div>

      {/* Center Zoom Controls */}
      <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs">
        <button
          type="button"
          onClick={onZoomOut}
          className="h-7 w-7 rounded font-bold text-slate-600 hover:bg-slate-200 hover:text-slate-900"
          title="Zoom Out"
        >
          −
        </button>
        <span className="w-12 text-center font-medium text-slate-700">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={onZoomIn}
          className="h-7 w-7 rounded font-bold text-slate-600 hover:bg-slate-200 hover:text-slate-900"
          title="Zoom In"
        >
          +
        </button>
        <button
          type="button"
          onClick={onResetZoom}
          className="ml-1 rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 hover:text-slate-800"
          title="Fit to Screen"
        >
          Reset
        </button>
      </div>

      {/* Right Action Buttons: Download & Regenerate */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleFurniture}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition shadow-2xs ${
            showFurniture
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
          title="Toggle architectural furniture layout"
        >
          {showFurniture ? "Hide Furniture" : "Show Furniture"}
        </button>
        <button
          type="button"
          onClick={onRegenerate}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50"
        >
          ↻ Regenerate
        </button>
        <button
          type="button"
          onClick={onPrintPDF}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50"
        >
          Print PDF
        </button>
        <button
          type="button"
          onClick={onDownloadPNG}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3" />
          </svg>
          Download PNG
        </button>
      </div>
    </div>
  );
}
