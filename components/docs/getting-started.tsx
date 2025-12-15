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
      <div className="absolute left-5 top-10 -ml-px h-full w-0.5 bg-border last:hidden" />

      <div className="flex gap-4">
        <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center">
          {status === "complete" ? (
            <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-[oklch(0.65_0.20_160)]" />
            </div>
          ) : status === "current" ? (
            <div className="h-10 w-10 rounded-full border-2 border-primary bg-background flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">{number}</span>
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full border-2 border-border bg-background flex items-center justify-center">
              <span className="text-sm font-semibold text-muted-foreground">{number}</span>
            </div>
          )}
        </div>

        <div className="flex-1 pt-1">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, children }: { icon: typeof FolderTree; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <h4 className="font-medium text-foreground">{title}</h4>
      </div>
      <div className="text-sm text-muted-foreground">{children}</div>
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
  return (
    <div className={`max-w-4xl ${className}`}>
      {showTitle && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Getting Started</h1>
          <p className="mt-2 text-muted-foreground">
            Learn how to set up your size charts from scratch. This guide walks you through the complete process.
          </p>
        </div>
      )}

      {/* Overview */}
      <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">How It All Fits Together</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <InfoCard icon={FolderTree} title="Categories">
            <p>Top-level groupings like <strong className="text-foreground">Men&apos;s</strong>, <strong className="text-foreground">Women&apos;s</strong>.</p>
          </InfoCard>
          <InfoCard icon={Tag} title="Labels">
            <p>Reusable size identifiers like <strong className="text-foreground">SM</strong>, <strong className="text-foreground">MD</strong>, <strong className="text-foreground">LG</strong>.</p>
          </InfoCard>
          <InfoCard icon={TableProperties} title="Size Charts">
            <p>The actual data tables with measurements.</p>
          </InfoCard>
          <InfoCard icon={Ruler} title="Instructions">
            <p>How-to-measure guidance for each chart.</p>
          </InfoCard>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
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
        <h2 className="mb-6 text-lg font-semibold text-foreground">Setup Steps</h2>

        <Step number={1} title="Set Up Categories" description="Categories organize charts into a navigable hierarchy." status="complete">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm mb-3 text-muted-foreground">The system comes with pre-configured categories:</p>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="rounded-lg border border-border p-3">
                <div className="font-medium text-foreground">Men&apos;s</div>
                <div className="text-xs text-muted-foreground mt-1">Tops, Bottoms, Footwear, Gloves...</div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="font-medium text-foreground">Women&apos;s</div>
                <div className="text-xs text-muted-foreground mt-1">Tops, Bottoms, Bras, Leggings...</div>
              </div>
            </div>
            {showAdminLinks && (
              <Link href="/admin/categories" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors">
                Manage categories <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </Step>

        <Step number={2} title="Configure Labels" description="Labels are standardized size identifiers used across charts." status="complete">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm mb-3 text-muted-foreground">Instead of typing sizes manually, select from predefined labels:</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-2 py-1 text-xs rounded-lg bg-muted text-muted-foreground">Alpha (XS, S, M, L)</span>
              <span className="px-2 py-1 text-xs rounded-lg bg-muted text-muted-foreground">Numeric (0, 2, 4, 6)</span>
              <span className="px-2 py-1 text-xs rounded-lg bg-muted text-muted-foreground">Band (30, 32, 34)</span>
              <span className="px-2 py-1 text-xs rounded-lg bg-muted text-muted-foreground">Cup (A, B, C, D)</span>
            </div>
            {showAdminLinks && (
              <Link href="/admin/labels" className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors">
                Manage labels <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </Step>

        <Step number={3} title="Create Size Charts" description="Build charts with columns for sizes and measurements." status="current">
          <div className="rounded-xl border border-border bg-card p-4">
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-medium text-foreground">1.</span>
                Create chart with name and category
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">2.</span>
                Configure columns (SIZE_LABEL, MEASUREMENT, TEXT)
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">3.</span>
                Add rows and enter data
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">4.</span>
                Publish to make available via API
              </li>
            </ol>
            {showAdminLinks && (
              <Link href="/admin/size-charts/new" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors">
                Create a size chart <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </Step>

        <Step number={4} title="Generate API Key" description="Create keys to authenticate API requests.">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm mb-3 text-muted-foreground">
              API keys are required for the v1 API. Keys support scopes and rate limiting.
            </p>
            <div className="code-block">
              <pre className="p-3 text-xs overflow-x-auto">
                <code>{`X-API-Key: sc_xxxxxxxxxxxx
# or
Authorization: Bearer sc_xxxxxxxxxxxx`}</code>
              </pre>
            </div>
            {showAdminLinks && (
              <Link href="/admin/api-keys" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors">
                Manage API keys <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </Step>

        <Step number={5} title="Integrate" description="Use the API or embed widget to display charts.">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-sm mb-2 text-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4" /> REST API
                </h4>
                <div className="code-block">
                  <pre className="p-2 text-xs overflow-x-auto">
                    <code>{`GET /api/v1/size-charts?slug=mens-tops
GET /api/v1/categories`}</code>
                  </pre>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2 text-foreground flex items-center gap-2">
                  <Code2 className="h-4 w-4" /> Embed Widget
                </h4>
                <div className="code-block">
                  <pre className="p-2 text-xs overflow-x-auto">
                    <code>{`<div data-chart="mens-tops"></div>
<script src=".../size-charts.js"></script>`}</code>
                  </pre>
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-4">
              <Link href="/docs/api" className="text-sm text-primary hover:text-primary/80 transition-colors">
                API Reference →
              </Link>
              <Link href="/examples" className="text-sm text-primary hover:text-primary/80 transition-colors">
                Widget Examples →
              </Link>
            </div>
          </div>
        </Step>
      </div>

      {/* Data Model Reference */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Data Model</h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-muted/50 px-4 py-3">
            <h3 className="font-medium flex items-center gap-2 text-foreground">
              <Database className="h-4 w-4" />
              Entity Relationships
            </h3>
          </div>
          <div className="p-4">
            <pre className="text-xs text-muted-foreground">
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
          <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Links</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/admin/categories" className="group rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:bg-primary/5 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <FolderTree className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-medium text-foreground">Categories</span>
              </div>
              <p className="text-sm text-muted-foreground">Manage category hierarchy</p>
            </Link>
            <Link href="/admin/labels" className="group rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:bg-primary/5 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Tag className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-medium text-foreground">Labels</span>
              </div>
              <p className="text-sm text-muted-foreground">Size label management</p>
            </Link>
            <Link href="/admin/size-charts" className="group rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:bg-primary/5 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <TableProperties className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-medium text-foreground">Size Charts</span>
              </div>
              <p className="text-sm text-muted-foreground">Create and edit charts</p>
            </Link>
            <Link href="/admin/api-keys" className="group rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:bg-primary/5 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <KeyRound className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-medium text-foreground">API Keys</span>
              </div>
              <p className="text-sm text-muted-foreground">Manage access keys</p>
            </Link>
            <Link href="/docs/api" className="group rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:bg-primary/5 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-medium text-foreground">API Docs</span>
              </div>
              <p className="text-sm text-muted-foreground">Full API reference</p>
            </Link>
            <Link href="/examples" className="group rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:bg-primary/5 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Code2 className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-medium text-foreground">Widget Examples</span>
              </div>
              <p className="text-sm text-muted-foreground">Embed widget examples</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
