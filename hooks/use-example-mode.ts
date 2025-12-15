"use client";

import { useState, useEffect } from "react";

export function useExampleMode() {
	const [isExampleMode, setIsExampleMode] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function checkExampleMode() {
			try {
				const response = await fetch("/api/admin/example-reset");
				const data = await response.json();
				setIsExampleMode(data.example_mode === true);
			} catch {
				setIsExampleMode(false);
			} finally {
				setIsLoading(false);
			}
		}

		checkExampleMode();
	}, []);

	return { isExampleMode, isLoading };
}
