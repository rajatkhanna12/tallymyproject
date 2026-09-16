import { generateFloorPlans, generateFloorPlanResult, generateSinglePlan } from "./layout-engine";
import { normalizeRequirements } from "./parser";
import { HouseRequirements, LayoutStyleVariant, Room } from "./types";
import {
  roomsOverlap,
  roomWithinBounds,
  validateRequiredRooms,
  validateRequiredBedrooms,
  validateRequiredBathrooms,
} from "./validation";
import { validateAreaConsistency, calculateNetRoomArea } from "./geometry";
import { getSharedWallLength } from "./planning/adjacency";
import {
  auditDuplexAccessibility,
  validateVerticalConnectivity,
} from "./planning/accessibility";
import {
  calculateStaircaseGeometry,
  generateStaircaseCandidates,
} from "./planning/staircase";
import { calculateFunctionalZoning } from "./planning/zoning";
import { calculateCirculationWidth } from "./planning/circulation";

// =================================================================================
// PHASE 3 STAIRCASE & G+1 / DUPLEX PLANNING ENGINE TEST SUITE
// =================================================================================

interface BenchmarkCase {
  name: string;
  req: HouseRequirements;
}

const duplexBenchmarkCases: BenchmarkCase[] = [
  {
    name: "20 x 50 — 2BHK G+1",
    req: normalizeRequirements({
      plot: { width: 20, length: 50, unit: "ft" },
      floors: 2,
      rooms: [
        { type: "living", quantity: 1 },
        { type: "kitchen", quantity: 1 },
        { type: "bedroom", quantity: 2 },
        { type: "bathroom", quantity: 2 },
        { type: "dining", quantity: 1 },
      ],
      parking: { type: "bike", quantity: 2 },
      staircase: true,
      balcony: true,
    }),
  },
  {
    name: "23 x 50 — 2BHK G+1",
    req: normalizeRequirements({
      plot: { width: 23, length: 50, unit: "ft" },
      floors: 2,
      rooms: [
        { type: "living", quantity: 1 },
        { type: "kitchen", quantity: 1 },
        { type: "bedroom", quantity: 2 },
        { type: "bathroom", quantity: 2 },
        { type: "dining", quantity: 1 },
      ],
      parking: { type: "bike", quantity: 2 },
      kitchen: { openToDining: true },
      staircase: true,
      balcony: true,
    }),
  },
  {
    name: "25 x 50 — 3BHK G+1",
    req: normalizeRequirements({
      plot: { width: 25, length: 50, unit: "ft" },
      floors: 2,
      rooms: [
        { type: "living", quantity: 1 },
        { type: "kitchen", quantity: 1 },
        { type: "bedroom", quantity: 3 },
        { type: "bathroom", quantity: 3 },
        { type: "dining", quantity: 1 },
      ],
      parking: { type: "car", quantity: 1 },
      staircase: true,
      balcony: true,
    }),
  },
  {
    name: "30 x 50 — 3BHK G+1",
    req: normalizeRequirements({
      plot: { width: 30, length: 50, unit: "ft" },
      floors: 2,
      rooms: [
        { type: "living", quantity: 1 },
        { type: "kitchen", quantity: 1 },
        { type: "bedroom", quantity: 3 },
        { type: "bathroom", quantity: 3 },
        { type: "dining", quantity: 1 },
      ],
      parking: { type: "car", quantity: 1 },
      staircase: true,
      balcony: true,
    }),
  },
  {
    name: "30 x 60 — 3BHK duplex (G+1)",
    req: normalizeRequirements({
      plot: { width: 30, length: 60, unit: "ft" },
      floors: 2,
      rooms: [
        { type: "living", quantity: 1 },
        { type: "kitchen", quantity: 1 },
        { type: "bedroom", quantity: 3 },
        { type: "bathroom", quantity: 3 },
        { type: "dining", quantity: 1 },
      ],
      parking: { type: "car", quantity: 1 },
      staircase: true,
      balcony: true,
    }),
  },
  {
    name: "40 x 60 — 4BHK duplex (G+1)",
    req: normalizeRequirements({
      plot: { width: 40, length: 60, unit: "ft" },
      floors: 2,
      rooms: [
        { type: "living", quantity: 1 },
        { type: "kitchen", quantity: 1 },
        { type: "bedroom", quantity: 4 },
        { type: "bathroom", quantity: 4 },
        { type: "dining", quantity: 1 },
      ],
      parking: { type: "car", quantity: 1 },
      staircase: true,
      balcony: true,
    }),
  },
];

let totalAssertions = 0;
let passedAssertions = 0;

function assert(condition: boolean, message: string) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
  } else {
    console.error(`  ❌ ASSERTION FAILED: ${message}`);
  }
}

console.log("===============================================================================");
console.log("PHASE 3 STAIRCASE & G+1 / DUPLEX PLANNING ENGINE TEST SUITE");
console.log("===============================================================================\n");

// ---------------------------------------------------------------------------------
// PART 1: 6 DUPLEX BENCHMARKS ACROSS ALL 3 VARIANTS
// ---------------------------------------------------------------------------------
console.log("▶ PART 1: Duplex Benchmark Cases across Spacious, Practical, Compact");

const variants: LayoutStyleVariant[] = ["spacious", "practical", "compact"];

for (const bm of duplexBenchmarkCases) {
  console.log(`\n-------------------------------------------------------------------------------`);
  console.log(`Testing Duplex Benchmark: [${bm.name}]`);
  console.log(`-------------------------------------------------------------------------------`);

  for (const variant of variants) {
    const planResult = generateSinglePlan(bm.req, variant);
    assert(Boolean(planResult && !("success" in planResult)), `[${variant}] G+1 plan generated successfully`);
    if (!planResult || "success" in planResult) continue;
    const plan = planResult;

    // Must have rooms on both Floor 0 and Floor 1
    const gfRooms = plan.rooms.filter((r) => r.floor === 0);
    const ffRooms = plan.rooms.filter((r) => r.floor === 1);
    assert(gfRooms.length > 0, `[${variant}] Ground floor contains rooms (${gfRooms.length} rooms)`);
    assert(ffRooms.length > 0, `[${variant}] First floor contains rooms (${ffRooms.length} rooms)`);

    // 1. Geometric Non-Overlap Check (Strict 0-tolerance per floor)
    for (let f = 0; f < 2; f++) {
      const flRooms = plan.rooms.filter((r) => r.floor === f);
      for (let i = 0; i < flRooms.length; i++) {
        for (let j = i + 1; j < flRooms.length; j++) {
          const rA = flRooms[i];
          const rB = flRooms[j];
          const overlaps = roomsOverlap(rA, rB);
          assert(!overlaps, `[${variant} Fl:${f}] No overlap between "${rA.name}" and "${rB.name}"`);
        }
      }
    }

    // 2. Plot Boundary Compliance
    for (const r of plan.rooms) {
      const inBounds = roomWithinBounds(r, bm.req.plot.width, bm.req.plot.length);
      assert(inBounds, `[${variant} Fl:${r.floor}] Room "${r.name}" (${r.x},${r.y},${r.width}x${r.height}) within plot bounds`);
    }

    // 3. Program Completeness & Requirement Preservation
    const reqValidation = validateRequiredRooms(plan.rooms, bm.req);
    assert(reqValidation.valid, `[${variant}] Required rooms present: ${reqValidation.missing.join(", ")}`);

    const reqBeds = bm.req.rooms.filter((r) => r.type === "bedroom" || r.type === "master_bedroom").reduce((sum, r) => sum + r.quantity, 0) || 1;
    const bedValid = validateRequiredBedrooms(plan.rooms, reqBeds);
    assert(bedValid, `[${variant}] Bedroom count satisfied (${reqBeds} requested)`);

    const reqBaths = bm.req.rooms.filter((r) => r.type === "bathroom" || r.type === "attached_bath").reduce((sum, r) => sum + r.quantity, 0) || 1;
    const bathValid = validateRequiredBathrooms(plan.rooms, reqBaths);
    assert(bathValid, `[${variant}] Bathroom count satisfied (${reqBaths} requested)`);

    // Explicit dining preservation
    const explicitDiningRequested = bm.req.rooms.some((r) => r.type === "dining");
    if (explicitDiningRequested) {
      const diningExists = plan.rooms.some((r) => r.type === "dining");
      assert(diningExists, `[${variant}] Explicitly requested dining room preserved`);
    }

    // Balcony preservation
    if (bm.req.balcony) {
      const balconyExists = ffRooms.some((r) => r.type === "balcony");
      assert(balconyExists, `[${variant}] First floor contains balcony`);
    }

    // Staircase presence on both floors
    const gfStair = gfRooms.find((r) => r.type === "staircase");
    const ffStair = ffRooms.find((r) => r.type === "staircase");
    assert(Boolean(gfStair), `[${variant}] Ground floor contains staircase`);
    assert(Boolean(ffStair), `[${variant}] First floor contains staircase/landing`);

    // 4. Vertical Core Consistency & Geometric Alignment
    assert(Boolean(gfStair?.verticalCoreId), `[${variant}] GF staircase has verticalCoreId`);
    assert(Boolean(ffStair?.verticalCoreId), `[${variant}] FF staircase has verticalCoreId`);
    assert(gfStair?.verticalCoreId === ffStair?.verticalCoreId, `[${variant}] Matching verticalCoreId across floors ("${gfStair?.verticalCoreId}")`);

    const vertConn = validateVerticalConnectivity(plan.rooms);
    assert(vertConn.valid, `[${variant}] validateVerticalConnectivity passed: ${vertConn.reason}`);

    // 5. Multi-Floor Door Connectivity & BFS Accessibility
    const duplexAccess = auditDuplexAccessibility(plan.rooms, plan.doors, plan.windows);
    assert(duplexAccess.allReachable, `[${variant}] Multi-floor BFS accessibility passed. All rooms reachable from entry.`);
    if (!duplexAccess.allReachable) {
      console.error(`  Unreachable duplex rooms [${variant}]:`, duplexAccess.unreachableRooms);
    }

    // 6. Master Bedroom <-> Attached Bath Geometric Adjacency
    for (let f = 0; f < 2; f++) {
      const flRooms = plan.rooms.filter((r) => r.floor === f);
      const masterBed = flRooms.find((r) => r.type === "master_bedroom");
      const attBath = flRooms.find((r) => r.type === "attached_bath");
      if (masterBed && attBath) {
        const sharedWall = getSharedWallLength(masterBed, attBath);
        assert(sharedWall >= 2.5, `[${variant} Fl:${f}] Master bed and attached bath share wall (len=${sharedWall.toFixed(1)}ft)`);
      }
    }

    // 7. Area Model Verification
    assert(!!plan.areas, `[${variant}] Plan contains calculated areas`);
    if (plan.areas) {
      const areaCheck = validateAreaConsistency(plan.areas);
      assert(areaCheck.valid, `[${variant}] Area consistency valid: ${areaCheck.errors.join(", ")}`);
      assert(plan.areas.enclosedBuiltUpArea > plan.areas.netRoomArea, `[${variant}] Gross area (${plan.areas.enclosedBuiltUpArea}) > Net carpet (${plan.areas.netRoomArea})`);
    }
  }

  // Verify generateFloorPlans returns 3 variants for this benchmark
  const allVariants = generateFloorPlans(bm.req);
  assert(allVariants.length === 3, `generateFloorPlans returns 3 variants for ${bm.name}`);
}

// ---------------------------------------------------------------------------------
// PART 2: STAIRCASE CANDIDATES & ARCHITECTURAL GEOMETRY RULES
// ---------------------------------------------------------------------------------
console.log("\n▶ PART 2: Staircase Geometry & Candidate Generation Verification");

// Test calculateStaircaseGeometry
const dogLegGeom = calculateStaircaseGeometry(6.5, 10.0, "dog_leg");
assert(dogLegGeom.totalRisers >= 15 && dogLegGeom.totalRisers <= 18, `Dog-leg riser count in valid range: ${dogLegGeom.totalRisers}`);
assert(dogLegGeom.riserHeight <= 7.5, `Dog-leg riser height <= 7.5" (${dogLegGeom.riserHeight}")`);
assert(dogLegGeom.treadDepth >= 0.8, `Dog-leg tread depth >= 10" (0.833ft) (${dogLegGeom.treadDepth}ft)`);
assert(dogLegGeom.flightWidth >= 3.0, `Dog-leg flight width >= 3.0ft (${dogLegGeom.flightWidth}ft)`);
assert(dogLegGeom.landingWidth >= 6.0, `Dog-leg landing width >= 6.0ft (${dogLegGeom.landingWidth}ft)`);
assert(dogLegGeom.landingDepth >= 2.8, `Dog-leg landing depth >= 2.8ft (${dogLegGeom.landingDepth}ft)`);

const straightGeom = calculateStaircaseGeometry(3.5, 14.0, "straight");
assert(straightGeom.totalRisers >= 15 && straightGeom.totalRisers <= 18, `Straight stair riser count in valid range: ${straightGeom.totalRisers}`);
assert(straightGeom.riserHeight <= 7.5, `Straight stair riser height <= 7.5" (${straightGeom.riserHeight}")`);
assert(straightGeom.treadDepth >= 0.8, `Straight stair tread depth >= 10" (${straightGeom.treadDepth}ft)`);
assert(straightGeom.flightWidth >= 3.0, `Straight stair flight width >= 3.0ft (${straightGeom.flightWidth}ft)`);

const lShapedGeom = calculateStaircaseGeometry(7.0, 8.5, "l_shaped");
assert(lShapedGeom.totalRisers >= 15 && lShapedGeom.totalRisers <= 18, `L-shaped stair riser count in valid range: ${lShapedGeom.totalRisers}`);
assert(lShapedGeom.riserHeight <= 7.5, `L-shaped stair riser height <= 7.5" (${lShapedGeom.riserHeight}")`);
assert(lShapedGeom.flightWidth >= 3.0, `L-shaped stair flight width >= 3.0ft (${lShapedGeom.flightWidth}ft)`);

// Test generateStaircaseCandidates
const sampleReq = duplexBenchmarkCases[4].req; // 30x60
const zoning = calculateFunctionalZoning(sampleReq, "spacious", 0);
const circW = calculateCirculationWidth(30);
const candidates = generateStaircaseCandidates(
  30,
  60,
  zoning.usableStartDepth,
  zoning.frontPublicZone.height,
  zoning.midFamilyZone.height,
  circW,
  "spacious",
  sampleReq
);

assert(candidates.length >= 2, `generateStaircaseCandidates generated >= 2 candidates (${candidates.length} generated)`);
for (const cand of candidates) {
  assert(cand.width >= 3.0, `Stair candidate "${cand.type}" width >= 3.0ft (${cand.width}ft)`);
  assert(cand.height >= 7.5, `Stair candidate "${cand.type}" height >= 7.5ft (${cand.height}ft)`);
  assert(cand.x >= 0 && cand.x + cand.width <= 30, `Stair candidate within plot width bounds`);
  assert(cand.y >= 0 && cand.y + cand.height <= 60, `Stair candidate within plot length bounds`);
  assert(Boolean(cand.verticalCoreId), `Stair candidate has verticalCoreId ("${cand.verticalCoreId}")`);
  assert(cand.details.riserHeight <= 7.5, `Stair candidate riser height <= 7.5"`);
}

// ---------------------------------------------------------------------------------
// PART 3: VERTICAL CONNECTIVITY & ALIGNMENT VALIDATION
// ---------------------------------------------------------------------------------
console.log("\n▶ PART 3: Vertical Connectivity & Geometric Alignment Validation");

// 3.1 Identical Footprint
const validIdenticalRooms: Room[] = [
  {
    id: "stair-gf",
    name: "Staircase",
    type: "staircase",
    x: 10,
    y: 15,
    width: 6.5,
    height: 10.0,
    floor: 0,
    color: "#f5f5f5",
    verticalCoreId: "core-1",
  },
  {
    id: "stair-ff",
    name: "Staircase Landing",
    type: "staircase",
    x: 10,
    y: 15,
    width: 6.5,
    height: 10.0,
    floor: 1,
    color: "#f5f5f5",
    verticalCoreId: "core-1",
  },
];
const resIdentical = validateVerticalConnectivity(validIdenticalRooms);
assert(resIdentical.valid, "Identical footprint staircase passes vertical connectivity");

// 3.2 Compatible Non-Identical Landing Footprint (Different length, but >= 45% overlap, centerline offset <= 2.5')
const validNonIdenticalRooms: Room[] = [
  {
    id: "stair-gf",
    name: "Staircase",
    type: "staircase",
    x: 10,
    y: 15,
    width: 6.5,
    height: 10.0,
    floor: 0,
    color: "#f5f5f5",
    verticalCoreId: "core-1",
  },
  {
    id: "stair-ff",
    name: "Staircase Landing",
    type: "staircase",
    x: 10.5,
    y: 16,
    width: 6.5,
    height: 8.5,
    floor: 1,
    color: "#f5f5f5",
    verticalCoreId: "core-1",
  },
];
const resNonIdentical = validateVerticalConnectivity(validNonIdenticalRooms);
assert(resNonIdentical.valid, "Compatible non-identical upper landing passes vertical connectivity");

// 3.3 Missing Staircase on Upper Floor
const missingUpperRooms: Room[] = [
  {
    id: "stair-gf",
    name: "Staircase",
    type: "staircase",
    x: 10,
    y: 15,
    width: 6.5,
    height: 10.0,
    floor: 0,
    color: "#f5f5f5",
    verticalCoreId: "core-1",
  },
  {
    id: "bed-ff",
    name: "Bedroom 1",
    type: "bedroom",
    x: 10,
    y: 15,
    width: 12,
    height: 14,
    floor: 1,
    color: "#ffffff",
  },
];
const resMissingUpper = validateVerticalConnectivity(missingUpperRooms);
assert(!resMissingUpper.valid, "Missing staircase on first floor fails vertical connectivity");

// 3.4 Mismatched Vertical Core IDs
const mismatchedCoreRooms: Room[] = [
  {
    id: "stair-gf",
    name: "Staircase",
    type: "staircase",
    x: 10,
    y: 15,
    width: 6.5,
    height: 10.0,
    floor: 0,
    color: "#f5f5f5",
    verticalCoreId: "core-1",
  },
  {
    id: "stair-ff",
    name: "Staircase Landing",
    type: "staircase",
    x: 10,
    y: 15,
    width: 6.5,
    height: 10.0,
    floor: 1,
    color: "#f5f5f5",
    verticalCoreId: "core-2",
  },
];
const resMismatchedCore = validateVerticalConnectivity(mismatchedCoreRooms);
assert(!resMismatchedCore.valid, "Mismatched verticalCoreId fails vertical connectivity");

// 3.5 Geometrically Disconnected Staircase (Completely different location)
const disconnectedRooms: Room[] = [
  {
    id: "stair-gf",
    name: "Staircase",
    type: "staircase",
    x: 2,
    y: 10,
    width: 6.5,
    height: 10.0,
    floor: 0,
    color: "#f5f5f5",
    verticalCoreId: "core-1",
  },
  {
    id: "stair-ff",
    name: "Staircase Landing",
    type: "staircase",
    x: 20,
    y: 35,
    width: 6.5,
    height: 10.0,
    floor: 1,
    color: "#f5f5f5",
    verticalCoreId: "core-1",
  },
];
const resDisconnected = validateVerticalConnectivity(disconnectedRooms);
assert(!resDisconnected.valid, "Geometrically disconnected staircase fails vertical connectivity");

// ---------------------------------------------------------------------------------
// PART 4: ADAPTIVE ROOM DISTRIBUTION (NOT RIGID TEMPLATES)
// ---------------------------------------------------------------------------------
console.log("\n▶ PART 4: Adaptive Room Distribution Verification");

// Test 2BHK on 20x50 plot vs 4BHK on 40x60 plot
const plan2BHK = generateSinglePlan(duplexBenchmarkCases[0].req, "practical");
assert(Boolean(plan2BHK && !("success" in plan2BHK)), "2BHK G+1 generated successfully");
if (plan2BHK && !("success" in plan2BHK)) {
  const gfBeds = plan2BHK.rooms.filter((r) => r.floor === 0 && (r.type === "bedroom" || r.type === "master_bedroom")).length;
  const ffBeds = plan2BHK.rooms.filter((r) => r.floor === 1 && (r.type === "bedroom" || r.type === "master_bedroom")).length;
  assert(gfBeds + ffBeds === 2, `Total bedrooms across floors = 2 (GF: ${gfBeds}, FF: ${ffBeds})`);
  assert(ffBeds >= 1, "At least 1 bedroom on first floor for 2BHK G+1");
}

const plan4BHK = generateSinglePlan(duplexBenchmarkCases[5].req, "practical");
assert(Boolean(plan4BHK && !("success" in plan4BHK)), "4BHK G+1 generated successfully");
if (plan4BHK && !("success" in plan4BHK)) {
  const gfBeds = plan4BHK.rooms.filter((r) => r.floor === 0 && (r.type === "bedroom" || r.type === "master_bedroom")).length;
  const ffBeds = plan4BHK.rooms.filter((r) => r.floor === 1 && (r.type === "bedroom" || r.type === "master_bedroom")).length;
  assert(gfBeds + ffBeds === 4, `Total bedrooms across floors = 4 (GF: ${gfBeds}, FF: ${ffBeds})`);
  assert(gfBeds >= 1, "Ground floor has at least 1 bedroom (guest/parent bedroom) in 4BHK duplex");
  assert(ffBeds >= 2, "First floor has at least 2 bedrooms (master suite + others) in 4BHK duplex");
}

// ---------------------------------------------------------------------------------
// PART 5: AREA CALCULATIONS & ENCLOSED GROSS AREA SEMANTICS
// ---------------------------------------------------------------------------------
console.log("\n▶ PART 5: Area Calculations & Enclosed Gross Area Semantics");

const plan3BHKDuplex = generateSinglePlan(duplexBenchmarkCases[4].req, "spacious");
assert(Boolean(plan3BHKDuplex && !("success" in plan3BHKDuplex)), "3BHK duplex plan generated for area verification");
if (plan3BHKDuplex && !("success" in plan3BHKDuplex)) {
  const areas = plan3BHKDuplex.areas;
  assert(Boolean(areas), "3BHK duplex areas object exists");
  if (areas) {
    // Unenclosed spaces exclusion check: Balcony, Parking, OTS must not inflate enclosed carpet
    const expectedCarpet = calculateNetRoomArea(plan3BHKDuplex.rooms);
    assert(
      Math.abs(areas.netRoomArea - expectedCarpet) < 0.5,
      `Net carpet area (${areas.netRoomArea}) matches calculateNetRoomArea sum (${expectedCarpet})`
    );

    // Balcony and parking must be present in rooms but excluded from carpet
    const hasBalcony = plan3BHKDuplex.rooms.some((r) => r.type === "balcony");
    const hasParking = plan3BHKDuplex.rooms.some((r) => r.type === "parking");
    assert(hasBalcony, "Balcony present in plan rooms");
    assert(hasParking, "Parking present in plan rooms");

    // Gross built-up area strictly exceeds net carpet area due to geometric wall allowance
    assert(areas.enclosedBuiltUpArea > areas.netRoomArea, `Gross built-up (${areas.enclosedBuiltUpArea}) > Net carpet (${areas.netRoomArea})`);
    const wallRatio = (areas.enclosedBuiltUpArea - areas.netRoomArea) / areas.enclosedBuiltUpArea;
    assert(wallRatio >= 0.08 && wallRatio <= 0.25, `Geometric wall allowance ratio is realistic: ${(wallRatio * 100).toFixed(1)}%`);

    // Total gross built-up = GF enclosed + FF enclosed
    assert(
      Math.abs(areas.totalBuiltUpArea - (areas.groundFloorEnclosedArea + areas.firstFloorEnclosedArea)) < 0.1,
      `Total built-up (${areas.totalBuiltUpArea}) = GF (${areas.groundFloorEnclosedArea}) + FF (${areas.firstFloorEnclosedArea})`
    );
  }
}

// ---------------------------------------------------------------------------------
// PART 6: STRUCTURED FAILURE ON IMPOSSIBLE DUPLEX INPUTS (NO INVALID FALLBACK)
// ---------------------------------------------------------------------------------
console.log("\n▶ PART 6: Structured Failure on Impossible Duplex Inputs (Zero Invalid Fallback)");

// Impossible Duplex 1: 12 Bedrooms on a 15x20 plot
const impossibleDuplexReq1 = normalizeRequirements({
  plot: { width: 15, length: 20, unit: "ft" },
  floors: 2,
  rooms: [
    { type: "living", quantity: 1 },
    { type: "kitchen", quantity: 1 },
    { type: "bedroom", quantity: 12 },
    { type: "bathroom", quantity: 6 },
  ],
  staircase: true,
});
const singleFailResult1 = generateSinglePlan(impossibleDuplexReq1, "spacious");
assert("success" in singleFailResult1 && singleFailResult1.success === false, "generateSinglePlan returns structured failure on impossible 12BHK duplex (NOT candidate 0)");
if ("success" in singleFailResult1 && !singleFailResult1.success) {
  assert(singleFailResult1.infeasibility.issues.length > 0, "Structured failure contains infeasibility issues");
  assert(singleFailResult1.infeasibility.suggestedAlternatives.length > 0, "Structured failure contains architectural alternatives");
}

const fullFailResult1 = generateFloorPlanResult(impossibleDuplexReq1);
assert(fullFailResult1.success === false, "generateFloorPlanResult returns structured failure on impossible duplex");

// Impossible Duplex 2: Two cars on 14 ft road frontage G+1
const impossibleDuplexReq2 = normalizeRequirements({
  plot: { width: 14, length: 50, unit: "ft" },
  floors: 2,
  rooms: [
    { type: "living", quantity: 1 },
    { type: "kitchen", quantity: 1 },
    { type: "bedroom", quantity: 3 },
    { type: "bathroom", quantity: 3 },
  ],
  parking: { type: "car", quantity: 2 },
  staircase: true,
});
const singleFailResult2 = generateSinglePlan(impossibleDuplexReq2, "spacious");
assert("success" in singleFailResult2 && singleFailResult2.success === false, "generateSinglePlan returns structured failure on 2 cars on 14ft frontage (NOT candidate 0)");

// ---------------------------------------------------------------------------------
// PART 7: BACKWARD COMPATIBILITY (SINGLE-FLOOR PLANS REMAIN UNTOUCHED)
// ---------------------------------------------------------------------------------
console.log("\n▶ PART 7: Backward Compatibility with Phase 1 & 2 Single-Floor Plans");

const singleFloorReq = normalizeRequirements({
  plot: { width: 25, length: 50, unit: "ft" },
  floors: 1,
  rooms: [
    { type: "living", quantity: 1 },
    { type: "kitchen", quantity: 1 },
    { type: "bedroom", quantity: 2 },
    { type: "bathroom", quantity: 2 },
  ],
});
const singleFloorPlan = generateSinglePlan(singleFloorReq, "spacious");
assert(Boolean(singleFloorPlan && !("success" in singleFloorPlan)), "Single-floor plan continues to generate without regression");
if (singleFloorPlan && !("success" in singleFloorPlan)) {
  const upperRooms = singleFloorPlan.rooms.filter((r) => r.floor > 0);
  assert(upperRooms.length === 0, "Single-floor plan has zero rooms on upper floors");
  const gfRooms = singleFloorPlan.rooms.filter((r) => r.floor === 0);
  assert(gfRooms.length > 0, `Single-floor plan has ${gfRooms.length} ground floor rooms`);
}

// =================================================================================
// SUMMARY
// =================================================================================
console.log("\n===============================================================================");
console.log(`PHASE 3 TEST RESULTS: ${passedAssertions}/${totalAssertions} ASSERTIONS PASSED`);
if (passedAssertions === totalAssertions) {
  console.log("✅ ALL PHASE 3 STAIRCASE & DUPLEX PLANNING TESTS PASSED SUCCESSFULLY!");
} else {
  console.log("❌ SOME PHASE 3 ASSERTIONS FAILED!");
  process.exit(1);
}
console.log("===============================================================================");
