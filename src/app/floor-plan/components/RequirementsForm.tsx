"use client";

import { useState } from "react";
import { CompassDirection, HouseRequirements, ParkingType } from "../lib/types";

interface RequirementsFormProps {
  onGenerate: (req: HouseRequirements | string) => void;
  isLoading?: boolean;
}

const EXAMPLE_PROMPTS = [
  "23 x 50 ft plot, north facing, 2 bedrooms, 2 bathrooms, bike parking, modern kitchen connected to dining",
  "20 x 50 ft plot, 2 bedrooms, 2 bathrooms, bike parking, living room, kitchen",
  "25 x 50 ft plot, 3 bedrooms, 2 bathrooms, car parking, kitchen with dining",
  "30 x 50 ft plot, east facing, 3 bedrooms, 3 bathrooms, car and bike parking",
  "30 x 60 ft plot, duplex 2 floors, 3 bedrooms, 3 bathrooms, car parking, stairs, balcony",
  "40 x 60 ft plot, duplex 2 floors, 4 bedrooms, 4 bathrooms, car parking, stairs, spacious living",
];

export default function RequirementsForm({ onGenerate, isLoading }: RequirementsFormProps) {
  const [tab, setTab] = useState<"text" | "form">("text");

  // Natural language state
  const [prompt, setPrompt] = useState(
    "23 x 50 ft plot, north facing, 2 bedrooms, 2 bathrooms, bike parking, modern kitchen connected to dining"
  );

  // Form state
  const [plotWidth, setPlotWidth] = useState("23");
  const [plotLength, setPlotLength] = useState("50");
  const [floors, setFloors] = useState<"1" | "2">("1");
  const [facing, setFacing] = useState<CompassDirection>("north");
  const [bedrooms, setBedrooms] = useState("2");
  const [bathrooms, setBathrooms] = useState("2");
  const [parking, setParking] = useState<ParkingType>("bike");
  const [openKitchen, setOpenKitchen] = useState(true);
  const [vastu, setVastu] = useState(false); // Vastu is STRICTLY false by default

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onGenerate(prompt);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bedCount = parseInt(bedrooms, 10) || 2;
    const bathCount = parseInt(bathrooms, 10) || 2;

    const req: HouseRequirements = {
      plot: {
        width: parseFloat(plotWidth) || 23,
        length: parseFloat(plotLength) || 50,
        unit: "ft",
      },
      floors: parseInt(floors, 10) || 1,
      facing,
      rooms: [
        { type: "living", quantity: 1 },
        { type: "kitchen", quantity: 1 },
        { type: "master_bedroom", quantity: 1 },
        ...(bedCount > 1 ? [{ type: "bedroom" as const, quantity: bedCount - 1 }] : []),
        { type: "bathroom" as const, quantity: bathCount },
      ],
      parking: {
        type: parking,
        quantity: 1,
      },
      kitchen: {
        openToDining: openKitchen,
      },
      staircase: parseInt(floors, 10) > 1,
      balcony: parseInt(floors, 10) > 1,
      preferences: {
        modern: true,
        spacious: false,
        vastu, // Opt-in only
      },
    };

    onGenerate(req);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      {/* Mode Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab("text")}
          className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
            tab === "text"
              ? "border-emerald-700 text-emerald-800"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          ✍️ Describe Naturally
        </button>
        <button
          type="button"
          onClick={() => setTab("form")}
          className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
            tab === "form"
              ? "border-emerald-700 text-emerald-800"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          📐 Enter Specifications
        </button>
      </div>

      {tab === "text" ? (
        /* Natural Language Mode */
        <form onSubmit={handleTextSubmit} className="mt-6">
          <label htmlFor="prompt-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Describe Your Plot &amp; Requirements
          </label>
          <div className="mt-2">
            <textarea
              id="prompt-input"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. 23 x 50 ft plot, north facing, 2 bedrooms, 2 bathrooms, bike parking, modern kitchen with dining..."
              className="w-full rounded-xl border border-slate-300 p-4 text-sm leading-relaxed text-slate-900 shadow-2xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          {/* Quick Example Chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Popular presets:</span>
            {EXAMPLE_PROMPTS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPrompt(p)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-2xs font-medium text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
              >
                {p.split(",")[0]}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="w-full rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-50 sm:w-auto sm:px-8"
            >
              {isLoading ? "Generating Layout..." : "Generate Floor Plan ➔"}
            </button>
          </div>
        </form>
      ) : (
        /* Form Specifications Mode */
        <form onSubmit={handleFormSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-slate-600">
                Plot Width (ft)
              </label>
              <input
                type="number"
                min="15"
                max="100"
                value={plotWidth}
                onChange={(e) => setPlotWidth(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600">
                Plot Length / Depth (ft)
              </label>
              <input
                type="number"
                min="25"
                max="150"
                value={plotLength}
                onChange={(e) => setPlotLength(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600">
                Floors
              </label>
              <select
                value={floors}
                onChange={(e) => setFloors(e.target.value as "1" | "2")}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              >
                <option value="1">Ground Floor (Single Story)</option>
                <option value="2">G + 1 (Duplex House)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600">
                Facing / Orientation
              </label>
              <select
                value={facing}
                onChange={(e) => setFacing(e.target.value as CompassDirection)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              >
                <option value="north">North Facing</option>
                <option value="east">East Facing</option>
                <option value="south">South Facing</option>
                <option value="west">West Facing</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-slate-600">
                Bedrooms
              </label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              >
                <option value="1">1 Bedroom (1 BHK)</option>
                <option value="2">2 Bedrooms (2 BHK)</option>
                <option value="3">3 Bedrooms (3 BHK)</option>
                <option value="4">4 Bedrooms (4 BHK)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600">
                Bathrooms
              </label>
              <select
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              >
                <option value="1">1 Bathroom</option>
                <option value="2">2 Bathrooms</option>
                <option value="3">3 Bathrooms</option>
                <option value="4">4 Bathrooms</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600">
                Parking Type
              </label>
              <select
                value={parking}
                onChange={(e) => setParking(e.target.value as ParkingType)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              >
                <option value="bike">Two-Wheeler / Bike Parking</option>
                <option value="car">Car Porch</option>
                <option value="both">Car &amp; Bike Parking</option>
                <option value="none">No Dedicated Parking</option>
              </select>
            </div>
          </div>

          {/* Kitchen Style & Vastu Opt-In Checkbox */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <input
                  id="kitchen-toggle"
                  type="checkbox"
                  checked={openKitchen}
                  onChange={(e) => setOpenKitchen(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-500"
                />
                <div>
                  <label htmlFor="kitchen-toggle" className="cursor-pointer text-sm font-semibold text-slate-900">
                    Open Concept Kitchen
                  </label>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                    Connects the kitchen directly to dining area for a modern, fluid living space.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <input
                  id="vastu-toggle"
                  type="checkbox"
                  checked={vastu}
                  onChange={(e) => setVastu(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-500"
                />
                <div>
                  <label htmlFor="vastu-toggle" className="cursor-pointer text-sm font-semibold text-slate-900">
                    Apply Vastu Preferences (Optional)
                  </label>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                    When enabled, rooms follow traditional Vastu zones where feasible. Disabled by default.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-50 sm:w-auto sm:px-8"
            >
              {isLoading ? "Generating Layout..." : "Generate Floor Plan ➔"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
