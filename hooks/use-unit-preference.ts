"use client";

import { useState, useEffect } from "react";
import type { UnitPreference } from "@/types";

export function useUnitPreference() {
  const [unit, setUnit] = useState<UnitPreference>("inches");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("unit-preference");
    if (saved === "cm" || saved === "inches") {
      setUnit(saved);
    }
    setIsLoaded(true);
  }, []);

  const updateUnit = (newUnit: UnitPreference) => {
    setUnit(newUnit);
    localStorage.setItem("unit-preference", newUnit);
  };

  return { unit, setUnit: updateUnit, isLoaded };
}
