import type { Metadata } from "next";
import { EmbedExample } from "@/components/examples/embed-example";

export const metadata: Metadata = {
	title: "Embed Examples",
	description: "Pre-configured widget examples showing light and dark themes, different units, and compact mode for the size chart embed.",
	openGraph: {
		title: "Embed Examples | Size Charts",
		description: "Pre-configured widget examples showing light and dark themes, different units, and compact mode.",
	},
};

export default function EmbedExamplePage() {
	return <EmbedExample />;
}
