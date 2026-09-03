import Link from "next/link";
import { CalculatorVariant } from "@/lib/calculator-variants";

export default function VariantLinks({
  baseSlug,
  baseName,
  variants,
}: {
  baseSlug: string;
  baseName: string;
  variants: CalculatorVariant[];
}) {
  if (variants.length === 0) return null;

  return (
    <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-900">
        More {baseName.replace(" Calculator", "")} calculators
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
        {variants.map((v) => (
          <li key={v.slug}>
            <Link
              href={`/calculators/${baseSlug}/${v.slug}`}
              className="text-emerald-700 hover:underline"
            >
              {v.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
