"use client";

import { ReactNode, useRef } from "react";
import { trackCalculatorUsed } from "@/lib/analytics";

interface CalculatorAnalyticsProps {
  slug: string;
  children: ReactNode;
}

export default function CalculatorAnalytics({
  slug,
  children,
}: CalculatorAnalyticsProps) {
  const hasTracked = useRef(false);

  const handleInteraction = (e: React.SyntheticEvent) => {
    if (hasTracked.current) return;

    const target = e.target as HTMLElement | null;
    if (!target) return;

    const isControl = Boolean(
      target.closest(
        "input, select, textarea, button, [role='button'], [role='slider'], [role='tab']"
      )
    );

    if (isControl) {
      hasTracked.current = true;
      trackCalculatorUsed(slug);
    }
  };

  return (
    <div
      onChange={handleInteraction}
      onInput={handleInteraction}
      onClick={handleInteraction}
    >
      {children}
    </div>
  );
}
