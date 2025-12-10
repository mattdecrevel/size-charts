const CM_PER_INCH = 2.54;

export function inchesToCm(inches: number): number {
  return Math.round(inches * CM_PER_INCH * 10) / 10;
}

export function cmToInches(cm: number): number {
  return Math.round((cm / CM_PER_INCH) * 10) / 10;
}

export function formatMeasurement(
  valueInches: number | null,
  unit: "inches" | "cm"
): string {
  if (valueInches === null || valueInches === undefined) return "-";

  if (unit === "cm") {
    return `${inchesToCm(valueInches)}`;
  }
  return `${valueInches}`;
}

export function formatMeasurementWithUnit(
  valueInches: number | null,
  unit: "inches" | "cm"
): string {
  if (valueInches === null || valueInches === undefined) return "-";

  if (unit === "cm") {
    return `${inchesToCm(valueInches)} cm`;
  }
  return `${valueInches}"`;
}

export function formatRange(
  minInches: number | null,
  maxInches: number | null,
  unit: "inches" | "cm"
): string {
  if (minInches === null || maxInches === null) return "-";

  if (unit === "cm") {
    return `${inchesToCm(minInches)} - ${inchesToCm(maxInches)}`;
  }
  return `${minInches} - ${maxInches}`;
}

export function formatRangeWithUnit(
  minInches: number | null,
  maxInches: number | null,
  unit: "inches" | "cm"
): string {
  if (minInches === null || maxInches === null) return "-";

  if (unit === "cm") {
    return `${inchesToCm(minInches)} - ${inchesToCm(maxInches)} cm`;
  }
  return `${minInches}" - ${maxInches}"`;
}

export function parseInchesInput(value: string): number | null {
  const parsed = parseFloat(value);
  if (isNaN(parsed)) return null;
  return Math.round(parsed * 100) / 100;
}

export function parseCmInput(value: string): number | null {
  const parsed = parseFloat(value);
  if (isNaN(parsed)) return null;
  return cmToInches(parsed);
}
