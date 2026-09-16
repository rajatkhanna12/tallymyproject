/**
 * Lightweight GA4 analytics helper.
 * Safely calls global window.gtag only when available in the browser.
 * Safe for SSR and environments where Google Analytics is not initialized.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}

/**
 * Tracks when a user first interacts with a calculator control.
 * Fired at most once per calculator mount/session.
 */
export function trackCalculatorUsed(calculatorName: string): void {
  trackEvent("calculator_used", {
    calculator_name: calculatorName,
  });
}

/**
 * Tracks successful user-triggered floor plan generation.
 */
export function trackFloorPlanGenerated(
  generationSource: "generate" | "regenerate"
): void {
  trackEvent("floor_plan_generated", {
    generation_source: generationSource,
  });
}
