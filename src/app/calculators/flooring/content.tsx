import { FaqItem } from "@/components/FaqSection";

export function FlooringFormula() {
  return (
    <p>
      Room area is <strong>Length × Width</strong> in square feet. A waste
      allowance is added on top to cover trim cuts, damaged planks, and
      pattern matching — typically 7&ndash;10% depending on material and
      layout. The waste-adjusted area is divided by how many square feet
      one box covers, rounded up to the next full box.
    </p>
  );
}

export function FlooringExample() {
  return (
    <>
      <p>
        <strong>Project:</strong> a 15 ft × 12 ft living room in hardwood
        flooring, boxes covering 22 ft² each, 10% waste.
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Room area = 15 × 12 = 180 ft²</li>
        <li>With 10% waste = 180 × 1.10 = 198 ft²</li>
        <li>Boxes needed = 198 ÷ 22 = 9 boxes</li>
      </ul>
    </>
  );
}

export function FlooringMaterialGuidance() {
  return (
    <>
      <p>
        <strong>Vinyl plank</strong> flooring typically needs the least
        waste (5&ndash;7%) since planks are uniform and easy to work with.{" "}
        <strong>Laminate</strong> is similar at around 10%.{" "}
        <strong>Solid hardwood</strong>, especially installed diagonally
        or in a herringbone pattern, often needs 10&ndash;15% to account
        for grain matching and trickier cuts.
      </p>
      <p className="mt-3">
        Buy all boxes from the <strong>same production lot</strong> when
        possible, and let hardwood and laminate acclimate in the room for
        48&ndash;72 hours before installing to reduce
        expansion/contraction issues later.
      </p>
    </>
  );
}

export const flooringBaseFaq: FaqItem[] = [
  {
    question: "How much flooring do I need for a 15x12 room?",
    answer:
      "A 15 ft × 12 ft room is 180 square feet. With a standard 10% waste allowance, you'd need about 198 square feet of flooring — roughly 9 boxes if each box covers 22 square feet.",
  },
  {
    question: "How much extra flooring should I buy?",
    answer:
      "5-7% extra is typical for vinyl plank, and 10% is standard for laminate and hardwood. Diagonal or herringbone hardwood layouts often need 15% to account for more complex cuts.",
  },
  {
    question: "Should hardwood flooring acclimate before installing?",
    answer:
      "Yes — solid hardwood and many engineered products should sit in the installation room for 48-72 hours before installing, so the wood can adjust to the room's humidity and temperature and reduce gapping or buckling later.",
  },
];
