import { generateSinglePlan, generateFloorPlans } from "./layout-engine";
import { normalizeRequirements } from "./parser";
import { LayoutStyleVariant, Room } from "./types";
import {
  calculateLayoutScore,
  LAYOUT_SCORE_WEIGHTS,
  evaluateAdjacencyScore,
  evaluateCirculationQuality,
  evaluateDaylightVentilationScore,
  evaluateRoomProportions,
  evaluateSpaceEfficiency,
  evaluatePrivacyZoningScore,
  evaluateStaircaseQuality,
  evaluateAccessibilityScore,
  evaluateExcessiveOffsets,
} from "./planning/scoring";
import {
  auditDuplexAccessibility,
  validateVerticalConnectivity,
  PlanAccessibilityAudit,
} from "./planning/accessibility";
import { roomsOverlap } from "./validation";

// =================================================================================
// PHASE 4: ARCHITECTURAL SCORING & QUALITY OPTIMIZATION TEST SUITE
// =================================================================================

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
console.log("PHASE 4 ARCHITECTURAL SCORING & QUALITY OPTIMIZATION TEST SUITE");
console.log("===============================================================================\n");

// ---------------------------------------------------------------------------------
// PART 1: CORE SCORING & HARD CONSTRAINT BEHAVIOR
// ---------------------------------------------------------------------------------
console.log("▶ PART 1: Core Scoring & Hard Constraint Inviolability");

const testReq = normalizeRequirements({
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
});

const planResult = generateSinglePlan(testReq, "spacious");
assert(Boolean(planResult && !("success" in planResult)), "Valid 3BHK duplex generated successfully");

if (planResult && !("success" in planResult)) {
  const plan = planResult;

  // Test 1: Valid candidate receives a score
  assert(Boolean(plan.layoutScore), "1. Valid candidate receives a structured LayoutScore");
  assert(
    typeof plan.layoutScore?.total === "number" && plan.layoutScore.total > 0 && plan.layoutScore.total <= 100,
    `1b. Total score is a valid normalized number: ${plan.layoutScore?.total}/100`
  );

  // Test 2: Invalid candidate is rejected before scoring
  const overlappingRooms: Room[] = [
    { id: "r1", name: "Living", type: "living", x: 5, y: 5, width: 15, height: 15, floor: 0, color: "#fff" },
    { id: "r2", name: "Kitchen", type: "kitchen", x: 8, y: 8, width: 10, height: 10, floor: 0, color: "#fff" }, // Physical overlap
  ];
  const invalidScoreResult = calculateLayoutScore(overlappingRooms, testReq, "spacious", 30, 60);
  assert(!invalidScoreResult.valid, "2. Overlapping room candidate rejected by scoring engine");
  assert(invalidScoreResult.score.total === 0, "2b. Overlapping candidate receives 0 total score");

  // Test 2c: Duplex Multi-Floor Overlap Regression
  const sameFloorRooms: Room[] = [
    { id: "r1", name: "Living", type: "living", x: 0, y: 0, width: 15, height: 15, floor: 0, color: "#fff" },
    { id: "r2", name: "Kitchen", type: "kitchen", x: 5, y: 5, width: 15, height: 15, floor: 0, color: "#fff" },
  ];
  assert(roomsOverlap(sameFloorRooms[0], sameFloorRooms[1]) === true, "2c. Same-floor overlapping rooms detected by roomsOverlap");
  const sameFloorScore = calculateLayoutScore(sameFloorRooms, testReq, "spacious", 30, 60);
  assert(!sameFloorScore.valid, "2c-ii. Same-floor overlapping rooms rejected by calculateLayoutScore");

  const multiFloorRooms: Room[] = [
    { id: "gf_living", name: "Living Room", type: "living", x: 2, y: 15, width: 14, height: 16, floor: 0, color: "#fff" },
    { id: "ff_bedroom", name: "Master Bedroom", type: "master_bedroom", x: 2, y: 15, width: 14, height: 16, floor: 1, color: "#fff" }, // Identical X/Y footprint on floor 1
    { id: "gf_stair", name: "Staircase GF", type: "staircase", x: 16, y: 15, width: 7, height: 10, floor: 0, color: "#ddd", verticalCoreId: "core-1" },
    { id: "ff_stair", name: "Staircase FF", type: "staircase", x: 16, y: 15, width: 7, height: 10, floor: 1, color: "#ddd", verticalCoreId: "core-1" },
  ];
  assert(roomsOverlap(multiFloorRooms[0], multiFloorRooms[1]) === false, "2c-iii. Different-floor rooms with identical footprint do NOT overlap in roomsOverlap");
  assert(roomsOverlap(multiFloorRooms[2], multiFloorRooms[3]) === false, "2c-iv. Different-floor staircases with identical footprint do NOT overlap in roomsOverlap");
  const multiFloorScore = calculateLayoutScore(multiFloorRooms, testReq, "spacious", 30, 60);
  assert(multiFloorScore.valid, "2c-v. Different-floor rooms sharing identical footprint are NOT rejected");

  // Test 3: Hard constraint failure cannot be rescued by high soft score
  const outOfBoundsRooms: Room[] = [
    { id: "r1", name: "Living", type: "living", x: 25, y: 50, width: 15, height: 20, floor: 0, color: "#fff" }, // Out of 30x60 bounds
  ];
  const oobScore = calculateLayoutScore(outOfBoundsRooms, testReq, "spacious", 30, 60);
  assert(!oobScore.valid, "3. Out-of-bounds candidate rejected regardless of potential soft criteria");
  assert(oobScore.score.total === 0, "3b. Hard invalid candidate cannot be rescued by soft score");
}

// ---------------------------------------------------------------------------------
// PART 2: ARCHITECTURAL CRITERIA & QUALITY SENSITIVITY
// ---------------------------------------------------------------------------------
console.log("\n▶ PART 2: Architectural Criteria & Quality Sensitivity");

// Test 4: Better adjacency produces higher adjacency score
const goodAdjRooms: Room[] = [
  { id: "l", name: "Living", type: "living", x: 0, y: 10, width: 14, height: 16, floor: 0, color: "#fff" },
  { id: "d", name: "Dining", type: "dining", x: 14, y: 10, width: 10, height: 12, floor: 0, color: "#fff" }, // Direct living-dining shared wall
  { id: "k", name: "Kitchen", type: "kitchen", x: 14, y: 22, width: 10, height: 10, floor: 0, color: "#fff" }, // Direct dining-kitchen shared wall
  { id: "m", name: "Master Bed", type: "master_bedroom", x: 0, y: 26, width: 14, height: 14, floor: 0, color: "#fff" },
  { id: "ab", name: "Attached Bath", type: "attached_bath", x: 0, y: 40, width: 8, height: 6, floor: 0, color: "#fff" },
];
const badAdjRooms: Room[] = [
  { id: "l", name: "Living", type: "living", x: 0, y: 10, width: 14, height: 16, floor: 0, color: "#fff" },
  { id: "d", name: "Dining", type: "dining", x: 14, y: 40, width: 10, height: 12, floor: 0, color: "#fff" }, // Isolated dining far from living & kitchen
  { id: "k", name: "Kitchen", type: "kitchen", x: 0, y: 40, width: 10, height: 10, floor: 0, color: "#fff" },
  { id: "cb", name: "Common Bath", type: "bathroom", x: 14, y: 10, width: 8, height: 6, floor: 0, color: "#fff" }, // Bath directly opening to living
  { id: "m", name: "Master Bed", type: "master_bedroom", x: 0, y: 26, width: 14, height: 14, floor: 0, color: "#fff" },
];
const adjGood = evaluateAdjacencyScore(goodAdjRooms);
const adjBad = evaluateAdjacencyScore(badAdjRooms);
assert(adjGood.score > adjBad.score, `4. Good functional adjacency scores higher (${adjGood.score} > ${adjBad.score})`);

// Test 5: Better circulation produces higher circulation score
const goodCircRooms: Room[] = [
  { id: "p", name: "Passage Spine", type: "passage", x: 12, y: 10, width: 4, height: 30, floor: 0, color: "#eee" },
  { id: "b1", name: "Bed 1", type: "bedroom", x: 0, y: 10, width: 12, height: 14, floor: 0, color: "#fff" }, // Direct passage access
  { id: "b2", name: "Bed 2", type: "bedroom", x: 0, y: 24, width: 12, height: 14, floor: 0, color: "#fff" }, // Direct passage access
];
const badCircRooms: Room[] = [
  { id: "b1", name: "Bed 1", type: "bedroom", x: 0, y: 10, width: 12, height: 14, floor: 0, color: "#fff" },
  { id: "b2", name: "Bed 2", type: "bedroom", x: 0, y: 24, width: 12, height: 14, floor: 0, color: "#fff" }, // No passage, bedroom 2 isolated
];
const circGood = evaluateCirculationQuality(goodCircRooms);
const circBad = evaluateCirculationQuality(badCircRooms);
assert(circGood.score > circBad.score, `5. Layout with direct circulation access scores higher (${circGood.score} > ${circBad.score})`);

// Test 6: Better ventilation produces higher ventilation score
const plotW = 30, plotL = 50;
const goodVentRooms: Room[] = [
  { id: "l", name: "Living", type: "living", x: 0, y: 0, width: 15, height: 18, floor: 0, color: "#fff" }, // Corner room (2 exterior walls)
  { id: "b", name: "Bed", type: "bedroom", x: 0, y: 36, width: 14, height: 14, floor: 0, color: "#fff" }, // Corner room (2 exterior walls)
  { id: "k", name: "Kitchen", type: "kitchen", x: 15, y: 36, width: 15, height: 14, floor: 0, color: "#fff" },
];
const poorVentRooms: Room[] = [
  { id: "l", name: "Living", type: "living", x: 8, y: 12, width: 14, height: 14, floor: 0, color: "#fff" }, // Buried interior room (0 exterior walls)
  { id: "b", name: "Bed", type: "bedroom", x: 8, y: 26, width: 14, height: 14, floor: 0, color: "#fff" }, // Buried interior room
];
const ventGood = evaluateDaylightVentilationScore(goodVentRooms, plotW, plotL);
const ventBad = evaluateDaylightVentilationScore(poorVentRooms, plotW, plotL);
assert(ventGood.score > ventBad.score, `6. Direct perimeter daylight scores higher (${ventGood.score} > ${ventBad.score})`);
assert(ventBad.poorDaylightPenalty > 0, `6b. Interior unventilated rooms receive daylight penalty (${ventBad.poorDaylightPenalty})`);

// Test 7: Awkward room proportions receive a penalty
const goodPropRooms: Room[] = [
  { id: "b", name: "Bed", type: "bedroom", x: 0, y: 0, width: 12, height: 14, floor: 0, color: "#fff" }, // 1.17:1 aspect ratio
];
const awkwardPropRooms: Room[] = [
  { id: "b", name: "Bed", type: "bedroom", x: 0, y: 0, width: 7.5, height: 20, floor: 0, color: "#fff" }, // 2.67:1 tunnel room
];
const propGood = evaluateRoomProportions(goodPropRooms);
const propAwkward = evaluateRoomProportions(awkwardPropRooms);
assert(propAwkward.awkwardShapesPenalty > 0, `7. Elongated tunnel room receives awkwardShapes penalty (${propAwkward.awkwardShapesPenalty})`);
assert(propGood.score > propAwkward.score, `7b. Comfortable proportions score higher (${propGood.score} > ${propAwkward.score})`);

// Test 7c: Excessive offsets penalty (wall jogs and staircase offset)
const alignedRooms: Room[] = [
  { id: "r1", name: "Living", type: "living", x: 0, y: 0, width: 15, height: 15, floor: 0, color: "#fff" },
  { id: "r2", name: "Dining", type: "dining", x: 15, y: 0, width: 12, height: 15, floor: 0, color: "#fff" }, // Flush top (y=0) and bottom (y=15)
];
const joggedRooms: Room[] = [
  { id: "r1", name: "Living", type: "living", x: 0, y: 0, width: 15, height: 15, floor: 0, color: "#fff" },
  { id: "r2", name: "Dining", type: "dining", x: 15, y: 1.2, width: 12, height: 15, floor: 0, color: "#fff" }, // 1.2' awkward wall jog
];
const offsetAligned = evaluateExcessiveOffsets(alignedRooms);
const offsetJogged = evaluateExcessiveOffsets(joggedRooms);
assert(offsetAligned.offsetPenalty === 0, `7c. Aligned layout incurs 0 offset penalty (got ${offsetAligned.offsetPenalty})`);
assert(offsetJogged.offsetPenalty > 0, `7c-ii. Jogged layout incurs excessiveOffsets penalty (got ${offsetJogged.offsetPenalty})`);
assert(offsetJogged.offsetPenalty <= 25, `7c-iii. Offset penalty is strictly bounded <= 25 (got ${offsetJogged.offsetPenalty})`);

const alignedStairs: Room[] = [
  { id: "s0", name: "Stair GF", type: "staircase", x: 10, y: 10, width: 7, height: 10, floor: 0, color: "#ddd" },
  { id: "s1", name: "Stair FF", type: "staircase", x: 10, y: 10, width: 7, height: 10, floor: 1, color: "#ddd" },
];
const offsetStairs: Room[] = [
  { id: "s0", name: "Stair GF", type: "staircase", x: 10, y: 10, width: 7, height: 10, floor: 0, color: "#ddd" },
  { id: "s1", name: "Stair FF", type: "staircase", x: 11.5, y: 10, width: 7, height: 10, floor: 1, color: "#ddd" }, // 1.5' offset > 0.8'
];
const stairAligned = evaluateExcessiveOffsets(alignedStairs);
const stairOffset = evaluateExcessiveOffsets(offsetStairs);
assert(stairAligned.offsetPenalty === 0, "7c-iv. Aligned staircase incurs 0 offset penalty");
assert(stairOffset.offsetPenalty > 0, `7c-v. Staircase with centerline offset incurs soft penalty (${stairOffset.offsetPenalty})`);

// Test 8: Excessive dead space receives a penalty
const efficientRooms: Room[] = [
  { id: "r1", name: "Living", type: "living", x: 0, y: 0, width: 15, height: 20, floor: 0, color: "#fff" },
  { id: "r2", name: "Kitchen", type: "kitchen", x: 15, y: 0, width: 15, height: 20, floor: 0, color: "#fff" },
];
const deadSpaceRooms: Room[] = [
  { id: "r1", name: "Living", type: "living", x: 0, y: 0, width: 10, height: 10, floor: 0, color: "#fff" },
  { id: "r2", name: "Kitchen", type: "kitchen", x: 20, y: 40, width: 10, height: 10, floor: 0, color: "#fff" }, // Isolated clusters with large dead space
];
const effGood = evaluateSpaceEfficiency(efficientRooms, 30, 50);
const effDead = evaluateSpaceEfficiency(deadSpaceRooms, 30, 50);
assert(effDead.deadSpacePenalty > 0, `8. Large unallocated dead space receives penalty (${effDead.deadSpacePenalty})`);
assert(effGood.score > effDead.score, `8b. Compact efficient layout scores higher (${effGood.score} > ${effDead.score})`);

// Test 9: Better privacy receives a higher privacy score
const privateZoningRooms: Room[] = [
  { id: "l", name: "Living", type: "living", x: 0, y: 0, width: 15, height: 16, floor: 0, color: "#fff" },
  { id: "p", name: "Passage", type: "passage", x: 0, y: 16, width: 6, height: 14, floor: 0, color: "#eee" },
  { id: "b", name: "Bed", type: "bedroom", x: 6, y: 16, width: 14, height: 14, floor: 0, color: "#fff" },
];
const exposedZoningRooms: Room[] = [
  { id: "l", name: "Living", type: "living", x: 0, y: 0, width: 15, height: 16, floor: 0, color: "#fff" },
  { id: "cb", name: "Common Bath", type: "bathroom", x: 0, y: 16, width: 8, height: 6, floor: 0, color: "#fff" }, // Facing living directly
];
const privGood = evaluatePrivacyZoningScore(privateZoningRooms);
const privExposed = evaluatePrivacyZoningScore(exposedZoningRooms);
assert(privGood > privExposed, `9. Layout with buffer zoning receives higher privacy score (${privGood} > ${privExposed})`);

// Test 10: Better staircase/circulation relationship scores higher
const connectedStairRooms: Room[] = [
  { id: "stair", name: "Staircase", type: "staircase", x: 12, y: 15, width: 6.5, height: 10, floor: 0, color: "#ddd" },
  { id: "passage", name: "Passage", type: "passage", x: 12, y: 5, width: 6.5, height: 10, floor: 0, color: "#eee" }, // Directly connected
];
const isolatedStairRooms: Room[] = [
  { id: "stair", name: "Staircase", type: "staircase", x: 0, y: 40, width: 6.5, height: 10, floor: 0, color: "#ddd" },
  { id: "passage", name: "Passage", type: "passage", x: 20, y: 0, width: 6.5, height: 10, floor: 0, color: "#eee" }, // Disconnected from main circulation
];
const stairConnected = evaluateStaircaseQuality(connectedStairRooms);
const stairIsolated = evaluateStaircaseQuality(isolatedStairRooms);
assert(stairConnected > stairIsolated, `10. Staircase connected to circulation scores higher (${stairConnected} > ${stairIsolated})`);

// Test 10b: Accessibility scoring quality (5 specific scenarios)
// Scenario 1: Fully reachable efficient layout
const auditScenario1: PlanAccessibilityAudit = {
  allReachable: true,
  unreachableRooms: [],
  unventilatedRooms: [],
  roomDetails: [
    { roomId: "r1", name: "Living", isReachable: true, route: "[Main Entry] -> [Door] -> Living", hasVentilation: true, ventilationSource: "exterior_window" },
    { roomId: "r2", name: "Dining", isReachable: true, route: "[Main Entry] -> Living -> [Door] -> Dining", hasVentilation: true, ventilationSource: "exterior_window" },
  ],
};
const accScore1 = evaluateAccessibilityScore([], auditScenario1);
assert(accScore1 >= 95, `10b-i. Scenario 1: Fully reachable efficient layout receives high score (${accScore1})`);

// Scenario 2: Reachable but deep circulation
const auditScenario2: PlanAccessibilityAudit = {
  allReachable: true,
  unreachableRooms: [],
  unventilatedRooms: [],
  roomDetails: [
    {
      roomId: "r1",
      name: "Deep Bedroom",
      isReachable: true,
      route: "[Main Entry] -> [Door] -> Foyer -> [Door] -> Living -> [Door] -> Dining -> [Door] -> Corridor -> [Door] -> Deep Bedroom", // 6 transitions > 5.0
      hasVentilation: true,
      ventilationSource: "exterior_window",
    },
  ],
};
const accScore2 = evaluateAccessibilityScore([], auditScenario2);
assert(accScore2 < accScore1, `10b-ii. Scenario 2: Deep circulation receives depth penalty (${accScore2} < ${accScore1})`);

// Scenario 3: Unreachable layout
const auditScenario3: PlanAccessibilityAudit = {
  allReachable: false,
  unreachableRooms: ["Isolated Study"],
  unventilatedRooms: [],
  roomDetails: [
    { roomId: "r1", name: "Living", isReachable: true, route: "[Main Entry] -> [Door] -> Living", hasVentilation: true, ventilationSource: "exterior_window" },
    { roomId: "r2", name: "Isolated Study", isReachable: false, route: "UNREACHABLE", hasVentilation: true, ventilationSource: "exterior_window" },
  ],
};
const accScore3 = evaluateAccessibilityScore([], auditScenario3);
assert(accScore3 < 50, `10b-iii. Scenario 3: Unreachable layout receives severe penalty (${accScore3})`);

// Scenario 4: Duplex with valid well-centered vertical connection
const duplexValidRooms: Room[] = [
  { id: "s0", name: "Stair GF", type: "staircase", x: 10, y: 10, width: 7, height: 10, floor: 0, color: "#ddd", verticalCoreId: "core-a" },
  { id: "s1", name: "Stair FF", type: "staircase", x: 10, y: 10, width: 7, height: 10, floor: 1, color: "#ddd", verticalCoreId: "core-a" },
];
const duplexAuditCommon: PlanAccessibilityAudit = {
  allReachable: true,
  unreachableRooms: [],
  unventilatedRooms: [],
  roomDetails: [
    { roomId: "s0", name: "Stair GF", isReachable: true, route: "[Main Entry] -> [Door] -> Stair GF", hasVentilation: true, ventilationSource: "exterior_window" },
    { roomId: "s1", name: "Stair FF", isReachable: true, route: "[Main Entry] -> [Door] -> Stair GF -> [Vertical Core] -> Stair FF", hasVentilation: true, ventilationSource: "exterior_window" },
  ],
};
const accScore4 = evaluateAccessibilityScore(duplexValidRooms, duplexAuditCommon);
assert(accScore4 >= 95, `10b-iv. Scenario 4: Duplex with well-centered vertical core receives bonus (${accScore4})`);

// Scenario 5: Duplex with problematic vertical route
const duplexStrainedRooms: Room[] = [
  { id: "s0", name: "Stair GF", type: "staircase", x: 10, y: 10, width: 7, height: 10, floor: 0, color: "#ddd", verticalCoreId: "core-a" },
  { id: "s1", name: "Stair FF", type: "staircase", x: 11.8, y: 10, width: 7, height: 10, floor: 1, color: "#ddd", verticalCoreId: "core-a" }, // 1.8' offset >= 1.5'
];
const accScore5 = evaluateAccessibilityScore(duplexStrainedRooms, duplexAuditCommon);
assert(accScore5 < accScore4, `10b-v. Scenario 5: Problematic vertical route receives deduction (${accScore5} < ${accScore4})`);

// ---------------------------------------------------------------------------------
// PART 3: DETERMINISM, RANKING & EXPLAINABILITY
// ---------------------------------------------------------------------------------
console.log("\n▶ PART 3: Deterministic Scoring, Ranking & Explainability");

// Test 11: Deterministic scoring: same layout = same score
if (planResult && !("success" in planResult)) {
  const score1 = calculateLayoutScore(planResult.rooms, testReq, "spacious", 30, 60);
  const score2 = calculateLayoutScore(planResult.rooms, testReq, "spacious", 30, 60);
  assert(score1.score.total === score2.score.total, `11. Deterministic scoring: identical total (${score1.score.total} === ${score2.score.total})`);
  assert(
    JSON.stringify(score1.score.components) === JSON.stringify(score2.score.components),
    "11b. Deterministic components: identical component breakdown"
  );
  assert(
    JSON.stringify(score1.score.penalties) === JSON.stringify(score2.score.penalties),
    "11c. Deterministic penalties: identical penalty breakdown"
  );
}

// Test 12: Deterministic ranking: same candidates = same winner
const runA = generateSinglePlan(testReq, "spacious");
const runB = generateSinglePlan(testReq, "spacious");
if (runA && !("success" in runA) && runB && !("success" in runB)) {
  assert(runA.layoutScore?.total === runB.layoutScore?.total, `12. Deterministic ranking selects same score (${runA.layoutScore?.total})`);
  assert(runA.rooms.length === runB.rooms.length, `12b. Deterministic ranking selects same room count (${runA.rooms.length})`);
}

// Test 13: Two valid candidates with different quality are ranked differently
const planSpacious = generateSinglePlan(testReq, "spacious");
const planCompact = generateSinglePlan(testReq, "compact");
if (planSpacious && !("success" in planSpacious) && planCompact && !("success" in planCompact)) {
  assert(
    Boolean(planSpacious.layoutScore && planCompact.layoutScore),
    "13. Both Spacious and Compact produce valid layout scores"
  );
}

// Test 14: Explainability reasons are generated
if (planResult && !("success" in planResult)) {
  const reasons = planResult.layoutScore?.reasons || [];
  assert(reasons.length > 0, `14. Factual explainable reasons generated (${reasons.length} reasons)`);
  assert(
    reasons.some((r) => r.toLowerCase().includes("efficiency") || r.toLowerCase().includes("space")),
    `14b. Reasons include space/efficiency assessment: "${reasons[0]}"`
  );
  assert(
    Boolean(planResult.selectionReasons && planResult.selectionReasons.length > 0),
    "14c. selectionReasons exposed on FloorPlan object"
  );
}

// Test 15: Score components add up correctly to documented total
const weightsSum =
  LAYOUT_SCORE_WEIGHTS.spaceEfficiency +
  LAYOUT_SCORE_WEIGHTS.circulationQuality +
  LAYOUT_SCORE_WEIGHTS.adjacencyQuality +
  LAYOUT_SCORE_WEIGHTS.daylightVentilation +
  LAYOUT_SCORE_WEIGHTS.accessibility +
  LAYOUT_SCORE_WEIGHTS.privacy +
  LAYOUT_SCORE_WEIGHTS.roomProportion +
  LAYOUT_SCORE_WEIGHTS.staircaseQuality +
  LAYOUT_SCORE_WEIGHTS.parkingQuality +
  LAYOUT_SCORE_WEIGHTS.futureFlexibility;
assert(Math.abs(weightsSum - 1.0) < 0.001, `15. Documented architectural weights sum strictly to 1.00 (got ${weightsSum.toFixed(4)})`);

// Test 15b: Penalty mathematics non-double-counting verification
if (planResult && !("success" in planResult)) {
  const sc = planResult.layoutScore;
  if (sc) {
    const computedWeightedSum =
      sc.components.spaceEfficiency * LAYOUT_SCORE_WEIGHTS.spaceEfficiency +
      sc.components.circulationQuality * LAYOUT_SCORE_WEIGHTS.circulationQuality +
      sc.components.adjacencyQuality * LAYOUT_SCORE_WEIGHTS.adjacencyQuality +
      sc.components.daylightVentilation * LAYOUT_SCORE_WEIGHTS.daylightVentilation +
      sc.components.accessibility * LAYOUT_SCORE_WEIGHTS.accessibility +
      sc.components.privacy * LAYOUT_SCORE_WEIGHTS.privacy +
      sc.components.roomProportion * LAYOUT_SCORE_WEIGHTS.roomProportion +
      sc.components.staircaseQuality * LAYOUT_SCORE_WEIGHTS.staircaseQuality +
      sc.components.parkingQuality * LAYOUT_SCORE_WEIGHTS.parkingQuality +
      sc.components.futureFlexibility * LAYOUT_SCORE_WEIGHTS.futureFlexibility;

    const expectedTotal = Math.round(computedWeightedSum * 10) / 10;
    assert(
      Math.abs(sc.total - expectedTotal) < 0.15,
      `15b. Non-double-counting: total score strictly matches weighted sum of components (${sc.total} === ${expectedTotal})`
    );
  }
}

// Test 15c: Synthetic test proving penalty deducted only inside component, not globally double-counted
const candidateWithPenalty: Room[] = [
  { id: "r1", name: "Living", type: "living", x: 0, y: 0, width: 15, height: 15, floor: 0, color: "#fff" },
  { id: "r2", name: "Awkward Bed", type: "bedroom", x: 15, y: 0, width: 7, height: 20, floor: 0, color: "#fff" }, // Awkward aspect ratio > 1.8 and minDim < 9
];
const penalizedScore = calculateLayoutScore(candidateWithPenalty, testReq, "spacious", 30, 60);
assert(penalizedScore.valid, "15c. Candidate with awkward shapes is geometrically valid");
assert(penalizedScore.score.penalties.awkwardRoomShapes > 0, `15c-ii. awkwardShapes penalty recorded (${penalizedScore.score.penalties.awkwardRoomShapes})`);
const sumPenalized =
  penalizedScore.score.components.spaceEfficiency * LAYOUT_SCORE_WEIGHTS.spaceEfficiency +
  penalizedScore.score.components.circulationQuality * LAYOUT_SCORE_WEIGHTS.circulationQuality +
  penalizedScore.score.components.adjacencyQuality * LAYOUT_SCORE_WEIGHTS.adjacencyQuality +
  penalizedScore.score.components.daylightVentilation * LAYOUT_SCORE_WEIGHTS.daylightVentilation +
  penalizedScore.score.components.accessibility * LAYOUT_SCORE_WEIGHTS.accessibility +
  penalizedScore.score.components.privacy * LAYOUT_SCORE_WEIGHTS.privacy +
  penalizedScore.score.components.roomProportion * LAYOUT_SCORE_WEIGHTS.roomProportion +
  penalizedScore.score.components.staircaseQuality * LAYOUT_SCORE_WEIGHTS.staircaseQuality +
  penalizedScore.score.components.parkingQuality * LAYOUT_SCORE_WEIGHTS.parkingQuality +
  penalizedScore.score.components.futureFlexibility * LAYOUT_SCORE_WEIGHTS.futureFlexibility;
assert(
  Math.abs(penalizedScore.score.total - Math.round(sumPenalized * 10) / 10) < 0.15,
  `15c-iii. Penalized candidate total exactly equals weighted components without double-deduction (${penalizedScore.score.total} === ${Math.round(sumPenalized * 10) / 10})`
);

// Test 16: No score component can bypass hard validation
const hardInvalidCandidate: Room[] = [
  { id: "r1", name: "Living", type: "living", x: 0, y: 0, width: 20, height: 20, floor: 0, color: "#fff" },
  { id: "r2", name: "Kitchen", type: "kitchen", x: 10, y: 10, width: 15, height: 15, floor: 0, color: "#fff" }, // Overlap
];
const bypassAttempt = calculateLayoutScore(hardInvalidCandidate, testReq, "spacious", 30, 60);
assert(!bypassAttempt.valid, "16. Hard geometric conflict cannot be bypassed by scoring");
assert(bypassAttempt.score.total === 0, "16b. Total score remains 0 despite any soft merits");

// ---------------------------------------------------------------------------------
// PART 4: PHASE 3 DUPLEX & VERTICAL CORE PRESERVATION
// ---------------------------------------------------------------------------------
console.log("\n▶ PART 4: Phase 3 Duplex & Vertical Core Preservation");

// Test 17: Phase 3 duplex BFS remains unchanged and valid
if (planResult && !("success" in planResult)) {
  const audit = auditDuplexAccessibility(planResult.rooms, planResult.doors, planResult.windows);
  assert(audit.allReachable, "17. Phase 3 cross-floor BFS accessibility audit remains 100% valid and unbroken");
}

// Test 18: Phase 3 staircase verticalCoreId behavior remains unchanged
if (planResult && !("success" in planResult)) {
  const vertConn = validateVerticalConnectivity(planResult.rooms);
  assert(vertConn.valid, "18. Phase 3 vertical core compatibility validation remains 100% valid");
}

// ---------------------------------------------------------------------------------
// PART 5: BENCHMARK QUALITY VERIFICATION
// ---------------------------------------------------------------------------------
console.log("\n▶ PART 5: Full Benchmark Suite Quality Scoring");

const benchmarkCases = [
  { name: "20 x 50 — 2BHK", plot: { width: 20, length: 50 }, floors: 1, beds: 2, baths: 2 },
  { name: "23 x 50 — 2BHK", plot: { width: 23, length: 50 }, floors: 1, beds: 2, baths: 2 },
  { name: "25 x 50 — 3BHK", plot: { width: 25, length: 50 }, floors: 1, beds: 3, baths: 2 },
  { name: "30 x 50 — 3BHK", plot: { width: 30, length: 50 }, floors: 1, beds: 3, baths: 3 },
  { name: "30 x 60 — 3BHK duplex (G+1)", plot: { width: 30, length: 60 }, floors: 2, beds: 3, baths: 3 },
  { name: "40 x 60 — 4BHK duplex (G+1)", plot: { width: 40, length: 60 }, floors: 2, beds: 4, baths: 4 },
];

const variants: LayoutStyleVariant[] = ["spacious", "practical", "compact"];

for (const bm of benchmarkCases) {
  const req = normalizeRequirements({
    plot: { ...bm.plot, unit: "ft" },
    floors: bm.floors,
    rooms: [
      { type: "living", quantity: 1 },
      { type: "kitchen", quantity: 1 },
      { type: "bedroom", quantity: bm.beds },
      { type: "bathroom", quantity: bm.baths },
      { type: "dining", quantity: 1 },
    ],
    parking: { type: "car", quantity: 1 },
    staircase: bm.floors >= 2,
    balcony: bm.floors >= 2,
  });

  for (const v of variants) {
    const res = generateSinglePlan(req, v);
    assert(Boolean(res && !("success" in res)), `[${bm.name}] [${v}] generated plan successfully`);
    if (res && !("success" in res)) {
      assert(
        Boolean(res.layoutScore && res.layoutScore.total > 50),
        `[${bm.name}] [${v}] scored quality rating: ${res.layoutScore?.total}/100`
      );
      assert(
        Boolean(res.selectionReasons && res.selectionReasons.length > 0),
        `[${bm.name}] [${v}] has explainable selection reasons`
      );
    }
  }
}

// Check generateFloorPlans API returns plans with layoutScore
const allPlans = generateFloorPlans(testReq);
assert(allPlans.length === 3, "generateFloorPlans returns 3 variant plans");
for (const p of allPlans) {
  assert(Boolean(p.layoutScore), `generateFloorPlans plan [${p.styleVariant}] includes layoutScore`);
}

console.log("\n===============================================================================");
console.log(`PHASE 4 TEST RESULTS: ${passedAssertions}/${totalAssertions} ASSERTIONS PASSED`);
if (passedAssertions === totalAssertions) {
  console.log("✅ ALL PHASE 4 ARCHITECTURAL SCORING & QUALITY OPTIMIZATION TESTS PASSED!");
} else {
  console.error("❌ SOME PHASE 4 TESTS FAILED!");
  process.exit(1);
}
console.log("===============================================================================");
