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
    GET: "bg-[oklch(0.65_0.20_160)]/10 text-[oklch(0.50_0.18_160)] dark:text-[oklch(0.72_0.18_160)]",
    POST: "bg-primary/10 text-primary",
    PUT: "bg-accent/10 text-accent",
    DELETE: "bg-destructive/10 text-destructive",
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
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
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
              <pre className="code-block p-3 text-xs overflow-x-auto">
                <code>{requestBody}</code>
              </pre>
            </div>
          )}

          {response && (
            <div>
              <h4 className="mb-2 text-sm font-semibold">Response</h4>
              <pre className="code-block p-3 text-xs overflow-x-auto">
                <code>{response}</code>
              </pre>
            </div>
          )}

          {example && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">Example</h4>
                <button
                  onClick={() => copyToClipboard(example.request || example.response)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              {example.request && (
                <pre className="code-block p-3 text-xs overflow-x-auto mb-2">
                  <code>{example.request}</code>
                </pre>
              )}
              <pre className="code-block p-3 text-xs overflow-x-auto">
                <code>{example.response}</code>
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
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm mb-3">
            All API requests require authentication via API key. Include the key in request headers:
          </p>
          <div className="code-block">
            <pre className="p-3 text-xs overflow-x-auto">
              <code>{`# Option 1: X-API-Key header
curl -H "X-API-Key: sc_live_xxxxxxxxxxxx" ...

# Option 2: Authorization header
curl -H "Authorization: Bearer sc_live_xxxxxxxxxxxx" ...`}</code>
            </pre>
          </div>
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
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm mb-3">
            API requests are rate limited per API key:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li><strong className="text-foreground">Read operations:</strong> 100 requests per minute</li>
            <li><strong className="text-foreground">Write operations:</strong> 30 requests per minute</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            Rate limit headers are included in all responses:
          </p>
          <div className="code-block mt-2">
            <pre className="p-3 text-xs overflow-x-auto">
              <code>{`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702407600`}</code>
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}

export { Endpoint };
export type { EndpointProps };
