"use client";

import { useState, useEffect } from "react";
import { Info, ExternalLink, Clock } from "lucide-react";
import Link from "next/link";

interface DemoBannerProps {
  className?: string;
}

function formatTimeUntil(isoString: string): string {
  const target = new Date(isoString);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) return "soon";

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function DemoBanner({ className }: DemoBannerProps) {
  const [nextReset, setNextReset] = useState<string | null>(null);
  const [timeUntil, setTimeUntil] = useState<string>("");

  useEffect(() => {
    async function fetchDemoStatus() {
      try {
        const response = await fetch("/api/admin/demo-reset");
        const data = await response.json();
        if (data.next_reset) {
          setNextReset(data.next_reset);
          setTimeUntil(formatTimeUntil(data.next_reset));
        }
      } catch {
        // Ignore errors
      }
    }

    fetchDemoStatus();

    // Update countdown every minute
    const interval = setInterval(() => {
      if (nextReset) {
        setTimeUntil(formatTimeUntil(nextReset));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [nextReset]);

  return (
    <div
      className={`bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900 px-4 py-2 ${className}`}
    >
      <div className="flex items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <Info className="h-4 w-4 flex-shrink-0" />
          <span>
            <strong>Demo Mode</strong> - Data resets every 6 hours.
            {timeUntil && (
              <span className="ml-1 inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Next reset in {timeUntil}
              </span>
            )}
          </span>
        </div>
        <Link
          href="https://github.com/anthropics/size-charts"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-amber-700 dark:text-amber-300 hover:underline whitespace-nowrap"
        >
          Fork on GitHub
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
