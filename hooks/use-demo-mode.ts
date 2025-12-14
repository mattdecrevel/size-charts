"use client";

import { useState, useEffect } from "react";

export function useDemoMode() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkDemoMode() {
      try {
        const response = await fetch("/api/admin/demo-reset");
        const data = await response.json();
        setIsDemoMode(data.demo_mode === true);
      } catch {
        setIsDemoMode(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkDemoMode();
  }, []);

  return { isDemoMode, isLoading };
}
