import type { Metadata } from "next";
import CalculatorShell from "@/components/CalculatorShell";
import TileCalculatorWidget from "./TileCalculatorWidget";
import { TileFormula, TileExample, TileMaterialGuidance, tileBaseFaq } from "./content";
import { tileVariants } from "./variants";
import VariantLinks from "@/components/VariantLinks";

export const metadata: Metadata = {
  title: "Tile Calculator - How Many Tiles & Boxes Do I Need?",
  description:
    "Free tile calculator for floors, walls, and bathrooms. Enter room size and tile dimensions to get the tiles, boxes, and cost you need — including waste allowance.",
  alternates: { canonical: "/calculators/tile" },
};

export default function TileCalculatorPage() {
  return (
    <CalculatorShell
      slug="tile"
      title="Tile Calculator"
      intro="Work out exactly how many tiles and boxes to buy for a floor or wall — with a waste allowance built in so you don't come up short."
      calculator={<TileCalculatorWidget />}
      formula={<TileFormula />}
      example={<TileExample />}
      materialGuidance={
        <>
          <TileMaterialGuidance />
          <VariantLinks baseSlug="tile" baseName="Tile Calculator" variants={tileVariants} />
        </>
      }
      faqItems={tileBaseFaq}
    />
  );
}
