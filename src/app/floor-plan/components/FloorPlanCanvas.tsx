"use client";

import { useState, useEffect } from "react";
import { Column, Door, FloorPlan, FurnitureItem, Room } from "../lib/types";
import { formatFeetInches } from "../lib/layout-engine";

interface FloorPlanCanvasProps {
  plan: FloorPlan;
  activeFloor: number;
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string | null) => void;
  onUpdateRoom?: (room: Room) => void;
  zoom: number;
  panOffset: { x: number; y: number };
  svgRef: React.RefObject<SVGSVGElement | null>;
  showFurniture?: boolean;
}

interface ClearLabelResult {
  x: number;
  y: number;
  badgeW: number;
  badgeH: number;
  isSmall: boolean;
  displayName: string;
  fontSizeTitle: string;
  fontSizeSubtitle: string;
  fontSizeArea?: string;
}

interface PlacedBadgeBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Standard architectural clean naming for compact service spaces to prevent crowded text.
 */
function getDisplayRoomName(name: string, width: number, height: number): string {
  if (width < 7.0 || height < 5.5) {
    if (name.includes("OTS") && name.includes("Balcony")) return "Rear OTS";
    if (name.includes("OTS") || name.includes("Lightwell")) return "OTS";
    if (name.includes("Attached Bath")) return "Att. Bath";
    if (name.includes("Common Bath")) return "Common Bath";
    if (name.includes("Utility")) return "Utility";
    if (name.includes("Verandah") || name.includes("Porch")) return "Porch";
    if (name.includes("Circulation Lobby") || name.includes("Passage")) return "Lobby";
    if (name.includes("Bike Parking")) return "Bike Parking";
  }
  return name;
}

/**
 * Computes the optimal collision-free position for room labels.
 * Evaluates candidate positions across the room and avoids all furniture,
 * door swing arcs, columns, walls, and previously placed adjacent labels.
 */
function getClearLabelPosition(
  room: Room,
  roomFurniture: FurnitureItem[],
  roomDoors: Door[],
  roomColumns: Column[],
  placedBadges: PlacedBadgeBox[] = []
): ClearLabelResult {
  const isSmall =
    room.width < 7.0 ||
    room.height < 5.5 ||
    room.type === "bathroom" ||
    room.type === "attached_bath" ||
    room.type === "ots" ||
    room.type === "utility" ||
    room.type === "parking";

  const displayName = getDisplayRoomName(room.name, room.width, room.height);

  let badgeW = isSmall ? 2.5 : 4.8;
  let badgeH = isSmall ? 0.85 : 1.9;
  let fontSizeTitle = isSmall ? "0.48" : "0.78";
  let fontSizeSubtitle = isSmall ? "0.38" : "0.64";
  const fontSizeArea = isSmall ? undefined : "0.52";

  if (isSmall) {
    if (displayName.length > 9) badgeW = 2.8;
    if (room.width < 4.0) {
      badgeW = Math.max(2.2, room.width - 0.6);
      fontSizeTitle = "0.46";
      fontSizeSubtitle = "0.36";
    }
    if (room.height < 4.8) {
      badgeH = Math.max(0.75, Math.min(0.85, room.height - 0.6));
    }
  }

  const roomCenterX = room.x + room.width / 2;
  const roomCenterY = room.y + room.height / 2;

  // If room is an open-to-sky lightwell with no fixtures, center it perfectly
  if (room.type === "ots") {
    return {
      x: Math.round(roomCenterX * 10) / 10,
      y: Math.round(roomCenterY * 10) / 10,
      badgeW,
      badgeH,
      isSmall,
      displayName,
      fontSizeTitle,
      fontSizeSubtitle,
      fontSizeArea,
    };
  }

  interface Box {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }

  // Solid obstacles (beds, wardrobes, basins, commodes, tables, counters, columns)
  const solidObs: Box[] = [];
  for (const f of roomFurniture) {
    if (f.type !== "shower_area") {
      solidObs.push({
        x1: f.x - 0.1,
        y1: f.y - 0.1,
        x2: f.x + f.width + 0.1,
        y2: f.y + f.height + 0.1,
      });
    }
  }

  for (const c of roomColumns) {
    solidObs.push({
      x1: c.x,
      y1: c.y,
      x2: c.x + c.width,
      y2: c.y + c.height,
    });
  }

  // Adjacent labels already placed
  for (const b of placedBadges) {
    solidObs.push({
      x1: b.x1 - 0.2,
      y1: b.y1 - 0.2,
      x2: b.x2 + 0.2,
      y2: b.y2 + 0.2,
    });
  }

  // Door swings (moderate penalty)
  const swingObs: Box[] = [];
  for (const d of roomDoors) {
    const isVert = d.orientation === "vertical";
    const w = d.width;
    if (!isVert) {
      swingObs.push({
        x1: d.x - 0.1,
        y1: d.y - 0.1,
        x2: d.x + w + 0.1,
        y2: d.y + w + 0.1,
      });
    } else {
      const swingLeft = d.swing !== "inward_right";
      swingObs.push({
        x1: swingLeft ? d.x - w - 0.1 : d.x - 0.1,
        y1: d.y - 0.1,
        x2: swingLeft ? d.x + 0.1 : d.x + w + 0.1,
        y2: d.y + w + 0.1,
      });
    }
  }

  // Soft obstacles: shower tray floor (acceptable for frosted badge if needed)
  const softObs: Box[] = [];
  for (const f of roomFurniture) {
    if (f.type === "shower_area") {
      softObs.push({
        x1: f.x,
        y1: f.y,
        x2: f.x + f.width,
        y2: f.y + f.height,
      });
    }
  }

  const wallPadding = 0.25;
  const minX = room.x + badgeW / 2 + wallPadding;
  const maxX = room.x + room.width - badgeW / 2 - wallPadding;
  const minY = room.y + badgeH / 2 + wallPadding;
  const maxY = room.y + room.height - badgeH / 2 - wallPadding;

  if (minX >= maxX || minY >= maxY) {
    return {
      x: Math.round(roomCenterX * 10) / 10,
      y: Math.round(roomCenterY * 10) / 10,
      badgeW,
      badgeH,
      isSmall,
      displayName,
      fontSizeTitle,
      fontSizeSubtitle,
      fontSizeArea,
    };
  }

  let bestX = roomCenterX;
  let bestY = roomCenterY;
  let bestScore = -Infinity;

  // Fine grid search with 0.3 ft resolution
  for (let cy = minY; cy <= maxY + 0.01; cy += 0.3) {
    for (let cx = minX; cx <= maxX + 0.01; cx += 0.3) {
      const bx1 = cx - badgeW / 2;
      const by1 = cy - badgeH / 2;
      const bx2 = cx + badgeW / 2;
      const by2 = cy + badgeH / 2;

      let penalty = 0;
      let minSolidDist = Infinity;

      for (const obs of solidObs) {
        const ox = Math.min(bx2, obs.x2) - Math.max(bx1, obs.x1);
        const oy = Math.min(by2, obs.y2) - Math.max(by1, obs.y1);
        if (ox > 0 && oy > 0) {
          penalty += 100000 + ox * oy * 10000;
        } else {
          const dx = Math.max(0, Math.max(bx1 - obs.x2, obs.x1 - bx2));
          const dy = Math.max(0, Math.max(by1 - obs.y2, obs.y1 - by2));
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minSolidDist) minSolidDist = dist;
        }
      }

      for (const obs of swingObs) {
        const ox = Math.min(bx2, obs.x2) - Math.max(bx1, obs.x1);
        const oy = Math.min(by2, obs.y2) - Math.max(by1, obs.y1);
        if (ox > 0 && oy > 0) {
          penalty += 2500 + ox * oy * 1000;
        }
      }

      for (const obs of softObs) {
        const ox = Math.min(bx2, obs.x2) - Math.max(bx1, obs.x1);
        const oy = Math.min(by2, obs.y2) - Math.max(by1, obs.y1);
        if (ox > 0 && oy > 0) {
          penalty += 50;
        }
      }

      const distFromCenter = Math.hypot(cx - roomCenterX, cy - roomCenterY);
      const score =
        -penalty +
        (minSolidDist === Infinity ? 50 : minSolidDist * 5) -
        distFromCenter * 1.5;

      if (score > bestScore) {
        bestScore = score;
        bestX = cx;
        bestY = cy;
      }
    }
  }

  return {
    x: Math.round(bestX * 10) / 10,
    y: Math.round(bestY * 10) / 10,
    badgeW,
    badgeH,
    isSmall,
    displayName,
    fontSizeTitle,
    fontSizeSubtitle,
    fontSizeArea,
  };
}

export default function FloorPlanCanvas({
  plan,
  activeFloor,
  selectedRoomId,
  onSelectRoom,
  onUpdateRoom,
  zoom,
  panOffset,
  svgRef,
  showFurniture = true,
}: FloorPlanCanvasProps) {
  const [draggingRoomId, setDraggingRoomId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; roomX: number; roomY: number } | null>(null);

  const plotW = plan.plot.width;
  const plotL = plan.plot.length;

  const marginX = 8;
  const marginY = 8;
  const viewBoxW = plotW + marginX * 2;
  const viewBoxL = plotL + marginY * 2;

  const currentRooms = plan.rooms.filter((r) => r.floor === activeFloor);
  const currentDoors = plan.doors.filter((d) => d.floor === activeFloor);
  const currentWindows = plan.windows.filter((w) => w.floor === activeFloor);
  const currentColumns = (plan.columns || []).filter((c) => c.floor === activeFloor);
  const currentFurniture = (plan.furniture || []).filter((f) => f.floor === activeFloor);

  const handleRoomMouseDown = (e: React.MouseEvent, room: Room) => {
    e.stopPropagation();
    onSelectRoom(room.id);
    setDraggingRoomId(room.id);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      roomX: room.x,
      roomY: room.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRoomId || !dragStart || !onUpdateRoom) return;

      const currentRoom = plan.rooms.find((r) => r.id === draggingRoomId);
      if (!currentRoom) return;

      const scale = zoom * 18;
      const dxFeet = (e.clientX - dragStart.x) / scale;
      const dyFeet = (e.clientY - dragStart.y) / scale;

      let newX = Math.round((dragStart.roomX + dxFeet) * 2) / 2;
      let newY = Math.round((dragStart.roomY + dyFeet) * 2) / 2;

      newX = Math.max(0, Math.min(plotW - currentRoom.width, newX));
      newY = Math.max(0, Math.min(plotL - currentRoom.height, newY));

      onUpdateRoom({
        ...currentRoom,
        x: newX,
        y: newY,
      });
    };

    const handleMouseUp = () => {
      setDraggingRoomId(null);
      setDragStart(null);
    };

    if (draggingRoomId) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingRoomId, dragStart, onUpdateRoom, plan.rooms, plotL, plotW, zoom]);

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 select-none shadow-inner"
      onClick={() => onSelectRoom(null)}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${viewBoxW} ${viewBoxL}`}
        className="h-full w-full max-h-[750px] transition-transform duration-75 ease-out"
        style={{
          transform: `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          transformOrigin: "center center",
        }}
      >
        <defs>
          <pattern id="grid-pattern" width="2" height="2" patternUnits="userSpaceOnUse">
            <path d="M 2 0 L 0 0 0 2" fill="none" stroke="#e2e8f0" strokeWidth="0.04" />
          </pattern>
          <pattern id="paver-hatch" width="1.5" height="1.5" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="1.5" height="1.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.04" />
            <line x1="0" y1="0.75" x2="1.5" y2="0.75" stroke="#cbd5e1" strokeWidth="0.03" />
            <line x1="0.75" y1="0" x2="0.75" y2="1.5" stroke="#cbd5e1" strokeWidth="0.03" />
          </pattern>
          <pattern id="ots-hatch" width="1.2" height="1.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="1.2" stroke="#86efac" strokeWidth="0.08" />
          </pattern>
        </defs>

        <g transform={`translate(${marginX}, ${marginY})`}>
          {/* 1. Plot Background & Grid */}
          <rect
            x={0}
            y={0}
            width={plotW}
            height={plotL}
            fill="#ffffff"
            stroke="#94a3b8"
            strokeWidth="0.2"
            strokeDasharray="0.8, 0.4"
          />
          <rect x={0} y={0} width={plotW} height={plotL} fill="url(#grid-pattern)" />

          {/* 2. Front Road / Main Access (Paved Roadway) */}
          <g transform="translate(0, -3.8)">
            <rect
              x={0}
              y={0}
              width={plotW}
              height="2.6"
              fill="#f1f5f9"
              stroke="#cbd5e1"
              strokeWidth="0.12"
              rx="0.2"
            />
            <line
              x1={0}
              y1="1.3"
              x2={plotW}
              y2="1.3"
              stroke="#94a3b8"
              strokeWidth="0.08"
              strokeDasharray="1.2, 0.8"
            />
            <text
              x={plotW / 2}
              y="1.75"
              textAnchor="middle"
              fill="#334155"
              fontSize="0.95"
              fontWeight="bold"
              letterSpacing="0.06em"
            >
              30&apos;0&quot; WIDE ROAD / FRONT ACCESS ➔
            </text>
          </g>

          {/* 3. Outer Plot Dimension Lines with 45° Architectural Slash Ticks */}
          <g className="text-slate-500">
            {/* Top Width Dimension */}
            <line x1={0} y1={-1.0} x2={plotW} y2={-1.0} stroke="#475569" strokeWidth="0.09" />
            <line x1={-0.3} y1={-0.7} x2={0.3} y2={-1.3} stroke="#0f172a" strokeWidth="0.14" />
            <line x1={plotW - 0.3} y1={-0.7} x2={plotW + 0.3} y2={-1.3} stroke="#0f172a" strokeWidth="0.14" />
            <rect x={plotW / 2 - 3.5} y={-1.7} width="7" height="1.3" fill="#ffffff" rx="0.2" stroke="#e2e8f0" strokeWidth="0.04" />
            <text
              x={plotW / 2}
              y={-0.8}
              textAnchor="middle"
              fill="#0f172a"
              fontSize="0.85"
              fontWeight="bold"
            >
              {formatFeetInches(plotW)} PLOT WIDTH
            </text>

            {/* Left Length Dimension */}
            <line x1={-1.0} y1={0} x2={-1.0} y2={plotL} stroke="#475569" strokeWidth="0.09" />
            <line x1={-0.7} y1={-0.3} x2={-1.3} y2={0.3} stroke="#0f172a" strokeWidth="0.14" />
            <line x1={-0.7} y1={plotL - 0.3} x2={-1.3} y2={plotL + 0.3} stroke="#0f172a" strokeWidth="0.14" />
            <text
              x={-1.6}
              y={plotL / 2}
              textAnchor="middle"
              fill="#0f172a"
              fontSize="0.85"
              fontWeight="bold"
              transform={`rotate(-90, -1.6, ${plotL / 2})`}
            >
              {formatFeetInches(plotL)} PLOT LENGTH
            </text>
          </g>

          {/* 4. Architectural Drafting North Arrow */}
          <g transform={`translate(${plotW + 3.2}, 3.5)`}>
            <circle cx="0" cy="0" r="2.2" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.1" />
            <circle cx="0" cy="0" r="2.0" fill="none" stroke="#e2e8f0" strokeWidth="0.05" />
            <polygon points="0,-1.7 0.5,0.5 0,0.1 -0.5,0.5" fill="#047857" />
            <polygon points="0,1.7 0.5,0.5 0,0.1 -0.5,0.5" fill="#94a3b8" />
            <text x="0" y="-2.2" textAnchor="middle" fontSize="1.0" fontWeight="bold" fill="#047857">
              N
            </text>
            <text x="0" y="3.1" textAnchor="middle" fontSize="0.75" fontWeight="600" fill="#475569">
              {plan.facing.toUpperCase()}
            </text>
          </g>

          {/* 5. Render Rooms */}
          {currentRooms.map((room) => {
            const isSelected = selectedRoomId === room.id;
            const isParking = room.type === "parking";
            const isOTS = room.type === "ots";

            return (
              <g
                key={room.id}
                onMouseDown={(e) => handleRoomMouseDown(e, room)}
                className="cursor-pointer"
              >
                {/* Room Geometry Box */}
                <rect
                  x={room.x}
                  y={room.y}
                  width={room.width}
                  height={room.height}
                  fill={
                    isParking
                      ? "url(#paver-hatch)"
                      : isOTS
                      ? "url(#ots-hatch)"
                      : room.color
                  }
                  stroke={isSelected ? "#059669" : isParking || isOTS ? "#94a3b8" : "#475569"}
                  strokeWidth={isSelected ? "0.35" : isParking || isOTS ? "0.12" : "0.18"}
                  strokeDasharray={isOTS ? "0.5, 0.3" : undefined}
                  className="transition-colors hover:opacity-95"
                />

                {/* Open Parking Driveway Ramp Indicator (Road Access) */}
                {isParking && room.y === 0 && (
                  <g>
                    {/* Driveway ramp slope triangles */}
                    <polygon
                      points={`${room.x + 1.0},0 ${room.x + room.width - 1.0},0 ${room.x + room.width / 2},1.2`}
                      fill="#cbd5e1"
                      opacity="0.6"
                    />
                    <text
                      x={room.x + room.width / 2}
                      y="1.8"
                      textAnchor="middle"
                      fontSize="0.65"
                      fontWeight="bold"
                      fill="#64748b"
                    >
                      ▲ VEHICLE ACCESS / RAMP ▲
                    </text>
                  </g>
                )}

                {/* Architectural Staircase Graphics */}
                {room.type === "staircase" && (() => {
                  const details = room.staircaseDetails;
                  const isDogLeg = details ? details.type === "dog_leg" : room.width >= 5.6 && room.height >= 8.5;

                  if (isDogLeg) {
                    const flightW = details ? details.flightWidth : Math.round(((room.width - 0.4) / 2) * 10) / 10;
                    const landingD = details ? details.landingDepth : Math.min(3.5, Math.max(2.8, room.height * 0.32));
                    const flightRunL = room.height - landingD;
                    const treadCount = details ? details.treadsPerFlight : Math.max(6, Math.floor(flightRunL / 0.833));
                    const treadPitch = flightRunL / treadCount;

                    return (
                      <g opacity="0.85">
                        {/* Mid-Landing Slab at top */}
                        <rect
                          x={room.x}
                          y={room.y}
                          width={room.width}
                          height={landingD}
                          fill="#f8fafc"
                          stroke="#cbd5e1"
                          strokeWidth="0.06"
                        />
                        <text
                          x={room.x + room.width / 2}
                          y={room.y + landingD / 2 + 0.15}
                          textAnchor="middle"
                          fontSize="0.52"
                          fontWeight="bold"
                          fill="#64748b"
                        >
                          MID-LANDING
                        </text>

                        {/* Central Handrail / Well Gap */}
                        <line
                          x1={room.x + flightW}
                          y1={room.y + landingD}
                          x2={room.x + flightW}
                          y2={room.y + room.height}
                          stroke="#94a3b8"
                          strokeWidth="0.08"
                        />
                        <line
                          x1={room.x + room.width - flightW}
                          y1={room.y + landingD}
                          x2={room.x + room.width - flightW}
                          y2={room.y + room.height}
                          stroke="#94a3b8"
                          strokeWidth="0.08"
                        />
                        <rect
                          x={room.x + flightW}
                          y={room.y + landingD}
                          width={room.width - flightW * 2}
                          height={flightRunL}
                          fill="#e2e8f0"
                          opacity="0.5"
                        />

                        {/* Flight 1 Treads (Ascending on Left) */}
                        {Array.from({ length: treadCount }).map((_, idx) => {
                          const ty = room.y + landingD + idx * treadPitch;
                          return (
                            <g key={`fl1-${idx}`}>
                              <line
                                x1={room.x}
                                y1={ty}
                                x2={room.x + flightW}
                                y2={ty}
                                stroke="#64748b"
                                strokeWidth="0.07"
                              />
                              <text
                                x={room.x + 0.35}
                                y={ty + treadPitch * 0.7}
                                fontSize="0.40"
                                fill="#94a3b8"
                              >
                                {treadCount - idx}
                              </text>
                            </g>
                          );
                        })}

                        {/* Flight 2 Treads (Continuing on Right) */}
                        {Array.from({ length: treadCount }).map((_, idx) => {
                          const ty = room.y + landingD + idx * treadPitch;
                          return (
                            <g key={`fl2-${idx}`}>
                              <line
                                x1={room.x + room.width - flightW}
                                y1={ty}
                                x2={room.x + room.width}
                                y2={ty}
                                stroke="#64748b"
                                strokeWidth="0.07"
                              />
                              <text
                                x={room.x + room.width - flightW + 0.35}
                                y={ty + treadPitch * 0.7}
                                fontSize="0.40"
                                fill="#94a3b8"
                              >
                                {treadCount + idx + 1}
                              </text>
                            </g>
                          );
                        })}

                        {/* Direction Arrow Path (Flight 1 -> Landing -> Flight 2) */}
                        <circle
                          cx={room.x + flightW / 2}
                          cy={room.y + room.height - 0.4}
                          r="0.25"
                          fill="#047857"
                        />
                        <path
                          d={`M ${room.x + flightW / 2} ${room.y + room.height - 0.4}
                              L ${room.x + flightW / 2} ${room.y + landingD / 2}
                              Q ${room.x + room.width / 2} ${room.y + landingD * 0.25} ${room.x + room.width - flightW / 2} ${room.y + landingD / 2}
                              L ${room.x + room.width - flightW / 2} ${room.y + room.height - 0.8}`}
                          fill="none"
                          stroke="#047857"
                          strokeWidth="0.10"
                          strokeDasharray="0.3, 0.2"
                        />
                        <polygon
                          points={`${room.x + room.width - flightW / 2},${room.y + room.height - 0.3}
                                  ${room.x + room.width - flightW / 2 - 0.35},${room.y + room.height - 0.8}
                                  ${room.x + room.width - flightW / 2 + 0.35},${room.y + room.height - 0.8}`}
                          fill="#047857"
                        />
                        <text
                          x={room.x + flightW / 2 + 0.6}
                          y={room.y + room.height - 1.2}
                          fontSize="0.65"
                          fontWeight="bold"
                          fill="#047857"
                        >
                          UP ➔
                        </text>
                      </g>
                    );
                  }

                  // Straight Flight Staircase Rendering
                  const treadCount = details ? details.treadsPerFlight : Math.max(8, Math.floor(room.height / 0.833));
                  const treadPitch = room.height / treadCount;

                  return (
                    <g opacity="0.80">
                      {Array.from({ length: treadCount }).map((_, idx) => {
                        const yPos = room.y + idx * treadPitch;
                        return (
                          <g key={idx}>
                            <line
                              x1={room.x}
                              y1={yPos}
                              x2={room.x + room.width}
                              y2={yPos}
                              stroke="#64748b"
                              strokeWidth="0.08"
                            />
                            <text x={room.x + 0.4} y={yPos + treadPitch * 0.7} fontSize="0.45" fill="#94a3b8">
                              {idx + 1}
                            </text>
                          </g>
                        );
                      })}
                      <circle
                        cx={room.x + room.width / 2}
                        cy={room.y + room.height - 0.5}
                        r="0.25"
                        fill="#047857"
                      />
                      <line
                        x1={room.x + room.width / 2}
                        y1={room.y + room.height - 0.5}
                        x2={room.x + room.width / 2}
                        y2={room.y + 0.8}
                        stroke="#047857"
                        strokeWidth="0.10"
                        strokeDasharray="0.3, 0.2"
                      />
                      <polygon
                        points={`${room.x + room.width / 2},${room.y + 0.4} ${
                          room.x + room.width / 2 - 0.35
                        },${room.y + 0.9} ${room.x + room.width / 2 + 0.35},${room.y + 0.9}`}
                        fill="#047857"
                      />
                      <text
                        x={room.x + room.width / 2 + 0.6}
                        y={room.y + room.height / 2}
                        fontSize="0.70"
                        fontWeight="bold"
                        fill="#047857"
                      >
                        UP ➔
                      </text>
                    </g>
                  );
                })()}

                {/* Selection Highlight Handles */}
                {isSelected && (
                  <>
                    <circle cx={room.x} cy={room.y} r="0.35" fill="#059669" />
                    <circle cx={room.x + room.width} cy={room.y} r="0.35" fill="#059669" />
                    <circle cx={room.x} cy={room.y + room.height} r="0.35" fill="#059669" />
                    <circle cx={room.x + room.width} cy={room.y + room.height} r="0.35" fill="#059669" />
                  </>
                )}
              </g>
            );
          })}

          {/* 6. Render Architectural Furniture & Fixtures */}
          {showFurniture &&
            currentFurniture.map((f: FurnitureItem) => (
              <g key={f.id} className="pointer-events-none" opacity="0.90">
                {/* Double Bed */}
                {f.type === "double_bed" && (
                  <g transform={`translate(${f.x}, ${f.y})`}>
                    <rect x="0" y="0" width={f.width} height={f.height} rx="0.25" fill="#ffffff" stroke="#64748b" strokeWidth="0.08" />
                    <rect x="-0.1" y="-0.25" width={f.width + 0.2} height="0.35" rx="0.1" fill="#475569" stroke="#334155" strokeWidth="0.06" />
                    <rect x="0.3" y="0.3" width="1.8" height="1.2" rx="0.2" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.05" />
                    <rect x={f.width - 2.1} y="0.3" width="1.8" height="1.2" rx="0.2" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.05" />
                    <line x1="0.2" y1="2.2" x2={f.width - 0.2} y2="2.2" stroke="#cbd5e1" strokeWidth="0.06" />
                  </g>
                )}

                {/* Wardrobe */}
                {f.type === "wardrobe" && (
                  <g transform={`translate(${f.x}, ${f.y})`}>
                    <rect x="0" y="0" width={f.width} height={f.height} fill="#ffffff" stroke="#475569" strokeWidth="0.08" />
                    <line x1="0" y1="0" x2={f.width} y2={f.height} stroke="#cbd5e1" strokeWidth="0.05" />
                    <line x1="0" y1={f.height} x2={f.width} y2="0" stroke="#cbd5e1" strokeWidth="0.05" />
                    <line x1={f.width / 2} y1="0" x2={f.width / 2} y2={f.height} stroke="#94a3b8" strokeWidth="0.06" />
                  </g>
                )}

                {/* 3-Seater Sofa */}
                {f.type === "sofa_3seater" && (
                  <g transform={`translate(${f.x}, ${f.y})`}>
                    <rect x="0" y="0" width={f.width} height={f.height} rx="0.35" fill="#ffffff" stroke="#64748b" strokeWidth="0.08" />
                    <rect x="0.3" y="0.1" width={f.width - 0.6} height="0.6" rx="0.15" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.05" />
                    <rect x="0.1" y="0.1" width="0.35" height={f.height - 0.2} rx="0.1" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.05" />
                    <rect x={f.width - 0.45} y="0.1" width="0.35" height={f.height - 0.2} rx="0.1" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.05" />
                    <line x1={0.45 + (f.width - 0.9) / 3} y1="0.7" x2={0.45 + (f.width - 0.9) / 3} y2={f.height - 0.2} stroke="#cbd5e1" strokeWidth="0.05" />
                    <line x1={0.45 + ((f.width - 0.9) * 2) / 3} y1="0.7" x2={0.45 + ((f.width - 0.9) * 2) / 3} y2={f.height - 0.2} stroke="#cbd5e1" strokeWidth="0.05" />
                  </g>
                )}

                {/* Coffee Table */}
                {f.type === "coffee_table" && (
                  <rect x={f.x} y={f.y} width={f.width} height={f.height} rx="0.2" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.06" />
                )}

                {/* TV Credenza */}
                {f.type === "tv_unit" && (
                  <g transform={`translate(${f.x}, ${f.y})`}>
                    <rect x="0" y="0" width={f.width} height={f.height} fill="#f1f5f9" stroke="#64748b" strokeWidth="0.06" />
                    <line x1="0.4" y1={f.height / 2} x2={f.width - 0.4} y2={f.height / 2} stroke="#334155" strokeWidth="0.1" />
                  </g>
                )}

                {/* Dining Table with Chairs */}
                {f.type === "dining_table" && (
                  <g transform={`translate(${f.x}, ${f.y})`}>
                    <rect x="0" y="0" width={f.width} height={f.height} rx="0.25" fill="#ffffff" stroke="#475569" strokeWidth="0.08" />
                    {Array.from({ length: f.width > 5 ? 3 : 2 }).map((_, i) => {
                      const chairW = 1.3;
                      const offset = (f.width / (f.width > 5 ? 3 : 2)) * (i + 0.5) - chairW / 2;
                      return (
                        <g key={i}>
                          <rect x={offset} y="-0.5" width={chairW} height="0.4" rx="0.1" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.05" />
                          <rect x={offset} y={f.height + 0.1} width={chairW} height="0.4" rx="0.1" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.05" />
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* Kitchen Countertop */}
                {f.type === "kitchen_counter" && (
                  <rect x={f.x} y={f.y} width={f.width} height={f.height} fill="#fff7ed" stroke="#cbd5e1" strokeWidth="0.08" />
                )}

                {/* Refrigerator */}
                {f.type === "refrigerator" && (
                  <g transform={`translate(${f.x}, ${f.y})`}>
                    <rect x="0" y="0" width={f.width} height={f.height} rx="0.15" fill="#f8fafc" stroke="#334155" strokeWidth="0.08" />
                    <line x1="0.1" y1={f.height - 0.4} x2={f.width - 0.1} y2={f.height - 0.4} stroke="#64748b" strokeWidth="0.05" />
                    <text x={f.width / 2} y={f.height / 2 + 0.1} textAnchor="middle" fontSize="0.55" fontWeight="bold" fill="#334155">
                      REF
                    </text>
                  </g>
                )}

                {/* Kitchen SS Sink */}
                {f.type === "kitchen_sink" && (
                  <g transform={`translate(${f.x}, ${f.y})`}>
                    <rect x="0" y="0" width={f.width} height={f.height} rx="0.1" fill="#ffffff" stroke="#0284c7" strokeWidth="0.06" />
                    <rect x="0.15" y="0.15" width={f.width * 0.55} height={f.height - 0.3} rx="0.1" fill="#f0f9ff" stroke="#38bdf8" strokeWidth="0.05" />
                    <circle cx={0.15 + (f.width * 0.55) / 2} cy={f.height / 2} r="0.12" fill="#0284c7" />
                    <line x1={f.width * 0.65} y1="0.3" x2={f.width - 0.2} y2="0.3" stroke="#cbd5e1" strokeWidth="0.04" />
                    <line x1={f.width * 0.65} y1="0.6" x2={f.width - 0.2} y2="0.6" stroke="#cbd5e1" strokeWidth="0.04" />
                  </g>
                )}

                {/* Gas Stove / 4-Burner Hob */}
                {f.type === "gas_stove" && (
                  <g transform={`translate(${f.x}, ${f.y})`}>
                    <rect x="0" y="0" width={f.width} height={f.height} rx="0.1" fill="#334155" stroke="#1e293b" strokeWidth="0.06" />
                    <circle cx={f.width * 0.28} cy={f.height * 0.32} r="0.25" fill="#475569" stroke="#94a3b8" strokeWidth="0.04" />
                    <circle cx={f.width * 0.72} cy={f.height * 0.32} r="0.25" fill="#475569" stroke="#94a3b8" strokeWidth="0.04" />
                    <circle cx={f.width * 0.28} cy={f.height * 0.68} r="0.25" fill="#475569" stroke="#94a3b8" strokeWidth="0.04" />
                    <circle cx={f.width * 0.72} cy={f.height * 0.68} r="0.25" fill="#475569" stroke="#94a3b8" strokeWidth="0.04" />
                  </g>
                )}

                {/* Bathroom EWC Commode */}
                {f.type === "wc_commode" && (
                  <g transform={`translate(${f.x}, ${f.y})`}>
                    <rect x="0" y="0" width={f.width} height="0.6" rx="0.1" fill="#ffffff" stroke="#64748b" strokeWidth="0.06" />
                    <ellipse cx={f.width / 2} cy="1.3" rx={f.width * 0.42} ry="0.65" fill="#ffffff" stroke="#64748b" strokeWidth="0.06" />
                    <ellipse cx={f.width / 2} cy="1.4" rx={f.width * 0.26} ry="0.4" fill="#ecfeff" stroke="#cbd5e1" strokeWidth="0.04" />
                  </g>
                )}

                {/* Wash Basin */}
                {f.type === "wash_basin" && (
                  <g transform={`translate(${f.x}, ${f.y})`}>
                    <rect x="0" y="0" width={f.width} height={f.height} rx="0.1" fill="#ffffff" stroke="#64748b" strokeWidth="0.06" />
                    <ellipse cx={f.width / 2} cy={f.height / 2} rx={f.width * 0.35} ry={f.height * 0.3} fill="#f0fdf4" stroke="#94a3b8" strokeWidth="0.05" />
                    <circle cx={f.width / 2} cy={f.height * 0.25} r="0.10" fill="#047857" />
                  </g>
                )}

                {/* Shower Area */}
                {f.type === "shower_area" && (
                  <g transform={`translate(${f.x}, ${f.y})`}>
                    <rect x="0" y="0" width={f.width} height={f.height} fill="#f0fdfa" stroke="#99f6e4" strokeWidth="0.06" strokeDasharray="0.3, 0.2" />
                    <circle cx={f.width / 2} cy={f.height / 2} r="0.2" fill="#0d9488" />
                  </g>
                )}

                {/* Car Silhouette CAD Stencil */}
                {f.type === "car_stencil" && (
                  <g transform={`translate(${f.x}, ${f.y})`}>
                    <rect x="0" y="0" width={f.width} height={f.height} rx="1.2" fill="#ffffff" stroke="#334155" strokeWidth="0.12" />
                    <path d={`M 0.5 2.8 Q ${f.width / 2} 3.2 ${f.width - 0.5} 2.8 L ${f.width - 0.5} 0.5 L 0.5 0.5 Z`} fill="#e2e8f0" />
                    <path d={`M 0.6 3.0 L ${f.width - 0.6} 3.0 L ${f.width - 0.9} 4.6 L 0.9 4.6 Z`} fill="#38bdf8" opacity="0.8" />
                    <rect x="0.9" y="4.6" width={f.width - 1.8} height={f.height - 7.8} fill="#ffffff" stroke="#94a3b8" strokeWidth="0.05" />
                    <path d={`M 0.9 ${f.height - 3.2} L ${f.width - 0.9} ${f.height - 3.2} L ${f.width - 0.6} ${f.height - 2.0} L 0.6 ${f.height - 2.0} Z`} fill="#38bdf8" opacity="0.8" />
                    <rect x="-0.3" y="3.2" width="0.3" height="0.6" rx="0.1" fill="#475569" />
                    <rect x={f.width} y="3.2" width="0.3" height="0.6" rx="0.1" fill="#475569" />
                    <rect x="-0.2" y="1.5" width="0.3" height="1.5" rx="0.1" fill="#1e293b" />
                    <rect x={f.width - 0.1} y="1.5" width="0.3" height="1.5" rx="0.1" fill="#1e293b" />
                    <rect x="-0.2" y={f.height - 3.0} width="0.3" height="1.5" rx="0.1" fill="#1e293b" />
                    <rect x={f.width - 0.1} y={f.height - 3.0} width="0.3" height="1.5" rx="0.1" fill="#1e293b" />
                  </g>
                )}

                {/* Motorcycle CAD Stencil */}
                {f.type === "motorcycle_stencil" && (
                  <g transform={`translate(${f.x}, ${f.y})`}>
                    <rect x={f.width / 2 - 0.15} y="0.2" width="0.3" height="1.2" rx="0.1" fill="#1e293b" />
                    <line x1={0.3} y1="1.2" x2={f.width - 0.3} y2="1.2" stroke="#334155" strokeWidth="0.15" strokeLinecap="round" />
                    <ellipse cx={f.width / 2} cy="2.2" rx="0.45" ry="0.8" fill="#047857" stroke="#065f46" strokeWidth="0.06" />
                    <rect x={f.width / 2 - 0.3} y="3.0" width="0.6" height="1.3" rx="0.2" fill="#1e293b" />
                    <rect x={f.width / 2 - 0.15} y="4.3" width="0.3" height="1.1" rx="0.1" fill="#1e293b" />
                  </g>
                )}

                {/* Nightstand / Bedside Table */}
                {f.type === "nightstand" && (
                  <g transform={`translate(${f.x}, ${f.y})`}>
                    <rect x="0" y="0" width={f.width} height={f.height} rx="0.1" fill="#f8fafc" stroke="#64748b" strokeWidth="0.06" />
                    <circle cx={f.width / 2} cy={f.height / 2} r={Math.min(f.width, f.height) * 0.26} fill="#fef08a" stroke="#ca8a04" strokeWidth="0.04" />
                  </g>
                )}

                {/* Study / Work Desk */}
                {f.type === "study_desk" && (
                  <g transform={`translate(${f.x}, ${f.y})`}>
                    <rect x="0" y="0" width={f.width} height={f.height} rx="0.1" fill="#ffffff" stroke="#475569" strokeWidth="0.08" />
                    <line x1="0.8" y1="0" x2="0.8" y2={f.height} stroke="#cbd5e1" strokeWidth="0.05" />
                    <rect x={(f.width - 1.4) / 2} y={f.height * 0.2} width="1.4" height="0.8" rx="0.1" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.05" />
                  </g>
                )}

                {/* Washing Machine */}
                {f.type === "washing_machine" && (
                  <g transform={`translate(${f.x}, ${f.y})`}>
                    <rect x="0" y="0" width={f.width} height={f.height} rx="0.15" fill="#f8fafc" stroke="#334155" strokeWidth="0.08" />
                    <circle cx={f.width / 2} cy={f.height * 0.55} r={f.width * 0.35} fill="#ffffff" stroke="#0284c7" strokeWidth="0.06" />
                    <circle cx={f.width / 2} cy={f.height * 0.55} r={f.width * 0.22} fill="#f0f9ff" stroke="#38bdf8" strokeWidth="0.04" />
                    <line x1="0.2" y1="0.4" x2={f.width - 0.2} y2="0.4" stroke="#64748b" strokeWidth="0.05" />
                    <circle cx={f.width * 0.75} cy="0.2" r="0.1" fill="#047857" />
                  </g>
                )}

                {/* Crockery Console */}
                {f.type === "crockery_unit" && (
                  <g transform={`translate(${f.x}, ${f.y})`}>
                    <rect x="0" y="0" width={f.width} height={f.height} fill="#ffffff" stroke="#475569" strokeWidth="0.08" />
                    <line x1={f.width / 2} y1="0" x2={f.width / 2} y2={f.height} stroke="#cbd5e1" strokeWidth="0.05" />
                    <line x1="0" y1="0.3" x2={f.width} y2="0.3" stroke="#cbd5e1" strokeWidth="0.04" strokeDasharray="0.2, 0.1" />
                  </g>
                )}

                {/* Armchair / Lounge Chair */}
                {f.type === "armchair" && (
                  <g transform={`translate(${f.x}, ${f.y})`}>
                    <rect x="0" y="0" width={f.width} height={f.height} rx="0.3" fill="#ffffff" stroke="#64748b" strokeWidth="0.08" />
                    <rect x="0.2" y="0.2" width={f.width - 0.4} height="0.5" rx="0.1" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.05" />
                    <rect x="0.1" y="0.2" width="0.3" height={f.height - 0.4} rx="0.1" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.05" />
                    <rect x={f.width - 0.4} y="0.2" width="0.3" height={f.height - 0.4} rx="0.1" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.05" />
                  </g>
                )}

                {/* Architectural Planter / Greenery */}
                {f.type === "planter" && (
                  <g transform={`translate(${f.x}, ${f.y})`}>
                    <circle cx={f.width / 2} cy={f.height / 2} r={Math.min(f.width, f.height) / 2} fill="#ecfdf5" stroke="#059669" strokeWidth="0.07" />
                    <ellipse cx={f.width / 2} cy={f.height / 2} rx={f.width * 0.35} ry={f.height * 0.15} fill="#10b981" opacity="0.8" transform={`rotate(45, ${f.width / 2}, ${f.height / 2})`} />
                    <ellipse cx={f.width / 2} cy={f.height / 2} rx={f.width * 0.35} ry={f.height * 0.15} fill="#10b981" opacity="0.8" transform={`rotate(-45, ${f.width / 2}, ${f.height / 2})`} />
                  </g>
                )}

                {/* Living / Dining Area Rug Boundary */}
                {f.type === "carpet_rug" && (
                  <rect x={f.x} y={f.y} width={f.width} height={f.height} rx="0.25" fill="#f8fafc" opacity="0.6" stroke="#94a3b8" strokeWidth="0.06" strokeDasharray="0.3, 0.2" />
                )}
              </g>
            ))}

          {/* 7. Structural RCC Columns (9"×9" Solid Slate Pillars) */}
          {currentColumns.map((col) => (
            <rect
              key={col.id}
              x={col.x}
              y={col.y}
              width={col.width}
              height={col.height}
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="0.08"
            />
          ))}

          {/* 8. Render Architectural Doors with Swing Arcs */}
          {currentDoors.map((door) => {
            const isMain = door.label?.includes("MAIN ENTRY");
            const isVert = door.orientation === "vertical";
            const w = door.width;

            // Cutout line through wall
            const cutX1 = door.x;
            const cutY1 = door.y;
            const cutX2 = isVert ? door.x : door.x + w;
            const cutY2 = isVert ? door.y + w : door.y;

            // Door leaf & swing arc coordinates
            let leafX2 = door.x;
            let leafY2 = door.y;
            let arcPath = "";

            if (!isVert) {
              // Horizontal door: leaf swings down (+Y) into room
              leafX2 = door.x;
              leafY2 = door.y + w;
              arcPath = `M ${door.x + w} ${door.y} A ${w} ${w} 0 0 1 ${door.x} ${door.y + w}`;
            } else {
              // Vertical door: leaf swings left (-X) or right (+X) into room
              const swingLeft = door.swing !== "inward_right";
              leafX2 = swingLeft ? door.x - w : door.x + w;
              leafY2 = door.y;
              arcPath = swingLeft
                ? `M ${door.x} ${door.y + w} A ${w} ${w} 0 0 1 ${door.x - w} ${door.y}`
                : `M ${door.x} ${door.y + w} A ${w} ${w} 0 0 0 ${door.x + w} ${door.y}`;
            }

            return (
              <g key={door.id}>
                {/* Wall Opening Cutout */}
                <line
                  x1={cutX1}
                  y1={cutY1}
                  x2={cutX2}
                  y2={cutY2}
                  stroke="#ffffff"
                  strokeWidth="0.55"
                />
                {/* Door Leaf */}
                <line
                  x1={door.x}
                  y1={door.y}
                  x2={leafX2}
                  y2={leafY2}
                  stroke={isMain ? "#047857" : "#334155"}
                  strokeWidth={isMain ? "0.20" : "0.14"}
                />
                {/* Swing Arc */}
                <path
                  d={arcPath}
                  fill="none"
                  stroke={isMain ? "#059669" : "#10b981"}
                  strokeWidth="0.09"
                  strokeDasharray="0.3, 0.2"
                />
                {isMain && (
                  <g transform={`translate(${door.x + w / 2}, ${door.y - 0.6})`}>
                    <rect x="-1.8" y="-0.4" width="3.6" height="0.75" rx="0.15" fill="#047857" />
                    <text x="0" y="0.12" textAnchor="middle" fontSize="0.45" fill="#ffffff" fontWeight="bold">
                      MAIN ENTRY
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* 9. Render Windows with Double Glazing and Sill */}
          {currentWindows.map((win) => {
            const isHoriz = win.orientation === "horizontal";
            return (
              <g key={win.id}>
                <line
                  x1={win.x}
                  y1={win.y}
                  x2={isHoriz ? win.x + win.width : win.x}
                  y2={isHoriz ? win.y : win.y + win.width}
                  stroke="#ffffff"
                  strokeWidth="0.55"
                />
                <rect
                  x={win.x}
                  y={win.y - 0.2}
                  width={isHoriz ? win.width : 0.4}
                  height={isHoriz ? 0.4 : win.width}
                  fill="#ffffff"
                  stroke="#0284c7"
                  strokeWidth="0.08"
                />
                <line
                  x1={win.x}
                  y1={win.y}
                  x2={isHoriz ? win.x + win.width : win.x}
                  y2={isHoriz ? win.y : win.y + win.width}
                  stroke="#38bdf8"
                  strokeWidth="0.10"
                />
              </g>
            );
          })}

          {/* 10. Exterior Perimeter Walls (9" Masonry Poché) */}
          <rect
            x={0}
            y={0}
            width={plotW}
            height={plotL}
            fill="none"
            stroke="#0f172a"
            strokeWidth="0.50"
          />

          {/* 11. Room Labels & Annotation Layer (Rendered on top to guarantee 100% legibility & zero overlap) */}
          {(() => {
            const placedBadges: PlacedBadgeBox[] = [];
            return currentRooms.map((room) => {
              const roomFurniture = showFurniture
                ? currentFurniture.filter(
                    (f) =>
                      f.roomId === room.id ||
                      (f.x >= room.x - 0.2 &&
                        f.x + f.width <= room.x + room.width + 0.2 &&
                        f.y >= room.y - 0.2 &&
                        f.y + f.height <= room.y + room.height + 0.2)
                  )
                : [];
              const roomDoors = currentDoors.filter(
                (d) =>
                  d.roomId === room.id ||
                  (!d.roomId &&
                    d.x >= room.x - 0.5 &&
                    d.x <= room.x + room.width + 0.5 &&
                    d.y >= room.y - 0.5 &&
                    d.y <= room.y + room.height + 0.5)
              );
              const roomColumns = currentColumns.filter(
                (c) =>
                  c.x >= room.x - 0.1 &&
                  c.x <= room.x + room.width &&
                  c.y >= room.y - 0.1 &&
                  c.y <= room.y + room.height
              );

              const labelPos = getClearLabelPosition(
                room,
                roomFurniture,
                roomDoors,
                roomColumns,
                placedBadges
              );

              // Record placed badge box so subsequent labels avoid overlapping it
              placedBadges.push({
                x1: labelPos.x - labelPos.badgeW / 2,
                y1: labelPos.y - labelPos.badgeH / 2,
                x2: labelPos.x + labelPos.badgeW / 2,
                y2: labelPos.y + labelPos.badgeH / 2,
              });

              return (
                <g key={`label-${room.id}`} className="pointer-events-none">
                  {/* Frosted White Pill Background */}
                  <g transform={`translate(${labelPos.x}, ${labelPos.y})`}>
                    <rect
                      x={-labelPos.badgeW / 2}
                      y={-labelPos.badgeH / 2}
                      width={labelPos.badgeW}
                      height={labelPos.badgeH}
                      rx={labelPos.isSmall ? "0.2" : "0.3"}
                      fill="#ffffff"
                      fillOpacity="0.95"
                      stroke="#cbd5e1"
                      strokeWidth="0.04"
                    />
                    <text
                      x="0"
                      y={labelPos.isSmall ? "-0.06" : "-0.30"}
                      textAnchor="middle"
                      fontSize={labelPos.fontSizeTitle}
                      fontWeight="bold"
                      fill="#0f172a"
                    >
                      {labelPos.displayName}
                    </text>

                    {labelPos.isSmall ? (
                      <text
                        x="0"
                        y="0.30"
                        textAnchor="middle"
                        fontSize={labelPos.fontSizeSubtitle}
                        fontWeight="500"
                        fill="#475569"
                      >
                        {formatFeetInches(room.width)} × {formatFeetInches(room.height)}
                      </text>
                    ) : (
                      <>
                        <text
                          x="0"
                          y="0.38"
                          textAnchor="middle"
                          fontSize={labelPos.fontSizeSubtitle}
                          fontWeight="600"
                          fill="#334155"
                        >
                          {formatFeetInches(room.width)} × {formatFeetInches(room.height)}
                        </text>
                        <text
                          x="0"
                          y="0.95"
                          textAnchor="middle"
                          fontSize={labelPos.fontSizeArea || "0.52"}
                          fill="#64748b"
                        >
                          ({Math.round(room.width * room.height)} sq ft)
                        </text>
                      </>
                    )}
                  </g>

                  {/* Vastu Badge if Aligned */}
                  {room.isVastuAligned && (
                    <g transform={`translate(${room.x + 0.3}, ${room.y + 0.3})`}>
                      <rect x="0" y="0" width="2.1" height="0.75" rx="0.15" fill="#047857" opacity="0.92" />
                      <text x="1.05" y="0.52" textAnchor="middle" fontSize="0.48" fill="#ffffff" fontWeight="bold">
                        VASTU
                      </text>
                    </g>
                  )}
                </g>
              );
            });
          })()}
        </g>
      </svg>

      {/* Conceptual Planning Disclaimer Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500">
        <span>
          <strong className="text-slate-700">Conceptual Floor Plan:</strong> For planning &amp; estimation purposes only. Verify dimensions, structural requirements, and local bye-laws with a licensed architect/engineer before construction.
        </span>
        {plan.isVastuOriented && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-semibold text-emerald-800 border border-emerald-200">
            Vastu-Oriented Layout
          </span>
        )}
      </div>
    </div>
  );
}
