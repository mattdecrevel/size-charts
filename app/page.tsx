import Link from "next/link";
import { Code2, FileText, Layers, Globe, Key, Gauge, ArrowRight, Ruler } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";

const features = [
  {
    icon: Layers,
    title: "Hierarchical Categories",
    description: "Organize charts by category and subcategory. One chart can appear in multiple places.",
  },
  {
    icon: Globe,
    title: "Dual Unit System",
    description: "All measurements stored in inches, automatically converted to centimeters.",
  },
  {
    icon: Key,
    title: "API Authentication",
    description: "Secure API keys with scopes and rate limiting for production use.",
  },
  {
    icon: Code2,
    title: "Embeddable Widget",
    description: "Drop-in JavaScript widget that works on any website with zero dependencies.",
  },
  {
    icon: Gauge,
    title: "Rate Limited",
    description: "Built-in rate limiting protects your API from abuse (100 req/min).",
  },
  {
    icon: FileText,
    title: "Full REST API",
    description: "Complete CRUD operations for charts, categories, and labels.",
  },
];

const quickLinks = [
  {
    href: "/size-guide",
    icon: Ruler,
    title: "Size Guide",
    description: "Browse size charts by category - the end-user experience.",
    cta: "Browse Charts",
  },
  {
    href: "/demo",
    icon: Code2,
    title: "Widget Demo",
    description: "See the embeddable widget in action with live examples.",
    cta: "View Demo",
  },
  {
    href: "/docs",
    icon: FileText,
    title: "API Documentation",
    description: "Complete reference for integrating via REST API.",
    cta: "Read Docs",
  },
];

export default function HomePage() {
  return (
    <PublicLayout>
      <div>
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            Size Charts API
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-8">
            A complete solution for managing and displaying e-commerce size charts.
            Use the API directly or embed the widget on any website.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 dark:bg-zinc-50 px-6 py-3 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              <Code2 className="h-4 w-4" />
              View Demo
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-6 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <FileText className="h-4 w-4" />
              API Docs
            </Link>
            <Link
              href="/size-guide"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-6 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <Ruler className="h-4 w-4" />
              Size Guide
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6">Features</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
              >
                <feature.icon className="h-8 w-8 text-zinc-400 mb-3" />
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6">Get Started</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              >
                <link.icon className="h-8 w-8 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 mb-4" />
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
                  {link.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  {link.description}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-zinc-900 dark:text-zinc-50 group-hover:gap-2 transition-all">
                  {link.cta}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Code Example */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6">Quick Start</h2>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
            <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Embed with one line</span>
            </div>
            <pre className="p-4 text-sm overflow-x-auto">
              <code className="text-zinc-800 dark:text-zinc-200">{`<div data-chart="mens-tops"></div>
<script src="https://your-domain.com/embed/size-charts.js" data-api="https://your-domain.com"></script>`}</code>
            </pre>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-hidden mt-4">
            <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Or fetch via API</span>
            </div>
            <pre className="p-4 text-sm overflow-x-auto">
              <code className="text-zinc-800 dark:text-zinc-200">{`curl -H "X-API-Key: sc_live_xxxx" \\
  "https://your-domain.com/api/v1/size-charts?slug=mens-tops"`}</code>
            </pre>
          </div>
        </div>

        {/* Admin Link */}
        <div className="text-center py-8 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
            Need to manage size charts?
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:underline"
          >
            Go to Admin Panel
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
