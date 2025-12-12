"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ApiReferenceContent } from "@/components/docs";

export default function FrontendApiPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/size-guide"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <ApiReferenceContent />
    </div>
  );
}
