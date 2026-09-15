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
 * Constraint-driven room placement solver for ground floor.
 * Reasons top-down:
 * Envelope -> Functional Zoning -> Adjacency -> Circulation Spine -> Room Dimensions.
 * Generates topologically distinct layouts based on style variant and candidate permutations.
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

  const totalBeds =
    req.rooms
      .filter((r) => r.type === "bedroom" || r.type === "master_bedroom")
      .reduce((sum, r) => sum + r.quantity, 0) || 2;
  const gfBeds = isDuplex ? (totalBeds >= 4 ? 2 : 1) : totalBeds;

  const hasParking = req.parking?.type && req.parking.type !== "none";
  const parkingType = req.parking?.type || "bike";
  const isCar = parkingType === "car" || parkingType === "both";
  const parkingQty = req.parking?.quantity || 1;

  const reqBaths =
    req.rooms
      .filter((r) => r.type === "bathroom" || r.type === "attached_bath")
      .reduce((sum, r) => sum + r.quantity, 0) || 2;

  const zoning = calculateFunctionalZoning(req, variant, candidateIdx);
  const rooms: Room[] = [];
  let roomId = 1;

  // ---------------------------------------------------------------------------------
  // 1. FRONT ZONE: Parking & Entrance Porch / Verandah
  // ---------------------------------------------------------------------------------
  const frontDepth = zoning.usableStartDepth;
  if (frontDepth > 0) {
    let parkingW = 0;
    if (hasParking) {
      if (isCar) {
        parkingW = parkingQty >= 2
          ? Math.min(plotW - 4.0, Math.max(18.0, plotW * 0.70))
          : Math.min(12.5, Math.max(9.5, Math.round(plotW * 0.45 * 2) / 2));
      } else {
        parkingW = Math.min(9.5, Math.max(7.5, Math.round(plotW * 0.38 * 2) / 2));
      }

      // Parking side: Vastu prefers North/East entry; candidate permutation varies side
      const parkingOnLeft = isVastu
        ? (facing === "north" || facing === "east")
        : (variant === "spacious" ? false : candidateIdx % 2 === 1);

      const parkX = parkingOnLeft ? 0 : plotW - parkingW;

      rooms.push({
        id: `r-${roomId++}`,
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
        id: `r-${roomId++}`,
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
      // No vehicle parking: full frontage verandah/porch
      rooms.push({
        id: `r-${roomId++}`,
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
  }

  // ---------------------------------------------------------------------------------
  // 2. PUBLIC & CORE ZONING
  // ---------------------------------------------------------------------------------
  const startY = frontDepth;
  const publicH = zoning.frontPublicZone.height;
  const midH = zoning.midFamilyZone.height;
  const rearH = zoning.rearPrivateZone.height;
  const midY = startY + publicH;
  const rearY = midY + midH;

  // Adaptive circulation width
  const circW = calculateCirculationWidth(plotW);

  // ---------------------------------------------------------------------------------
  // CASE A: 1 BEDROOM ON GROUND FLOOR (e.g. Duplex G+1)
  // ---------------------------------------------------------------------------------
  if (gfBeds === 1) {
    // Topological variation between variants:
    if (variant === "spacious") {
      // Spacious Duplex: Grand Living Hall + Side Open Dining + Corner Kitchen
      const diningW = Math.round(plotW * 0.40 * 2) / 2;
      const livingW = plotW - diningW;

      rooms.push({
        id: `r-${roomId++}`,
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
        id: `r-${roomId++}`,
        name: "Family Dining Lounge",
        type: "dining",
        x: livingW,
        y: startY,
        width: diningW,
        height: publicH,
        floor: 0,
        color: ROOM_COLORS.dining,
      });

      // Mid Zone: Modular Kitchen + Central Staircase + Lobby + Common Bath
      const kitchenW = diningW;
      const lobbyW = livingW - 6.0;
      const stairW = 6.0;

      rooms.push({
        id: `r-${roomId++}`,
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

      rooms.push({
        id: `r-${roomId++}`,
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
        id: `r-${roomId++}`,
        name: "Staircase",
        type: "staircase",
        x: lobbyW,
        y: midY,
        width: stairW,
        height: midH,
        floor: 0,
        color: ROOM_COLORS.staircase,
      });

      // Rear Zone: Guest Suite Bedroom + Attached Bath + OTS/Yard
      const bedW = Math.round(plotW * 0.60 * 2) / 2;
      const bathW = plotW - bedW;
      const bathH = Math.min(7.5, Math.max(5.5, rearH * 0.50));
      const otsH = rearH - bathH;

      rooms.push({
        id: `r-${roomId++}`,
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
        id: `r-${roomId++}`,
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
        id: `r-${roomId++}`,
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
      // Practical / Compact Duplex: Balanced layout with central circulation core
      const diningW = Math.round(plotW * (variant === "compact" ? 0.38 : 0.42) * 2) / 2;
      const livingW = plotW - diningW;

      rooms.push({
        id: `r-${roomId++}`,
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
        id: `r-${roomId++}`,
        name: "Dining Space",
        type: "dining",
        x: livingW,
        y: startY,
        width: diningW,
        height: publicH,
        floor: 0,
        color: ROOM_COLORS.dining,
      });

      // Mid Zone: Modular Kitchen (Right) + Staircase (Left) + Central Circulation Lobby
      const kitchenW = diningW;
      const stairW = Math.min(6.5, Math.max(5.0, Math.round((plotW - kitchenW) * 0.40 * 2) / 2));
      const lobbyW = plotW - kitchenW - stairW;

      rooms.push({
        id: `r-${roomId++}`,
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
        id: `r-${roomId++}`,
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
        id: `r-${roomId++}`,
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

      // Rear Zone: Guest Suite Bedroom (Left) + Common Bath & Rear OTS (Right)
      const bedW = Math.min(plotW - 6.0, Math.max(10.0, stairW + Math.round(lobbyW * 0.5 * 2) / 2));
      const bathW = Math.min(7.0, Math.max(5.0, plotW - bedW));
      const bathH = Math.min(7.0, Math.max(5.5, rearH * 0.50));
      const otsH = rearH - bathH;

      rooms.push({
        id: `r-${roomId++}`,
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
        id: `r-${roomId++}`,
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
        id: `r-${roomId++}`,
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

  // ---------------------------------------------------------------------------------
  // CASE B: 2 BEDROOMS ON GROUND FLOOR (e.g. 20x50, 23x50, 25x50 2BHK)
  // ---------------------------------------------------------------------------------
  if (gfBeds === 2) {
    if (variant === "spacious") {
      // 1. Spacious Variant:
      // Front Living (Left) + Open Dining (Right) -> Wide Central Circulation Core -> Rear Master Suite & Bed 2
      const diningW = Math.round(plotW * 0.38 * 2) / 2;
      const livingW = plotW - diningW;

      rooms.push({
        id: `r-${roomId++}`,
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
        id: `r-${roomId++}`,
        name: "Family Dining Lounge",
        type: "dining",
        x: livingW,
        y: startY,
        width: diningW,
        height: publicH,
        floor: 0,
        color: ROOM_COLORS.dining,
      });

      // Mid Zone: Modular Kitchen on Right + Central OTS + Common Bath + Circulation Lobby + Utility
      const serviceW = diningW;
      const coreW = livingW;

      rooms.push({
        id: `r-${roomId++}`,
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

      const otsW = Math.min(4.5, Math.max(3.5, coreW * 0.28));
      const bathW = Math.min(5.5, Math.max(4.5, coreW * 0.36));
      const bathH = Math.min(7.5, Math.max(6.0, midH * 0.65));
      const utilH = midH - bathH;
      const lobbyW = coreW - otsW - bathW;

      rooms.push({
        id: `r-${roomId++}`,
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
        id: `r-${roomId++}`,
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
        id: `r-${roomId++}`,
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
        id: `r-${roomId++}`,
        name: "Utility Yard",
        type: "utility",
        x: 0,
        y: midY + bathH,
        width: otsW + bathW,
        height: utilH,
        floor: 0,
        color: ROOM_COLORS.utility,
      });

      // Rear Zone: Master Bedroom Suite (Left) + Secondary Bedroom (Right) + Attached Bath + Rear OTS
      const halfW = Math.round(plotW * 0.50 * 2) / 2;
      const attBathH = Math.min(6.5, Math.max(5.0, rearH * 0.35));
      const bedH = rearH - attBathH;
      const attBathW = Math.min(7.5, Math.max(5.0, halfW * 0.45));

      rooms.push({
        id: `r-${roomId++}`,
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
        id: `r-${roomId++}`,
        name: "Attached Bath (Master)",
        type: "attached_bath",
        x: 0,
        y: rearY + bedH,
        width: attBathW,
        height: attBathH,
        floor: 0,
        color: ROOM_COLORS.attached_bath,
      });

      rooms.push({
        id: `r-${roomId++}`,
        name: "Rear Sit-Out / Balcony",
        type: "balcony",
        x: attBathW,
        y: rearY + bedH,
        width: halfW - attBathW,
        height: attBathH,
        floor: 0,
        color: ROOM_COLORS.balcony,
      });

      rooms.push({
        id: `r-${roomId++}`,
        name: "Bedroom 2",
        type: "bedroom",
        x: halfW,
        y: rearY,
        width: plotW - halfW,
        height: rearH,
        floor: 0,
        color: ROOM_COLORS.bedroom,
      });

    } else if (variant === "compact") {
      // 2. Compact Variant:
      // Linear streamlined flow maximizing room square footage; zero dead corridor; kitchen on left
      const diningW = Math.round(plotW * 0.36 * 2) / 2;
      const livingW = plotW - diningW;

      rooms.push({
        id: `r-${roomId++}`,
        name: "Living Hall",
        type: "living",
        x: 0,
        y: startY,
        width: livingW,
        height: publicH,
        floor: 0,
        color: ROOM_COLORS.living,
      });

      rooms.push({
        id: `r-${roomId++}`,
        name: "Dining Nook",
        type: "dining",
        x: livingW,
        y: startY,
        width: diningW,
        height: publicH,
        floor: 0,
        color: ROOM_COLORS.dining,
      });

      // Mid Core
      const serviceW = diningW;
      const coreW = livingW;

      rooms.push({
        id: `r-${roomId++}`,
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

      const bathW = Math.min(5.0, Math.max(4.2, coreW * 0.38));
      const bathH = Math.min(7.0, Math.max(5.5, midH * 0.60));
      const otsW = Math.min(4.0, coreW - bathW - circW);
      const lobbyW = coreW - bathW - otsW;
      const utilH = midH - bathH;

      rooms.push({
        id: `r-${roomId++}`,
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
        id: `r-${roomId++}`,
        name: "OTS Shaft",
        type: "ots",
        x: bathW,
        y: midY,
        width: otsW,
        height: bathH,
        floor: 0,
        color: ROOM_COLORS.ots,
      });

      rooms.push({
        id: `r-${roomId++}`,
        name: "Central Lobby",
        type: "passage",
        x: bathW + otsW,
        y: midY,
        width: lobbyW,
        height: midH,
        floor: 0,
        color: ROOM_COLORS.passage,
      });

      rooms.push({
        id: `r-${roomId++}`,
        name: "Laundry / Wash Area",
        type: "utility",
        x: 0,
        y: midY + bathH,
        width: bathW + otsW,
        height: utilH,
        floor: 0,
        color: ROOM_COLORS.utility,
      });

      // Rear Bedrooms
      const halfW = Math.round(plotW * 0.50 * 2) / 2;
      const attBathH = Math.min(6.0, rearH * 0.35);
      const bedH = rearH - attBathH;
      const attBathW = Math.min(7.0, halfW * 0.45);

      rooms.push({
        id: `r-${roomId++}`,
        name: "Master Bedroom",
        type: "master_bedroom",
        x: 0,
        y: rearY,
        width: halfW,
        height: bedH,
        floor: 0,
        color: ROOM_COLORS.master_bedroom,
      });

      rooms.push({
        id: `r-${roomId++}`,
        name: "Attached Bath",
        type: "attached_bath",
        x: 0,
        y: rearY + bedH,
        width: attBathW,
        height: attBathH,
        floor: 0,
        color: ROOM_COLORS.attached_bath,
      });

      rooms.push({
        id: `r-${roomId++}`,
        name: "Rear OTS Lightwell",
        type: "ots",
        x: attBathW,
        y: rearY + bedH,
        width: halfW - attBathW,
        height: attBathH,
        floor: 0,
        color: ROOM_COLORS.ots,
      });

      rooms.push({
        id: `r-${roomId++}`,
        name: "Bedroom 2",
        type: "bedroom",
        x: halfW,
        y: rearY,
        width: plotW - halfW,
        height: rearH,
        floor: 0,
        color: ROOM_COLORS.bedroom,
      });

    } else {
      // 3. Practical Variant (Balanced Residential Standard):
      const diningW = Math.round(plotW * 0.39 * 2) / 2;
      const livingW = plotW - diningW;

      rooms.push({
        id: `r-${roomId++}`,
        name: "Formal Living Hall",
        type: "living",
        x: 0,
        y: startY,
        width: livingW,
        height: publicH,
        floor: 0,
        color: ROOM_COLORS.living,
      });

      rooms.push({
        id: `r-${roomId++}`,
        name: "Dining Space",
        type: "dining",
        x: livingW,
        y: startY,
        width: diningW,
        height: publicH,
        floor: 0,
        color: ROOM_COLORS.dining,
      });

      const serviceW = diningW;
      const coreW = livingW;

      rooms.push({
        id: `r-${roomId++}`,
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

      const otsW = 4.0;
      const bathW = 5.0;
      const bathH = 7.0;
      const hallW = coreW - bathW - otsW;
      const utilH = midH - bathH;

      rooms.push({
        id: `r-${roomId++}`,
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
        id: `r-${roomId++}`,
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
        id: `r-${roomId++}`,
        name: "Circulation Lobby",
        type: "passage",
        x: otsW + bathW,
        y: midY,
        width: hallW,
        height: midH,
        floor: 0,
        color: ROOM_COLORS.passage,
      });

      rooms.push({
        id: `r-${roomId++}`,
        name: "Utility / Laundry Yard",
        type: "utility",
        x: 0,
        y: midY + bathH,
        width: otsW + bathW,
        height: utilH,
        floor: 0,
        color: ROOM_COLORS.utility,
      });

      const halfW = Math.round(plotW * 0.50 * 2) / 2;
      const attBathH = 5.5;
      const mBedH = rearH - attBathH;
      const attBathW = Math.min(7.0, Math.max(5.0, halfW * 0.45));

      rooms.push({
        id: `r-${roomId++}`,
        name: "Master Bedroom",
        type: "master_bedroom",
        x: 0,
        y: rearY,
        width: halfW,
        height: mBedH,
        floor: 0,
        color: ROOM_COLORS.master_bedroom,
        isVastuAligned: isVastu,
      });

      rooms.push({
        id: `r-${roomId++}`,
        name: "Attached Bath",
        type: "attached_bath",
        x: 0,
        y: rearY + mBedH,
        width: attBathW,
        height: attBathH,
        floor: 0,
        color: ROOM_COLORS.attached_bath,
      });

      rooms.push({
        id: `r-${roomId++}`,
        name: "Rear OTS / Balcony",
        type: "ots",
        x: attBathW,
        y: rearY + mBedH,
        width: halfW - attBathW,
        height: attBathH,
        floor: 0,
        color: ROOM_COLORS.ots,
      });

      rooms.push({
        id: `r-${roomId++}`,
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

  // ---------------------------------------------------------------------------------
  // CASE C: 3 BEDROOMS ON GROUND FLOOR (e.g. 25x50, 30x50 3BHK)
  // ---------------------------------------------------------------------------------
  // On wide or deep single-story plots requiring 3 bedrooms on one level:
  // Public front -> Central Dining, Kitchen, Bath -> Rear Wing with Master + Bed 2 + Bed 3
  const diningW = Math.round(plotW * 0.38 * 2) / 2;
  const livingW = plotW - diningW;

  rooms.push({
    id: `r-${roomId++}`,
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
    id: `r-${roomId++}`,
    name: "Family Dining Space",
    type: "dining",
    x: livingW,
    y: startY,
    width: diningW,
    height: publicH,
    floor: 0,
    color: ROOM_COLORS.dining,
  });

  // Mid Zone: Modular Kitchen + Central Passage + Bedroom 3
  const bed3W = Math.round(plotW * 0.44 * 2) / 2;
  const midPassageW = circW;
  const kitchenW = plotW - bed3W - midPassageW;

  rooms.push({
    id: `r-${roomId++}`,
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
    id: `r-${roomId++}`,
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
    id: `r-${roomId++}`,
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

  // Rear Zone: Master Bed (Left) + Bed 2 (Right) + Attached Bath + Common Bath
  const halfW = Math.round(plotW * 0.50 * 2) / 2;
  const bathH = Math.min(6.5, Math.max(5.0, rearH * 0.35));
  const rearBedH = rearH - bathH;
  const bath1W = Math.min(7.0, Math.max(5.0, halfW * 0.45));
  const bath2W = Math.min(7.0, Math.max(5.0, (plotW - halfW) * 0.45));

  rooms.push({
    id: `r-${roomId++}`,
    name: "Master Bedroom Suite",
    type: "master_bedroom",
    x: 0,
    y: rearY,
    width: halfW,
    height: rearBedH,
    floor: 0,
    color: ROOM_COLORS.master_bedroom,
    isVastuAligned: isVastu,
  });

  rooms.push({
    id: `r-${roomId++}`,
    name: "Attached Bath (Master)",
    type: "attached_bath",
    x: 0,
    y: rearY + rearBedH,
    width: bath1W,
    height: bathH,
    floor: 0,
    color: ROOM_COLORS.attached_bath,
  });

  rooms.push({
    id: `r-${roomId++}`,
    name: "Rear OTS Lightwell",
    type: "ots",
    x: bath1W,
    y: rearY + rearBedH,
    width: halfW - bath1W,
    height: bathH,
    floor: 0,
    color: ROOM_COLORS.ots,
  });

  rooms.push({
    id: `r-${roomId++}`,
    name: "Bedroom 2",
    type: "bedroom",
    x: halfW,
    y: rearY,
    width: plotW - halfW,
    height: rearBedH,
    floor: 0,
    color: ROOM_COLORS.bedroom,
  });

  rooms.push({
    id: `r-${roomId++}`,
    name: "Common Bathroom",
    type: "bathroom",
    x: halfW,
    y: rearY + rearBedH,
    width: bath2W,
    height: bathH,
    floor: 0,
    color: ROOM_COLORS.bathroom,
  });

  if (reqBaths >= 3) {
    rooms.push({
      id: `r-${roomId++}`,
      name: "Attached Bath (Bed 2)",
      type: "attached_bath",
      x: halfW + bath2W,
      y: rearY + rearBedH,
      width: plotW - halfW - bath2W,
      height: bathH,
      floor: 0,
      color: ROOM_COLORS.attached_bath,
    });
  } else {
    rooms.push({
      id: `r-${roomId++}`,
      name: "Utility / Laundry Yard",
      type: "utility",
      x: halfW + bath2W,
      y: rearY + rearBedH,
      width: plotW - halfW - bath2W,
      height: bathH,
      floor: 0,
      color: ROOM_COLORS.utility,
    });
  }

  return rooms;
}
