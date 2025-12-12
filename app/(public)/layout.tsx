import Link from "next/link";
import { TableProperties, Settings, Code2, FileText, Ruler } from "lucide-react";

const navLinks = [
  { name: "Size Guide", href: "/size-guide", icon: Ruler },
  { name: "Demo", href: "/demo", icon: Code2 },
  { name: "Docs", href: "/docs", icon: FileText },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <TableProperties className="h-6 w-6 text-zinc-900 dark:text-zinc-50" />
              <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Size Charts
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <link.icon className="h-4 w-4" />
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
          <Link
            href="/admin"
            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        </div>
        {/* Mobile nav */}
        <nav className="md:hidden border-t border-zinc-200 dark:border-zinc-800 px-4 py-2 flex items-center gap-4 overflow-x-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 whitespace-nowrap"
            >
              <link.icon className="h-4 w-4" />
              {link.name}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
