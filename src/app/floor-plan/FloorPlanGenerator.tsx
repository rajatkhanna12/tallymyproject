"use client";

import { useState, useRef, useEffect } from "react";
import { FloorPlan, HouseRequirements, LayoutStyleVariant, Room } from "./lib/types";
import { generateFloorPlans } from "./lib/layout-engine";
import { generateFurnitureForRooms } from "./lib/furniture";
import { parseHouseRequirements } from "./lib/parser";
import { downloadFloorPlanPNG, printFloorPlanPDF } from "./lib/export";
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

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Initialize with default 23x50 prompt on first load
  useEffect(() => {
    async function init() {
      const parsed = await parseHouseRequirements(DEFAULT_PROMPT);
      setLastRequirements(parsed);
      const generated = generateFloorPlans(parsed);
      setPlans(generated);
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
      const generated = generateFloorPlans(parsed);
      setPlans(generated);
      setSelectedRoomId(null);
      setActiveFloor(0);
      setZoom(1);
      setPanOffset({ x: 0, y: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (!lastRequirements) return;
    const generated = generateFloorPlans(lastRequirements);
    setPlans(generated);
    setSelectedRoomId(null);
  };

  const currentPlan = plans.find((p) => p.styleVariant === selectedVariant) || plans[0];

  const handleUpdateRoom = (updatedRoom: Room) => {
    if (!currentPlan) return;
    const newRooms = currentPlan.rooms.map((r) =>
      r.id === updatedRoom.id ? updatedRoom : r
    );

    // Recalculate built-up areas
    // Recalculate built-up areas
    const groundRooms = newRooms.filter((r) => r.floor === 0);
    const firstRooms = newRooms.filter((r) => r.floor === 1);
    const groundFloorArea = Math.round(
      groundRooms.reduce((sum, r) => sum + r.width * r.height, 0)
    );
    const firstFloorArea = Math.round(
      firstRooms.reduce((sum, r) => sum + r.width * r.height, 0)
    );

    const newFurniture = [
      ...generateFurnitureForRooms(newRooms, currentPlan.doors, 0),
      ...(currentPlan.floorsCount > 1 ? generateFurnitureForRooms(newRooms, currentPlan.doors, 1) : []),
    ];

    const updatedPlan: FloorPlan = {
      ...currentPlan,
      rooms: newRooms,
      furniture: newFurniture,
      groundFloorArea,
      firstFloorArea,
      totalBuiltUpArea: groundFloorArea + firstFloorArea,
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
