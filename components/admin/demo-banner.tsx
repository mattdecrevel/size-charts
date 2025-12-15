import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface DemoBannerProps {
	className?: string;
}

export function DemoBanner({ className }: DemoBannerProps) {
	return (
		<div
			className={`w-full bg-gradient-to-r from-primary via-[oklch(0.58_0.28_305)] to-accent shadow-[0_2px_12px_oklch(0.55_0.28_295_/_0.35)] px-4 py-2.5 ${className}`}
		>
			<div className="flex items-center justify-between gap-4 text-sm max-w-7xl mx-auto">
				<span className="font-semibold text-white tracking-wide">
					Demo Mode
				</span>
				<Link
					href="https://github.com/mattdecrevel/size-charts"
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-1.5 text-white/90 hover:text-white font-medium transition-colors whitespace-nowrap"
				>
					Fork on GitHub
					<ExternalLink className="h-3.5 w-3.5" />
				</Link>
			</div>
		</div>
	);
}
