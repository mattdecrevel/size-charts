"use client";

import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui";
import { Button, Badge, Input, Skeleton } from "@/components/ui";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui";
import { LayoutTemplate, Search, Shirt, Users, Footprints, Watch, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Template {
	id: string;
	name: string;
	description: string;
	category: string;
	tags: string[];
	suggestedCategories: string[];
	measurementInstructions: string[];
	columns: Array<{ name: string; type: string }>;
	rows: Array<Record<string, unknown>>;
	variants?: Record<string, { name: string; description: string; rows: Array<Record<string, unknown>> }>;
}

interface TemplatePickerProps {
	onSelect: (template: Template, variantKey?: string) => void;
	trigger?: React.ReactNode;
}

type CategoryFilter = "all" | "apparel" | "youth" | "footwear" | "accessories";

const categoryIcons: Record<CategoryFilter, React.ReactNode> = {
	all: <LayoutTemplate className="h-4 w-4" />,
	apparel: <Shirt className="h-4 w-4" />,
	youth: <Users className="h-4 w-4" />,
	footwear: <Footprints className="h-4 w-4" />,
	accessories: <Watch className="h-4 w-4" />,
};

const categoryLabels: Record<CategoryFilter, string> = {
	all: "All Templates",
	apparel: "Apparel",
	youth: "Youth",
	footwear: "Footwear",
	accessories: "Accessories",
};

export function TemplatePicker({ onSelect, trigger }: TemplatePickerProps) {
	const [open, setOpen] = useState(false);
	const [templates, setTemplates] = useState<Template[]>([]);
	const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
	const [loading, setLoading] = useState(true);
	const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
	const [selectedVariant, setSelectedVariant] = useState<string | undefined>();

	useEffect(() => {
		if (open) {
			fetchTemplates();
		}
	}, [open]);

	const fetchTemplates = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/templates?includeCounts=true");
			const data = await response.json();
			setTemplates(data.templates);
			setCategoryCounts(data.categoryCounts || {});
		} catch (error) {
			console.error("Failed to fetch templates:", error);
		} finally {
			setLoading(false);
		}
	};

	const filteredTemplates = templates.filter((t) => {
		const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
		const matchesSearch = !searchQuery ||
			t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
			t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
		return matchesCategory && matchesSearch;
	});

	const handleSelectTemplate = (template: Template) => {
		setSelectedTemplate(template);
		setSelectedVariant(undefined);
	};

	const handleConfirm = () => {
		if (selectedTemplate) {
			onSelect(selectedTemplate, selectedVariant);
			setOpen(false);
			setSelectedTemplate(null);
			setSelectedVariant(undefined);
		}
	};

	const formatCellValue = (value: unknown): string => {
		if (typeof value === "string") return value;
		if (typeof value === "object" && value !== null) {
			if ("min" in value && "max" in value) {
				return `${(value as { min: number; max: number }).min}-${(value as { min: number; max: number }).max}"`;
			}
			if ("value" in value) {
				return `${(value as { value: number }).value}"`;
			}
		}
		return String(value);
	};

	const getPreviewRows = () => {
		if (!selectedTemplate) return [];
		if (selectedVariant && selectedTemplate.variants?.[selectedVariant]) {
			return selectedTemplate.variants[selectedVariant].rows.slice(0, 4);
		}
		return selectedTemplate.rows.slice(0, 4);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="outline">
						<LayoutTemplate className="h-4 w-4" />
						Start from Template
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="w-[95vw] max-w-[900px] md:max-w-[1100px] lg:max-w-[1300px] max-h-[90vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle>Choose a Template</DialogTitle>
					<DialogDescription>
						Select a template to quickly create a new size chart with pre-configured columns and sample data.
					</DialogDescription>
				</DialogHeader>

				<div className="flex gap-4 flex-1 min-h-0">
					{/* Left sidebar - Category filter (hidden on mobile) */}
					<div className="hidden md:block w-48 flex-shrink-0 space-y-1">
						{(Object.keys(categoryLabels) as CategoryFilter[]).map((cat) => (
							<button
								key={cat}
								onClick={() => setSelectedCategory(cat)}
								className={cn(
									"w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
									selectedCategory === cat
										? "bg-primary text-primary-foreground"
										: "hover:bg-muted"
								)}
							>
								{categoryIcons[cat]}
								<span className="flex-1 text-left">{categoryLabels[cat]}</span>
								{cat !== "all" && categoryCounts[cat] !== undefined && (
									<span className="text-xs opacity-70">{categoryCounts[cat]}</span>
								)}
							</button>
						))}
					</div>

					{/* Main content */}
					<div className="flex-1 min-w-0 flex flex-col">
						{/* Mobile category filter */}
						<div className="flex md:hidden gap-2 mb-4 overflow-x-auto pb-2">
							{(Object.keys(categoryLabels) as CategoryFilter[]).map((cat) => (
								<button
									key={cat}
									onClick={() => setSelectedCategory(cat)}
									className={cn(
										"flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors",
										selectedCategory === cat
											? "bg-primary text-primary-foreground"
											: "bg-muted hover:bg-muted/80"
									)}
								>
									{categoryIcons[cat]}
									<span>{categoryLabels[cat]}</span>
								</button>
							))}
						</div>

						{/* Search */}
						<div className="relative mb-4">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search templates..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9"
							/>
						</div>

						{/* Template list or detail view */}
						<div className="flex-1 overflow-auto">
							{loading ? (
								<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
									{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
										<Skeleton key={i} className="h-20" />
									))}
								</div>
							) : selectedTemplate ? (
								<div className="space-y-4">
									{/* Back button */}
									<button
										onClick={() => setSelectedTemplate(null)}
										className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
									>
										<X className="h-4 w-4" />
										Back to templates
									</button>

									{/* Template detail */}
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
											{categoryIcons[selectedTemplate.category as CategoryFilter] || <LayoutTemplate className="h-5 w-5" />}
										</div>
										<div>
											<h3 className="font-semibold">{selectedTemplate.name}</h3>
											<p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
										</div>
									</div>

									{/* Variant selector */}
									{selectedTemplate.variants && Object.keys(selectedTemplate.variants).length > 0 && (
										<div>
											<p className="text-sm font-medium mb-2">Select Variant:</p>
											<div className="flex flex-wrap gap-2">
												<Button
													variant={selectedVariant === undefined ? "default" : "outline"}
													size="sm"
													onClick={() => setSelectedVariant(undefined)}
												>
													Default
												</Button>
												{Object.entries(selectedTemplate.variants).map(([key, variant]) => (
													<Button
														key={key}
														variant={selectedVariant === key ? "default" : "outline"}
														size="sm"
														onClick={() => setSelectedVariant(key)}
													>
														{variant.name}
													</Button>
												))}
											</div>
										</div>
									)}

									{/* Preview table */}
									<div className="rounded-md border">
										<Table>
											<TableHeader>
												<TableRow>
													{selectedTemplate.columns.map((col) => (
														<TableHead key={col.name} className="text-xs">
															{col.name}
														</TableHead>
													))}
												</TableRow>
											</TableHeader>
											<TableBody>
												{getPreviewRows().map((row, idx) => (
													<TableRow key={idx}>
														{selectedTemplate.columns.map((col) => (
															<TableCell key={col.name} className="text-xs py-2">
																{formatCellValue(row[col.name])}
															</TableCell>
														))}
													</TableRow>
												))}
											</TableBody>
										</Table>
										{((selectedVariant ? selectedTemplate.variants?.[selectedVariant]?.rows.length : selectedTemplate.rows.length) || 0) > 4 && (
											<p className="text-xs text-muted-foreground text-center py-2 border-t">
												+ {((selectedVariant ? selectedTemplate.variants?.[selectedVariant]?.rows.length : selectedTemplate.rows.length) || 0) - 4} more rows
											</p>
										)}
									</div>

									{/* Use template button */}
									<Button onClick={handleConfirm} className="w-full">
										Use This Template
										<ChevronRight className="h-4 w-4" />
									</Button>
								</div>
							) : (
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
									{filteredTemplates.map((template) => (
										<button
											key={template.id}
											className="group text-left rounded-lg border bg-card p-3 transition-all hover:border-primary hover:shadow-sm"
											onClick={() => handleSelectTemplate(template)}
										>
											<div className="flex items-center gap-2.5 mb-2">
												<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
													{categoryIcons[template.category as CategoryFilter] || <LayoutTemplate className="h-4 w-4" />}
												</div>
												<div className="flex-1 min-w-0">
													<p className="font-medium text-sm leading-tight truncate">{template.name}</p>
													<p className="text-xs text-muted-foreground">
														{template.rows.length} sizes · {template.columns.length} cols
														{template.variants && ` · ${Object.keys(template.variants).length} var`}
													</p>
												</div>
												<ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
											</div>
											<p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-2">
												{template.description}
											</p>
											<div className="flex flex-wrap gap-1">
												{template.tags.slice(0, 3).map((tag) => (
													<Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
														{tag}
													</Badge>
												))}
												{template.tags.length > 3 && (
													<Badge variant="secondary" className="text-[10px] px-1.5 py-0">
														+{template.tags.length - 3}
													</Badge>
												)}
											</div>
										</button>
									))}
									{filteredTemplates.length === 0 && (
										<div className="col-span-full text-center py-8 text-muted-foreground">
											No templates found matching your criteria.
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
