import { Room } from "../types";

export interface AdjacencyEvaluation {
  valid: boolean;
  score: number; // 0 - 100
  hardConstraintViolations: string[];
  softPreferencePenalties: string[];
  strengths: string[];
}

/**
 * Checks if two rooms share a physical wall segment.
 * Returns the length of the shared boundary edge (in feet).
 */
export function getSharedWallLength(r1: Room, r2: Room): number {
  if (r1.floor !== r2.floor || r1.id === r2.id) return 0;

  const EPS = 0.15; // 0.15 ft tolerance (~1.8 inches)

  // Horizontal shared wall: r1 is above r2 or r2 is above r1
  const r1Bot = r1.y + r1.height;
  const r2Bot = r2.y + r2.height;
  const shareHorizontal =
    Math.abs(r1Bot - r2.y) < EPS || Math.abs(r2Bot - r1.y) < EPS;

  if (shareHorizontal) {
    const overlapX1 = Math.max(r1.x, r2.x);
    const overlapX2 = Math.min(r1.x + r1.width, r2.x + r2.width);
    const overlap = overlapX2 - overlapX1;
    if (overlap > 0.5) return overlap;
  }

  // Vertical shared wall: r1 is left of r2 or r2 is left of r1
  const r1Right = r1.x + r1.width;
  const r2Right = r2.x + r2.width;
  const shareVertical =
    Math.abs(r1Right - r2.x) < EPS || Math.abs(r2Right - r1.x) < EPS;

  if (shareVertical) {
    const overlapY1 = Math.max(r1.y, r2.y);
    const overlapY2 = Math.min(r1.y + r1.height, r2.y + r2.height);
    const overlap = overlapY2 - overlapY1;
    if (overlap > 0.5) return overlap;
  }

  return 0;
}

/**
 * Evaluates the architectural adjacency quality of a room configuration.
 * Strictly distinguishes Hard Constraints from Soft Preferences.
 */
export function evaluateAdjacency(rooms: Room[]): AdjacencyEvaluation {
  const hardViolations: string[] = [];
  const softPenalties: string[] = [];
  const strengths: string[] = [];
  let score = 100;

  const living = rooms.find((r) => r.type === "living");
  const dining = rooms.find((r) => r.type === "dining");
  const kitchen = rooms.find((r) => r.type === "kitchen");
  const masterBed = rooms.find((r) => r.type === "master_bedroom");
  const attachedBaths = rooms.filter((r) => r.type === "attached_bath");
  const commonBaths = rooms.filter((r) => r.type === "bathroom");
  const utilities = rooms.filter((r) => r.type === "utility");
  const passages = rooms.filter((r) => r.type === "passage");
  const secondaryBeds = rooms.filter((r) => r.type === "bedroom");

  // 1. HARD CONSTRAINT: Master Bedroom <-> Attached Bathroom
  // When an attached bath is present on a floor, it MUST physically share a wall with the master bedroom.
  if (masterBed && attachedBaths.length > 0) {
    const masterAttBath = attachedBaths.find((b) => b.floor === masterBed.floor);
    if (masterAttBath) {
      const sharedLen = getSharedWallLength(masterBed, masterAttBath);
      if (sharedLen < 3.0) {
        hardViolations.push(
          `Attached Bath (${masterAttBath.name}) does not share a valid boundary wall with Master Bedroom (${sharedLen.toFixed(1)}' shared, min 3.0')`
        );
      } else {
        strengths.push(`Master Bedroom has direct en-suite attached bath (${sharedLen.toFixed(1)}' shared wall)`);
      }
    }
  }

  // 2. STRONG PREFERENCE: Living <-> Dining
  if (living && dining && living.floor === dining.floor) {
    const sharedLen = getSharedWallLength(living, dining);
    if (sharedLen >= 4.0) {
      strengths.push(`Living and Dining share generous ${sharedLen.toFixed(1)}' open boundary`);
    } else {
      softPenalties.push("Living and Dining do not share a wide open boundary");
      score -= 8;
    }
  }

  // 3. STRONG PREFERENCE: Dining <-> Kitchen
  if (dining && kitchen && dining.floor === kitchen.floor) {
    const sharedLen = getSharedWallLength(dining, kitchen);
    const adjacentViaPassage = passages.some((p) =>
      getSharedWallLength(dining, p) > 2.0 && getSharedWallLength(kitchen, p) > 2.0
    );

    if (sharedLen >= 3.0 || adjacentViaPassage) {
      strengths.push("Kitchen is logically connected to Dining space");
    } else {
      softPenalties.push("Kitchen is distant from Dining space");
      score -= 10;
    }
  }

  // 4. STRONG PREFERENCE: Kitchen <-> Utility
  if (kitchen && utilities.length > 0) {
    const hasAdjacentUtility = utilities.some(
      (u) => u.floor === kitchen.floor && getSharedWallLength(kitchen, u) >= 2.5
    );
    if (hasAdjacentUtility) {
      strengths.push("Utility yard directly adjoins kitchen");
    } else {
      softPenalties.push("Utility yard is separated from kitchen work area");
      score -= 6;
    }
  }

  // 5. STRONG PREFERENCE: Bedrooms <-> Common Circulation
  for (const bed of [...secondaryBeds, ...(masterBed ? [masterBed] : [])]) {
    const connectsToCirculation =
      passages.some((p) => p.floor === bed.floor && getSharedWallLength(bed, p) >= 2.5) ||
      (living && living.floor === bed.floor && getSharedWallLength(bed, living) >= 2.5) ||
      (dining && dining.floor === bed.floor && getSharedWallLength(bed, dining) >= 2.5);

    if (!connectsToCirculation) {
      softPenalties.push(`${bed.name} does not directly connect to circulation lobby or public hall`);
      score -= 15;
    }
  }

  // 6. AVOID / PENALIZE: Common Bath directly opening into Living Seating
  if (living && commonBaths.length > 0) {
    for (const bath of commonBaths) {
      if (bath.floor === living.floor) {
        const sharedLen = getSharedWallLength(living, bath);
        if (sharedLen > 4.0) {
          // If bath directly touches living with large shared wall, penalize privacy
          softPenalties.push(`Common bath (${bath.name}) shares large direct boundary with Living Hall`);
          score -= 12;
        }
      }
    }
  }

  // 7. AVOID / PENALIZE: Isolated Utility
  for (const u of utilities) {
    const connectsToKitchen = kitchen && getSharedWallLength(u, kitchen) > 2.0;
    const connectsToLobby = passages.some((p) => getSharedWallLength(u, p) > 2.0);
    const connectsToOTS = rooms.some((r) => r.type === "ots" && getSharedWallLength(u, r) > 2.0);

    if (!connectsToKitchen && !connectsToLobby && !connectsToOTS) {
      softPenalties.push(`Utility (${u.name}) is isolated without connection to kitchen, lobby or lightwell`);
      score -= 15;
    }
  }

  return {
    valid: hardViolations.length === 0,
    score: Math.max(0, score),
    hardConstraintViolations: hardViolations,
    softPreferencePenalties: softPenalties,
    strengths,
  };
}
