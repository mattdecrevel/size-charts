"use client";

import { useState, useEffect } from "react";
import {
	Button,
	InputWithLabel,
	SelectWithLabel,
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui";
import { COLUMN_TYPES, LABEL_TYPES } from "@/lib/constants";
import { useLabelTypeConfigs } from "@/hooks/use-labels";
import { Trash2, Settings } from "lucide-react";
import type { EditorColumn } from "./types";
import type { ColumnType, LabelType } from "@prisma/client";

interface ColumnConfigProps {
	column: EditorColumn;
	onUpdate: (column: EditorColumn) => void;
	onDelete: () => void;
	canDelete: boolean;
}

export function ColumnConfig({ column, onUpdate, onDelete, canDelete }: ColumnConfigProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [name, setName] = useState(column.name);
	const [columnType, setColumnType] = useState<ColumnType>(column.columnType);
	const [labelType, setLabelType] = useState<LabelType | "">(column.labelType || "");

	const { data: labelTypeConfigs } = useLabelTypeConfigs();

	// Helper to get label type display name
	const getLabelTypeName = (type: string) => {
		const custom = labelTypeConfigs?.find((c) => c.labelType === type);
		return custom?.displayName ?? LABEL_TYPES.find((lt) => lt.value === type)?.label ?? type;
	};

	// Reset labelType when column type changes away from SIZE_LABEL
	useEffect(() => {
		if (columnType !== "SIZE_LABEL") {
			setLabelType("");
		}
	}, [columnType]);

	// Sync state when dialog opens
	useEffect(() => {
		if (isOpen) {
			setName(column.name);
			setColumnType(column.columnType);
			setLabelType(column.labelType || "");
		}
	}, [isOpen, column]);

	const handleSave = () => {
		onUpdate({
			...column,
			name,
			columnType,
			labelType: columnType === "SIZE_LABEL" && labelType ? labelType : null,
		});
		setIsOpen(false);
	};

	const showsLabelType = columnType === "SIZE_LABEL";

	return (
		<>
			<div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
				<div className="flex flex-col min-w-0">
					<span className="font-medium text-sm truncate">
						{column.name}
					</span>
					{column.labelType && (
						<span className="text-xs text-muted-foreground truncate">
							{getLabelTypeName(column.labelType)}
						</span>
					)}
				</div>
				<button
					onClick={() => setIsOpen(true)}
					className="p-1 rounded hover:bg-accent flex-shrink-0"
					title="Configure column"
				>
					<Settings className="h-3.5 w-3.5 text-muted-foreground" />
				</button>
			</div>

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Configure Column</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<InputWithLabel
							label="Column Name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g., Waist, Size, US"
						/>

						<SelectWithLabel
							label="Column Type"
							options={COLUMN_TYPES.map((t) => ({
								value: t.value,
								label: `${t.label} - ${t.description}`,
							}))}
							value={columnType}
							onChange={(e) => setColumnType(e.target.value as ColumnType)}
						/>

						{showsLabelType && (
							<SelectWithLabel
								label="Label Type"
								options={[
									{ value: "", label: "All Labels (no filter)" },
									...(labelTypeConfigs || LABEL_TYPES.map((lt) => ({ labelType: lt.value, displayName: lt.label, description: lt.description }))).map((c) => {
										const defaultDesc = LABEL_TYPES.find((t) => t.value === c.labelType)?.description;
										return {
											value: c.labelType,
											label: `${c.displayName} - ${c.description || defaultDesc || ""}`,
										};
									}),
								]}
								value={labelType}
								onChange={(e) => setLabelType(e.target.value as LabelType | "")}
							/>
						)}
						{showsLabelType && (
							<p className="text-xs text-muted-foreground">
								Selecting a label type will filter the dropdown options when editing cells in this column.
							</p>
						)}
					</div>

					<DialogFooter>
						{canDelete && (
							<Button
								variant="destructive"
								onClick={() => {
									onDelete();
									setIsOpen(false);
								}}
								className="mr-auto"
							>
								<Trash2 className="h-4 w-4" />
								Delete Column
							</Button>
						)}
						<Button variant="outline" onClick={() => setIsOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleSave}>Save</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
