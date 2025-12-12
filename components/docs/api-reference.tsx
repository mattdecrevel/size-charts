"use client";

import { useState } from "react";
import { Badge } from "@/components/ui";
import { Copy, Check, ChevronDown, ChevronRight } from "lucide-react";

interface EndpointProps {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  params?: { name: string; type: string; required?: boolean; description: string }[];
  requestBody?: string;
  response?: string;
  example?: { request?: string; response: string };
}

function Endpoint({ method, path, description, params, requestBody, response, example }: EndpointProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const methodColors = {
    GET: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    POST: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    PUT: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    DELETE: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border bg-card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent/50"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <span className={`rounded px-2 py-0.5 text-xs font-semibold ${methodColors[method]}`}>
          {method}
        </span>
        <code className="flex-1 text-sm">{path}</code>
        <span className="text-sm text-muted-foreground hidden sm:inline">{description}</span>
      </button>

      {isOpen && (
        <div className="border-t px-4 py-4 space-y-4">
          <p className="text-sm text-muted-foreground sm:hidden">{description}</p>

          {params && params.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold">Query Parameters</h4>
              <div className="rounded border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-3 py-2 text-left font-medium">Name</th>
                      <th className="px-3 py-2 text-left font-medium">Type</th>
                      <th className="px-3 py-2 text-left font-medium">Required</th>
                      <th className="px-3 py-2 text-left font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {params.map((param) => (
                      <tr key={param.name} className="border-b last:border-0">
                        <td className="px-3 py-2">
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">{param.name}</code>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{param.type}</td>
                        <td className="px-3 py-2">
                          {param.required ? (
                            <Badge variant="default" className="text-xs">Required</Badge>
                          ) : (
                            <span className="text-muted-foreground">Optional</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{param.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {requestBody && (
            <div>
              <h4 className="mb-2 text-sm font-semibold">Request Body</h4>
              <pre className="rounded bg-zinc-950 p-3 text-xs text-zinc-100 overflow-x-auto">
                {requestBody}
              </pre>
            </div>
          )}

          {response && (
            <div>
              <h4 className="mb-2 text-sm font-semibold">Response</h4>
              <pre className="rounded bg-zinc-950 p-3 text-xs text-zinc-100 overflow-x-auto">
                {response}
              </pre>
            </div>
          )}

          {example && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">Example</h4>
                <button
                  onClick={() => copyToClipboard(example.request || example.response)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              {example.request && (
                <pre className="rounded bg-zinc-950 p-3 text-xs text-zinc-100 overflow-x-auto mb-2">
                  {example.request}
                </pre>
              )}
              <pre className="rounded bg-zinc-950 p-3 text-xs text-zinc-100 overflow-x-auto">
                {example.response}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// API endpoint data
const sizeChartsEndpoints: EndpointProps[] = [
  {
    method: "GET",
    path: "/api/v1/size-charts",
    description: "List or get size charts",
    params: [
      { name: "slug", type: "string", description: "Get single chart by slug" },
      { name: "category", type: "string", description: "Filter by category slug" },
      { name: "subcategory", type: "string", description: "Filter by subcategory slug" },
    ],
    example: {
      request: `curl -H "X-API-Key: sc_xxxx" \\
  "https://example.com/api/v1/size-charts?slug=mens-tops"`,
      response: `{
  "id": "abc123",
  "name": "Tops",
  "slug": "mens-tops",
  "isPublished": true,
  "categories": [
    { "category": "mens", "subcategory": "tops" }
  ],
  "columns": [
    { "id": "col1", "name": "Size", "type": "SIZE_LABEL" },
    { "id": "col2", "name": "Chest", "type": "MEASUREMENT" }
  ],
  "rows": [
    {
      "id": "row1",
      "cells": [
        { "columnId": "col1", "type": "text", "value": "SM" },
        { "columnId": "col2", "type": "range",
          "inches": { "min": 34, "max": 37 },
          "cm": { "min": 86.4, "max": 94 }
        }
      ]
    }
  ]
}`
    }
  },
];

const categoriesEndpoints: EndpointProps[] = [
  {
    method: "GET",
    path: "/api/v1/categories",
    description: "Get category tree",
    example: {
      request: `curl -H "X-API-Key: sc_xxxx" "https://example.com/api/v1/categories"`,
      response: `[
  {
    "id": "cat1",
    "name": "Men's",
    "slug": "mens",
    "subcategories": [
      { "id": "sub1", "name": "Tops", "slug": "tops" },
      { "id": "sub2", "name": "Bottoms", "slug": "bottoms" }
    ]
  }
]`
    }
  },
];

const labelsEndpoints: EndpointProps[] = [
  {
    method: "GET",
    path: "/api/v1/labels",
    description: "Get all size labels",
    params: [
      { name: "type", type: "string", description: "Filter by label type (ALPHA_SIZE, NUMERIC_SIZE, etc.)" },
    ],
    example: {
      request: `curl -H "X-API-Key: sc_xxxx" "https://example.com/api/v1/labels"`,
      response: `[
  {
    "key": "SIZE_SM",
    "displayValue": "SM",
    "labelType": "ALPHA_SIZE",
    "sortOrder": 1
  }
]`
    }
  },
];

interface ApiReferenceContentProps {
  showTitle?: boolean;
  className?: string;
}

export function ApiReferenceContent({ showTitle = true, className = "" }: ApiReferenceContentProps) {
  return (
    <div className={className}>
      {showTitle && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold">API Reference</h1>
          <p className="mt-2 text-muted-foreground">
            Complete documentation for the Size Charts v1 API.
          </p>
        </div>
      )}

      {/* Authentication */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Authentication</h2>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm mb-3">
            All API requests require authentication via API key. Include the key in request headers:
          </p>
          <pre className="rounded bg-zinc-950 p-3 text-xs text-zinc-100 overflow-x-auto">
{`# Option 1: X-API-Key header
curl -H "X-API-Key: sc_live_xxxxxxxxxxxx" ...

# Option 2: Authorization header
curl -H "Authorization: Bearer sc_live_xxxxxxxxxxxx" ...`}
          </pre>
          <p className="text-sm text-muted-foreground mt-3">
            Generate API keys in the admin panel under API Keys.
          </p>
        </div>
      </section>

      {/* Base URL */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Base URL</h2>
        <div className="rounded-lg border bg-muted/50 p-4">
          <code className="text-sm">https://your-domain.com/api/v1</code>
        </div>
      </section>

      {/* Size Charts */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Size Charts</h2>
        <div className="space-y-3">
          {sizeChartsEndpoints.map((endpoint, i) => (
            <Endpoint key={i} {...endpoint} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Categories</h2>
        <div className="space-y-3">
          {categoriesEndpoints.map((endpoint, i) => (
            <Endpoint key={i} {...endpoint} />
          ))}
        </div>
      </section>

      {/* Labels */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Labels</h2>
        <div className="space-y-3">
          {labelsEndpoints.map((endpoint, i) => (
            <Endpoint key={i} {...endpoint} />
          ))}
        </div>
      </section>

      {/* Error Handling */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Error Handling</h2>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2 text-left font-medium">Status</th>
                <th className="px-4 py-2 text-left font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-2"><code>200</code></td>
                <td className="px-4 py-2 text-muted-foreground">Success</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2"><code>400</code></td>
                <td className="px-4 py-2 text-muted-foreground">Bad request - invalid parameters</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2"><code>401</code></td>
                <td className="px-4 py-2 text-muted-foreground">Unauthorized - API key required</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2"><code>403</code></td>
                <td className="px-4 py-2 text-muted-foreground">Forbidden - insufficient permissions</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2"><code>404</code></td>
                <td className="px-4 py-2 text-muted-foreground">Not found</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2"><code>429</code></td>
                <td className="px-4 py-2 text-muted-foreground">Rate limit exceeded (100 req/min)</td>
              </tr>
              <tr>
                <td className="px-4 py-2"><code>500</code></td>
                <td className="px-4 py-2 text-muted-foreground">Server error</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Rate Limiting */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Rate Limiting</h2>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm mb-3">
            API requests are rate limited per API key:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li><strong>Read operations:</strong> 100 requests per minute</li>
            <li><strong>Write operations:</strong> 30 requests per minute</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            Rate limit headers are included in all responses:
          </p>
          <pre className="rounded bg-zinc-950 p-3 text-xs text-zinc-100 mt-2 overflow-x-auto">
{`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702407600`}
          </pre>
        </div>
      </section>
    </div>
  );
}

export { Endpoint };
export type { EndpointProps };
