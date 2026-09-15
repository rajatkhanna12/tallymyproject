import {
  CompassDirection,
  HouseRequirements,
  LayoutStyleVariant,
  Room,
  RoomType,
} from "../types";
import { calculateCirculationWidth } from "./circulation";
import { calculateFunctionalZoning } from "./zoning";

export const ROOM_COLORS: Record<RoomType, string> = {
  living: "#fefce8",        // Warm Off-White / Light Cream
  dining: "#fffbeb",        // Soft Ivory
  kitchen: "#fff7ed",       // Light Bisque
  master_bedroom: "#f8fafc",// Crisp Off-White Architectural Fill
  bedroom: "#f8fafc",       // Crisp Off-White Architectural Fill
  bathroom: "#f0fdfa",      // Soft Teal / Mint
  attached_bath: "#f0fdfa", // Soft Teal / Mint
  parking: "#f8fafc",       // Slate Paver Tile Fill
  staircase: "#f1f5f9",     // Slate 100
  balcony: "#ecfdf5",       // Emerald Tint
  utility: "#f8fafc",       // Utility Gray
  passage: "#ffffff",       // Pure White
  pooja: "#faf5ff",         // Soft Lavender
  verandah: "#f8fafc",      // Off-White Porch
  ots: "#f0fdf4",           // Open To Sky Garden / Lightwell Tint
};

/**
 * Assembles the Front Zone: Vehicular parking bay and pedestrian entrance verandah/porch.
 */
function assembleFrontZone(
  plotW: number,
  frontDepth: number,
  req: HouseRequirements,
  variant: LayoutStyleVariant,
  candidateIdx: number,
  isVastu: boolean,
  facing: CompassDirection,
  roomIdRef: { current: number }
): Room[] {
  const rooms: Room[] = [];
  if (frontDepth <= 0) return rooms;

  const hasParking = req.parking?.type && req.parking.type !== "none";
  const parkingType = req.parking?.type || "bike";
  const isCar = parkingType === "car" || parkingType === "both";
  const parkingQty = req.parking?.quantity || 1;

  if (hasParking) {
    let parkingW = 0;
    if (isCar) {
      parkingW = parkingQty >= 2
        ? Math.min(plotW - 4.0, Math.max(18.0, plotW * 0.70))
        : Math.min(12.5, Math.max(9.5, Math.round(plotW * 0.45 * 2) / 2));
    } else {
      parkingW = Math.min(9.5, Math.max(7.5, Math.round(plotW * 0.38 * 2) / 2));
    }

    const parkingOnLeft = isVastu
      ? (facing === "north" || facing === "east")
      : (variant === "spacious" ? false : candidateIdx % 2 === 1);

    const parkX = parkingOnLeft ? 0 : plotW - parkingW;

    rooms.push({
      id: `r-${roomIdRef.current++}`,
      name: isCar
        ? (parkingQty >= 2 ? "Double Car Porch" : parkingType === "both" ? "Car & Bike Parking" : "Car Porch")
        : "Bike Parking",
      type: "parking",
      x: parkX,
      y: 0,
      width: parkingW,
      height: frontDepth,
      floor: 0,
      color: ROOM_COLORS.parking,
      isVastuAligned: isVastu,
    });

    const verandahW = plotW - parkingW;
    const verandahX = parkingOnLeft ? parkingW : 0;
    rooms.push({
      id: `r-${roomIdRef.current++}`,
      name: variant === "spacious" ? "Front Verandah & Sit-Out" : "Entrance Porch / Verandah",
      type: "verandah",
      x: verandahX,
      y: 0,
      width: verandahW,
      height: frontDepth,
      floor: 0,
      color: ROOM_COLORS.verandah,
    });
  } else {
    rooms.push({
      id: `r-${roomIdRef.current++}`,
      name: variant === "spacious" ? "Front Verandah & Garden Sit-Out" : "Entrance Porch",
      type: "verandah",
      x: 0,
      y: 0,
      width: plotW,
      height: frontDepth,
      floor: 0,
      color: ROOM_COLORS.verandah,
    });
  }

  return rooms;
}

/**
 * Assembles Public Living and Mid-Family Zone based on:
 * - Living <-> Dining adjacency
 * - Dining <-> Kitchen adjacency
 * - Staircase along circulation spine
 * - Uninterrupted circulation hallway of width circW
 */
function assemblePublicAndMidZone(
  plotW: number,
  startY: number,
  publicH: number,
  midH: number,
  circW: number,
  gfBeds: number,
  reqStairs: boolean,
  isVastu: boolean,
  variant: LayoutStyleVariant,
  candidateIdx: number,
  roomIdRef: { current: number }
): { rooms: Room[]; bedroom3Placed: boolean } {
  const rooms: Room[] = [];
  const midY = startY + publicH;

  // Case 1: 3 Bedrooms on Ground Floor (single-story 3BHK)
  if (gfBeds >= 3) {
    const diningW = Math.round(plotW * 0.38 * 2) / 2;
    const livingW = plotW - diningW;

    rooms.push({
      id: `r-${roomIdRef.current++}`,
      name: variant === "spacious" ? "Grand Living Hall" : "Formal Living Hall",
      type: "living",
      x: 0,
      y: startY,
      width: livingW,
      height: publicH,
      floor: 0,
      color: ROOM_COLORS.living,
    });

    rooms.push({
      id: `r-${roomIdRef.current++}`,
      name: "Family Dining Space",
      type: "dining",
      x: livingW,
      y: startY,
      width: diningW,
      height: publicH,
      floor: 0,
      color: ROOM_COLORS.dining,
    });

    // Mid Zone: Bedroom 3 (Left) + Central Passage + Kitchen (Right)
    const bed3W = Math.round(plotW * 0.44 * 2) / 2;
    const midPassageW = circW;
    const kitchenW = plotW - bed3W - midPassageW;

    rooms.push({
      id: `r-${roomIdRef.current++}`,
      name: "Bedroom 3 (Guest / Study)",
      type: "bedroom",
      x: 0,
      y: midY,
      width: bed3W,
      height: midH,
      floor: 0,
      color: ROOM_COLORS.bedroom,
    });

    rooms.push({
      id: `r-${roomIdRef.current++}`,
      name: "Circulation Hallway",
      type: "passage",
      x: bed3W,
      y: midY,
      width: midPassageW,
      height: midH,
      floor: 0,
      color: ROOM_COLORS.passage,
    });

    rooms.push({
      id: `r-${roomIdRef.current++}`,
      name: "Modular Kitchen",
      type: "kitchen",
      x: bed3W + midPassageW,
      y: midY,
      width: kitchenW,
      height: midH,
      floor: 0,
      color: ROOM_COLORS.kitchen,
      isVastuAligned: isVastu,
    });

    return { rooms, bedroom3Placed: true };
  }

  // Case 2: 1 or 2 Bedrooms on Ground Floor
  if (variant === "spacious") {
    const diningW = Math.round(plotW * (gfBeds === 1 ? 0.40 : 0.38) * 2) / 2;
    const livingW = plotW - diningW;

    rooms.push({
      id: `r-${roomIdRef.current++}`,
      name: "Grand Living Hall",
      type: "living",
      x: 0,
      y: startY,
      width: livingW,
      height: publicH,
      floor: 0,
      color: ROOM_COLORS.living,
    });

    rooms.push({
      id: `r-${roomIdRef.current++}`,
      name: "Family Dining Lounge",
      type: "dining",
      x: livingW,
      y: startY,
      width: diningW,
      height: publicH,
      floor: 0,
      color: ROOM_COLORS.dining,
    });

    const kitchenW = diningW;
    rooms.push({
      id: `r-${roomIdRef.current++}`,
      name: "Modular Kitchen",
      type: "kitchen",
      x: livingW,
      y: midY,
      width: kitchenW,
      height: midH,
      floor: 0,
      color: ROOM_COLORS.kitchen,
      isVastuAligned: isVastu,
    });

    if (reqStairs) {
      const lobbyW = livingW - 6.0;
      const stairW = 6.0;

      rooms.push({
        id: `r-${roomIdRef.current++}`,
        name: "Circulation Lobby",
        type: "passage",
        x: 0,
        y: midY,
        width: lobbyW,
        height: midH,
        floor: 0,
        color: ROOM_COLORS.passage,
      });

      rooms.push({
        id: `r-${roomIdRef.current++}`,
        name: "Staircase",
        type: "staircase",
        x: lobbyW,
        y: midY,
        width: stairW,
        height: midH,
        floor: 0,
        color: ROOM_COLORS.staircase,
      });
    } else {
      const coreW = livingW;
      const otsW = Math.min(4.5, Math.max(3.5, coreW * 0.28));
      const bathW = Math.min(5.5, Math.max(4.5, coreW * 0.36));
      const bathH = Math.min(7.5, Math.max(6.0, midH * 0.65));
      const utilH = midH - bathH;
      const lobbyW = coreW - otsW - bathW;

      rooms.push({
        id: `r-${roomIdRef.current++}`,
        name: "Central OTS Lightwell",
        type: "ots",
        x: 0,
        y: midY,
        width: otsW,
        height: bathH,
        floor: 0,
        color: ROOM_COLORS.ots,
      });

      rooms.push({
        id: `r-${roomIdRef.current++}`,
        name: "Common Bathroom",
        type: "bathroom",
        x: otsW,
        y: midY,
        width: bathW,
        height: bathH,
        floor: 0,
        color: ROOM_COLORS.bathroom,
      });

      rooms.push({
        id: `r-${roomIdRef.current++}`,
        name: "Circulation Lobby",
        type: "passage",
        x: otsW + bathW,
        y: midY,
        width: lobbyW,
        height: midH,
        floor: 0,
        color: ROOM_COLORS.passage,
      });

      rooms.push({
        id: `r-${roomIdRef.current++}`,
        name: "Utility Yard",
        type: "utility",
        x: 0,
        y: midY + bathH,
        width: otsW + bathW,
        height: utilH,
        floor: 0,
        color: ROOM_COLORS.utility,
      });
    }

    return { rooms, bedroom3Placed: false };
  }

  // Practical and Compact Variants
  const diningRatio = variant === "compact" ? 0.36 : 0.42;
  const diningW = Math.round(plotW * diningRatio * 2) / 2;
  const livingW = plotW - diningW;

  rooms.push({
    id: `r-${roomIdRef.current++}`,
    name: variant === "compact" ? "Living Hall" : "Formal Living Hall",
    type: "living",
    x: 0,
    y: startY,
    width: livingW,
    height: publicH,
    floor: 0,
    color: ROOM_COLORS.living,
  });

  rooms.push({
    id: `r-${roomIdRef.current++}`,
    name: variant === "compact" ? "Dining Nook" : "Dining Space",
    type: "dining",
    x: livingW,
    y: startY,
    width: diningW,
    height: publicH,
    floor: 0,
    color: ROOM_COLORS.dining,
  });

  const kitchenW = diningW;
  const serviceW = diningW;
  const coreW = livingW;

  if (reqStairs) {
    const stairW = Math.min(6.5, Math.max(5.0, Math.round((plotW - kitchenW) * 0.40 * 2) / 2));
    const lobbyW = plotW - kitchenW - stairW;

    rooms.push({
      id: `r-${roomIdRef.current++}`,
      name: "Staircase",
      type: "staircase",
      x: 0,
      y: midY,
      width: stairW,
      height: midH,
      floor: 0,
      color: ROOM_COLORS.staircase,
    });

    rooms.push({
      id: `r-${roomIdRef.current++}`,
      name: "Circulation Lobby",
      type: "passage",
      x: stairW,
      y: midY,
      width: lobbyW,
      height: midH,
      floor: 0,
      color: ROOM_COLORS.passage,
    });

    rooms.push({
      id: `r-${roomIdRef.current++}`,
      name: "Modular Kitchen",
      type: "kitchen",
      x: stairW + lobbyW,
      y: midY,
      width: kitchenW,
      height: midH,
      floor: 0,
      color: ROOM_COLORS.kitchen,
      isVastuAligned: isVastu,
    });
  } else {
    rooms.push({
      id: `r-${roomIdRef.current++}`,
      name: "Modular Kitchen",
      type: "kitchen",
      x: livingW,
      y: midY,
      width: serviceW,
      height: midH,
      floor: 0,
      color: ROOM_COLORS.kitchen,
      isVastuAligned: isVastu,
    });

    const bathW = Math.min(5.2, Math.max(4.2, coreW * 0.38));
    const bathH = Math.min(7.0, Math.max(5.5, midH * 0.62));
    const otsW = Math.min(4.2, coreW - bathW - circW);
    const lobbyW = coreW - bathW - otsW;
    const utilH = midH - bathH;

    rooms.push({
      id: `r-${roomIdRef.current++}`,
      name: "Common Bathroom",
      type: "bathroom",
      x: 0,
      y: midY,
      width: bathW,
      height: bathH,
      floor: 0,
      color: ROOM_COLORS.bathroom,
    });

    rooms.push({
      id: `r-${roomIdRef.current++}`,
      name: variant === "compact" ? "OTS Shaft" : "Lightwell OTS",
      type: "ots",
      x: bathW,
      y: midY,
      width: otsW,
      height: bathH,
      floor: 0,
      color: ROOM_COLORS.ots,
    });

    rooms.push({
      id: `r-${roomIdRef.current++}`,
      name: "Circulation Lobby",
      type: "passage",
      x: bathW + otsW,
      y: midY,
      width: lobbyW,
      height: midH,
      floor: 0,
      color: ROOM_COLORS.passage,
    });

    rooms.push({
      id: `r-${roomIdRef.current++}`,
      name: variant === "compact" ? "Laundry / Wash Area" : "Utility / Laundry Yard",
      type: "utility",
      x: 0,
      y: midY + bathH,
      width: bathW + otsW,
      height: utilH,
      floor: 0,
      color: ROOM_COLORS.utility,
    });
  }

  return { rooms, bedroom3Placed: false };
}

/**
 * Assembles Rear Sleeping Wing: Master Suite, En-suite Attached Bath, Secondary Bedroom, Common Bath, OTS.
 * Driven by:
 * - Master Bedroom <-> Attached Bath hard geometric adjacency
 * - Common Bathroom <-> Circulation Spine adjacency
 * - OTS Lightwell <-> Bedroom and Bathroom daylight/ventilation
 */
function assembleRearSleepingZone(
  plotW: number,
  rearY: number,
  rearH: number,
  circW: number,
  gfBeds: number,
  bedroom3Placed: boolean,
  reqBaths: number,
  reqStairs: boolean,
  isVastu: boolean,
  variant: LayoutStyleVariant,
  candidateIdx: number,
  roomIdRef: { current: number }
): Room[] {
  const rooms: Room[] = [];

  // Case 1: 1 Bedroom on Ground Floor (e.g. Duplex G+1)
  if (gfBeds === 1) {
    if (variant === "spacious") {
      const bedW = Math.round(plotW * 0.60 * 2) / 2;
      const bathW = plotW - bedW;
      const bathH = Math.min(7.5, Math.max(5.5, rearH * 0.50));
      const otsH = rearH - bathH;

      rooms.push({
        id: `r-${roomIdRef.current++}`,
        name: "Guest Suite Bedroom",
        type: "bedroom",
        x: 0,
        y: rearY,
        width: bedW,
        height: rearH,
        floor: 0,
        color: ROOM_COLORS.bedroom,
        isVastuAligned: isVastu,
      });

      rooms.push({
        id: `r-${roomIdRef.current++}`,
        name: "Common Bathroom",
        type: "bathroom",
        x: bedW,
        y: rearY,
        width: bathW,
        height: bathH,
        floor: 0,
        color: ROOM_COLORS.bathroom,
      });

      rooms.push({
        id: `r-${roomIdRef.current++}`,
        name: "Rear OTS / Wash Yard",
        type: "ots",
        x: bedW,
        y: rearY + bathH,
        width: bathW,
        height: otsH,
        floor: 0,
        color: ROOM_COLORS.ots,
      });
    } else {
      const bedW = Math.min(plotW - 6.0, Math.max(10.0, Math.round(plotW * 0.58 * 2) / 2));
      const bathW = Math.min(7.0, Math.max(5.0, plotW - bedW));
      const bathH = Math.min(7.0, Math.max(5.5, rearH * 0.50));
      const otsH = rearH - bathH;

      rooms.push({
        id: `r-${roomIdRef.current++}`,
        name: "Guest Suite Bedroom",
        type: "bedroom",
        x: 0,
        y: rearY,
        width: bedW,
        height: rearH,
        floor: 0,
        color: ROOM_COLORS.bedroom,
        isVastuAligned: isVastu,
      });

      rooms.push({
        id: `r-${roomIdRef.current++}`,
        name: "Common Bath",
        type: "bathroom",
        x: bedW,
        y: rearY,
        width: bathW,
        height: bathH,
        floor: 0,
        color: ROOM_COLORS.bathroom,
      });

      rooms.push({
        id: `r-${roomIdRef.current++}`,
        name: "Rear OTS / Wash Yard",
        type: "ots",
        x: bedW,
        y: rearY + bathH,
        width: bathW,
        height: otsH,
        floor: 0,
        color: ROOM_COLORS.ots,
      });
    }

    return rooms;
  }

  // Case 2: 2 or 3 Bedrooms on Ground Floor
  const halfW = Math.round(plotW * 0.50 * 2) / 2;
  const attBathH = Math.min(6.5, Math.max(5.0, rearH * 0.35));
  const bedH = rearH - attBathH;
  const attBathW = Math.min(7.5, Math.max(5.0, halfW * 0.45));

  rooms.push({
    id: `r-${roomIdRef.current++}`,
    name: "Master Bedroom Suite",
    type: "master_bedroom",
    x: 0,
    y: rearY,
    width: halfW,
    height: bedH,
    floor: 0,
    color: ROOM_COLORS.master_bedroom,
    isVastuAligned: isVastu,
  });

  rooms.push({
    id: `r-${roomIdRef.current++}`,
    name: "Attached Bath (Master)",
    type: "attached_bath",
    x: 0,
    y: rearY + bedH,
    width: attBathW,
    height: attBathH,
    floor: 0,
    color: ROOM_COLORS.attached_bath,
  });

  const hasRearSecondBath = bedroom3Placed || (reqStairs && gfBeds >= 2) || reqBaths >= 4;

  rooms.push({
    id: `r-${roomIdRef.current++}`,
    name: hasRearSecondBath
      ? (variant === "compact" ? "Rear OTS Shaft" : "Rear OTS Lightwell")
      : (variant === "spacious" ? "Rear Sit-Out / Balcony" : "Rear OTS Lightwell"),
    type: hasRearSecondBath ? "ots" : (variant === "spacious" ? "balcony" : "ots"),
    x: attBathW,
    y: rearY + bedH,
    width: halfW - attBathW,
    height: attBathH,
    floor: 0,
    color: (!hasRearSecondBath && variant === "spacious") ? ROOM_COLORS.balcony : ROOM_COLORS.ots,
  });

  if (hasRearSecondBath) {
    const bath2W = Math.min(7.0, Math.max(5.0, (plotW - halfW) * 0.45));

    rooms.push({
      id: `r-${roomIdRef.current++}`,
      name: "Bedroom 2",
      type: "bedroom",
      x: halfW,
      y: rearY,
      width: plotW - halfW,
      height: bedH,
      floor: 0,
      color: ROOM_COLORS.bedroom,
    });

    rooms.push({
      id: `r-${roomIdRef.current++}`,
      name: "Common Bathroom",
      type: "bathroom",
      x: halfW,
      y: rearY + bedH,
      width: bath2W,
      height: attBathH,
      floor: 0,
      color: ROOM_COLORS.bathroom,
    });

    if (reqBaths >= 3 && bedroom3Placed) {
      rooms.push({
        id: `r-${roomIdRef.current++}`,
        name: "Attached Bath (Bed 2)",
        type: "attached_bath",
        x: halfW + bath2W,
        y: rearY + bedH,
        width: plotW - halfW - bath2W,
        height: attBathH,
        floor: 0,
        color: ROOM_COLORS.attached_bath,
      });
    } else {
      rooms.push({
        id: `r-${roomIdRef.current++}`,
        name: variant === "compact" ? "Rear OTS / Wash Yard" : "Utility / Laundry Yard",
        type: "utility",
        x: halfW + bath2W,
        y: rearY + bedH,
        width: plotW - halfW - bath2W,
        height: attBathH,
        floor: 0,
        color: ROOM_COLORS.utility,
      });
    }
  } else {
    // Standard 2-bedroom rear wing (Common Bath placed in mid-family zone)
    rooms.push({
      id: `r-${roomIdRef.current++}`,
      name: "Bedroom 2",
      type: "bedroom",
      x: halfW,
      y: rearY,
      width: plotW - halfW,
      height: rearH,
      floor: 0,
      color: ROOM_COLORS.bedroom,
    });
  }

  return rooms;
}

/**
 * Constraint-driven architectural room placement engine.
 * Pipeline:
 * requirements -> zoning -> adjacency constraints -> circulation spine -> candidate room placement -> hard validation.
 */
export function placeGroundRooms(
  req: HouseRequirements,
  variant: LayoutStyleVariant,
  candidateIdx = 0
): Room[] {
  const plotW = req.plot.width;
  const isVastu = !!req.preferences?.vastu;
  const facing: CompassDirection = req.facing || "north";
  const isDuplex = req.floors >= 2;
  const reqStairs = isDuplex || !!req.staircase;

  const totalBeds =
    req.rooms
      .filter((r) => r.type === "bedroom" || r.type === "master_bedroom")
      .reduce((sum, r) => sum + r.quantity, 0) || 2;
  const gfBeds = isDuplex ? (totalBeds >= 4 ? 2 : 1) : totalBeds;

  const reqBaths =
    req.rooms
      .filter((r) => r.type === "bathroom" || r.type === "attached_bath")
      .reduce((sum, r) => sum + r.quantity, 0) || 2;

  // 1. Functional Zoning Decomposition
  const zoning = calculateFunctionalZoning(req, variant, candidateIdx);
  const frontDepth = zoning.usableStartDepth;
  const startY = frontDepth;
  const publicH = zoning.frontPublicZone.height;
  const midH = zoning.midFamilyZone.height;
  const rearH = zoning.rearPrivateZone.height;
  const rearY = startY + publicH + midH;

  // 2. Adaptive Circulation Spine Width
  const circW = calculateCirculationWidth(plotW);

  const roomIdRef = { current: 1 };
  const allRooms: Room[] = [];

  // 3. Assemble Front Access & Parking/Verandah Zone
  const frontRooms = assembleFrontZone(
    plotW,
    frontDepth,
    req,
    variant,
    candidateIdx,
    isVastu,
    facing,
    roomIdRef
  );
  allRooms.push(...frontRooms);

  // 4. Assemble Public Living and Mid-Family Zone with Circulation Core
  const midAssembly = assemblePublicAndMidZone(
    plotW,
    startY,
    publicH,
    midH,
    circW,
    gfBeds,
    reqStairs,
    isVastu,
    variant,
    candidateIdx,
    roomIdRef
  );
  allRooms.push(...midAssembly.rooms);

  // 5. Assemble Rear Sleeping Wing with Sanitary Core and Natural Lightwells
  const rearRooms = assembleRearSleepingZone(
    plotW,
    rearY,
    rearH,
    circW,
    gfBeds,
    midAssembly.bedroom3Placed,
    reqBaths,
    reqStairs,
    isVastu,
    variant,
    candidateIdx,
    roomIdRef
  );
  allRooms.push(...rearRooms);

  return allRooms;
}
