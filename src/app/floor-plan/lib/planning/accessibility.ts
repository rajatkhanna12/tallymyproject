import { Door, Room, Window } from "../types";
import { getSharedWallLength } from "./adjacency";

export interface RoomAccessibility {
  roomId: string;
  name: string;
  isReachable: boolean;
  route: string;
  hasVentilation: boolean;
  ventilationSource: "exterior_window" | "ots_lightwell" | "none";
}

export interface PlanAccessibilityAudit {
  allReachable: boolean;
  unreachableRooms: string[];
  unventilatedRooms: string[];
  roomDetails: RoomAccessibility[];
}

export interface ConnectedRooms {
  roomA: Room;
  roomB: Room;
}

/**
 * Determines the two rooms physically connected by a door using strict wall-segment geometry.
 * Verifies:
 * 1. Both rooms are on the door's floor.
 * 2. The door segment lies on the boundary between Room A and Room B.
 * 3. Room A and Room B are on physically opposite sides of that wall.
 * 4. The door span overlaps the shared boundary by at least the threshold (0.5 ft).
 * 5. Bounding-box proximity without boundary overlap is strictly rejected.
 */
export function getRoomsConnectedByDoor(
  door: Door,
  rooms: Room[]
): ConnectedRooms | null {
  const floorRooms = rooms.filter((r) => r.floor === door.floor);
  const EPS = 0.35; // Wall tolerance in feet
  const MIN_OVERLAP = 0.5; // Minimum 6 inches of physical opening overlap

  if (door.orientation === "horizontal") {
    const doorX1 = door.x;
    const doorX2 = door.x + door.width;
    const doorY = door.y;

    // Room A lies above the wall segment (bottom edge touches doorY)
    const candidatesA = floorRooms.filter((r) => {
      const touchesY = Math.abs(r.y + r.height - doorY) <= EPS;
      if (!touchesY) return false;
      const overlapX = Math.min(r.x + r.width, doorX2) - Math.max(r.x, doorX1);
      return overlapX >= MIN_OVERLAP;
    });

    // Room B lies below the wall segment (top edge touches doorY)
    const candidatesB = floorRooms.filter((r) => {
      const touchesY = Math.abs(r.y - doorY) <= EPS;
      if (!touchesY) return false;
      const overlapX = Math.min(r.x + r.width, doorX2) - Math.max(r.x, doorX1);
      return overlapX >= MIN_OVERLAP;
    });

    for (const rA of candidatesA) {
      for (const rB of candidatesB) {
        if (rA.id === rB.id) continue;
        const sharedWall = Math.min(rA.x + rA.width, rB.x + rB.width) - Math.max(rA.x, rB.x);
        if (sharedWall >= MIN_OVERLAP) {
          if (!door.roomId || door.roomId === rA.id || door.roomId === rB.id) {
            return { roomA: rA, roomB: rB };
          }
        }
      }
    }
  } else if (door.orientation === "vertical") {
    const doorY1 = door.y;
    const doorY2 = door.y + door.width;
    const doorX = door.x;

    // Room A lies to the left of the wall segment (right edge touches doorX)
    const candidatesA = floorRooms.filter((r) => {
      const touchesX = Math.abs(r.x + r.width - doorX) <= EPS;
      if (!touchesX) return false;
      const overlapY = Math.min(r.y + r.height, doorY2) - Math.max(r.y, doorY1);
      return overlapY >= MIN_OVERLAP;
    });

    // Room B lies to the right of the wall segment (left edge touches doorX)
    const candidatesB = floorRooms.filter((r) => {
      const touchesX = Math.abs(r.x - doorX) <= EPS;
      if (!touchesX) return false;
      const overlapY = Math.min(r.y + r.height, doorY2) - Math.max(r.y, doorY1);
      return overlapY >= MIN_OVERLAP;
    });

    for (const rA of candidatesA) {
      for (const rB of candidatesB) {
        if (rA.id === rB.id) continue;
        const sharedWall = Math.min(rA.y + rA.height, rB.y + rB.height) - Math.max(rA.y, rB.y);
        if (sharedWall >= MIN_OVERLAP) {
          if (!door.roomId || door.roomId === rA.id || door.roomId === rB.id) {
            return { roomA: rA, roomB: rB };
          }
        }
      }
    }
  }

  return null;
}

/**
 * Geometrically verifies route-based accessibility from the main entrance.
 * Uses BFS graph traversal over doors and valid open connections.
 * A room is accessible ONLY if there is a viable physical path:
 * Main Entry -> Porch/Living -> Circulation / Parent Room -> Door -> Target Room.
 */
export function auditPlanAccessibility(
  rooms: Room[],
  doors: Door[],
  windows: Window[],
  floor: number
): PlanAccessibilityAudit {
  const floorRooms = rooms.filter((r) => r.floor === floor);
  const floorDoors = doors.filter((d) => d.floor === floor);
  const floorWindows = windows.filter((w) => w.floor === floor);

  const entryRoom =
    floor === 0
      ? floorRooms.find((r) => r.type === "living") || floorRooms.find((r) => r.type === "verandah")
      : floorRooms.find((r) => r.type === "staircase") || floorRooms.find((r) => r.type === "passage") || floorRooms[0];

  const reachableSet = new Set<string>();
  const routeMap = new Map<string, string>();

  if (entryRoom) {
    reachableSet.add(entryRoom.id);
    routeMap.set(entryRoom.id, entryRoom.name);

    // BFS Queue
    const queue: string[] = [entryRoom.id];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentRoom = floorRooms.find((r) => r.id === currentId);
      if (!currentRoom) continue;

      // 1. Traverse via geometrically verified explicit doors
      for (const d of floorDoors) {
        const connected = getRoomsConnectedByDoor(d, floorRooms);
        if (!connected) continue;

        let target: Room | null = null;
        if (connected.roomA.id === currentId && !reachableSet.has(connected.roomB.id)) {
          target = connected.roomB;
        } else if (connected.roomB.id === currentId && !reachableSet.has(connected.roomA.id)) {
          target = connected.roomA;
        }

        if (target) {
          reachableSet.add(target.id);
          routeMap.set(
            target.id,
            `${routeMap.get(currentId)} -> [${d.label || "Door"}] -> ${target.name}`
          );
          queue.push(target.id);
        }
      }

      // 2. Traverse via intentional wide open transitions (e.g. Living <-> Dining, Porch <-> Parking, Passage <-> Living/Dining, Staircase <-> Passage/Lounge)
      for (const target of floorRooms) {
        if (target.id === currentId || reachableSet.has(target.id)) continue;

        const isIntentionalOpenTransition =
          (currentRoom.type === "living" && target.type === "dining") ||
          (currentRoom.type === "dining" && target.type === "living") ||
          (currentRoom.type === "verandah" && target.type === "parking") ||
          (currentRoom.type === "parking" && target.type === "verandah") ||
          (currentRoom.type === "passage" && (target.type === "living" || target.type === "dining")) ||
          ((currentRoom.type === "living" || currentRoom.type === "dining") && target.type === "passage") ||
          (currentRoom.type === "staircase" && (target.type === "passage" || target.type === "living")) ||
          ((currentRoom.type === "passage" || currentRoom.type === "living") && target.type === "staircase");

        if (isIntentionalOpenTransition && getSharedWallLength(currentRoom, target) >= 2.5) {
          reachableSet.add(target.id);
          routeMap.set(
            target.id,
            `${routeMap.get(currentId)} -> [Open Transition] -> ${target.name}`
          );
          queue.push(target.id);
        }
      }
    }
  }

  // Evaluate Daylight & Ventilation
  const unreachableRooms: string[] = [];
  const unventilatedRooms: string[] = [];
  const roomDetails: RoomAccessibility[] = [];

  for (const r of floorRooms) {
    if (r.type === "parking" || r.type === "passage" || r.type === "verandah" || r.type === "ots") {
      continue;
    }

    const isReachable = reachableSet.has(r.id);
    if (!isReachable) {
      unreachableRooms.push(r.name);
    }

    // Check windows touching room perimeter
    const EPS = 0.5;
    const hasExtWindow = floorWindows.some((w) => {
      const withinX = w.x >= r.x - EPS && w.x <= r.x + r.width + EPS;
      const withinY = w.y >= r.y - EPS && w.y <= r.y + r.height + EPS;
      return withinX && withinY;
    });

    const hasOTSAdjacency = floorRooms.some(
      (o) => o.type === "ots" && getSharedWallLength(r, o) >= 2.0
    );

    const hasVentilation = hasExtWindow || hasOTSAdjacency;
    const ventilationSource = hasExtWindow
      ? "exterior_window"
      : hasOTSAdjacency
      ? "ots_lightwell"
      : "none";

    if (!hasVentilation && (r.type === "bedroom" || r.type === "master_bedroom" || r.type === "living")) {
      unventilatedRooms.push(r.name);
    }

    roomDetails.push({
      roomId: r.id,
      name: r.name,
      isReachable,
      route: routeMap.get(r.id) || "UNREACHABLE",
      hasVentilation,
      ventilationSource,
    });
  }

  return {
    allReachable: unreachableRooms.length === 0,
    unreachableRooms,
    unventilatedRooms,
    roomDetails,
  };
}

export interface VerticalConnectivityResult {
  valid: boolean;
  reason?: string;
  overlapArea?: number;
  overlapRatio?: number;
  centerlineOffset?: number;
}

/**
 * Validates vertical staircase core connectivity and geometric compatibility
 * between Ground Floor and First Floor.
 * 
 * Rules (Phase 3 Correction 3):
 * 1. Ground Floor must have a staircase room; First Floor must have a staircase/landing room.
 * 2. If verticalCoreId is defined on either, both must share the same verticalCoreId.
 * 3. Does NOT require identical rectangular footprints. Evaluates geometric compatibility:
 *    - Bounding box intersection overlapX >= 2.8 ft, overlapY >= 2.8 ft.
 *    - Footprint overlap area ratio >= 45% of smaller core footprint.
 *    - Centerline offset <= 2.5 ft.
 */
export function validateVerticalConnectivity(rooms: Room[]): VerticalConnectivityResult {
  const isDuplex = rooms.some((r) => r.floor === 1);
  if (!isDuplex) {
    return { valid: true };
  }

  const gfStair = rooms.find((r) => r.floor === 0 && r.type === "staircase");
  const ffStair = rooms.find((r) => r.floor === 1 && r.type === "staircase");

  if (!gfStair) {
    return { valid: false, reason: "Ground Floor staircase is missing in duplex layout" };
  }
  if (!ffStair) {
    return { valid: false, reason: "First Floor staircase landing is missing in duplex layout" };
  }

  if (gfStair.verticalCoreId || ffStair.verticalCoreId) {
    if (gfStair.verticalCoreId !== ffStair.verticalCoreId) {
      return {
        valid: false,
        reason: `Mismatched verticalCoreId: GF has "${gfStair.verticalCoreId}" vs FF has "${ffStair.verticalCoreId}"`,
      };
    }
  }

  const overlapX = Math.min(gfStair.x + gfStair.width, ffStair.x + ffStair.width) - Math.max(gfStair.x, ffStair.x);
  const overlapY = Math.min(gfStair.y + gfStair.height, ffStair.y + ffStair.height) - Math.max(gfStair.y, ffStair.y);

  if (overlapX < 2.8 || overlapY < 2.8) {
    return {
      valid: false,
      reason: `Insufficient vertical core overlap: ${overlapX.toFixed(1)}' × ${overlapY.toFixed(1)}' (min 2.8' × 2.8' required)`,
    };
  }

  const overlapArea = overlapX * overlapY;
  const gfArea = gfStair.width * gfStair.height;
  const ffArea = ffStair.width * ffStair.height;
  const minArea = Math.min(gfArea, ffArea);
  const overlapRatio = overlapArea / minArea;

  if (overlapRatio < 0.45) {
    return {
      valid: false,
      reason: `Vertical core overlap ratio ${Math.round(overlapRatio * 100)}% is below 45% compatibility threshold`,
      overlapArea,
      overlapRatio,
    };
  }

  const gfCenterX = gfStair.x + gfStair.width / 2;
  const gfCenterY = gfStair.y + gfStair.height / 2;
  const ffCenterX = ffStair.x + ffStair.width / 2;
  const ffCenterY = ffStair.y + ffStair.height / 2;
  const centerlineOffset = Math.hypot(gfCenterX - ffCenterX, gfCenterY - ffCenterY);

  if (centerlineOffset > 2.5) {
    return {
      valid: false,
      reason: `Staircase centerline offset ${centerlineOffset.toFixed(1)}' exceeds 2.5' tolerance`,
      overlapArea,
      overlapRatio,
      centerlineOffset,
    };
  }

  return {
    valid: true,
    overlapArea,
    overlapRatio,
    centerlineOffset,
  };
}

/**
 * Audits end-to-end multi-floor accessibility across Ground Floor and First Floor using a genuine cross-floor BFS graph:
 * Main Entry -> Ground Circulation -> Ground Staircase -> [Vertical Core] -> First Floor Landing -> Upper Circulation -> Upper Rooms.
 * 
 * Rules:
 * 1. Traversal begins strictly at the Ground Floor main entrance (never pre-seeds upper floors).
 * 2. Traversals cross between floors ONLY through a verified matched verticalCoreId with valid geometric alignment.
 * 3. Upper rooms are reachable if and only if a continuous, unbroken path exists from the Ground Floor entrance.
 */
export function auditDuplexAccessibility(
  rooms: Room[],
  doors: Door[],
  windows: Window[]
): PlanAccessibilityAudit {
  const isDuplex = rooms.some((r) => r.floor === 1);
  if (!isDuplex) {
    return auditPlanAccessibility(rooms, doors, windows, 0);
  }

  // 1. Identify Ground Floor Main Entrance
  const gfRooms = rooms.filter((r) => r.floor === 0);
  const entryRoom =
    gfRooms.find((r) => r.type === "living") ||
    gfRooms.find((r) => r.type === "verandah") ||
    gfRooms.find((r) => r.type === "passage") ||
    gfRooms[0];

  if (!entryRoom) {
    return {
      allReachable: false,
      unreachableRooms: rooms.map((r) => (r.floor > 0 ? `${r.name} (Floor ${r.floor})` : r.name)),
      unventilatedRooms: [],
      roomDetails: [],
    };
  }

  // 2. Validate Vertical Core Connectivity upfront
  const vertConn = validateVerticalConnectivity(rooms);
  const gfStair = rooms.find((r) => r.floor === 0 && r.type === "staircase");
  const ffStair = rooms.find((r) => r.floor === 1 && r.type === "staircase");

  const canCrossFloors =
    vertConn.valid &&
    Boolean(
      gfStair &&
      ffStair &&
      gfStair.verticalCoreId &&
      ffStair.verticalCoreId &&
      gfStair.verticalCoreId === ffStair.verticalCoreId
    );

  // 3. Multi-Floor Graph BFS Traversal
  const reachableSet = new Set<string>();
  const routeMap = new Map<string, string>();

  reachableSet.add(entryRoom.id);
  routeMap.set(entryRoom.id, entryRoom.name);

  const queue: string[] = [entryRoom.id];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentRoom = rooms.find((r) => r.id === currentId);
    if (!currentRoom) continue;

    // Edge 1: Geometrically verified explicit doors on the same floor
    for (const d of doors) {
      if (d.floor !== currentRoom.floor) continue;
      const connected = getRoomsConnectedByDoor(d, rooms);
      if (!connected) continue;

      let target: Room | null = null;
      if (connected.roomA.id === currentId && !reachableSet.has(connected.roomB.id)) {
        target = connected.roomB;
      } else if (connected.roomB.id === currentId && !reachableSet.has(connected.roomA.id)) {
        target = connected.roomA;
      }

      if (target) {
        reachableSet.add(target.id);
        routeMap.set(
          target.id,
          `${routeMap.get(currentId)} -> [${d.label || "Door"}] -> ${target.name}`
        );
        queue.push(target.id);
      }
    }

    // Edge 2: Intentional open transitions on the same floor
    const sameFloorRooms = rooms.filter((r) => r.floor === currentRoom.floor);
    for (const target of sameFloorRooms) {
      if (target.id === currentId || reachableSet.has(target.id)) continue;

      const isIntentionalOpenTransition =
        (currentRoom.type === "living" && target.type === "dining") ||
        (currentRoom.type === "dining" && target.type === "living") ||
        (currentRoom.type === "verandah" && target.type === "parking") ||
        (currentRoom.type === "parking" && target.type === "verandah") ||
        (currentRoom.type === "passage" && (target.type === "living" || target.type === "dining")) ||
        ((currentRoom.type === "living" || currentRoom.type === "dining") && target.type === "passage") ||
        (currentRoom.type === "staircase" && (target.type === "passage" || target.type === "living")) ||
        ((currentRoom.type === "passage" || currentRoom.type === "living") && target.type === "staircase");

      if (isIntentionalOpenTransition && getSharedWallLength(currentRoom, target) >= 2.5) {
        reachableSet.add(target.id);
        routeMap.set(
          target.id,
          `${routeMap.get(currentId)} -> [Open Transition] -> ${target.name}`
        );
        queue.push(target.id);
      }
    }

    // Edge 3: Vertical Core Cross-Floor Transition
    // Allowed ONLY through a geometrically compatible matched verticalCoreId
    if (currentRoom.type === "staircase" && canCrossFloors) {
      const targetStair = currentRoom.floor === 0 ? ffStair : gfStair;
      if (targetStair && !reachableSet.has(targetStair.id)) {
        reachableSet.add(targetStair.id);
        routeMap.set(
          targetStair.id,
          `${routeMap.get(currentId)} -> [Vertical Core: ${currentRoom.verticalCoreId}] -> ${targetStair.name}`
        );
        queue.push(targetStair.id);
      }
    }
  }

  // 4. Audit Reachability & Ventilation for all rooms across all floors
  const unreachableRooms: string[] = [];
  const unventilatedRooms: string[] = [];
  const roomDetails: RoomAccessibility[] = [];

  for (const r of rooms) {
    if (r.type === "parking" || r.type === "passage" || r.type === "verandah" || r.type === "ots") {
      continue;
    }

    const isReachable = reachableSet.has(r.id);
    if (!isReachable) {
      unreachableRooms.push(r.floor > 0 ? `${r.name} (Floor ${r.floor})` : r.name);
    }

    // Check exterior windows and OTS lightwell adjacency
    const EPS = 0.5;
    const floorWindows = windows.filter((w) => w.floor === r.floor);
    const hasExtWindow = floorWindows.some((w) => {
      const withinX = w.x >= r.x - EPS && w.x <= r.x + r.width + EPS;
      const withinY = w.y >= r.y - EPS && w.y <= r.y + r.height + EPS;
      return withinX && withinY;
    });

    const floorRooms = rooms.filter((fr) => fr.floor === r.floor);
    const hasOTSAdjacency = floorRooms.some(
      (o) => o.type === "ots" && getSharedWallLength(r, o) >= 2.0
    );

    const hasVentilation = hasExtWindow || hasOTSAdjacency;
    const ventilationSource = hasExtWindow
      ? "exterior_window"
      : hasOTSAdjacency
      ? "ots_lightwell"
      : "none";

    if (!hasVentilation && (r.type === "bedroom" || r.type === "master_bedroom" || r.type === "living")) {
      unventilatedRooms.push(r.name);
    }

    roomDetails.push({
      roomId: r.id,
      name: r.name,
      isReachable,
      route: routeMap.get(r.id) || "UNREACHABLE",
      hasVentilation,
      ventilationSource,
    });
  }

  return {
    allReachable: unreachableRooms.length === 0,
    unreachableRooms,
    unventilatedRooms,
    roomDetails,
  };
}

