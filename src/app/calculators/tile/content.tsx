import { FaqItem } from "@/components/FaqSection";

export function TileFormula() {
  return (
    <>
      <p>
        The calculator first finds your <strong>room area</strong>{" "}
        (Length × Width, in square feet), then finds the{" "}
        <strong>area of a single tile</strong> by converting its length
        and width from inches to square feet:{" "}
        <code>(tile length in × tile width in) ÷ 144</code> (144 square
        inches in a square foot).
      </p>
      <p className="mt-3">
        A waste allowance is added to the room area to cover cuts,
        breakage, and pattern layout (diagonal or offset patterns need
        more). The number of tiles is the waste-adjusted area divided by
        the area of one tile, rounded up. Boxes needed is that same area
        divided by how many square feet one box covers, rounded up to a
        full box.
      </p>
    </>
  );
}

export function TileExample() {
  return (
    <>
      <p>
        <strong>Project:</strong> a 12 ft × 10 ft bathroom floor, using
        12&Prime; × 12&Prime; tiles sold in boxes covering 15 ft² each,
        with 10% waste.
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Room area = 12 × 10 = 120 ft²</li>
        <li>With 10% waste = 120 × 1.10 = 132 ft²</li>
        <li>One tile = (12 × 12) ÷ 144 = 1 ft²</li>
        <li>Tiles needed = 132 ÷ 1 = 132 tiles</li>
        <li>Boxes needed = 132 ÷ 15 ≈ 9 boxes</li>
      </ul>
    </>
  );
}

export function TileMaterialGuidance() {
  return (
    <>
      <p>
        Straight-lay patterns typically need only <strong>7–10%</strong>{" "}
        waste; diagonal layouts, herringbone, or rooms with lots of
        corners and cutouts (like bathrooms with fixtures) should use{" "}
        <strong>15%</strong> or more. Large-format tiles (anything over
        15&Prime;) also tend to need more waste allowance since offcuts
        are harder to reuse.
      </p>
      <p className="mt-3">
        Always buy tile from the <strong>same dye lot</strong> when
        possible — color can shift slightly between production runs.
        It&rsquo;s also worth keeping a full spare box after the job for
        future repairs, since matching tile years later is often
        impossible.
      </p>
    </>
  );
}

export const tileBaseFaq: FaqItem[] = [
  {
    question: "How many tiles do I need for a 12x12 room?",
    answer:
      "For a 12 ft × 10 ft room (120 ft²) using standard 12x12-inch tiles with a 10% waste allowance, you'd need about 132 tiles — roughly 9 boxes if each box covers 15 square feet.",
  },
  {
    question: "How much extra tile should I buy for waste?",
    answer:
      "A 10% waste allowance covers most straight-lay installations. Increase this to 15% or more for diagonal patterns, herringbone layouts, or rooms with many cuts around fixtures and corners.",
  },
  {
    question: "Should I buy tile by the box or by the piece?",
    answer:
      "Tile is almost always sold by the box, and most retailers require full-box purchases. This calculator rounds up to the nearest full box so you know exactly how many to order.",
  },
];
