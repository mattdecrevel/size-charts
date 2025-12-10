"use client";

import { cn } from "@/lib/utils";
import type { UnitPreference } from "@/types";

interface UnitSwitcherProps {
  value: UnitPreference;
  onChange: (unit: UnitPreference) => void;
}

export function UnitSwitcher({ value, onChange }: UnitSwitcherProps) {
  return (
    <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-700 dark:bg-zinc-800">
      <button
        onClick={() => onChange("inches")}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          value === "inches"
            ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        )}
      >
        Inches
      </button>
      <button
        onClick={() => onChange("cm")}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          value === "cm"
            ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        )}
      >
        CM
      </button>
    </div>
  );
}
