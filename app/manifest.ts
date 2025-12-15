import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Size Charts",
		short_name: "Size Charts",
		description: "Open-source size chart management for e-commerce. Create, manage, and embed size charts.",
		start_url: "/",
		display: "standalone",
		background_color: "#0f0a1a",
		theme_color: "#a855f7",
		orientation: "portrait-primary",
		categories: ["business", "productivity", "utilities"],
		icons: [
			{
				src: "/icon-192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "maskable",
			},
			{
				src: "/icon-512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "any",
			},
		],
	};
}
