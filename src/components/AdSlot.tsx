/**
 * Placeholder ad slot.
 *
 * TODO before launch: replace this placeholder with your real AdSense
 * <ins class="adsbygoogle"> unit once the site is approved. Keep the
 * wrapping div + label so layout/CLS stays stable when ads swap in.
 * Suggested placements are already wired into CalculatorShell:
 *   - "in-content"  -> directly under the calculator result
 *   - "mid-article" -> between formula/example and FAQ
 *   - "footer"      -> above related calculators
 */
export default function AdSlot({
  variant = "in-content",
}: {
  variant?: "in-content" | "mid-article" | "footer";
}) {
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
      Ad placeholder ({variant})
    </div>
  );
}
