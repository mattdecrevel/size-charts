"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	Badge,
	Button,
	Input,
	Skeleton,
} from "@/components/ui";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui";
import {
	LayoutTemplate,
	Search,
	Shirt,
	Users,
	Footprints,
	Watch,
	Plus,
	Play,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface Template {
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

interface TemplateBrowserProps {
	/** When true, shows "Create Size Chart" action. When false, shows "Try in Demo" */
	allowCreate?: boolean;
	/** Called when user wants to create from template (admin mode) */
	onCreateFromTemplate?: (template: Template, variantKey?: string) => void;
	/** Show a compact grid without sidebar */
	compact?: boolean;
	/** Maximum templates to show (for preview mode) */
	limit?: number;
}

export function TemplateBrowser({
	allowCreate = false,
	onCreateFromTemplate,
	compact = false,
	limit,
}: TemplateBrowserProps) {
	const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
	const [selectedVariant, setSelectedVariant] = useState<string | undefined>();

	const { data, isLoading } = useQuery<{
		templates: Template[];
		categoryCounts: Record<string, number>;
	}>({
		queryKey: ["templates"],
		queryFn: async () => {
			const res = await fetch("/api/templates?includeCounts=true");
			if (!res.ok) throw new Error("Failed to fetch templates");
			return res.json();
		},
	});

	const templates = data?.templates || [];
	const categoryCounts = data?.categoryCounts || {};

	let filteredTemplates = templates.filter((t) => {
		const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
		const matchesSearch = !searchQuery ||
			t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
			t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
		return matchesCategory && matchesSearch;
	});

	if (limit) {
		filteredTemplates = filteredTemplates.slice(0, limit);
	}

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

	if (isLoading) {
		return (
			<div className={cn("grid gap-3", compact ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4")}>
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<Skeleton key={i} className="h-32" />
				))}
			</div>
		);
	}

	if (compact) {
		return (
			<>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{filteredTemplates.map((template) => (
						<button
							key={template.id}
							className="group text-left rounded-lg border bg-card p-4 transition-all hover:border-primary hover:shadow-sm flex flex-col"
							onClick={() => {
								setSelectedTemplate(template);
								setSelectedVariant(undefined);
							}}
						>
							<div className="flex items-center gap-3 mb-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
									{categoryIcons[template.category as CategoryFilter] || <LayoutTemplate className="h-4 w-4" />}
								</div>
								<div className="flex-1 min-w-0">
									<p className="font-medium text-sm leading-tight truncate">{template.name}</p>
									<p className="text-xs text-muted-foreground">
										{template.rows.length} sizes · {template.columns.length} cols
									</p>
								</div>
							</div>
							<p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
								{template.description}
							</p>
						</button>
					))}
				</div>

				<TemplateDialog
					template={selectedTemplate}
					selectedVariant={selectedVariant}
					onVariantChange={setSelectedVariant}
					onClose={() => setSelectedTemplate(null)}
					allowCreate={allowCreate}
					onCreateFromTemplate={onCreateFromTemplate}
					formatCellValue={formatCellValue}
					getPreviewRows={getPreviewRows}
					categoryIcons={categoryIcons}
				/>
			</>
		);
	}

	return (
		<div className="flex gap-6">
			{/* Sidebar - Category filter */}
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
			<div className="flex-1 min-w-0">
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

				{/* Template grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{filteredTemplates.map((template) => (
						<button
							key={template.id}
							className="group text-left rounded-lg border bg-card p-4 transition-all hover:border-primary hover:shadow-sm flex flex-col"
							onClick={() => {
								setSelectedTemplate(template);
								setSelectedVariant(undefined);
							}}
						>
							<div className="flex items-center gap-3 mb-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
									{categoryIcons[template.category as CategoryFilter] || <LayoutTemplate className="h-4 w-4" />}
								</div>
								<div className="flex-1 min-w-0">
									<p className="font-medium text-sm leading-tight truncate">{template.name}</p>
									<p className="text-xs text-muted-foreground">
										{template.rows.length} sizes · {template.columns.length} columns
										{template.variants && Object.keys(template.variants).length > 0 && ` · ${Object.keys(template.variants).length} variants`}
									</p>
								</div>
							</div>
							<p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
								{template.description}
							</p>
							<div className="flex flex-wrap gap-1">
								{template.tags.slice(0, 4).map((tag) => (
									<Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
										{tag}
									</Badge>
								))}
								{template.tags.length > 4 && (
									<Badge variant="secondary" className="text-[10px] px-1.5 py-0">
										+{template.tags.length - 4}
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

				<TemplateDialog
					template={selectedTemplate}
					selectedVariant={selectedVariant}
					onVariantChange={setSelectedVariant}
					onClose={() => setSelectedTemplate(null)}
					allowCreate={allowCreate}
					onCreateFromTemplate={onCreateFromTemplate}
					formatCellValue={formatCellValue}
					getPreviewRows={getPreviewRows}
					categoryIcons={categoryIcons}
				/>
			</div>
		</div>
	);
}

interface TemplateDialogProps {
	template: Template | null;
	selectedVariant: string | undefined;
	onVariantChange: (variant: string | undefined) => void;
	onClose: () => void;
	allowCreate: boolean;
	onCreateFromTemplate?: (template: Template, variantKey?: string) => void;
	formatCellValue: (value: unknown) => string;
	getPreviewRows: () => Array<Record<string, unknown>>;
	categoryIcons: Record<string, React.ReactNode>;
}

function TemplateDialog({
	template,
	selectedVariant,
	onVariantChange,
	onClose,
	allowCreate,
	onCreateFromTemplate,
	formatCellValue,
	getPreviewRows,
	categoryIcons,
}: TemplateDialogProps) {
	if (!template) return null;

	return (
		<Dialog open={!!template} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
							{categoryIcons[template.category] || <LayoutTemplate className="h-5 w-5" />}
						</div>
						<div>
							<DialogTitle>{template.name}</DialogTitle>
							<DialogDescription>{template.description}</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="flex-1 overflow-auto space-y-4 py-4">
					{/* Tags */}
					<div className="flex flex-wrap gap-1">
						{template.tags.map((tag) => (
							<Badge key={tag} variant="secondary" className="text-xs">
								{tag}
							</Badge>
						))}
					</div>

					{/* Variant selector */}
					{template.variants && Object.keys(template.variants).length > 0 && (
						<div>
							<p className="text-sm font-medium mb-2">Select Variant:</p>
							<div className="flex flex-wrap gap-2">
								<Button
									variant={selectedVariant === undefined ? "default" : "outline"}
									size="sm"
									onClick={() => onVariantChange(undefined)}
								>
									Default
								</Button>
								{Object.entries(template.variants).map(([key, variant]) => (
									<Button
										key={key}
										variant={selectedVariant === key ? "default" : "outline"}
										size="sm"
										onClick={() => onVariantChange(key)}
									>
										{variant.name}
									</Button>
								))}
							</div>
						</div>
					)}

					{/* Preview table */}
					<div>
						<p className="text-sm font-medium mb-2">Preview:</p>
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										{template.columns.map((col) => (
											<TableHead key={col.name} className="text-xs">
												{col.name}
											</TableHead>
										))}
									</TableRow>
								</TableHeader>
								<TableBody>
									{getPreviewRows().map((row, idx) => (
										<TableRow key={idx}>
											{template.columns.map((col) => (
												<TableCell key={col.name} className="text-xs py-2">
													{formatCellValue(row[col.name])}
												</TableCell>
											))}
										</TableRow>
									))}
								</TableBody>
							</Table>
							{((selectedVariant ? template.variants?.[selectedVariant]?.rows.length : template.rows.length) || 0) > 4 && (
								<p className="text-xs text-muted-foreground text-center py-2 border-t">
									+ {((selectedVariant ? template.variants?.[selectedVariant]?.rows.length : template.rows.length) || 0) - 4} more rows
								</p>
							)}
						</div>
					</div>

					{/* Template stats */}
					<div className="grid grid-cols-3 gap-4 text-sm">
						<div className="rounded-lg border p-3 text-center">
							<p className="text-2xl font-semibold text-primary">{template.columns.length}</p>
							<p className="text-xs text-muted-foreground">Columns</p>
						</div>
						<div className="rounded-lg border p-3 text-center">
							<p className="text-2xl font-semibold text-primary">
								{selectedVariant
									? template.variants?.[selectedVariant]?.rows.length
									: template.rows.length}
							</p>
							<p className="text-xs text-muted-foreground">Sizes</p>
						</div>
						<div className="rounded-lg border p-3 text-center">
							<p className="text-2xl font-semibold text-primary">
								{template.measurementInstructions.length}
							</p>
							<p className="text-xs text-muted-foreground">Instructions</p>
						</div>
					</div>
				</div>

				{/* Action button */}
				{allowCreate && onCreateFromTemplate ? (
					<Button
						onClick={() => onCreateFromTemplate(template, selectedVariant)}
						className="w-full"
					>
						<Plus className="h-4 w-4" />
						Create Size Chart from Template
					</Button>
				) : (
					<Button asChild className="w-full">
						<Link href="/admin">
							<Play className="h-4 w-4" />
							Try in Demo Mode
						</Link>
					</Button>
				)}
			</DialogContent>
		</Dialog>
	);
}
