import {
  Column,
  CompassDirection,
  DimensionLabel,
  Door,
  FloorPlan,
  GenerationResult,
  HouseRequirements,
  LayoutStyleVariant,
  LayoutScoreBreakdown,
  Room,
  RoomType,
  StaircaseDetails,
  Wall,
  Window,
} from "./types";
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
import { auditPlanAccessibility } from "./planning/accessibility";

// Wall thickness constants (in feet)
const EXT_WALL = 0.75; // 9 inch external masonry wall
const INT_WALL = 0.38; // 4.5 inch interior partition brick wall

// Color palette for professional residential architectural floor plan
const ROOM_COLORS: Record<RoomType, string> = {
  living: "#fefce8",        // Warm Off-White / Light Cream
  dining: "#fffbeb",        // Soft Ivory
  kitchen: "#fff7ed",       // Light Bisque
  master_bedroom: "#f8fafc",// Crisp Off-White Architectural Fill
  bedroom: "#f8fafc",       // Crisp Off-White Architectural Fill
  bathroom: "#f0fdfa",      // Soft Teal / Mint
  attached_bath: "#f0fdfa", // Soft Teal / Mint
  parking: "#f8fafc",       // Slate Paver Tile Fill
  staircase: "#f1f5f9",     // Slate 100
  balcony: "#ecfdf5",       // Emerald Tint
  utility: "#f8fafc",       // Utility Gray
  passage: "#ffffff",       // Pure White
  pooja: "#faf5ff",         // Soft Lavender
  verandah: "#f8fafc",      // Off-White Porch
  ots: "#f0fdf4",           // Open To Sky Garden / Lightwell Tint
};

export function formatFeetInches(val: number): string {
  const rounded = Math.round(val * 2) / 2;
  const ft = Math.floor(rounded);
  const inches = Math.round((rounded - ft) * 12);
  if (inches === 0) return `${ft}'0"`;
  return `${ft}'${inches}"`;
}

/**
 * Calculates realistic staircase geometry based on available footprint, floor-to-floor height,
 * riser/tread requirements, landing requirements, and circulation.
 * Floor-to-floor height = 10'0" (120 inches).
 * Standard riser = 7.0"–7.5" -> 16 to 17 risers.
 * Standard tread = 10" (0.833 ft).
 */
export function calculateStaircaseGeometry(
  width: number,
  height: number,
  floorToFloorHeight = 10.0
): StaircaseDetails {
  const totalHeightInches = floorToFloorHeight * 12;
  const targetRiserInches = 7.06; // 120 / 17 = 7.06"
  const totalRisers = Math.round(totalHeightInches / targetRiserInches); // 17 risers
  const totalTreads = totalRisers - 1; // 16 treads
  const treadDepth = 0.833; // 10 inches

  const canBeDogLeg = width >= 5.6 && height >= 9.0;
  const canBeStraight = height >= 14.0 && width >= 3.0;

  if (canBeDogLeg && (!canBeStraight || width >= 5.8)) {
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

  const actualBeds = rooms.filter((r) => r.type === "bedroom" || r.type === "master_bedroom").length;
  const actualBaths = rooms.filter((r) => r.type === "bathroom" || r.type === "attached_bath").length;
  const hasKitchen = rooms.some((r) => r.type === "kitchen");
  const hasDining = rooms.some((r) => r.type === "dining");
  const hasParking = rooms.some((r) => r.type === "parking");
  const reqParking = req.parking?.type && req.parking.type !== "none";
  const reqStairs = req.floors >= 2 || !!req.staircase;
  const hasStairs = rooms.some((r) => r.type === "staircase");

  if (actualBeds < requestedBeds) reqScore = 0;
  if (actualBaths < requestedBaths) reqScore = 0;
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
    if (r.width < 2.5 || r.height < 2.5) {
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
  const candidateDoors = generateDoors(rooms, 0);
  const candidateFurn = generateFurnitureForRooms(rooms, candidateDoors, 0);
  const furnValidation = validateFurnitureErgonomics(rooms, candidateDoors, candidateFurn);
  const furnScore = Math.round((furnValidation.score / 100) * 150);

  // 6. Adjacency Score (Priority 6)
  let adjScore = 150;
  const living = rooms.find((r) => r.type === "living");
  const dining = rooms.find((r) => r.type === "dining");
  const kitchen = rooms.find((r) => r.type === "kitchen");
  const masterBed = rooms.find((r) => r.type === "master_bedroom");
  const attBath = rooms.find((r) => r.type === "attached_bath");
  const utility = rooms.find((r) => r.type === "utility");

  if (living && dining) {
    const adjLD =
      Math.abs(living.x + living.width - dining.x) < 0.25 ||
      Math.abs(dining.x + dining.width - living.x) < 0.25 ||
      Math.abs(living.y + living.height - dining.y) < 0.25;
    if (adjLD) adjScore += 30;
  }
  if (dining && kitchen) {
    const adjDK =
      Math.abs(dining.x + dining.width - kitchen.x) < 0.25 ||
      Math.abs(kitchen.x + kitchen.width - dining.x) < 0.25 ||
      Math.abs(dining.y + dining.height - kitchen.y) < 0.25;
    if (adjDK) adjScore += 30;
  }
  if (kitchen && utility) {
    const adjKU =
      Math.abs(kitchen.x + kitchen.width - utility.x) < 0.25 ||
      Math.abs(utility.x + utility.width - kitchen.x) < 0.25 ||
      Math.abs(kitchen.y + kitchen.height - utility.y) < 0.25 ||
      Math.abs(utility.y + utility.height - kitchen.y) < 0.25;
    if (adjKU) adjScore += 25;
  }
  if (masterBed && attBath) {
    const adjMB =
      Math.abs(masterBed.x + masterBed.width - attBath.x) < 0.25 ||
      Math.abs(attBath.x + attBath.width - masterBed.x) < 0.25 ||
      Math.abs(masterBed.y + masterBed.height - attBath.y) < 0.25 ||
      Math.abs(attBath.y + attBath.height - masterBed.y) < 0.25;
    if (adjMB) adjScore += 35;
    else adjScore -= 80;
  }

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
    },
    valid: true,
  };
}

// ---------------------------------------------------------------------------------
// PROCEDURAL ARCHETYPE GENERATORS
// ---------------------------------------------------------------------------------

function generateGroundRoomsForArchetype(
  req: HouseRequirements,
  variant: LayoutStyleVariant,
  candidateIdx: number
): Room[] {
  return placeGroundRooms(req, variant, candidateIdx);
}

function generateFirstFloorRooms(
  req: HouseRequirements,
  frontDepth: number,
  plotW: number,
  plotL: number
): Room[] {
  const isVastu = !!req.preferences?.vastu;
  const totalBeds =
    req.rooms
      .filter((r) => r.type === "bedroom" || r.type === "master_bedroom")
      .reduce((sum, r) => sum + r.quantity, 0) || 3;

  const rooms: Room[] = [];
  let roomId = 200;

  const balconyH = Math.min(10, Math.max(7, frontDepth > 0 ? frontDepth : 8));

  if (req.balcony !== false) {
    rooms.push({
      id: `r-${roomId++}`,
      name: "Front Sky Terrace & Balcony",
      type: "balcony",
      x: 0,
      y: 0,
      width: plotW,
      height: balconyH,
      floor: 1,
      color: ROOM_COLORS.balcony,
    });
  }

  const ffStartY = req.balcony !== false ? balconyH : 0;
  const ffUsableL = plotL - ffStartY;
  const loungeH = Math.round(ffUsableL * 0.35 * 2) / 2;
  const rearH = ffUsableL - loungeH;

  const loungeW = Math.round(plotW * 0.60 * 2) / 2;
  const upperStairW = plotW - loungeW;

  rooms.push({
    id: `r-${roomId++}`,
    name: "Upper Family Lounge",
    type: "living",
    x: 0,
    y: ffStartY,
    width: loungeW,
    height: loungeH,
    floor: 1,
    color: ROOM_COLORS.living,
  });

  const stairGeom = calculateStaircaseGeometry(upperStairW, loungeH);
  rooms.push({
    id: `r-${roomId++}`,
    name: "Staircase Landing",
    type: "staircase",
    x: loungeW,
    y: ffStartY,
    width: upperStairW,
    height: loungeH,
    floor: 1,
    color: ROOM_COLORS.staircase,
    staircaseDetails: stairGeom,
  });

  const rearY = ffStartY + loungeH;
  const halfW = Math.round(plotW * 0.5 * 2) / 2;
  const reqBaths =
    req.rooms
      .filter((r) => r.type === "bathroom" || r.type === "attached_bath")
      .reduce((sum, r) => sum + r.quantity, 0) || 2;

  const bathH = reqBaths >= 3 && rearH >= 13 ? 5.5 : 0;
  const mBedH = rearH - bathH;

  rooms.push({
    id: `r-${roomId++}`,
    name: "Master Bedroom Suite",
    type: "master_bedroom",
    x: 0,
    y: rearY,
    width: halfW,
    height: mBedH,
    floor: 1,
    color: ROOM_COLORS.master_bedroom,
    isVastuAligned: isVastu,
  });

  if (bathH > 0) {
    const bathW = Math.min(8.0, Math.max(5.5, halfW * 0.45));
    rooms.push({
      id: `r-${roomId++}`,
      name: "Attached Bath (Master)",
      type: "attached_bath",
      x: 0,
      y: rearY + mBedH,
      width: bathW,
      height: bathH,
      floor: 1,
      color: ROOM_COLORS.attached_bath,
    });

    rooms.push({
      id: `r-${roomId++}`,
      name: "Private Rear Balcony",
      type: "balcony",
      x: bathW,
      y: rearY + mBedH,
      width: halfW - bathW,
      height: bathH,
      floor: 1,
      color: ROOM_COLORS.balcony,
    });
  }

  rooms.push({
    id: `r-${roomId++}`,
    name: totalBeds >= 4 ? "Bedroom 4" : "Bedroom 3",
    type: "bedroom",
    x: halfW,
    y: rearY,
    width: plotW - halfW,
    height: mBedH,
    floor: 1,
    color: ROOM_COLORS.bedroom,
  });

  if (bathH > 0) {
    const bed2W = plotW - halfW;
    const bath2W = Math.min(8.0, Math.max(5.5, bed2W * 0.45));

    if (reqBaths >= 3) {
      rooms.push({
        id: `r-${roomId++}`,
        name: "Attached Bath 2",
        type: "attached_bath",
        x: halfW,
        y: rearY + mBedH,
        width: bath2W,
        height: bathH,
        floor: 1,
        color: ROOM_COLORS.attached_bath,
      });

      rooms.push({
        id: `r-${roomId++}`,
        name: "Rear Sit-Out Terrace",
        type: "balcony",
        x: halfW + bath2W,
        y: rearY + mBedH,
        width: bed2W - bath2W,
        height: bathH,
        floor: 1,
        color: ROOM_COLORS.balcony,
      });
    } else {
      rooms.push({
        id: `r-${roomId++}`,
        name: "Rear Sit-Out Terrace",
        type: "balcony",
        x: halfW,
        y: rearY + mBedH,
        width: bed2W,
        height: bathH,
        floor: 1,
        color: ROOM_COLORS.balcony,
      });
    }
  }

  return rooms;
}

// ---------------------------------------------------------------------------------
// MASTER GENERATOR: MULTI-CANDIDATE SELECTION
// ---------------------------------------------------------------------------------

export function generateSinglePlan(
  req: HouseRequirements,
  variant: LayoutStyleVariant
): FloorPlan {
  const plotW = req.plot.width;
  const plotL = req.plot.length;
  const isVastu = !!req.preferences?.vastu;
  const facing: CompassDirection = req.facing || "north";
  const isDuplex = req.floors >= 2;

  const candidateIndices = [0, 1, 2];
  let bestRooms: Room[] = [];
  let bestScore = -Infinity;
  let bestBreakdown: LayoutScoreBreakdown | undefined;

  for (const cIdx of candidateIndices) {
    const gfRooms = generateGroundRoomsForArchetype(req, variant, cIdx);
    const scoreResult = scoreCandidateLayout(gfRooms, req, variant, plotW, plotL);

    if (scoreResult.valid && scoreResult.breakdown.totalScore > bestScore) {
      bestScore = scoreResult.breakdown.totalScore;
      bestRooms = gfRooms;
      bestBreakdown = scoreResult.breakdown;
    }
  }

  if (bestRooms.length === 0) {
    bestRooms = generateGroundRoomsForArchetype(req, variant, 0);
  }

  let allRooms = [...bestRooms];
  if (isDuplex) {
    const frontVerandah = bestRooms.find((r) => r.type === "verandah" || r.type === "parking");
    const frontDepth = frontVerandah ? frontVerandah.height : 8.0;
    const ffRooms = generateFirstFloorRooms(req, frontDepth, plotW, plotL);
    allRooms = [...bestRooms, ...ffRooms];
  }

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
  return variants.map((variant) => generateSinglePlan(requirements, variant));
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
  const plans = variants.map((variant) => generateSinglePlan(requirements, variant));

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
