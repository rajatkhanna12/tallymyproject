export type Unit = "ft";

export type CompassDirection = "north" | "south" | "east" | "west";

export type RoomType =
  | "living"
  | "dining"
  | "kitchen"
  | "master_bedroom"
  | "bedroom"
  | "bathroom"
  | "attached_bath"
  | "parking"
  | "staircase"
  | "balcony"
  | "utility"
  | "passage"
  | "pooja"
  | "verandah"
  | "ots";

export type ParkingType = "bike" | "car" | "both" | "none";

export type LayoutStyleVariant = "spacious" | "practical" | "compact";

export interface RoomRequirement {
  type: RoomType;
  quantity: number;
  minWidth?: number;
  minLength?: number;
  preferredWidth?: number;
  preferredLength?: number;
}

export interface HouseRequirements {
  plot: {
    width: number;  // in feet
    length: number; // in feet
    unit: "ft";
  };
  floors: number; // 1 or 2
  facing?: CompassDirection;
  rooms: RoomRequirement[];
  parking?: {
    type: ParkingType;
    quantity?: number;
  };
  kitchen?: {
    openToDining?: boolean;
  };
  staircase?: boolean;
  balcony?: boolean;
  preferences?: {
    modern?: boolean;
    spacious?: boolean;
    /**
     * Vastu preference is strictly opt-in and NEVER enabled by default.
     * When true, layout applies Vastu-preferred orientations where feasible.
     */
    vastu?: boolean;
  };
}

export interface StaircaseDetails {
  type: "dog_leg" | "straight";
  flightWidth: number; // in feet (e.g. 3.0')
  landingWidth: number; // in feet
  landingDepth: number; // in feet (e.g. 3.0'–3.5')
  treadsPerFlight: number;
  totalRisers: number;
  treadDepth: number; // in feet (typically 0.83' / 10 inches)
  riserHeight: number; // in inches (typically 7" to 7.5")
  direction: "UP" | "DN";
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  x: number;      // feet from plot left
  y: number;      // feet from plot front (road)
  width: number;  // feet
  height: number; // feet (length)
  floor: number;  // 0 = Ground Floor, 1 = First Floor
  color: string;
  isVastuAligned?: boolean;
  staircaseDetails?: StaircaseDetails;
}

export interface Wall {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number; // in feet (0.75' = 9" external, 0.38' = 4.5" internal)
  isExternal: boolean;
  floor: number;
}

export interface Door {
  id: string;
  roomId?: string; // ID of the room into which this door swings
  x: number;
  y: number;
  width: number;
  orientation: "horizontal" | "vertical";
  swing: "inward_left" | "inward_right" | "outward_left" | "outward_right";
  floor: number;
  label?: string;
}

export interface Window {
  id: string;
  x: number;
  y: number;
  width: number;
  orientation: "horizontal" | "vertical";
  floor: number;
}

export type FurnitureType =
  | "double_bed"
  | "single_bed"
  | "sofa_3seater"
  | "sofa_sectional"
  | "armchair"
  | "coffee_table"
  | "tv_unit"
  | "dining_table"
  | "crockery_unit"
  | "kitchen_counter"
  | "gas_stove"
  | "kitchen_sink"
  | "refrigerator"
  | "wc_commode"
  | "wash_basin"
  | "shower_area"
  | "wardrobe"
  | "nightstand"
  | "study_desk"
  | "washing_machine"
  | "planter"
  | "carpet_rug"
  | "pooja_mandir"
  | "car_stencil"
  | "motorcycle_stencil";

export interface Column {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  floor: number;
}

export interface FurnitureItem {
  id: string;
  type: FurnitureType;
  roomId: string;
  x: number;      // feet from plot left
  y: number;      // feet from plot top
  width: number;  // feet
  height: number; // feet
  rotation?: number; // 0, 90, 180, 270
  label?: string;
  floor: number;
}

export interface DimensionLabel {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  value: string;
  floor: number;
  orientation: "horizontal" | "vertical";
}

export interface LayoutScoreBreakdown {
  requirementsComplianceScore: number; // 0 or 1000 (disqualifies candidate if 0)
  geometricValidityScore: number;
  circulationScore: number;
  proportionScore: number;
  furnitureClearanceScore: number;
  adjacencyScore: number;
  lightVentilationScore: number;
  constructionEfficiencyScore: number;
  vastuScore: number;
  totalScore: number;
}

export interface FloorPlanAreas {
  plotArea: number;
  enclosedBuiltUpArea: number; // Enclosed habitable and service rooms
  parkingArea: number;         // Vehicle parking & ramp
  porchArea: number;           // Verandah, porch, balcony
  openToSkyArea: number;       // Lightwells, ducts, shafts (OTS)
  groundCoveragePct: number;   // Ratio of enclosed building to plot area
  setbackArea?: number;
}

export interface FloorPlan {
  id: string;
  name: string;
  styleVariant: LayoutStyleVariant;
  /** True only if user explicitly requested Vastu and orientations were applied */
  isVastuOriented: boolean;
  plot: {
    width: number;
    length: number;
    unit: "ft";
    setbacks: {
      front: number;
      rear: number;
      left: number;
      right: number;
    };
  };
  facing: CompassDirection;
  totalBuiltUpArea: number; // sq ft across all floors
  groundFloorArea: number;  // sq ft
  firstFloorArea: number;   // sq ft
  areas?: FloorPlanAreas;   // Detailed architectural area breakdown
  scoreBreakdown?: LayoutScoreBreakdown;
  floorsCount: number;
  rooms: Room[];
  walls: Wall[];
  doors: Door[];
  windows: Window[];
  columns?: Column[];
  furniture?: FurnitureItem[];
  dimensions: DimensionLabel[];
  metadata: {
    generatedAt: string;
    roomsCount: number;
    plotArea: number;
    usableArea: number;
    efficiencyPct: number;
    notes: string[];
  };
}
