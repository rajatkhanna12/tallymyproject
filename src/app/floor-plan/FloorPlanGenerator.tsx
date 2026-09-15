"use client";

import { useState, useRef, useEffect } from "react";
import {
  FeasibilityResult,
  FloorPlan,
  HouseRequirements,
  LayoutStyleVariant,
  Room,
} from "./lib/types";
import { generateFloorPlanResult } from "./lib/layout-engine";
import { generateFurnitureForRooms } from "./lib/furniture";
import { parseHouseRequirements } from "./lib/parser";
import { downloadFloorPlanPNG, printFloorPlanPDF } from "./lib/export";
import { calculateFloorPlanAreas, getConceptualSetbacks } from "./lib/geometry";
import RequirementsForm from "./components/RequirementsForm";
import LayoutOptions from "./components/LayoutOptions";
import FloorPlanCanvas from "./components/FloorPlanCanvas";
import FloorPlanToolbar from "./components/FloorPlanToolbar";
import RoomProperties from "./components/RoomProperties";
import AIEditInput from "./components/AIEditInput";
import ProjectEstimateBridge from "./components/ProjectEstimateBridge";

const DEFAULT_PROMPT =
  "23 x 50 ft plot, north facing, 2 bedrooms, 2 bathrooms, bike parking, modern kitchen connected to dining";

export default function FloorPlanGenerator() {
  const [plans, setPlans] = useState<FloorPlan[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<LayoutStyleVariant>("spacious");
  const [activeFloor, setActiveFloor] = useState<number>(0);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [lastRequirements, setLastRequirements] = useState<HouseRequirements | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showFurniture, setShowFurniture] = useState<boolean>(true);
  const [infeasibility, setInfeasibility] = useState<FeasibilityResult | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Initialize with default 23x50 prompt on first load
  useEffect(() => {
    async function init() {
      const parsed = await parseHouseRequirements(DEFAULT_PROMPT);
      setLastRequirements(parsed);
      const res = generateFloorPlanResult(parsed);
      if (res.success) {
        setPlans(res.plans);
        setInfeasibility(null);
      } else {
        setPlans([]);
        setInfeasibility(res.infeasibility);
      }
    }
    init();
  }, []);

  const handleGenerate = async (reqInput: HouseRequirements | string) => {
    setIsLoading(true);
    try {
      const parsed =
        typeof reqInput === "string"
          ? await parseHouseRequirements(reqInput)
          : reqInput;

      setLastRequirements(parsed);
      const res = generateFloorPlanResult(parsed);
      if (res.success) {
        setPlans(res.plans);
        setInfeasibility(null);
        setSelectedRoomId(null);
        setActiveFloor(0);
        setZoom(1);
        setPanOffset({ x: 0, y: 0 });
      } else {
        setPlans([]);
        setInfeasibility(res.infeasibility);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (!lastRequirements) return;
    const res = generateFloorPlanResult(lastRequirements);
    if (res.success) {
      setPlans(res.plans);
      setInfeasibility(null);
      setSelectedRoomId(null);
    } else {
      setPlans([]);
      setInfeasibility(res.infeasibility);
    }
  };

  const currentPlan = plans.find((p) => p.styleVariant === selectedVariant) || plans[0];

  const handleUpdateRoom = (updatedRoom: Room) => {
    if (!currentPlan) return;
    const newRooms = currentPlan.rooms.map((r) =>
      r.id === updatedRoom.id ? updatedRoom : r
    );

    const newFurniture = [
      ...generateFurnitureForRooms(newRooms, currentPlan.doors, 0),
      ...(currentPlan.floorsCount > 1 ? generateFurnitureForRooms(newRooms, currentPlan.doors, 1) : []),
    ];

    // Authoritative geometric recalculation of all areas with wall thickness
    const setbacks =
      currentPlan.setbackAssumptions ||
      getConceptualSetbacks(
        currentPlan.plot.width,
        currentPlan.plot.length,
        currentPlan.floorsCount
      );
    const areas = calculateFloorPlanAreas(
      currentPlan.plot.width,
      currentPlan.plot.length,
      newRooms,
      currentPlan.walls,
      setbacks,
      currentPlan.floorsCount
    );

    const updatedPlan: FloorPlan = {
      ...currentPlan,
      rooms: newRooms,
      furniture: newFurniture,
      groundFloorArea: areas.groundFloorEnclosedArea,
      firstFloorArea: areas.firstFloorEnclosedArea,
      totalBuiltUpArea: areas.totalBuiltUpArea,
      areas,
    };

    setPlans((prev) =>
      prev.map((p) => (p.styleVariant === selectedVariant ? updatedPlan : p))
    );
  };

  const handlePlanUpdatedByAI = (newPlan: FloorPlan) => {
    setPlans((prev) =>
      prev.map((p) => (p.styleVariant === selectedVariant ? newPlan : p))
    );
  };

  const handleDownloadPNG = async () => {
    if (!svgRef.current || !currentPlan) return;
    await downloadFloorPlanPNG(svgRef.current, currentPlan, activeFloor);
  };

  const selectedRoom =
    currentPlan?.rooms.find((r) => r.id === selectedRoomId) || null;

  return (
    <div className="space-y-8">
      {/* 1. Requirements Input Section */}
      <RequirementsForm onGenerate={handleGenerate} isLoading={isLoading} />

      {/* Structured Infeasibility Alert Card (Phase 1) */}
      {infeasibility && !currentPlan && (
        <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/70 p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-2xl text-rose-600">
              ⚠️
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <span className="inline-block rounded-full bg-rose-200/80 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-rose-800 mb-1.5">
                  Pre-Generation Screening Check
                </span>
                <h3 className="text-xl font-bold text-rose-950">
                  Requirements Exceed Buildable Physical Envelope
                </h3>
                <p className="mt-1 text-sm text-rose-800">
                  Our pre-generation screening check identified that the requested room configuration violates physical geometric boundaries or minimum habitable space standards before layout generation begins.
                </p>
              </div>

              {/* Identified Conflicts */}
              <div className="space-y-2 rounded-xl bg-white p-4 border border-rose-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  Identified Conflicts:
                </h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  {infeasibility.issues.map((issue, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-semibold text-rose-600">• [{issue.requirement}]:</span>
                      <span>{issue.message}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggested Alternatives */}
              {infeasibility.suggestedAlternatives.length > 0 && (
                <div className="space-y-2 rounded-xl bg-emerald-50/80 p-4 border border-emerald-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    💡 Suggested Solutions:
                  </h4>
                  <ul className="space-y-1.5 text-sm text-emerald-950">
                    {infeasibility.suggestedAlternatives.map((alt, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span>✓</span>
                        <span>{alt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {currentPlan && (
        <>
          {/* 2. Layout Variation Switcher (Spacious / Practical / Compact) */}
          <LayoutOptions
            plans={plans}
            selectedVariant={selectedVariant}
            onSelectVariant={(v) => {
              setSelectedVariant(v);
              setSelectedRoomId(null);
            }}
          />

          {/* 3. Canvas Toolbar & Workspace */}
          <div className="space-y-3">
            <FloorPlanToolbar
              plan={currentPlan}
              activeFloor={activeFloor}
              onFloorChange={setActiveFloor}
              zoom={zoom}
              onZoomIn={() => setZoom((z) => Math.min(2.5, z + 0.15))}
              onZoomOut={() => setZoom((z) => Math.max(0.6, z - 0.15))}
              onResetZoom={() => {
                setZoom(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              onDownloadPNG={handleDownloadPNG}
              onPrintPDF={printFloorPlanPDF}
              onRegenerate={handleRegenerate}
              showFurniture={showFurniture}
              onToggleFurniture={() => setShowFurniture((prev) => !prev)}
            />

            {/* Canvas + Properties Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              {/* SVG Canvas (3 cols) */}
              <div className="h-[600px] sm:h-[700px] lg:col-span-3">
                <FloorPlanCanvas
                  plan={currentPlan}
                  activeFloor={activeFloor}
                  selectedRoomId={selectedRoomId}
                  onSelectRoom={setSelectedRoomId}
                  onUpdateRoom={handleUpdateRoom}
                  zoom={zoom}
                  panOffset={panOffset}
                  svgRef={svgRef}
                  showFurniture={showFurniture}
                />
              </div>

              {/* Room Properties Sidebar (1 col) */}
              <div className="h-[600px] sm:h-[700px] lg:col-span-1">
                <RoomProperties
                  plan={currentPlan}
                  selectedRoom={selectedRoom}
                  onUpdateRoom={handleUpdateRoom}
                  onDeselect={() => setSelectedRoomId(null)}
                />
              </div>
            </div>
          </div>

          {/* 4. Natural Language "Edit with AI" Command Bar */}
          <AIEditInput
            plan={currentPlan}
            onPlanUpdated={handlePlanUpdatedByAI}
          />

          {/* 5. Project Cost Takeoff / Calculator Bridge */}
          <ProjectEstimateBridge plan={currentPlan} />
        </>
      )}
    </div>
  );
}
