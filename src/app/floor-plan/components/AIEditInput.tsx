"use client";

import { useState } from "react";
import { executeEditCommand } from "../lib/command-parser";
import { FloorPlan } from "../lib/types";

interface AIEditInputProps {
  plan: FloorPlan;
  onPlanUpdated: (newPlan: FloorPlan) => void;
}

const EXAMPLE_COMMANDS = [
  "Make master bedroom bigger",
  "Make kitchen 10 x 12 ft",
  "Make bathroom smaller",
  "Make the kitchen open to dining",
  "Add a balcony to the first floor",
];

export default function AIEditInput({ plan, onPlanUpdated }: AIEditInputProps) {
  const [command, setCommand] = useState("");
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    const result = executeEditCommand(plan, command);
    if (result.success) {
      onPlanUpdated(result.updatedPlan);
      setFeedback({ message: `✓ ${result.message}`, isError: false });
      setCommand("");
    } else {
      setFeedback({ message: result.message, isError: true });
    }
  };

  const handlePillClick = (cmd: string) => {
    setCommand(cmd);
    const result = executeEditCommand(plan, cmd);
    if (result.success) {
      onPlanUpdated(result.updatedPlan);
      setFeedback({ message: `✓ ${result.message}`, isError: false });
    } else {
      setFeedback({ message: result.message, isError: true });
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
          ✨
        </span>
        <h4 className="text-sm font-semibold text-slate-900">
          Edit Plan with Natural Language
        </h4>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-2xs text-slate-500">
          Deterministic Rule-Based
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder='e.g. "Make master bedroom bigger" or "Make kitchen 10 x 12 ft"'
          className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
        />
        <button
          type="submit"
          disabled={!command.trim()}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
        >
          Apply
        </button>
      </form>

      {/* Suggested Command Pills */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        <span className="text-2xs font-medium uppercase tracking-wider text-slate-400">
          Try:
        </span>
        {EXAMPLE_COMMANDS.map((cmd) => (
          <button
            key={cmd}
            type="button"
            onClick={() => handlePillClick(cmd)}
            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-2xs font-medium text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`mt-3 rounded-lg px-3.5 py-2 text-xs leading-relaxed ${
            feedback.isError
              ? "border border-amber-200 bg-amber-50 text-amber-900"
              : "border border-emerald-200 bg-emerald-50 text-emerald-900 font-medium"
          }`}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
}
