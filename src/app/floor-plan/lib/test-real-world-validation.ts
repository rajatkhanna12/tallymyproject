import { generateSinglePlan, generateFloorPlanResult } from "./layout-engine";
import { normalizeRequirements } from "./parser";
import { validateFloorPlan } from "./validation";
import { auditPlanAccessibility, auditDuplexAccessibility, validateVerticalConnectivity } from "./planning/accessibility";

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
console.log("REAL-WORLD VALIDATION TEST SUITE (10 SCENARIOS + DETERMINISM)");
console.log("===============================================================================\n");

// ---------------------------------------------------------------------------------
// SCENARIO 1: Small Single-Floor (20x30, 2BHK, 2 baths, no parking)
// ---------------------------------------------------------------------------------
console.log("▶ Scenario 1: Small Single-Floor Plot (20x30, 2BHK, 2 Baths, No Parking)");
{
  const req = normalizeRequirements({
    plot: { width: 20, length: 30, unit: "ft" },
    floors: 1,
    rooms: [
      { type: "living", quantity: 1 },
      { type: "kitchen", quantity: 1 },
      { type: "bedroom", quantity: 2 },
      { type: "bathroom", quantity: 2 },
    ],
    parking: { type: "none" },
  });

  const res = generateFloorPlanResult(req);
  assert(res.success === true, "Scenario 1 generation succeeded");
  if (res.success) {
    assert(res.plans.length === 3, "Scenario 1 has all 3 style variants");
    for (const p of res.plans) {
      const beds = p.rooms.filter((r) => r.type === "bedroom" || r.type === "master_bedroom").length;
      const baths = p.rooms.filter((r) => r.type === "bathroom" || r.type === "attached_bath").length;
      assert(beds === 2, `Scenario 1 (${p.styleVariant}) has 2 bedrooms (got ${beds})`);
      assert(baths >= 2, `Scenario 1 (${p.styleVariant}) has at least 2 bathrooms (got ${baths})`);
      const val = validateFloorPlan(p, req);
      assert(val.boundaryViolations.length === 0 && val.overlaps.length === 0, `Scenario 1 (${p.styleVariant}) passes geometric validation`);
      const access = auditPlanAccessibility(p.rooms, p.doors, p.windows, 0);
      assert(access.allReachable, `Scenario 1 (${p.styleVariant}) all rooms reachable via BFS`);
      assert((p.layoutScore?.total ?? 0) >= 75, `Scenario 1 (${p.styleVariant}) score >= 75 (got ${p.layoutScore?.total})`);
    }
  }
}

// ---------------------------------------------------------------------------------
// SCENARIO 2: Medium Single-Floor (30x50, 3BHK, car parking, 2 baths, dining)
// ---------------------------------------------------------------------------------
console.log("\n▶ Scenario 2: Medium Single-Floor Plot (30x50, 3BHK, Car Parking, Dining)");
{
  const req = normalizeRequirements({
    plot: { width: 30, length: 50, unit: "ft" },
    floors: 1,
    rooms: [
      { type: "living", quantity: 1 },
      { type: "kitchen", quantity: 1 },
      { type: "dining", quantity: 1 },
      { type: "bedroom", quantity: 3 },
      { type: "bathroom", quantity: 2 },
    ],
    parking: { type: "car", quantity: 1 },
  });

  const res = generateFloorPlanResult(req);
  assert(res.success === true, "Scenario 2 generation succeeded");
  if (res.success) {
    assert(res.plans.length === 3, "Scenario 2 has all 3 style variants");
    for (const p of res.plans) {
      const beds = p.rooms.filter((r) => r.type === "bedroom" || r.type === "master_bedroom").length;
      const dining = p.rooms.some((r) => r.type === "dining");
      const parking = p.rooms.some((r) => r.type === "parking");
      assert(beds === 3, `Scenario 2 (${p.styleVariant}) has 3 bedrooms (got ${beds})`);
      assert(dining, `Scenario 2 (${p.styleVariant}) has dining room`);
      assert(parking, `Scenario 2 (${p.styleVariant}) has parking porch`);
      const val = validateFloorPlan(p, req);
      assert(val.boundaryViolations.length === 0 && val.overlaps.length === 0, `Scenario 2 (${p.styleVariant}) passes geometric validation`);
      const access = auditPlanAccessibility(p.rooms, p.doors, p.windows, 0);
      assert(access.allReachable, `Scenario 2 (${p.styleVariant}) all rooms reachable via BFS`);
      assert((p.layoutScore?.total ?? 0) >= 75, `Scenario 2 (${p.styleVariant}) score >= 75 (got ${p.layoutScore?.total})`);
    }
  }
}

// ---------------------------------------------------------------------------------
// SCENARIO 3: Large Single-Floor (40x60, 4BHK, car parking, 3 baths, dining)
// ---------------------------------------------------------------------------------
console.log("\n▶ Scenario 3: Large Single-Floor Plot (40x60, 4BHK, Car Parking, 3 Baths)");
{
  const req = normalizeRequirements({
    plot: { width: 40, length: 60, unit: "ft" },
    floors: 1,
    rooms: [
      { type: "living", quantity: 1 },
      { type: "kitchen", quantity: 1 },
      { type: "dining", quantity: 1 },
      { type: "bedroom", quantity: 4 },
      { type: "bathroom", quantity: 3 },
    ],
    parking: { type: "car", quantity: 1 },
  });

  const res = generateFloorPlanResult(req);
  assert(res.success === true, "Scenario 3 generation succeeded");
  if (res.success) {
    assert(res.plans.length === 3, "Scenario 3 has 3 plans");
    for (const p of res.plans) {
      const beds = p.rooms.filter((r) => r.type === "bedroom" || r.type === "master_bedroom").length;
      const baths = p.rooms.filter((r) => r.type === "bathroom" || r.type === "attached_bath").length;
      assert(beds === 4, `Scenario 3 (${p.styleVariant}) has all 4 bedrooms on ground floor (got ${beds})`);
      assert(baths >= 3, `Scenario 3 (${p.styleVariant}) has at least 3 bathrooms (got ${baths})`);
      const val = validateFloorPlan(p, req);
      assert(val.boundaryViolations.length === 0 && val.overlaps.length === 0, `Scenario 3 (${p.styleVariant}) passes geometric validation`);
      const access = auditPlanAccessibility(p.rooms, p.doors, p.windows, 0);
      assert(access.allReachable, `Scenario 3 (${p.styleVariant}) all rooms reachable via BFS`);
      assert((p.layoutScore?.total ?? 0) >= 80, `Scenario 3 (${p.styleVariant}) score >= 80 (got ${p.layoutScore?.total})`);
    }
  }
}

// ---------------------------------------------------------------------------------
// SCENARIO 4: Narrow Plot (15x40, 2BHK, bike parking, 2 baths)
// ---------------------------------------------------------------------------------
console.log("\n▶ Scenario 4: Narrow Plot (15x40, 2BHK, Bike Parking)");
{
  const req = normalizeRequirements({
    plot: { width: 15, length: 40, unit: "ft" },
    floors: 1,
    rooms: [
      { type: "living", quantity: 1 },
      { type: "kitchen", quantity: 1 },
      { type: "bedroom", quantity: 2 },
      { type: "bathroom", quantity: 2 },
    ],
    parking: { type: "bike", quantity: 1 },
  });

  const planRes = generateSinglePlan(req, "practical");
  assert(!("success" in planRes), "Scenario 4 practical plan succeeded");
  if (!("success" in planRes)) {
    const p = planRes;
    const beds = p.rooms.filter((r) => r.type === "bedroom" || r.type === "master_bedroom").length;
    assert(beds === 2, `Scenario 4 has 2 bedrooms (got ${beds})`);
    const val = validateFloorPlan(p, req);
    assert(val.boundaryViolations.length === 0 && val.overlaps.length === 0, "Scenario 4 passes geometric validation");
    const ots = p.rooms.find((r) => r.type === "ots");
    assert(!!ots && ots.width >= 2.2, `Scenario 4 OTS shaft width >= 2.2ft (got ${ots?.width})`);
    const access = auditPlanAccessibility(p.rooms, p.doors, p.windows, 0);
    assert(access.allReachable, "Scenario 4 all rooms reachable via BFS");
    assert((p.layoutScore?.total ?? 0) >= 70, `Scenario 4 score >= 70 (got ${p.layoutScore?.total})`);
  }

  const compactRes = generateSinglePlan(req, "compact");
  assert(!("success" in compactRes), "Scenario 4 compact plan succeeded");
  if (!("success" in compactRes)) {
    const p = compactRes;
    const access = auditPlanAccessibility(p.rooms, p.doors, p.windows, 0);
    assert(access.allReachable, "Scenario 4 compact all rooms reachable via BFS");
  }
}

// ---------------------------------------------------------------------------------
// SCENARIO 5: G+1 Duplex (30x50, 4BHK, staircase, car parking, 3 baths)
// ---------------------------------------------------------------------------------
console.log("\n▶ Scenario 5: G+1 Duplex (30x50, 4BHK, Staircase, Car Parking)");
{
  const req = normalizeRequirements({
    plot: { width: 30, length: 50, unit: "ft" },
    floors: 2,
    rooms: [
      { type: "living", quantity: 1 },
      { type: "kitchen", quantity: 1 },
      { type: "dining", quantity: 1 },
      { type: "bedroom", quantity: 4 },
      { type: "bathroom", quantity: 3 },
    ],
    parking: { type: "car", quantity: 1 },
    staircase: true,
  });

  const res = generateFloorPlanResult(req);
  assert(res.success === true, "Scenario 5 generation succeeded");
  if (res.success) {
    for (const p of res.plans) {
      const gfRooms = p.rooms.filter((r) => r.floor === 0);
      const ffRooms = p.rooms.filter((r) => r.floor === 1);
      assert(gfRooms.length > 0 && ffRooms.length > 0, `Scenario 5 (${p.styleVariant}) has both GF and FF rooms`);
      const beds = p.rooms.filter((r) => r.type === "bedroom" || r.type === "master_bedroom").length;
      assert(beds === 4, `Scenario 5 (${p.styleVariant}) has 4 bedrooms total (got ${beds})`);
      const stair = p.rooms.find((r) => r.type === "staircase");
      assert(!!stair && !!stair.verticalCoreId, `Scenario 5 (${p.styleVariant}) has vertical core staircase`);
      const vCore = validateVerticalConnectivity(p.rooms);
      assert(vCore.valid, `Scenario 5 (${p.styleVariant}) vertical connectivity is valid`);
      const access = auditDuplexAccessibility(p.rooms, p.doors, p.windows);
      assert(access.allReachable, `Scenario 5 (${p.styleVariant}) cross-floor BFS reaches all rooms`);
      assert((p.layoutScore?.total ?? 0) >= 80, `Scenario 5 (${p.styleVariant}) score >= 80 (got ${p.layoutScore?.total})`);
    }
  }
}

// ---------------------------------------------------------------------------------
// SCENARIO 6: Larger Duplex (40x60, 5BHK, staircase, car parking, 4 baths)
// ---------------------------------------------------------------------------------
console.log("\n▶ Scenario 6: Larger Duplex (40x60, 5BHK, Staircase, Car Parking)");
{
  const req = normalizeRequirements({
    plot: { width: 40, length: 60, unit: "ft" },
    floors: 2,
    rooms: [
      { type: "living", quantity: 1 },
      { type: "kitchen", quantity: 1 },
      { type: "dining", quantity: 1 },
      { type: "bedroom", quantity: 5 },
      { type: "bathroom", quantity: 4 },
    ],
    parking: { type: "car", quantity: 1 },
    staircase: true,
  });

  const res = generateFloorPlanResult(req);
  assert(res.success === true, "Scenario 6 generation succeeded");
  if (res.success) {
    for (const p of res.plans) {
      const beds = p.rooms.filter((r) => r.type === "bedroom" || r.type === "master_bedroom").length;
      assert(beds === 5, `Scenario 6 (${p.styleVariant}) has 5 bedrooms total (got ${beds})`);
      const gfBeds = p.rooms.filter((r) => (r.type === "bedroom" || r.type === "master_bedroom") && r.floor === 0).length;
      const ffBeds = p.rooms.filter((r) => (r.type === "bedroom" || r.type === "master_bedroom") && r.floor === 1).length;
      assert(gfBeds >= 2 && ffBeds >= 3, `Scenario 6 (${p.styleVariant}) distributes beds realistically (GF: ${gfBeds}, FF: ${ffBeds})`);
      const vCore = validateVerticalConnectivity(p.rooms);
      assert(vCore.valid, `Scenario 6 (${p.styleVariant}) vertical connectivity is valid`);
      const access = auditDuplexAccessibility(p.rooms, p.doors, p.windows);
      assert(access.allReachable, `Scenario 6 (${p.styleVariant}) cross-floor BFS reaches all rooms`);
      assert((p.layoutScore?.total ?? 0) >= 78, `Scenario 6 (${p.styleVariant}) score >= 78 (got ${p.layoutScore?.total})`);
    }
  }
}

// ---------------------------------------------------------------------------------
// SCENARIO 7: Duplex Explicit Dining (30x60, 3BHK, staircase, car parking)
// ---------------------------------------------------------------------------------
console.log("\n▶ Scenario 7: Duplex Explicit Dining Requirement (30x60, 3BHK)");
{
  const req = normalizeRequirements({
    plot: { width: 30, length: 60, unit: "ft" },
    floors: 2,
    rooms: [
      { type: "living", quantity: 1 },
      { type: "kitchen", quantity: 1 },
      { type: "dining", quantity: 1 },
      { type: "bedroom", quantity: 3 },
      { type: "bathroom", quantity: 3 },
    ],
    parking: { type: "car", quantity: 1 },
    staircase: true,
  });

  const res = generateFloorPlanResult(req);
  assert(res.success === true, "Scenario 7 generation succeeded");
  if (res.success) {
    for (const p of res.plans) {
      const dining = p.rooms.find((r) => r.type === "dining");
      assert(!!dining, `Scenario 7 (${p.styleVariant}) dining room explicitly preserved`);
      assert(dining?.floor === 0, `Scenario 7 (${p.styleVariant}) dining room located on Ground Floor`);
      const beds = p.rooms.filter((r) => r.type === "bedroom" || r.type === "master_bedroom").length;
      assert(beds === 3, `Scenario 7 (${p.styleVariant}) has 3 bedrooms total (got ${beds})`);
      const access = auditDuplexAccessibility(p.rooms, p.doors, p.windows);
      assert(access.allReachable, `Scenario 7 (${p.styleVariant}) cross-floor BFS reaches all rooms`);
      assert((p.layoutScore?.total ?? 0) >= 85, `Scenario 7 (${p.styleVariant}) score >= 85 (got ${p.layoutScore?.total})`);
    }
  }
}

// ---------------------------------------------------------------------------------
// SCENARIO 8: Duplex Adaptive Room Distribution (25x50, 4BHK, bike parking)
// ---------------------------------------------------------------------------------
console.log("\n▶ Scenario 8: Duplex Adaptive Distribution (25x50, 4BHK)");
{
  const req = normalizeRequirements({
    plot: { width: 25, length: 50, unit: "ft" },
    floors: 2,
    rooms: [
      { type: "living", quantity: 1 },
      { type: "kitchen", quantity: 1 },
      { type: "dining", quantity: 1 },
      { type: "bedroom", quantity: 4 },
      { type: "bathroom", quantity: 3 },
    ],
    parking: { type: "bike", quantity: 1 },
    staircase: true,
  });

  const res = generateFloorPlanResult(req);
  assert(res.success === true, "Scenario 8 generation succeeded");
  if (res.success) {
    for (const p of res.plans) {
      const gfBeds = p.rooms.filter((r) => (r.type === "bedroom" || r.type === "master_bedroom") && r.floor === 0).length;
      const ffBeds = p.rooms.filter((r) => (r.type === "bedroom" || r.type === "master_bedroom") && r.floor === 1).length;
      assert(gfBeds + ffBeds === 4, `Scenario 8 (${p.styleVariant}) has 4 bedrooms total (GF: ${gfBeds}, FF: ${ffBeds})`);
      assert(gfBeds >= 1 && ffBeds >= 1, `Scenario 8 (${p.styleVariant}) adaptive distribution places beds on both floors`);
      const access = auditDuplexAccessibility(p.rooms, p.doors, p.windows);
      assert(access.allReachable, `Scenario 8 (${p.styleVariant}) cross-floor BFS reaches all rooms`);
      assert((p.layoutScore?.total ?? 0) >= 80, `Scenario 8 (${p.styleVariant}) score >= 80 (got ${p.layoutScore?.total})`);
    }
  }
}

// ---------------------------------------------------------------------------------
// SCENARIO 9: Parking-Heavy Infeasible Plot (16x40, 2 cars)
// ---------------------------------------------------------------------------------
console.log("\n▶ Scenario 9: Parking-Heavy Infeasible Plot (16x40, 2 Cars)");
{
  const req = normalizeRequirements({
    plot: { width: 16, length: 40, unit: "ft" },
    floors: 1,
    rooms: [
      { type: "living", quantity: 1 },
      { type: "kitchen", quantity: 1 },
      { type: "bedroom", quantity: 2 },
      { type: "bathroom", quantity: 2 },
    ],
    parking: { type: "car", quantity: 2 },
  });

  const res = generateSinglePlan(req, "practical");
  assert("success" in res && res.success === false, "Scenario 9 correctly rejected as infeasible");
  if ("success" in res && !res.success) {
    const issue = res.infeasibility.issues[0];
    assert(issue.code === "MULTI_CAR_WIDTH_CONFLICT", `Scenario 9 rejection code is MULTI_CAR_WIDTH_CONFLICT (got ${issue.code})`);
    assert(issue.message.length > 0, "Scenario 9 has clear structured error message");
  }
}

// ---------------------------------------------------------------------------------
// SCENARIO 10: Intentionally Infeasible Plot (15x20, 4 beds, 3 baths on 1 floor)
// ---------------------------------------------------------------------------------
console.log("\n▶ Scenario 10: Intentionally Infeasible Overcrowded Plot (15x20, 4 Beds, 3 Baths)");
{
  const req = normalizeRequirements({
    plot: { width: 15, length: 20, unit: "ft" },
    floors: 1,
    rooms: [
      { type: "living", quantity: 1 },
      { type: "kitchen", quantity: 1 },
      { type: "bedroom", quantity: 4 },
      { type: "bathroom", quantity: 3 },
    ],
    parking: { type: "none" },
  });

  const res = generateSinglePlan(req, "compact");
  assert("success" in res && res.success === false, "Scenario 10 correctly rejected as infeasible");
  if ("success" in res && !res.success) {
    const issue = res.infeasibility.issues[0];
    assert(issue.code === "SPACE_DEFICIT_OVERCROWDING", `Scenario 10 rejection code is SPACE_DEFICIT_OVERCROWDING (got ${issue.code})`);
    assert(issue.message.length > 0, "Scenario 10 has clear structured error message");
  }
}

// ---------------------------------------------------------------------------------
// DETERMINISM VERIFICATION
// ---------------------------------------------------------------------------------
console.log("\n▶ Determinism Verification: Running Scenarios Multiple Times");
{
  const req = normalizeRequirements({
    plot: { width: 30, length: 50, unit: "ft" },
    floors: 1,
    rooms: [
      { type: "living", quantity: 1 },
      { type: "kitchen", quantity: 1 },
      { type: "dining", quantity: 1 },
      { type: "bedroom", quantity: 3 },
      { type: "bathroom", quantity: 2 },
    ],
    parking: { type: "car", quantity: 1 },
  });

  const run1 = generateSinglePlan(req, "spacious");
  const run2 = generateSinglePlan(req, "spacious");
  const run3 = generateSinglePlan(req, "spacious");

  assert(!("success" in run1) && !("success" in run2) && !("success" in run3), "All 3 determinism runs succeeded");
  if (!("success" in run1) && !("success" in run2) && !("success" in run3)) {
    const score1 = run1.layoutScore?.total;
    const score2 = run2.layoutScore?.total;
    const score3 = run3.layoutScore?.total;
    assert(score1 === score2 && score2 === score3, `Scores are 100% deterministic (${score1} === ${score2} === ${score3})`);

    const rooms1 = run1.rooms.map((r) => `${r.name}:${r.x},${r.y},${r.width},${r.height}`).sort().join(";");
    const rooms2 = run2.rooms.map((r) => `${r.name}:${r.x},${r.y},${r.width},${r.height}`).sort().join(";");
    const rooms3 = run3.rooms.map((r) => `${r.name}:${r.x},${r.y},${r.width},${r.height}`).sort().join(";");
    assert(rooms1 === rooms2 && rooms2 === rooms3, "Room footprints and placement are 100% deterministic across runs");

    const reasons1 = (run1.selectionReasons || []).join("|");
    const reasons2 = (run2.selectionReasons || []).join("|");
    assert(reasons1 === reasons2, "Selection reasons are 100% deterministic");
  }
}

// ---------------------------------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------------------------------
console.log("\n===============================================================================");
console.log(`REAL-WORLD VALIDATION SUMMARY: ${passedAssertions}/${totalAssertions} Assertions Passed`);
console.log("===============================================================================");

if (passedAssertions !== totalAssertions) {
  process.exit(1);
}
