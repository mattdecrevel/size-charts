import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Embed Widget",
	description: "Add size charts to any website with a simple script tag. Configure themes, units, and display options with our live builder.",
	openGraph: {
		title: "Embed Widget | Size Charts",
		description: "Add size charts to any website with a simple script tag. Configure themes, units, and display options.",
	},
};

export default function EmbedDocsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
