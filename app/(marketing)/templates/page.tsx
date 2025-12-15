"use client";

import { TemplateBrowser } from "@/components/templates/template-browser";

export default function TemplatesPage() {
	return (
		<div>
			<div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
						Size Chart Templates
					</h1>
					<p className="mt-2 text-muted-foreground">
						Browse pre-built templates for common sizing needs. Try them in the demo to see how they work.
					</p>
				</div>
			</div>

			<TemplateBrowser allowCreate={false} />
		</div>
	);
}
