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

      // 1. Traverse via explicit doors
      for (const d of floorDoors) {
        // Check if door borders current room
        const doorConnectsToCurrent =
          d.roomId === currentId ||
          (d.x >= currentRoom.x - 0.5 &&
            d.x <= currentRoom.x + currentRoom.width + 0.5 &&
            d.y >= currentRoom.y - 0.5 &&
            d.y <= currentRoom.y + currentRoom.height + 0.5);

        if (doorConnectsToCurrent) {
          // Find the other room this door connects to
          for (const target of floorRooms) {
            if (target.id === currentId || reachableSet.has(target.id)) continue;

            const doorConnectsToTarget =
              d.roomId === target.id ||
              (d.x >= target.x - 0.5 &&
                d.x <= target.x + target.width + 0.5 &&
                d.y >= target.y - 0.5 &&
                d.y <= target.y + target.height + 0.5);

            if (doorConnectsToTarget) {
              reachableSet.add(target.id);
              routeMap.set(
                target.id,
                `${routeMap.get(currentId)} -> ${target.name}`
              );
              queue.push(target.id);
            }
          }
        }
      }

      // 2. Traverse via wide open cased archways (e.g. Living <-> Dining, Porch <-> Parking)
      for (const target of floorRooms) {
        if (target.id === currentId || reachableSet.has(target.id)) continue;

        const isOpenTransition =
          (currentRoom.type === "living" && target.type === "dining") ||
          (currentRoom.type === "dining" && target.type === "living") ||
          (currentRoom.type === "verandah" && target.type === "parking") ||
          (currentRoom.type === "parking" && target.type === "verandah");

        if (isOpenTransition && getSharedWallLength(currentRoom, target) >= 3.0) {
          reachableSet.add(target.id);
          routeMap.set(
            target.id,
            `${routeMap.get(currentId)} -> [Open Arch] -> ${target.name}`
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
