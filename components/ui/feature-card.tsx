"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useState, useRef } from "react";

interface FeatureCardProps {
	icon: LucideIcon;
	title: string;
	description: string;
	variant?: "default" | "gradient" | "glow" | "spotlight";
	className?: string;
	index?: number;
}

export function FeatureCard({
	icon: Icon,
	title,
	description,
	variant = "default",
	className,
	index = 0,
}: FeatureCardProps) {
	const [isHovered, setIsHovered] = useState(false);
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const cardRef = useRef<HTMLDivElement>(null);

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!cardRef.current) return;
		const rect = cardRef.current.getBoundingClientRect();
		setMousePosition({
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		});
	};

	if (variant === "spotlight") {
		return (
			<div
				ref={cardRef}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				onMouseMove={handleMouseMove}
				className={cn(
					"group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-500",
					"hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5",
					`animate-fade-up stagger-${Math.min(index + 1, 6)}`,
					className
				)}
			>
				{/* Spotlight gradient that follows cursor */}
				<div
					className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
					style={{
						background: isHovered
							? `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, oklch(0.55 0.28 295 / 0.1), transparent 40%)`
							: "none",
					}}
				/>

				{/* Icon with glow */}
				<div className="relative">
					<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors duration-300">
						<Icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
					</div>
					{/* Icon glow on hover */}
					<div className="absolute inset-0 rounded-xl bg-primary/20 blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
				</div>

				<h3 className="relative mt-5 text-base font-semibold text-foreground">
					{title}
				</h3>
				<p className="relative mt-2 text-sm text-muted-foreground leading-relaxed">
					{description}
				</p>

				{/* Bottom accent line */}
				<div className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-primary/50 to-accent/50 group-hover:w-full transition-all duration-500" />
			</div>
		);
	}

	if (variant === "gradient") {
		return (
			<div
				className={cn(
					"group relative rounded-2xl p-px overflow-hidden",
					`animate-fade-up stagger-${Math.min(index + 1, 6)}`,
					className
				)}
			>
				{/* Animated gradient border */}
				<div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 gradient-border-animate" />
				<div className="absolute inset-0 rounded-2xl bg-border opacity-100 group-hover:opacity-0 transition-opacity duration-500" />

				<div className="relative rounded-[calc(1rem-1px)] bg-card p-6 h-full">
					<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 group-hover:from-primary/30 group-hover:to-accent/20 transition-colors duration-300">
						<Icon className="h-6 w-6 text-primary" />
					</div>
					<h3 className="mt-5 text-base font-semibold text-foreground">
						{title}
					</h3>
					<p className="mt-2 text-sm text-muted-foreground leading-relaxed">
						{description}
					</p>
				</div>
			</div>
		);
	}

	if (variant === "glow") {
		return (
			<div
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				className={cn(
					"group relative rounded-2xl border border-border bg-card p-6 transition-all duration-500",
					"hover:border-primary/40",
					`animate-fade-up stagger-${Math.min(index + 1, 6)}`,
					className
				)}
			>
				{/* Glow effect behind card */}
				<div
					className={cn(
						"absolute -inset-px rounded-2xl bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 blur-xl transition-opacity duration-500",
						isHovered ? "opacity-100" : "opacity-0"
					)}
				/>

				<div className="relative">
					<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-all duration-300">
						<Icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
					</div>
					<h3 className="mt-5 text-base font-semibold text-foreground">
						{title}
					</h3>
					<p className="mt-2 text-sm text-muted-foreground leading-relaxed">
						{description}
					</p>
				</div>
			</div>
		);
	}

	// Default variant
	return (
		<div
			className={cn(
				"group card-soft p-6 hover:border-border/80",
				`animate-fade-up stagger-${Math.min(index + 1, 6)}`,
				className
			)}
		>
			<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors duration-300">
				<Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
			</div>
			<h3 className="mt-5 text-base font-semibold text-foreground">
				{title}
			</h3>
			<p className="mt-2 text-sm text-muted-foreground leading-relaxed">
				{description}
			</p>
		</div>
	);
}

// Bento grid item for larger, featured cards
interface BentoCardProps {
	icon: LucideIcon;
	title: string;
	description: string;
	className?: string;
	featured?: boolean;
	children?: React.ReactNode;
}

export function BentoCard({
	icon: Icon,
	title,
	description,
	className,
	featured = false,
	children,
}: BentoCardProps) {
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const cardRef = useRef<HTMLDivElement>(null);

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!cardRef.current) return;
		const rect = cardRef.current.getBoundingClientRect();
		setMousePosition({
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		});
	};

	return (
		<div
			ref={cardRef}
			onMouseMove={handleMouseMove}
			className={cn(
				"group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500",
				"hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5",
				featured && "md:col-span-2 md:row-span-2",
				className
			)}
		>
			{/* Spotlight effect */}
			<div
				className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
				style={{
					background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, oklch(0.55 0.28 295 / 0.08), transparent 40%)`,
				}}
			/>

			{/* Content */}
			<div className={cn("relative p-6", featured && "p-8")}>
				<div className={cn(
					"flex items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors duration-300",
					featured ? "h-14 w-14" : "h-12 w-12"
				)}>
					<Icon className={cn(
						"text-primary group-hover:scale-110 transition-transform duration-300",
						featured ? "h-7 w-7" : "h-6 w-6"
					)} />
				</div>

				<h3 className={cn(
					"mt-5 font-semibold text-foreground",
					featured ? "text-xl" : "text-base"
				)}>
					{title}
				</h3>

				<p className={cn(
					"mt-2 text-muted-foreground leading-relaxed",
					featured ? "text-base" : "text-sm"
				)}>
					{description}
				</p>

				{children && (
					<div className="mt-6">
						{children}
					</div>
				)}
			</div>

			{/* Corner accent */}
			<div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
		</div>
	);
}
