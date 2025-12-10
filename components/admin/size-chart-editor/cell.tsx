"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { formatMeasurement, formatRange } from "@/lib/conversions";
import type { ColumnType, MeasurementUnit } from "@prisma/client";
import type { EditorCell } from "./types";

interface CellProps {
  cell: EditorCell;
  columnType: ColumnType;
  unit: MeasurementUnit;
  isEditing: boolean;
  onStartEdit: () => void;
  onChange: (cell: EditorCell) => void;
  onFinishEdit: () => void;
  onNavigate: (direction: "up" | "down" | "left" | "right") => void;
}

export function Cell({
  cell,
  columnType,
  unit,
  isEditing,
  onStartEdit,
  onChange,
  onFinishEdit,
  onNavigate,
}: CellProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState("");
  const [localMin, setLocalMin] = useState("");
  const [localMax, setLocalMax] = useState("");

  const isMeasurement = columnType === "MEASUREMENT";
  const hasRange = cell.valueMinInches !== null && cell.valueMaxInches !== null;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (isEditing) {
      if (isMeasurement) {
        if (hasRange) {
          setLocalMin(cell.valueMinInches?.toString() || "");
          setLocalMax(cell.valueMaxInches?.toString() || "");
        } else {
          setLocalValue(cell.valueInches?.toString() || "");
        }
      } else {
        setLocalValue(cell.valueText || "");
      }
    }
  }, [isEditing, cell, isMeasurement, hasRange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onFinishEdit();
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveAndFinish();
      onNavigate("down");
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      saveAndFinish();
      onNavigate(e.shiftKey ? "left" : "right");
      return;
    }

    if (e.key === "ArrowUp" && e.ctrlKey) {
      e.preventDefault();
      saveAndFinish();
      onNavigate("up");
      return;
    }

    if (e.key === "ArrowDown" && e.ctrlKey) {
      e.preventDefault();
      saveAndFinish();
      onNavigate("down");
      return;
    }
  };

  const saveAndFinish = () => {
    if (isMeasurement) {
      if (hasRange || (localMin && localMax)) {
        onChange({
          ...cell,
          valueInches: null,
          valueMinInches: localMin ? parseFloat(localMin) : null,
          valueMaxInches: localMax ? parseFloat(localMax) : null,
        });
      } else {
        onChange({
          ...cell,
          valueInches: localValue ? parseFloat(localValue) : null,
          valueMinInches: null,
          valueMaxInches: null,
        });
      }
    } else {
      onChange({
        ...cell,
        valueText: localValue || null,
      });
    }
    onFinishEdit();
  };

  const displayValue = () => {
    if (isMeasurement) {
      if (hasRange) {
        return formatRange(cell.valueMinInches, cell.valueMaxInches, "inches");
      }
      return formatMeasurement(cell.valueInches, "inches");
    }
    return cell.valueText || "-";
  };

  if (!isEditing) {
    return (
      <div
        className={cn(
          "h-full w-full px-3 py-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
          "text-sm text-zinc-700 dark:text-zinc-300"
        )}
        onClick={onStartEdit}
        onDoubleClick={onStartEdit}
      >
        {displayValue()}
      </div>
    );
  }

  if (isMeasurement && (hasRange || (localMin || localMax))) {
    return (
      <div className="flex items-center gap-1 px-1 py-1">
        <input
          ref={inputRef}
          type="number"
          step="0.1"
          value={localMin}
          onChange={(e) => setLocalMin(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={saveAndFinish}
          className="w-16 rounded border border-zinc-300 px-2 py-1 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800"
          placeholder="Min"
        />
        <span className="text-zinc-400">-</span>
        <input
          type="number"
          step="0.1"
          value={localMax}
          onChange={(e) => setLocalMax(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={saveAndFinish}
          className="w-16 rounded border border-zinc-300 px-2 py-1 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800"
          placeholder="Max"
        />
      </div>
    );
  }

  return (
    <input
      ref={inputRef}
      type={isMeasurement ? "number" : "text"}
      step={isMeasurement ? "0.1" : undefined}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={saveAndFinish}
      className="h-full w-full border-0 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-zinc-500"
    />
  );
}
