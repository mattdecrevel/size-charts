import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Templates",
	description: "Browse pre-built size chart templates for clothing, footwear, accessories, and more. Start with a template and customize for your needs.",
	openGraph: {
		title: "Size Chart Templates | Size Charts",
		description: "Browse pre-built size chart templates for clothing, footwear, accessories, and more.",
	},
};

export default function TemplatesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
