import {
  HouseRequirements,
  LayoutStyleVariant,
  Room,
} from "../types";
import { ROOM_COLORS } from "./room-placement";
import { calculateStaircaseGeometry } from "./staircase";
import { calculateCirculationWidth } from "./circulation";

/**
 * Places First Floor rooms in a G+1 duplex plan using a capacity- and constraint-driven
 * architectural spatial allocation engine (NOT rigid BHK templates).
 * 
 * Pipeline:
 * 1. Reserve Front Balcony / Terrace (exterior semi-open space, excluded from enclosed built-up area).
 * 2. Reserve Vertical Core: Staircase landing with matching verticalCoreId and geometric alignment.
 * 3. Reserve Circulation Spine / Lobby connecting staircase landing to front and rear spatial zones.
 * 4. Discover available unallocated spatial parcels (Front Zone, Core-Side Zone, Rear Zone).
 * 5. Parse room demand queue and user explicit dimensions.
 * 6. Capacity-driven spatial allocation:
 *    - Evaluate zone capacities (width, depth, area, aspect ratio, perimeter daylight).
 *    - Place Master Bedroom Suite (front balcony access or quiet rear according to capacity/preference).
 *    - Place En-suite Attached Bath directly adjacent (sharing wall >= 2.5').
 *    - Distribute secondary bedrooms according to parcel capacity and dimensions.
 *    - Place Upper Family Lounge and circulation connectivity.
 *    - Place Common Bath / Upper Study in available core-side or rear parcels.
 */
export function placeFirstFloorRooms(
  req: HouseRequirements,
  variant: LayoutStyleVariant,
  gfRooms: Room[],
  plotW: number,
  plotL: number,
  candidateIdx = 0
): Room[] {
  const rooms: Room[] = [];
  let roomId = 200 + candidateIdx * 30;
  const isVastu = !!req.preferences?.vastu;
  const circW = calculateCirculationWidth(plotW);

  // 1. Identify Ground Floor Staircase vertical core
  const gfStair = gfRooms.find((r) => r.floor === 0 && r.type === "staircase");
  const stairX = gfStair ? gfStair.x : Math.round((plotW - 6.0) * 2) / 2;
  const stairY = gfStair ? gfStair.y : Math.round(plotL * 0.35 * 2) / 2;
  const stairW = gfStair ? gfStair.width : 6.0;
  const stairH = gfStair ? gfStair.height : 9.5;
  const vCoreId = gfStair?.verticalCoreId || `vcore-ff-${candidateIdx}`;

  // 2. Reserve Front Balcony / Terrace (Road Facing, Level 1)
  const frontVerandah = gfRooms.find((r) => r.floor === 0 && (r.type === "verandah" || r.type === "parking"));
  const frontDepth = frontVerandah ? frontVerandah.height : 8.0;
  const balconyH = req.balcony !== false ? Math.min(6.0, Math.max(3.5, Math.round(frontDepth * 0.45 * 2) / 2)) : 0;

  if (req.balcony !== false && balconyH > 0) {
    rooms.push({
      id: `r-${roomId++}`,
      name: "Front Sky Balcony",
      type: "balcony",
      x: 0,
      y: 0,
      width: plotW,
      height: balconyH,
      floor: 1,
      color: ROOM_COLORS.balcony,
    });
  }

  // 3. Reserve Vertical Core: Staircase Landing on Floor 1
  const stairDetails = calculateStaircaseGeometry(
    stairW,
    stairH,
    gfStair?.staircaseDetails?.type || "dog_leg"
  );
  stairDetails.direction = "DN";

  rooms.push({
    id: `r-${roomId++}`,
    name: "Staircase Landing",
    type: "staircase",
    x: stairX,
    y: stairY,
    width: stairW,
    height: stairH,
    floor: 1,
    color: ROOM_COLORS.staircase,
    staircaseDetails: stairDetails,
    verticalCoreId: vCoreId,
  });

  // 4. Reserve Circulation Spine / Upper Lobby beside Staircase
  let lobbyW = circW;
  let coreSideW = 0;
  let coreSideX = 0;

  if (stairX === 0) {
    // Staircase on west wall: Lobby immediately beside it
    lobbyW = Math.min(circW, plotW - stairW);
    rooms.push({
      id: `r-${roomId++}`,
      name: "Upper Circulation Lobby",
      type: "passage",
      x: stairW,
      y: stairY,
      width: lobbyW,
      height: stairH,
      floor: 1,
      color: ROOM_COLORS.passage,
    });

    coreSideX = stairW + lobbyW;
    coreSideW = plotW - coreSideX;
  } else {
    // Staircase on interior or east wall: Lobby on west wall
    lobbyW = stairX;
    rooms.push({
      id: `r-${roomId++}`,
      name: "Upper Circulation Lobby",
      type: "passage",
      x: 0,
      y: stairY,
      width: lobbyW,
      height: stairH,
      floor: 1,
      color: ROOM_COLORS.passage,
    });

    coreSideX = stairX + stairW;
    coreSideW = plotW - coreSideX;
  }

  // 5. Discover Spatial Parcels
  const frontY = balconyH;
  const frontH = Math.max(0, stairY - frontY);
  const rearY = stairY + stairH;
  const rearH = Math.max(0, plotL - rearY);

  // 6. Determine Room Demand Queue & Explicit Dimensions
  const requestedBedrooms = req.rooms.filter((r) => r.type === "bedroom" || r.type === "master_bedroom");
  const totalBeds = requestedBedrooms.reduce((sum, r) => sum + r.quantity, 0) || 2;
  const gfBedsCount = gfRooms.filter((r) => r.floor === 0 && (r.type === "bedroom" || r.type === "master_bedroom")).length;
  const ffBedsNeeded = Math.max(1, totalBeds - gfBedsCount);

  const requestedBathrooms = req.rooms.filter((r) => r.type === "bathroom" || r.type === "attached_bath");
  const totalBaths = requestedBathrooms.reduce((sum, r) => sum + r.quantity, 0) || 2;
  const gfBathsCount = gfRooms.filter((r) => r.floor === 0 && (r.type === "bathroom" || r.type === "attached_bath")).length;
  const ffBathsNeeded = Math.max(1, totalBaths - gfBathsCount);

  // Check explicit user room dimensions
  const explicitMaster = requestedBedrooms.find((r) => r.type === "master_bedroom") || requestedBedrooms[0];
  const explicitMasterDim = explicitMaster?.dimensions;

  // 7. Capacity Evaluation of Spatial Parcels
  const canFrontFitBed = frontH >= 9.5 && plotW >= 10.0;
  const canFrontFitBedAndLounge = frontH >= 17.0 && plotW >= 10.0;
  const canRearSplitX = plotW >= 24.0 && rearH >= 9.5;
  const hasCoreSideCapacity = coreSideW >= 5.0 && stairH >= 6.0;

  let remainingBeds = ffBedsNeeded;
  let remainingBaths = ffBathsNeeded;
  let bedCounter = 2;

  // 8. PARCEL-DRIVEN CAPACITY ALLOCATION (Zero Rigid BHK Branches)

  // ---------------------------------------------------------------------------
  // PARCEL 1: Front Zone Allocation (Balcony-facing Street Frontage)
  // ---------------------------------------------------------------------------
  if (canFrontFitBed && remainingBeds > 0) {
    const bathW = Math.min(8.0, Math.max(5.0, Math.round(plotW * (plotW >= 28 ? 0.25 : 0.32) * 2) / 2));
    const mBedW = explicitMasterDim?.width
      ? Math.min(plotW - 5.0, Math.max(10.0, explicitMasterDim.width))
      : plotW - bathW;
    const actualBathW = plotW - mBedW;

    let mBedH: number;
    if (explicitMasterDim?.length) {
      mBedH = Math.min(frontH, Math.max(9.5, explicitMasterDim.length));
    } else if (canFrontFitBedAndLounge) {
      mBedH = Math.min(13.5, Math.max(10.5, Math.round(frontH * 0.55 * 2) / 2));
    } else {
      mBedH = Math.min(13.5, frontH);
    }
    const loungeH = frontH - mBedH;

    rooms.push({
      id: `r-${roomId++}`,
      name: "Master Bedroom Suite",
      type: "master_bedroom",
      x: 0,
      y: frontY,
      width: mBedW,
      height: mBedH,
      floor: 1,
      color: ROOM_COLORS.master_bedroom,
      isVastuAligned: isVastu,
    });
    remainingBeds--;

    const mBathH = Math.min(7.5, mBedH);
    rooms.push({
      id: `r-${roomId++}`,
      name: "En-suite Master Bath",
      type: "attached_bath",
      x: mBedW,
      y: frontY,
      width: actualBathW,
      height: mBathH,
      floor: 1,
      color: ROOM_COLORS.attached_bath,
    });
    remainingBaths--;

    if (mBedH - mBathH >= 3.5) {
      rooms.push({
        id: `r-${roomId++}`,
        name: "Walk-in Dressing",
        type: "passage",
        x: mBedW,
        y: frontY + mBathH,
        width: actualBathW,
        height: mBedH - mBathH,
        floor: 1,
        color: ROOM_COLORS.passage,
      });
    }

    if (loungeH >= 6.0) {
      rooms.push({
        id: `r-${roomId++}`,
        name: "Upper Family Lounge",
        type: "living",
        x: 0,
        y: frontY + mBedH,
        width: plotW,
        height: loungeH,
        floor: 1,
        color: ROOM_COLORS.living,
      });
    }
  } else if (frontH >= 6.0) {
    rooms.push({
      id: `r-${roomId++}`,
      name: "Upper Family Lounge",
      type: "living",
      x: 0,
      y: frontY,
      width: plotW,
      height: frontH,
      floor: 1,
      color: ROOM_COLORS.living,
    });
  }

  // ---------------------------------------------------------------------------
  // PARCEL 2: Rear Zone Allocation (Primary Quiet Sleeping / Suite Parcel)
  // ---------------------------------------------------------------------------
  if (remainingBeds >= 2 && canRearSplitX) {
    // Capacity allows two bedrooms side-by-side across rear width
    const halfW = Math.round(plotW * 0.5 * 2) / 2;
    const hasDepthForBaths = rearH >= 15.5 && remainingBaths >= 2;
    const rearBedH = hasDepthForBaths ? Math.max(10.0, rearH - 6.5) : rearH;
    const rearBathH = rearH - rearBedH;

    rooms.push({
      id: `r-${roomId++}`,
      name: `Bedroom ${bedCounter++}`,
      type: "bedroom",
      x: 0,
      y: rearY,
      width: halfW,
      height: rearBedH,
      floor: 1,
      color: ROOM_COLORS.bedroom,
    });

    rooms.push({
      id: `r-${roomId++}`,
      name: `Bedroom ${bedCounter++}`,
      type: "bedroom",
      x: halfW,
      y: rearY,
      width: plotW - halfW,
      height: rearBedH,
      floor: 1,
      color: ROOM_COLORS.bedroom,
    });
    remainingBeds -= 2;

    if (hasDepthForBaths && rearBathH >= 4.5) {
      const bath1W = Math.min(7.0, halfW * 0.5);
      rooms.push({
        id: `r-${roomId++}`,
        name: `Attached Bath ${bedCounter - 2}`,
        type: "attached_bath",
        x: 0,
        y: rearY + rearBedH,
        width: bath1W,
        height: rearBathH,
        floor: 1,
        color: ROOM_COLORS.attached_bath,
      });

      rooms.push({
        id: `r-${roomId++}`,
        name: `Attached Bath ${bedCounter - 1}`,
        type: "attached_bath",
        x: halfW,
        y: rearY + rearBedH,
        width: bath1W,
        height: rearBathH,
        floor: 1,
        color: ROOM_COLORS.attached_bath,
      });
      remainingBaths -= 2;
    }
  } else if (remainingBeds >= 1 && rearH >= 9.5) {
    // Capacity allows single rear bedroom suite
    const bathW = Math.min(8.0, Math.max(5.0, Math.round(plotW * 0.3 * 2) / 2));
    const bedW = plotW - bathW;

    rooms.push({
      id: `r-${roomId++}`,
      name: `Bedroom ${bedCounter++}`,
      type: "bedroom",
      x: 0,
      y: rearY,
      width: bedW,
      height: rearH,
      floor: 1,
      color: ROOM_COLORS.bedroom,
    });
    remainingBeds--;

    if (remainingBaths > 0) {
      const bathH = Math.min(7.5, rearH);
      rooms.push({
        id: `r-${roomId++}`,
        name: `Attached Bath ${bedCounter - 1}`,
        type: "attached_bath",
        x: bedW,
        y: rearY,
        width: bathW,
        height: bathH,
        floor: 1,
        color: ROOM_COLORS.attached_bath,
      });
      remainingBaths--;

      if (rearH - bathH >= 3.5) {
        rooms.push({
          id: `r-${roomId++}`,
          name: "Rear Utility Balcony",
          type: "balcony",
          x: bedW,
          y: rearY + bathH,
          width: bathW,
          height: rearH - bathH,
          floor: 1,
          color: ROOM_COLORS.balcony,
        });
      }
    } else {
      rooms.push({
        id: `r-${roomId++}`,
        name: "Rear Sit-Out Balcony",
        type: "balcony",
        x: bedW,
        y: rearY,
        width: bathW,
        height: rearH,
        floor: 1,
        color: ROOM_COLORS.balcony,
      });
    }
  } else if (remainingBeds === 0 && rearH >= 6.0) {
    // All requested bedrooms already placed; rear parcel becomes family lounge / terrace
    rooms.push({
      id: `r-${roomId++}`,
      name: "Upper Family Lounge",
      type: "living",
      x: 0,
      y: rearY,
      width: plotW,
      height: rearH,
      floor: 1,
      color: ROOM_COLORS.living,
    });
  }

  // ---------------------------------------------------------------------------
  // PARCEL 3: Core-Side Zone Allocation (Mid-Plot Lateral Space / Overflow)
  // ---------------------------------------------------------------------------
  if (hasCoreSideCapacity) {
    // If wide core-side space exists and additional beds are required (e.g. large 5BHK plots)
    if (remainingBeds > 0 && coreSideW >= 12.0 && stairH >= 9.0) {
      const coreBathW = remainingBaths > 0 ? Math.min(6.5, Math.max(4.5, coreSideW - 12.0)) : 0;
      const coreBedW = coreSideW - coreBathW;

      // Position attached bath on interior (beside lobby) and bedroom on perimeter (for exterior windows)
      if (coreBathW >= 4.5) {
        rooms.push({
          id: `r-${roomId++}`,
          name: `Attached Bath ${bedCounter}`,
          type: "attached_bath",
          x: coreSideX,
          y: stairY,
          width: coreBathW,
          height: stairH,
          floor: 1,
          color: ROOM_COLORS.attached_bath,
        });
        remainingBaths--;
      }

      rooms.push({
        id: `r-${roomId++}`,
        name: `Bedroom ${bedCounter++}`,
        type: "bedroom",
        x: coreSideX + coreBathW,
        y: stairY,
        width: coreBedW,
        height: stairH,
        floor: 1,
        color: ROOM_COLORS.bedroom,
      });
      remainingBeds--;
    } else if (remainingBaths > 0) {
      const bathH = Math.min(7.5, stairH);
      rooms.push({
        id: `r-${roomId++}`,
        name: "Upper Common Bath",
        type: "bathroom",
        x: coreSideX,
        y: stairY,
        width: coreSideW,
        height: bathH,
        floor: 1,
        color: ROOM_COLORS.bathroom,
      });
      remainingBaths--;

      if (stairH - bathH >= 3.5) {
        rooms.push({
          id: `r-${roomId++}`,
          name: "Linen / Store",
          type: "passage",
          x: coreSideX,
          y: stairY + bathH,
          width: coreSideW,
          height: stairH - bathH,
          floor: 1,
          color: ROOM_COLORS.passage,
        });
      }
    } else {
      rooms.push({
        id: `r-${roomId++}`,
        name: "Upper Study / Sitting Area",
        type: "living",
        x: coreSideX,
        y: stairY,
        width: coreSideW,
        height: stairH,
        floor: 1,
        color: ROOM_COLORS.living,
      });
    }
  }

  return rooms;
}
