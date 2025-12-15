import type { Metadata } from "next";
import { LiveBuilder } from "@/components/examples/live-builder";

export const metadata: Metadata = {
	title: "Live Builder",
	description: "Interactive builder to configure and preview the size chart widget with your custom settings. Generate embed code instantly.",
	openGraph: {
		title: "Live Builder | Size Charts",
		description: "Interactive builder to configure and preview the size chart widget with your custom settings.",
	},
};

export default function LiveBuilderPage() {
	return <LiveBuilder />;
}
