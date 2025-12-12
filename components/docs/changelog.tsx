"use client";

import {
  CheckCircle2,
  Circle,
  Clock,
  HelpCircle,
  Lock,
  Container,
  Gauge,
  FileCode,
  ScrollText,
  Code2,
  FileUp,
  Bell,
  HardDrive,
  Calculator,
  BarChart3,
  Building2,
  History,
  Puzzle,
  Layers,
  Languages,
  Tag,
  Ruler,
  Key,
  Globe,
  Database,
  type LucideIcon,
} from "lucide-react";

interface RoadmapItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  status: "done" | "in-progress" | "planned" | "considering";
  priority?: "high" | "medium" | "low";
}

function RoadmapItem({ icon: Icon, title, description, status, priority }: RoadmapItemProps) {
  const statusConfig = {
    done: {
      indicator: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/5",
    },
    "in-progress": {
      indicator: <Clock className="h-5 w-5 text-blue-500 animate-pulse" />,
      border: "border-blue-500/20",
      bg: "bg-blue-500/5",
    },
    planned: {
      indicator: <Circle className="h-5 w-5 text-zinc-400" />,
      border: "border-zinc-200 dark:border-zinc-800",
      bg: "",
    },
    considering: {
      indicator: <HelpCircle className="h-5 w-5 text-zinc-400" />,
      border: "border-zinc-200 dark:border-zinc-800",
      bg: "bg-zinc-500/5",
    },
  };

  const priorityBadge = priority && (
    <span
      className={`text-xs px-2 py-0.5 rounded-full ${
        priority === "high"
          ? "bg-red-500/10 text-red-600"
          : priority === "medium"
          ? "bg-amber-500/10 text-amber-600"
          : "bg-zinc-500/10 text-zinc-600"
      }`}
    >
      {priority}
    </span>
  );

  const config = statusConfig[status];

  return (
    <div className={`rounded-lg border p-4 ${config.border} ${config.bg}`}>
      <div className="flex items-start gap-3">
        {config.indicator}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">{title}</h3>
            {priorityBadge}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

interface ChangelogContentProps {
  showTitle?: boolean;
  className?: string;
}

export function ChangelogContent({ showTitle = true, className = "" }: ChangelogContentProps) {
  return (
    <div className={className}>
      {showTitle && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Changelog & Roadmap</h1>
          <p className="mt-2 text-muted-foreground">
            Track what&apos;s been built, what&apos;s in progress, and what&apos;s coming next.
          </p>
        </div>
      )}

      {/* Current Status */}
      <div className="mb-8 rounded-lg border bg-blue-500/5 border-blue-500/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-sm font-medium text-blue-600">v1.0 Integration Ready - In Progress</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Building embeddable widget, import/export, and integration features.
        </p>
      </div>

      {/* Completed - v0.6.0 */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          Completed - v0.6.0 (Production Ready)
        </h2>
        <div className="space-y-3">
          <RoadmapItem
            icon={Lock}
            title="Admin Authentication"
            description="Environment-based admin login with session management and middleware protection."
            status="done"
          />
          <RoadmapItem
            icon={Key}
            title="API Key Authentication"
            description="Secure API keys with scopes, rate limiting per key, and usage tracking."
            status="done"
          />
          <RoadmapItem
            icon={Globe}
            title="CORS Configuration"
            description="Configurable cross-origin resource sharing for API access from any domain."
            status="done"
          />
          <RoadmapItem
            icon={Gauge}
            title="Rate Limiting"
            description="Per-key rate limiting (100 read/30 write per minute) with headers."
            status="done"
          />
          <RoadmapItem
            icon={FileCode}
            title="Structured Logging"
            description="JSON logging in production, pretty output in dev, with request tracing."
            status="done"
          />
          <RoadmapItem
            icon={Container}
            title="Docker Support"
            description="Production-ready Docker with multi-stage builds and compose setup."
            status="done"
          />
          <RoadmapItem
            icon={Ruler}
            title="Measurement Instructions"
            description="How-to-measure guidance linked to charts, visible on public pages."
            status="done"
          />
          <RoadmapItem
            icon={Layers}
            title="Many-to-Many Categories"
            description="Single chart can appear in multiple categories without duplication."
            status="done"
          />
          <RoadmapItem
            icon={Tag}
            title="Reusable Size Labels"
            description="Standardized labels (SM, MD, LG) shared across all charts."
            status="done"
          />
          <RoadmapItem
            icon={Database}
            title="Full CRUD API"
            description="Complete REST API for size charts, categories, and labels."
            status="done"
          />
        </div>
      </section>

      {/* In Progress - v1.0 */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          In Progress - v1.0 (Integration Ready)
        </h2>
        <div className="space-y-3">
          <RoadmapItem
            icon={Code2}
            title="Embeddable Widget"
            description="Zero-dependency JS widget for embedding charts on any website."
            status="in-progress"
          />
          <RoadmapItem
            icon={FileUp}
            title="Import/Export"
            description="JSON import/export for bulk chart management and backups."
            status="in-progress"
          />
        </div>
      </section>

      {/* Planned - v2.0 */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Circle className="h-5 w-5 text-zinc-400" />
          Planned - v2.0 (Differentiation)
        </h2>
        <div className="space-y-3">
          <RoadmapItem
            icon={Bell}
            title="Webhooks"
            description="Notify external systems when charts are updated."
            status="planned"
            priority="high"
          />
          <RoadmapItem
            icon={HardDrive}
            title="Redis Caching"
            description="Optional Redis for high-performance API responses."
            status="planned"
            priority="medium"
          />
          <RoadmapItem
            icon={Calculator}
            title="Fit Recommendation API"
            description="POST measurements, get recommended size with confidence score."
            status="planned"
            priority="high"
          />
          <RoadmapItem
            icon={Building2}
            title="Multi-tenancy"
            description="Support multiple brands/stores with isolated data."
            status="planned"
            priority="medium"
          />
          <RoadmapItem
            icon={BarChart3}
            title="Analytics Dashboard"
            description="Track which charts are viewed most, API usage patterns."
            status="planned"
            priority="low"
          />
          <RoadmapItem
            icon={Languages}
            title="Full i18n Support"
            description="Multi-language label translations with locale selection."
            status="planned"
            priority="medium"
          />
        </div>
      </section>

      {/* Considering */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-zinc-400" />
          Considering
        </h2>
        <div className="space-y-3">
          <RoadmapItem
            icon={History}
            title="Version History"
            description="Track and undo changes to charts."
            status="considering"
          />
          <RoadmapItem
            icon={Puzzle}
            title="Platform Integrations"
            description="Native Shopify, WooCommerce, Magento apps."
            status="considering"
          />
          <RoadmapItem
            icon={ScrollText}
            title="Chart Templates"
            description="Pre-configured templates for common use cases."
            status="considering"
          />
        </div>
      </section>
    </div>
  );
}
