import type { Metadata } from "next";
import { GettingStartedContent } from "@/components/docs";

export const metadata: Metadata = {
	title: "Getting Started",
	description: "Learn how to set up size charts from scratch. Covers categories, labels, and creating your first chart.",
	openGraph: {
		title: "Getting Started | Size Charts",
		description: "Learn how to set up size charts from scratch. Covers categories, labels, and creating your first chart.",
	},
};

export default function GettingStartedPage() {
	return <GettingStartedContent showAdminLinks={false} />;
}
