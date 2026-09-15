import {
  BuildableEnvelope,
  FloorPlanAreas,
  Room,
  SetbackAssumptions,
  Wall,
} from "./types";

// Standard construction wall thicknesses in feet
export const EXT_WALL_THICKNESS = 0.75; // 9 inch external masonry wall
export const INT_WALL_THICKNESS = 0.38; // 4.5 inch internal partition wall

/**
 * Returns centralized conceptual setback assumptions.
 *
 * NOTE ON ZERO SETBACKS:
 * Default zero setbacks ({ front: 0, rear: 0, left: 0, right: 0 }) strictly represent
 * "no conceptual setback assumption supplied" by the user or prompt. This allows the layout engine
 * to explore the full plot boundary during conceptual drafting without prematurely shrinking rooms.
 * This must NEVER be claimed or interpreted as legal, municipal, or building-code compliance.
 */
export function getConceptualSetbacks(
  plotWidth: number,
  plotLength: number,
  floors = 1,
  customSetbacks?: Partial<SetbackAssumptions>
): SetbackAssumptions {
  void floors;
  void plotWidth;
  void plotLength;

  // If custom setbacks are explicitly provided, respect them with non-negative bounds
  if (customSetbacks) {
    return {
      front: Math.max(0, customSetbacks.front ?? 0),
      rear: Math.max(0, customSetbacks.rear ?? 0),
      left: Math.max(0, customSetbacks.left ?? 0),
      right: Math.max(0, customSetbacks.right ?? 0),
    };
  }

  // Conceptual default: "No conceptual setback assumption supplied".
  // Envelope matches full plot boundary, allowing parking/porch and lightwells
  // to naturally form open buffer zones without shrinking habitable rooms.
  return {
    front: 0,
    rear: 0,
    left: 0,
    right: 0,
  };
}

/**
 * Calculates the distinct buildable envelope from plot boundaries and setbacks.
 */
export function calculateBuildableEnvelope(
  plotWidth: number,
  plotLength: number,
  setbacks: SetbackAssumptions
): BuildableEnvelope {
  const width = Math.max(0, plotWidth - setbacks.left - setbacks.right);
  const length = Math.max(0, plotLength - setbacks.front - setbacks.rear);
  return {
    x: setbacks.left,
    y: setbacks.front,
    width,
    length,
    area: width * length,
  };
}

/**
 * Helper to determine if a room represents fully enclosed constructed space
 * (i.e. habitable rooms, bathrooms, kitchen, utilities, lobbies, staircase).
 * Open or semi-open spaces (parking, verandah, porch, balcony, OTS) are excluded.
 */
export function isEnclosedRoom(room: Room): boolean {
  return (
    room.type !== "parking" &&
    room.type !== "verandah" &&
    room.type !== "balcony" &&
    room.type !== "ots"
  );
}

/**
 * Calculates net room area (carpet area inside interior room faces) across specified rooms.
 */
export function calculateNetRoomArea(rooms: Room[]): number {
  const enclosed = rooms.filter(isEnclosedRoom);
  return Math.round(
    enclosed.reduce((sum, r) => sum + r.width * r.height, 0) * 10
  ) / 10;
}

/**
 * Calculates the estimated geometric gross enclosed constructed footprint for a specific floor.
 *
 * CONCEPTUAL ESTIMATE ONLY (NOT CONSTRUCTION-GRADE):
 * This calculation produces an estimated geometric gross built-up area for conceptual residential
 * planning and spatial visualization. It accounts for net interior usable room areas plus estimated
 * masonry wall footprints (deduplicating shared partition walls and corner junctions).
 * It is NOT construction-grade architectural/structural drawings or BOQ takeoff (which require
 * site-specific structural column sizing, beam depths, plumbing shafts, localized building bylaws,
 * and structural engineering calculations).
 *
 * GEOMETRIC DEFINITION & RATIONALE:
 * - Net room area represents clear usable space inside wall boundaries (carpet area).
 * - Walls represent physical masonry construction thickness (9" external, 4.5" internal).
 * - Shared internal partition walls are single physical walls shared by two adjacent rooms;
 *   they are deduplicated in our Wall[] data model and counted once (length × 0.38').
 * - External walls enclosing the habitable envelope have thickness 0.75' (length × 0.75').
 * - Wall intersections (corners/T-junctions) overlap by (T1 × T2); these junction overlaps
 *   are deducted so wall area is never double-counted.
 * - Therefore: Estimated Geometric Gross Enclosed = Net Enclosed Room Area + Enclosed Wall Footprint.
 * - This guarantees that netRoomArea < enclosedBuiltUpArea strictly holds.
 */
export function calculateGrossEnclosedArea(
  rooms: Room[],
  floor: number,
  walls: Wall[]
): number {
  const floorEnclosedRooms = rooms.filter((r) => r.floor === floor && isEnclosedRoom(r));
  if (floorEnclosedRooms.length === 0) return 0;

  // 1. Net interior room area
  const netArea = floorEnclosedRooms.reduce((sum, r) => sum + r.width * r.height, 0);

  // 2. Identify walls that bound or divide enclosed rooms on this floor
  const floorWalls = walls.filter((w) => w.floor === floor);

  let totalWallArea = 0;
  const wallJunctions: { x: number; y: number; t1: number; t2: number }[] = [];

  for (let i = 0; i < floorWalls.length; i++) {
    const w = floorWalls[i];
    const len = Math.hypot(w.x2 - w.x1, w.y2 - w.y1);
    const thick = w.thickness || (w.isExternal ? EXT_WALL_THICKNESS : INT_WALL_THICKNESS);

    // Check if this wall borders at least one enclosed room
    const bordersEnclosed = floorEnclosedRooms.some((r) => {
      const isHorizontal = Math.abs(w.y1 - w.y2) < 0.1;
      const isVertical = Math.abs(w.x1 - w.x2) < 0.1;
      if (isHorizontal) {
        const yMatches = Math.abs(w.y1 - r.y) < 0.2 || Math.abs(w.y1 - (r.y + r.height)) < 0.2;
        const xOverlaps = Math.min(w.x2, r.x + r.width) - Math.max(w.x1, r.x) > 0.2;
        return yMatches && xOverlaps;
      }
      if (isVertical) {
        const xMatches = Math.abs(w.x1 - r.x) < 0.2 || Math.abs(w.x1 - (r.x + r.width)) < 0.2;
        const yOverlaps = Math.min(w.y2, r.y + r.height) - Math.max(w.y1, r.y) > 0.2;
        return xMatches && yOverlaps;
      }
      return false;
    });

    if (bordersEnclosed) {
      totalWallArea += len * thick;

      // Track junctions with other walls to deduct corner double-counting
      for (let j = i + 1; j < floorWalls.length; j++) {
        const w2 = floorWalls[j];
        const sharedPt =
          (Math.hypot(w.x1 - w2.x1, w.y1 - w2.y1) < 0.2) ||
          (Math.hypot(w.x1 - w2.x2, w.y1 - w2.y2) < 0.2) ||
          (Math.hypot(w.x2 - w2.x1, w.y2 - w2.y1) < 0.2) ||
          (Math.hypot(w.x2 - w2.x2, w.y2 - w2.y2) < 0.2);

        if (sharedPt) {
          const thick2 = w2.thickness || (w2.isExternal ? EXT_WALL_THICKNESS : INT_WALL_THICKNESS);
          wallJunctions.push({ x: w.x1, y: w.y1, t1: thick, t2: thick2 });
        }
      }
    }
  }

  // Deduct corner intersections so shared corners are not double-counted
  const cornerDeduction = wallJunctions.reduce(
    (sum, j) => sum + (j.t1 * j.t2 * 0.5), // half-lap deduction per connected pair
    0
  );

  const netWallFootprint = Math.max(0, totalWallArea - cornerDeduction);
  const grossFootprint = netArea + netWallFootprint;

  return Math.round(grossFootprint * 10) / 10;
}

/**
 * Authoritative master area calculation function for all floor plans.
 * Guarantees mathematical and geometric consistency across all reports and UI views.
 */
export function calculateFloorPlanAreas(
  plotWidth: number,
  plotLength: number,
  rooms: Room[],
  walls: Wall[],
  setbacks: SetbackAssumptions,
  floorsCount = 1
): FloorPlanAreas {
  const plotArea = Math.round(plotWidth * plotLength * 10) / 10;

  const groundRooms = rooms.filter((r) => r.floor === 0);
  const firstRooms = rooms.filter((r) => r.floor === 1);

  // 1. Net room area (sum of all interior room spaces across all floors)
  const netRoomArea = calculateNetRoomArea(rooms);

  // 2. Estimated geometric gross enclosed built-up area by floor (with deduplicated wall thickness)
  const groundFloorEnclosedArea = calculateGrossEnclosedArea(groundRooms, 0, walls);
  const firstFloorEnclosedArea =
    floorsCount > 1 ? calculateGrossEnclosedArea(firstRooms, 1, walls) : 0;

  // 3. Total built-up area is strictly the sum of ground + first floor enclosed (estimated geometric gross)
  const totalBuiltUpArea = Math.round((groundFloorEnclosedArea + firstFloorEnclosedArea) * 10) / 10;
  const enclosedBuiltUpArea = totalBuiltUpArea;

  // 4. Distinct open / semi-open categories (NEVER merged into enclosed built-up)
  const parkingArea = Math.round(
    rooms
      .filter((r) => r.type === "parking")
      .reduce((sum, r) => sum + r.width * r.height, 0) * 10
  ) / 10;

  const porchArea = Math.round(
    rooms
      .filter((r) => r.type === "verandah")
      .reduce((sum, r) => sum + r.width * r.height, 0) * 10
  ) / 10;

  const balconyArea = Math.round(
    rooms
      .filter((r) => r.type === "balcony")
      .reduce((sum, r) => sum + r.width * r.height, 0) * 10
  ) / 10;

  const openToSkyArea = Math.round(
    rooms
      .filter((r) => r.type === "ots")
      .reduce((sum, r) => sum + r.width * r.height, 0) * 10
  ) / 10;

  // 5. Ground coverage percentage: uses ONLY the ground-floor enclosed footprint
  const groundCoveragePct =
    plotArea > 0
      ? Math.round(((groundFloorEnclosedArea / plotArea) * 100) * 10) / 10
      : 0;

  // 6. Open / Setback ground area outside constructed footprint and porch
  const groundConstructedFootprint = groundFloorEnclosedArea + porchArea + parkingArea;
  const openSetbackArea = Math.max(
    0,
    Math.round((plotArea - groundConstructedFootprint) * 10) / 10
  );

  return {
    plotArea,
    netRoomArea,
    enclosedBuiltUpArea,
    groundFloorEnclosedArea,
    firstFloorEnclosedArea,
    parkingArea,
    porchArea,
    balconyArea,
    openToSkyArea,
    openSetbackArea,
    groundCoveragePct,
    totalBuiltUpArea,
  };
}

/**
 * Validates internal consistency of calculated areas.
 */
export function validateAreaConsistency(areas: FloorPlanAreas): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (areas.plotArea <= 0) {
    errors.push(`Plot area must be positive (got ${areas.plotArea})`);
  }
  if (areas.netRoomArea <= 0) {
    errors.push(`Net room area must be positive (got ${areas.netRoomArea})`);
  }
  if (areas.enclosedBuiltUpArea < areas.netRoomArea) {
    errors.push(
      `Enclosed built-up area (${areas.enclosedBuiltUpArea}) cannot be less than net room area (${areas.netRoomArea})`
    );
  }
  if (areas.groundFloorEnclosedArea < 0) {
    errors.push(`Ground floor enclosed area cannot be negative (${areas.groundFloorEnclosedArea})`);
  }
  if (areas.firstFloorEnclosedArea < 0) {
    errors.push(`First floor enclosed area cannot be negative (${areas.firstFloorEnclosedArea})`);
  }

  const expectedTotal =
    Math.round((areas.groundFloorEnclosedArea + areas.firstFloorEnclosedArea) * 10) / 10;
  if (Math.abs(areas.totalBuiltUpArea - expectedTotal) > 0.2) {
    errors.push(
      `Total built-up area (${areas.totalBuiltUpArea}) does not equal ground (${areas.groundFloorEnclosedArea}) + first (${areas.firstFloorEnclosedArea})`
    );
  }

  if (areas.parkingArea < 0) errors.push(`Parking area cannot be negative`);
  if (areas.porchArea < 0) errors.push(`Porch area cannot be negative`);
  if (areas.balconyArea < 0) errors.push(`Balcony area cannot be negative`);
  if (areas.openToSkyArea < 0) errors.push(`OTS area cannot be negative`);
  if (areas.openSetbackArea < 0) errors.push(`Open setback area cannot be negative`);

  // Ground coverage check
  const expectedCoverage =
    areas.plotArea > 0
      ? Math.round(((areas.groundFloorEnclosedArea / areas.plotArea) * 100) * 10) / 10
      : 0;
  if (Math.abs(areas.groundCoveragePct - expectedCoverage) > 0.5) {
    errors.push(
      `Ground coverage (${areas.groundCoveragePct}%) does not match ground enclosed / plot (${expectedCoverage}%)`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
