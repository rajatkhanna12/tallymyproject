import { generateFloorPlans } from "./layout-engine";
import { parseHouseRequirements } from "./parser";
import { HouseRequirements } from "./types";
import { validateFloorPlan } from "./validation";

interface TestCase {
  name: string;
  input: string | Partial<HouseRequirements>;
}

const testCases: TestCase[] = [
  {
    name: "20 x 50 — 2BHK",
    input: "20 x 50 ft plot, 2 bedrooms, 2 bathrooms, bike parking, kitchen, living room",
  },
  {
    name: "23 x 50 — 2BHK",
    input: "23 x 50 ft plot, north facing, 2 bedrooms, 2 bathrooms, bike parking, modern kitchen connected to dining",
  },
  {
    name: "25 x 50 — 3BHK",
    input: "25 x 50 ft plot, 3 bedrooms, 2 bathrooms, car parking, kitchen with dining, living hall",
  },
  {
    name: "30 x 50 — 3BHK",
    input: "30 x 50 ft plot, east facing, 3 bedrooms, 3 bathrooms, car and bike parking, kitchen, dining",
  },
  {
    name: "30 x 60 — 3BHK duplex",
    input: "30 x 60 ft plot, duplex 2 floors, 3 bedrooms, 3 bathrooms, car parking, staircase, balcony",
  },
  {
    name: "40 x 60 — 4BHK duplex",
    input: "40 x 60 ft plot, duplex 2 floors, 4 bedrooms, 4 bathrooms, car parking, stairs, balcony, spacious living",
  },
];

export async function runBenchmarkTests() {
  console.log("=================================================");
  console.log("RUNNING FLOOR PLAN GENERATOR BENCHMARK SUITE");
  console.log("=================================================\n");

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const tc of testCases) {
    console.log(`\n▶ Testing Benchmark Scenario: [${tc.name}]`);
    const req = await parseHouseRequirements(tc.input);

    console.log(
      `  Parsed Plot: ${req.plot.width}' × ${req.plot.length}' | Floors: ${req.floors} | Facing: ${req.facing} | Vastu: ${req.preferences?.vastu ? "YES" : "NO (Default)"}`
    );

    // Test all 3 style variations
    const plans = generateFloorPlans(req);

    for (const plan of plans) {
      totalTests++;
      const validation = validateFloorPlan(plan);

      // Verify furniture containment inside room bounds
      let furnitureErrors = 0;
      for (const f of plan.furniture || []) {
        const parentRoom = plan.rooms.find((r) => r.id === f.roomId);
        if (parentRoom) {
          if (
            f.x < parentRoom.x - 0.5 ||
            f.y < parentRoom.y - 0.5 ||
            f.x + f.width > parentRoom.x + parentRoom.width + 0.5 ||
            f.y + f.height > parentRoom.y + parentRoom.height + 0.5
          ) {
            furnitureErrors++;
            console.error(`      - Furniture [${f.label}] exceeds bounds of room [${parentRoom.name}]`);
          }
        }
      }

      // Verify door & window counts
      const hasDoors = plan.doors.length > 0;
      const hasWindows = plan.windows.length > 0;

      const isClean = validation.valid && furnitureErrors === 0 && hasDoors && hasWindows;

      if (isClean) {
        passedTests++;
        console.log(
          `  ✓ [${plan.styleVariant.toUpperCase()}] PASS: ${plan.rooms.length} rooms | ${plan.doors.length} doors | ${plan.windows.length} windows | ${(plan.furniture || []).length} furniture items | Built-up: ${plan.totalBuiltUpArea} sq ft`
        );
      } else {
        failedTests++;
        console.error(
          `  ✗ [${plan.styleVariant.toUpperCase()}] FAIL: Overlaps: ${validation.overlaps.length} | Boundary Violations: ${validation.boundaryViolations.length} | Furniture Errors: ${furnitureErrors}`
        );
        for (const err of validation.errors) {
          console.error(`      - ${err}`);
        }
      }
    }
  }

  // Also test with VASTU ENABLED (Opt-in)
  console.log(`\n▶ Testing Vastu Opt-In Preference on 23 x 50 — 2BHK`);
  const vastuReq = await parseHouseRequirements("23 x 50 ft, 2 bedrooms, 2 bathrooms, vastu, north facing");
  const vastuPlans = generateFloorPlans(vastuReq);
  for (const plan of vastuPlans) {
    totalTests++;
    const validation = validateFloorPlan(plan);
    if (validation.valid && plan.isVastuOriented) {
      passedTests++;
      console.log(`  ✓ [VASTU-${plan.styleVariant.toUpperCase()}] PASS: Correctly marked as Vastu-oriented with 0 overlaps`);
    } else {
      failedTests++;
      console.error(`  ✗ [VASTU-${plan.styleVariant.toUpperCase()}] FAIL:`, validation.errors);
    }
  }

  console.log("\n=================================================");
  console.log(`BENCHMARK RESULTS: ${passedTests}/${totalTests} PASSED`);
  if (failedTests === 0) {
    console.log("ALL GEOMETRIC CONSTRAINTS AND BENCHMARKS VERIFIED!");
  } else {
    console.error(`${failedTests} TESTS FAILED! Check error logs.`);
  }
  console.log("=================================================\n");

  if (failedTests > 0) {
    throw new Error(`${failedTests} benchmark tests failed`);
  }
}

runBenchmarkTests().catch((err) => {
  console.error(err);
  process.exit(1);
});

