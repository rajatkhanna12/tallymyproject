import { Room } from "../types";
import { getSharedWallLength } from "./adjacency";

export interface CirculationSpine {
  preferredWidth: number; // 3.5 ft (42 in)
  actualWidth: number;    // Adaptively scaled between 2.75 ft and 4.0 ft based on plot width
  totalCirculationArea: number;
  circulationRatioPct: number; // Target 10-14% of ground floor
  isPassable: boolean;
  transitBedrooms: string[]; // Bad patterns where a bedroom is used as a corridor
}

/**
 * Calculates adaptive circulation spine width based on plot frontage.
 * Target is 3'6" (3.5 ft).
 * On narrow plots (<= 22 ft), adaptively scales to 3'0" (or 2'9" for tight service corridors)
 * as a scored compromise rather than failing feasibility.
 */
export function calculateCirculationWidth(plotWidth: number): number {
  if (plotWidth <= 20.0) {
    return 3.0; // 3'0" minimum comfortable corridor for 20 ft narrow plot
  }
  if (plotWidth <= 23.0) {
    return 3.25; // 3'3" for 23 ft plot
  }
  if (plotWidth <= 28.0) {
    return 3.5; // Standard 3'6" (42 in) target
  }
  return 4.0; // 4'0" generous circulation on wide plots (>= 30 ft)
}

/**
 * Evaluates the circulation health of a generated floor plan.
 * Checks for:
 * - Proper hallway width
 * - Efficient circulation area ratio
 * - Detection of invalid transit bedrooms (bedrooms acting as passages)
 */
export function evaluateCirculation(
  rooms: Room[],
  plotWidth: number,
  plotLength: number
): CirculationSpine {
  const floorRooms = rooms.filter((r) => r.floor === 0);
  const plotArea = plotWidth * plotLength;

  const passages = floorRooms.filter((r) => r.type === "passage");
  const bedrooms = floorRooms.filter(
    (r) => r.type === "bedroom" || r.type === "master_bedroom"
  );
  const otherRooms = floorRooms.filter(
    (r) =>
      r.type !== "passage" &&
      r.type !== "bedroom" &&
      r.type !== "master_bedroom" &&
      r.type !== "parking" &&
      r.type !== "verandah"
  );

  const preferredWidth = 3.5;
  const actualWidth = passages.length > 0
    ? Math.min(...passages.map((p) => Math.min(p.width, p.height)))
    : calculateCirculationWidth(plotWidth);

  const totalCirculationArea = passages.reduce(
    (sum, p) => sum + p.width * p.height,
    0
  );

  const circulationRatioPct =
    plotArea > 0
      ? Math.round(((totalCirculationArea / plotArea) * 100) * 10) / 10
      : 0;

  // Check for Transit Bedrooms (bedrooms being the sole connection between two other rooms)
  const transitBedrooms: string[] = [];
  for (const bed of bedrooms) {
    // If a non-attached room (like common bath, kitchen, or another bedroom) is ONLY adjacent to this bedroom,
    // this bedroom is an unacceptable transit corridor.
    const connectedRooms = otherRooms.filter(
      (o) => o.type !== "attached_bath" && getSharedWallLength(bed, o) >= 2.5
    );

    // If an isolated bedroom or service space has only a shared wall with this bedroom and no passage/living
    for (const other of connectedRooms) {
      const otherHasCirculation =
        passages.some((p) => getSharedWallLength(other, p) >= 2.0) ||
        floorRooms.some(
          (r) =>
            (r.type === "living" || r.type === "dining") &&
            getSharedWallLength(other, r) >= 2.0
        );

      if (!otherHasCirculation && other.type !== "utility") {
        transitBedrooms.push(
          `${bed.name} acts as a transit corridor to reach ${other.name}`
        );
      }
    }
  }

  return {
    preferredWidth,
    actualWidth,
    totalCirculationArea,
    circulationRatioPct,
    isPassable: actualWidth >= 2.75 && transitBedrooms.length === 0,
    transitBedrooms,
  };
}
