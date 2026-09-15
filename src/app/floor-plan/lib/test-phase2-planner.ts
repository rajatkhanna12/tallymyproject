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
import { validateAreaConsistency } from "./geometry";
import { getSharedWallLength, evaluateAdjacency } from "./planning/adjacency";
import { auditPlanAccessibility } from "./planning/accessibility";
import { calculateCirculationWidth } from "./planning/circulation";

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
    const plan = generateSinglePlan(bm.req, variant);

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
