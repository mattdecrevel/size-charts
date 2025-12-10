"use client";

import { useState, useMemo } from "react";
import {
  Button,
  Input,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  SimpleSelect,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
  InputWithLabel,
  SelectWithLabel,
} from "@/components/ui";
import { useLabels, useCreateLabel, useUpdateLabel, useDeleteLabel } from "@/hooks/use-labels";
import { useToast } from "@/components/ui/toast";
import { Plus, Pencil, Trash2, Tag, Search } from "lucide-react";
import { LABEL_TYPES } from "@/lib/constants";
import type { LabelType, SizeLabel } from "@prisma/client";

export default function LabelsPage() {
  const [filterType, setFilterType] = useState<string>("");
  const [search, setSearch] = useState("");
  const [editingLabel, setEditingLabel] = useState<SizeLabel | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [labelToDelete, setLabelToDelete] = useState<SizeLabel | null>(null);

  // Form state
  const [formKey, setFormKey] = useState("");
  const [formDisplayValue, setFormDisplayValue] = useState("");
  const [formLabelType, setFormLabelType] = useState<LabelType>("ALPHA_SIZE");
  const [formSortOrder, setFormSortOrder] = useState("0");
  const [formDescription, setFormDescription] = useState("");

  const { addToast } = useToast();
  const { data: labels, isLoading } = useLabels({
    type: filterType as LabelType | undefined,
  });
  const createMutation = useCreateLabel();
  const updateMutation = useUpdateLabel();
  const deleteMutation = useDeleteLabel();

  // Group labels by type for display
  const groupedLabels = useMemo(() => {
    if (!labels) return {};

    let filtered = labels;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = labels.filter(
        (l) =>
          l.key.toLowerCase().includes(searchLower) ||
          l.displayValue.toLowerCase().includes(searchLower)
      );
    }

    return filtered.reduce((acc, label) => {
      const type = label.labelType;
      if (!acc[type]) acc[type] = [];
      acc[type].push(label);
      return acc;
    }, {} as Record<string, SizeLabel[]>);
  }, [labels, search]);

  const resetForm = () => {
    setFormKey("");
    setFormDisplayValue("");
    setFormLabelType("ALPHA_SIZE");
    setFormSortOrder("0");
    setFormDescription("");
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditDialog = (label: SizeLabel) => {
    setEditingLabel(label);
    setFormKey(label.key);
    setFormDisplayValue(label.displayValue);
    setFormLabelType(label.labelType);
    setFormSortOrder(label.sortOrder.toString());
    setFormDescription(label.description || "");
  };

  const handleCreate = async () => {
    if (!formKey.trim() || !formDisplayValue.trim()) {
      addToast("Key and display value are required", "error");
      return;
    }

    try {
      await createMutation.mutateAsync({
        key: formKey.toUpperCase().replace(/[^A-Z0-9_]/g, "_"),
        displayValue: formDisplayValue,
        labelType: formLabelType,
        sortOrder: parseInt(formSortOrder) || 0,
        description: formDescription || null,
      });
      addToast("Label created successfully", "success");
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Failed to create label", "error");
    }
  };

  const handleUpdate = async () => {
    if (!editingLabel) return;
    if (!formKey.trim() || !formDisplayValue.trim()) {
      addToast("Key and display value are required", "error");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: editingLabel.id,
        key: formKey.toUpperCase().replace(/[^A-Z0-9_]/g, "_"),
        displayValue: formDisplayValue,
        labelType: formLabelType,
        sortOrder: parseInt(formSortOrder) || 0,
        description: formDescription || null,
      });
      addToast("Label updated successfully", "success");
      setEditingLabel(null);
      resetForm();
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Failed to update label", "error");
    }
  };

  const handleDelete = async () => {
    if (!labelToDelete) return;

    try {
      await deleteMutation.mutateAsync(labelToDelete.id);
      addToast("Label deleted successfully", "success");
      setDeleteDialogOpen(false);
      setLabelToDelete(null);
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Failed to delete label", "error");
    }
  };

  const getLabelTypeInfo = (type: string) =>
    LABEL_TYPES.find((t) => t.value === type) || { label: type, description: "" };

  if (isLoading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">Size Labels</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Size Labels</h1>
          <p className="text-muted-foreground">
            Manage reusable size labels for your charts
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          New Label
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] max-w-xs relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search labels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <SimpleSelect
          options={[
            { value: "", label: "All Types" },
            ...LABEL_TYPES.map((t) => ({ value: t.value, label: t.label })),
          ]}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-44"
        />
      </div>

      {Object.keys(groupedLabels).length === 0 ? (
        <div className="rounded-lg border-2 border-dashed p-8 text-center">
          <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No labels found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {search ? "Try a different search term" : "Create your first label to get started"}
          </p>
          {!search && (
            <Button className="mt-4" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Create Label
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedLabels)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([type, typeLabels]) => {
              const typeInfo = getLabelTypeInfo(type);
              return (
                <div key={type} className="rounded-lg border">
                  <div className="border-b bg-muted/50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{typeInfo.label}</span>
                      <span className="text-sm text-muted-foreground">
                        ({typeLabels.length})
                      </span>
                    </div>
                    {typeInfo.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {typeInfo.description}
                      </p>
                    )}
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-40">Key</TableHead>
                        <TableHead>Display Value</TableHead>
                        <TableHead className="w-24">Sort Order</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-24"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {typeLabels
                        .sort((a, b) => a.sortOrder - b.sortOrder || a.displayValue.localeCompare(b.displayValue))
                        .map((label) => (
                          <TableRow key={label.id}>
                            <TableCell>
                              <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                                {label.key}
                              </code>
                            </TableCell>
                            <TableCell className="font-medium">
                              {label.displayValue}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {label.sortOrder}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {label.description || "—"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => openEditDialog(label)}
                                  className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                  title="Edit"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setLabelToDelete(label);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              );
            })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Size Label</DialogTitle>
            <DialogDescription>
              Create a reusable label for size chart cells
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <InputWithLabel
                label="Key"
                value={formKey}
                onChange={(e) => setFormKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"))}
                placeholder="SIZE_XS"
              />
              <p className="mt-1 text-xs text-muted-foreground">Unique identifier (uppercase with underscores)</p>
            </div>
            <div>
              <InputWithLabel
                label="Display Value"
                value={formDisplayValue}
                onChange={(e) => setFormDisplayValue(e.target.value)}
                placeholder="XS"
              />
              <p className="mt-1 text-xs text-muted-foreground">The value shown to users</p>
            </div>
            <SelectWithLabel
              label="Label Type"
              options={LABEL_TYPES.map((t) => ({
                value: t.value,
                label: `${t.label} - ${t.description}`,
              }))}
              value={formLabelType}
              onChange={(e) => setFormLabelType(e.target.value as LabelType)}
            />
            <div>
              <InputWithLabel
                label="Sort Order"
                type="number"
                value={formSortOrder}
                onChange={(e) => setFormSortOrder(e.target.value)}
                placeholder="0"
              />
              <p className="mt-1 text-xs text-muted-foreground">Lower numbers appear first</p>
            </div>
            <InputWithLabel
              label="Description (optional)"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Extra small size"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingLabel} onOpenChange={(open) => !open && setEditingLabel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Size Label</DialogTitle>
            <DialogDescription>
              Update the label properties
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <InputWithLabel
                label="Key"
                value={formKey}
                onChange={(e) => setFormKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"))}
                placeholder="SIZE_XS"
              />
              <p className="mt-1 text-xs text-muted-foreground">Unique identifier (uppercase with underscores)</p>
            </div>
            <div>
              <InputWithLabel
                label="Display Value"
                value={formDisplayValue}
                onChange={(e) => setFormDisplayValue(e.target.value)}
                placeholder="XS"
              />
              <p className="mt-1 text-xs text-muted-foreground">The value shown to users</p>
            </div>
            <SelectWithLabel
              label="Label Type"
              options={LABEL_TYPES.map((t) => ({
                value: t.value,
                label: `${t.label} - ${t.description}`,
              }))}
              value={formLabelType}
              onChange={(e) => setFormLabelType(e.target.value as LabelType)}
            />
            <div>
              <InputWithLabel
                label="Sort Order"
                type="number"
                value={formSortOrder}
                onChange={(e) => setFormSortOrder(e.target.value)}
                placeholder="0"
              />
              <p className="mt-1 text-xs text-muted-foreground">Lower numbers appear first</p>
            </div>
            <InputWithLabel
              label="Description (optional)"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Extra small size"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLabel(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Label</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the label &quot;{labelToDelete?.displayValue}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setLabelToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
