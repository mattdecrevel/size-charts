"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Label } from "./label";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectWithLabelProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
}

const EMPTY_VALUE = "__empty__";

export function SelectWithLabel({
  label,
  options,
  value,
  onChange,
  onValueChange,
  placeholder = "Select...",
  className,
  disabled,
  error,
}: SelectWithLabelProps) {
  const id = React.useId();

  // Convert empty string to special value for internal use
  const internalValue = value === "" ? EMPTY_VALUE : value;

  const handleValueChange = (newValue: string) => {
    // Convert special value back to empty string
    const actualValue = newValue === EMPTY_VALUE ? "" : newValue;
    if (onValueChange) {
      onValueChange(actualValue);
    }
    if (onChange) {
      onChange({ target: { value: actualValue } });
    }
  };

  // Filter out empty value options and add them with special value
  const processedOptions = options.map((option) => ({
    ...option,
    value: option.value === "" ? EMPTY_VALUE : option.value,
  }));

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <Select value={internalValue} onValueChange={handleValueChange} disabled={disabled}>
        <SelectTrigger id={id} className={cn("w-full", error && "border-destructive", className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {processedOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
