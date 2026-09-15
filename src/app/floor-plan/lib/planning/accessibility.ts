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
      : floorRooms.find((r) => r.type === "passage") || floorRooms[0];

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

      // 2. Traverse via intentional wide open transitions (e.g. Living <-> Dining, Porch <-> Parking, Passage <-> Living/Dining)
      for (const target of floorRooms) {
        if (target.id === currentId || reachableSet.has(target.id)) continue;

        const isIntentionalOpenTransition =
          (currentRoom.type === "living" && target.type === "dining") ||
          (currentRoom.type === "dining" && target.type === "living") ||
          (currentRoom.type === "verandah" && target.type === "parking") ||
          (currentRoom.type === "parking" && target.type === "verandah") ||
          (currentRoom.type === "passage" && (target.type === "living" || target.type === "dining")) ||
          ((currentRoom.type === "living" || currentRoom.type === "dining") && target.type === "passage");

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
