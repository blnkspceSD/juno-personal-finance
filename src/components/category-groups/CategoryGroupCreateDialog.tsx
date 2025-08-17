"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/currency";

interface Category {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  color: string;
}

interface CategoryGroupCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableCategories: Category[];
  onCreateGroup: (data: {
    name: string;
    categoryIds: string[];
    color: string;
    icon: string;
  }) => Promise<void>;
  isCreating?: boolean;
}

const DEFAULT_GROUP_COLORS = [
  '#dc2626', // Red
  '#059669', // Green  
  '#7c3aed', // Purple
  '#2563eb', // Blue
  '#ea580c', // Orange
  '#0891b2', // Cyan
  '#be123c', // Rose
  '#4338ca', // Indigo
];

const DEFAULT_GROUP_ICONS = [
  '📋', '🛒', '🎨', '🎯', '🏠', '🚗', '🍽️', '🎬', 
  '💡', '📱', '👕', '💊', '✈️', '🎓', '💰', '🎮'
];

function CategorySelector({ 
  categories, 
  selectedIds, 
  onSelectionChange 
}: {
  categories: Category[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}) {
  const handleCategoryToggle = React.useCallback((categoryId: string) => {
    const newSelection = selectedIds.includes(categoryId)
      ? selectedIds.filter(id => id !== categoryId)
      : [...selectedIds, categoryId];
    onSelectionChange(newSelection);
  }, [selectedIds, onSelectionChange]);

  const selectedCount = selectedIds.length;
  const totalAllocated = React.useMemo(() => 
    categories
      .filter(cat => selectedIds.includes(cat.id))
      .reduce((sum, cat) => sum + cat.allocated, 0),
    [categories, selectedIds]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-juno-text">
          Select Categories
        </Label>
        <div className="text-sm text-juno-muted-fg">
          {selectedCount} selected • {formatCurrency(totalAllocated)} total
        </div>
      </div>
      
      <div className="h-48 w-full border border-juno-border-alpha-soft rounded-lg p-3 overflow-y-auto">
        <div className="space-y-2">
          {categories.map((category) => {
            const isSelected = selectedIds.includes(category.id);
            const utilizationRate = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0;
            const isOverspent = category.spent > category.allocated;
            
            return (
              <div
                key={category.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-all",
                  isSelected 
                    ? "border-juno-accent bg-juno-accent/10" 
                    : "border-juno-border-alpha-soft hover:border-juno-accent/50 hover:bg-juno-surface-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                  />
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <div className="font-medium text-juno-text">
                      {category.name}
                    </div>
                    <div className="text-sm text-juno-muted-fg">
                      {formatCurrency(category.spent)} / {formatCurrency(category.allocated)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "text-sm font-medium",
                    isOverspent ? "text-juno-danger-fg" : "text-juno-text"
                  )}>
                    {Math.round(utilizationRate)}%
                  </div>
                  {isOverspent && (
                    <Badge variant="destructive" className="text-xs">
                      Over
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ColorPicker({ 
  selectedColor, 
  onColorChange 
}: {
  selectedColor: string;
  onColorChange: (color: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-juno-text">Group Color</Label>
      <div className="flex flex-wrap gap-2">
        {DEFAULT_GROUP_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={cn(
              "w-8 h-8 rounded-full border-2 transition-all hover:scale-110",
              selectedColor === color 
                ? "border-juno-text shadow-md" 
                : "border-juno-border-alpha-soft"
            )}
            style={{ backgroundColor: color }}
            onClick={() => onColorChange(color)}
          />
        ))}
      </div>
    </div>
  );
}

function IconPicker({ 
  selectedIcon, 
  onIconChange 
}: {
  selectedIcon: string;
  onIconChange: (icon: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-juno-text">Group Icon</Label>
      <div className="grid grid-cols-8 gap-2">
        {DEFAULT_GROUP_ICONS.map((icon) => (
          <button
            key={icon}
            type="button"
            className={cn(
              "w-10 h-10 rounded-lg border transition-all hover:scale-110 flex items-center justify-center text-lg",
              selectedIcon === icon 
                ? "border-juno-accent bg-juno-accent/10" 
                : "border-juno-border-alpha-soft hover:border-juno-accent/50"
            )}
            onClick={() => onIconChange(icon)}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CategoryGroupCreateDialog({
  open,
  onOpenChange,
  availableCategories,
  onCreateGroup,
  isCreating = false,
}: CategoryGroupCreateDialogProps) {
  const [name, setName] = React.useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<string[]>([]);
  const [selectedColor, setSelectedColor] = React.useState(DEFAULT_GROUP_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = React.useState(DEFAULT_GROUP_ICONS[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || selectedCategoryIds.length === 0) {
      return;
    }

    try {
      await onCreateGroup({
        name: name.trim(),
        categoryIds: selectedCategoryIds,
        color: selectedColor,
        icon: selectedIcon,
      });
      
      // Reset form
      setName("");
      setSelectedCategoryIds([]);
      setSelectedColor(DEFAULT_GROUP_COLORS[0]);
      setSelectedIcon(DEFAULT_GROUP_ICONS[0]);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create category group:', error);
    }
  };

  const isValid = name.trim().length > 0 && selectedCategoryIds.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Category Group</DialogTitle>
          <DialogDescription>
            Organize your categories into a logical group for better spending visualization.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="group-name" className="text-sm font-medium text-juno-text">
              Group Name
            </Label>
            <Input
              id="group-name"
              placeholder="Enter group name (e.g., Bills & Fixed Expenses)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>

          <CategorySelector
            categories={availableCategories}
            selectedIds={selectedCategoryIds}
            onSelectionChange={setSelectedCategoryIds}
          />

          <div className="grid grid-cols-2 gap-4">
            <ColorPicker
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
            />
            
            <IconPicker
              selectedIcon={selectedIcon}
              onIconChange={setSelectedIcon}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isCreating}
              className="btn--primary"
            >
              {isCreating ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}