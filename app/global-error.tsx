"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		Sentry.captureException(error);
	}, [error]);

	return (
		<html lang="en">
			<body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						minHeight: "100vh",
						textAlign: "center",
						padding: "1rem",
						backgroundColor: "#fafafa",
					}}
				>
					<div
						style={{
							width: "80px",
							height: "80px",
							borderRadius: "16px",
							backgroundColor: "#fee2e2",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							marginBottom: "24px",
						}}
					>
						<svg
							width="40"
							height="40"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#dc2626"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
							<path d="M12 9v4" />
							<path d="M12 17h.01" />
						</svg>
					</div>

					<h1
						style={{
							fontSize: "1.5rem",
							fontWeight: "bold",
							color: "#18181b",
							margin: "0 0 8px 0",
						}}
					>
						Something went wrong
					</h1>

					<p
						style={{
							color: "#71717a",
							maxWidth: "400px",
							margin: "0 0 8px 0",
						}}
					>
						A critical error occurred. Please refresh the page or try again
						later.
					</p>

					{error.digest && (
						<p
							style={{
								fontSize: "12px",
								color: "#a1a1aa",
								fontFamily: "monospace",
								margin: "0 0 24px 0",
							}}
						>
							Error ID: {error.digest}
						</p>
					)}

					<div style={{ display: "flex", gap: "12px" }}>
						<button
							onClick={reset}
							style={{
								padding: "10px 20px",
								fontSize: "14px",
								fontWeight: 500,
								border: "1px solid #e4e4e7",
								borderRadius: "8px",
								backgroundColor: "white",
								color: "#18181b",
								cursor: "pointer",
							}}
						>
							Try Again
						</button>
						<a
							href="/"
							style={{
								padding: "10px 20px",
								fontSize: "14px",
								fontWeight: 500,
								border: "none",
								borderRadius: "8px",
								backgroundColor: "#18181b",
								color: "white",
								textDecoration: "none",
								cursor: "pointer",
							}}
						>
							Home
						</a>
					</div>
				</div>
			</body>
		</html>
	);
}
