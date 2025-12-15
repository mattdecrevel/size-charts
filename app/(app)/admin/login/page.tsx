"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, InputWithLabel } from "@/components/ui";
import { useExampleMode } from "@/hooks/use-example-mode";
import { Ruler, AlertCircle, Loader2, Info } from "lucide-react";

export default function AdminLoginPage() {
	const router = useRouter();
	const { isExampleMode } = useExampleMode();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	// Auto-fill example credentials
	const fillExampleCredentials = () => {
		setUsername("example");
		setPassword("example");
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			const response = await fetch("/api/admin/auth", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.error || "Login failed");
				setIsLoading(false);
				return;
			}

			// Redirect to admin dashboard
			router.push("/admin");
			router.refresh();
		} catch {
			setError("An error occurred. Please try again.");
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<div className="w-full max-w-sm">
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground mb-4">
						<Ruler className="w-6 h-6" />
					</div>
					<h1 className="text-2xl font-bold">Size Charts Admin</h1>
					<p className="text-muted-foreground mt-1">Sign in to continue</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					{isExampleMode && (
						<div className="rounded-lg border bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 p-3">
							<div className="flex items-start gap-2">
								<Info className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
								<div className="text-sm">
									<p className="font-medium text-amber-800 dark:text-amber-200">Example Mode</p>
									<p className="text-amber-700 dark:text-amber-300 mt-1">
										Use <button type="button" onClick={fillExampleCredentials} className="font-mono underline hover:no-underline">example / example</button> to log in.
										Data resets every 6 hours.
									</p>
								</div>
							</div>
						</div>
					)}

					{error && (
						<div className="rounded-lg border bg-destructive/10 border-destructive/20 p-3 flex items-center gap-2">
							<AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
							<p className="text-sm text-destructive">{error}</p>
						</div>
					)}

					<InputWithLabel
						label="Username"
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						placeholder="Enter username"
						autoComplete="username"
						disabled={isLoading}
						required
					/>

					<InputWithLabel
						label="Password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Enter password"
						autoComplete="current-password"
						disabled={isLoading}
						required
					/>

					<Button
						type="submit"
						className="w-full"
						disabled={isLoading || !username || !password}
					>
						{isLoading ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Signing in...
							</>
						) : (
							"Sign in"
						)}
					</Button>
				</form>

				<p className="text-xs text-center text-muted-foreground mt-6">
					Credentials are set via environment variables
				</p>
			</div>
		</div>
	);
}
