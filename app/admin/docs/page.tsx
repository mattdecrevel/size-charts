"use client";

import Link from "next/link";
import { BookOpen, Code, History, ArrowRight, Code2 } from "lucide-react";

const docs = [
  {
    title: "Getting Started",
    description: "Learn how to set up size charts from scratch. Covers categories, labels, and creating your first chart.",
    href: "/admin/docs/getting-started",
    icon: BookOpen,
  },
  {
    title: "API Reference",
    description: "Complete API documentation for integrating size charts into your application.",
    href: "/admin/docs/api",
    icon: Code,
  },
  {
    title: "Embed Widget",
    description: "Add size charts to any website with a simple script tag. Includes theming and configuration options.",
    href: "/admin/docs/embed",
    icon: Code2,
  },
  {
    title: "Changelog & Roadmap",
    description: "See what's been built, what's in progress, and what's planned for the future.",
    href: "/admin/docs/changelog",
    icon: History,
  },
];

export default function DocsPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Documentation</h1>
        <p className="mt-2 text-muted-foreground">
          Everything you need to know about using and integrating the size charts system.
        </p>
      </div>

      <div className="grid gap-4">
        {docs.map((doc) => (
          <Link
            key={doc.href}
            href={doc.href}
            className="group rounded-lg border bg-card p-6 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <doc.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {doc.title}
                </h2>
                <p className="mt-1 text-muted-foreground">
                  {doc.description}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mt-8 rounded-lg border bg-muted/50 p-6">
        <h2 className="mb-4 font-semibold">Quick Links</h2>
        <div className="grid gap-2 md:grid-cols-2">
          <Link href="/admin/size-charts/new" className="text-sm text-primary hover:underline">
            → Create a new size chart
          </Link>
          <Link href="/admin/labels" className="text-sm text-primary hover:underline">
            → Manage size labels
          </Link>
          <Link href="/admin/categories" className="text-sm text-primary hover:underline">
            → View categories
          </Link>
          <Link href="/size-guide" className="text-sm text-primary hover:underline" target="_blank">
            → View public size guide
          </Link>
        </div>
      </div>
    </div>
  );
}
