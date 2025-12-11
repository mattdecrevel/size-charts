import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface HealthStatus {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: {
      status: "healthy" | "unhealthy";
      latency?: number;
      error?: string;
    };
  };
}

// Track server start time for uptime calculation
const startTime = Date.now();

export async function GET() {
  const timestamp = new Date().toISOString();
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  // Database health check
  let dbStatus: HealthStatus["checks"]["database"] = {
    status: "unhealthy",
  };

  try {
    const dbStart = Date.now();
    // Simple query to check database connectivity
    await db.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;

    dbStatus = {
      status: "healthy",
      latency: dbLatency,
    };
  } catch (error) {
    dbStatus = {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }

  // Determine overall status
  const overallStatus: HealthStatus["status"] =
    dbStatus.status === "healthy" ? "healthy" : "unhealthy";

  const response: HealthStatus = {
    status: overallStatus,
    timestamp,
    version: process.env.npm_package_version || "0.4.0",
    uptime,
    checks: {
      database: dbStatus,
    },
  };

  // Return 200 for healthy, 503 for unhealthy
  const httpStatus = overallStatus === "healthy" ? 200 : 503;

  return NextResponse.json(response, { status: httpStatus });
}
