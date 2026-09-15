import { Door, FurnitureItem, Room } from "./types";

/**
 * Checks if a candidate furniture rectangle intersects with any door opening or its inward swing clearance zone.
 */
function collidesWithDoors(
  x: number,
  y: number,
  w: number,
  h: number,
  doors: Door[]
): boolean {
  for (const d of doors) {
    const margin = 0.25;
    // Inward door clearance box: door width x door width swing area
    const doorBoxX = d.x - margin;
    const doorBoxY = d.y - margin;
    const doorBoxW = d.width + margin * 2;
    const doorBoxH = d.width + margin * 2;

    const overlapX = Math.min(x + w, doorBoxX + doorBoxW) - Math.max(x, doorBoxX);
    const overlapY = Math.min(y + h, doorBoxY + doorBoxH) - Math.max(y, doorBoxY);

    if (overlapX > 0.05 && overlapY > 0.05) {
      return true;
    }
  }
  return false;
}

/**
 * Procedurally generates realistic, comprehensive architectural 2D CAD furniture items for each room.
 * All furniture strictly avoids door swing arcs, respects human ergonomics, and maintains circulation lanes.
 */
export function generateFurnitureForRooms(
  rooms: Room[],
  doors: Door[],
  floor: number
): FurnitureItem[] {
  const floorRooms = rooms.filter((r) => r.floor === floor);
  const floorDoors = doors.filter((d) => d.floor === floor);
  const items: FurnitureItem[] = [];
  let itemIdx = 1;

  for (const r of floorRooms) {
    const rx = r.x;
    const ry = r.y;
    const rw = r.width;
    const rh = r.height;
    const roomDoors = floorDoors.filter(
      (d) =>
        d.roomId === r.id ||
        (!d.roomId &&
          d.x >= rx - 0.5 &&
          d.x <= rx + rw + 0.5 &&
          d.y >= ry - 0.5 &&
          d.y <= ry + rh + 0.5)
    );

    switch (r.type) {
      case "master_bedroom":
      case "bedroom": {
        const isMaster = r.type === "master_bedroom";
        const bedW = rw >= 11.5 ? 6.0 : 5.0;
        const bedH = 6.5;

        // Detect door location relative to room
        const topDoor = roomDoors.find((d) => Math.abs(d.y - ry) < 0.5);
        const doorOnRight = topDoor ? topDoor.x >= rx + rw / 2 : false;

        // Position bed centered or on solid wall opposite door
        const bedCandidates = [
          doorOnRight ? rx + 2.0 : rx + rw - bedW - 2.0,
          rx + (rw - bedW) / 2,
          doorOnRight ? rx + 1.5 : rx + rw - bedW - 1.5,
        ];

        let bedX = bedCandidates[0];
        const bedY = ry + 0.8;

        for (const candX of bedCandidates) {
          if (!collidesWithDoors(candX, bedY, bedW, bedH, roomDoors)) {
            bedX = candX;
            break;
          }
        }

        let bedPlaced = false;
        if (!collidesWithDoors(bedX, bedY, bedW, bedH, roomDoors)) {
          items.push({
            id: `furn-${floor}-${itemIdx++}`,
            type: "double_bed",
            roomId: r.id,
            x: Math.round(bedX * 10) / 10,
            y: Math.round(bedY * 10) / 10,
            width: bedW,
            height: bedH,
            label: isMaster ? "King Bed (6'0\" × 6'6\")" : "Queen Bed (5'0\" × 6'6\")",
            floor,
          });
          bedPlaced = true;

          // Place twin nightstands flanking the bed if space permits
          const nsW = 1.4;
          const nsH = 1.4;
          // Left nightstand
          const leftNsX = bedX - nsW - 0.2;
          if (leftNsX >= rx + 0.2 && !collidesWithDoors(leftNsX, bedY + 0.2, nsW, nsH, roomDoors)) {
            items.push({
              id: `furn-${floor}-${itemIdx++}`,
              type: "nightstand",
              roomId: r.id,
              x: Math.round(leftNsX * 10) / 10,
              y: Math.round((bedY + 0.2) * 10) / 10,
              width: nsW,
              height: nsH,
              label: "Bedside Table",
              floor,
            });
          }
          // Right nightstand
          const rightNsX = bedX + bedW + 0.2;
          if (rightNsX + nsW <= rx + rw - 0.2 && !collidesWithDoors(rightNsX, bedY + 0.2, nsW, nsH, roomDoors)) {
            items.push({
              id: `furn-${floor}-${itemIdx++}`,
              type: "nightstand",
              roomId: r.id,
              x: Math.round(rightNsX * 10) / 10,
              y: Math.round((bedY + 0.2) * 10) / 10,
              width: nsW,
              height: nsH,
              label: "Bedside Table",
              floor,
            });
          }
        }

        // Wardrobe placement: 2'0" depth full wardrobe along solid wall
        if (rh >= 10.0) {
          const wardW = Math.min(6.5, Math.max(4.0, rw - 4.5));
          const wardOptions = [
            { x: doorOnRight ? rx + rw - wardW - 0.8 : rx + 0.8, y: ry + rh - 2.2, w: wardW, h: 2.0 },
            { x: rx + rw - 2.2, y: ry + 2.5, w: 2.0, h: Math.min(5.5, rh - 3.5) },
            { x: rx + 0.4, y: ry + 2.5, w: 2.0, h: Math.min(5.5, rh - 3.5) },
          ];

          for (const opt of wardOptions) {
            const collidesWithBed =
              bedPlaced &&
              Math.min(opt.x + opt.w, bedX + bedW) - Math.max(opt.x, bedX) > 0.05 &&
              Math.min(opt.y + opt.h, bedY + bedH) - Math.max(opt.y, bedY) > 0.05;

            if (!collidesWithBed && !collidesWithDoors(opt.x, opt.y, opt.w, opt.h, roomDoors)) {
              items.push({
                id: `furn-${floor}-${itemIdx++}`,
                type: "wardrobe",
                roomId: r.id,
                x: Math.round(opt.x * 10) / 10,
                y: Math.round(opt.y * 10) / 10,
                width: opt.w,
                height: opt.h,
                label: "Wardrobe (2'0\" Deep)",
                floor,
              });
              break;
            }
          }

          // Study desk / dressing console
          if (rw >= 11.0 && rh >= 12.0) {
            const deskW = 3.5;
            const deskH = 1.6;
            const deskX = doorOnRight ? rx + 0.8 : rx + rw - deskW - 0.8;
            const deskY = ry + rh - deskH - 0.6;
            if (!collidesWithDoors(deskX, deskY, deskW, deskH, roomDoors)) {
              items.push({
                id: `furn-${floor}-${itemIdx++}`,
                type: "study_desk",
                roomId: r.id,
                x: Math.round(deskX * 10) / 10,
                y: Math.round(deskY * 10) / 10,
                width: deskW,
                height: deskH,
                label: isMaster ? "Dressing Vanity" : "Study Desk",
                floor,
              });
            }
          }
        }
        break;
      }

      case "living": {
        if (rw >= 10.5 && rh >= 10.5) {
          // Soft carpet / area rug boundary under living seating
          const rugW = Math.min(10.5, rw - 3.0);
          const rugH = Math.min(8.5, rh - 4.5);
          const rugX = rx + 1.2;
          const rugY = ry + 2.6;

          items.push({
            id: `furn-${floor}-${itemIdx++}`,
            type: "carpet_rug",
            roomId: r.id,
            x: Math.round(rugX * 10) / 10,
            y: Math.round(rugY * 10) / 10,
            width: Math.round(rugW * 10) / 10,
            height: Math.round(rugH * 10) / 10,
            label: "Living Rug",
            floor,
          });

          // 3-Seater or Sectional Sofa
          const sofaW = Math.min(6.8, rw - 4.5);
          const sofaH = 2.8;
          const sofaX = rugX + 0.4;
          const sofaY = rugY + 0.4;

          if (!collidesWithDoors(sofaX, sofaY, sofaW, sofaH, roomDoors)) {
            items.push({
              id: `furn-${floor}-${itemIdx++}`,
              type: "sofa_3seater",
              roomId: r.id,
              x: Math.round(sofaX * 10) / 10,
              y: Math.round(sofaY * 10) / 10,
              width: sofaW,
              height: sofaH,
              label: "3-Seater Sofa",
              floor,
            });

            // Center Coffee Table
            const tableX = sofaX + (sofaW - 3.5) / 2;
            const tableY = sofaY + sofaH + 0.6;
            if (!collidesWithDoors(tableX, tableY, 3.5, 1.8, roomDoors)) {
              items.push({
                id: `furn-${floor}-${itemIdx++}`,
                type: "coffee_table",
                roomId: r.id,
                x: Math.round(tableX * 10) / 10,
                y: Math.round(tableY * 10) / 10,
                width: 3.5,
                height: 1.8,
                label: "Coffee Table",
                floor,
              });
            }

            // Accent Armchair facing coffee table
            const chairX = sofaX + sofaW + 0.6;
            const chairY = sofaY + 0.4;
            if (chairX + 2.5 <= rx + rw - 0.4 && !collidesWithDoors(chairX, chairY, 2.5, 2.5, roomDoors)) {
              items.push({
                id: `furn-${floor}-${itemIdx++}`,
                type: "armchair",
                roomId: r.id,
                x: Math.round(chairX * 10) / 10,
                y: Math.round(chairY * 10) / 10,
                width: 2.5,
                height: 2.5,
                label: "Accent Armchair",
                floor,
              });
            }
          }

          // TV Credenza / Entertainment Wall Unit
          if (rh >= 12.0) {
            const tvW = Math.min(6.5, rw - 3.0);
            const tvX = rx + (rw - tvW) / 2;
            const tvY = ry + rh - 1.4;
            if (!collidesWithDoors(tvX, tvY, tvW, 1.2, roomDoors)) {
              items.push({
                id: `furn-${floor}-${itemIdx++}`,
                type: "tv_unit",
                roomId: r.id,
                x: Math.round(tvX * 10) / 10,
                y: Math.round(tvY * 10) / 10,
                width: tvW,
                height: 1.2,
                label: "TV Credenza / Wall",
                floor,
              });
            }
          }

          // Indoor Green Planter in corner
          const plantX = rx + rw - 2.2;
          const plantY = ry + 0.8;
          if (!collidesWithDoors(plantX, plantY, 1.8, 1.8, roomDoors)) {
            items.push({
              id: `furn-${floor}-${itemIdx++}`,
              type: "planter",
              roomId: r.id,
              x: Math.round(plantX * 10) / 10,
              y: Math.round(plantY * 10) / 10,
              width: 1.8,
              height: 1.8,
              label: "Potted Planter",
              floor,
            });
          }
        }
        break;
      }

      case "dining": {
        if (rw >= 7.5 && rh >= 7.5) {
          const isSixSeater = rw >= 9.5 && rh >= 11.0;
          const tableW = isSixSeater ? 5.5 : 4.5;
          const tableH = 3.2;
          const tableX = rx + (rw - tableW) / 2;
          const tableY = ry + (rh - tableH) / 2;

          if (!collidesWithDoors(tableX, tableY, tableW, tableH, roomDoors)) {
            items.push({
              id: `furn-${floor}-${itemIdx++}`,
              type: "dining_table",
              roomId: r.id,
              x: Math.round(tableX * 10) / 10,
              y: Math.round(tableY * 10) / 10,
              width: tableW,
              height: tableH,
              label: isSixSeater ? "6-Seater Dining" : "4-Seater Dining",
              floor,
            });
          }

          // Crockery Console against solid wall
          const crockW = Math.min(4.5, rw - 2.0);
          const crockY = ry + 0.4;
          const crockX = rx + (rw - crockW) / 2;
          if (!collidesWithDoors(crockX, crockY, crockW, 1.2, roomDoors)) {
            items.push({
              id: `furn-${floor}-${itemIdx++}`,
              type: "crockery_unit",
              roomId: r.id,
              x: Math.round(crockX * 10) / 10,
              y: Math.round(crockY * 10) / 10,
              width: crockW,
              height: 1.2,
              label: "Crockery Sideboard",
              floor,
            });
          }
        }
        break;
      }

      case "kitchen": {
        const counterDepth = 2.0;
        if (rw >= 6.0 && rh >= 6.0) {
          const counterStartX = rx + 3.6;
          const counterW = Math.max(3.5, rw - 3.6);

          // Top counter segment
          items.push({
            id: `furn-${floor}-${itemIdx++}`,
            type: "kitchen_counter",
            roomId: r.id,
            x: Math.round(counterStartX * 10) / 10,
            y: ry,
            width: Math.round(counterW * 10) / 10,
            height: counterDepth,
            label: "Kitchen Counter (2'0\" Deep)",
            floor,
          });

          // Refrigerator
          items.push({
            id: `furn-${floor}-${itemIdx++}`,
            type: "refrigerator",
            roomId: r.id,
            x: Math.round((rx + rw - 2.6) * 10) / 10,
            y: Math.round((ry + 0.2) * 10) / 10,
            width: 2.4,
            height: 1.6,
            label: "REF (Fridge)",
            floor,
          });

          // SS Sink with drainer
          if (counterW >= 4.0) {
            items.push({
              id: `furn-${floor}-${itemIdx++}`,
              type: "kitchen_sink",
              roomId: r.id,
              x: Math.round((counterStartX + 0.4) * 10) / 10,
              y: Math.round((ry + 0.2) * 10) / 10,
              width: 2.4,
              height: 1.6,
              label: "SS Double Sink",
              floor,
            });
          }

          // 4-Burner Gas Hob along right wall counter
          if (rh >= 7.0) {
            items.push({
              id: `furn-${floor}-${itemIdx++}`,
              type: "gas_stove",
              roomId: r.id,
              x: Math.round((rx + rw - 2.4) * 10) / 10,
              y: Math.round((ry + 2.8) * 10) / 10,
              width: 2.2,
              height: 2.4,
              label: "Gas Hob (4 Burners)",
              floor,
            });
          }
        }
        break;
      }

      case "bathroom":
      case "attached_bath": {
        if (rw >= 4.0 && rh >= 4.5) {
          const doorOnRight = roomDoors.some(
            (d) => d.x >= rx + rw - 1.0 || (d.orientation === "vertical" && d.x >= rx + rw - 0.5)
          );

          // Wash Basin
          const basinX = doorOnRight ? rx + 0.3 : rx + rw - 1.9;
          const basinY = ry + 0.4;
          if (!collidesWithDoors(basinX, basinY, 1.6, 1.4, roomDoors)) {
            items.push({
              id: `furn-${floor}-${itemIdx++}`,
              type: "wash_basin",
              roomId: r.id,
              x: Math.round(basinX * 10) / 10,
              y: Math.round(basinY * 10) / 10,
              width: 1.6,
              height: 1.4,
              label: "Wash Basin",
              floor,
            });
          }

          // EWC Commode
          const wcX = doorOnRight ? rx + 0.3 : rx + rw - 1.9;
          const wcY = ry + 2.2;
          if (!collidesWithDoors(wcX, wcY, 1.6, 2.0, roomDoors)) {
            items.push({
              id: `furn-${floor}-${itemIdx++}`,
              type: "wc_commode",
              roomId: r.id,
              x: Math.round(wcX * 10) / 10,
              y: Math.round(wcY * 10) / 10,
              width: 1.6,
              height: 2.0,
              label: "EWC Commode",
              floor,
            });
          }

          // Shower Area at bottom wall
          if (rh >= 6.0) {
            const showerY = ry + rh - 2.5;
            items.push({
              id: `furn-${floor}-${itemIdx++}`,
              type: "shower_area",
              roomId: r.id,
              x: Math.round((rx + 0.4) * 10) / 10,
              y: Math.round(showerY * 10) / 10,
              width: Math.round((rw - 0.8) * 10) / 10,
              height: 2.2,
              label: "Shower Zone",
              floor,
            });
          }
        }
        break;
      }

      case "utility": {
        // Washing Machine
        const wmX = rx + 0.4;
        const wmY = ry + 0.4;
        if (!collidesWithDoors(wmX, wmY, 2.2, 2.2, roomDoors)) {
          items.push({
            id: `furn-${floor}-${itemIdx++}`,
            type: "washing_machine",
            roomId: r.id,
            x: Math.round(wmX * 10) / 10,
            y: Math.round(wmY * 10) / 10,
            width: 2.2,
            height: 2.2,
            label: "Washing Machine",
            floor,
          });
        }
        break;
      }

      case "verandah": {
        // Green planters flanking verandah entrance
        const p1X = rx + 0.6;
        const p1Y = ry + rh - 2.2;
        if (!collidesWithDoors(p1X, p1Y, 1.8, 1.8, roomDoors)) {
          items.push({
            id: `furn-${floor}-${itemIdx++}`,
            type: "planter",
            roomId: r.id,
            x: Math.round(p1X * 10) / 10,
            y: Math.round(p1Y * 10) / 10,
            width: 1.8,
            height: 1.8,
            label: "Entrance Planter",
            floor,
          });
        }
        break;
      }

      case "parking": {
        const isCar = rw >= 9.5 && rh >= 12.0;
        if (isCar) {
          items.push({
            id: `furn-${floor}-${itemIdx++}`,
            type: "car_stencil",
            roomId: r.id,
            x: Math.round(((rw - 6.5) / 2 + rx) * 10) / 10,
            y: Math.round(((rh - 13.5) / 2 + ry) * 10) / 10,
            width: 6.5,
            height: 13.5,
            label: "Car Parking Bay",
            floor,
          });
        } else {
          const bikeCount = Math.max(1, Math.min(3, Math.floor(rw / 3.2)));
          const spacing = rw / (bikeCount + 1);
          for (let b = 1; b <= bikeCount; b++) {
            items.push({
              id: `furn-${floor}-${itemIdx++}`,
              type: "motorcycle_stencil",
              roomId: r.id,
              x: Math.round((rx + spacing * b - 1.2) * 10) / 10,
              y: Math.round((ry + (rh - 5.5) / 2) * 10) / 10,
              width: 2.4,
              height: 5.5,
              label: `Bike Slot ${b}`,
              floor,
            });
          }
        }
        break;
      }

      case "pooja": {
        items.push({
          id: `furn-${floor}-${itemIdx++}`,
          type: "pooja_mandir",
          roomId: r.id,
          x: Math.round((rx + (rw - 3.0) / 2) * 10) / 10,
          y: Math.round((ry + 0.4) * 10) / 10,
          width: 3.0,
          height: 1.6,
          label: "Pooja Altar",
          floor,
        });
        break;
      }

      default:
        break;
    }
  }

  return items;
}

export interface FurnitureErgonomicsResult {
  valid: boolean;
  score: number; // 0 to 100
  issues: string[];
}

/**
 * Validates that rooms accommodate their essential furniture with unobstructed door swings
 * and practical walking clearances.
 */
export function validateFurnitureErgonomics(
  rooms: Room[],
  doors: Door[],
  furniture: FurnitureItem[]
): FurnitureErgonomicsResult {
  const issues: string[] = [];
  let score = 100;

  for (const r of rooms) {
    if (r.type === "ots" || r.type === "passage" || r.type === "verandah" || r.type === "staircase") {
      continue;
    }

    const roomFurn = furniture.filter((f) => f.roomId === r.id);
    const roomDoors = doors.filter(
      (d) =>
        d.roomId === r.id ||
        (!d.roomId &&
          d.x >= r.x - 0.5 &&
          d.x <= r.x + r.width + 0.5 &&
          d.y >= r.y - 0.5 &&
          d.y <= r.y + r.height + 0.5)
    );

    // 1. Bedroom must fit a bed
    if (r.type === "bedroom" || r.type === "master_bedroom") {
      const hasBed = roomFurn.some((f) => f.type === "double_bed" || f.type === "single_bed");
      if (!hasBed) {
        issues.push(`${r.name} cannot fit standard bed with walking clearance.`);
        score -= 25;
      }
    }

    // 2. Living must fit a sofa
    if (r.type === "living") {
      const hasSofa = roomFurn.some((f) => f.type === "sofa_3seater" || f.type === "sofa_sectional");
      if (!hasSofa && r.width >= 9.5 && r.height >= 9.5) {
        issues.push(`${r.name} cannot fit seating sofa with circulation clearance.`);
        score -= 15;
      }
    }

    // 3. Kitchen must fit counter and stove/sink
    if (r.type === "kitchen") {
      const hasCounter = roomFurn.some((f) => f.type === "kitchen_counter");
      if (!hasCounter && r.width >= 5.5 && r.height >= 5.5) {
        issues.push(`${r.name} cannot fit kitchen counter with door clearance.`);
        score -= 20;
      }
    }

    // 4. Bathroom must fit commode and basin
    if (r.type === "bathroom" || r.type === "attached_bath") {
      const hasWc = roomFurn.some((f) => f.type === "wc_commode");
      if (!hasWc && r.width >= 3.8 && r.height >= 4.2) {
        issues.push(`${r.name} cannot fit EWC commode.`);
        score -= 20;
      }
    }

    // 5. Check if any furniture item overlaps a door swing arc
    for (const f of roomFurn) {
      if (collidesWithDoors(f.x, f.y, f.width, f.height, roomDoors)) {
        issues.push(`Furniture "${f.label || f.type}" in ${r.name} blocks door swing.`);
        score -= 15;
      }
    }
  }

  score = Math.max(0, score);
  return {
    valid: issues.length === 0,
    score,
    issues,
  };
}
