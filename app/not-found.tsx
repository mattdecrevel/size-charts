"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	const router = useRouter();

	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
			<div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted mb-6">
				<FileQuestion className="h-10 w-10 text-muted-foreground" />
			</div>

			<h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
			<h2 className="text-xl font-semibold text-foreground mb-4">
				Page Not Found
			</h2>

			<p className="text-muted-foreground max-w-md mb-8">
				The page you&apos;re looking for doesn&apos;t exist or has been moved.
				Check the URL or navigate back to a known page.
			</p>

			<div className="flex flex-wrap items-center justify-center gap-3">
				<Button variant="outline" onClick={() => router.back()}>
					<ArrowLeft className="h-4 w-4" />
					Go Back
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
