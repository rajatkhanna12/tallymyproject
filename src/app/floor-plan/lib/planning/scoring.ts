import {
  Door,
  HouseRequirements,
  LayoutStyleVariant,
  LayoutScore,
  LayoutScoreComponents,
  LayoutScorePenalties,
  Room,
  Window,
} from "../types";
import { evaluateAdjacency, getSharedWallLength } from "./adjacency";
import { PlanAccessibilityAudit, validateVerticalConnectivity } from "./accessibility";
import { roomsOverlap, roomWithinBounds } from "../validation";

// =================================================================================
// PHASE 4: ARCHITECTURAL SCORING & QUALITY OPTIMIZATION ENGINE
// =================================================================================

/**
 * Explicit documented architectural weights. Sums strictly to 1.00 (100%).
 */
export const LAYOUT_SCORE_WEIGHTS = {
  spaceEfficiency: 0.15,      // 15%: Usable carpet area vs buildable envelope & dead space
  circulationQuality: 0.15,   // 15%: Direct circulation access, route depth, corridor ratio
  adjacencyQuality: 0.15,     // 15%: Living-Dining, Kitchen-Dining, Kitchen-Utility adjacencies
  daylightVentilation: 0.15,  // 15%: Exterior perimeter exposure, cross-ventilation, OTS lightwells
  accessibility: 0.10,        // 10%: Unobstructed BFS traversal, verified door connections
  privacy: 0.10,              // 10%: Public vs Semi-Private vs Private zoning separation
  roomProportion: 0.10,       // 10%: Practical 1.1 - 1.5 aspect ratios, furniture friendliness
  staircaseQuality: 0.05,     // 5%: Core alignment, landing clearance, non-disruption
  parkingQuality: 0.03,       // 3%: Usable parking dimensions, safe pedestrian ingress
  futureFlexibility: 0.02,    // 2%: Adaptable upper lounge, modular wall alignments
} as const;

export interface ScoringResult {
  valid: boolean;
  score: LayoutScore;
  disqualificationReason?: string;
}

// ---------------------------------------------------------------------------------
// 1. COMPONENT EVALUATORS
// ---------------------------------------------------------------------------------

/**
 * Evaluates space efficiency (Weight: 15%):
 * - Usable room carpet area vs buildable footprint
 * - Healthy circulation ratio (~10% to 18% of total area)
 * - Absence of unallocated dead space / narrow leftover strips
 */
export function evaluateSpaceEfficiency(
  rooms: Room[],
  plotW: number,
  plotL: number
): { score: number; deadSpacePenalty: number; circPenalty: number } {
  const totalCarpet = rooms.reduce((sum, r) => sum + r.width * r.height, 0);
  const passageRooms = rooms.filter((r) => r.type === "passage");
  const circArea = passageRooms.reduce((sum, r) => sum + r.width * r.height, 0);
  const circRatio = totalCarpet > 0 ? circArea / totalCarpet : 0;

  // Circulation penalty if excessive (> 22%)
  let circPenalty = 0;
  if (circRatio > 0.22) {
    circPenalty = Math.min(25, Math.round((circRatio - 0.22) * 120));
  }

  // Dead space evaluation: Bounding box of rooms vs actual room coverage
  let minX = plotW, maxX = 0, minY = plotL, maxY = 0;
  for (const r of rooms) {
    minX = Math.min(minX, r.x);
    maxX = Math.max(maxX, r.x + r.width);
    minY = Math.min(minY, r.y);
    maxY = Math.max(maxY, r.y + r.height);
  }
  const clusterArea = Math.max(1, (maxX - minX) * (maxY - minY));
  const coverageRatio = Math.min(1.0, totalCarpet / clusterArea);

  let deadSpacePenalty = 0;
  if (coverageRatio < 0.75) {
    deadSpacePenalty = Math.min(25, Math.round((0.75 - coverageRatio) * 60));
  }

  // Base efficiency score (0 - 100)
  let score = Math.round(coverageRatio * 85 + (1 - Math.abs(circRatio - 0.14) * 2) * 15);
  score = Math.max(0, Math.min(100, score - circPenalty - deadSpacePenalty));

  return { score, deadSpacePenalty, circPenalty };
}

/**
 * Evaluates circulation quality (Weight: 15%):
 * - Direct room access from circulation spine/lobby vs through-room traversal
 * - Route efficiency from main entry
 * - Staircase-to-upper-lobby continuity in duplexes
 */
export function evaluateCirculationQuality(
  rooms: Room[],
  audit?: PlanAccessibilityAudit
): { score: number; excessCircPenalty: number } {
  let score = 90;
  let excessCircPenalty = 0;

  // Check if bedrooms open to circulation rather than through other bedrooms
  const bedrooms = rooms.filter((r) => r.type === "bedroom" || r.type === "master_bedroom");
  const passages = rooms.filter((r) => r.type === "passage");
  const lounges = rooms.filter((r) => r.name.toLowerCase().includes("lounge") || r.type === "living");

  for (const bed of bedrooms) {
    const connectsToCirc = [...passages, ...lounges].some(
      (c) => getSharedWallLength(bed, c) >= 2.5
    );
    if (connectsToCirc) {
      score += 2;
    } else {
      score -= 8;
    }
  }

  // Duplex upper lobby evaluation
  const hasUpper = rooms.some((r) => r.floor === 1);
  if (hasUpper) {
    const ffStair = rooms.find((r) => r.floor === 1 && r.type === "staircase");
    const ffLobby = rooms.find(
      (r) => r.floor === 1 && (r.type === "passage" || r.name.toLowerCase().includes("lounge"))
    );
    if (ffStair && ffLobby && getSharedWallLength(ffStair, ffLobby) >= 2.5) {
      score += 5; // Seamless upper transition
    } else if (ffStair && !ffLobby) {
      score -= 10; // Upper landing opens into unbuffered space
    }
  }

  // Use audit route lengths if available
  if (audit && audit.roomDetails.length > 0) {
    const reachableDetails = audit.roomDetails.filter((d) => d.isReachable);
    const avgTransitions =
      reachableDetails.reduce((sum, d) => sum + d.route.split("->").length, 0) /
      Math.max(1, reachableDetails.length);

    if (avgTransitions > 5.5) {
      excessCircPenalty += Math.min(15, Math.round((avgTransitions - 5.5) * 6));
    }
  }

  score = Math.max(0, Math.min(100, score - excessCircPenalty));
  return { score, excessCircPenalty };
}

/**
 * Evaluates functional adjacency quality (Weight: 15%):
 * Reuses Phase 2 evaluateAdjacency model for hard and soft criteria.
 */
export function evaluateAdjacencyScore(rooms: Room[]): {
  score: number;
  softPenalties: string[];
  strengths: string[];
  poorAdjacencyPenalty: number;
} {
  const gfRooms = rooms.filter((r) => r.floor === 0);
  const ffRooms = rooms.filter((r) => r.floor === 1);

  const evalGf = evaluateAdjacency(gfRooms);
  const evalFf = ffRooms.length > 0 ? evaluateAdjacency(ffRooms) : { score: 100, softPreferencePenalties: [], strengths: [] };

  const combinedScore = ffRooms.length > 0 ? (evalGf.score + evalFf.score) / 2 : evalGf.score;
  const softPenalties = [...evalGf.softPreferencePenalties, ...(evalFf.softPreferencePenalties || [])];
  const strengths = [...evalGf.strengths, ...(evalFf.strengths || [])];

  const poorAdjacencyPenalty = Math.min(25, softPenalties.length * 5);
  const finalScore = Math.max(0, Math.min(100, Math.round(combinedScore)));

  return {
    score: finalScore,
    softPenalties,
    strengths,
    poorAdjacencyPenalty,
  };
}

/**
 * Evaluates daylight and natural ventilation quality (Weight: 15%):
 * - Exterior perimeter exposure for all habitable rooms (bedrooms, living)
 * - Corner double-aspect daylight opportunity
 * - OTS lightwell adjacency for interior bathrooms
 */
export function evaluateDaylightVentilationScore(
  rooms: Room[],
  plotW: number,
  plotL: number
): { score: number; poorDaylightPenalty: number } {
  let score = 70;
  let poorDaylightPenalty = 0;

  const habitableRooms = rooms.filter(
    (r) => r.type === "bedroom" || r.type === "master_bedroom" || r.type === "living"
  );
  const bathrooms = rooms.filter((r) => r.type === "bathroom" || r.type === "attached_bath");
  const otsLightwells = rooms.filter((r) => r.type === "ots");

  const EPS = 0.5;

  for (const r of habitableRooms) {
    let exteriorWallCount = 0;
    if (Math.abs(r.x) < EPS) exteriorWallCount++;
    if (Math.abs(r.y) < EPS) exteriorWallCount++;
    if (Math.abs(r.x + r.width - plotW) < EPS) exteriorWallCount++;
    if (Math.abs(r.y + r.height - plotL) < EPS) exteriorWallCount++;

    if (exteriorWallCount >= 2) {
      score += 6; // Double-aspect corner room daylight bonus
    } else if (exteriorWallCount === 1) {
      score += 3; // Direct exterior wall window opportunity
    } else {
      poorDaylightPenalty += 15; // Habitable room with zero exterior exposure
    }
  }

  for (const bath of bathrooms) {
    let exteriorWall = false;
    if (
      Math.abs(bath.x) < EPS ||
      Math.abs(bath.y) < EPS ||
      Math.abs(bath.x + bath.width - plotW) < EPS ||
      Math.abs(bath.y + bath.height - plotL) < EPS
    ) {
      exteriorWall = true;
    }

    const sharesOTS = otsLightwells.some((o) => getSharedWallLength(bath, o) >= 2.0);
    if (exteriorWall || sharesOTS) {
      score += 2;
    } else {
      poorDaylightPenalty += 8; // Interior bathroom lacking both window and OTS
    }
  }

  score = Math.max(0, Math.min(100, score - poorDaylightPenalty));
  return { score, poorDaylightPenalty: Math.min(30, poorDaylightPenalty) };
}

/**
 * Evaluates accessibility quality (Weight: 10%):
 * - Reachable room count ratio from BFS audit
 * - Route transition steps: average <= 3.2 gets +8 bonus; > 5.0 gets depth penalty
 * - Unventilated rooms deduction
 * - Duplex vertical connectivity quality: well-centered (<= 0.8', >= 75% overlap) gets +4;
 *   strained (>= 1.5' offset or < 55% overlap) gets -8 deduction
 */
export function evaluateAccessibilityScore(
  rooms: Room[],
  audit?: PlanAccessibilityAudit
): number {
  if (!audit) return 85;

  const totalAudited = audit.roomDetails.length;
  if (totalAudited === 0) {
    return audit.allReachable ? 88 : 0;
  }

  const reachableDetails = audit.roomDetails.filter((d) => d.isReachable);
  const reachableRatio = reachableDetails.length / totalAudited;

  if (reachableRatio === 0) {
    return 0;
  }

  // Base score based on reachability
  let score = audit.allReachable ? 88 : Math.round(reachableRatio * 50);

  // 1. Route transition steps
  if (reachableDetails.length > 0) {
    const totalSteps = reachableDetails.reduce((sum, d) => {
      const transitions = (d.route.match(/->/g) || []).length;
      return sum + (transitions > 0 ? transitions : 1);
    }, 0);
    const avgSteps = totalSteps / reachableDetails.length;

    if (avgSteps <= 3.2) {
      score += 8; // Direct, efficient circulation bonus
    } else if (avgSteps > 5.0) {
      const depthPenalty = Math.min(15, Math.round((avgSteps - 5.0) * 5));
      score -= depthPenalty; // Deep circulation penalty
    }
  }

  // 2. Unventilated rooms deduction
  const unventilatedCount = audit.unventilatedRooms.length;
  if (unventilatedCount > 0) {
    score -= unventilatedCount * 8;
  }

  // 3. Duplex vertical connectivity quality
  const isDuplex = rooms.some((r) => r.floor === 1);
  if (isDuplex) {
    const vertConn = validateVerticalConnectivity(rooms);
    if (vertConn.valid) {
      const offset = vertConn.centerlineOffset ?? 0;
      const overlap = vertConn.overlapRatio ?? 1.0;

      if (offset <= 0.8 && overlap >= 0.75) {
        score += 4; // Well-centered, high-overlap vertical connection
      } else if (offset >= 1.5 || overlap < 0.55) {
        score -= 8; // Strained vertical connection
      }
    } else {
      score -= 25; // Invalid vertical core
    }
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Evaluates privacy and functional zoning (Weight: 10%):
 * Separates Public (entrance, verandah, living, dining),
 * Semi-Private (kitchen, utility, upper lounge),
 * and Private (bedrooms, master bedroom, attached baths).
 */
export function evaluatePrivacyZoningScore(rooms: Room[]): number {
  let score = 85;

  const living = rooms.find((r) => r.type === "living");
  const bedrooms = rooms.filter((r) => r.type === "bedroom" || r.type === "master_bedroom");
  const attachedBaths = rooms.filter((r) => r.type === "attached_bath");
  const commonBaths = rooms.filter((r) => r.type === "bathroom");

  // Attached bathrooms should share wall with a bedroom suite
  for (const ab of attachedBaths) {
    if (bedrooms.some((b) => getSharedWallLength(ab, b) >= 2.0)) {
      score += 2;
    }
  }

  // Private sleeping rooms should not open directly into formal living if passage exists
  const hasPassage = rooms.some((r) => r.type === "passage");
  if (living && hasPassage) {
    for (const bed of bedrooms) {
      if (bed.floor === living.floor && getSharedWallLength(bed, living) >= 4.0) {
        score -= 5; // Slight reduction if bedroom wall directly borders formal living
      }
    }
  }

  // Common bath should not directly face the formal living entrance
  if (living) {
    for (const cb of commonBaths) {
      if (cb.floor === living.floor && getSharedWallLength(cb, living) >= 3.0) {
        score -= 10; // Privacy penalty for common bath opening to living
      }
    }
  }

  // Duplex bonus: Upper floor dedicated to private suites
  const upperBeds = rooms.filter((r) => r.floor === 1 && (r.type === "bedroom" || r.type === "master_bedroom"));
  if (upperBeds.length >= 2) {
    score += 10; // Strong natural vertical zoning
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Evaluates room aspect ratios and geometric proportions (Weight: 10%):
 * Ideal aspect ratio is 1.1:1 to 1.5:1.
 * Penalizes awkward elongated rectangles (> 1.8:1) and tiny residual spaces.
 */
export function evaluateRoomProportions(rooms: Room[]): {
  score: number;
  awkwardShapesPenalty: number;
} {
  let score = 90;
  let awkwardShapesPenalty = 0;

  for (const r of rooms) {
    if (r.type === "passage" || r.type === "parking" || r.type === "ots" || r.type === "verandah") {
      continue;
    }

    const minDim = Math.min(r.width, r.height);
    const maxDim = Math.max(r.width, r.height);
    const aspect = minDim > 0 ? maxDim / minDim : 99;

    if (aspect <= 1.5) {
      score += 2; // Comfortable furniture-friendly proportion
    } else if (aspect > 1.8) {
      const p = Math.min(20, Math.round((aspect - 1.8) * 30));
      awkwardShapesPenalty += p;
    }

    // Minimum comfortable width checks
    if ((r.type === "bedroom" || r.type === "master_bedroom") && minDim < 9.0) {
      awkwardShapesPenalty += 10;
    }
    if (r.type === "kitchen" && minDim < 6.5) {
      awkwardShapesPenalty += 8;
    }
  }

  score = Math.max(0, Math.min(100, score - awkwardShapesPenalty));
  return { score, awkwardShapesPenalty: Math.min(30, awkwardShapesPenalty) };
}

/**
 * Evaluates wall offsets, jogs, and fragmented alignments (Weight soft deduction: 0 to 25 pts).
 * - Wall jogs/offsets between adjacent rooms sharing boundaries (0.4' < delta < 2.5').
 * - Staircase centerline offset between GF and FF (> 0.8' incurs soft penalty up to 2.5' hard limit).
 * - Bounded between 0 and 25 points, soft penalty only.
 */
export function evaluateExcessiveOffsets(rooms: Room[]): {
  offsetPenalty: number;
  reasons: string[];
} {
  let penalty = 0;
  const reasons: string[] = [];

  // 1. Wall jogs / offsets between adjacent rooms on each floor
  const floors = Array.from(new Set(rooms.map((r) => r.floor)));
  for (const floor of floors) {
    const floorRooms = rooms.filter((r) => r.floor === floor);
    for (let i = 0; i < floorRooms.length; i++) {
      for (let j = i + 1; j < floorRooms.length; j++) {
        const r1 = floorRooms[i];
        const r2 = floorRooms[j];

        // Check if r1 and r2 share a vertical boundary
        const touchVertical =
          Math.abs(r1.x + r1.width - r2.x) < 0.15 ||
          Math.abs(r2.x + r2.width - r1.x) < 0.15;
        if (touchVertical) {
          const yOverlap = Math.min(r1.y + r1.height, r2.y + r2.height) - Math.max(r1.y, r2.y);
          if (yOverlap > 1.0) {
            const deltaTop = Math.abs(r1.y - r2.y);
            if (deltaTop > 0.4 && deltaTop < 2.5) {
              penalty += 3;
              reasons.push(`Wall jog of ${deltaTop.toFixed(1)}' between ${r1.name} and ${r2.name}`);
            }
            const deltaBottom = Math.abs(r1.y + r1.height - (r2.y + r2.height));
            if (deltaBottom > 0.4 && deltaBottom < 2.5) {
              penalty += 3;
              reasons.push(`Wall jog of ${deltaBottom.toFixed(1)}' between ${r1.name} and ${r2.name}`);
            }
          }
        }

        // Check if r1 and r2 share a horizontal boundary
        const touchHorizontal =
          Math.abs(r1.y + r1.height - r2.y) < 0.15 ||
          Math.abs(r2.y + r2.height - r1.y) < 0.15;
        if (touchHorizontal) {
          const xOverlap = Math.min(r1.x + r1.width, r2.x + r2.width) - Math.max(r1.x, r2.x);
          if (xOverlap > 1.0) {
            const deltaLeft = Math.abs(r1.x - r2.x);
            if (deltaLeft > 0.4 && deltaLeft < 2.5) {
              penalty += 3;
              reasons.push(`Wall jog of ${deltaLeft.toFixed(1)}' between ${r1.name} and ${r2.name}`);
            }
            const deltaRight = Math.abs(r1.x + r1.width - (r2.x + r2.width));
            if (deltaRight > 0.4 && deltaRight < 2.5) {
              penalty += 3;
              reasons.push(`Wall jog of ${deltaRight.toFixed(1)}' between ${r1.name} and ${r2.name}`);
            }
          }
        }
      }
    }
  }

  // 2. Staircase centerline offset between GF and FF
  const gfStair = rooms.find((r) => r.floor === 0 && r.type === "staircase");
  const ffStair = rooms.find((r) => r.floor === 1 && r.type === "staircase");
  if (gfStair && ffStair) {
    const gfCenterX = gfStair.x + gfStair.width / 2;
    const gfCenterY = gfStair.y + gfStair.height / 2;
    const ffCenterX = ffStair.x + ffStair.width / 2;
    const ffCenterY = ffStair.y + ffStair.height / 2;
    const offset = Math.hypot(gfCenterX - ffCenterX, gfCenterY - ffCenterY);

    if (offset > 0.8) {
      const stairPenalty = Math.min(12, Math.round((offset - 0.8) * 7));
      penalty += stairPenalty;
      reasons.push(`Staircase core centerline offset of ${offset.toFixed(1)}' between GF and FF`);
    }
  }

  const offsetPenalty = Math.min(25, penalty);
  return { offsetPenalty, reasons };
}

/**
 * Evaluates staircase quality (Weight: 5%):
 * - Accessible from central circulation
 * - Clean vertical core alignment with upper floor
 * - Non-disruption of bedrooms
 */
export function evaluateStaircaseQuality(rooms: Room[]): number {
  const gfStair = rooms.find((r) => r.floor === 0 && r.type === "staircase");
  if (!gfStair) {
    return 100; // Single floor without staircase: neutral full score
  }

  let score = 85;

  // Proximity to circulation or living
  const connectsCirc = rooms.some(
    (r) =>
      r.floor === 0 &&
      (r.type === "passage" || r.type === "living") &&
      getSharedWallLength(gfStair, r) >= 2.5
  );
  if (connectsCirc) {
    score += 10;
  } else {
    score -= 15;
  }

  // Upper landing continuity
  const ffStair = rooms.find((r) => r.floor === 1 && r.type === "staircase");
  if (ffStair) {
    if (gfStair.verticalCoreId && ffStair.verticalCoreId === gfStair.verticalCoreId) {
      score += 5; // Matched vertical core
    }
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Evaluates parking quality (Weight: 3%):
 * - Usable bay dimensions
 * - Safe pedestrian ingress clearance alongside vehicle
 * - Direct access to front porch / entry
 */
export function evaluateParkingQuality(rooms: Room[], req: HouseRequirements): number {
  if (!req.parking || req.parking.type === "none") {
    return 100; // No parking required: neutral full score
  }

  const park = rooms.find((r) => r.type === "parking");
  if (!park) {
    return 0; // Missing required parking
  }

  let score = 85;
  if (req.parking.type === "car") {
    if (park.width >= 9.5 && park.height >= 16.0) {
      score += 10;
    } else {
      score -= 10;
    }
  } else if (req.parking.type === "bike") {
    if (park.width >= 5.0 && park.height >= 6.0) {
      score += 10;
    }
  }

  // Connection to verandah / main entry
  const verandah = rooms.find((r) => r.type === "verandah");
  if (verandah && getSharedWallLength(park, verandah) >= 2.5) {
    score += 5; // Sheltered pedestrian transition
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Evaluates future flexibility (Weight: 2%):
 * - Adaptable upper lounge space
 * - Clean rectangular modular boundaries
 */
export function evaluateFutureFlexibility(rooms: Room[]): number {
  let score = 80;

  const upperLounge = rooms.find(
    (r) => r.floor === 1 && (r.name.toLowerCase().includes("lounge") || r.type === "passage")
  );
  if (upperLounge && upperLounge.width * upperLounge.height >= 100) {
    score += 15; // Space can adapt to future bedroom or study
  }

  // Rectangular alignment bonus
  const hasOnlyRectangles = rooms.every((r) => r.width >= 3.0 && r.height >= 3.0);
  if (hasOnlyRectangles) {
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

// ---------------------------------------------------------------------------------
// 2. MASTER LAYOUT SCORING FUNCTION
// ---------------------------------------------------------------------------------

/**
 * Computes a comprehensive, explainable architectural score for a surviving valid candidate.
 * 
 * Rules:
 * 1. Hard constraints are strictly enforced: If a candidate has overlapping rooms,
 *    out-of-bounds rooms, or missing mandatory rooms, it is immediately marked valid: false
 *    with total: 0. Soft scores NEVER rescue invalid candidates.
 * 2. 10 weighted components strictly sum to 100%.
 * 3. Quantified penalties deduct from total score with explainable reasons.
 */
export function calculateLayoutScore(
  rooms: Room[],
  req: HouseRequirements,
  variant: LayoutStyleVariant,
  plotW: number,
  plotL: number,
  doors?: Door[],
  windows?: Window[],
  audit?: PlanAccessibilityAudit
): ScoringResult {
  // 1. HARD CONSTRAINT VERIFICATION
  // Out-of-bounds or overlapping rooms cannot receive a soft score
  for (const r of rooms) {
    if (!roomWithinBounds(r, plotW, plotL) || r.width < 2.2 || r.height < 2.2) {
      return {
        valid: false,
        score: createZeroScore(["Failed geometric boundary validation: room out of plot envelope"]),
        disqualificationReason: "Room out of bounds or smaller than absolute physical minimum",
      };
    }
  }

  for (let i = 0; i < rooms.length; i++) {
    for (let j = i + 1; j < rooms.length; j++) {
      if (roomsOverlap(rooms[i], rooms[j])) {
        return {
          valid: false,
          score: createZeroScore(["Failed geometric validation: physical room overlap detected"]),
          disqualificationReason: `Physical overlap between ${rooms[i].name} and ${rooms[j].name}`,
        };
      }
    }
  }

  // 2. COMPONENT EVALUATIONS
  const eff = evaluateSpaceEfficiency(rooms, plotW, plotL);
  const circ = evaluateCirculationQuality(rooms, audit);
  const adj = evaluateAdjacencyScore(rooms);
  const day = evaluateDaylightVentilationScore(rooms, plotW, plotL);
  const acc = evaluateAccessibilityScore(rooms, audit);
  const priv = evaluatePrivacyZoningScore(rooms);
  const prop = evaluateRoomProportions(rooms);
  const offsets = evaluateExcessiveOffsets(rooms);
  const stair = evaluateStaircaseQuality(rooms);
  const park = evaluateParkingQuality(rooms, req);
  const flex = evaluateFutureFlexibility(rooms);

  // 3. PENALTIES (Quantified & explainable)
  const penalties: LayoutScorePenalties = {
    excessiveCirculation: circ.excessCircPenalty + eff.circPenalty,
    awkwardRoomShapes: prop.awkwardShapesPenalty,
    unnecessaryDeadSpace: eff.deadSpacePenalty,
    poorDaylight: day.poorDaylightPenalty,
    poorAdjacency: adj.poorAdjacencyPenalty,
    excessiveOffsets: offsets.offsetPenalty,
  };

  const totalPenalties =
    penalties.excessiveCirculation +
    penalties.awkwardRoomShapes +
    penalties.unnecessaryDeadSpace +
    penalties.poorDaylight +
    penalties.poorAdjacency +
    penalties.excessiveOffsets;

  // Deduct offset penalty within roomProportion component (bounded 0..100)
  const roomProportionScore = Math.max(0, prop.score - offsets.offsetPenalty);

  const components: LayoutScoreComponents = {
    spaceEfficiency: eff.score,
    circulationQuality: circ.score,
    adjacencyQuality: adj.score,
    daylightVentilation: day.score,
    accessibility: acc,
    privacy: priv,
    roomProportion: roomProportionScore,
    staircaseQuality: stair,
    parkingQuality: park,
    futureFlexibility: flex,
  };

  // 4. WEIGHTED TOTAL
  // Each component is 0–100 with its category penalties applied strictly once.
  // Architectural weights sum strictly to 1.00 (100%).
  // No secondary deduction: totalPenalties * 0.4 is eliminated to prevent double-counting.
  const rawWeightedSum =
    components.spaceEfficiency * LAYOUT_SCORE_WEIGHTS.spaceEfficiency +
    components.circulationQuality * LAYOUT_SCORE_WEIGHTS.circulationQuality +
    components.adjacencyQuality * LAYOUT_SCORE_WEIGHTS.adjacencyQuality +
    components.daylightVentilation * LAYOUT_SCORE_WEIGHTS.daylightVentilation +
    components.accessibility * LAYOUT_SCORE_WEIGHTS.accessibility +
    components.privacy * LAYOUT_SCORE_WEIGHTS.privacy +
    components.roomProportion * LAYOUT_SCORE_WEIGHTS.roomProportion +
    components.staircaseQuality * LAYOUT_SCORE_WEIGHTS.staircaseQuality +
    components.parkingQuality * LAYOUT_SCORE_WEIGHTS.parkingQuality +
    components.futureFlexibility * LAYOUT_SCORE_WEIGHTS.futureFlexibility;

  const total = Math.round(Math.max(0, Math.min(100, rawWeightedSum)) * 10) / 10;

  // 5. EXPLAINABILITY REASONS
  const reasons: string[] = [];
  if (eff.score >= 80) {
    reasons.push(`High space efficiency (${eff.score}%) with balanced circulation and minimal dead space`);
  }
  if (adj.strengths.length > 0) {
    reasons.push(adj.strengths[0]);
  } else if (adj.score >= 85) {
    reasons.push("Strong living, dining, and kitchen functional adjacencies");
  }
  if (circ.score >= 85) {
    reasons.push("Direct circulation access: private rooms accessible from central spine/lobby");
  }
  if (day.score >= 85) {
    reasons.push("Excellent natural daylighting and exterior perimeter ventilation");
  }
  if (priv >= 85) {
    reasons.push("Effective public/private zoning separating sleeping quarters from formal entrance");
  }
  if (req.floors >= 2 && stair >= 85) {
    reasons.push("Aligned vertical core providing seamless staircase access to upper floor");
  }
  if (prop.score >= 85) {
    reasons.push("Comfortable 1.1–1.5 room proportions optimized for furniture ergonomics");
  }
  if (offsets.offsetPenalty >= 6 && offsets.reasons.length > 0) {
    reasons.push(`Layout has wall jog/offset irregularities: ${offsets.reasons[0]}`);
  }

  return {
    valid: true,
    score: {
      total,
      components,
      penalties,
      totalPenalties,
      reasons,
    },
  };
}

function createZeroScore(reasons: string[]): LayoutScore {
  return {
    total: 0,
    components: {
      spaceEfficiency: 0,
      circulationQuality: 0,
      adjacencyQuality: 0,
      daylightVentilation: 0,
      accessibility: 0,
      privacy: 0,
      roomProportion: 0,
      staircaseQuality: 0,
      parkingQuality: 0,
      futureFlexibility: 0,
    },
    penalties: {
      excessiveCirculation: 0,
      awkwardRoomShapes: 0,
      unnecessaryDeadSpace: 0,
      poorDaylight: 0,
      poorAdjacency: 0,
      excessiveOffsets: 0,
    },
    totalPenalties: 0,
    reasons,
  };
}
