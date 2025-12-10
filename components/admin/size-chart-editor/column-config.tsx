"use client";

import { useState } from "react";
import {
  Button,
  InputWithLabel,
  SelectWithLabel,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { COLUMN_TYPES, MEASUREMENT_UNITS } from "@/lib/constants";
import { Trash2, Settings } from "lucide-react";
import type { EditorColumn } from "./types";
import type { ColumnType, MeasurementUnit } from "@prisma/client";

interface ColumnConfigProps {
  column: EditorColumn;
  onUpdate: (column: EditorColumn) => void;
  onDelete: () => void;
  canDelete: boolean;
}

export function ColumnConfig({ column, onUpdate, onDelete, canDelete }: ColumnConfigProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(column.name);
  const [columnType, setColumnType] = useState<ColumnType>(column.columnType);
  const [unit, setUnit] = useState<MeasurementUnit>(column.unit);

  const handleSave = () => {
    onUpdate({
      ...column,
      name,
      columnType,
      unit: columnType === "MEASUREMENT" ? unit : "NONE",
    });
    setIsOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
        <span className="font-medium text-sm truncate">
          {column.name}
        </span>
        <button
          onClick={() => setIsOpen(true)}
          className="p-1 rounded hover:bg-accent"
          title="Configure column"
        >
          <Settings className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Column</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <InputWithLabel
              label="Column Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Waist, Size, US"
            />

            <SelectWithLabel
              label="Column Type"
              options={COLUMN_TYPES.map((t) => ({
                value: t.value,
                label: `${t.label} - ${t.description}`,
              }))}
              value={columnType}
              onChange={(e) => setColumnType(e.target.value as ColumnType)}
            />

            {columnType === "MEASUREMENT" && (
              <SelectWithLabel
                label="Unit"
                options={MEASUREMENT_UNITS.map((u) => ({
                  value: u.value,
                  label: u.label,
                }))}
                value={unit}
                onChange={(e) => setUnit(e.target.value as MeasurementUnit)}
              />
            )}
          </div>

          <DialogFooter>
            {canDelete && (
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete();
                  setIsOpen(false);
                }}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4" />
                Delete Column
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
