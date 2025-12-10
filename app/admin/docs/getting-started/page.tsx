"use client";

import Link from "next/link";
import { Badge } from "@/components/ui";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  FolderTree,
  Tag,
  TableProperties,
  Globe,
  Database,
  Layers,
  Settings
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
      {/* Connector line */}
      <div className="absolute left-5 top-10 -ml-px h-full w-0.5 bg-border last:hidden" />

      <div className="flex gap-4">
        {/* Step indicator */}
        <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center">
          {status === "complete" ? (
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          ) : status === "current" ? (
            <div className="h-10 w-10 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">{number}</span>
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full border-2 border-border bg-background flex items-center justify-center">
              <span className="text-sm font-semibold text-muted-foreground">{number}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 pt-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, children }: { icon: typeof FolderTree; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <h4 className="font-medium">{title}</h4>
      </div>
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

export default function GettingStartedPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Getting Started</h1>
        <p className="mt-2 text-muted-foreground">
          Learn how to set up your size charts from scratch. This guide walks you through the complete process.
        </p>
      </div>

      {/* Overview */}
      <div className="mb-8 rounded-lg border bg-blue-500/5 border-blue-500/20 p-6">
        <h2 className="mb-4 text-lg font-semibold text-blue-600">How It All Fits Together</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard icon={FolderTree} title="Categories">
            <p>Top-level groupings like <strong>Men&apos;s</strong>, <strong>Women&apos;s</strong>, <strong>Kids</strong>.</p>
            <p className="mt-1">Each has subcategories (Tops, Bottoms, etc.)</p>
          </InfoCard>
          <InfoCard icon={Tag} title="Labels">
            <p>Reusable size identifiers like <strong>SM</strong>, <strong>MD</strong>, <strong>LG</strong>.</p>
            <p className="mt-1">Define once, use in any chart.</p>
          </InfoCard>
          <InfoCard icon={TableProperties} title="Size Charts">
            <p>The actual data tables with measurements.</p>
            <p className="mt-1">Can belong to multiple categories.</p>
          </InfoCard>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Categories</span>
          <ArrowRight className="h-4 w-4" />
          <span>Subcategories</span>
          <ArrowRight className="h-4 w-4" />
          <span>Size Charts</span>
          <ArrowRight className="h-4 w-4" />
          <span>Rows & Cells</span>
        </div>
      </div>

      {/* Steps */}
      <div className="mb-8">
        <h2 className="mb-6 text-lg font-semibold">Setup Steps</h2>

        <Step
          number={1}
          title="Understand the Category Structure"
          description="Categories organize your size charts into a navigable hierarchy."
          status="complete"
        >
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm mb-3">The system comes with pre-configured categories:</p>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="rounded border p-3">
                <div className="font-medium">Men&apos;s</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Tops, Bottoms, Footwear, Gloves, Headwear, Socks
                </div>
              </div>
              <div className="rounded border p-3">
                <div className="font-medium">Women&apos;s</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Tops, Bottoms, Bras, Leggings, Footwear, Plus Sizes
                </div>
              </div>
              <div className="rounded border p-3">
                <div className="font-medium">Boys</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Tops, Bottoms (age-based sizing)
                </div>
              </div>
              <div className="rounded border p-3">
                <div className="font-medium">Girls</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Tops, Bottoms (age-based sizing)
                </div>
              </div>
            </div>
            <Link
              href="/admin/categories"
              className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View & manage categories <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Step>

        <Step
          number={2}
          title="Set Up Your Labels"
          description="Labels are standardized size identifiers used across charts."
          status="complete"
        >
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm mb-3">Labels ensure consistency. Instead of typing &quot;SM&quot; in every cell, you select from a dropdown.</p>

            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Pre-configured Label Types:</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Alpha (XS, S, M, L)</Badge>
                <Badge variant="secondary">Numeric (0, 2, 4, 6)</Badge>
                <Badge variant="secondary">Youth (YS, YM, YL)</Badge>
                <Badge variant="secondary">Band (30, 32, 34)</Badge>
                <Badge variant="secondary">Cup (A, B, C, D)</Badge>
                <Badge variant="secondary">Custom</Badge>
              </div>
            </div>

            <div className="rounded border bg-amber-500/5 border-amber-500/20 p-3 mb-3">
              <p className="text-sm"><strong>Why use labels?</strong></p>
              <ul className="text-sm text-muted-foreground mt-1 list-disc list-inside">
                <li>Consistent display values across charts</li>
                <li>Standard keys for API consumers (e.g., <code className="bg-muted px-1 rounded">SIZE_SM</code>)</li>
                <li>Easy to update a label&apos;s display value everywhere at once</li>
                <li>Support for future translation (locale-specific values)</li>
              </ul>
            </div>

            <Link
              href="/admin/labels"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Manage labels <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Step>

        <Step
          number={3}
          title="Create Your First Size Chart"
          description="Now you can create a chart with columns for sizes and measurements."
          status="current"
        >
          <div className="rounded-lg border bg-card p-4">
            <h4 className="font-medium mb-3">Creating a Size Chart</h4>

            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">1</span>
                <div>
                  <p className="font-medium">Go to Size Charts → New Size Chart</p>
                  <p className="text-muted-foreground">Enter a name (e.g., &quot;Regular Fit&quot;) and select a category.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">2</span>
                <div>
                  <p className="font-medium">Configure your columns</p>
                  <p className="text-muted-foreground">Each column has a type:</p>
                  <ul className="mt-1 list-disc list-inside text-muted-foreground ml-2">
                    <li><strong>SIZE_LABEL</strong> - For size identifiers (dropdown from labels)</li>
                    <li><strong>MEASUREMENT</strong> - For numeric measurements (inches, auto-converts to cm)</li>
                    <li><strong>TEXT</strong> - For any other text content</li>
                  </ul>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">3</span>
                <div>
                  <p className="font-medium">Add rows and enter data</p>
                  <p className="text-muted-foreground">Click cells to edit. For measurements, enter ranges like &quot;34-37&quot; or single values.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">4</span>
                <div>
                  <p className="font-medium">Save and Publish</p>
                  <p className="text-muted-foreground">Draft charts are only visible in admin. Publish to make them available via API.</p>
                </div>
              </li>
            </ol>

            <Link
              href="/admin/size-charts/new"
              className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Create a size chart <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Step>

        <Step
          number={4}
          title="Multi-Category Assignment"
          description="A single chart can appear in multiple categories (e.g., Boys & Girls)."
        >
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm mb-3">
              Instead of duplicating charts, assign one chart to multiple subcategories.
            </p>

            <div className="rounded border bg-muted/50 p-3 mb-3">
              <p className="text-sm font-medium">Example:</p>
              <p className="text-sm text-muted-foreground">
                &quot;Youth Big Kids (8-20)&quot; chart is assigned to both:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside mt-1">
                <li>Boys → Tops</li>
                <li>Girls → Tops</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-1">
                Edit once, updates both locations automatically.
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              On the chart edit page, click <strong>Edit</strong> next to Categories to select multiple subcategories.
            </p>
          </div>
        </Step>

        <Step
          number={5}
          title="Integrate via API"
          description="Use the v1 API to display charts in your application."
        >
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm mb-3">
              The API provides published charts in a clean format with both inches and cm values.
            </p>

            <pre className="rounded bg-zinc-950 p-3 text-xs text-zinc-100 overflow-x-auto mb-3">
{`// Fetch by slug
GET /api/v1/size-charts?slug=mens-tops

// Fetch by category
GET /api/v1/size-charts?category=mens&subcategory=tops

// Get all categories
GET /api/v1/categories`}
            </pre>

            <Link
              href="/admin/docs/api"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View full API documentation <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Step>
      </div>

      {/* Data Model Reference */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Data Model Reference</h2>

        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="border-b bg-muted/50 px-4 py-3">
            <h3 className="font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Entity Relationships
            </h3>
          </div>
          <div className="p-4">
            <pre className="text-xs text-muted-foreground">
{`Category (Men's, Women's, Boys, Girls)
  └── Subcategory (Tops, Bottoms, Bras, etc.)
        └── SizeChartSubcategory (join table, many-to-many)
              └── SizeChart (the actual chart)
                    ├── SizeChartColumn (Size, Chest, Waist, etc.)
                    └── SizeChartRow
                          └── SizeChartCell
                                ├── valueText (for text columns)
                                ├── valueInches / valueCm (for measurements)
                                ├── valueMinInches / valueMaxInches (for ranges)
                                └── labelId → SizeLabel (optional link)

SizeLabel (standalone, reusable)
  ├── key: "SIZE_SM"
  ├── displayValue: "SM"
  └── labelType: ALPHA_SIZE`}
            </pre>
          </div>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Quick Reference</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/admin/categories" className="group rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <FolderTree className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              <span className="font-medium">Categories</span>
            </div>
            <p className="text-sm text-muted-foreground">
              View and add subcategories to organize your charts.
            </p>
          </Link>

          <Link href="/admin/labels" className="group rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <Tag className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              <span className="font-medium">Labels</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage reusable size labels (SM, MD, LG, etc.)
            </p>
          </Link>

          <Link href="/admin/size-charts" className="group rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <TableProperties className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              <span className="font-medium">Size Charts</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Create and edit size chart data tables.
            </p>
          </Link>

          <Link href="/admin/docs/api" className="group rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              <span className="font-medium">API Docs</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Learn how to integrate via the v1 API.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
