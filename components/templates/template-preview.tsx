"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TemplateBrowser } from "./template-browser";

interface TemplatePreviewProps {
	limit?: number;
}

export function TemplatePreview({ limit = 4 }: TemplatePreviewProps) {
	return (
		<section>
			<div className="flex items-center justify-between mb-10">
				<div className="flex items-center gap-4">
					<h2 className="text-2xl font-semibold text-foreground">Templates</h2>
					<div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-border to-transparent min-w-[40px]" />
				</div>
				<Link
					href="/templates"
					className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
				>
					Browse all <ChevronRight className="h-4 w-4" />
				</Link>
			</div>

			<TemplateBrowser compact limit={limit} allowCreate={false} />
		</section>
	);
}
