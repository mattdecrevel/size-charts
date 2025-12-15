import type { Metadata } from "next";
import { ChangelogContent } from "@/components/docs";

export const metadata: Metadata = {
	title: "Changelog",
	description: "See what's been built, what's in progress, and what's planned for the Size Charts platform.",
	openGraph: {
		title: "Changelog | Size Charts",
		description: "See what's been built, what's in progress, and what's planned for the Size Charts platform.",
	},
};

export default function ChangelogPage() {
	return (
		<div className="max-w-4xl mx-auto">
			<ChangelogContent />
		</div>
	);
}
