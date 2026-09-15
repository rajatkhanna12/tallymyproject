"use client";

import Link from "next/link";
import { FloorPlan } from "../lib/types";

interface ProjectEstimateBridgeProps {
  plan: FloorPlan;
}

export default function ProjectEstimateBridge({ plan }: ProjectEstimateBridgeProps) {
  // Compute material takeoff estimates from structured floor plan geometry
  const footprintArea = plan.plot.width * plan.plot.length;

  // Flooring Area (excluding parking and balconies)
  const habitableRooms = plan.rooms.filter(
    (r) => r.type !== "parking" && r.type !== "balcony" && !r.type.includes("bath")
  );
  const flooringArea = Math.round(
    habitableRooms.reduce((sum, r) => sum + r.width * r.height, 0)
  );

  // Bathroom & Kitchen Tiling Area
  const wetRooms = plan.rooms.filter(
    (r) => r.type.includes("bath") || r.type === "kitchen"
  );
  const tilingFloorArea = Math.round(
    wetRooms.reduce((sum, r) => sum + r.width * r.height, 0)
  );
  // Estimate wall tile (7 ft high in baths)
  const bathroomCount = plan.rooms.filter((r) => r.type.includes("bath")).length;
  const estWallTileArea = tilingFloorArea + bathroomCount * 120;

  // Concrete Volume (approx. 5" slab for footprint + footings)
  const estConcreteCuYards = Math.round(((footprintArea * (5 / 12)) / 27) * 1.1 * 10) / 10;

  // Roofing Squares (footprint + 10% waste / 100)
  const estRoofSquares = Math.round((footprintArea * 1.15) / 100);

  return (
    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 p-6 shadow-sm sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
            Next Step
          </span>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            Continue to Project Cost Estimate
          </h3>
          <p className="mt-1 max-w-xl text-sm text-slate-600">
            Tally your exact construction materials, bag counts, tiles, and square footage directly from this floor plan.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Flooring Card */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">
              Flooring Material
            </div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {flooringArea} <span className="text-sm font-normal">sq ft</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-600">
              Living, dining, bedrooms &amp; passages.
            </p>
          </div>
          <Link
            href="/calculators/flooring"
            className="mt-4 inline-flex items-center text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Calculate Flooring Boxes &rarr;
          </Link>
        </div>

        {/* Tile Card */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">
              Tile &amp; Waterproofing
            </div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              ~{estWallTileArea} <span className="text-sm font-normal">sq ft</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-600">
              Bathrooms, kitchen &amp; utility walls/floors.
            </p>
          </div>
          <Link
            href="/calculators/tile"
            className="mt-4 inline-flex items-center text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Calculate Tiles &amp; Boxes &rarr;
          </Link>
        </div>

        {/* Concrete Card */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">
              Foundation &amp; Slab
            </div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              ~{estConcreteCuYards} <span className="text-sm font-normal">yd³</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-600">
              Plinth slab and footing volume estimate.
            </p>
          </div>
          <Link
            href="/calculators/concrete"
            className="mt-4 inline-flex items-center text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Calculate Concrete &amp; Bags &rarr;
          </Link>
        </div>

        {/* Roofing Card */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">
              Roofing / Terrace
            </div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              ~{estRoofSquares} <span className="text-sm font-normal">squares</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-600">
              Terrace slab or pitched roof surface area.
            </p>
          </div>
          <Link
            href="/calculators/roofing"
            className="mt-4 inline-flex items-center text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Calculate Roofing Materials &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
