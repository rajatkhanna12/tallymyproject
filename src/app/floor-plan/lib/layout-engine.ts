import {
  Column,
  CompassDirection,
  DimensionLabel,
  Door,
  FeasibilityResult,
  FloorPlan,
  GenerationResult,
  HouseRequirements,
  LayoutStyleVariant,
  LayoutScore,
  LayoutScoreBreakdown,
  Room,
  Wall,
  Window,
} from "./types";
import { calculateLayoutScore } from "./planning/scoring";
import { generateFurnitureForRooms, validateFurnitureErgonomics } from "./furniture";
import { roomsOverlap, roomWithinBounds, validateFloorPlan, validatePlanFeasibility } from "./validation";
import {
  calculateBuildableEnvelope,
  calculateFloorPlanAreas,
  getConceptualSetbacks,
} from "./geometry";
import { placeGroundRooms } from "./planning/room-placement";
import {
  generateArchitecturalDoors,
  generateArchitecturalWindows,
} from "./planning/openings";
import {
  auditDuplexAccessibility,
  auditPlanAccessibility,
  validateVerticalConnectivity,
} from "./planning/accessibility";
import { evaluateAdjacency } from "./planning/adjacency";
import {
  StaircaseCandidate,
  calculateStaircaseGeometry,
  generateStaircaseCandidates,
} from "./planning/staircase";
import { placeFirstFloorRooms } from "./planning/first-floor-placement";
import { calculateFunctionalZoning } from "./planning/zoning";
import { calculateCirculationWidth } from "./planning/circulation";

export { calculateStaircaseGeometry };

// Wall thickness constants (in feet)
const EXT_WALL = 0.75; // 9 inch external masonry wall
const INT_WALL = 0.38; // 4.5 inch interior partition brick wall

export function formatFeetInches(val: number): string {
  const rounded = Math.round(val * 2) / 2;
  const ft = Math.floor(rounded);
  const inches = Math.round((rounded - ft) * 12);
  if (inches === 0) return `${ft}'0"`;
  return `${ft}'${inches}"`;
}


/**
 * Generates deduplicated architectural walls.
 * - Deduplicates shared interior partition walls so rooms do not have double lines.
 * - Creates an open cased archway (jamb stubs with wide opening) between Living and Dining.
 * - Leaves parking and verandah transitions open.
 * - Leaves front road access of parking completely open.
 */
function generateWalls(rooms: Room[], plotWidth: number, plotLength: number, floor: number): Wall[] {
  const floorRooms = rooms.filter((r) => r.floor === floor);
  const walls: Wall[] = [];
  let wallIdx = 1;

  // Set of encoded segments to prevent duplicate overlapping walls
  const placedSegments = new Set<string>();

  const dining = floorRooms.find((r) => r.type === "dining");

  for (const r of floorRooms) {
    const isFrontOfParking = r.type === "parking" && Math.abs(r.y) < 0.1;
    const isFrontOfVerandah = r.type === "verandah" && Math.abs(r.y) < 0.1;

    // 1. TOP EDGE (Horizontal)
    if (!isFrontOfParking && !isFrontOfVerandah) {
      const isTopExt = Math.abs(r.y) < 0.1;
      const key = `H-${Math.round(r.y * 10)}-${Math.round(r.x * 10)}-${Math.round((r.x + r.width) * 10)}`;
      if (!placedSegments.has(key)) {
        placedSegments.add(key);
        walls.push({
          id: `w-${floor}-${wallIdx++}`,
          x1: r.x,
          y1: r.y,
          x2: r.x + r.width,
          y2: r.y,
          thickness: isTopExt ? EXT_WALL : INT_WALL,
          isExternal: isTopExt,
          floor,
        });
      }
    }

    // 2. BOTTOM EDGE (Horizontal)
    const isBottomExt = Math.abs(r.y + r.height - plotLength) < 0.1;
    const botKey = `H-${Math.round((r.y + r.height) * 10)}-${Math.round(r.x * 10)}-${Math.round((r.x + r.width) * 10)}`;
    if (!placedSegments.has(botKey)) {
      placedSegments.add(botKey);
      walls.push({
        id: `w-${floor}-${wallIdx++}`,
        x1: r.x,
        y1: r.y + r.height,
        x2: r.x + r.width,
        y2: r.y + r.height,
        thickness: isBottomExt ? EXT_WALL : INT_WALL,
        isExternal: isBottomExt,
        floor,
      });
    }

    // 3. LEFT EDGE (Vertical)
    const isLeftExt = Math.abs(r.x) < 0.1;
    const leftKey = `V-${Math.round(r.x * 10)}-${Math.round(r.y * 10)}-${Math.round((r.y + r.height) * 10)}`;
    if (!placedSegments.has(leftKey)) {
      placedSegments.add(leftKey);
      walls.push({
        id: `w-${floor}-${wallIdx++}`,
        x1: r.x,
        y1: r.y,
        x2: r.x,
        y2: r.y + r.height,
        thickness: isLeftExt ? EXT_WALL : INT_WALL,
        isExternal: isLeftExt,
        floor,
      });
    }

    // 4. RIGHT EDGE (Vertical)
    const isRightExt = Math.abs(r.x + r.width - plotWidth) < 0.1;

    // Check if right edge is shared between Living and Dining
    const sharesWithDining =
      r.type === "living" &&
      dining &&
      Math.abs(r.x + r.width - dining.x) < 0.25 &&
      Math.min(r.y + r.height, dining.y + dining.height) - Math.max(r.y, dining.y) > 3.0;

    // Check if shared between Parking and Verandah (open boundary)
    const isBetweenParkAndVerandah =
      (r.type === "parking" || r.type === "verandah") &&
      Math.abs(r.y) < 0.1 &&
      !isRightExt;

    if (sharesWithDining && dining) {
      // Open Cased Archway: draw only top and bottom wall stubs, leaving a wide opening!
      const overlapY1 = Math.max(r.y, dining.y);
      const overlapY2 = Math.min(r.y + r.height, dining.y + dining.height);
      const stubLen = 1.0;

      // Top jamb stub
      walls.push({
        id: `w-${floor}-${wallIdx++}`,
        x1: r.x + r.width,
        y1: overlapY1,
        x2: r.x + r.width,
        y2: overlapY1 + stubLen,
        thickness: INT_WALL,
        isExternal: false,
        floor,
      });

      // Bottom jamb stub
      walls.push({
        id: `w-${floor}-${wallIdx++}`,
        x1: r.x + r.width,
        y1: overlapY2 - stubLen,
        x2: r.x + r.width,
        y2: overlapY2,
        thickness: INT_WALL,
        isExternal: false,
        floor,
      });

      placedSegments.add(`V-${Math.round((r.x + r.width) * 10)}-${Math.round(r.y * 10)}-${Math.round((r.y + r.height) * 10)}`);
    } else if (isBetweenParkAndVerandah) {
      // Open step transition between porch and driveway
      placedSegments.add(`V-${Math.round((r.x + r.width) * 10)}-${Math.round(r.y * 10)}-${Math.round((r.y + r.height) * 10)}`);
    } else {
      const rightKey = `V-${Math.round((r.x + r.width) * 10)}-${Math.round(r.y * 10)}-${Math.round((r.y + r.height) * 10)}`;
      if (!placedSegments.has(rightKey)) {
        placedSegments.add(rightKey);
        walls.push({
          id: `w-${floor}-${wallIdx++}`,
          x1: r.x + r.width,
          y1: r.y,
          x2: r.x + r.width,
          y2: r.y + r.height,
          thickness: isRightExt ? EXT_WALL : INT_WALL,
          isExternal: isRightExt,
          floor,
        });
      }
    }
  }

  return walls;
}

/**
 * Places realistic architectural doors with context-aware swing arcs.
 * Positioned on shared walls between logically adjacent spaces, opening against nearest clear wall.
 */
function generateDoors(rooms: Room[], floor: number): Door[] {
  return generateArchitecturalDoors(rooms, floor);
}

/**
 * Generates exterior windows for natural daylight and ventilation.
 * Positioned primarily on external perimeter walls and OTS lightwell shafts.
 */
function generateWindows(rooms: Room[], plotWidth: number, plotLength: number, floor: number): Window[] {
  return generateArchitecturalWindows(rooms, plotWidth, plotLength, floor);
}

/**
 * Computes structural RCC column locations (9"×9" / 0.75'×0.75') at key structural grid points.
 */
function generateColumns(rooms: Room[], plotWidth: number, plotLength: number, floor: number): Column[] {
  const cols: Column[] = [];
  let colIdx = 1;
  const colSize = 0.75;

  const points: { x: number; y: number }[] = [
    { x: 0, y: 0 },
    { x: plotWidth - colSize, y: 0 },
    { x: 0, y: plotLength - colSize },
    { x: plotWidth - colSize, y: plotLength - colSize },
  ];

  for (const r of rooms.filter((r) => r.floor === floor)) {
    if (r.type === "parking" || r.type === "living" || r.type === "master_bedroom") {
      points.push({ x: r.x, y: r.y });
      points.push({ x: r.x + r.width - colSize, y: r.y });
      points.push({ x: r.x, y: r.y + r.height - colSize });
      points.push({ x: r.x + r.width - colSize, y: r.y + r.height - colSize });
    }
  }

  const uniquePoints: { x: number; y: number }[] = [];
  for (const pt of points) {
    const exists = uniquePoints.some(
      (u) => Math.abs(u.x - pt.x) < 1.5 && Math.abs(u.y - pt.y) < 1.5
    );
    if (!exists) {
      uniquePoints.push(pt);
    }
  }

  for (const pt of uniquePoints) {
    cols.push({
      id: `col-${floor}-${colIdx++}`,
      x: Math.max(0, Math.min(plotWidth - colSize, pt.x)),
      y: Math.max(0, Math.min(plotLength - colSize, pt.y)),
      width: colSize,
      height: colSize,
      floor,
    });
  }

  return cols;
}

/**
 * Generates dimension annotations calculated directly from actual room geometry.
 */
function generateDimensions(rooms: Room[], floor: number): DimensionLabel[] {
  const floorRooms = rooms.filter((r) => r.floor === floor);
  const labels: DimensionLabel[] = [];

  for (const r of floorRooms) {
    labels.push({
      id: `dim-w-${r.id}`,
      x1: r.x,
      y1: r.y + r.height,
      x2: r.x + r.width,
      y2: r.y + r.height,
      value: formatFeetInches(r.width),
      floor,
      orientation: "horizontal",
    });
    labels.push({
      id: `dim-h-${r.id}`,
      x1: r.x + r.width,
      y1: r.y,
      x2: r.x + r.width,
      y2: r.y + r.height,
      value: formatFeetInches(r.height),
      floor,
      orientation: "vertical",
    });
  }

  return labels;
}

// ---------------------------------------------------------------------------------
// ARCHITECTURAL SCORING & SELECTION ENGINE
// ---------------------------------------------------------------------------------

export function scoreCandidateLayout(
  rooms: Room[],
  req: HouseRequirements,
  variant: LayoutStyleVariant,
  plotW: number,
  plotL: number
): { breakdown: LayoutScoreBreakdown; valid: boolean } {
  const isVastu = !!req.preferences?.vastu;

  // 1. Requirements Compliance Score (Priority 1: Top priority)
  let reqScore = 1000;
  const requestedBeds =
    req.rooms
      .filter((r) => r.type === "bedroom" || r.type === "master_bedroom")
      .reduce((sum, r) => sum + r.quantity, 0) || 2;
  const requestedBaths =
    req.rooms
      .filter((r) => r.type === "bathroom" || r.type === "attached_bath")
      .reduce((sum, r) => sum + r.quantity, 0) || 2;

  const isDuplex = req.floors >= 2;
  const hasUpperRooms = rooms.some((r) => r.floor === 1);
  const expectedBeds = hasUpperRooms ? requestedBeds : (isDuplex ? (requestedBeds >= 4 ? 2 : 1) : requestedBeds);
  const expectedBaths = hasUpperRooms ? requestedBaths : (isDuplex ? (requestedBaths >= 4 ? 2 : 1) : requestedBaths);

  const actualBeds = rooms.filter((r) => r.type === "bedroom" || r.type === "master_bedroom").length;
  const actualBaths = rooms.filter((r) => r.type === "bathroom" || r.type === "attached_bath").length;
  const hasKitchen = rooms.some((r) => r.type === "kitchen");
  const hasDining = rooms.some((r) => r.type === "dining");
  const hasParking = rooms.some((r) => r.type === "parking");
  const reqParking = req.parking?.type && req.parking.type !== "none";
  const reqStairs = req.floors >= 2 || !!req.staircase;
  const hasStairs = rooms.some((r) => r.type === "staircase");

  if (actualBeds < expectedBeds) reqScore = 0;
  if (actualBaths < expectedBaths) reqScore = 0;
  if (!hasKitchen) reqScore = 0;
  const reqDining = req.rooms.some((r) => r.type === "dining");
  if (reqDining && !hasDining) reqScore = 0;
  if (reqParking && !hasParking) reqScore = 0;
  if (reqStairs && !hasStairs) reqScore = 0;

  if (reqScore === 0) {
    return {
      breakdown: {
        requirementsComplianceScore: 0,
        geometricValidityScore: 0,
        circulationScore: 0,
        proportionScore: 0,
        furnitureClearanceScore: 0,
        adjacencyScore: 0,
        lightVentilationScore: 0,
        constructionEfficiencyScore: 0,
        vastuScore: 0,
        totalScore: -100000,
      },
      valid: false,
    };
  }

  // 2. Geometric Validity Score (Priority 2)
  let geoScore = 500;
  for (const r of rooms) {
    if (!roomWithinBounds(r, plotW, plotL)) {
      geoScore -= 100000;
    }
    if (r.width < 2.2 || r.height < 2.2) {
      geoScore -= 10000;
    }
  }

  for (let i = 0; i < rooms.length; i++) {
    for (let j = i + 1; j < rooms.length; j++) {
      if (roomsOverlap(rooms[i], rooms[j])) {
        geoScore -= 100000;
      }
    }
  }

  if (geoScore < 0) {
    return {
      breakdown: {
        requirementsComplianceScore: reqScore,
        geometricValidityScore: geoScore,
        circulationScore: 0,
        proportionScore: 0,
        furnitureClearanceScore: 0,
        adjacencyScore: 0,
        lightVentilationScore: 0,
        constructionEfficiencyScore: 0,
        vastuScore: 0,
        totalScore: -100000,
      },
      valid: false,
    };
  }

  // 3. Circulation Score (Priority 3)
  let circScore = 250;
  const commonBath = rooms.find((r) => r.type === "bathroom");
  const passage = rooms.find((r) => r.type === "passage");
  if (commonBath && passage) {
    const sharesWithPassage =
      Math.abs(commonBath.x + commonBath.width - passage.x) < 0.25 ||
      Math.abs(passage.x + passage.width - commonBath.x) < 0.25 ||
      Math.abs(commonBath.y + commonBath.height - passage.y) < 0.25 ||
      Math.abs(passage.y + passage.height - commonBath.y) < 0.25;
    if (sharesWithPassage) circScore += 50;
  }

  const stair = rooms.find((r) => r.type === "staircase");
  if (stair) {
    const adjacentToLiving = rooms.some(
      (r) => (r.type === "living" || r.type === "passage" || r.type === "dining") &&
        (Math.abs(stair.x + stair.width - r.x) < 0.25 ||
          Math.abs(r.x + r.width - stair.x) < 0.25 ||
          Math.abs(stair.y + stair.height - r.y) < 0.25 ||
          Math.abs(r.y + r.height - stair.y) < 0.25)
    );
    if (adjacentToLiving) circScore += 50;
    else circScore -= 80;
  }

  // 4. Room Proportions Score (Priority 4: Soft guidelines with penalties)
  let propScore = 200;
  for (const r of rooms) {
    const area = r.width * r.height;
    const aspect = Math.max(r.width, r.height) / Math.min(r.width, r.height);

    if (aspect > 2.0 && r.type !== "passage" && r.type !== "parking" && r.type !== "staircase") {
      propScore -= Math.round((aspect - 2.0) * 40);
    } else if (aspect >= 1.1 && aspect <= 1.5) {
      propScore += 10;
    }

    if (r.type === "bathroom" || r.type === "attached_bath") {
      if (area > 50) propScore -= Math.round((area - 50) * 2);
      if (area >= 24 && area <= 42) propScore += 15;
    }
    if (r.type === "master_bedroom") {
      if (area >= 130) propScore += 20;
      if (r.width < 10.0) propScore -= 20;
    }
    if (r.type === "bedroom") {
      if (area >= 105 && area <= 165) propScore += 20;
      if (area > 175) propScore -= 25; // Penalize oversized secondary bedroom
      if (r.width < 9.0) propScore -= 20;
    }
    if (r.type === "living") {
      if (area >= 150) propScore += 20;
    }
  }

  // 5. Furniture Clearance Score (Priority 5)
  const candidateDoors = [
    ...generateDoors(rooms, 0),
    ...(hasUpperRooms ? generateDoors(rooms, 1) : []),
  ];
  const candidateFurn = [
    ...generateFurnitureForRooms(rooms, candidateDoors, 0),
    ...(hasUpperRooms ? generateFurnitureForRooms(rooms, candidateDoors, 1) : []),
  ];
  const furnValidation = validateFurnitureErgonomics(rooms, candidateDoors, candidateFurn);
  const furnScore = Math.round((furnValidation.score / 100) * 150);

  // 6. Adjacency Score (Priority 6: Hard constraint validation & soft architectural preference scoring)
  const gfRooms = rooms.filter((r) => r.floor === 0);
  const ffRooms = rooms.filter((r) => r.floor === 1);
  const adjEvalGf = evaluateAdjacency(gfRooms);
  const adjEvalFf = hasUpperRooms ? evaluateAdjacency(ffRooms) : { valid: true, score: 100, issues: [] };
  if (!adjEvalGf.valid || !adjEvalFf.valid) {
    return {
      breakdown: {
        requirementsComplianceScore: reqScore,
        geometricValidityScore: geoScore,
        circulationScore: 0,
        proportionScore: 0,
        furnitureClearanceScore: 0,
        adjacencyScore: 0,
        lightVentilationScore: 0,
        constructionEfficiencyScore: 0,
        vastuScore: 0,
        totalScore: -100000,
      },
      valid: false,
    };
  }
  const rawAdjScore = hasUpperRooms
    ? ((adjEvalGf.score || 100) + (adjEvalFf.score || 100)) / 2
    : adjEvalGf.score || 100;
  const adjScore = Math.round((rawAdjScore / 100) * 150);

  // 7. Light & Ventilation Score (Priority 7)
  let lightScore = 100;
  for (const r of rooms) {
    if (r.type === "bedroom" || r.type === "master_bedroom" || r.type === "living") {
      const hasExtEdge =
        Math.abs(r.x) < 0.1 ||
        Math.abs(r.y) < 0.1 ||
        Math.abs(r.x + r.width - plotW) < 0.1 ||
        Math.abs(r.y + r.height - plotL) < 0.1;
      if (hasExtEdge) lightScore += 15;
    }
    if (r.type === "bathroom") {
      const sharesOTS = rooms.some(
        (o) => o.type === "ots" &&
          (Math.abs(r.x + r.width - o.x) < 0.25 ||
            Math.abs(o.x + o.width - r.x) < 0.25 ||
            Math.abs(r.y + r.height - o.y) < 0.25 ||
            Math.abs(o.y + o.height - r.y) < 0.25)
      );
      if (sharesOTS) lightScore += 20;
    }
  }

  // 8. Construction Efficiency Score (Priority 8)
  let constScore = 80;
  const kitchen = rooms.find((r) => r.type === "kitchen");
  const masterBed = rooms.find((r) => r.type === "master_bedroom");
  const living = rooms.find((r) => r.type === "living");
  if (kitchen && commonBath) {
    const distKB = Math.hypot(kitchen.x - commonBath.x, kitchen.y - commonBath.y);
    if (distKB < 12.0) constScore += 25;
  }

  // 9. Vastu Score (Priority 9: Strict Opt-in Only)
  let vastuScore = 0;
  if (isVastu) {
    if (kitchen && kitchen.x >= plotW * 0.45 && kitchen.y <= plotL * 0.65) vastuScore += 20;
    if (masterBed && masterBed.y >= plotL * 0.55 && masterBed.x <= plotW * 0.55) vastuScore += 20;
    if (living && living.y <= plotL * 0.40) vastuScore += 15;
  }

  const totalScore =
    reqScore +
    geoScore +
    circScore +
    propScore +
    furnScore +
    adjScore +
    lightScore +
    constScore +
    vastuScore;

  const p4Score = calculateLayoutScore(rooms, req, variant, plotW, plotL);

  return {
    breakdown: {
      requirementsComplianceScore: reqScore,
      geometricValidityScore: geoScore,
      circulationScore: circScore,
      proportionScore: propScore,
      furnitureClearanceScore: furnScore,
      adjacencyScore: adjScore,
      lightVentilationScore: lightScore,
      constructionEfficiencyScore: constScore,
      vastuScore,
      totalScore,
      layoutScore: p4Score.score,
    },
    valid: true,
  };
}

// ---------------------------------------------------------------------------------
// MASTER GENERATOR: MULTI-CANDIDATE SELECTION
// ---------------------------------------------------------------------------------

export type SinglePlanResult = FloorPlan | (GenerationResult & { success: false });

export function generateSinglePlan(
  req: HouseRequirements,
  variant: LayoutStyleVariant
): SinglePlanResult {
  const plotW = req.plot.width;
  const plotL = req.plot.length;
  const isVastu = !!req.preferences?.vastu;
  const facing: CompassDirection = req.facing || "north";
  const isDuplex = req.floors >= 2;

  // Lightweight pre-generation screening check (Phase 1.1)
  const screening = validatePlanFeasibility(req);
  if (!screening.feasible) {
    return {
      success: false,
      infeasibility: screening,
    };
  }

  interface CandidatePlan {
    rooms: Room[];
    gfRooms: Room[];
    ffRooms: Room[];
    candidateIndex: number;
  }

  const candidatePlans: CandidatePlan[] = [];

  if (isDuplex) {
    const zoning = calculateFunctionalZoning(req, variant, 0);
    const circW = calculateCirculationWidth(plotW);
    const stairCandidates = generateStaircaseCandidates(
      plotW,
      plotL,
      zoning.usableStartDepth,
      zoning.frontPublicZone.height,
      zoning.midFamilyZone.height,
      circW,
      variant,
      req
    );

    const stairsToUse: (StaircaseCandidate | undefined)[] =
      stairCandidates.length > 0 ? stairCandidates : [undefined];

    for (const cIdx of [0, 1, 2]) {
      for (const stairCand of stairsToUse) {
        const gf = placeGroundRooms(req, variant, cIdx, stairCand);
        const ff = placeFirstFloorRooms(req, variant, gf, plotW, plotL, cIdx);
        candidatePlans.push({
          rooms: [...gf, ...ff],
          gfRooms: gf,
          ffRooms: ff,
          candidateIndex: cIdx,
        });
      }
    }
  } else {
    for (const cIdx of [0, 1, 2]) {
      const gf = placeGroundRooms(req, variant, cIdx);
      candidatePlans.push({
        rooms: gf,
        gfRooms: gf,
        ffRooms: [],
        candidateIndex: cIdx,
      });
    }
  }

  interface ValidCandidate {
    rooms: Room[];
    candidateIndex: number;
    score: number;
    breakdown: LayoutScoreBreakdown;
    layoutScore: LayoutScore;
  }

  const validCandidates: ValidCandidate[] = [];

  for (const cand of candidatePlans) {
    const allCandRooms = cand.rooms;

    // Stage 2: Geometric Validation (Non-overlap, bounds, minimum dimensions)
    let geoValid = true;
    for (const r of allCandRooms) {
      if (!roomWithinBounds(r, plotW, plotL) || r.width < 2.2 || r.height < 2.2) {
        geoValid = false;
        break;
      }
    }
    if (geoValid) {
      for (let i = 0; i < allCandRooms.length; i++) {
        for (let j = i + 1; j < allCandRooms.length; j++) {
          if (roomsOverlap(allCandRooms[i], allCandRooms[j])) {
            geoValid = false;
            break;
          }
        }
        if (!geoValid) break;
      }
    }
    if (!geoValid) {
      continue; // REJECT geometrically invalid candidate
    }

    // Stage 3: Requirements Validation across all floors
    const requestedBeds =
      req.rooms
        .filter((r) => r.type === "bedroom" || r.type === "master_bedroom")
        .reduce((sum, r) => sum + r.quantity, 0) || 2;
    const requestedBaths =
      req.rooms
        .filter((r) => r.type === "bathroom" || r.type === "attached_bath")
        .reduce((sum, r) => sum + r.quantity, 0) || 2;

    const actualBeds = allCandRooms.filter(
      (r) => r.type === "bedroom" || r.type === "master_bedroom"
    ).length;
    const actualBaths = allCandRooms.filter(
      (r) => r.type === "bathroom" || r.type === "attached_bath"
    ).length;
    const hasKitchen = allCandRooms.some((r) => r.type === "kitchen");
    const hasDining = allCandRooms.some((r) => r.type === "dining");
    const reqDining = req.rooms.some((r) => r.type === "dining");
    const hasParking = allCandRooms.some((r) => r.type === "parking");
    const reqParking = req.parking?.type && req.parking.type !== "none";
    const reqStairs = req.floors >= 2 || !!req.staircase;
    const hasStairs = allCandRooms.some((r) => r.type === "staircase");

    if (
      actualBeds < requestedBeds ||
      actualBaths < requestedBaths ||
      !hasKitchen ||
      (reqDining && !hasDining) ||
      (reqParking && !hasParking) ||
      (reqStairs && !hasStairs)
    ) {
      continue; // REJECT candidate failing mandatory requirements
    }

    // Stage 4: Hard Adjacency Validation
    const adjGf = evaluateAdjacency(cand.gfRooms);
    if (!adjGf.valid) {
      continue; // REJECT hard-invalid candidate
    }
    if (isDuplex) {
      const adjFf = evaluateAdjacency(cand.ffRooms);
      if (!adjFf.valid) {
        continue; // REJECT hard-invalid candidate
      }
    }

    // Stage 5: Vertical Core Compatibility Validation (Correction 3)
    if (isDuplex) {
      const vertConn = validateVerticalConnectivity(allCandRooms);
      if (!vertConn.valid) {
        continue; // REJECT vertically incompatible candidate
      }
    }

    // Stage 6: BFS Accessibility Validation
    const candDoors = [
      ...generateDoors(allCandRooms, 0),
      ...(isDuplex ? generateDoors(allCandRooms, 1) : []),
    ];
    const candWindows = [
      ...generateWindows(allCandRooms, plotW, plotL, 0),
      ...(isDuplex ? generateWindows(allCandRooms, plotW, plotL, 1) : []),
    ];
    const accessAudit = isDuplex
      ? auditDuplexAccessibility(allCandRooms, candDoors, candWindows)
      : auditPlanAccessibility(allCandRooms, candDoors, candWindows, 0);

    if (!accessAudit.allReachable) {
      continue; // REJECT candidate where rooms are unreachable
    }

    // Stage 7: Soft Architectural Scoring (only executed on surviving valid candidates!)
    const scoreResult = scoreCandidateLayout(allCandRooms, req, variant, plotW, plotL);
    const p4ScoreResult = calculateLayoutScore(
      allCandRooms,
      req,
      variant,
      plotW,
      plotL,
      candDoors,
      candWindows,
      accessAudit
    );

    if (scoreResult.valid && p4ScoreResult.valid) {
      validCandidates.push({
        rooms: allCandRooms,
        candidateIndex: cand.candidateIndex,
        score: p4ScoreResult.score.total,
        breakdown: {
          ...scoreResult.breakdown,
          layoutScore: p4ScoreResult.score,
        },
        layoutScore: p4ScoreResult.score,
      });
    }
  }

  // Reject and return structured failure if zero valid candidates survive
  if (validCandidates.length === 0) {
    return {
      success: false,
      infeasibility: {
        feasible: false,
        issues: [
          {
            code: "NO_VALID_CONCEPTUAL_LAYOUT",
            requirement: `${variant} layout generation`,
            message: `No valid conceptual layout could be generated for the supplied requirements. All candidate configurations failed geometric, programmatic, vertical core, or hard adjacency validation.`,
            severity: "error",
          },
        ],
        suggestedAlternatives: [
          "Convert to a G+1 Duplex (2 floors) to expand available footprint.",
          "Adjust plot size or reduce number of requested rooms.",
          "Relax strict room counts or allow compact room dimensions.",
        ],
      },
    };
  }

  // Deterministic candidate ranking and tie-breaking:
  // 1. Higher total score
  // 2. Lower total penalties
  // 3. Higher space efficiency
  // 4. Higher daylight/ventilation score
  // 5. Stable candidate index
  validCandidates.sort((a, b) => {
    if (Math.abs(b.layoutScore.total - a.layoutScore.total) > 0.05) {
      return b.layoutScore.total - a.layoutScore.total;
    }
    if (Math.abs(a.layoutScore.totalPenalties - b.layoutScore.totalPenalties) > 0.05) {
      return a.layoutScore.totalPenalties - b.layoutScore.totalPenalties;
    }
    if (Math.abs(b.layoutScore.components.spaceEfficiency - a.layoutScore.components.spaceEfficiency) > 0.05) {
      return b.layoutScore.components.spaceEfficiency - a.layoutScore.components.spaceEfficiency;
    }
    if (Math.abs(b.layoutScore.components.daylightVentilation - a.layoutScore.components.daylightVentilation) > 0.05) {
      return b.layoutScore.components.daylightVentilation - a.layoutScore.components.daylightVentilation;
    }
    return a.candidateIndex - b.candidateIndex;
  });

  const bestCandidate = validCandidates[0];
  const bestRooms = bestCandidate.rooms;
  const bestBreakdown = bestCandidate.breakdown;
  const bestLayoutScore = bestCandidate.layoutScore;
  const selectionReasons = bestLayoutScore.reasons;

  const allRooms = [...bestRooms];

  const walls = [
    ...generateWalls(allRooms, plotW, plotL, 0),
    ...(isDuplex ? generateWalls(allRooms, plotW, plotL, 1) : []),
  ];
  const doors = [
    ...generateDoors(allRooms, 0),
    ...(isDuplex ? generateDoors(allRooms, 1) : []),
  ];
  const windows = [
    ...generateWindows(allRooms, plotW, plotL, 0),
    ...(isDuplex ? generateWindows(allRooms, plotW, plotL, 1) : []),
  ];
  const columns = [
    ...generateColumns(allRooms, plotW, plotL, 0),
    ...(isDuplex ? generateColumns(allRooms, plotW, plotL, 1) : []),
  ];
  const dimensions = [
    ...generateDimensions(allRooms, 0),
    ...(isDuplex ? generateDimensions(allRooms, 1) : []),
  ];
  const furniture = [
    ...generateFurnitureForRooms(allRooms, doors, 0),
    ...(isDuplex ? generateFurnitureForRooms(allRooms, doors, 1) : []),
  ];

  // Conceptual setbacks and buildable envelope
  const setbacks = getConceptualSetbacks(plotW, plotL, req.floors, req.setbackAssumptions);
  const buildableEnvelope = calculateBuildableEnvelope(plotW, plotL, setbacks);

  // Authoritative master area calculation with deduplicated wall thickness
  const areas = calculateFloorPlanAreas(plotW, plotL, allRooms, walls, setbacks, req.floors);

  const planName = `${plotW}' × ${plotL}' — ${
    variant === "spacious"
      ? "Spacious Architectural Layout"
      : variant === "compact"
      ? "Compact Space-Optimized Layout"
      : "Practical Residential Layout"
  }`;

  const notes = [
    "Conceptual Floor Plan — For Planning & Estimation Only. Verify with a licensed architect/engineer before construction.",
    isVastu
      ? "Vastu-oriented (Opt-in preference applied. Conceptual layout only, not an official compliance certificate)"
      : "Optimized for practical circulation, room adjacency, and daylight/ventilation (Vastu disabled)",
    `Gross Enclosed Built-Up: ${areas.enclosedBuiltUpArea} sq ft (${areas.groundFloorEnclosedArea} sq ft Ground${
      isDuplex ? ` + ${areas.firstFloorEnclosedArea} sq ft First` : ""
    }) | Net Habitable Area: ${areas.netRoomArea} sq ft | Ground Coverage: ${areas.groundCoveragePct}%`,
    `Plot Area: ${areas.plotArea} sq ft | Parking: ${areas.parkingArea} sq ft | Porch: ${areas.porchArea} sq ft | OTS: ${areas.openToSkyArea} sq ft${
      areas.balconyArea > 0 ? ` | Balcony: ${areas.balconyArea} sq ft` : ""
    }`,
    ...(selectionReasons.length > 0
      ? [`Layout Quality: ${selectionReasons.slice(0, 2).join(" • ")}`]
      : []),
  ];

  const plan: FloorPlan = {
    id: `plan-${variant}-${Date.now()}`,
    name: planName,
    styleVariant: variant,
    isVastuOriented: isVastu,
    plot: {
      width: plotW,
      length: plotL,
      unit: "ft",
      setbacks: {
        front: setbacks.front,
        rear: setbacks.rear,
        left: setbacks.left,
        right: setbacks.right,
      },
    },
    buildableEnvelope,
    setbackAssumptions: setbacks,
    facing,
    totalBuiltUpArea: areas.totalBuiltUpArea,
    groundFloorArea: areas.groundFloorEnclosedArea,
    firstFloorArea: areas.firstFloorEnclosedArea,
    areas,
    scoreBreakdown: bestBreakdown,
    layoutScore: bestLayoutScore,
    selectionReasons,
    floorsCount: req.floors,
    rooms: allRooms,
    walls,
    doors,
    windows,
    columns,
    furniture,
    dimensions,
    metadata: {
      generatedAt: new Date().toISOString(),
      roomsCount: allRooms.length,
      plotArea: areas.plotArea,
      usableArea: areas.enclosedBuiltUpArea,
      efficiencyPct: areas.groundCoveragePct,
      notes,
    },
  };

  const validation = validateFloorPlan(plan, req);
  if (!validation.valid) {
    console.warn("Generated plan validation warnings:", validation.errors);
  }

  const accessAudit = auditPlanAccessibility(allRooms, doors, windows, 0);
  if (!accessAudit.allReachable) {
    console.warn("Generated plan accessibility warnings: unreachable rooms:", accessAudit.unreachableRooms);
  }

  return plan;
}

/**
 * Standard generator function returning an array of FloorPlan objects for all 3 variants.
 * Non-breaking API preservation for existing callers.
 * Employs an early pre-generation screening check (validatePlanFeasibility); returns empty array
 * if requirements are mathematically or physically infeasible.
 */
export function generateFloorPlans(requirements: HouseRequirements): FloorPlan[] {
  const feasibility = validatePlanFeasibility(requirements);
  if (!feasibility.feasible) {
    console.warn("Layout requirements infeasible (pre-generation screening check):", feasibility.issues);
    return [];
  }

  const variants: LayoutStyleVariant[] = ["spacious", "practical", "compact"];
  const plans: FloorPlan[] = [];
  for (const variant of variants) {
    const planOrFailure = generateSinglePlan(requirements, variant);
    if (planOrFailure && !("success" in planOrFailure)) {
      plans.push(planOrFailure);
    }
  }
  return plans;
}

/**
 * Phase 1 Safe Generator returning a structured GenerationResult.
 * Employs an early pre-generation screening check (validatePlanFeasibility).
 * If requirements cannot fit, returns structured infeasibility detailing what cannot fit,
 * why, which requirement caused the conflict, and suggested architectural alternatives.
 */
export function generateFloorPlanResult(
  requirements: HouseRequirements
): GenerationResult {
  const feasibility = validatePlanFeasibility(requirements);
  if (!feasibility.feasible) {
    return {
      success: false,
      infeasibility: feasibility,
    };
  }

  const variants: LayoutStyleVariant[] = ["spacious", "practical", "compact"];
  const plans: FloorPlan[] = [];
  let candidateFailure: FeasibilityResult | null = null;

  for (const variant of variants) {
    const planOrFailure = generateSinglePlan(requirements, variant);
    if (planOrFailure && !("success" in planOrFailure)) {
      plans.push(planOrFailure);
    } else if (planOrFailure && "success" in planOrFailure && !planOrFailure.success) {
      if (!candidateFailure) {
        candidateFailure = planOrFailure.infeasibility;
      }
    }
  }

  if (plans.length === 0 || candidateFailure) {
    return {
      success: false,
      infeasibility: candidateFailure || {
        feasible: false,
        issues: [
          {
            code: "NO_VALID_CONCEPTUAL_LAYOUT",
            requirement: "All architectural candidates",
            message: "No valid conceptual layout could be generated for the supplied requirements.",
            severity: "error",
          },
        ],
        suggestedAlternatives: [
          "Convert to a G+1 Duplex (2 floors) to expand available footprint.",
          "Adjust plot size or reduce number of requested rooms.",
        ],
      },
    };
  }

  // Verify that all generated plans meet mandatory requirements
  for (const plan of plans) {
    const val = validateFloorPlan(plan, requirements);
    if (!val.valid && (val.missingRequirements.length > 0 || val.boundaryViolations.length > 0)) {
      return {
        success: false,
        infeasibility: {
          feasible: false,
          issues: [
            ...val.missingRequirements.map((m) => ({
              code: "MISSING_REQUIRED_ROOM",
              requirement: m,
              message: m,
              severity: "error" as const,
            })),
            ...val.boundaryViolations.map((b) => ({
              code: "BOUNDARY_VIOLATION",
              requirement: "Plot boundaries",
              message: b,
              severity: "error" as const,
            })),
          ],
          suggestedAlternatives: [
            "Convert to a G+1 Duplex (2 floors) to expand available footprint.",
            "Adjust plot size or reduce number of requested rooms.",
          ],
        },
      };
    }
  }

  return {
    success: true,
    plans,
  };
}
