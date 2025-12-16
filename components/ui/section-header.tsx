"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface SectionHeaderProps {
	title: string;
	subtitle?: string;
	align?: "left" | "center";
	variant?: "default" | "lamp" | "spotlight" | "gradient-line";
	className?: string;
	action?: React.ReactNode;
}

function useInView(threshold = 0.1) {
	const ref = useRef<HTMLDivElement>(null);
	const [inView, setInView] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setInView(true);
					observer.disconnect();
				}
			},
			{ threshold }
		);

		if (ref.current) {
			observer.observe(ref.current);
		}

		return () => observer.disconnect();
	}, [threshold]);

	return { ref, inView };
}

export function SectionHeader({
	title,
	subtitle,
	align = "left",
	variant = "default",
	className,
	action,
}: SectionHeaderProps) {
	const { ref, inView } = useInView();

	if (variant === "lamp") {
		return (
			<div ref={ref} className={cn("relative mb-12", className)}>
				{/* Lamp effect container */}
				<div className={cn(
					"relative flex flex-col",
					align === "center" ? "items-center" : "items-start"
				)}>
					{/* The lamp beam */}
					<div
						className={cn(
							"h-px bg-gradient-to-r from-transparent via-primary to-transparent mb-6 transition-all duration-700 ease-out",
							inView ? "opacity-100" : "opacity-0",
							align === "center" ? "w-96" : "w-64"
						)}
						style={{
							transform: inView ? "scaleX(1)" : "scaleX(0)",
							transformOrigin: align === "center" ? "center" : "left"
						}}
					/>

					{/* Glow orb */}
					<div
						className={cn(
							"absolute -top-4 transition-all duration-500 delay-200",
							align === "center" ? "left-1/2 -translate-x-1/2" : "left-0",
							inView ? "opacity-100 scale-100" : "opacity-0 scale-75"
						)}
					>
						<div className="w-32 h-16 bg-primary/20 rounded-full blur-2xl" />
					</div>

					{/* Title with reveal animation */}
					<div
						className={cn(
							"flex items-center gap-4 w-full transition-all duration-500 delay-300",
							align === "center" ? "justify-center" : "justify-between",
							inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
						)}
					>
						<h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
							{title}
						</h2>
						{action && align === "left" && action}
					</div>

					{subtitle && (
						<p
							className={cn(
								"mt-3 text-muted-foreground max-w-2xl transition-all duration-500 delay-[400ms]",
								align === "center" && "text-center",
								inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
							)}
						>
							{subtitle}
						</p>
					)}

					{action && align === "center" && (
						<div
							className={cn(
								"mt-4 transition-all duration-500 delay-500",
								inView ? "opacity-100" : "opacity-0"
							)}
						>
							{action}
						</div>
					)}
				</div>
			</div>
		);
	}

	if (variant === "spotlight") {
		return (
			<div ref={ref} className={cn("relative mb-12 overflow-hidden", className)}>
				{/* Spotlight cone effect */}
				<div
					className={cn(
						"absolute -top-20 w-[500px] h-[300px] pointer-events-none transition-opacity duration-700",
						align === "center" ? "left-1/2 -translate-x-1/2" : "-left-20",
						inView ? "opacity-100" : "opacity-0"
					)}
				>
					<div className="absolute inset-0 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent spotlight-cone"
						style={{
							clipPath: align === "center"
								? "polygon(40% 0%, 60% 0%, 80% 100%, 20% 100%)"
								: "polygon(20% 0%, 50% 0%, 70% 100%, 0% 100%)"
						}}
					/>
				</div>

				<div
					className={cn(
						"relative flex flex-col transition-all duration-600",
						align === "center" ? "items-center text-center" : "items-start",
						inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
					)}
				>
					<h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
						{title}
					</h2>
					{subtitle && (
						<p className="mt-3 text-muted-foreground max-w-2xl">
							{subtitle}
						</p>
					)}
					{action && <div className="mt-4">{action}</div>}
				</div>
			</div>
		);
	}

	if (variant === "gradient-line") {
		return (
			<div ref={ref} className={cn("mb-10", className)}>
				<div className={cn(
					"flex items-center gap-4",
					align === "center" ? "justify-center" : "justify-between"
				)}>
					{align === "center" && (
						<div
							className={cn(
								"flex-1 h-px bg-gradient-to-r from-transparent to-border max-w-32 transition-transform duration-600 origin-right",
								inView ? "scale-x-100" : "scale-x-0"
							)}
						/>
					)}

					<h2
						className={cn(
							"text-2xl font-semibold text-foreground shrink-0 transition-all duration-500",
							inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
						)}
					>
						{title}
					</h2>

					<div
						className={cn(
							"flex-1 h-px bg-gradient-to-r from-border to-transparent origin-left transition-transform duration-600 delay-100",
							align === "center" && "max-w-32",
							inView ? "scale-x-100" : "scale-x-0"
						)}
					/>

					{action && align === "left" && (
						<div
							className={cn(
								"transition-all duration-500 delay-200",
								inView ? "opacity-100" : "opacity-0"
							)}
						>
							{action}
						</div>
					)}
				</div>

				{subtitle && (
					<p
						className={cn(
							"mt-3 text-muted-foreground transition-all duration-500 delay-200",
							align === "center" && "text-center",
							inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
						)}
					>
						{subtitle}
					</p>
				)}
			</div>
		);
	}

	// Default variant
	return (
		<div ref={ref} className={cn("mb-10", className)}>
			<div className={cn(
				"flex items-center gap-4",
				align === "center" ? "flex-col" : "justify-between"
			)}>
				<h2
					className={cn(
						"text-2xl font-semibold text-foreground transition-all duration-500",
						inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
					)}
				>
					{title}
				</h2>

				{align === "left" && (
					<div
						className={cn(
							"flex-1 h-px bg-gradient-to-r from-border to-transparent origin-left transition-transform duration-600",
							inView ? "scale-x-100" : "scale-x-0"
						)}
					/>
				)}

				{action}
			</div>

			{subtitle && (
				<p
					className={cn(
						"mt-3 text-muted-foreground transition-all duration-500 delay-100",
						align === "center" && "text-center",
						inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
					)}
				>
					{subtitle}
				</p>
			)}
		</div>
	);
}
