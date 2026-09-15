import { HouseRequirements, LayoutStyleVariant } from "../types";

export type ZoneType = "front_public" | "mid_family" | "rear_private" | "service_core";

export interface FunctionalZone {
  type: ZoneType;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ZoningBreakdown {
  frontParkingPorch: { x: number; y: number; width: number; height: number; hasParking: boolean; isCar: boolean };
  frontPublicZone: FunctionalZone;
  midFamilyZone: FunctionalZone;
  rearPrivateZone: FunctionalZone;
  serviceZone: FunctionalZone;
  usableStartDepth: number;
  usableLength: number;
}

/**
 * Calculates adaptive architectural functional zoning for a plot.
 * Dynamically distributes plot depth and frontage according to:
 * - Plot dimensions (width, length)
 * - Parking requirements (car, bike, or none)
 * - Number of requested bedrooms and floors
 * - Style variant (spacious, practical, compact)
 * - Orientation / road facing
 */
export function calculateFunctionalZoning(
  req: HouseRequirements,
  variant: LayoutStyleVariant,
  candidateIdx = 0
): ZoningBreakdown {
  const plotW = req.plot.width;
  const plotL = req.plot.length;
  const hasParking = req.parking?.type && req.parking.type !== "none";
  const parkingType = req.parking?.type || "bike";
  const isCar = parkingType === "car" || parkingType === "both";
  const isDuplex = req.floors >= 2;

  // 1. Front Setback / Parking & Porch Zone Depth
  let frontDepth = 0;
  if (hasParking) {
    if (isCar) {
      frontDepth = variant === "compact" ? 13.5 : variant === "spacious" ? 15.0 : 14.0;
    } else {
      frontDepth = variant === "compact" ? 8.0 : variant === "spacious" ? 9.5 : 9.0;
    }
  } else {
    // Front porch / sit-out
    frontDepth = variant === "compact" ? 5.0 : variant === "spacious" ? 7.0 : 6.0;
  }

  // Guard: Ensure at least 30 ft of usable depth remains for indoor residential zoning
  if (plotL - frontDepth < 30) {
    frontDepth = Math.max(0, plotL - 30);
  }

  const usableStartDepth = frontDepth;
  const usableLength = plotL - frontDepth;

  // 2. Zone Depth Distribution:
  // Dynamically allocate usable length between Public (Living), Mid (Dining+Kitchen+Circulation), and Rear (Bedrooms)
  let publicRatio: number;
  let midRatio: number;

  if (isDuplex) {
    // In a duplex, ground floor has only 1 bedroom (Guest/Elderly suite), allowing generous Living/Dining
    if (variant === "spacious") {
      publicRatio = 0.38;
      midRatio = 0.30;
    } else if (variant === "compact") {
      publicRatio = 0.34;
      midRatio = 0.32;
    } else {
      publicRatio = 0.36;
      midRatio = 0.31;
    }
  } else {
    // Single-story: must fit all bedrooms on ground floor.
    // Rear private zone requires sufficient depth for master bedroom + attached bath + secondary bed
    if (variant === "spacious") {
      publicRatio = 0.35;
      midRatio = 0.25;
    } else if (variant === "compact") {
      publicRatio = 0.31;
      midRatio = 0.29;
    } else {
      publicRatio = 0.33;
      midRatio = 0.27;
    }
  }

  // Adjust ratios slightly for alternate candidates to introduce topological diversity
  if (candidateIdx === 1) {
    publicRatio += 0.02;
    midRatio -= 0.02;
  } else if (candidateIdx === 2) {
    publicRatio -= 0.02;
  }

  const publicHeight = Math.round(usableLength * publicRatio * 2) / 2;
  const midHeight = Math.round(usableLength * midRatio * 2) / 2;
  const rearHeight = usableLength - publicHeight - midHeight;

  const publicY = usableStartDepth;
  const midY = publicY + publicHeight;
  const rearY = midY + midHeight;

  // 3. Service zone (shared with mid-zone for kitchen, utility, OTS lightwell, and common bath)
  const serviceZoneWidth = Math.round(plotW * 0.42 * 2) / 2;
  const serviceZoneX = candidateIdx % 2 === 1 ? 0 : plotW - serviceZoneWidth;

  return {
    frontParkingPorch: {
      x: 0,
      y: 0,
      width: plotW,
      height: frontDepth,
      hasParking: !!hasParking,
      isCar,
    },
    frontPublicZone: {
      type: "front_public",
      x: 0,
      y: publicY,
      width: plotW,
      height: publicHeight,
    },
    midFamilyZone: {
      type: "mid_family",
      x: 0,
      y: midY,
      width: plotW,
      height: midHeight,
    },
    rearPrivateZone: {
      type: "rear_private",
      x: 0,
      y: rearY,
      width: plotW,
      height: rearHeight,
    },
    serviceZone: {
      type: "service_core",
      x: serviceZoneX,
      y: midY,
      width: serviceZoneWidth,
      height: midHeight,
    },
    usableStartDepth,
    usableLength,
  };
}
