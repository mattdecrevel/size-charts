"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Code2, FileText, Ruler, Menu, X } from "lucide-react";

const navLinks = [
	{ name: "Demo", href: "/demo", icon: Code2 },
	{ name: "Docs", href: "/docs", icon: FileText },
	{ name: "Admin", href: "/admin", icon: Settings },
];

// GitHub icon as inline SVG
function GitHubIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="currentColor">
			<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
		</svg>
	);
}

function NavLink({ href, name, icon: Icon, isActive }: { href: string; name: string; icon: typeof Code2; isActive: boolean }) {
	return (
		<Link
			href={href}
			className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
				? "text-primary bg-primary/10"
				: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
				}`}
		>
			<Icon className="h-4 w-4" />
			{name}
		</Link>
	);
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const isActive = (href: string) => {
		if (href === "/admin") return pathname.startsWith("/admin");
		if (href === "/docs") return pathname.startsWith("/docs");
		if (href === "/demo") return pathname.startsWith("/demo");
		return pathname === href;
	};

	const handleNavClick = () => {
		setMobileMenuOpen(false);
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Subtle background glow */}
			<div className="fixed inset-0 hero-glow pointer-events-none" aria-hidden="true" />

			{/* Header */}
			<header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
				<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
					{/* Logo & Nav */}
					<div className="flex items-center gap-8">
						<Link href="/" className="flex items-center gap-2.5 group">
							<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-soft group-hover:shadow-soft-md transition-shadow">
								<Ruler className="h-5 w-5 text-primary-foreground" />
							</div>
							<span className="text-lg font-semibold text-foreground tracking-tight">
								Size Charts
							</span>
						</Link>

						{/* Desktop Nav */}
						<nav className="hidden md:flex items-center gap-1">
							{navLinks.map((link) => (
								<NavLink
									key={link.href}
									href={link.href}
									name={link.name}
									icon={link.icon}
									isActive={isActive(link.href)}
								/>
							))}
						</nav>
					</div>

					{/* Right side actions */}
					<div className="flex items-center gap-2">
						{/* GitHub Icon - hidden on mobile when menu is open */}
						<a
							href="https://github.com/mattdecrevel/size-charts"
							target="_blank"
							rel="noopener noreferrer"
							className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
							aria-label="GitHub"
						>
							<GitHubIcon className="h-5 w-5" />
						</a>

						{/* Mobile menu button */}
						<button
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
							aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
						>
							{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
						</button>
					</div>
				</div>
			</header>

			{/* Mobile Menu Overlay */}
			{mobileMenuOpen && (
				<div className="fixed inset-0 z-40 md:hidden">
					{/* Backdrop */}
					<div
						className="absolute inset-0 bg-background/95 backdrop-blur-sm"
						onClick={() => setMobileMenuOpen(false)}
					/>

					{/* Menu content */}
					<nav className="relative z-10 flex flex-col items-center justify-center h-full gap-2 p-6">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								onClick={handleNavClick}
								className={`flex items-center gap-3 px-6 py-4 text-lg font-medium rounded-xl w-full max-w-xs transition-colors ${isActive(link.href)
									? "text-primary bg-primary/10"
									: "text-foreground hover:bg-muted/50"
									}`}
							>
								<link.icon className="h-5 w-5" />
								{link.name}
							</Link>
						))}

						{/* GitHub link in mobile menu */}
						<a
							href="https://github.com/mattdecrevel/size-charts"
							target="_blank"
							rel="noopener noreferrer"
							onClick={handleNavClick}
							className="flex items-center gap-3 px-6 py-4 text-lg font-medium rounded-xl w-full max-w-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
						>
							<GitHubIcon className="h-5 w-5" />
							GitHub
						</a>
					</nav>
				</div>
			)}

			{/* Main Content */}
			<main className="relative mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
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
							<Link href="/docs" className="hover:text-foreground transition-colors">
								Docs
							</Link>
							<Link href="/demo" className="hover:text-foreground transition-colors">
								Demo
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
