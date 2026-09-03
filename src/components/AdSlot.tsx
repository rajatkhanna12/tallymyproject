/**
 * Ad slot.
 *
 * TODO before launch: replace the commented-out block below with your real
 * AdSense <ins class="adsbygoogle"> unit once the site is approved.
 * Suggested placements are already wired into CalculatorShell:
 *   - "in-content"  -> directly under the calculator result
 *   - "mid-article" -> between formula/example and FAQ
 *   - "footer"      -> above related calculators
 *
 * Until a real ad unit is wired in, this renders nothing to real visitors
 * (no empty/placeholder box in production) but still shows a dashed
 * placeholder in local development so layout work isn't flying blind.
 */
export default function AdSlot({
  variant = "in-content",
}: {
  variant?: "in-content" | "mid-article" | "footer";
}) {
  if (process.env.NODE_ENV !== "development") {
    // No real AdSense unit wired in yet — render nothing for real visitors.
    return null;
  }

  const heights: Record<string, string> = {
    "in-content": "min-h-[100px]",
    "mid-article": "min-h-[250px]",
    footer: "min-h-[100px]",
  };

  return (
    <div
      className={`flex ${heights[variant]} w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs uppercase tracking-wide text-slate-500`}
      aria-hidden="true"
    >
      Ad placeholder ({variant}) — dev only, hidden in production
    </div>
  );
}
