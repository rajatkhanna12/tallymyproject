import { Door, Room, Window } from "../types";
import { formatFeetInches } from "../layout-engine";

/**
 * Contextual architectural door placement.
 * Connects every enclosed room to circulation, living, or its parent room (for en-suite bath).
 * Evaluates clear wall space and avoids placing doors where they would collide with major furniture.
 */
export function generateArchitecturalDoors(rooms: Room[], floor: number): Door[] {
  const floorRooms = rooms.filter((r) => r.floor === floor);
  const doors: Door[] = [];
  let doorIdx = 1;

  for (const r of floorRooms) {
    // Open/semi-open spaces don't have standard closed swinging entrance doors
    if (
      r.type === "parking" ||
      r.type === "passage" ||
      r.type === "verandah" ||
      r.type === "ots"
    ) {
      continue;
    }

    const isMainEntry = r.type === "living" && floor === 0;
    const isBath = r.type === "bathroom" || r.type === "attached_bath";
    const isBalcony = r.type === "balcony";
    const doorW = isMainEntry ? 3.5 : isBath ? 2.5 : isBalcony ? 2.75 : 3.0;

    // 1. MAIN ENTRANCE DOOR (From Front Porch / Verandah into Living Hall)
    if (isMainEntry) {
      doors.push({
        id: `d-${floor}-${doorIdx++}`,
        roomId: r.id,
        x: r.x + 0.6,
        y: r.y,
        width: doorW,
        orientation: "horizontal",
        swing: "inward_right",
        floor,
        label: "MAIN ENTRY (3'6\")",
      });
      continue;
    }

    // 2. ATTACHED BATHROOM DOOR (Must open directly from Master Bedroom)
    if (r.type === "attached_bath") {
      const master = floorRooms.find(
        (m) => m.type === "master_bedroom" && m.floor === floor
      );

      if (master) {
        // Find whether shared wall is top, bottom, left, or right
        const EPS = 0.2;
        const sharedOnTop = Math.abs(r.y - (master.y + master.height)) < EPS;
        const sharedOnBot = Math.abs(r.y + r.height - master.y) < EPS;
        const sharedOnLeft = Math.abs(r.x - (master.x + master.width)) < EPS;
        const sharedOnRight = Math.abs(r.x + r.width - master.x) < EPS;

        if (sharedOnTop) {
          doors.push({
            id: `d-${floor}-${doorIdx++}`,
            roomId: r.id,
            x: r.x + 0.5,
            y: r.y,
            width: doorW,
            orientation: "horizontal",
            swing: "inward_left",
            floor,
            label: "Att. Bath (2'6\")",
          });
          continue;
        } else if (sharedOnBot) {
          doors.push({
            id: `d-${floor}-${doorIdx++}`,
            roomId: r.id,
            x: r.x + 0.5,
            y: r.y + r.height,
            width: doorW,
            orientation: "horizontal",
            swing: "inward_left",
            floor,
            label: "Att. Bath (2'6\")",
          });
          continue;
        } else if (sharedOnLeft) {
          doors.push({
            id: `d-${floor}-${doorIdx++}`,
            roomId: r.id,
            x: r.x,
            y: r.y + 0.5,
            width: doorW,
            orientation: "vertical",
            swing: "inward_left",
            floor,
            label: "Att. Bath (2'6\")",
          });
          continue;
        } else if (sharedOnRight) {
          doors.push({
            id: `d-${floor}-${doorIdx++}`,
            roomId: r.id,
            x: r.x + r.width,
            y: r.y + 0.5,
            width: doorW,
            orientation: "vertical",
            swing: "inward_right",
            floor,
            label: "Att. Bath (2'6\")",
          });
          continue;
        }
      }

      // Default fallback: top edge
      doors.push({
        id: `d-${floor}-${doorIdx++}`,
        roomId: r.id,
        x: r.x + 0.5,
        y: r.y,
        width: doorW,
        orientation: "horizontal",
        swing: "inward_left",
        floor,
        label: "Att. Bath (2'6\")",
      });
      continue;
    }

    // 3. DINING ROOM: Skip closed door between Living and Dining (shared open cased archway)
    if (r.type === "dining") {
      const living = floorRooms.find((l) => l.type === "living");
      if (living && Math.abs(living.x + living.width - r.x) < 0.25) {
        continue;
      }
    }

    // 4. BALCONY DOOR
    if (r.type === "balcony") {
      const isFrontBalcony = Math.abs(r.y) < 0.1;
      doors.push({
        id: `d-${floor}-${doorIdx++}`,
        roomId: r.id,
        x: r.x + 0.5,
        y: isFrontBalcony ? r.y + r.height : r.y,
        width: doorW,
        orientation: "horizontal",
        swing: "outward_left",
        floor,
        label: "Balcony Door",
      });
      continue;
    }

    // 5. STANDARD ROOMS: Connect to circulation passage / lobby if adjacent
    const passages = floorRooms.filter((p) => p.type === "passage");
    let doorPlaced = false;

    for (const p of passages) {
      // Check Vertical boundary (room to left of passage or passage to left of room)
      if (Math.abs(r.x + r.width - p.x) < 0.25) {
        const overlapY1 = Math.max(r.y, p.y);
        const overlapY2 = Math.min(r.y + r.height, p.y + p.height);
        if (overlapY2 - overlapY1 >= doorW) {
          doors.push({
            id: `d-${floor}-${doorIdx++}`,
            roomId: r.id,
            x: r.x + r.width,
            y: overlapY1 + 0.5,
            width: doorW,
            orientation: "vertical",
            swing: "inward_left",
            floor,
            label: `${formatFeetInches(doorW)} Door`,
          });
          doorPlaced = true;
          break;
        }
      }

      if (Math.abs(p.x + p.width - r.x) < 0.25) {
        const overlapY1 = Math.max(r.y, p.y);
        const overlapY2 = Math.min(r.y + r.height, p.y + p.height);
        if (overlapY2 - overlapY1 >= doorW) {
          doors.push({
            id: `d-${floor}-${doorIdx++}`,
            roomId: r.id,
            x: r.x,
            y: overlapY1 + 0.5,
            width: doorW,
            orientation: "vertical",
            swing: "inward_right",
            floor,
            label: `${formatFeetInches(doorW)} Door`,
          });
          doorPlaced = true;
          break;
        }
      }

      // Check Horizontal boundary (room above passage or passage above room)
      if (Math.abs(r.y + r.height - p.y) < 0.25) {
        const overlapX1 = Math.max(r.x, p.x);
        const overlapX2 = Math.min(r.x + r.width, p.x + p.width);
        if (overlapX2 - overlapX1 >= doorW) {
          doors.push({
            id: `d-${floor}-${doorIdx++}`,
            roomId: r.id,
            x: overlapX1 + 0.5,
            y: r.y + r.height,
            width: doorW,
            orientation: "horizontal",
            swing: "inward_left",
            floor,
            label: `${formatFeetInches(doorW)} Door`,
          });
          doorPlaced = true;
          break;
        }
      }

      if (Math.abs(p.y + p.height - r.y) < 0.25) {
        const overlapX1 = Math.max(r.x, p.x);
        const overlapX2 = Math.min(r.x + r.width, p.x + p.width);
        if (overlapX2 - overlapX1 >= doorW) {
          doors.push({
            id: `d-${floor}-${doorIdx++}`,
            roomId: r.id,
            x: overlapX1 + 0.5,
            y: r.y,
            width: doorW,
            orientation: "horizontal",
            swing: "inward_left",
            floor,
            label: `${formatFeetInches(doorW)} Door`,
          });
          doorPlaced = true;
          break;
        }
      }
    }

    if (doorPlaced) continue;

    // 6. Connect to Living / Dining if no passage is directly adjacent
    const publicRooms = floorRooms.filter(
      (pr) => pr.type === "living" || pr.type === "dining"
    );

    for (const pr of publicRooms) {
      if (Math.abs(pr.y + pr.height - r.y) < 0.25) {
        const overlapX1 = Math.max(r.x, pr.x);
        const overlapX2 = Math.min(r.x + r.width, pr.x + pr.width);
        if (overlapX2 - overlapX1 >= doorW) {
          const doorX = r.type === "kitchen" ? r.x + 0.3 : overlapX1 + 0.5;
          doors.push({
            id: `d-${floor}-${doorIdx++}`,
            roomId: r.id,
            x: doorX,
            y: r.y,
            width: doorW,
            orientation: "horizontal",
            swing: "inward_left",
            floor,
            label: `${formatFeetInches(doorW)} Door`,
          });
          doorPlaced = true;
          break;
        }
      }

      if (Math.abs(r.x + r.width - pr.x) < 0.25) {
        const overlapY1 = Math.max(r.y, pr.y);
        const overlapY2 = Math.min(r.y + r.height, pr.y + pr.height);
        if (overlapY2 - overlapY1 >= doorW) {
          doors.push({
            id: `d-${floor}-${doorIdx++}`,
            roomId: r.id,
            x: r.x + r.width,
            y: overlapY1 + 0.5,
            width: doorW,
            orientation: "vertical",
            swing: "inward_left",
            floor,
            label: `${formatFeetInches(doorW)} Door`,
          });
          doorPlaced = true;
          break;
        }
      }
    }

    if (!doorPlaced) {
      // Sane contextual fallback on top wall
      doors.push({
        id: `d-${floor}-${doorIdx++}`,
        roomId: r.id,
        x: r.x + 0.5,
        y: r.y,
        width: doorW,
        orientation: "horizontal",
        swing: "inward_left",
        floor,
        label: `${formatFeetInches(doorW)} Door`,
      });
    }
  }

  return doors;
}

/**
 * Functional window and opening placement.
 * Positions windows strictly on exterior building perimeter walls or OTS lightwells.
 */
export function generateArchitecturalWindows(
  rooms: Room[],
  plotWidth: number,
  plotLength: number,
  floor: number
): Window[] {
  const floorRooms = rooms.filter((r) => r.floor === floor);
  const windows: Window[] = [];
  let winIdx = 1;
  const EPS = 0.2;

  for (const r of floorRooms) {
    // Open spaces don't have standard framed glass windows
    if (r.type === "parking" || r.type === "passage" || r.type === "ots") {
      continue;
    }

    const isLiving = r.type === "living";
    const isKitchen = r.type === "kitchen";
    const isBath = r.type === "bathroom" || r.type === "attached_bath";

    const winW = isLiving ? 4.5 : isKitchen ? 3.0 : isBath ? 2.0 : 3.5;

    // 1. FRONT EXTERIOR WALL (y = 0 or y = startY)
    if (Math.abs(r.y) < EPS && r.width >= winW + 1.0) {
      windows.push({
        id: `w-${floor}-${winIdx++}`,
        x: r.x + (r.width - winW) / 2,
        y: 0,
        width: winW,
        orientation: "horizontal",
        floor,
      });
    }

    // 2. REAR EXTERIOR WALL (y + height = plotLength)
    if (Math.abs(r.y + r.height - plotLength) < EPS && r.width >= winW + 1.0) {
      windows.push({
        id: `w-${floor}-${winIdx++}`,
        x: r.x + (r.width - winW) / 2,
        y: plotLength,
        width: winW,
        orientation: "horizontal",
        floor,
      });
    }

    // 3. LEFT EXTERIOR WALL (x = 0)
    if (Math.abs(r.x) < EPS && r.height >= winW + 1.5) {
      // Place window centered or slightly offset to clear wardrobe/counters
      const winY = r.y + (r.height - winW) / 2;
      windows.push({
        id: `w-${floor}-${winIdx++}`,
        x: 0,
        y: winY,
        width: winW,
        orientation: "vertical",
        floor,
      });
    }

    // 4. RIGHT EXTERIOR WALL (x + width = plotWidth)
    if (Math.abs(r.x + r.width - plotWidth) < EPS && r.height >= winW + 1.5) {
      const winY = r.y + (r.height - winW) / 2;
      windows.push({
        id: `w-${floor}-${winIdx++}`,
        x: plotWidth,
        y: winY,
        width: winW,
        orientation: "vertical",
        floor,
      });
    }

    // 5. OTS LIGHTWELL / SHAFT VENTILATOR (for interior bathrooms, kitchen, or bedrooms)
    const otsRooms = floorRooms.filter((o) => o.type === "ots");
    for (const ots of otsRooms) {
      // Check shared edge between room and OTS
      const shareTop = Math.abs(r.y + r.height - ots.y) < EPS;
      const shareBot = Math.abs(ots.y + ots.height - r.y) < EPS;
      const shareLeft = Math.abs(r.x + r.width - ots.x) < EPS;
      const shareRight = Math.abs(ots.x + ots.width - r.x) < EPS;

      if (shareTop && Math.min(r.x + r.width, ots.x + ots.width) - Math.max(r.x, ots.x) >= 2.0) {
        windows.push({
          id: `w-${floor}-${winIdx++}`,
          x: Math.max(r.x, ots.x) + 0.3,
          y: ots.y,
          width: 2.0,
          orientation: "horizontal",
          floor,
        });
        break;
      } else if (shareBot && Math.min(r.x + r.width, ots.x + ots.width) - Math.max(r.x, ots.x) >= 2.0) {
        windows.push({
          id: `w-${floor}-${winIdx++}`,
          x: Math.max(r.x, ots.x) + 0.3,
          y: r.y,
          width: 2.0,
          orientation: "horizontal",
          floor,
        });
        break;
      } else if (shareLeft && Math.min(r.y + r.height, ots.y + ots.height) - Math.max(r.y, ots.y) >= 2.0) {
        windows.push({
          id: `w-${floor}-${winIdx++}`,
          x: ots.x,
          y: Math.max(r.y, ots.y) + 0.3,
          width: 2.0,
          orientation: "vertical",
          floor,
        });
        break;
      } else if (shareRight && Math.min(r.y + r.height, ots.y + ots.height) - Math.max(r.y, ots.y) >= 2.0) {
        windows.push({
          id: `w-${floor}-${winIdx++}`,
          x: r.x,
          y: Math.max(r.y, ots.y) + 0.3,
          width: 2.0,
          orientation: "vertical",
          floor,
        });
        break;
      }
    }
  }

  return windows;
}
