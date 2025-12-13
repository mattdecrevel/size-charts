import { Ruler } from "lucide-react";
import Link from "next/link";

export default function SizeGuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Minimal Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/size-guide" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-soft group-hover:shadow-soft-md transition-shadow">
              <Ruler className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-semibold text-foreground tracking-tight">
              Size Guide
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-10">
        {children}
      </main>
    </>
  );
}
