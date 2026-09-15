import { CompassDirection, HouseRequirements, ParkingType, RoomRequirement } from "./types";

/**
 * Deterministic natural-language and structured form parser for house requirements.
 * Treats explicit user requirements as the absolute source of truth.
 * Distinguishes user-provided requirements from assumed defaults.
 */
export async function parseHouseRequirements(
  input: string | Partial<HouseRequirements>
): Promise<HouseRequirements> {
  return normalizeRequirements(input);
}

/**
 * Normalizes user input (either natural language text or structured partial object)
 * into a complete, type-safe HouseRequirements object with explicit requirement tracking.
 */
export function normalizeRequirements(
  input: string | Partial<HouseRequirements>
): HouseRequirements {
  if (typeof input !== "string") {
    return sanitizeStructuredRequirements(input);
  }

  const text = input.toLowerCase().trim();
  const userProvided: string[] = [];
  const assumedDefaults: string[] = [];

  // 1. Plot Dimensions:
  // Check for explicit frontage/width vs depth/length keywords
  // e.g. "23 ft wide by 50 ft deep", "frontage 23 ft", "road 23 ft", "depth 50 ft"
  let width = 23;
  let length = 50;

  const explicitFrontageMatch = text.match(
    /(\d+(?:\.\d+)?)\s*(?:ft|feet|foot|'|m|meter)?\s*(?:wide|width|front|frontage|road|face)/
  );
  const explicitDepthMatch = text.match(
    /(\d+(?:\.\d+)?)\s*(?:ft|feet|foot|'|m|meter)?\s*(?:deep|depth|long|length)/
  );

  if (explicitFrontageMatch && explicitDepthMatch) {
    width = parseFloat(explicitFrontageMatch[1]);
    length = parseFloat(explicitDepthMatch[1]);
    userProvided.push(`Plot dimensions: ${width}' road frontage × ${length}' depth`);
  } else {
    // Generic plot regex: match "23 x 50", "23x50", "23 by 50", "23*50", "23 ft by 50 ft", "23' x 50'"
    const plotMatch = text.match(
      /(\d+(?:\.\d+)?)\s*(?:ft|feet|foot|'|m|meter)?\s*(?:x|\*|by|X)\s*(\d+(?:\.\d+)?)\s*(?:ft|feet|foot|'|m|meter)?/
    );

    if (plotMatch) {
      const dim1 = parseFloat(plotMatch[1]);
      const dim2 = parseFloat(plotMatch[2]);

      // In typical row housing, smaller dimension is road frontage/width
      width = Math.min(dim1, dim2);
      length = Math.max(dim1, dim2);
      userProvided.push(`Plot dimensions: ${width}' × ${length}'`);
      assumedDefaults.push(`Road frontage assumed on ${width}' dimension`);
    } else {
      assumedDefaults.push("Plot dimensions: 23' × 50' (default)");
    }
  }

  // 2. Floors: "g+1", "2 floor", "two floor", "duplex", "double story", "first floor"
  let floors = 1;
  const isDuplex =
    text.includes("g+1") ||
    text.includes("g + 1") ||
    text.includes("2 floor") ||
    text.includes("two floor") ||
    text.includes("duplex") ||
    text.includes("first floor") ||
    text.includes("2-story") ||
    text.includes("double store");

  if (isDuplex) {
    floors = 2;
    userProvided.push("Floors: G+1 Duplex (2 Floors)");
  } else {
    assumedDefaults.push("Floors: Single-story Ground Floor (default)");
  }

  // 3. Facing / Orientation: "north facing", "east", etc.
  let facing: CompassDirection = "north";
  if (text.includes("east")) {
    facing = "east";
    userProvided.push("Orientation: East facing");
  } else if (text.includes("west")) {
    facing = "west";
    userProvided.push("Orientation: West facing");
  } else if (text.includes("south")) {
    facing = "south";
    userProvided.push("Orientation: South facing");
  } else if (text.includes("north")) {
    facing = "north";
    userProvided.push("Orientation: North facing");
  } else {
    assumedDefaults.push("Orientation: North facing (default)");
  }

  // 4. Bedrooms / BHK count
  let bedCount = 2;
  const bhkMatch = text.match(/(\d+)\s*(?:bhk|bed|bedroom|bdrm)/);
  if (bhkMatch) {
    bedCount = parseInt(bhkMatch[1], 10);
    userProvided.push(`Bedrooms: ${bedCount} BHK`);
  } else if (text.includes("3 bedroom") || text.includes("3 bed") || text.includes("3bhk")) {
    bedCount = 3;
    userProvided.push("Bedrooms: 3 BHK");
  } else if (text.includes("4 bedroom") || text.includes("4 bed") || text.includes("4bhk")) {
    bedCount = 4;
    userProvided.push("Bedrooms: 4 BHK");
  } else if (text.includes("1 bedroom") || text.includes("1 bed") || text.includes("1bhk")) {
    bedCount = 1;
    userProvided.push("Bedrooms: 1 BHK");
  } else {
    assumedDefaults.push("Bedrooms: 2 BHK (default)");
  }

  // 5. Bathrooms count
  let bathCount = Math.min(bedCount, 2);
  const bathMatch = text.match(/(\d+)\s*(?:bath|bathroom|toilet|washroom|wc)/);
  if (bathMatch) {
    bathCount = parseInt(bathMatch[1], 10);
    userProvided.push(`Bathrooms: ${bathCount} baths`);
  } else {
    assumedDefaults.push(`Bathrooms: ${bathCount} baths (default)`);
  }

  // 6. Parking
  let parkingType: ParkingType = "none";
  let parkingQuantity = 1;
  const parkingQuantityMatch = text.match(/(\d+)\s*(?:car|bike|vehicle|parking)/);
  if (parkingQuantityMatch) {
    parkingQuantity = parseInt(parkingQuantityMatch[1], 10);
  }

  if (text.includes("both") || (text.includes("car") && text.includes("bike"))) {
    parkingType = "both";
    userProvided.push("Parking: Car and bike parking");
  } else if (text.includes("car")) {
    parkingType = "car";
    userProvided.push(`Parking: ${parkingQuantity} Car parking`);
  } else if (text.includes("bike") || text.includes("two wheeler") || text.includes("two-wheeler")) {
    parkingType = "bike";
    userProvided.push(`Parking: ${parkingQuantity > 1 ? parkingQuantity : 2} Bike parking`);
  } else if (text.includes("parking") || text.includes("porch")) {
    parkingType = width >= 24 ? "car" : "bike";
    userProvided.push(`Parking: ${parkingType === "car" ? "Car" : "Bike"} parking`);
  } else {
    parkingType = "none";
    assumedDefaults.push("Parking: None specified");
  }

  // 7. Kitchen & Dining
  const explicitDining = text.includes("dining") || text.includes("dinning");
  const openKitchen =
    text.includes("open kitchen") ||
    text.includes("connected to dining") ||
    text.includes("with dining") ||
    text.includes("modern kitchen");

  if (explicitDining) {
    userProvided.push("Dining: Dedicated dining space requested");
  }
  if (openKitchen) {
    userProvided.push("Kitchen: Modern open kitchen connected to dining");
  }

  // 8. Staircase & Balcony
  const staircase = floors > 1 || text.includes("stair") || text.includes("stairs") || text.includes("duplex");
  if (staircase && floors === 1 && (text.includes("stair") || text.includes("stairs"))) {
    userProvided.push("Staircase: Roof/terrace access staircase");
  }

  const balcony = floors > 1 || text.includes("balcony") || text.includes("terrace") || text.includes("sit-out");
  if (balcony && (text.includes("balcony") || text.includes("terrace"))) {
    userProvided.push("Balcony: Dedicated outdoor sit-out / balcony");
  }

  // 9. Vastu Preference (STRICTLY OPT-IN: only true if explicitly mentioned in prompt)
  const vastu = text.includes("vastu") || text.includes("vaastu");
  if (vastu) {
    userProvided.push("Vastu: Opt-in Vastu layout preference requested");
  } else {
    assumedDefaults.push("Vastu: Disabled (optimized for practical circulation & usability)");
  }

  // Build room requirements
  const rooms: RoomRequirement[] = [
    { type: "living", quantity: 1 },
    { type: "kitchen", quantity: 1 },
    { type: "master_bedroom", quantity: 1 },
  ];

  if (bedCount > 1) {
    rooms.push({ type: "bedroom", quantity: bedCount - 1 });
  }

  if (explicitDining) {
    rooms.push({ type: "dining", quantity: 1 });
  }

  rooms.push({ type: "bathroom", quantity: bathCount });

  return {
    plot: {
      width: Math.max(10, Math.min(150, width)),
      length: Math.max(15, Math.min(200, length)),
      unit: "ft",
    },
    floors,
    facing,
    rooms,
    parking: {
      type: parkingType,
      quantity: parkingQuantity,
    },
    kitchen: {
      openToDining: openKitchen || explicitDining,
    },
    staircase,
    balcony,
    preferences: {
      modern: text.includes("modern"),
      spacious: text.includes("spacious"),
      vastu, // False unless explicitly asked
    },
    metadata: {
      userProvided,
      assumedDefaults,
    },
  };
}

function sanitizeStructuredRequirements(
  partial: Partial<HouseRequirements>
): HouseRequirements {
  const userProvided: string[] = [];
  const assumedDefaults: string[] = [];

  const plotWidth = partial.plot?.width || 23;
  const plotLength = partial.plot?.length || 50;
  if (partial.plot?.width && partial.plot?.length) {
    userProvided.push(`Plot dimensions: ${plotWidth}' × ${plotLength}'`);
  } else {
    assumedDefaults.push("Plot dimensions: 23' × 50' (default)");
  }

  const floors = partial.floors || 1;
  if (partial.floors) {
    userProvided.push(`Floors: ${floors}`);
  } else {
    assumedDefaults.push("Floors: 1 (default)");
  }

  const facing = partial.facing || "north";
  if (partial.facing) {
    userProvided.push(`Orientation: ${facing} facing`);
  } else {
    assumedDefaults.push("Orientation: North facing (default)");
  }

  let rooms = partial.rooms;
  if (rooms && rooms.length > 0) {
    userProvided.push(`Rooms: ${rooms.map((r) => `${r.quantity} ${r.type}`).join(", ")}`);
  } else {
    assumedDefaults.push("Rooms: Standard 2BHK room package");
    rooms = [
      { type: "living", quantity: 1 },
      { type: "kitchen", quantity: 1 },
      { type: "master_bedroom", quantity: 1 },
      { type: "bedroom", quantity: 1 },
      { type: "bathroom", quantity: 2 },
    ];
  }

  const parking = partial.parking || { type: "bike", quantity: 1 };
  if (partial.parking) {
    userProvided.push(`Parking: ${parking.quantity || 1} ${parking.type}`);
  } else {
    assumedDefaults.push("Parking: Bike parking (default)");
  }

  const kitchen = partial.kitchen || { openToDining: true };
  const staircase = partial.staircase ?? (floors > 1);
  const balcony = partial.balcony ?? (floors > 1);
  const vastu = partial.preferences?.vastu ?? false; // Default is STRICTLY FALSE

  if (vastu) {
    userProvided.push("Vastu: Opt-in Vastu preference enabled");
  } else {
    assumedDefaults.push("Vastu: Disabled (optimized for practical circulation)");
  }

  return {
    plot: {
      width: Math.max(10, Math.min(150, plotWidth)),
      length: Math.max(15, Math.min(200, plotLength)),
      unit: "ft",
    },
    floors: floors >= 2 ? 2 : 1,
    facing,
    rooms,
    parking,
    kitchen,
    staircase,
    balcony,
    preferences: {
      modern: partial.preferences?.modern ?? true,
      spacious: partial.preferences?.spacious ?? false,
      vastu,
    },
    setbackAssumptions: partial.setbackAssumptions,
    metadata: {
      userProvided: partial.metadata?.userProvided || userProvided,
      assumedDefaults: partial.metadata?.assumedDefaults || assumedDefaults,
    },
  };
}
