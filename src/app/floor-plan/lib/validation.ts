import {
  BuildableEnvelope,
  FeasibilityIssue,
  FeasibilityResult,
  FloorPlan,
  HouseRequirements,
  Room,
  RoomType,
} from "./types";
import { validateAreaConsistency } from "./geometry";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  overlaps: string[];
  boundaryViolations: string[];
  dimensionIssues: string[];
  furnitureCollisions: string[];
  missingRequirements: string[];
  areaIssues: string[];
}

export const EPSILON = 0.05; // 0.05 ft tolerance (~0.6 inches) for rounding/floating point

/**
 * Counts rooms matching a given room type, optionally filtered by floor.
 */
export function countRoomsByType(
  rooms: Room[],
  type: RoomType,
  floor?: number
): number {
  return rooms.filter(
    (r) => r.type === type && (floor === undefined || r.floor === floor)
  ).length;
}

/**
 * Validates that requested bedrooms exist.
 * Verifies that master bedroom is counted separately from standard bedrooms:
 * e.g. 3 bedrooms means 1 master_bedroom + 2 bedrooms = 3 bedrooms total.
 */
export function validateRequiredBedrooms(
  rooms: Room[],
  requiredCount: number
): boolean {
  if (requiredCount <= 0) return true;
  const masterCount = countRoomsByType(rooms, "master_bedroom");
  const regularCount = countRoomsByType(rooms, "bedroom");
  const totalBedrooms = masterCount + regularCount;
  return totalBedrooms >= requiredCount && masterCount >= 1;
}

/**
 * Validates that requested bathrooms exist.
 * Counts both common bathrooms and en-suite attached bathrooms.
 */
export function validateRequiredBathrooms(
  rooms: Room[],
  requiredCount: number
): boolean {
  if (requiredCount <= 0) return true;
  const commonBath = countRoomsByType(rooms, "bathroom");
  const attBath = countRoomsByType(rooms, "attached_bath");
  return commonBath + attBath >= requiredCount;
}

/**
 * Validates that all explicitly requested rooms and features are present in the layout.
 * Ensures that no layout variant ("spacious", "practical", "compact") silently drops a required room.
 */
export function validateRequiredRooms(
  rooms: Room[],
  requirements: HouseRequirements
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  // 1. Bedrooms
  const reqBeds =
    requirements.rooms
      .filter((r) => r.type === "bedroom" || r.type === "master_bedroom")
      .reduce((sum, r) => sum + r.quantity, 0) || 1;

  if (!validateRequiredBedrooms(rooms, reqBeds)) {
    const totalFound =
      countRoomsByType(rooms, "master_bedroom") + countRoomsByType(rooms, "bedroom");
    missing.push(`Required ${reqBeds} bedrooms, but found ${totalFound}`);
  }

  // 2. Bathrooms
  const reqBaths =
    requirements.rooms
      .filter((r) => r.type === "bathroom" || r.type === "attached_bath")
      .reduce((sum, r) => sum + r.quantity, 0) || 1;

  if (!validateRequiredBathrooms(rooms, reqBaths)) {
    const totalBaths =
      countRoomsByType(rooms, "bathroom") + countRoomsByType(rooms, "attached_bath");
    missing.push(`Required ${reqBaths} bathrooms, but found ${totalBaths}`);
  }

  // 3. Living Room
  if (countRoomsByType(rooms, "living") < 1) {
    missing.push("Living Hall is missing from generated layout");
  }

  // 4. Kitchen
  if (countRoomsByType(rooms, "kitchen") < 1) {
    missing.push("Kitchen is missing from generated layout");
  }

  // 5. Dining Room (if explicitly requested)
  const reqDining = requirements.rooms.some((r) => r.type === "dining");
  if (reqDining && countRoomsByType(rooms, "dining") < 1) {
    missing.push("Dedicated Dining Room was requested but is missing");
  }

  // 6. Parking (if requested)
  if (requirements.parking && requirements.parking.type !== "none") {
    if (countRoomsByType(rooms, "parking") < 1) {
      missing.push(`Vehicle parking (${requirements.parking.type}) was requested but is missing`);
    }
  }

  // 7. Staircase (if requested or multi-floor)
  if (requirements.staircase || requirements.floors > 1) {
    const hasStairs = rooms.some((r) => r.type === "staircase" || !!r.staircaseDetails);
    if (!hasStairs) {
      missing.push("Staircase is required for access but is missing");
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Checks whether two rooms on the same floor intersect/overlap.
 * Touching edges are permitted; overlapping interiors are strictly violations.
 */
export function roomsOverlap(r1: Room, r2: Room): boolean {
  if (r1.floor !== r2.floor) return false;
  if (r1.id === r2.id) return false;

  const r1Right = r1.x + r1.width;
  const r1Bottom = r1.y + r1.height;
  const r2Right = r2.x + r2.width;
  const r2Bottom = r2.y + r2.height;

  const overlapX = Math.min(r1Right, r2Right) - Math.max(r1.x, r2.x);
  const overlapY = Math.min(r1Bottom, r2Bottom) - Math.max(r1.y, r2.y);

  return overlapX > EPSILON && overlapY > EPSILON;
}

/**
 * Checks whether a room fits completely inside allowed plot or buildable envelope boundaries.
 */
export function roomWithinBounds(
  room: Room,
  plotWidth: number,
  plotLength: number,
  envelope?: BuildableEnvelope
): boolean {
  if (room.x < -EPSILON) return false;
  if (room.y < -EPSILON) return false;
  if (room.x + room.width > plotWidth + EPSILON) return false;
  if (room.y + room.height > plotLength + EPSILON) return false;

  if (envelope) {
    // If room is enclosed, check it fits within the buildable envelope
    if (
      room.type !== "parking" &&
      room.type !== "verandah" &&
      room.type !== "balcony"
    ) {
      if (room.x < envelope.x - EPSILON) return false;
      if (room.y < envelope.y - EPSILON) return false;
      if (room.x + room.width > envelope.x + envelope.width + EPSILON) return false;
      if (room.y + room.height > envelope.y + envelope.length + EPSILON) return false;
    }
  }

  return true;
}

/**
 * Early lightweight feasibility check before generating geometry.
 * Prevents impossible requests (e.g. 8 bedrooms on a 20×30 single-floor plot,
 * 2 cars on a 12 ft plot, negative dimensions) from generating broken plans.
 */
export function validatePlanFeasibility(
  req: HouseRequirements
): FeasibilityResult {
  const issues: FeasibilityIssue[] = [];
  const suggestedAlternatives: string[] = [];

  const { width: plotW, length: plotL } = req.plot;
  const plotArea = plotW * plotL;
  const floors = req.floors || 1;

  // 1. Boundary & Geometry sanity
  if (plotW <= 0 || plotL <= 0) {
    issues.push({
      code: "INVALID_PLOT_DIMENSIONS",
      requirement: `Plot: ${plotW}' × ${plotL}'`,
      message: `Plot dimensions must be strictly positive (got ${plotW}' × ${plotL}')`,
      severity: "error",
    });
    return { feasible: false, issues, suggestedAlternatives: ["Specify valid positive plot dimensions (e.g. 23 × 50 ft)."] };
  }

  if (plotW < 12.0) {
    issues.push({
      code: "PLOT_TOO_NARROW",
      requirement: `Plot Width: ${plotW}'`,
      message: `Plot width of ${plotW}' is narrower than the minimum residential standard (12'0") required for habitable rooms and circulation.`,
      severity: "error",
    });
    suggestedAlternatives.push("Increase plot road frontage to at least 15–20 ft.");
  }

  if (plotL < 18.0) {
    issues.push({
      code: "PLOT_TOO_SHORT",
      requirement: `Plot Depth: ${plotL}'`,
      message: `Plot depth of ${plotL}' is too shallow to accommodate entrance, living, and bedroom zoning.`,
      severity: "error",
    });
    suggestedAlternatives.push("Increase plot depth to at least 25–30 ft.");
  }

  // 2. Parking width feasibility
  const parkingType = req.parking?.type || "none";
  const parkingQty = req.parking?.quantity || 1;

  if (parkingType === "car" || parkingType === "both") {
    if (plotW < 14.0) {
      issues.push({
        code: "CAR_PARKING_WIDTH_CONFLICT",
        requirement: `Car Parking on ${plotW}' plot`,
        message: `Standard car parking bay requires at least 9'6" width plus a 3'0" pedestrian entrance pathway (12'6" minimum). A ${plotW}' plot cannot fit car parking with safe entry.`,
        severity: "error",
      });
      suggestedAlternatives.push("Switch to two-wheeler (bike) parking for narrow plots under 15 ft.");
      suggestedAlternatives.push("Increase plot width to at least 16–20 ft.");
    } else if (parkingQty >= 2 && plotW < 22.0) {
      issues.push({
        code: "MULTI_CAR_WIDTH_CONFLICT",
        requirement: `${parkingQty} Car bays on ${plotW}' plot`,
        message: `Two side-by-side car parking bays require minimum 18'0" width plus pedestrian circulation. A ${plotW}' frontage is insufficient.`,
        severity: "error",
      });
      suggestedAlternatives.push("Choose 1 car + 2 bike parking slots instead of 2 full-size cars.");
      suggestedAlternatives.push("Plan tandem (front-to-back) parking or increase road frontage to ≥ 24 ft.");
    }
  }

  // 3. Room Count vs Available Buildable Footprint
  const reqBeds =
    req.rooms
      .filter((r) => r.type === "bedroom" || r.type === "master_bedroom")
      .reduce((sum, r) => sum + r.quantity, 0) || 1;

  const reqBaths =
    req.rooms
      .filter((r) => r.type === "bathroom" || r.type === "attached_bath")
      .reduce((sum, r) => sum + r.quantity, 0) || 1;

  const reqDining = req.rooms.some((r) => r.type === "dining");
  const reqStairs = req.staircase || floors > 1;

  // Minimum required area estimation for requested functional spaces (net square feet):
  // Living (130) + Kitchen (60) + Master Bed (120) + Other Beds (100 each) + Baths (30 each) + Dining (60) + Stairs (60) + Parking (80)
  const minHabitableArea =
    130 + // Living
    60 +  // Kitchen
    120 + // Master Bedroom
    Math.max(0, reqBeds - 1) * 100 + // Additional Bedrooms
    reqBaths * 30 + // Bathrooms
    (reqDining ? 60 : 0) + // Dining
    (reqStairs ? 60 : 0) + // Stairs
    (parkingType !== "none" ? (parkingType === "car" ? 120 : 50) : 0); // Parking

  // Total available gross buildable footprint across floors (accounting for 15% wall/circulation overhead)
  const grossUsablePerFloor = plotArea * 0.88;
  const totalUsableArea = grossUsablePerFloor * floors;

  if (minHabitableArea > totalUsableArea) {
    issues.push({
      code: "SPACE_DEFICIT_OVERCROWDING",
      requirement: `${reqBeds} BHK + ${reqBaths} Baths on ${plotW}' × ${plotL}' (${plotArea} sq ft, ${floors} Floor${floors > 1 ? "s" : ""})`,
      message: `The requested rooms require approximately ${minHabitableArea} sq ft of functional area, but the available buildable area across ${floors} floor${floors > 1 ? "s" : ""} is only ~${Math.round(totalUsableArea)} sq ft.`,
      severity: "error",
    });

    if (floors === 1) {
      suggestedAlternatives.push(
        `Convert to a G+1 Duplex (2 floors) to double your buildable area to ~${Math.round(totalUsableArea * 2)} sq ft.`
      );
    }
    const maxFeasibleBeds = Math.max(1, Math.floor((totalUsableArea - 280) / 110));
    if (maxFeasibleBeds < reqBeds) {
      suggestedAlternatives.push(
        `Reduce bedroom count from ${reqBeds} to ${maxFeasibleBeds} for comfortable room dimensions.`
      );
    }
    suggestedAlternatives.push(`Increase plot dimensions (e.g. from ${plotW}' × ${plotL}' to ${Math.round(plotW * 1.3)}' × ${plotL}').`);
  }

  return {
    feasible: issues.length === 0,
    issues,
    suggestedAlternatives,
    maxHabitableAreaPossible: Math.round(totalUsableArea),
    requiredHabitableArea: minHabitableArea,
  };
}

/**
 * Validates a floor plan for overlaps, boundary violations, furniture collisions,
 * required rooms compliance, and area mathematical consistency.
 */
export function validateFloorPlan(
  plan: FloorPlan,
  requirements?: HouseRequirements
): ValidationResult {
  const errors: string[] = [];
  const overlaps: string[] = [];
  const boundaryViolations: string[] = [];
  const dimensionIssues: string[] = [];
  const furnitureCollisions: string[] = [];
  const missingRequirements: string[] = [];
  const areaIssues: string[] = [];

  const { width: plotW, length: plotL } = plan.plot;

  // 1. Boundary check & minimum size check
  for (const r of plan.rooms) {
    if (!roomWithinBounds(r, plotW, plotL, plan.buildableEnvelope)) {
      boundaryViolations.push(
        `${r.name} (Floor ${r.floor}) extends outside plot bounds: [x=${r.x.toFixed(1)}, y=${r.y.toFixed(1)}, w=${r.width.toFixed(1)}, h=${r.height.toFixed(1)}] vs Plot [${plotW}×${plotL}]`
      );
    }
    if (r.width < 2.2 || r.height < 2.2) {
      dimensionIssues.push(
        `${r.name} has unreasonably small dimension: ${r.width.toFixed(1)}' × ${r.height.toFixed(1)}'`
      );
    }
  }

  // 2. Pairwise room overlap check (Strict: overlapX > EPSILON && overlapY > EPSILON)
  for (let i = 0; i < plan.rooms.length; i++) {
    for (let j = i + 1; j < plan.rooms.length; j++) {
      const r1 = plan.rooms[i];
      const r2 = plan.rooms[j];
      if (roomsOverlap(r1, r2)) {
        overlaps.push(
          `Overlap between "${r1.name}" and "${r2.name}" on Floor ${r1.floor}`
        );
      }
    }
  }

  // 3. Required Room Count Compliance
  if (requirements) {
    const roomCheck = validateRequiredRooms(plan.rooms, requirements);
    if (!roomCheck.valid) {
      missingRequirements.push(...roomCheck.missing);
    }
  }

  // 4. Area Consistency Check
  if (plan.areas) {
    const areaCheck = validateAreaConsistency(plan.areas);
    if (!areaCheck.valid) {
      areaIssues.push(...areaCheck.errors);
    }
  }

  // 5. Furniture containment and door clearance validation
  const furniture = plan.furniture || [];
  for (const f of furniture) {
    const parent = plan.rooms.find((r) => r.id === f.roomId);
    if (parent) {
      if (
        f.x < parent.x - 0.5 ||
        f.y < parent.y - 0.5 ||
        f.x + f.width > parent.x + parent.width + 0.5 ||
        f.y + f.height > parent.y + parent.height + 0.5
      ) {
        furnitureCollisions.push(
          `Furniture "${f.label || f.type}" extends outside parent room "${parent.name}"`
        );
      }

      const roomDoors = plan.doors.filter(
        (d) =>
          d.floor === f.floor &&
          (d.roomId === parent.id ||
            (!d.roomId &&
              d.x >= parent.x - 0.5 &&
              d.x <= parent.x + parent.width + 0.5 &&
              d.y >= parent.y - 0.5 &&
              d.y <= parent.y + parent.height + 0.5))
      );

      for (const d of roomDoors) {
        const margin = 0.2;
        const doorBoxX = d.x - margin;
        const doorBoxY = d.y - margin;
        const doorBoxW = d.width + margin * 2;
        const doorBoxH = d.width + margin * 2;

        const overlapX = Math.min(f.x + f.width, doorBoxX + doorBoxW) - Math.max(f.x, doorBoxX);
        const overlapY = Math.min(f.y + f.height, doorBoxY + doorBoxH) - Math.max(f.y, doorBoxY);

        if (overlapX > 0.05 && overlapY > 0.05) {
          furnitureCollisions.push(
            `Furniture "${f.label || f.type}" in "${parent.name}" collides with door at (${d.x.toFixed(1)}, ${d.y.toFixed(1)})`
          );
        }
      }
    }
  }

  errors.push(
    ...boundaryViolations,
    ...overlaps,
    ...dimensionIssues,
    ...missingRequirements,
    ...areaIssues,
    ...furnitureCollisions
  );

  return {
    valid: errors.length === 0,
    errors,
    overlaps,
    boundaryViolations,
    dimensionIssues,
    furnitureCollisions,
    missingRequirements,
    areaIssues,
  };
}

