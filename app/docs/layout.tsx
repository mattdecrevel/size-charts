import Link from "next/link";
import { PublicLayout } from "@/components/public-layout";
import { BookOpen, FileCode, History, Code2 } from "lucide-react";

const docsNav = [
  { href: "/docs/getting-started", label: "Getting Started", icon: BookOpen },
  { href: "/docs/api", label: "API Reference", icon: FileCode },
  { href: "/docs/embed", label: "Embed Widget", icon: Code2 },
  { href: "/changelog", label: "Changelog", icon: History },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicLayout>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-48 flex-shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
            {docsNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg whitespace-nowrap text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </PublicLayout>
  );
}
