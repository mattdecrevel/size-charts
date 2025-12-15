"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log to Sentry
		Sentry.captureException(error);
	}, [error]);

	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
			<div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 mb-6">
				<AlertTriangle className="h-10 w-10 text-destructive" />
			</div>

			<h1 className="text-2xl font-bold text-foreground mb-2">
				Something went wrong
			</h1>

			<p className="text-muted-foreground max-w-md mb-2">
				An unexpected error occurred. Please try again or contact support if the
				problem persists.
			</p>

			{error.digest && (
				<p className="text-xs text-muted-foreground/60 mb-6 font-mono">
					Error ID: {error.digest}
				</p>
			)}

			<div className="flex flex-wrap items-center justify-center gap-3">
				<Button variant="outline" onClick={reset}>
					<RefreshCw className="h-4 w-4" />
					Try Again
				</Button>
				<Button asChild>
					<Link href="/">
						<Home className="h-4 w-4" />
						Home
					</Link>
				</Button>
			</div>
		</div>
	);
}
