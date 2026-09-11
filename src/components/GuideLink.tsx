import Link from "next/link";

/**
 * Small cross-link from a calculator page to its matching cost guide,
 * shown after the material guidance / variant links.
 */
export default function GuideLink({
  guideSlug,
  guideTitle,
}: {
  guideSlug: string;
  guideTitle: string;
}) {
  return (
    <p className="mt-6 text-sm text-slate-600">
      Curious what the whole project typically costs, not just the
      materials?{" "}
      <Link
        href={`/guides/${guideSlug}`}
        className="font-medium text-emerald-700 hover:underline"
      >
        {guideTitle} &rarr;
      </Link>
    </p>
  );
}
