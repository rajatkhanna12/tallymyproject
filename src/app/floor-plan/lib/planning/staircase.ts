import { HouseRequirements, LayoutStyleVariant, StaircaseDetails, StaircaseType } from "../types";

export interface StaircaseCandidate {
  id: string;
  verticalCoreId: string;
  type: StaircaseType;
  x: number;
  y: number;
  width: number;
  height: number;
  flightWidth: number;
  landingDepth: number;
  orientation: "north-south" | "east-west";
  entrySide: "front" | "rear" | "left" | "right";
  details: StaircaseDetails;
}

/**
 * Calculates realistic staircase geometry based on available footprint, floor-to-floor height,
 * riser/tread requirements, landing requirements, and circulation.
 * Floor-to-floor height = 10'0" (120 inches).
 * Standard riser = 7.0"–7.5" -> 16 to 17 risers.
 * Standard tread = 10" (0.833 ft).
 * Preferred flight width = 3'0"–3'6" (planning heuristic).
 */
export function calculateStaircaseGeometry(
  width: number,
  height: number,
  type?: StaircaseType,
  floorToFloorHeight = 10.0
): StaircaseDetails {
  const totalHeightInches = floorToFloorHeight * 12;
  const targetRiserInches = 7.06; // 120 / 17 = 7.06"
  const totalRisers = Math.round(totalHeightInches / targetRiserInches); // 17 risers
  const totalTreads = totalRisers - 1; // 16 treads
  const treadDepth = 0.833; // 10 inches

  const determinedType: StaircaseType =
    type ||
    (width >= 5.6 && height >= 8.5
      ? "dog_leg"
      : height >= 12.5 && width >= 3.0
      ? "straight"
      : width >= 6.5 && height >= 7.5
      ? "l_shaped"
      : "dog_leg");

  if (determinedType === "dog_leg" || determinedType === "u_shaped") {
    const flightWidth = Math.round(((width - 0.4) / 2) * 10) / 10;
    const landingDepth = Math.max(2.8, Math.min(3.5, flightWidth));
    const treadsPerFlight = Math.ceil(totalTreads / 2); // 8 treads per flight
    return {
      type: "dog_leg",
      flightWidth,
      landingWidth: width,
      landingDepth,
      treadsPerFlight,
      totalRisers,
      treadDepth,
      riserHeight: Math.round((totalHeightInches / totalRisers) * 10) / 10,
      direction: "UP",
    };
  }

  if (determinedType === "l_shaped") {
    const flightWidth = Math.min(3.5, Math.max(3.0, Math.round(Math.min(width, height) * 0.40 * 10) / 10));
    const landingDepth = flightWidth;
    const treadsPerFlight = Math.ceil(totalTreads / 2);
    return {
      type: "l_shaped",
      flightWidth,
      landingWidth: flightWidth,
      landingDepth,
      treadsPerFlight,
      totalRisers,
      treadDepth,
      riserHeight: Math.round((totalHeightInches / totalRisers) * 10) / 10,
      direction: "UP",
    };
  }

  // Straight Flight Staircase
  return {
    type: "straight",
    flightWidth: width,
    landingWidth: width,
    landingDepth: Math.max(3.0, Math.min(4.0, height - totalTreads * treadDepth)),
    treadsPerFlight: totalTreads,
    totalRisers,
    treadDepth,
    riserHeight: Math.round((totalHeightInches / totalRisers) * 10) / 10,
    direction: "UP",
  };
}

/**
 * Generates multiple viable architectural staircase candidates adapted to:
 * - plot width & length
 * - zoning boundaries (frontDepth, public zone, mid family zone)
 * - circulation spine width
 * - layout style variant
 * - requirements
 */
export function generateStaircaseCandidates(
  plotW: number,
  plotL: number,
  startY: number,
  publicH: number,
  midH: number,
  circW: number,
  variant: LayoutStyleVariant,
  _req?: HouseRequirements
): StaircaseCandidate[] {
  void _req;
  const candidates: StaircaseCandidate[] = [];
  const midY = startY + publicH;
  const isNarrowPlot = plotW <= 23;
  let candidateIdx = 1;

  const kitchenW = Math.round(plotW * (variant === "spacious" ? 0.38 : 0.40) * 2) / 2;
  const coreW = plotW - kitchenW;

  // ---------------------------------------------------------------------------
  // CANDIDATE 1: U-Shaped (Dog-Leg) in Central/Mid Zone (Right of core)
  // Standard residential duplex core, optimal for 2-flight circulation
  // ---------------------------------------------------------------------------
  const uWidth = Math.min(6.5, Math.max(5.5, Math.round(coreW * 0.45 * 2) / 2));
  const uHeight = Math.min(midH, Math.max(9.0, Math.min(11.0, midH * 0.95)));
  const uXRight = Math.max(0, coreW - uWidth);

  const uDetailsRight = calculateStaircaseGeometry(uWidth, uHeight, "dog_leg");
  candidates.push({
    id: `stair-cand-${candidateIdx}`,
    verticalCoreId: `vcore-u-right-${candidateIdx++}`,
    type: "dog_leg",
    x: uXRight,
    y: midY,
    width: uWidth,
    height: uHeight,
    flightWidth: uDetailsRight.flightWidth,
    landingDepth: uDetailsRight.landingDepth,
    orientation: "north-south",
    entrySide: "front",
    details: uDetailsRight,
  });

  // ---------------------------------------------------------------------------
  // CANDIDATE 2: U-Shaped (Dog-Leg) in Central/Mid Zone (Left Side)
  // Mirrored core for layouts where kitchen or living is on right side
  // ---------------------------------------------------------------------------
  const uXLeft = 0;
  const uDetailsLeft = calculateStaircaseGeometry(uWidth, uHeight, "dog_leg");
  candidates.push({
    id: `stair-cand-${candidateIdx}`,
    verticalCoreId: `vcore-u-left-${candidateIdx++}`,
    type: "dog_leg",
    x: uXLeft,
    y: midY,
    width: uWidth,
    height: uHeight,
    flightWidth: uDetailsLeft.flightWidth,
    landingDepth: uDetailsLeft.landingDepth,
    orientation: "north-south",
    entrySide: "front",
    details: uDetailsLeft,
  });

  // ---------------------------------------------------------------------------
  // CANDIDATE 3: Straight Staircase along Outer Circulation Wall
  // Highly space-efficient for narrow plots (leaves maximum contiguous living/sleeping space)
  // ---------------------------------------------------------------------------
  const straightW = Math.min(3.5, Math.max(3.0, circW));
  const straightL = Math.min(14.5, Math.max(12.5, midH + 2.0));
  const straightY = Math.max(startY, midY - 1.5);

  if (straightY + straightL <= plotL - 10.0) {
    const straightDetails = calculateStaircaseGeometry(straightW, straightL, "straight");
    candidates.push({
      id: `stair-cand-${candidateIdx}`,
      verticalCoreId: `vcore-straight-${candidateIdx++}`,
      type: "straight",
      x: isNarrowPlot ? 0 : Math.max(0, coreW - straightW),
      y: straightY,
      width: straightW,
      height: straightL,
      flightWidth: straightW,
      landingDepth: straightDetails.landingDepth,
      orientation: "north-south",
      entrySide: "front",
      details: straightDetails,
    });
  }

  // ---------------------------------------------------------------------------
  // CANDIDATE 4: L-Shaped Staircase in Mid/Corner Transition Zone
  // Creates an open corner transition between living hall and upper floor
  // ---------------------------------------------------------------------------
  if (!isNarrowPlot && coreW >= 14) {
    const lWidth = Math.min(7.5, Math.max(6.5, Math.round(coreW * 0.45 * 2) / 2));
    const lHeight = Math.min(8.5, Math.max(7.5, midH * 0.75));
    const lX = Math.max(0, coreW - lWidth);

    const lDetails = calculateStaircaseGeometry(lWidth, lHeight, "l_shaped");
    candidates.push({
      id: `stair-cand-${candidateIdx}`,
      verticalCoreId: `vcore-l-${candidateIdx++}`,
      type: "l_shaped",
      x: lX,
      y: midY,
      width: lWidth,
      height: lHeight,
      flightWidth: lDetails.flightWidth,
      landingDepth: lDetails.landingDepth,
      orientation: "north-south",
      entrySide: "front",
      details: lDetails,
    });
  }

  return candidates;
}
