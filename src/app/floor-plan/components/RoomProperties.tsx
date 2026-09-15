"use client";

import { FloorPlan, Room } from "../lib/types";
import { formatFeetInches } from "../lib/layout-engine";

interface RoomPropertiesProps {
  plan: FloorPlan;
  selectedRoom: Room | null;
  onUpdateRoom: (updated: Room) => void;
  onDeselect: () => void;
}

export default function RoomProperties({
  plan,
  selectedRoom,
  onUpdateRoom,
  onDeselect,
}: RoomPropertiesProps) {
  if (!selectedRoom) {
    // Show overall plan metadata when no room is selected
    return (
      <div className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-semibold text-slate-900">Plan Overview</h3>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              {plan.styleVariant.toUpperCase()}
            </span>
          </div>

          <div className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Plot Dimensions:</span>
              <span className="font-semibold text-slate-900">
                {plan.plot.width} ft &times; {plan.plot.length} ft
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Plot Area:</span>
              <span className="font-semibold text-slate-900">
                {plan.metadata.plotArea} sq ft
              </span>
            </div>
            {plan.areas?.netRoomArea && (
              <div className="flex justify-between text-slate-600">
                <span>Net Habitable (Carpet):</span>
                <span className="font-semibold text-slate-800">
                  {plan.areas.netRoomArea} sq ft
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-100 pt-2 text-slate-600">
              <div>
                <span className="font-medium text-slate-700">Est. Gross Enclosed Built-Up:</span>
                <span className="block text-2xs text-slate-400">Conceptual estimate (not construction-grade)</span>
              </div>
              <span className="font-bold text-emerald-700">
                {plan.areas ? plan.areas.enclosedBuiltUpArea : plan.totalBuiltUpArea} sq ft
              </span>
            </div>
            {plan.areas && (
              <>
                <div className="flex justify-between text-xs text-slate-500 pl-2">
                  <span>• Ground Floor Enclosed:</span>
                  <span className="font-medium text-slate-700">{plan.groundFloorArea} sq ft</span>
                </div>
                {plan.firstFloorArea > 0 && (
                  <div className="flex justify-between text-xs text-slate-500 pl-2">
                    <span>• First Floor Enclosed:</span>
                    <span className="font-medium text-slate-700">{plan.firstFloorArea} sq ft</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-slate-500 pl-2">
                  <span>• Ground Coverage Ratio:</span>
                  <span className="font-semibold text-slate-800">{plan.areas.groundCoveragePct}%</span>
                </div>
                {plan.setbackAssumptions && (
                  <div className="flex justify-between text-xs text-slate-500 pl-2">
                    <span>• Setbacks:</span>
                    <span className="font-medium text-slate-700">
                      {plan.setbackAssumptions.front === 0 &&
                      plan.setbackAssumptions.rear === 0 &&
                      plan.setbackAssumptions.left === 0 &&
                      plan.setbackAssumptions.right === 0
                        ? "No assumption supplied (full plot)"
                        : `F:${plan.setbackAssumptions.front}' R:${plan.setbackAssumptions.rear}' L:${plan.setbackAssumptions.left}' R:${plan.setbackAssumptions.right}'`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-100 pt-2 text-slate-600">
                  <span>Parking (Open Access):</span>
                  <span className="font-medium text-slate-800">{plan.areas.parkingArea} sq ft</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Porch &amp; Verandah:</span>
                  <span className="font-medium text-slate-800">{plan.areas.porchArea} sq ft</span>
                </div>
                {plan.areas.balconyArea > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Balcony (Semi-Open):</span>
                    <span className="font-medium text-slate-800">{plan.areas.balconyArea} sq ft</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>OTS (Open-To-Sky):</span>
                  <span className="font-medium text-slate-800">{plan.areas.openToSkyArea} sq ft</span>
                </div>
                {plan.areas.openSetbackArea > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Open / Unbuilt Area:</span>
                    <span className="font-medium text-slate-800">{plan.areas.openSetbackArea} sq ft</span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between border-t border-slate-100 pt-2 text-slate-600">
              <span>Orientation:</span>
              <span className="font-semibold capitalize text-slate-900">
                {plan.facing} Facing
              </span>
            </div>
            {plan.isVastuOriented && (
              <div className="mt-1 flex items-center justify-between rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-800">
                <span>Layout Compliance:</span>
                <span className="font-semibold">Vastu-oriented</span>
              </div>
            )}
          </div>

          <div className="mt-5 rounded-lg bg-slate-50 p-3.5 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">💡 Interactive Editing</p>
            <p className="mt-1 leading-relaxed">
              Click any room on the plan to inspect, resize, reposition, or rename it. You can also drag rooms directly on the canvas.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 text-xs text-slate-400 space-y-1">
          <p className="text-2xs text-slate-400 italic leading-relaxed">
            * Areas and setbacks are estimated geometric values for conceptual planning and do not substitute for construction-grade working drawings or municipal approvals.
          </p>
          <p className="font-medium text-slate-500">TallyMyProject • Architectural Layout Engine</p>
        </div>
      </div>
    );
  }

  const areaSqFt = Math.round(selectedRoom.width * selectedRoom.height);

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Selected Room
            </span>
            <h3 className="font-bold text-slate-900">{selectedRoom.name}</h3>
          </div>
          <button
            type="button"
            onClick={onDeselect}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            title="Deselect room"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-4 text-sm">
          {/* Room Name */}
          <div>
            <label className="block text-xs font-medium text-slate-500">
              Room Label
            </label>
            <input
              type="text"
              value={selectedRoom.name}
              onChange={(e) =>
                onUpdateRoom({ ...selectedRoom, name: e.target.value })
              }
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
            />
          </div>

          {/* Width & Height */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500">
                Width (ft)
              </label>
              <input
                type="number"
                step="0.5"
                min="3"
                max={plan.plot.width}
                value={selectedRoom.width}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || selectedRoom.width;
                  onUpdateRoom({ ...selectedRoom, width: val });
                }}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
              />
              <span className="mt-0.5 block text-2xs text-slate-400">
                {formatFeetInches(selectedRoom.width)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500">
                Length (ft)
              </label>
              <input
                type="number"
                step="0.5"
                min="3"
                max={plan.plot.length}
                value={selectedRoom.height}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || selectedRoom.height;
                  onUpdateRoom({ ...selectedRoom, height: val });
                }}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
              />
              <span className="mt-0.5 block text-2xs text-slate-400">
                {formatFeetInches(selectedRoom.height)}
              </span>
            </div>
          </div>

          {/* Area Callout */}
          <div className="rounded-lg bg-emerald-50 p-3 text-center">
            <div className="text-xs text-emerald-800">Calculated Floor Area</div>
            <div className="text-xl font-bold text-emerald-950">
              {areaSqFt} <span className="text-sm font-normal">sq ft</span>
            </div>
          </div>

          {/* Position (X, Y) */}
          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
            <div>
              <label className="block text-xs font-medium text-slate-500">
                X from Left (ft)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max={plan.plot.width - selectedRoom.width}
                value={selectedRoom.x}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  onUpdateRoom({ ...selectedRoom, x: val });
                }}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">
                Y from Front (ft)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max={plan.plot.length - selectedRoom.height}
                value={selectedRoom.y}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  onUpdateRoom({ ...selectedRoom, y: val });
                }}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={onDeselect}
          className="w-full rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          Done Editing Room
        </button>
      </div>
    </div>
  );
}
