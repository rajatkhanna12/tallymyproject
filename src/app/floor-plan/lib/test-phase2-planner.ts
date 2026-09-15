import { generateFloorPlans, generateFloorPlanResult, generateSinglePlan } from "./layout-engine";
import { normalizeRequirements } from "./parser";
import { Door, HouseRequirements, LayoutStyleVariant, Room } from "./types";
import {
  roomsOverlap,
  roomWithinBounds,
  validateRequiredRooms,
  validateRequiredBedrooms,
  validateRequiredBathrooms,
} from "./validation";
import { validateAreaConsistency } from "./geometry";
import { getSharedWallLength, evaluateAdjacency } from "./planning/adjacency";
import { auditPlanAccessibility, getRoomsConnectedByDoor } from "./planning/accessibility";
import { calculateCirculationWidth } from "./planning/circulation";
import { ROOM_COLORS } from "./planning/room-placement";

// =================================================================================
// PHASE 2 ARCHITECTURAL PLANNING ENGINE COMPREHENSIVE TEST SUITE
// =================================================================================

interface BenchmarkCase {
  name: string;
  req: HouseRequirements;
}

const benchmarkCases: BenchmarkCase[] = [
  {
    name: "20 x 50 — 2BHK",
    req: normalizeRequirements({
      plot: { width: 20, length: 50, unit: "ft" },
      floors: 1,
      rooms: [
        { type: "living", quantity: 1 },
        { type: "kitchen", quantity: 1 },
        { type: "bedroom", quantity: 2 },
        { type: "bathroom", quantity: 2 },
      ],
      parking: { type: "bike", quantity: 2 },
    }),
  },
  {
    name: "23 x 50 — 2BHK",
    req: normalizeRequirements({
      plot: { width: 23, length: 50, unit: "ft" },
      floors: 1,
      rooms: [
        { type: "living", quantity: 1 },
        { type: "kitchen", quantity: 1 },
        { type: "bedroom", quantity: 2 },
        { type: "bathroom", quantity: 2 },
        { type: "dining", quantity: 1 },
      ],
      parking: { type: "bike", quantity: 2 },
      kitchen: { openToDining: true },
    }),
  },
  {
    name: "25 x 50 — 3BHK",
    req: normalizeRequirements({
      plot: { width: 25, length: 50, unit: "ft" },
      floors: 1,
      rooms: [
        { type: "living", quantity: 1 },
        { type: "kitchen", quantity: 1 },
        { type: "bedroom", quantity: 3 },
        { type: "bathroom", quantity: 2 },
        { type: "dining", quantity: 1 },
      ],
      parking: { type: "car", quantity: 1 },
    }),
  },
  {
    name: "30 x 50 — 3BHK",
    req: normalizeRequirements({
      plot: { width: 30, length: 50, unit: "ft" },
      floors: 1,
      rooms: [
        { type: "living", quantity: 1 },
        { type: "kitchen", quantity: 1 },
        { type: "bedroom", quantity: 3 },
        { type: "bathroom", quantity: 3 },
        { type: "dining", quantity: 1 },
      ],
      parking: { type: "car", quantity: 1 },
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
console.log("PHASE 2 ARCHITECTURAL PLANNING ENGINE VERIFICATION SUITE");
console.log("===============================================================================\n");

// ---------------------------------------------------------------------------------
// PART 1: 6 ARCHITECTURAL BENCHMARK CASES ACROSS ALL 3 VARIANTS
// ---------------------------------------------------------------------------------
console.log("▶ PART 1: Benchmark Cases (Spacious, Practical, Compact)");

const variants: LayoutStyleVariant[] = ["spacious", "practical", "compact"];

for (const bm of benchmarkCases) {
  console.log(`\n-------------------------------------------------------------------------------`);
  console.log(`Testing Benchmark: [${bm.name}]`);
  console.log(`-------------------------------------------------------------------------------`);

  // Track room footprints across variants to verify topological distinctness
  const variantSignatures: Record<string, string> = {};

  for (const variant of variants) {
    const planResult = generateSinglePlan(bm.req, variant);
    assert(Boolean(planResult && !("success" in planResult)), `[${variant}] Plan generated successfully without failure`);
    if (!planResult || "success" in planResult) continue;
    const plan = planResult;

    assert(plan.rooms.length > 0, `[${variant}] Plan contains rooms`);
    assert(plan.walls.length > 0, `[${variant}] Plan contains walls`);
    assert(plan.doors.length > 0, `[${variant}] Plan contains doors`);
    assert(plan.windows.length > 0, `[${variant}] Plan contains windows`);

    // 1. Geometric Non-Overlap Check (Strict 0-tolerance)
    for (let f = 0; f < bm.req.floors; f++) {
      const floorRooms = plan.rooms.filter((r) => r.floor === f);
      for (let i = 0; i < floorRooms.length; i++) {
        for (let j = i + 1; j < floorRooms.length; j++) {
          const rA = floorRooms[i];
          const rB = floorRooms[j];
          const overlaps = roomsOverlap(rA, rB);
          assert(!overlaps, `[${variant} Fl:${f}] Rooms "${rA.name}" and "${rB.name}" do not overlap`);
        }
      }
    }

    // 2. Plot Boundary Compliance
    for (const r of plan.rooms) {
      const inBounds = roomWithinBounds(r, bm.req.plot.width, bm.req.plot.length);
      assert(inBounds, `[${variant}] Room "${r.name}" (${r.x},${r.y},${r.width}x${r.height}) within plot bounds`);
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

    // Explicit dining preservation check
    const explicitDiningRequested = bm.req.rooms.some((r) => r.type === "dining");
    if (explicitDiningRequested) {
      const diningExists = plan.rooms.some((r) => r.type === "dining");
      assert(diningExists, `[${variant}] Explicitly requested dining room preserved`);
    }

    // 4. Master Bedroom <-> Attached Bath Geometric Adjacency
    for (let f = 0; f < bm.req.floors; f++) {
      const floorRooms = plan.rooms.filter((r) => r.floor === f);
      const masterBed = floorRooms.find((r) => r.type === "master_bedroom");
      const attBath = floorRooms.find((r) => r.type === "attached_bath");

      if (masterBed && attBath) {
        const sharedWall = getSharedWallLength(masterBed, attBath);
        assert(
          sharedWall >= 2.5,
          `[${variant} Fl:${f}] Master bedroom and attached bath share wall (shared=${sharedWall.toFixed(1)}ft)`
        );
      }
    }

    // 5. Common Bathroom Accessible from Circulation / Living (NOT inside a private bedroom)
    for (let f = 0; f < bm.req.floors; f++) {
      const floorRooms = plan.rooms.filter((r) => r.floor === f);
      const commonBaths = floorRooms.filter((r) => r.type === "bathroom");
      for (const cb of commonBaths) {
        const touchesCirculationOrLiving = floorRooms.some((other) => {
          if (other.type === "passage" || other.type === "living" || other.type === "dining" || other.type === "ots") {
            return getSharedWallLength(cb, other) > 0.5;
          }
          return false;
        });
        assert(
          touchesCirculationOrLiving,
          `[${variant} Fl:${f}] Common bathroom "${cb.name}" borders circulation/living/lightwell`
        );
      }
    }

    // 6. Route-Based Geometrically Verified Accessibility (BFS Traversal)
    for (let f = 0; f < bm.req.floors; f++) {
      const accessAudit = auditPlanAccessibility(plan.rooms, plan.doors, plan.windows, f);
      assert(
        accessAudit.allReachable,
        `[${variant} Fl:${f}] All rooms reachable from entry. Unreachable: ${accessAudit.unreachableRooms.join(", ") || "none"}`
      );
      assert(
        accessAudit.unreachableRooms.length === 0,
        `[${variant} Fl:${f}] Zero unreachable rooms`
      );
    }

    // 7. Daylight & Natural Ventilation Verification
    for (let f = 0; f < bm.req.floors; f++) {
      const accessAudit = auditPlanAccessibility(plan.rooms, plan.doors, plan.windows, f);
      assert(
        accessAudit.unventilatedRooms.length === 0,
        `[${variant} Fl:${f}] All habitable rooms ventilated. Unventilated: ${accessAudit.unventilatedRooms.join(", ") || "none"}`
      );
    }

    // 8. Phase 1 Area Consistency Verification
    assert(!!plan.areas, `[${variant}] Plan contains calculated areas`);
    if (plan.areas) {
      const areaCheck = validateAreaConsistency(plan.areas);
      assert(areaCheck.valid, `[${variant}] Mathematical area consistency holds: ${areaCheck.errors.join("; ")}`);
      assert(
        plan.areas.netRoomArea < plan.areas.enclosedBuiltUpArea,
        `[${variant}] Net carpet area (${plan.areas.netRoomArea}) < Enclosed built-up (${plan.areas.enclosedBuiltUpArea})`
      );
    }

    // Record signature for topological distinctness check
    variantSignatures[variant] = plan.rooms
      .map((r) => `${r.type}:${r.x.toFixed(1)},${r.y.toFixed(1)},${r.width.toFixed(1)}x${r.height.toFixed(1)}`)
      .sort()
      .join("|");
  }

  // 9. Topological Distinctness Across Variants
  const distinctSpaciousPractical = variantSignatures["spacious"] !== variantSignatures["practical"];
  const distinctSpaciousCompact = variantSignatures["spacious"] !== variantSignatures["compact"];
  const distinctPracticalCompact = variantSignatures["practical"] !== variantSignatures["compact"];

  assert(distinctSpaciousPractical, `Spacious and Practical variants are topologically distinct`);
  assert(distinctSpaciousCompact, `Spacious and Compact variants are topologically distinct`);
  assert(distinctPracticalCompact, `Practical and Compact variants are topologically distinct`);

  console.log(`  ✓ Benchmark [${bm.name}] verified across all 3 style variants!`);
}

// ---------------------------------------------------------------------------------
// PART 2: ADAPTIVE CIRCULATION WIDTH TESTS
// ---------------------------------------------------------------------------------
console.log("\n▶ PART 2: Adaptive Circulation Width Verification");

assert(calculateCirculationWidth(12) === 3.0, "Plot width 12' -> Adaptive corridor width 3'0\"");
assert(calculateCirculationWidth(15) === 3.0, "Plot width 15' -> Adaptive corridor width 3'0\"");
assert(calculateCirculationWidth(20) === 3.0, "Plot width 20' -> Adaptive corridor width 3'0\"");
assert(calculateCirculationWidth(25) === 3.5, "Plot width 25' -> Adaptive corridor width 3'6\"");
assert(calculateCirculationWidth(35) === 4.0, "Plot width 35' -> Adaptive corridor width 4'0\"");
assert(calculateCirculationWidth(45) === 4.0, "Plot width 45' -> Adaptive corridor width 4'0\"");

// ---------------------------------------------------------------------------------
// PART 3: ADJACENCY SCORING (HARD vs SOFT CONSTRAINTS)
// ---------------------------------------------------------------------------------
console.log("\n▶ PART 3: Adjacency Scoring (Hard Constraints vs Soft Preferences)");

const testRooms: Room[] = [
  { id: "r1", name: "Living", type: "living", x: 0, y: 0, width: 14, height: 16, floor: 0, color: "#fff" },
  { id: "r2", name: "Dining", type: "dining", x: 14, y: 0, width: 10, height: 16, floor: 0, color: "#fff" },
  { id: "r3", name: "Kitchen", type: "kitchen", x: 14, y: 16, width: 10, height: 12, floor: 0, color: "#fff" },
  { id: "r4", name: "Master Bed", type: "master_bedroom", x: 0, y: 16, width: 14, height: 14, floor: 0, color: "#fff" },
  { id: "r5", name: "Attached Bath", type: "attached_bath", x: 0, y: 30, width: 7, height: 6, floor: 0, color: "#fff" },
  { id: "r6", name: "Passage", type: "passage", x: 7, y: 30, width: 7, height: 6, floor: 0, color: "#fff" },
  { id: "r7", name: "Common Bath", type: "bathroom", x: 14, y: 28, width: 6, height: 6, floor: 0, color: "#fff" },
];

const adjResult = evaluateAdjacency(testRooms);
assert(adjResult.valid === true, "Hard constraints passed for well-zoned layout");
assert(adjResult.hardConstraintViolations.length === 0, "Zero hard violations");
assert(adjResult.score > 0, `Soft preferences scored positively (score=${adjResult.score})`);

// ---------------------------------------------------------------------------------
// PART 4: NEGATIVE CASES & SCREENING INTEGRATION
// ---------------------------------------------------------------------------------
console.log("\n▶ PART 4: Negative Cases & Pre-Generation Screening Integration");

// Negative Test 1: Narrow plot < 12'
const narrowReq = normalizeRequirements({
  plot: { width: 10, length: 50, unit: "ft" },
  rooms: [{ type: "living", quantity: 1 }, { type: "bedroom", quantity: 1 }],
});
const narrowResult = generateFloorPlanResult(narrowReq);
assert(!narrowResult.success, "Plot width < 12' rejected by pre-generation screening check");

// Negative Test 2: Shallow plot < 18'
const shallowReq = normalizeRequirements({
  plot: { width: 30, length: 15, unit: "ft" },
  rooms: [{ type: "living", quantity: 1 }, { type: "bedroom", quantity: 1 }],
});
const shallowResult = generateFloorPlanResult(shallowReq);
assert(!shallowResult.success, "Plot length < 18' rejected by pre-generation screening check");

// Negative Test 3: Overcrowding (8 BHK on 20x30 plot)
const crowdReq = normalizeRequirements({
  plot: { width: 20, length: 30, unit: "ft" },
  floors: 1,
  rooms: [
    { type: "living", quantity: 1 },
    { type: "kitchen", quantity: 1 },
    { type: "bedroom", quantity: 8 },
    { type: "bathroom", quantity: 4 },
  ],
});
const crowdResult = generateFloorPlanResult(crowdReq);
assert(!crowdResult.success, "Overcrowding rejected with space deficit conflict");
if (!crowdResult.success) {
  assert(
    crowdResult.infeasibility.issues.some((i) => i.code === "SPACE_DEFICIT_OVERCROWDING"),
    "Structured issue code SPACE_DEFICIT_OVERCROWDING returned"
  );
}

// Negative Test 4: Multi-car frontage conflict (2 cars on 16' frontage)
const frontageReq = normalizeRequirements({
  plot: { width: 16, length: 50, unit: "ft" },
  rooms: [{ type: "living", quantity: 1 }],
  parking: { type: "car", quantity: 2 },
});
const frontageResult = generateFloorPlanResult(frontageReq);
assert(!frontageResult.success, "2 cars on 16' frontage rejected with frontage conflict");

// ---------------------------------------------------------------------------------
// PART 5: PUBLIC API CONTRACT PRESERVATION
// ---------------------------------------------------------------------------------
console.log("\n▶ PART 5: Public API Contract Preservation");

const apiPlans = generateFloorPlans(benchmarkCases[0].req);
assert(Array.isArray(apiPlans), "generateFloorPlans returns FloorPlan[] array");
assert(apiPlans.length === 3, "generateFloorPlans returns exactly 3 style variants");
assert(apiPlans[0].styleVariant === "spacious", "Variant 0 is spacious");
assert(apiPlans[1].styleVariant === "practical", "Variant 1 is practical");
assert(apiPlans[2].styleVariant === "compact", "Variant 2 is compact");

const apiResult = generateFloorPlanResult(benchmarkCases[0].req);
assert(apiResult.success === true, "generateFloorPlanResult returns structured success");
if (apiResult.success) {
  assert(apiResult.plans.length === 3, "generateFloorPlanResult contains 3 plans");
  assert(!!apiResult.plans[0], "generateFloorPlanResult contains primary plan (plans[0])");
}

// ---------------------------------------------------------------------------------
// PART 6: STRICT REGRESSION TESTS FOR DOOR CONNECTIVITY GEOMETRY
// ---------------------------------------------------------------------------------
console.log("\n▶ PART 6: Strict Regression Tests for Door Connectivity Geometry");

const testRoom1: Room = {
  id: "r-test-1",
  name: "Living Hall",
  type: "living",
  x: 0,
  y: 0,
  width: 14,
  height: 16,
  floor: 0,
  color: ROOM_COLORS.living,
};

const testRoom2: Room = {
  id: "r-test-2",
  name: "Dining Hall",
  type: "dining",
  x: 14,
  y: 0,
  width: 10,
  height: 16,
  floor: 0,
  color: ROOM_COLORS.dining,
};

// 1. Rejects door near a room but not actually on its wall boundary (offset by 1.0 ft > EPS 0.35 ft)
const nearBoundaryDoor: Door = {
  id: "d-near",
  roomId: "r-test-1",
  x: 13.0,
  y: 4.0,
  width: 3.0,
  orientation: "vertical",
  swing: "inward_left",
  floor: 0,
};
const nearRes = getRoomsConnectedByDoor(nearBoundaryDoor, [testRoom1, testRoom2]);
assert(nearRes === null, "Rejects door near a room but not actually on its wall boundary");

// 2. Rejects door touching only one room
const singleRoomDoor: Door = {
  id: "d-single",
  roomId: "r-test-1",
  x: 14.0,
  y: 4.0,
  width: 3.0,
  orientation: "vertical",
  swing: "inward_left",
  floor: 0,
};
const singleRes = getRoomsConnectedByDoor(singleRoomDoor, [testRoom1]);
assert(singleRes === null, "Rejects door touching only one room");

// 3. Rejects door crossing a room corner (only 0.2 ft overlap on shared wall < MIN_OVERLAP 0.5 ft)
const cornerDoor: Door = {
  id: "d-corner",
  roomId: "r-test-1",
  x: 14.0,
  y: 15.8,
  width: 3.0,
  orientation: "vertical",
  swing: "inward_left",
  floor: 0,
};
const cornerRes = getRoomsConnectedByDoor(cornerDoor, [testRoom1, testRoom2]);
assert(cornerRes === null, "Rejects door crossing a room corner with insufficient wall overlap");

// 4. Rejects door on the wrong floor
const wrongFloorDoor: Door = {
  id: "d-wrong-floor",
  roomId: "r-test-1",
  x: 14.0,
  y: 4.0,
  width: 3.0,
  orientation: "vertical",
  swing: "inward_left",
  floor: 1,
};
const wrongFloorRes = getRoomsConnectedByDoor(wrongFloorDoor, [testRoom1, testRoom2]);
assert(wrongFloorRes === null, "Rejects door on the wrong floor");

// 5. Rejects door whose opening does not sufficiently overlap the shared wall (< 0.5 ft threshold)
const lowOverlapDoor: Door = {
  id: "d-low-overlap",
  roomId: "r-test-1",
  x: 14.0,
  y: 15.7,
  width: 3.0,
  orientation: "vertical",
  swing: "inward_left",
  floor: 0,
};
const lowOverlapRes = getRoomsConnectedByDoor(lowOverlapDoor, [testRoom1, testRoom2]);
assert(lowOverlapRes === null, "Rejects door whose opening does not sufficiently overlap the shared wall (<0.5 ft)");

// 6. Rejects door that does not have rooms on physically opposite sides
const sameSideRoom: Room = {
  id: "r-test-same-side",
  name: "Lobby",
  type: "passage",
  x: 0,
  y: 16,
  width: 14,
  height: 10,
  floor: 0,
  color: ROOM_COLORS.passage,
};
const sameSideDoor: Door = {
  id: "d-same-side",
  roomId: "r-test-1",
  x: 14.0,
  y: 4.0,
  width: 3.0,
  orientation: "vertical",
  swing: "inward_left",
  floor: 0,
};
const sameSideRes = getRoomsConnectedByDoor(sameSideDoor, [testRoom1, sameSideRoom]);
assert(sameSideRes === null, "Rejects door that does not have rooms on physically opposite sides");

// 7. Proves exterior/main-entry door physically connecting Verandah to Living Hall remains valid
const frontVerandah: Room = {
  id: "r-verandah",
  name: "Entrance Verandah",
  type: "verandah",
  x: 0,
  y: 0,
  width: 10,
  height: 6,
  floor: 0,
  color: ROOM_COLORS.verandah,
};
const livingHall: Room = {
  id: "r-living",
  name: "Living Hall",
  type: "living",
  x: 0,
  y: 6,
  width: 16,
  height: 14,
  floor: 0,
  color: ROOM_COLORS.living,
};
const mainEntryDoor: Door = {
  id: "d-main-entry",
  roomId: "r-living",
  x: 1.0,
  y: 6.0,
  width: 3.5,
  orientation: "horizontal",
  swing: "inward_right",
  floor: 0,
  label: "MAIN ENTRY (3'6\")",
};
const mainConn = getRoomsConnectedByDoor(mainEntryDoor, [frontVerandah, livingHall]);
assert(mainConn !== null, "Exterior/main-entry door physically connecting Verandah and Living is valid");
if (mainConn) {
  assert(
    (mainConn.roomA.id === "r-verandah" && mainConn.roomB.id === "r-living") ||
    (mainConn.roomA.id === "r-living" && mainConn.roomB.id === "r-verandah"),
    "Main entry door connects front Verandah to Living Hall"
  );
}
const mainAudit = auditPlanAccessibility([frontVerandah, livingHall], [mainEntryDoor], [], 0);
assert(mainAudit.allReachable, "BFS traversal successfully enters house via main entrance door");

// 8. Proves intentional open transition/cased opening between Living and Dining remains valid
const openLiving: Room = {
  id: "r-open-living",
  name: "Living Hall",
  type: "living",
  x: 0,
  y: 0,
  width: 14,
  height: 16,
  floor: 0,
  color: ROOM_COLORS.living,
};
const openDining: Room = {
  id: "r-open-dining",
  name: "Dining Lounge",
  type: "dining",
  x: 14,
  y: 0,
  width: 10,
  height: 16,
  floor: 0,
  color: ROOM_COLORS.dining,
};
const sharedLength = getSharedWallLength(openLiving, openDining);
assert(sharedLength >= 2.5, `Intentional open transition shares wall of length ${sharedLength}ft (>= 2.5ft)`);
const openAudit = auditPlanAccessibility([openLiving, openDining], [], [], 0);
assert(openAudit.allReachable, "Intentional open transition allows free flow without closed door");

// ---------------------------------------------------------------------------------
// PART 7: CANDIDATE-REJECTION REGRESSION TESTS
// ---------------------------------------------------------------------------------
console.log("\n▶ PART 7: Candidate-Rejection Regression Tests");

const testPipelinePlotW = 20;
const testPipelinePlotL = 40;
const testPipelineReq = normalizeRequirements({
  plot: { width: testPipelinePlotW, length: testPipelinePlotL, unit: "ft" },
  floors: 1,
  rooms: [
    { type: "living", quantity: 1 },
    { type: "kitchen", quantity: 1 },
    { type: "bedroom", quantity: 1 },
    { type: "bathroom", quantity: 1 },
  ],
  parking: { type: "none", quantity: 0 },
});

// Candidate A: Geometrically invalid (rooms overlap!)
const candA: Room[] = [
  { id: "ca-1", name: "Living Hall", type: "living", x: 0, y: 0, width: 14, height: 16, floor: 0, color: ROOM_COLORS.living },
  { id: "ca-2", name: "Kitchen", type: "kitchen", x: 10, y: 5, width: 10, height: 12, floor: 0, color: ROOM_COLORS.kitchen },
  { id: "ca-3", name: "Master Bedroom", type: "master_bedroom", x: 0, y: 16, width: 12, height: 14, floor: 0, color: ROOM_COLORS.master_bedroom },
  { id: "ca-4", name: "Attached Bath", type: "attached_bath", x: 12, y: 16, width: 6, height: 7, floor: 0, color: ROOM_COLORS.attached_bath },
];
assert(roomsOverlap(candA[0], candA[1]), "Candidate A confirmed geometrically invalid (rooms overlap)");

// Candidate B: Hard-adjacency invalid (Master Bedroom and Attached Bath do not share a wall!)
const candB: Room[] = [
  { id: "cb-1", name: "Living Hall", type: "living", x: 0, y: 0, width: 12, height: 15, floor: 0, color: ROOM_COLORS.living },
  { id: "cb-2", name: "Kitchen", type: "kitchen", x: 12, y: 0, width: 8, height: 15, floor: 0, color: ROOM_COLORS.kitchen },
  { id: "cb-3", name: "Master Bedroom", type: "master_bedroom", x: 0, y: 15, width: 12, height: 15, floor: 0, color: ROOM_COLORS.master_bedroom },
  { id: "cb-4", name: "Attached Bath", type: "attached_bath", x: 14, y: 32, width: 6, height: 7, floor: 0, color: ROOM_COLORS.attached_bath },
];
const adjB = evaluateAdjacency(candB);
assert(!adjB.valid, "Candidate B confirmed hard-adjacency invalid (master <-> attached bath disconnected)");

// Candidate C: Fully valid layout satisfying geometry, requirements, and hard adjacencies
const candC: Room[] = [
  { id: "cc-1", name: "Living Hall", type: "living", x: 0, y: 0, width: 12, height: 15, floor: 0, color: ROOM_COLORS.living },
  { id: "cc-2", name: "Kitchen", type: "kitchen", x: 12, y: 0, width: 8, height: 15, floor: 0, color: ROOM_COLORS.kitchen },
  { id: "cc-3", name: "Master Bedroom", type: "master_bedroom", x: 0, y: 15, width: 12, height: 15, floor: 0, color: ROOM_COLORS.master_bedroom },
  { id: "cc-4", name: "Attached Bath", type: "attached_bath", x: 12, y: 15, width: 8, height: 7, floor: 0, color: ROOM_COLORS.attached_bath },
];
assert(!roomsOverlap(candC[0], candC[1]) && !roomsOverlap(candC[2], candC[3]), "Candidate C confirmed geometrically valid");
const adjC = evaluateAdjacency(candC);
assert(adjC.valid, "Candidate C confirmed hard-adjacency valid");

// Pipeline execution: Candidate A and B are rejected; Candidate C survives and is selected
const candidateSet = [
  { name: "Candidate A", rooms: candA },
  { name: "Candidate B", rooms: candB },
  { name: "Candidate C", rooms: candC },
];
const survivingCands: { name: string; rooms: Room[]; score: number }[] = [];

for (const cand of candidateSet) {
  // 1. Geometric Validation
  let geoValid = true;
  for (const r of cand.rooms) {
    if (!roomWithinBounds(r, testPipelinePlotW, testPipelinePlotL) || r.width < 2.5 || r.height < 2.5) {
      geoValid = false;
      break;
    }
  }
  if (geoValid) {
    for (let i = 0; i < cand.rooms.length; i++) {
      for (let j = i + 1; j < cand.rooms.length; j++) {
        if (roomsOverlap(cand.rooms[i], cand.rooms[j])) {
          geoValid = false;
          break;
        }
      }
      if (!geoValid) break;
    }
  }
  if (!geoValid) continue;

  // 2. Programmatic Validation
  const reqVal = validateRequiredRooms(cand.rooms, testPipelineReq);
  if (!reqVal.valid) continue;

  // 3. Hard Adjacency Validation
  const adj = evaluateAdjacency(cand.rooms);
  if (!adj.valid) continue;

  // 4. Soft Architectural Scoring (executed only on surviving candidates!)
  survivingCands.push({
    name: cand.name,
    rooms: cand.rooms,
    score: 820,
  });
}

assert(survivingCands.length === 1, "Exactly 1 candidate survived the validation pipeline");
assert(survivingCands[0].name === "Candidate C", "Candidate C was selected; Candidates A and B were rejected before scoring");

// All-Invalid Case: When all candidate configurations fail, verify structured failure (NOT candidate 0 fallback)
const impossibleRequirements = normalizeRequirements({
  plot: { width: 13, length: 20, unit: "ft" },
  floors: 1,
  rooms: [
    { type: "living", quantity: 1 },
    { type: "kitchen", quantity: 1 },
    { type: "bedroom", quantity: 3 },
    { type: "bathroom", quantity: 2 },
  ],
});

const singlePlanFailResult = generateSinglePlan(impossibleRequirements, "spacious");
assert("success" in singlePlanFailResult && singlePlanFailResult.success === false, "generateSinglePlan returns structured failure when all candidates are invalid (NOT candidate 0)");
if ("success" in singlePlanFailResult && !singlePlanFailResult.success) {
  assert(
    singlePlanFailResult.infeasibility.issues.some((i) => i.code === "NO_VALID_CONCEPTUAL_LAYOUT" || i.code === "SPACE_DEFICIT_OVERCROWDING"),
    "Structured failure contains issue code NO_VALID_CONCEPTUAL_LAYOUT or SPACE_DEFICIT_OVERCROWDING"
  );
  assert(singlePlanFailResult.infeasibility.suggestedAlternatives.length > 0, "Structured failure contains suggested architectural alternatives");
}

const floorPlanResultFail = generateFloorPlanResult(impossibleRequirements);
assert(floorPlanResultFail.success === false, "generateFloorPlanResult returns structured failure when all candidates are invalid");
if (!floorPlanResultFail.success) {
  assert(
    floorPlanResultFail.infeasibility.issues.length > 0,
    "generateFloorPlanResult infeasibility issues populated"
  );
}

// =================================================================================
// SUMMARY
// =================================================================================
console.log("\n===============================================================================");
console.log(`PHASE 2 TEST RESULTS: ${passedAssertions}/${totalAssertions} ASSERTIONS PASSED`);
if (passedAssertions === totalAssertions) {
  console.log("✅ ALL PHASE 2 ARCHITECTURAL PLANNING ENGINE TESTS PASSED SUCCESSFULLY!");
} else {
  console.log("❌ SOME PHASE 2 ASSERTIONS FAILED!");
  process.exit(1);
}
console.log("===============================================================================");
