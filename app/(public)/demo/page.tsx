import Link from "next/link";
import { Code2, Wand2, ExternalLink, ArrowRight } from "lucide-react";

const demos = [
  {
    href: "/demo/embed",
    icon: Code2,
    title: "Embed Widget Examples",
    description: "Pre-configured widget examples showing light/dark themes, units, and compact mode.",
  },
  {
    href: "/demo/live",
    icon: Wand2,
    title: "Live Builder",
    description: "Interactive builder to configure and preview the widget with your settings.",
  },
  {
    href: "/demo/standalone",
    icon: ExternalLink,
    title: "Standalone Demo",
    description: "See how the widget looks when embedded in an external website.",
  },
];

export default function DemoPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Demo</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Explore different ways to use the size chart widget.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {demos.map((demo) => (
          <Link
            key={demo.href}
            href={demo.href}
            className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
          >
            <demo.icon className="h-8 w-8 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 mb-4" />
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
              {demo.title}
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              {demo.description}
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-zinc-900 dark:text-zinc-50 group-hover:gap-2 transition-all">
              View
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>

      {/* Quick info */}
      <div className="mt-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Quick Embed</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Add size charts to any website with just two lines of code:
        </p>
        <pre className="rounded-lg bg-zinc-950 p-4 text-sm text-zinc-100 overflow-x-auto">
          <code>{`<div data-chart="mens-tops"></div>
<script src="https://your-domain.com/embed/size-charts.js" data-api="https://your-domain.com"></script>`}</code>
        </pre>
      </div>
    </div>
  );
}
