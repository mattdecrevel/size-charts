"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { TemplateBrowser, Template } from "@/components/templates/template-browser";

export default function AdminTemplatesPage() {
	const router = useRouter();
	const { addToast } = useToast();
	const [isApplying, setIsApplying] = useState(false);

	const handleCreateFromTemplate = async (template: Template, variantKey?: string) => {
		if (isApplying) return;

		setIsApplying(true);
		try {
			const response = await fetch(`/api/templates/${template.id}/apply`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ variantKey }),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to apply template");
			}

			const { sizeChart } = await response.json();
			addToast("Size chart created from template", "success");
			router.push(`/admin/size-charts/${sizeChart.id}`);
		} catch (error) {
			addToast(error instanceof Error ? error.message : "Failed to apply template", "error");
		} finally {
			setIsApplying(false);
		}
	};

	return (
		<div>
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Templates</h1>
				<p className="text-muted-foreground">
					Browse and use pre-built size chart templates
				</p>
			</div>

			<TemplateBrowser
				allowCreate
				onCreateFromTemplate={handleCreateFromTemplate}
			/>
		</div>
	);
}
