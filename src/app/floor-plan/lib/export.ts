import { FloorPlan } from "./types";

export const DISCLAIMER_TEXT =
  "Conceptual floor plan for planning purposes only. Verify dimensions, building codes, structural requirements, and local regulations with a qualified architect/engineer before construction.";

/**
 * Renders the SVG floor plan to a high-resolution Canvas and triggers a PNG download.
 */
export async function downloadFloorPlanPNG(
  svgElement: SVGSVGElement,
  plan: FloorPlan,
  activeFloor: number
): Promise<void> {
  const floorName = activeFloor === 0 ? "Ground Floor" : "First Floor";
  const scale = 2; // 2x resolution for crisp high-DPI rendering

  // Get raw SVG XML
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svgElement);

  // Ensure xmlns is present
  if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svgString = svgString.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = (e) => reject(e);
    img.src = url;
  });

  const bannerHeight = 160;
  const canvasWidth = Math.max(1200, img.naturalWidth * scale);
  const canvasHeight = img.naturalHeight * scale + bannerHeight;

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw Header / Title Block
  ctx.fillStyle = "#047857"; // Emerald 700
  ctx.fillRect(0, 0, canvasWidth, 70);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 24px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("TALLY MY PROJECT — ARCHITECTURAL FLOOR PLAN", 30, 44);

  // Meta row
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 70, canvasWidth, 40);
  ctx.fillStyle = "#334155";
  const metaText = `Plot: ${plan.plot.width}' × ${plan.plot.length}' ft | ${plan.facing.toUpperCase()} Facing | Enclosed Built-Up: ${plan.totalBuiltUpArea} sq ft${plan.areas ? ` (${plan.areas.groundCoveragePct}% coverage)` : ""}${plan.isVastuOriented ? " | Vastu-oriented" : ""}`;
  ctx.fillText(metaText, 30, 95);

  // Draw the SVG floor plan image centered
  const svgDrawY = 120;
  const svgDrawWidth = img.naturalWidth * scale;
  const svgDrawHeight = img.naturalHeight * scale;
  const svgDrawX = (canvasWidth - svgDrawWidth) / 2;
  ctx.drawImage(img, svgDrawX, svgDrawY, svgDrawWidth, svgDrawHeight);

  // Draw Footer Disclaimer
  const footerY = canvasHeight - 45;
  ctx.fillStyle = "#f1f5f9";
  ctx.fillRect(0, canvasHeight - 50, canvasWidth, 50);

  ctx.fillStyle = "#64748b";
  ctx.font = "italic 11px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(DISCLAIMER_TEXT, 30, footerY + 18);

  ctx.fillStyle = "#047857";
  ctx.font = "bold 12px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("tallymyproject.com", canvasWidth - 160, footerY + 18);

  URL.revokeObjectURL(url);

  // Trigger download
  const link = document.createElement("a");
  link.download = `tallymyproject-floor-plan-${plan.plot.width}x${plan.plot.length}-${floorName.toLowerCase().replace(" ", "-")}.png`;
  link.href = canvas.toDataURL("image/png");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Triggers standard browser print dialog with print-optimized styles.
 */
export function printFloorPlanPDF(): void {
  window.print();
}
