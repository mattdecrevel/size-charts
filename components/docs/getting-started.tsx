"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  FolderTree,
  Tag,
  TableProperties,
  Globe,
  Database,
  Ruler,
  KeyRound,
  Code2
} from "lucide-react";

interface StepProps {
  number: number;
  title: string;
  description: string;
  children: React.ReactNode;
  status?: "complete" | "current" | "upcoming";
}

function Step({ number, title, description, children, status = "upcoming" }: StepProps) {
  return (
    <div className="relative pb-8 last:pb-0">
      <div className="absolute left-5 top-10 -ml-px h-full w-0.5 bg-zinc-200 dark:bg-zinc-800 last:hidden" />

      <div className="flex gap-4">
        <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center">
          {status === "complete" ? (
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          ) : status === "current" ? (
            <div className="h-10 w-10 rounded-full border-2 border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <span className="text-sm font-semibold">{number}</span>
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center">
              <span className="text-sm font-semibold text-zinc-400">{number}</span>
            </div>
          )}
        </div>

        <div className="flex-1 pt-1">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, children }: { icon: typeof FolderTree; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-5 w-5 text-zinc-500" />
        <h4 className="font-medium text-zinc-900 dark:text-zinc-50">{title}</h4>
      </div>
      <div className="text-sm text-zinc-600 dark:text-zinc-400">{children}</div>
    </div>
  );
}

interface GettingStartedContentProps {
  showTitle?: boolean;
  showAdminLinks?: boolean;
  className?: string;
}

export function GettingStartedContent({
  showTitle = true,
  showAdminLinks = true,
  className = ""
}: GettingStartedContentProps) {
  const adminPrefix = showAdminLinks ? "/admin" : "";

  return (
    <div className={`max-w-4xl ${className}`}>
      {showTitle && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Getting Started</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Learn how to set up your size charts from scratch. This guide walks you through the complete process.
          </p>
        </div>
      )}

      {/* Overview */}
      <div className="mb-8 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-6">
        <h2 className="mb-4 text-lg font-semibold text-blue-900 dark:text-blue-100">How It All Fits Together</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <InfoCard icon={FolderTree} title="Categories">
            <p>Top-level groupings like <strong>Men&apos;s</strong>, <strong>Women&apos;s</strong>.</p>
          </InfoCard>
          <InfoCard icon={Tag} title="Labels">
            <p>Reusable size identifiers like <strong>SM</strong>, <strong>MD</strong>, <strong>LG</strong>.</p>
          </InfoCard>
          <InfoCard icon={TableProperties} title="Size Charts">
            <p>The actual data tables with measurements.</p>
          </InfoCard>
          <InfoCard icon={Ruler} title="Instructions">
            <p>How-to-measure guidance for each chart.</p>
          </InfoCard>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <span>Categories</span>
          <ArrowRight className="h-4 w-4" />
          <span>Subcategories</span>
          <ArrowRight className="h-4 w-4" />
          <span>Size Charts</span>
          <ArrowRight className="h-4 w-4" />
          <span>API / Embed</span>
        </div>
      </div>

      {/* Steps */}
      <div className="mb-8">
        <h2 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Setup Steps</h2>

        <Step number={1} title="Set Up Categories" description="Categories organize charts into a navigable hierarchy." status="complete">
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
            <p className="text-sm mb-3 text-zinc-600 dark:text-zinc-400">The system comes with pre-configured categories:</p>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="rounded border border-zinc-200 dark:border-zinc-800 p-3">
                <div className="font-medium text-zinc-900 dark:text-zinc-50">Men&apos;s</div>
                <div className="text-xs text-zinc-500 mt-1">Tops, Bottoms, Footwear, Gloves...</div>
              </div>
              <div className="rounded border border-zinc-200 dark:border-zinc-800 p-3">
                <div className="font-medium text-zinc-900 dark:text-zinc-50">Women&apos;s</div>
                <div className="text-xs text-zinc-500 mt-1">Tops, Bottoms, Bras, Leggings...</div>
              </div>
            </div>
            {showAdminLinks && (
              <Link href="/admin/categories" className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                Manage categories <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </Step>

        <Step number={2} title="Configure Labels" description="Labels are standardized size identifiers used across charts." status="complete">
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
            <p className="text-sm mb-3 text-zinc-600 dark:text-zinc-400">Instead of typing sizes manually, select from predefined labels:</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-2 py-1 text-xs rounded bg-zinc-100 dark:bg-zinc-800">Alpha (XS, S, M, L)</span>
              <span className="px-2 py-1 text-xs rounded bg-zinc-100 dark:bg-zinc-800">Numeric (0, 2, 4, 6)</span>
              <span className="px-2 py-1 text-xs rounded bg-zinc-100 dark:bg-zinc-800">Band (30, 32, 34)</span>
              <span className="px-2 py-1 text-xs rounded bg-zinc-100 dark:bg-zinc-800">Cup (A, B, C, D)</span>
            </div>
            {showAdminLinks && (
              <Link href="/admin/labels" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                Manage labels <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </Step>

        <Step number={3} title="Create Size Charts" description="Build charts with columns for sizes and measurements." status="current">
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
            <ol className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex gap-2">
                <span className="font-medium text-zinc-900 dark:text-zinc-50">1.</span>
                Create chart with name and category
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-zinc-900 dark:text-zinc-50">2.</span>
                Configure columns (SIZE_LABEL, MEASUREMENT, TEXT)
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-zinc-900 dark:text-zinc-50">3.</span>
                Add rows and enter data
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-zinc-900 dark:text-zinc-50">4.</span>
                Publish to make available via API
              </li>
            </ol>
            {showAdminLinks && (
              <Link href="/admin/size-charts/new" className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                Create a size chart <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </Step>

        <Step number={4} title="Generate API Key" description="Create keys to authenticate API requests.">
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
            <p className="text-sm mb-3 text-zinc-600 dark:text-zinc-400">
              API keys are required for the v1 API. Keys support scopes and rate limiting.
            </p>
            <pre className="rounded bg-zinc-950 p-3 text-xs text-zinc-100 overflow-x-auto">
{`X-API-Key: sc_xxxxxxxxxxxx
# or
Authorization: Bearer sc_xxxxxxxxxxxx`}
            </pre>
            {showAdminLinks && (
              <Link href="/admin/api-keys" className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                Manage API keys <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </Step>

        <Step number={5} title="Integrate" description="Use the API or embed widget to display charts.">
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-sm mb-2 text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <Globe className="h-4 w-4" /> REST API
                </h4>
                <pre className="rounded bg-zinc-950 p-2 text-xs text-zinc-100 overflow-x-auto">
{`GET /api/v1/size-charts?slug=mens-tops
GET /api/v1/categories`}
                </pre>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2 text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <Code2 className="h-4 w-4" /> Embed Widget
                </h4>
                <pre className="rounded bg-zinc-950 p-2 text-xs text-zinc-100 overflow-x-auto">
{`<div data-chart="mens-tops"></div>
<script src=".../size-charts.js"></script>`}
                </pre>
              </div>
            </div>
            <div className="mt-3 flex gap-4">
              <Link href="/docs/api" className="text-sm text-blue-600 hover:underline">
                API Reference →
              </Link>
              <Link href="/demo" className="text-sm text-blue-600 hover:underline">
                Widget Demo →
              </Link>
            </div>
          </div>
        </Step>
      </div>

      {/* Data Model Reference */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Data Model</h2>
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3">
            <h3 className="font-medium flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
              <Database className="h-4 w-4" />
              Entity Relationships
            </h3>
          </div>
          <div className="p-4">
            <pre className="text-xs text-zinc-600 dark:text-zinc-400">
{`Category (Men's, Women's, Kids)
  └── Subcategory (Tops, Bottoms, etc.)
        └── SizeChart (many-to-many)
              ├── Columns (Size, Chest, Waist...)
              └── Rows → Cells
                    ├── valueInches / valueCm
                    ├── valueMin / valueMax (ranges)
                    └── labelId → SizeLabel`}
            </pre>
          </div>
        </div>
      </div>

      {/* Quick Links - only show for admin context */}
      {showAdminLinks && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Quick Links</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/admin/categories" className="group rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <FolderTree className="h-5 w-5 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100" />
                <span className="font-medium text-zinc-900 dark:text-zinc-50">Categories</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Manage category hierarchy</p>
            </Link>
            <Link href="/admin/labels" className="group rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Tag className="h-5 w-5 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100" />
                <span className="font-medium text-zinc-900 dark:text-zinc-50">Labels</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Size label management</p>
            </Link>
            <Link href="/admin/size-charts" className="group rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <TableProperties className="h-5 w-5 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100" />
                <span className="font-medium text-zinc-900 dark:text-zinc-50">Size Charts</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Create and edit charts</p>
            </Link>
            <Link href="/admin/api-keys" className="group rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <KeyRound className="h-5 w-5 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100" />
                <span className="font-medium text-zinc-900 dark:text-zinc-50">API Keys</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Manage access keys</p>
            </Link>
            <Link href="/docs/api" className="group rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="h-5 w-5 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100" />
                <span className="font-medium text-zinc-900 dark:text-zinc-50">API Docs</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Full API reference</p>
            </Link>
            <Link href="/demo" className="group rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Code2 className="h-5 w-5 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100" />
                <span className="font-medium text-zinc-900 dark:text-zinc-50">Widget Demo</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Embed widget examples</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
