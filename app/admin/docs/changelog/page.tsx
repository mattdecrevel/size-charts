"use client";

import { Badge } from "@/components/ui";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Sparkles,
  Wrench,
  Shield,
  Zap,
  Globe,
  FileText,
  Package,
  Server,
  Database,
  Settings,
  Languages,
  Ruler,
  Key,
} from "lucide-react";

interface ChangelogEntryProps {
  version: string;
  date: string;
  changes: {
    type: "feature" | "fix" | "improvement" | "breaking";
    description: string;
  }[];
}

function ChangelogEntry({ version, date, changes }: ChangelogEntryProps) {
  const typeConfig = {
    feature: { label: "Feature", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
    fix: { label: "Fix", color: "bg-red-500/10 text-red-600 border-red-500/20" },
    improvement: { label: "Improvement", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    breaking: { label: "Breaking", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  };

  return (
    <div className="relative pb-8 last:pb-0">
      <div className="absolute left-3 top-8 -ml-px h-full w-0.5 bg-border last:hidden" />

      <div className="flex gap-4">
        <div className="relative flex h-6 w-6 flex-shrink-0 items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-primary" />
        </div>

        <div className="flex-1 -mt-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-semibold">v{version}</span>
            <span className="text-sm text-muted-foreground">{date}</span>
          </div>
          <ul className="space-y-2">
            {changes.map((change, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className={`text-xs px-1.5 py-0.5 rounded border ${typeConfig[change.type].color}`}>
                  {typeConfig[change.type].label}
                </span>
                <span className="text-sm text-muted-foreground">{change.description}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

interface RoadmapItemProps {
  title: string;
  description: string;
  status: "done" | "in-progress" | "planned" | "considering";
  priority?: "high" | "medium" | "low";
  icon?: typeof Sparkles;
}

function RoadmapItem({ title, description, status, priority, icon: Icon }: RoadmapItemProps) {
  const statusConfig = {
    done: { icon: CheckCircle2, color: "text-emerald-500", label: "Done" },
    "in-progress": { icon: Clock, color: "text-blue-500", label: "In Progress" },
    planned: { icon: Circle, color: "text-amber-500", label: "Planned" },
    considering: { icon: AlertCircle, color: "text-muted-foreground", label: "Considering" },
  };

  const priorityConfig = {
    high: "bg-red-500/10 text-red-600",
    medium: "bg-amber-500/10 text-amber-600",
    low: "bg-muted text-muted-foreground",
  };

  const StatusIcon = statusConfig[status].icon;

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start gap-3">
        {Icon ? (
          <Icon className={`h-5 w-5 ${statusConfig[status].color} mt-0.5`} />
        ) : (
          <StatusIcon className={`h-5 w-5 ${statusConfig[status].color} mt-0.5`} />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{title}</h4>
            {priority && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${priorityConfig[priority]}`}>
                {priority}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant={status === "done" ? "default" : "secondary"} className="ml-2">
          {statusConfig[status].label}
        </Badge>
      </div>
    </div>
  );
}

export default function ChangelogPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Changelog & Roadmap</h1>
        <p className="mt-2 text-muted-foreground">
          Track what&apos;s been built and what&apos;s coming next.
        </p>
      </div>

      {/* Current Status */}
      <div className="mb-8 rounded-lg border bg-emerald-500/5 border-emerald-500/20 p-6">
        <h2 className="mb-2 text-lg font-semibold text-emerald-600">Current Status: Open Source Ready</h2>
        <p className="text-sm text-muted-foreground">
          The core size chart system is complete and ready for open source contribution. Full CRUD operations,
          REST API, Docker support, and comprehensive documentation are available.
        </p>
        <div className="mt-4 grid gap-2 md:grid-cols-4">
          <div className="rounded border bg-background p-3 text-center">
            <div className="text-2xl font-bold">4</div>
            <div className="text-xs text-muted-foreground">Categories</div>
          </div>
          <div className="rounded border bg-background p-3 text-center">
            <div className="text-2xl font-bold">23</div>
            <div className="text-xs text-muted-foreground">Size Charts</div>
          </div>
          <div className="rounded border bg-background p-3 text-center">
            <div className="text-2xl font-bold">58</div>
            <div className="text-xs text-muted-foreground">Labels</div>
          </div>
          <div className="rounded border bg-background p-3 text-center">
            <div className="text-2xl font-bold">4</div>
            <div className="text-xs text-muted-foreground">API Endpoints</div>
          </div>
        </div>
      </div>

      {/* Roadmap */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Roadmap</h2>

        <div className="space-y-6">
          {/* Completed */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Completed
            </h3>
            <div className="space-y-3">
              <RoadmapItem
                icon={Sparkles}
                title="Core CRUD System"
                description="Create, read, update, delete size charts with spreadsheet-like editor."
                status="done"
              />
              <RoadmapItem
                icon={Sparkles}
                title="SizeLabel System"
                description="Reusable, standardized size labels with keys for API consumers."
                status="done"
              />
              <RoadmapItem
                icon={Sparkles}
                title="Many-to-Many Categories"
                description="Assign one chart to multiple subcategories to avoid duplication."
                status="done"
              />
              <RoadmapItem
                icon={Sparkles}
                title="Dual Unit Storage"
                description="Store both inches and cm values for all measurements."
                status="done"
              />
              <RoadmapItem
                icon={Globe}
                title="v1 API"
                description="Clean, versioned API endpoints for external consumption."
                status="done"
              />
              <RoadmapItem
                icon={FileText}
                title="Documentation"
                description="API docs, getting started guide, and changelog."
                status="done"
              />
              <RoadmapItem
                icon={Settings}
                title="Label Type Configuration"
                description="Customize display names for label types (rename Alpha Size to General Size, etc.)."
                status="done"
              />
              <RoadmapItem
                icon={Database}
                title="Full Category CRUD"
                description="Create, edit, and delete categories and subcategories with delete protection."
                status="done"
              />
              <RoadmapItem
                icon={Package}
                title="Open Source Ready"
                description="README, LICENSE (MIT), Docker, contributing guidelines, and GitHub templates."
                status="done"
              />
              <RoadmapItem
                icon={Server}
                title="Health Check Endpoint"
                description="GET /api/health for monitoring database connectivity and uptime."
                status="done"
              />
              <RoadmapItem
                icon={FileText}
                title="OpenAPI/Swagger Documentation"
                description="Interactive API explorer at /api/docs with full schema documentation."
                status="done"
              />
              <RoadmapItem
                icon={Languages}
                title="Label Translation Support"
                description="Standardized label keys (SIZE_SM, etc.) for i18n. See API docs for translation examples."
                status="done"
              />
              <RoadmapItem
                icon={Key}
                title="API Key Authentication"
                description="SHA256-hashed API keys with scopes (read/write) for v1 endpoints."
                status="done"
              />
              <RoadmapItem
                icon={Globe}
                title="CORS Configuration"
                description="Environment-based allowed origins with preflight support."
                status="done"
              />
              <RoadmapItem
                icon={Ruler}
                title="Measurement Instructions"
                description="Dynamic how-to-measure content per chart, editable in admin."
                status="done"
              />
            </div>
          </div>

          {/* Planned */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Planned
            </h3>
            <div className="space-y-3">
              <RoadmapItem
                icon={Zap}
                title="Webhooks"
                description="Notify external systems when charts are created/updated/published."
                status="planned"
                priority="medium"
              />
              <RoadmapItem
                icon={Wrench}
                title="Bulk Import/Export"
                description="Import size chart data from CSV/Excel files."
                status="planned"
                priority="medium"
              />
            </div>
          </div>

          {/* Considering */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Considering
            </h3>
            <div className="space-y-3">
              <RoadmapItem
                title="Version History"
                description="Track changes and allow reverting to previous versions."
                status="considering"
              />
              <RoadmapItem
                title="Size Recommendation Engine"
                description="'Find my size' calculator based on user measurements."
                status="considering"
              />
              <RoadmapItem
                title="Chart Templates"
                description="Pre-configured templates for common chart types."
                status="considering"
              />
              <RoadmapItem
                title="Print Styles"
                description="Optimized print stylesheet for end-user printing."
                status="considering"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Changelog */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Changelog</h2>

        <div className="rounded-lg border bg-card p-6">
          <ChangelogEntry
            version="0.5.0"
            date="December 11, 2024"
            changes={[
              { type: "feature", description: "API key authentication with SHA256 hashing, scopes (read/write), and Bearer token support" },
              { type: "feature", description: "CORS configuration with environment-based allowed origins and preflight support" },
              { type: "feature", description: "Measurement Instructions - dynamic how-to-measure content assignable per chart" },
              { type: "feature", description: "Measurement Instructions admin UI - selector component in chart editor" },
              { type: "feature", description: "API Key management UI - create, view, revoke API keys in admin" },
              { type: "feature", description: "Public chart pages now display chart-specific measurement instructions" },
              { type: "improvement", description: "Updated v1 API routes with authentication middleware" },
              { type: "improvement", description: "Seed data includes 11 measurement instructions linked to charts" },
            ]}
          />

          <ChangelogEntry
            version="0.4.0"
            date="December 11, 2024"
            changes={[
              { type: "feature", description: "Open source preparation: README, LICENSE (MIT), CONTRIBUTING, SECURITY docs" },
              { type: "feature", description: "Docker Compose setup with PostgreSQL, dev, and production profiles" },
              { type: "feature", description: "Health check endpoint at GET /api/health with database connectivity status" },
              { type: "feature", description: "OpenAPI/Swagger documentation at /api/docs with interactive explorer" },
              { type: "feature", description: "GitHub issue and PR templates" },
              { type: "feature", description: "Full category CRUD with create, edit, delete for categories and subcategories" },
              { type: "feature", description: "Label type configuration - customize display names for label types" },
              { type: "improvement", description: "Enabled standalone output in Next.js config for Docker deployments" },
              { type: "fix", description: "Fixed breadcrumb duplication when chart name matches subcategory name" },
            ]}
          />

          <ChangelogEntry
            version="0.3.0"
            date="December 10, 2024"
            changes={[
              { type: "feature", description: "Added Admin Documentation pages (API docs, Getting Started, Changelog)" },
              { type: "feature", description: "Added v1 API endpoints for external consumption" },
              { type: "feature", description: "Added multi-category assignment dialog in chart editor" },
              { type: "feature", description: "Added label dropdown support in SIZE_LABEL columns" },
              { type: "feature", description: "Added Labels management page in admin" },
            ]}
          />

          <ChangelogEntry
            version="0.2.0"
            date="December 10, 2024"
            changes={[
              { type: "feature", description: "Implemented SizeLabel table for standardized size identifiers" },
              { type: "feature", description: "Added many-to-many relationship between charts and subcategories" },
              { type: "feature", description: "Store both inches and cm values in cells" },
              { type: "improvement", description: "Consolidated duplicate charts (38 → 23)" },
              { type: "breaking", description: "Schema changes require database migration/reset" },
            ]}
          />

          <ChangelogEntry
            version="0.1.0"
            date="December 10, 2024"
            changes={[
              { type: "feature", description: "Initial release with core CRUD functionality" },
              { type: "feature", description: "Spreadsheet-like chart editor with inline editing" },
              { type: "feature", description: "Category and subcategory management" },
              { type: "feature", description: "Public size guide pages with unit switcher" },
              { type: "feature", description: "shadcn/ui components with dark mode support" },
            ]}
          />
        </div>
      </div>

      {/* Technical Debt / Known Issues */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Known Issues & Technical Debt</h2>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium">CM values not auto-computed on API write</p>
              <p className="text-sm text-muted-foreground">
                If updating via API, you must provide both inch and cm values. Consider auto-computing cm from inches.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium">No rate limiting</p>
              <p className="text-sm text-muted-foreground">
                API has no protection against abuse. Consider adding rate limiting middleware.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">No error tracking</p>
              <p className="text-sm text-muted-foreground">
                No Sentry or similar integration for production error monitoring.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">No admin authentication</p>
              <p className="text-sm text-muted-foreground">
                Admin dashboard is open to anyone. Consider adding user auth for production.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contributing */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Want to Contribute?</h2>

        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-3">
            This project is built with:
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline">Next.js 16</Badge>
            <Badge variant="outline">React 19</Badge>
            <Badge variant="outline">TypeScript 5</Badge>
            <Badge variant="outline">Tailwind CSS 4</Badge>
            <Badge variant="outline">Prisma 7</Badge>
            <Badge variant="outline">PostgreSQL</Badge>
            <Badge variant="outline">shadcn/ui</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Check the repository for contribution guidelines and open issues.
          </p>
        </div>
      </div>
    </div>
  );
}
