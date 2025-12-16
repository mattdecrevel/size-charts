"use client";

import {
	Code2,
	FileText,
	Layers,
	Globe,
	Key,
	Gauge,
	LucideIcon,
} from "lucide-react";
import { FeatureCard } from "./feature-card";

const iconMap: Record<string, LucideIcon> = {
	Layers,
	Globe,
	Key,
	Code2,
	Gauge,
	FileText,
};

interface Feature {
	iconName: string;
	title: string;
	description: string;
}

interface FeaturesGridProps {
	features: Feature[];
	variant?: "default" | "gradient" | "glow" | "spotlight";
}

export function FeaturesGrid({ features, variant = "spotlight" }: FeaturesGridProps) {
	return (
		<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{features.map((feature, index) => {
				const Icon = iconMap[feature.iconName] || Code2;
				return (
					<FeatureCard
						key={feature.title}
						icon={Icon}
						title={feature.title}
						description={feature.description}
						variant={variant}
						index={index}
					/>
				);
			})}
		</div>
	);
}
