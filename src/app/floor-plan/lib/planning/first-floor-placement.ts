import {
  HouseRequirements,
  LayoutStyleVariant,
  Room,
} from "../types";
import { ROOM_COLORS } from "./room-placement";
import { calculateStaircaseGeometry } from "./staircase";
import { calculateCirculationWidth } from "./circulation";

/**
 * Places First Floor rooms in a G+1 duplex plan.
 * 
 * Architectural Pipeline:
 * 1. Derives front terrace/balcony (strictly excluded from enclosed built-up area).
 * 2. Positions Staircase Landing with verified vertical compatibility matching the Ground Floor staircase.
 * 3. Adaptively distributes bedrooms and bathrooms according to spatial capacity,
 *    elder accessibility, and user requirements (NOT rigid BHK templates).
 * 4. Places an Upper Family Lounge and circulation lobby providing access to all upper rooms.
 * 5. Places Master Bedroom Suite with direct geometric adjacency to its attached bath.
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

  // 2. Front Balcony / Terrace (Road Facing, Level 1)
  const frontVerandah = gfRooms.find((r) => r.floor === 0 && (r.type === "verandah" || r.type === "parking"));
  const frontDepth = frontVerandah ? frontVerandah.height : 8.0;
  const balconyH = req.balcony !== false ? Math.min(6.0, Math.max(4.0, Math.round(frontDepth * 0.5 * 2) / 2)) : 0;

  if (req.balcony !== false) {
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

  // 3. Vertical Core: Staircase Landing on Floor 1
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

  // 4. Adaptive Room Distribution
  const totalBeds =
    req.rooms
      .filter((r) => r.type === "bedroom" || r.type === "master_bedroom")
      .reduce((sum, r) => sum + r.quantity, 0) || 2;
  const gfBeds = gfRooms.filter((r) => r.floor === 0 && (r.type === "bedroom" || r.type === "master_bedroom")).length;
  const ffBedsNeeded = Math.max(1, totalBeds - gfBeds);

  // 5. Zone Partitioning on First Floor:
  const ffFrontY = balconyH;
  const ffRearY = stairY + stairH;
  const rearH = plotL - ffRearY;
  const frontMidH = stairY - ffFrontY;

  // Upper Circulation Lobby connecting to Staircase Landing
  if (stairX === 0) {
    const lobbyW = Math.min(circW, plotW - stairW);
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

    const rightSpaceW = plotW - (stairW + lobbyW);
    if (rightSpaceW >= 5.0) {
      rooms.push({
        id: `r-${roomId++}`,
        name: "Upper Study / Common Bath",
        type: "bathroom",
        x: stairW + lobbyW,
        y: stairY,
        width: rightSpaceW,
        height: stairH,
        floor: 1,
        color: ROOM_COLORS.bathroom,
      });
    }
  } else {
    // stairX > 0: Lobby on the left
    rooms.push({
      id: `r-${roomId++}`,
      name: "Upper Circulation Lobby",
      type: "passage",
      x: 0,
      y: stairY,
      width: stairX,
      height: stairH,
      floor: 1,
      color: ROOM_COLORS.passage,
    });

    const rightSpaceW = plotW - (stairX + stairW);
    if (rightSpaceW >= 5.0) {
      rooms.push({
        id: `r-${roomId++}`,
        name: "Upper Study / Common Bath",
        type: "bathroom",
        x: stairX + stairW,
        y: stairY,
        width: rightSpaceW,
        height: stairH,
        floor: 1,
        color: ROOM_COLORS.bathroom,
      });
    }
  }

  // 6. Assemble Bedrooms and Private Spaces
  if (ffBedsNeeded === 1) {
    // Single bedroom on First Floor -> Grand Master Bedroom Suite in Rear
    const bathW = Math.min(8.0, Math.max(5.5, Math.round(plotW * 0.35 * 2) / 2));
    const mBedW = plotW - bathW;

    // Upper Family Lounge in Front/Mid Zone
    if (frontMidH >= 7.0) {
      rooms.push({
        id: `r-${roomId++}`,
        name: "Upper Family Lounge",
        type: "living",
        x: 0,
        y: ffFrontY,
        width: plotW,
        height: frontMidH,
        floor: 1,
        color: ROOM_COLORS.living,
      });
    }

    rooms.push({
      id: `r-${roomId++}`,
      name: "Master Bedroom Suite",
      type: "master_bedroom",
      x: 0,
      y: ffRearY,
      width: mBedW,
      height: rearH,
      floor: 1,
      color: ROOM_COLORS.master_bedroom,
      isVastuAligned: isVastu,
    });

    rooms.push({
      id: `r-${roomId++}`,
      name: "En-suite Master Bath",
      type: "attached_bath",
      x: mBedW,
      y: ffRearY,
      width: bathW,
      height: Math.min(7.5, rearH),
      floor: 1,
      color: ROOM_COLORS.attached_bath,
    });

    if (rearH - 7.5 >= 3.5) {
      rooms.push({
        id: `r-${roomId++}`,
        name: "Private Rear Sit-Out",
        type: "balcony",
        x: mBedW,
        y: ffRearY + 7.5,
        width: bathW,
        height: rearH - 7.5,
        floor: 1,
        color: ROOM_COLORS.balcony,
      });
    }
  } else if (ffBedsNeeded === 2) {
    // Two bedrooms on First Floor:
    // Bed 1 (Master Bedroom Suite) in Front Zone with direct Balcony access
    // Bed 2 in Rear Zone
    const bathW = Math.min(8.0, Math.max(5.5, Math.round(plotW * 0.35 * 2) / 2));
    const mBedW = plotW - bathW;

    const mBedH = Math.min(13.0, Math.max(10.0, frontMidH * 0.55));
    const loungeH = frontMidH - mBedH;

    // Master Bedroom Suite (at front, connects directly to Front Sky Balcony)
    rooms.push({
      id: `r-${roomId++}`,
      name: "Master Bedroom Suite",
      type: "master_bedroom",
      x: 0,
      y: ffFrontY,
      width: mBedW,
      height: mBedH,
      floor: 1,
      color: ROOM_COLORS.master_bedroom,
      isVastuAligned: isVastu,
    });

    // En-suite Master Bath (shares side wall with Master Bed)
    const mBathH = Math.min(7.5, mBedH);
    rooms.push({
      id: `r-${roomId++}`,
      name: "En-suite Master Bath",
      type: "attached_bath",
      x: mBedW,
      y: ffFrontY,
      width: bathW,
      height: mBathH,
      floor: 1,
      color: ROOM_COLORS.attached_bath,
    });

    if (mBedH - mBathH >= 3.5) {
      rooms.push({
        id: `r-${roomId++}`,
        name: "Walk-in Dressing",
        type: "passage",
        x: mBedW,
        y: ffFrontY + mBathH,
        width: bathW,
        height: mBedH - mBathH,
        floor: 1,
        color: ROOM_COLORS.passage,
      });
    }

    // Upper Family Lounge between Master Bed and Staircase
    if (loungeH >= 6.0) {
      rooms.push({
        id: `r-${roomId++}`,
        name: "Upper Family Lounge",
        type: "living",
        x: 0,
        y: ffFrontY + mBedH,
        width: plotW,
        height: loungeH,
        floor: 1,
        color: ROOM_COLORS.living,
      });
    }

    // Secondary Bedroom in Rear Zone
    const bed2W = plotW - bathW;
    rooms.push({
      id: `r-${roomId++}`,
      name: "Bedroom 2",
      type: "bedroom",
      x: 0,
      y: ffRearY,
      width: bed2W,
      height: rearH,
      floor: 1,
      color: ROOM_COLORS.bedroom,
    });

    const bath2H = Math.min(7.5, rearH);
    rooms.push({
      id: `r-${roomId++}`,
      name: "Attached Bath 2",
      type: "attached_bath",
      x: bed2W,
      y: ffRearY,
      width: bathW,
      height: bath2H,
      floor: 1,
      color: ROOM_COLORS.attached_bath,
    });

    if (rearH - bath2H >= 3.5) {
      rooms.push({
        id: `r-${roomId++}`,
        name: "Rear Utility Balcony",
        type: "balcony",
        x: bed2W,
        y: ffRearY + bath2H,
        width: bathW,
        height: rearH - bath2H,
        floor: 1,
        color: ROOM_COLORS.balcony,
      });
    }
  } else {
    // 3 or more bedrooms on First Floor (e.g. 4BHK duplex with 1 on ground, 3 on first)
    const bathW = Math.min(7.5, Math.max(5.0, Math.round(plotW * 0.25 * 2) / 2));
    const mBedW = plotW - bathW;
    const mBedH = Math.min(13.0, Math.max(10.0, frontMidH * 0.55));
    const loungeH = frontMidH - mBedH;

    rooms.push({
      id: `r-${roomId++}`,
      name: "Master Bedroom Suite",
      type: "master_bedroom",
      x: 0,
      y: ffFrontY,
      width: mBedW,
      height: mBedH,
      floor: 1,
      color: ROOM_COLORS.master_bedroom,
      isVastuAligned: isVastu,
    });

    rooms.push({
      id: `r-${roomId++}`,
      name: "En-suite Master Bath",
      type: "attached_bath",
      x: mBedW,
      y: ffFrontY,
      width: bathW,
      height: Math.min(7.5, mBedH),
      floor: 1,
      color: ROOM_COLORS.attached_bath,
    });

    if (loungeH >= 6.0) {
      rooms.push({
        id: `r-${roomId++}`,
        name: "Upper Family Lounge",
        type: "living",
        x: 0,
        y: ffFrontY + mBedH,
        width: plotW,
        height: loungeH,
        floor: 1,
        color: ROOM_COLORS.living,
      });
    }

    // Two bedrooms in rear side-by-side
    const halfW = Math.round(plotW * 0.5 * 2) / 2;
    const rearBedH = Math.max(9.5, rearH - 6.0);
    const rearBathH = rearH - rearBedH;

    rooms.push({
      id: `r-${roomId++}`,
      name: "Bedroom 2",
      type: "bedroom",
      x: 0,
      y: ffRearY,
      width: halfW,
      height: rearBedH,
      floor: 1,
      color: ROOM_COLORS.bedroom,
    });

    rooms.push({
      id: `r-${roomId++}`,
      name: "Bedroom 3",
      type: "bedroom",
      x: halfW,
      y: ffRearY,
      width: plotW - halfW,
      height: rearBedH,
      floor: 1,
      color: ROOM_COLORS.bedroom,
    });

    if (rearBathH >= 4.5) {
      const bath1W = Math.min(7.0, halfW * 0.5);
      rooms.push({
        id: `r-${roomId++}`,
        name: "Attached Bath 2",
        type: "attached_bath",
        x: 0,
        y: ffRearY + rearBedH,
        width: bath1W,
        height: rearBathH,
        floor: 1,
        color: ROOM_COLORS.attached_bath,
      });

      rooms.push({
        id: `r-${roomId++}`,
        name: "Attached Bath 3",
        type: "attached_bath",
        x: halfW,
        y: ffRearY + rearBedH,
        width: bath1W,
        height: rearBathH,
        floor: 1,
        color: ROOM_COLORS.attached_bath,
      });
    }
  }

  return rooms;
}
