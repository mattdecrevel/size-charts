"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, FileText, Ruler, Menu, X, LayoutTemplate, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navLinks = [
	{ name: "Size Guide", href: "/size-guide", icon: Ruler },
	{ name: "Templates", href: "/templates", icon: LayoutTemplate },
	{ name: "Examples", href: "/examples", icon: Code2 },
	{ name: "Docs", href: "/docs", icon: FileText },
];

function GitHubIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="currentColor">
			<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
		</svg>
	);
}

function NavItem({
	href,
	name,
	icon: Icon,
	isActive,
	compact = false
}: {
	href: string;
	name: string;
	icon: typeof Code2;
	isActive: boolean;
	compact?: boolean;
}) {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<Link
			href={href}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className={cn(
				"relative flex items-center text-sm font-medium rounded-xl transition-all duration-300",
				compact ? "gap-0 px-3 py-1.5" : "gap-2 px-4 py-2",
				isActive
					? "text-primary"
					: "text-muted-foreground hover:text-foreground"
			)}
		>
			{/* Animated background pill */}
			<span
				className={cn(
					"absolute inset-0 rounded-xl transition-all duration-300",
					isActive
						? "bg-primary/10 scale-100"
						: isHovered
							? "bg-muted/60 scale-100"
							: "bg-transparent scale-95 opacity-0"
				)}
			/>

			{/* Glow effect on hover */}
			{isHovered && !isActive && (
				<span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 blur-sm" />
			)}

			{!compact && (
				<Icon className={cn(
					"relative h-4 w-4 transition-transform duration-300",
					isHovered && "scale-110"
				)} />
			)}
			<span className="relative">{name}</span>
		</Link>
	);
}

export function FloatingHeader({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [hidden, setHidden] = useState(false);
	const lastScrollY = useRef(0);

	// Scroll behavior: hide on scroll down, show on scroll up
	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;

			// Determine if we've scrolled past threshold
			setScrolled(currentScrollY > 20);

			// Hide/show based on scroll direction
			if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
				setHidden(true);
			} else {
				setHidden(false);
			}

			lastScrollY.current = currentScrollY;
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const isActive = (href: string) => {
		if (href === "/docs") return pathname.startsWith("/docs");
		if (href === "/examples") return pathname.startsWith("/examples");
		if (href === "/size-guide") return pathname.startsWith("/size-guide");
		if (href === "/templates") return pathname.startsWith("/templates");
		return pathname === href;
	};

	const handleNavClick = () => {
		setMobileMenuOpen(false);
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Ambient background effects */}
			<div className="fixed inset-0 hero-glow pointer-events-none" aria-hidden="true" />

			{/* Noise texture overlay */}
			<div className="fixed inset-0 noise-overlay pointer-events-none opacity-[0.015] dark:opacity-[0.03]" aria-hidden="true" />

			{/* Floating Header */}
			<header
				className={cn(
					"fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
					hidden ? "-translate-y-full" : "translate-y-0"
				)}
			>
				<div className={cn(
					"mx-auto transition-all duration-500",
					scrolled
						? "max-w-4xl mt-3 px-2"
						: "max-w-6xl mt-0 px-4 sm:px-6"
				)}>
					<div className={cn(
						"relative flex h-16 items-center justify-between transition-all duration-500",
						scrolled
							? "bg-background/70 backdrop-blur-xl rounded-2xl border border-border/50 shadow-lg shadow-black/5 dark:shadow-black/20 px-4"
							: "bg-transparent px-0"
					)}>
						{/* Spotlight glow when scrolled */}
						{scrolled && (
							<div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
								<div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-32 bg-primary/10 blur-3xl" />
							</div>
						)}

						{/* Logo & Nav */}
						<div className={cn(
							"relative flex items-center transition-all duration-300",
							scrolled ? "gap-2" : "gap-6 lg:gap-8"
						)}>
							<Link href="/" className="flex items-center gap-2.5 group">
								<div className={cn(
									"relative flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/25",
									scrolled ? "h-8 w-8" : "h-9 w-9"
								)}>
									<Ruler className={cn(
										"text-primary-foreground transition-all duration-300",
										scrolled ? "h-4 w-4" : "h-5 w-5"
									)} />
									{/* Logo glow */}
									<div className="absolute inset-0 rounded-xl bg-primary/50 blur-md opacity-0 group-hover:opacity-50 transition-opacity" />
								</div>
								<span className={cn(
									"font-semibold text-foreground tracking-tight transition-all duration-300",
									scrolled ? "hidden" : "text-lg"
								)}>
									Size Charts
								</span>
							</Link>

							{/* Desktop Nav */}
							<nav className="hidden md:flex items-center gap-1">
								{navLinks.map((link) => (
									<NavItem
										key={link.href}
										href={link.href}
										name={link.name}
										icon={link.icon}
										isActive={isActive(link.href)}
										compact={scrolled}
									/>
								))}
							</nav>
						</div>

						{/* Right side actions */}
						<div className="relative flex items-center gap-2">
							{/* Theme Toggle */}
							<ThemeToggle />

							{/* GitHub Icon */}
							<a
								href="https://github.com/mattdecrevel/size-charts"
								target="_blank"
								rel="noopener noreferrer"
								className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 hover:scale-105"
								aria-label="GitHub"
							>
								<GitHubIcon className="h-5 w-5" />
							</a>

							{/* Demo CTA Button - Enhanced */}
							<Link
								href="/admin"
								className={cn(
									"hidden sm:inline-flex items-center gap-2 font-medium rounded-xl transition-all duration-300",
									"bg-gradient-to-r from-primary to-primary/90 text-primary-foreground",
									"hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]",
									"group overflow-hidden relative",
									scrolled ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-sm"
								)}
							>
								{/* Shimmer effect */}
								<span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

								<Sparkles className="h-4 w-4 relative" />
								<span className="relative">Try Demo</span>
							</Link>

							{/* Mobile menu button */}
							<button
								onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
								className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300"
								aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
							>
								{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* Mobile Menu Overlay */}
			{mobileMenuOpen && (
				<div className="fixed inset-0 z-40 md:hidden">
					{/* Backdrop with blur */}
					<div
						className="absolute inset-0 bg-background/90 backdrop-blur-xl"
						onClick={() => setMobileMenuOpen(false)}
					/>

					{/* Menu content with staggered animations */}
					<nav className="relative z-10 flex flex-col items-center justify-center h-full gap-3 p-6">
						{navLinks.map((link, index) => (
							<Link
								key={link.href}
								href={link.href}
								onClick={handleNavClick}
								className={cn(
									"flex items-center gap-3 px-8 py-4 text-lg font-medium rounded-2xl w-full max-w-xs transition-all duration-300",
									"animate-fade-up",
									isActive(link.href)
										? "text-primary bg-primary/10"
										: "text-foreground hover:bg-muted/50"
								)}
								style={{ animationDelay: `${index * 50}ms` }}
							>
								<link.icon className="h-5 w-5" />
								{link.name}
							</Link>
						))}

						{/* Demo button in mobile menu */}
						<Link
							href="/admin"
							onClick={handleNavClick}
							className="flex items-center gap-3 px-8 py-4 text-lg font-medium rounded-2xl w-full max-w-xs bg-gradient-to-r from-primary to-primary/90 text-primary-foreground animate-fade-up"
							style={{ animationDelay: `${navLinks.length * 50}ms` }}
						>
							<Sparkles className="h-5 w-5" />
							Try Demo
						</Link>

						{/* GitHub link in mobile menu */}
						<a
							href="https://github.com/mattdecrevel/size-charts"
							target="_blank"
							rel="noopener noreferrer"
							onClick={handleNavClick}
							className="flex items-center gap-3 px-8 py-4 text-lg font-medium rounded-2xl w-full max-w-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors animate-fade-up"
							style={{ animationDelay: `${(navLinks.length + 1) * 50}ms` }}
						>
							<GitHubIcon className="h-5 w-5" />
							GitHub
						</a>
					</nav>
				</div>
			)}

			{/* Main Content */}
			<main className="relative pt-20 sm:pt-24 pb-10 sm:pb-14 max-w-6xl mx-auto px-4 sm:px-6">
				{children}
			</main>

			{/* Footer */}
			<footer className="relative border-t border-border/40 mt-20">
				<div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Ruler className="h-4 w-4" />
							<span>Size Charts API</span>
						</div>
						<div className="flex items-center gap-6 text-sm text-muted-foreground">
							<Link href="/size-guide" className="hover:text-foreground transition-colors">
								Size Guide
							</Link>
							<Link href="/templates" className="hover:text-foreground transition-colors">
								Templates
							</Link>
							<Link href="/docs" className="hover:text-foreground transition-colors">
								Docs
							</Link>
							<Link href="/examples" className="hover:text-foreground transition-colors">
								Examples
							</Link>
							<a
								href="https://github.com/mattdecrevel/size-charts"
								target="_blank"
								rel="noopener noreferrer"
								className="hover:text-foreground transition-colors"
							>
								GitHub
							</a>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
