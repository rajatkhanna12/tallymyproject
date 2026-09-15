import { FloorPlan, Room } from "./types";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  overlaps: string[];
  boundaryViolations: string[];
  dimensionIssues: string[];
  furnitureCollisions: string[];
}

const EPSILON = 0.05; // 0.05 ft tolerance (~0.6 inches) for rounding/floating point

/**
 * Checks whether two rooms on the same floor intersect/overlap.
 * Touching edges are permitted; overlapping interiors are violations.
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
 * Checks whether a room fits completely inside plot boundaries.
 */
export function roomWithinBounds(
  room: Room,
  plotWidth: number,
  plotLength: number
): boolean {
  if (room.x < -EPSILON) return false;
  if (room.y < -EPSILON) return false;
  if (room.x + room.width > plotWidth + EPSILON) return false;
  if (room.y + room.height > plotLength + EPSILON) return false;
  return true;
}

/**
 * Validates a floor plan for overlaps, boundary violations, furniture collisions, and dimension sanity.
 */
export function validateFloorPlan(plan: FloorPlan): ValidationResult {
  const errors: string[] = [];
  const overlaps: string[] = [];
  const boundaryViolations: string[] = [];
  const dimensionIssues: string[] = [];
  const furnitureCollisions: string[] = [];

  const { width: plotW, length: plotL } = plan.plot;

  // 1. Boundary check & minimum size check
  for (const r of plan.rooms) {
    if (!roomWithinBounds(r, plotW, plotL)) {
      boundaryViolations.push(
        `${r.name} (Floor ${r.floor}) extends outside plot bounds: [x=${r.x.toFixed(1)}, y=${r.y.toFixed(1)}, w=${r.width.toFixed(1)}, h=${r.height.toFixed(1)}] vs Plot [${plotW}×${plotL}]`
      );
    }
    if (r.width < 2.5 || r.height < 2.5) {
      dimensionIssues.push(
        `${r.name} has unreasonably small dimension: ${r.width.toFixed(1)}' × ${r.height.toFixed(1)}'`
      );
    }
  }

  // 2. Pairwise room overlap check
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

  // 3. Furniture containment and door clearance validation
  const furniture = plan.furniture || [];
  for (const f of furniture) {
    const parent = plan.rooms.find((r) => r.id === f.roomId);
    if (parent) {
      // Must not extend outside parent room
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

      // Check only doors swinging into or opening into this parent room
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

  errors.push(...boundaryViolations, ...overlaps, ...dimensionIssues, ...furnitureCollisions);

  return {
    valid: errors.length === 0,
    errors,
    overlaps,
    boundaryViolations,
    dimensionIssues,
    furnitureCollisions,
  };
}
