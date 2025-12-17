"use client";

import { useState, useEffect, useCallback } from "react";
import {
	isDemoSizeChartSlug,
	isDemoCategorySlug,
	isDemoSubcategorySlug,
} from "@/lib/demo-slugs";

interface DemoModeState {
	isDemoMode: boolean;
	isLoading: boolean;
	isProtectedSizeChartSlug: (slug: string) => boolean;
	isProtectedCategorySlug: (slug: string) => boolean;
	isProtectedSubcategorySlug: (categorySlug: string, subcategorySlug: string) => boolean;
}

export function useDemoMode(): DemoModeState {
	const [isDemoMode, setIsDemoMode] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function checkDemoMode() {
			try {
				const response = await fetch("/api/admin/demo-reset");
				const data = await response.json();
				setIsDemoMode(data.demo_mode === true);
			} catch {
				setIsDemoMode(false);
			} finally {
				setIsLoading(false);
			}
		}

		checkDemoMode();
	}, []);

	const isProtectedSizeChartSlug = useCallback(
		(slug: string) => {
			return isDemoMode && isDemoSizeChartSlug(slug);
		},
		[isDemoMode]
	);

	const isProtectedCategorySlug = useCallback(
		(slug: string) => {
			return isDemoMode && isDemoCategorySlug(slug);
		},
		[isDemoMode]
	);

	const isProtectedSubcategorySlug = useCallback(
		(categorySlug: string, subcategorySlug: string) => {
			return isDemoMode && isDemoSubcategorySlug(categorySlug, subcategorySlug);
		},
		[isDemoMode]
	);

	return {
		isDemoMode,
		isLoading,
		isProtectedSizeChartSlug,
		isProtectedCategorySlug,
		isProtectedSubcategorySlug,
	};
}
