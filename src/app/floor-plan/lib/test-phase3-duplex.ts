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
import { placeGroundRooms } from "./planning/room-placement";
import { placeFirstFloorRooms } from "./planning/first-floor-placement";

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
// PART 3: VERTICAL CONNECTIVITY & TRUE CROSS-FLOOR BFS GRAPH TRAVERSAL
// ---------------------------------------------------------------------------------
console.log("\n▶ PART 3: Vertical Connectivity & True Cross-Floor BFS Traversal Verification");

// 3.1 Identical Footprint Vertical Core
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

// 3.5 Geometrically Disconnected Staircase (Centerline offset > 2.5')
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

// 3.6 True Duplex BFS: Valid Full Duplex Path Verification
const sampleDuplexPlan = generateSinglePlan(duplexBenchmarkCases[4].req, "spacious");
assert(Boolean(sampleDuplexPlan && !("success" in sampleDuplexPlan)), "Sample 3BHK duplex generated for BFS tests");

if (sampleDuplexPlan && !("success" in sampleDuplexPlan)) {
  const auditFull = auditDuplexAccessibility(sampleDuplexPlan.rooms, sampleDuplexPlan.doors, sampleDuplexPlan.windows);
  assert(auditFull.allReachable, "Valid GF entry -> GF staircase -> FF landing -> FF rooms passes true cross-floor BFS");

  const upperBed = sampleDuplexPlan.rooms.find((r) => r.floor === 1 && (r.type === "bedroom" || r.type === "master_bedroom"));
  const upperBedDetail = auditFull.roomDetails.find((d) => d.roomId === upperBed?.id);
  const hasCompleteVerticalRoute =
    /main entry/i.test(upperBedDetail?.route || "") &&
    /staircase/i.test(upperBedDetail?.route || "") &&
    /vertical core/i.test(upperBedDetail?.route || "") &&
    /landing/i.test(upperBedDetail?.route || "");
  assert(
    Boolean(hasCompleteVerticalRoute),
    `Valid duplex exposes route containing entry -> GF staircase -> vertical core -> FF landing -> upper room: "${upperBedDetail?.route}"`
  );

  // 3.7 True Duplex BFS: GF Staircase Physically Disconnected from Entry
  // Simulate GF staircase isolated from living/circulation (no shared open wall or door)
  const disconnectedGfRooms = sampleDuplexPlan.rooms.map((r) => {
    if (r.floor === 0 && r.type === "staircase") {
      return { ...r, x: 999, y: 999 }; // Isolated off-grid
    }
    return r;
  });
  const auditDisconnectedGf = auditDuplexAccessibility(disconnectedGfRooms, sampleDuplexPlan.doors, sampleDuplexPlan.windows);
  assert(!auditDisconnectedGf.allReachable, "GF staircase physically disconnected from entry causes duplex failure");

  // 3.8 True Duplex BFS: Living Room Reachable but Actual Entry Disconnected Fails
  // Remove the main entry door; living remains internally connected to GF and FF, but no entry door exists
  const noEntryDoors = sampleDuplexPlan.doors.filter(
    (d) => !/main\s*entry|entrance/i.test(d.label || "") && !/main[-_]?entry/i.test(d.id || "")
  );
  const auditNoEntry = auditDuplexAccessibility(sampleDuplexPlan.rooms, noEntryDoors, sampleDuplexPlan.windows);
  assert(!auditNoEntry.allReachable, "Living room reachable internally but actual entry disconnected fails duplex audit");

  // 3.9 True Duplex BFS: Mismatched verticalCoreId on Upper Floor
  const badCoreRooms = sampleDuplexPlan.rooms.map((r) => {
    if (r.floor === 1 && r.type === "staircase") {
      return { ...r, verticalCoreId: "wrong-core-999" };
    }
    return r;
  });
  const auditBadCore = auditDuplexAccessibility(badCoreRooms, sampleDuplexPlan.doors, sampleDuplexPlan.windows);
  assert(!auditBadCore.allReachable, "Wrong verticalCoreId fails duplex BFS traversal");
  assert(
    auditBadCore.unreachableRooms.some((name) => name.includes("Floor 1")),
    "First Floor rooms marked unreachable when verticalCoreId does not match"
  );

  // 3.10 True Duplex BFS: Isolated Upper Bedroom (No Door/Connection)
  const isolatedBedDoors = sampleDuplexPlan.doors.filter((d) => d.roomId !== upperBed?.id);
  const auditIsolatedBed = auditDuplexAccessibility(sampleDuplexPlan.rooms, isolatedBedDoors, sampleDuplexPlan.windows);
  assert(!auditIsolatedBed.allReachable, "FF bedroom with no valid door/connection fails accessibility");
  assert(
    auditIsolatedBed.unreachableRooms.some((name) => name.includes(upperBed!.name)),
    `Isolated upper bedroom "${upperBed!.name}" marked unreachable`
  );

  // 3.11 True Duplex BFS: Insufficient Vertical Overlap Fails
  const badOverlapRooms = sampleDuplexPlan.rooms.map((r) => {
    if (r.floor === 1 && r.type === "staircase") {
      return { ...r, x: r.x + r.width - 1.0 }; // Only 1.0 ft overlap (< 2.8 ft)
    }
    return r;
  });
  const auditBadOverlap = auditDuplexAccessibility(badOverlapRooms, sampleDuplexPlan.doors, sampleDuplexPlan.windows);
  assert(!auditBadOverlap.allReachable, "Insufficient vertical overlap fails duplex BFS");
}

// ---------------------------------------------------------------------------------
// PART 4: ADAPTIVE FIRST-FLOOR DISTRIBUTION (NOT RIGID BHK TEMPLATES)
// ---------------------------------------------------------------------------------
console.log("\n▶ PART 4: Adaptive First-Floor Distribution Verification");

// 4.1 Plot Width Influence: 20' width vs 40' width produce materially different room layouts
const plan20W = generateSinglePlan(duplexBenchmarkCases[0].req, "spacious");
const plan40W = generateSinglePlan(duplexBenchmarkCases[5].req, "spacious");
assert(Boolean(plan20W && !("success" in plan20W)), "20' wide duplex generated successfully");
assert(Boolean(plan40W && !("success" in plan40W)), "40' wide duplex generated successfully");

if (plan20W && !("success" in plan20W) && plan40W && !("success" in plan40W)) {
  const mBed20 = plan20W.rooms.find((r) => r.floor === 1 && r.type === "master_bedroom")!;
  const mBed40 = plan40W.rooms.find((r) => r.floor === 1 && r.type === "master_bedroom")!;
  assert(mBed20.width !== mBed40.width, `Plot width materially changes Master Bedroom width: 20' plot (${mBed20.width}') vs 40' plot (${mBed40.width}')`);
  assert(mBed40.width > mBed20.width, `Wider plot allocates wider bedroom footprint (${mBed40.width}' > ${mBed20.width}')`);
}

// 4.2 Plot Length Influence: 50' length vs 60' length produce materially different distributions
const plan30x50 = generateSinglePlan(duplexBenchmarkCases[3].req, "spacious");
const plan30x60 = generateSinglePlan(duplexBenchmarkCases[4].req, "spacious");
assert(Boolean(plan30x50 && !("success" in plan30x50)), "30x50 duplex generated successfully");
assert(Boolean(plan30x60 && !("success" in plan30x60)), "30x60 duplex generated successfully");

if (plan30x50 && !("success" in plan30x50) && plan30x60 && !("success" in plan30x60)) {
  const bed2_50 = plan30x50.rooms.find((r) => r.floor === 1 && r.name === "Bedroom 2")!;
  const bed2_60 = plan30x60.rooms.find((r) => r.floor === 1 && r.name === "Bedroom 2")!;
  assert(bed2_50.height !== bed2_60.height, `Plot length materially changes Bedroom 2 depth: 50' length (${bed2_50.height}') vs 60' length (${bed2_60.height}')`);
  assert(bed2_60.height > bed2_50.height, `Longer plot expands rear sleeping depth (${bed2_60.height}' > ${bed2_50.height}')`);
}

// 4.3 Requested Bedroom Count Changes Distribution (2BHK vs 3BHK vs 4BHK)
if (plan20W && !("success" in plan20W) && plan30x50 && !("success" in plan30x50) && plan40W && !("success" in plan40W)) {
  const ffBeds2 = plan20W.rooms.filter((r) => r.floor === 1 && (r.type === "bedroom" || r.type === "master_bedroom")).length;
  const ffBeds3 = plan30x50.rooms.filter((r) => r.floor === 1 && (r.type === "bedroom" || r.type === "master_bedroom")).length;
  const ffBeds4 = plan40W.rooms.filter((r) => r.floor === 1 && (r.type === "bedroom" || r.type === "master_bedroom")).length;
  assert(ffBeds2 === 1, `2BHK G+1 allocates 1 bedroom on First Floor (GF: 1, FF: 1)`);
  assert(ffBeds3 === 2, `3BHK G+1 allocates 2 bedrooms on First Floor (GF: 1, FF: 2)`);
  assert(ffBeds4 === 2 || ffBeds4 === 3, `4BHK G+1 allocates multiple suites on First Floor (FF: ${ffBeds4})`);
}

// 4.4 Explicit Room Dimensions Influence Placement Directly
const explicitDimReq = normalizeRequirements({
  plot: { width: 30, length: 60, unit: "ft" },
  floors: 2,
  rooms: [
    { type: "living", quantity: 1 },
    { type: "kitchen", quantity: 1 },
    { type: "bedroom", quantity: 3 },
    { type: "bathroom", quantity: 3 },
    { type: "master_bedroom", quantity: 1, dimensions: { width: 16, length: 13 } },
  ],
  parking: { type: "car", quantity: 1 },
  staircase: true,
  balcony: true,
});
const explicitPlan = generateSinglePlan(explicitDimReq, "spacious");
assert(Boolean(explicitPlan && !("success" in explicitPlan)), "Plan with explicit room dimensions generated successfully");
if (explicitPlan && !("success" in explicitPlan)) {
  const mBed = explicitPlan.rooms.find((r) => r.floor === 1 && r.type === "master_bedroom");
  assert(Boolean(mBed), "Master Bedroom found on First Floor");
  if (mBed) {
    assert(
      Math.abs(mBed.width - 16) <= 1.5,
      `Explicit width 16' influences Master Bedroom width (got ${mBed.width}')`
    );
    assert(
      Math.abs(mBed.height - 13) <= 1.5,
      `Explicit length 13' influences Master Bedroom height (got ${mBed.height}')`
    );
  }
}

// 4.5 Staircase Position Influences First-Floor Distribution
// Compare Candidate with West Staircase (stairX = 0) vs Interior Staircase (stairX > 0)
const sampleReq30x60 = duplexBenchmarkCases[4].req;
const zoningSpacious = calculateFunctionalZoning(sampleReq30x60, "spacious", 0);
const circW30 = calculateCirculationWidth(30);
const stairCands = generateStaircaseCandidates(
  30,
  60,
  zoningSpacious.usableStartDepth,
  zoningSpacious.frontPublicZone.height,
  zoningSpacious.midFamilyZone.height,
  circW30,
  "spacious",
  sampleReq30x60
);

const candRight = stairCands.find((c) => c.x > 0);
const candLeft = stairCands.find((c) => c.x === 0);
assert(Boolean(candRight && candLeft), "Staircase candidates exist on both sides");

if (candRight && candLeft) {
  const gfRight = placeGroundRooms(sampleReq30x60, "spacious", 0, candRight);
  const ffRight = placeFirstFloorRooms(sampleReq30x60, "spacious", gfRight, 30, 60, 0);

  const gfLeft = placeGroundRooms(sampleReq30x60, "spacious", 0, candLeft);
  const ffLeft = placeFirstFloorRooms(sampleReq30x60, "spacious", gfLeft, 30, 60, 0);

  const lobbyRight = ffRight.find((r) => r.name === "Upper Circulation Lobby")!;
  const lobbyLeft = ffLeft.find((r) => r.name === "Upper Circulation Lobby")!;
  assert(lobbyRight.x !== lobbyLeft.x, `Staircase position adaptively shifts Upper Lobby: x=${lobbyRight.x}' vs x=${lobbyLeft.x}'`);
}

// 4.6 Small/Narrow Plots Reject Impossible Arrangements (No Rigid Template Fallback)
const impossibleArrangement = normalizeRequirements({
  plot: { width: 14, length: 22, unit: "ft" },
  floors: 2,
  rooms: [
    { type: "living", quantity: 1 },
    { type: "kitchen", quantity: 1 },
    { type: "bedroom", quantity: 6 },
    { type: "bathroom", quantity: 4 },
  ],
  staircase: true,
});
const impossibleRes = generateSinglePlan(impossibleArrangement, "spacious");
assert("success" in impossibleRes && impossibleRes.success === false, "Impossible arrangements rejected rather than forcing a template");

// 4.7 Larger Plots Distribute Additional Requested Rooms Without Fixed Template
const largePlot5BHKReq = normalizeRequirements({
  plot: { width: 40, length: 70, unit: "ft" },
  floors: 2,
  rooms: [
    { type: "living", quantity: 1 },
    { type: "kitchen", quantity: 1 },
    { type: "bedroom", quantity: 5 },
    { type: "bathroom", quantity: 4 },
    { type: "dining", quantity: 1 },
  ],
  parking: { type: "car", quantity: 1 },
  staircase: true,
  balcony: true,
});
const largePlanResult = generateSinglePlan(largePlot5BHKReq, "spacious");
assert(Boolean(largePlanResult && !("success" in largePlanResult)), "5BHK duplex on 40x70 plot generated successfully without fixed BHK template");
if (largePlanResult && !("success" in largePlanResult)) {
  const totalBedRooms = largePlanResult.rooms.filter((r) => r.type === "bedroom" || r.type === "master_bedroom").length;
  assert(totalBedRooms === 5, `Large plot successfully distributed all 5 requested bedrooms (found ${totalBedRooms})`);
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
