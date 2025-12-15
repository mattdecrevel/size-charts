import type { Metadata } from "next";
import { ApiReferenceContent } from "@/components/docs";

export const metadata: Metadata = {
	title: "API Reference",
	description: "Complete REST API documentation for integrating size charts into your application. Includes endpoints for charts, categories, and labels.",
	openGraph: {
		title: "API Reference | Size Charts",
		description: "Complete REST API documentation for integrating size charts into your application.",
	},
};

export default function ApiDocsPage() {
	return <ApiReferenceContent showNavigation={true} />;
}
