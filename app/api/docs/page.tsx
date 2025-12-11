"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import { openApiSpec } from "@/lib/openapi";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <style jsx global>{`
        /* Override Swagger UI styles for better appearance */
        .swagger-ui .topbar {
          display: none;
        }
        .swagger-ui .info {
          margin: 20px 0;
        }
        .swagger-ui .scheme-container {
          background: #f8f9fa;
          padding: 15px;
        }
      `}</style>
      <SwaggerUI spec={openApiSpec} />
    </div>
  );
}
