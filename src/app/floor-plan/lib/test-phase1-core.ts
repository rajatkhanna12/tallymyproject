import { generateFloorPlans, generateFloorPlanResult } from "./layout-engine";
import { normalizeRequirements } from "./parser";
import { HouseRequirements } from "./types";
import {
  roomsOverlap,
  roomWithinBounds,
  validateRequiredRooms,
  validateRequiredBedrooms,
  validateRequiredBathrooms,
  validatePlanFeasibility,
} from "./validation";
import {
  calculateBuildableEnvelope,
  getConceptualSetbacks,
  validateAreaConsistency,
} from "./geometry";

interface BenchmarkCase {
  name: string;
  req: HouseRequirements;
}

const positiveBenchmarks: BenchmarkCase[] = [
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
      parking: { type: "car", quantity: 2 },
      staircase: true,
      balcony: true,
    }),
  },
];

console.log("=================================================");
console.log("PHASE 1 — CORE FOUNDATION REGRESSION TEST SUITE");
console.log("=================================================\n");

let allPassed = true;
let totalAssertions = 0;
let passedAssertions = 0;

function assert(condition: boolean, message: string) {
  totalAssertions++;
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`);
    allPassed = false;
  } else {
    passedAssertions++;
  }
}

// -----------------------------------------------------------------
// PART 1: POSITIVE BENCHMARK VERIFICATION
// -----------------------------------------------------------------
console.log("▶ PART 1: Testing Positive Architectural Benchmarks");

for (const bm of positiveBenchmarks) {
  console.log(`\nTesting Benchmark: [${bm.name}]`);
  const result = generateFloorPlanResult(bm.req);

  assert(result.success === true, `generateFloorPlanResult returned success for ${bm.name}`);
  if (!result.success) continue;

  const { plans } = result;
  assert(plans.length === 3, `Generated exactly 3 style variants for ${bm.name}`);

  for (const plan of plans) {
    const v = plan.styleVariant.toUpperCase();

    // 1. Plot Area Check
    const expectedPlotArea = bm.req.plot.width * bm.req.plot.length;
    assert(
      plan.plot.width === bm.req.plot.width && plan.plot.length === bm.req.plot.length,
      `[${v}] Plot dimensions match request (${plan.plot.width}×${plan.plot.length})`
    );
    assert(
      plan.areas?.plotArea === expectedPlotArea,
      `[${v}] Plot area correctly calculated (${plan.areas?.plotArea} sq ft)`
    );

    // 2. Room Geometry & Bounds Check
    for (const r of plan.rooms) {
      assert(
        r.width > 0 && r.height > 0,
        `[${v}] Room ${r.name} has positive dimensions (${r.width}×${r.height})`
      );
      assert(
        roomWithinBounds(r, bm.req.plot.width, bm.req.plot.length),
        `[${v}] Room ${r.name} within plot bounds [${bm.req.plot.width}×${bm.req.plot.length}]`
      );
    }

    // 3. Room Overlap Check (no two rooms on same floor intersect)
    for (let i = 0; i < plan.rooms.length; i++) {
      for (let j = i + 1; j < plan.rooms.length; j++) {
        const r1 = plan.rooms[i];
        const r2 = plan.rooms[j];
        assert(
          !roomsOverlap(r1, r2),
          `[${v}] No room overlap between "${r1.name}" and "${r2.name}" on Floor ${r1.floor}`
        );
      }
    }

    // 4. Required Room Count Check
    const reqRoomsCheck = validateRequiredRooms(plan.rooms, bm.req);
    assert(
      reqRoomsCheck.valid,
      `[${v}] All required rooms present: ${reqRoomsCheck.missing.join(", ") || "OK"}`
    );

    const reqBeds = bm.req.rooms
      .filter((r) => r.type === "bedroom" || r.type === "master_bedroom")
      .reduce((sum, r) => sum + r.quantity, 0);
    assert(
      validateRequiredBedrooms(plan.rooms, reqBeds),
      `[${v}] Required bedrooms (${reqBeds}) present with 1 Master Bedroom`
    );

    const reqBaths = bm.req.rooms
      .filter((r) => r.type === "bathroom" || r.type === "attached_bath")
      .reduce((sum, r) => sum + r.quantity, 0);
    assert(
      validateRequiredBathrooms(plan.rooms, reqBaths),
      `[${v}] Required bathrooms (${reqBaths}) present`
    );

    // If dining was requested, verify variant did NOT remove it (User Requirement #4)
    if (bm.req.rooms.some((r) => r.type === "dining")) {
      const hasDining = plan.rooms.some((r) => r.type === "dining");
      assert(hasDining, `[${v}] Dining room preserved and not removed by variant logic`);
    }

    // 5. Area Model Consistency & Mathematical Rigor
    const areas = plan.areas;
    assert(!!areas, `[${v}] Detailed areas breakdown exists`);
    if (areas) {
      assert(areas.netRoomArea > 0, `[${v}] Net room area > 0 (${areas.netRoomArea} sq ft)`);
      assert(
        areas.enclosedBuiltUpArea > areas.netRoomArea,
        `[${v}] Wall thickness accounted for: Gross Enclosed (${areas.enclosedBuiltUpArea}) > Net Room (${areas.netRoomArea})`
      );
      assert(
        areas.groundFloorEnclosedArea > 0,
        `[${v}] Ground floor enclosed > 0 (${areas.groundFloorEnclosedArea} sq ft)`
      );
      if (bm.req.floors > 1) {
        assert(
          areas.firstFloorEnclosedArea > 0,
          `[${v}] First floor enclosed > 0 for duplex (${areas.firstFloorEnclosedArea} sq ft)`
        );
      } else {
        assert(
          areas.firstFloorEnclosedArea === 0,
          `[${v}] First floor enclosed === 0 for single-story`
        );
      }
      assert(
        Math.abs(areas.totalBuiltUpArea - (areas.groundFloorEnclosedArea + areas.firstFloorEnclosedArea)) < 0.1,
        `[${v}] Total Built-Up (${areas.totalBuiltUpArea}) equals Ground + First (${areas.groundFloorEnclosedArea + areas.firstFloorEnclosedArea})`
      );

      // Separate reporting: parking, porch, OTS, balcony NOT in enclosed
      assert(areas.parkingArea >= 0, `[${v}] Parking area reported separately (${areas.parkingArea} sq ft)`);
      assert(areas.porchArea >= 0, `[${v}] Porch area reported separately (${areas.porchArea} sq ft)`);
      assert(areas.openToSkyArea >= 0, `[${v}] OTS area reported separately (${areas.openToSkyArea} sq ft)`);
      assert(areas.balconyArea >= 0, `[${v}] Balcony area reported separately (${areas.balconyArea} sq ft)`);
      assert(areas.openSetbackArea >= 0, `[${v}] Open setback area >= 0 (${areas.openSetbackArea} sq ft)`);

      // Ground coverage uses ONLY ground enclosed
      const expectedCoverage = Math.round(((areas.groundFloorEnclosedArea / areas.plotArea) * 100) * 10) / 10;
      assert(
        Math.abs(areas.groundCoveragePct - expectedCoverage) < 0.5,
        `[${v}] Ground coverage ratio (${areas.groundCoveragePct}%) correctly uses ground enclosed only`
      );

      // Area consistency validation
      const areaVal = validateAreaConsistency(areas);
      assert(areaVal.valid, `[${v}] Area consistency check: ${areaVal.errors.join(", ") || "OK"}`);
    }

    // 6. Backwards Compatibility with generateFloorPlans
    const compatPlans = generateFloorPlans(bm.req);
    assert(compatPlans.length === 3, `[${v}] generateFloorPlans() backwards-compatible API returns 3 plans`);
  }

  const p = plans[1]; // practical
  console.log(
    `  ✓ ${bm.name}: ${p.rooms.length} rooms | Net Carpet: ${p.areas?.netRoomArea} sq ft | Gross Built-up: ${p.areas?.enclosedBuiltUpArea} sq ft | Coverage: ${p.areas?.groundCoveragePct}%`
  );
}

// -----------------------------------------------------------------
// PART 2: NEGATIVE TESTS & STRUCTURED INFEASIBILITY
// -----------------------------------------------------------------
console.log("\n▶ PART 2: Testing Negative Cases & Structured Infeasibility");

// Negative Test 1: Impossible Room Count (8 BHK on a 20x30 plot)
{
  console.log("\nNegative Test 1: 8 Bedrooms on a 20x30 plot (Overcrowding space deficit)");
  const req = normalizeRequirements({
    plot: { width: 20, length: 30, unit: "ft" },
    floors: 1,
    rooms: [
      { type: "living", quantity: 1 },
      { type: "kitchen", quantity: 1 },
      { type: "bedroom", quantity: 8 },
      { type: "bathroom", quantity: 4 },
    ],
  });

  const res = generateFloorPlanResult(req);
  assert(res.success === false, "generateFloorPlanResult returned success: false");
  if (!res.success) {
    assert(res.infeasibility.feasible === false, "Infeasibility marked as feasible === false");
    assert(res.infeasibility.issues.length > 0, "Identified specific conflict issues");
    assert(
      res.infeasibility.issues.some((i) => i.code === "SPACE_DEFICIT_OVERCROWDING"),
      "Found SPACE_DEFICIT_OVERCROWDING conflict code"
    );
    assert(
      res.infeasibility.suggestedAlternatives.length > 0,
      "Provided actionable alternatives (e.g. Duplex, reduce bedrooms)"
    );
    console.log(`  ✓ Conflict identified: ${res.infeasibility.issues[0].message}`);
    console.log(`  ✓ Alternative suggested: ${res.infeasibility.suggestedAlternatives[0]}`);
  }

  const compatPlans = generateFloorPlans(req);
  assert(compatPlans.length === 0, "generateFloorPlans() safely returned [] instead of broken plan");
}

// Negative Test 2: Car Parking on Too Narrow Plot (width 12 ft)
{
  console.log("\nNegative Test 2: Car parking on a 12x40 plot (Width conflict)");
  const req = normalizeRequirements({
    plot: { width: 12, length: 40, unit: "ft" },
    floors: 1,
    rooms: [
      { type: "living", quantity: 1 },
      { type: "kitchen", quantity: 1 },
      { type: "bedroom", quantity: 1 },
      { type: "bathroom", quantity: 1 },
    ],
    parking: { type: "car", quantity: 1 },
  });

  const res = generateFloorPlanResult(req);
  assert(res.success === false, "generateFloorPlanResult returned success: false for narrow car plot");
  if (!res.success) {
    assert(
      res.infeasibility.issues.some((i) => i.code === "CAR_PARKING_WIDTH_CONFLICT"),
      "Found CAR_PARKING_WIDTH_CONFLICT code"
    );
    assert(
      res.infeasibility.suggestedAlternatives.some((a) => a.includes("bike")),
      "Suggested switching to bike parking"
    );
    console.log(`  ✓ Conflict identified: ${res.infeasibility.issues[0].message}`);
  }
}

// Negative Test 3: Two Cars on a 16 ft Plot (Multi-car width conflict)
{
  console.log("\nNegative Test 3: 2 Cars on 16 ft road frontage (Multi-car width conflict)");
  const req = normalizeRequirements({
    plot: { width: 16, length: 50, unit: "ft" },
    floors: 1,
    rooms: [
      { type: "living", quantity: 1 },
      { type: "kitchen", quantity: 1 },
      { type: "bedroom", quantity: 1 },
      { type: "bathroom", quantity: 1 },
    ],
    parking: { type: "car", quantity: 2 },
  });

  const res = generateFloorPlanResult(req);
  assert(res.success === false, "generateFloorPlanResult returned success: false for 2 cars on 16'");
  if (!res.success) {
    assert(
      res.infeasibility.issues.some((i) => i.code === "MULTI_CAR_WIDTH_CONFLICT"),
      "Found MULTI_CAR_WIDTH_CONFLICT code"
    );
    console.log(`  ✓ Conflict identified: ${res.infeasibility.issues[0].message}`);
  }
}

// Negative Test 4: Invalid / Zero / Negative Dimensions
{
  console.log("\nNegative Test 4: Invalid zero/negative dimensions");
  const req: HouseRequirements = {
    plot: { width: 0, length: 50, unit: "ft" },
    floors: 1,
    rooms: [{ type: "living", quantity: 1 }],
  };

  const res = generateFloorPlanResult(req);
  assert(res.success === false, "generateFloorPlanResult returned success: false for 0 width");
  if (!res.success) {
    assert(
      res.infeasibility.issues.some((i) => i.code === "INVALID_PLOT_DIMENSIONS"),
      "Found INVALID_PLOT_DIMENSIONS code"
    );
    console.log(`  ✓ Conflict identified: ${res.infeasibility.issues[0].message}`);
  }
}

// -----------------------------------------------------------------
// PART 3: PHASE 1.1 FOUNDATION & SEMANTICS VERIFICATION
// -----------------------------------------------------------------
console.log("\n▶ PART 3: Phase 1.1 Semantics & Foundation Verification");

// 1. Conceptual Setback Semantics
{
  console.log("\nTesting 1.1.1: Conceptual Setback Semantics");
  const defaultSetbacks = getConceptualSetbacks(23, 50);
  assert(
    defaultSetbacks.front === 0 &&
      defaultSetbacks.rear === 0 &&
      defaultSetbacks.left === 0 &&
      defaultSetbacks.right === 0,
    "Default setbacks are 0 (representing 'no conceptual setback assumption supplied')"
  );

  const fullEnvelope = calculateBuildableEnvelope(23, 50, defaultSetbacks);
  assert(
    fullEnvelope.width === 23 && fullEnvelope.length === 50 && fullEnvelope.area === 1150,
    "Default envelope matches full plot boundary (23×50 = 1150 sq ft) for conceptual drafting"
  );

  const customSetbacks = getConceptualSetbacks(30, 60, 2, {
    front: 5,
    rear: 3,
    left: 3,
    right: 2,
  });
  assert(
    customSetbacks.front === 5 &&
      customSetbacks.rear === 3 &&
      customSetbacks.left === 3 &&
      customSetbacks.right === 2,
    "Explicit custom setbacks correctly respected"
  );

  const constrainedEnvelope = calculateBuildableEnvelope(30, 60, customSetbacks);
  assert(
    constrainedEnvelope.width === 25 && // 30 - 3 - 2
      constrainedEnvelope.length === 52 && // 60 - 5 - 3
      constrainedEnvelope.area === 1300,
    "Constrained envelope correctly subtracts setbacks: width=25', length=52', area=1300 sq ft"
  );
}

// 2. Pre-Generation Screening Check Semantics
{
  console.log("\nTesting 1.1.2: Pre-Generation Screening Check");
  const validReq = normalizeRequirements({
    plot: { width: 23, length: 50, unit: "ft" },
    floors: 1,
    rooms: [
      { type: "living", quantity: 1 },
      { type: "kitchen", quantity: 1 },
      { type: "bedroom", quantity: 2 },
      { type: "bathroom", quantity: 2 },
    ],
  });

  const validScreening = validatePlanFeasibility(validReq);
  assert(validScreening.feasible === true, "Feasible requirements pass pre-generation screening check");
  assert(validScreening.issues.length === 0, "No issues reported for valid 23×50 2BHK");

  const impossibleReq = normalizeRequirements({
    plot: { width: 18, length: 30, unit: "ft" },
    floors: 1,
    rooms: [
      { type: "living", quantity: 1 },
      { type: "kitchen", quantity: 1 },
      { type: "bedroom", quantity: 7 },
      { type: "bathroom", quantity: 4 },
    ],
  });

  const infeasibleScreening = validatePlanFeasibility(impossibleReq);
  assert(
    infeasibleScreening.feasible === false,
    "Impossible requirements fail pre-generation screening check"
  );
  assert(
    infeasibleScreening.issues.some((i) => i.code === "SPACE_DEFICIT_OVERCROWDING"),
    "Screening check flags SPACE_DEFICIT_OVERCROWDING before generation"
  );
  assert(
    infeasibleScreening.suggestedAlternatives.length > 0,
    "Screening check provides proactive architectural alternatives"
  );
}

// 3. Estimated Geometric Gross Area Verification
{
  console.log("\nTesting 1.1.3: Estimated Geometric Gross Area Semantics");
  const req = normalizeRequirements({
    plot: { width: 23, length: 50, unit: "ft" },
    floors: 1,
  });
  const res = generateFloorPlanResult(req);
  assert(res.success === true, "Generation succeeds for 23×50 baseline");
  if (res.success) {
    for (const p of res.plans) {
      assert(
        p.areas!.netRoomArea < p.areas!.enclosedBuiltUpArea,
        `[${p.styleVariant}] Net carpet (${p.areas!.netRoomArea}) < Estimated gross enclosed (${p.areas!.enclosedBuiltUpArea})`
      );
      assert(
        Math.abs(p.areas!.totalBuiltUpArea - (p.areas!.groundFloorEnclosedArea + p.areas!.firstFloorEnclosedArea)) < 0.1,
        `[${p.styleVariant}] Total built-up equals Ground + First enclosed`
      );
    }
  }
}

// -----------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------
console.log("\n=================================================");
console.log(`TEST RESULTS: ${passedAssertions}/${totalAssertions} ASSERTIONS PASSED`);
if (allPassed) {
  console.log("✅ ALL PHASE 1 REQUIREMENTS & BENCHMARKS VERIFIED SUCCESSFULLY!");
  console.log("=================================================");
  process.exit(0);
} else {
  console.error("❌ SOME ASSERTIONS FAILED!");
  console.log("=================================================");
  process.exit(1);
}
