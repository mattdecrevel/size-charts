"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { formatMeasurement, formatRange } from "@/lib/conversions";
import type { ColumnType, SizeLabel } from "@prisma/client";
import type { EditorCell } from "./types";

interface CellProps {
  cell: EditorCell;
  columnType: ColumnType;
  isEditing: boolean;
  onStartEdit: () => void;
  onChange: (cell: EditorCell) => void;
  onFinishEdit: () => void;
  onNavigate: (direction: "up" | "down" | "left" | "right") => void;
  labels?: SizeLabel[];
}

export function Cell({
  cell,
  columnType,
  isEditing,
  onStartEdit,
  onChange,
  onFinishEdit,
  onNavigate,
  labels = [],
}: CellProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const [localValue, setLocalValue] = useState("");
  const [localMin, setLocalMin] = useState("");
  const [localMax, setLocalMax] = useState("");

  const isMeasurement = columnType === "MEASUREMENT";
  const isSizeLabel = columnType === "SIZE_LABEL";
  const hasRange = cell.valueMinInches !== null && cell.valueMaxInches !== null;
  const hasLabels = labels.length > 0 && isSizeLabel;

  useEffect(() => {
    if (isEditing) {
      if (hasLabels && selectRef.current) {
        selectRef.current.focus();
      } else if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  }, [isEditing, hasLabels]);

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

  const handleLabelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const labelId = e.target.value || null;
    const label = labels.find((l) => l.id === labelId);

    onChange({
      ...cell,
      labelId,
      valueText: label?.displayValue || null,
    });
    onFinishEdit();
  };

  const displayValue = () => {
    if (isMeasurement) {
      if (hasRange) {
        return formatRange(cell.valueMinInches, cell.valueMaxInches, "inches");
      }
      return formatMeasurement(cell.valueInches, "inches");
    }
    // For SIZE_LABEL with a linked label, show the display value
    if (cell.labelId) {
      const label = labels.find((l) => l.id === cell.labelId);
      if (label) {
        return label.displayValue;
      }
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

  // Label dropdown for SIZE_LABEL columns when labels are available
  if (hasLabels) {
    return (
      <select
        ref={selectRef}
        value={cell.labelId || ""}
        onChange={handleLabelChange}
        onKeyDown={handleKeyDown}
        onBlur={() => onFinishEdit()}
        className="h-full w-full border-0 bg-transparent px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-zinc-500"
      >
        <option value="">— Select —</option>
        {labels.map((label) => (
          <option key={label.id} value={label.id}>
            {label.displayValue} ({label.key})
          </option>
        ))}
      </select>
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
