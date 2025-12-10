"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SimpleSelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const EMPTY_VALUE = "__empty__";

export function SimpleSelect({
  options,
  value,
  onChange,
  onValueChange,
  placeholder = "Select...",
  className,
  disabled,
}: SimpleSelectProps) {
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

  // Process options to handle empty values
  const processedOptions = options.map((option) => ({
    ...option,
    value: option.value === "" ? EMPTY_VALUE : option.value,
  }));

  return (
    <Select value={internalValue} onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger className={cn("w-full", className)}>
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
  );
}
