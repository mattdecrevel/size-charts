import Link from "next/link";
import { TableProperties, Settings } from "lucide-react";

export default function SizeGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/size-guide" className="flex items-center gap-2">
            <TableProperties className="h-6 w-6 text-zinc-900 dark:text-zinc-50" />
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Size Guide
            </span>
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            <Settings className="h-4 w-4" />
            Admin
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
