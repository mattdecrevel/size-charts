"use client";

import { cn } from "@/lib/utils";
import { useMeasurementInstructions } from "@/hooks/use-measurement-instructions";
import { Check, Info, Ruler } from "lucide-react";

interface MeasurementInstructionsSelectorProps {
	selectedIds: string[];
	onChange: (ids: string[]) => void;
}

export function MeasurementInstructionsSelector({
	selectedIds,
	onChange,
}: MeasurementInstructionsSelectorProps) {
	const { data: instructions, isLoading } = useMeasurementInstructions();

	const toggleInstruction = (id: string) => {
		if (selectedIds.includes(id)) {
			onChange(selectedIds.filter((i) => i !== id));
		} else {
			onChange([...selectedIds, id]);
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-2">
				<div className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
					<Ruler className="h-4 w-4" />
					How to Measure
				</div>
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="h-10 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse"
						/>
					))}
				</div>
			</div>
		);
	}

	if (!instructions?.length) {
		return (
			<div className="space-y-2">
				<div className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
					<Ruler className="h-4 w-4" />
					How to Measure
				</div>
				<p className="text-sm text-neutral-500 dark:text-neutral-400">
					No measurement instructions available. Create some in the admin settings.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
					<Ruler className="h-4 w-4" />
					How to Measure
				</div>
				{selectedIds.length > 0 && (
					<span className="text-xs text-neutral-500">
						{selectedIds.length} selected
					</span>
				)}
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
				{instructions.map((instruction) => {
					const isSelected = selectedIds.includes(instruction.id);
					return (
						<button
							key={instruction.id}
							type="button"
							onClick={() => toggleInstruction(instruction.id)}
							className={cn(
								"group relative flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all",
								"border focus:outline-none focus:ring-2 focus:ring-primary",
								isSelected
									? "bg-primary/10 border-primary/50 text-primary dark:bg-primary/20 dark:border-primary/50 dark:text-primary"
									: "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-700/50"
							)}
						>
							<div
								className={cn(
									"flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
									isSelected
										? "bg-primary border-primary text-primary-foreground"
										: "border-neutral-300 dark:border-neutral-600"
								)}
							>
								{isSelected && <Check className="h-3 w-3" />}
							</div>
							<span className="truncate font-medium">{instruction.name}</span>
							<div
								className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
								title={instruction.instruction}
							>
								<Info className="h-3.5 w-3.5 text-neutral-400" />
							</div>
						</button>
					);
				})}
			</div>

			{selectedIds.length > 0 && (
				<div className="mt-3 p-3 rounded-md bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
					<p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
						Selected instructions (in order shown):
					</p>
					<div className="space-y-1.5">
						{selectedIds.map((id, index) => {
							const instruction = instructions.find((i) => i.id === id);
							if (!instruction) return null;
							return (
								<div
									key={id}
									className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-300"
								>
									<span className="font-medium text-neutral-400 w-4">
										{index + 1}.
									</span>
									<div>
										<span className="font-medium">{instruction.name}:</span>{" "}
										<span className="text-neutral-500 dark:text-neutral-400">
											{instruction.instruction}
										</span>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
