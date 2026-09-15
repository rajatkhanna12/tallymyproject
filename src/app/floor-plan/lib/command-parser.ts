import { FloorPlan, Room } from "./types";
import { generateFurnitureForRooms } from "./furniture";

export interface CommandResult {
  success: boolean;
  message: string;
  updatedPlan: FloorPlan;
}

/**
 * Deterministic command interpreter for "Edit with AI" operations on a structured FloorPlan.
 */
export function executeEditCommand(
  plan: FloorPlan,
  commandText: string
): CommandResult {
  const text = commandText.toLowerCase().trim();

  // Deep clone plan
  const updated: FloorPlan = JSON.parse(JSON.stringify(plan));
  const { width: plotW, length: plotL } = updated.plot;

  // 1. Check for specific dimensions command: e.g. "Make bedroom 1 11 x 12 ft" or "Make kitchen 10 by 12"
  const dimMatch = text.match(
    /(?:make|set|resize)\s+(?:the\s+)?([a-z0-9\s]+?)\s+(?:to\s+)?(\d+(?:\.\d+)?)\s*(?:x|\*|by)\s*(\d+(?:\.\d+)?)/
  );

  if (dimMatch) {
    const targetQuery = dimMatch[1].trim();
    const newW = parseFloat(dimMatch[2]);
    const newH = parseFloat(dimMatch[3]);

    const targetRoom = findMatchingRoom(updated.rooms, targetQuery);
    if (targetRoom) {
      const oldW = targetRoom.width;
      const oldH = targetRoom.height;

      // Apply dimensions if they fit within plot
      if (targetRoom.x + newW <= plotW && targetRoom.y + newH <= plotL) {
        targetRoom.width = newW;
        targetRoom.height = newH;
        recalculatePlanTotals(updated);
        return {
          success: true,
          message: `Resized ${targetRoom.name} from ${oldW}'×${oldH}' to ${newW}'×${newH}' (${Math.round(newW * newH)} sq ft).`,
          updatedPlan: updated,
        };
      } else {
        return {
          success: false,
          message: `Requested size ${newW}'×${newH}' exceeds available plot bounds at current position.`,
          updatedPlan: plan,
        };
      }
    }
  }

  // 2. Relative size adjustments: "bigger", "larger", "expand", "smaller", "shrink"
  const isBigger = text.includes("bigger") || text.includes("larger") || text.includes("expand") || text.includes("increase");
  const isSmaller = text.includes("smaller") || text.includes("shrink") || text.includes("decrease") || text.includes("reduce");

  if (isBigger || isSmaller) {
    const targetRoom = findMatchingRoom(updated.rooms, text);
    if (targetRoom) {
      const delta = isBigger ? 1.5 : -1.5;
      const proposedW = Math.max(3, targetRoom.width + delta);
      const proposedH = Math.max(3, targetRoom.height + delta);

      if (targetRoom.x + proposedW <= plotW && targetRoom.y + proposedH <= plotL) {
        targetRoom.width = proposedW;
        targetRoom.height = proposedH;
        recalculatePlanTotals(updated);
        return {
          success: true,
          message: `${isBigger ? "Expanded" : "Reduced"} ${targetRoom.name} to ${targetRoom.width.toFixed(1)}' × ${targetRoom.height.toFixed(1)}' (${Math.round(targetRoom.width * targetRoom.height)} sq ft).`,
          updatedPlan: updated,
        };
      } else {
        return {
          success: false,
          message: `Cannot expand ${targetRoom.name} further without exceeding plot boundaries.`,
          updatedPlan: plan,
        };
      }
    }
  }

  // 3. Open kitchen to dining command
  if (text.includes("open kitchen") || (text.includes("kitchen") && text.includes("dining"))) {
    const kitchen = updated.rooms.find((r) => r.type === "kitchen");
    if (kitchen) {
      kitchen.name = "Open Modular Kitchen";
      return {
        success: true,
        message: "Configured kitchen as an open-concept layout connecting to dining.",
        updatedPlan: updated,
      };
    }
  }

  // 4. Balcony command: "add balcony" or "balcony"
  if (text.includes("balcony") && updated.floorsCount >= 2) {
    const hasBalcony = updated.rooms.some((r) => r.type === "balcony");
    if (!hasBalcony) {
      updated.rooms.unshift({
        id: `r-balcony-${Date.now()}`,
        name: "Front Balcony",
        type: "balcony",
        x: 0,
        y: 0,
        width: plotW,
        height: 6,
        floor: 1,
        color: "#ecfdf5",
      });
      recalculatePlanTotals(updated);
      return {
        success: true,
        message: "Added a 6 ft deep front balcony on the first floor.",
        updatedPlan: updated,
      };
    }
  }

  // Fallback if command was not understood
  return {
    success: false,
    message: `Could not interpret command: "${commandText}". Try: "Make master bedroom bigger", "Make kitchen 10 x 12", or "Make bathroom smaller".`,
    updatedPlan: plan,
  };
}

function findMatchingRoom(rooms: Room[], query: string): Room | undefined {
  const q = query.toLowerCase();
  if (q.includes("master")) return rooms.find((r) => r.type === "master_bedroom");
  if (q.includes("kitchen")) return rooms.find((r) => r.type === "kitchen");
  if (q.includes("living") || q.includes("hall")) return rooms.find((r) => r.type === "living");
  if (q.includes("dining")) return rooms.find((r) => r.type === "dining");
  if (q.includes("bath") || q.includes("toilet")) return rooms.find((r) => r.type === "bathroom" || r.type === "attached_bath");
  if (q.includes("parking") || q.includes("porch")) return rooms.find((r) => r.type === "parking");
  if (q.includes("stair")) return rooms.find((r) => r.type === "staircase");
  if (q.includes("balcony")) return rooms.find((r) => r.type === "balcony");
  if (q.includes("bedroom")) return rooms.find((r) => r.type === "bedroom" || r.type === "master_bedroom");
  return rooms[0];
}

function recalculatePlanTotals(plan: FloorPlan) {
  const groundRooms = plan.rooms.filter((r) => r.floor === 0);
  const firstRooms = plan.rooms.filter((r) => r.floor === 1);

  plan.groundFloorArea = Math.round(groundRooms.reduce((sum, r) => sum + r.width * r.height, 0));
  plan.firstFloorArea = Math.round(firstRooms.reduce((sum, r) => sum + r.width * r.height, 0));
  plan.totalBuiltUpArea = plan.groundFloorArea + plan.firstFloorArea;
  plan.metadata.usableArea = plan.totalBuiltUpArea;
  plan.metadata.roomsCount = plan.rooms.length;

  plan.furniture = [
    ...generateFurnitureForRooms(plan.rooms, plan.doors, 0),
    ...(plan.floorsCount > 1 ? generateFurnitureForRooms(plan.rooms, plan.doors, 1) : []),
  ];
}
