import type { Metadata } from "next";
import FloorPlanGenerator from "./FloorPlanGenerator";
import FaqSection, { FaqItem } from "@/components/FaqSection";
import AdSlot from "@/components/AdSlot";

export const metadata: Metadata = {
  title: "AI Floor Plan Generator – Create House Plans Free",
  description:
    "Create a free AI-assisted house floor plan from your plot dimensions and requirements. Generate and edit dimension-aware residential floor plans online.",
  alternates: { canonical: "/floor-plan" },
};

const floorPlanFaq: FaqItem[] = [
  {
    question: "Can I create a floor plan for free?",
    answer:
      "Yes. TallyMyProject's AI Floor Plan Generator is 100% free to use with no account, sign-up, or credit card required. You can generate multiple variations, edit rooms, and download high-resolution PNG plans immediately.",
  },
  {
    question: "Can I enter my own exact plot dimensions?",
    answer:
      "Yes. You can either type your plot size in natural language (e.g., '23 x 50 ft plot') or use the specification form to enter exact width and length in feet. The engine automatically constrains all rooms within your exact plot boundary.",
  },
  {
    question: "How does the AI generate dimension-aware floor plans?",
    answer:
      "Unlike general image generators that output flat, uneditable pictures with made-up walls, TallyMyProject parses your requirements into structured geometric data and uses a deterministic layout engine to place rooms, walls, doors, and windows accurately to scale.",
  },
  {
    question: "Can I edit the generated floor plan?",
    answer:
      "Yes. You can click any room to adjust its width, length, or position, drag rooms across the canvas, switch between 3 layout styles (Spacious, Practical, Compact), or use natural language commands like 'Make master bedroom bigger'.",
  },
  {
    question: "Is Vastu Shastra applied automatically?",
    answer:
      "No. Vastu preferences are strictly optional and disabled by default. If you opt in, the engine will arrange rooms according to traditional Vastu orientations (e.g., Master Bedroom in South-West, Kitchen in South-East) where feasible, while prioritizing geometric validity and practical circulation.",
  },
  {
    question: "Is this floor plan construction-ready?",
    answer:
      "No. This tool generates conceptual architectural plans for early-stage planning, visualization, and material estimating. Always consult a licensed architect or structural engineer and verify local municipal bylaws before beginning actual construction.",
  },
];

export default function FloorPlanPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Hero Header */}
      <header className="text-center">
        <span className="inline-block rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
          New Feature • Vector CAD Engine
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Create Your Floor Plan with AI
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
          Describe your home requirements and get a dimension-aware, editable floor plan in seconds.
        </p>
      </header>

      {/* Main Floor Plan Generator Tool */}
      <div className="mt-10">
        <FloorPlanGenerator />
      </div>

      <div className="mt-12">
        <AdSlot variant="mid-article" />
      </div>

      {/* Educational Content & Architecture Guide */}
      <section className="mt-16 space-y-12 border-t border-slate-200 pt-12">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Structured Dimensions, Not AI Images
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Most AI floor plan tools use image generation models that produce stylized pictures with impossible wall thicknesses, missing doors, or hallucinated stairs. TallyMyProject takes a completely different approach: your natural language requirements are parsed into structured architectural models, and a deterministic layout engine calculates exact coordinates, real masonry wall thicknesses, door swings, and window cutouts.
          </p>
        </div>

        {/* Popular Indian Plot Dimensions Guide */}
        <div>
          <h3 className="text-xl font-semibold text-slate-900">
            Common Indian Residential Plot Dimensions
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Residential row houses and independent plots across India follow standardized municipal frontage and depth ratios:
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="font-bold text-slate-900">20 × 50 &amp; 23 × 50 ft</div>
              <div className="text-xs text-slate-500">1,000 – 1,150 sq ft</div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Ideal for a 2BHK single story or 3BHK duplex. Front bike/compact car parking with rear master bedroom.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="font-bold text-slate-900">25 × 50 &amp; 30 × 50 ft</div>
              <div className="text-xs text-slate-500">1,250 – 1,500 sq ft</div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Standard suburban plot for comfortable 3BHK homes with dedicated car porch, separate dining, and puja room.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="font-bold text-slate-900">30 × 60 &amp; 40 × 60 ft</div>
              <div className="text-xs text-slate-500">1,800 – 2,400 sq ft</div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Spacious independent villa or duplex for 3BHK to 5BHK layouts with two-car parking, family lounge, and balconies.
              </p>
            </div>
          </div>
        </div>

        {/* Vastu Shastra Information Box */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-lg font-semibold text-slate-900">
            Vastu Shastra Principles (Opt-In)
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            When Vastu is enabled, the layout engine applies primary directional principles:
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-2">
            <li>• <strong>Kitchen:</strong> South-East (Agni corner) or North-West.</li>
            <li>• <strong>Master Bedroom:</strong> South-West (Nairuthi corner) for stability.</li>
            <li>• <strong>Entrance &amp; Living:</strong> North, East, or North-East for natural morning light.</li>
            <li>• <strong>Staircase:</strong> South or West periphery to avoid obstructing light in the North-East.</li>
          </ul>
          <p className="mt-3 text-xs italic text-slate-500">
            Note: The system arranges rooms based on these guidelines but does not certify formal municipal or astrological compliance.
          </p>
        </div>

        {/* FAQ Section */}
        <div>
          <FaqSection items={floorPlanFaq} />
        </div>

        <div className="mt-8">
          <AdSlot variant="footer" />
        </div>

        {/* Mandatory Architectural & Legal Disclaimer */}
        <div className="rounded-xl border border-slate-200 bg-slate-100 p-5 text-center text-xs text-slate-500">
          <p className="font-semibold text-slate-700">Disclaimer</p>
          <p className="mt-1">
            This floor plan is generated as a conceptual planning aid for homeowners and DIY builders to visualize space allocation and estimate material quantities. It does not replace professional architectural, structural, electrical, or plumbing drawings. Always verify dimensions, load-bearing requirements, and local building codes with a certified architect or structural engineer before construction.
          </p>
        </div>
      </section>
    </div>
  );
}
