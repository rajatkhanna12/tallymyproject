import Link from "next/link";
import { CostGuide } from "@/lib/guides-data";

export default function RelatedGuides({ guides }: { guides: CostGuide[] }) {
  if (guides.length === 0) return null;

  return (
    <section aria-labelledby="related-guides-heading">
      <h2 id="related-guides-heading" className="text-xl font-semibold text-slate-900">
        More cost guides
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow-sm"
          >
            <div className="font-medium text-slate-900">{guide.shortTitle}</div>
            <p className="mt-1 text-sm text-slate-600">{guide.intro}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
