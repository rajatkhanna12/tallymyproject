import { CompassDirection, HouseRequirements, ParkingType, RoomRequirement } from "./types";

/**
 * Deterministic natural-language and structured form parser for house requirements.
 * Works completely offline without requiring any paid AI API keys.
 * An extensible provider abstraction is included for future LLM integration.
 */
export async function parseHouseRequirements(
  input: string | Partial<HouseRequirements>
): Promise<HouseRequirements> {
  // If already a structured object, sanitize and apply defaults
  if (typeof input !== "string") {
    return sanitizeStructuredRequirements(input);
  }

  // Natural language parsing with deterministic regex & NLP heuristics
  const text = input.toLowerCase().trim();

  // 1. Plot Dimensions: match "23 x 50", "23x50", "23 by 50", "23*50", "23 ft by 50 ft"
  let width = 23;
  let length = 50;
  const plotMatch = text.match(
    /(\d+(?:\.\d+)?)\s*(?:x|\*|by|X)\s*(\d+(?:\.\d+)?)\s*(?:ft|feet|foot|'|meter|m)?/
  );

  if (plotMatch) {
    const dim1 = parseFloat(plotMatch[1]);
    const dim2 = parseFloat(plotMatch[2]);
    // In typical row houses, smaller dimension is road frontage/width
    width = Math.min(dim1, dim2);
    length = Math.max(dim1, dim2);
  }

  // 2. Floors: "g+1", "2 floor", "two floor", "duplex", "double story", "first floor"
  let floors = 1;
  if (
    text.includes("g+1") ||
    text.includes("g + 1") ||
    text.includes("2 floor") ||
    text.includes("two floor") ||
    text.includes("duplex") ||
    text.includes("first floor") ||
    text.includes("2-story") ||
    text.includes("double store")
  ) {
    floors = 2;
  }

  // 3. Facing / Orientation: "north facing", "east", etc.
  let facing: CompassDirection = "north";
  if (text.includes("east")) facing = "east";
  else if (text.includes("west")) facing = "west";
  else if (text.includes("south")) facing = "south";
  else if (text.includes("north")) facing = "north";

  // 4. Bedrooms / BHK count
  let bedCount = 2;
  const bhkMatch = text.match(/(\d+)\s*(?:bhk|bed|bedroom|bdrm)/);
  if (bhkMatch) {
    bedCount = parseInt(bhkMatch[1], 10);
  } else if (text.includes("3 bedroom") || text.includes("3 bed") || text.includes("3bhk")) {
    bedCount = 3;
  } else if (text.includes("4 bedroom") || text.includes("4 bed") || text.includes("4bhk")) {
    bedCount = 4;
  } else if (text.includes("1 bedroom") || text.includes("1 bed") || text.includes("1bhk")) {
    bedCount = 1;
  }

  // 5. Bathrooms count
  let bathCount = Math.min(bedCount, 2);
  const bathMatch = text.match(/(\d+)\s*(?:bath|bathroom|toilet|washroom|wc)/);
  if (bathMatch) {
    bathCount = parseInt(bathMatch[1], 10);
  }

  // 6. Parking
  let parkingType: ParkingType = "none";
  if (text.includes("both") || (text.includes("car") && text.includes("bike"))) {
    parkingType = "both";
  } else if (text.includes("car")) {
    parkingType = "car";
  } else if (text.includes("bike") || text.includes("two wheeler") || text.includes("two-wheeler")) {
    parkingType = "bike";
  } else if (text.includes("parking") || text.includes("porch")) {
    parkingType = width >= 24 ? "car" : "bike";
  }

  // 7. Kitchen
  const openKitchen =
    text.includes("open kitchen") ||
    text.includes("connected to dining") ||
    text.includes("with dining") ||
    text.includes("modern kitchen");

  // 8. Staircase & Balcony
  const staircase = floors > 1 || text.includes("stair") || text.includes("stairs") || text.includes("duplex");
  const balcony = floors > 1 || text.includes("balcony") || text.includes("terrace");

  // 9. Vastu Preference (STRICTLY OPT-IN: only true if explicitly mentioned in prompt)
  const vastu = text.includes("vastu") || text.includes("vaastu");

  // Build room requirements
  const rooms: RoomRequirement[] = [
    { type: "living", quantity: 1 },
    { type: "kitchen", quantity: 1 },
    { type: "master_bedroom", quantity: 1 },
  ];

  if (bedCount > 1) {
    rooms.push({ type: "bedroom", quantity: bedCount - 1 });
  }

  rooms.push({ type: "bathroom", quantity: bathCount });

  return {
    plot: {
      width: Math.max(15, Math.min(100, width)),
      length: Math.max(25, Math.min(150, length)),
      unit: "ft",
    },
    floors,
    facing,
    rooms,
    parking: {
      type: parkingType,
      quantity: 1,
    },
    kitchen: {
      openToDining: openKitchen,
    },
    staircase,
    balcony,
    preferences: {
      modern: text.includes("modern"),
      spacious: text.includes("spacious"),
      vastu, // False unless explicitly asked
    },
  };
}

function sanitizeStructuredRequirements(
  partial: Partial<HouseRequirements>
): HouseRequirements {
  const plotWidth = partial.plot?.width || 23;
  const plotLength = partial.plot?.length || 50;
  const floors = partial.floors || 1;
  const facing = partial.facing || "north";

  return {
    plot: {
      width: Math.max(15, Math.min(100, plotWidth)),
      length: Math.max(25, Math.min(150, plotLength)),
      unit: "ft",
    },
    floors: floors >= 2 ? 2 : 1,
    facing,
    rooms: partial.rooms && partial.rooms.length > 0 ? partial.rooms : [
      { type: "living", quantity: 1 },
      { type: "kitchen", quantity: 1 },
      { type: "master_bedroom", quantity: 1 },
      { type: "bedroom", quantity: 1 },
      { type: "bathroom", quantity: 2 },
    ],
    parking: partial.parking || { type: "bike", quantity: 1 },
    kitchen: partial.kitchen || { openToDining: true },
    staircase: partial.staircase ?? (floors > 1),
    balcony: partial.balcony ?? (floors > 1),
    preferences: {
      modern: partial.preferences?.modern ?? true,
      spacious: partial.preferences?.spacious ?? false,
      vastu: partial.preferences?.vastu ?? false, // Default is STRICTLY FALSE
    },
  };
}
