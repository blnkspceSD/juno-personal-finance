"use client";

import * as React from "react";

import { CategoryTable, CategoryTableRow } from "./CategoryTable";
import { CategoryCard } from "./CategoryCard";

interface ResponsiveCategoryViewProps {
  data: CategoryTableRow[];
  onEdit?: (category: CategoryTableRow) => void;
  onDelete?: (category: CategoryTableRow) => void;
  onAllocate?: (category: CategoryTableRow) => void;
  isLoading?: boolean;
  className?: string;
}

export function ResponsiveCategoryView({
  data,
  onEdit,
  onDelete,
  onAllocate,
  isLoading = false,
  className,
}: ResponsiveCategoryViewProps) {
  const [selectedCategories, setSelectedCategories] = React.useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = React.useState(false);

  // Check if mobile view should be used
  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleSelectCategory = (categoryId: string, selected: boolean) => {
    const newSelected = new Set(selectedCategories);
    if (selected) {
      newSelected.add(categoryId);
    } else {
      newSelected.delete(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  // Desktop/Tablet: Use table view
  if (!isMobile) {
    return (
      <CategoryTable
        data={data}
        onEdit={onEdit}
        onDelete={onDelete}
        onAllocate={onAllocate}
        isLoading={isLoading}
        className={className}
      />
    );
  }

  // Mobile: Use card view
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Mobile Summary Stats */}
      <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg">
        <div className="text-center">
          <div className="text-xl font-bold">
            {data.length}
          </div>
          <div className="text-xs text-muted-foreground">Categories</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              notation: "compact",
            }).format(data.reduce((sum, cat) => sum + cat.allocated, 0))}
          </div>
          <div className="text-xs text-muted-foreground">Allocated</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              notation: "compact",
            }).format(data.reduce((sum, cat) => sum + cat.spent, 0))}
          </div>
          <div className="text-xs text-muted-foreground">Spent</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-red-600">
            {data.filter(cat => cat.is_overspent).length}
          </div>
          <div className="text-xs text-muted-foreground">Overspent</div>
        </div>
      </div>

      {/* Mobile Category Count */}
      {data.length > 0 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-sm text-muted-foreground">
            {data.length} categor{data.length !== 1 ? 'ies' : 'y'}
          </span>
        </div>
      )}

      {/* Mobile Cards */}
      <div className="grid gap-3">
        {data.length > 0 ? (
          data.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              isSelected={selectedCategories.has(category.id)}
              onSelect={(selected) => handleSelectCategory(category.id, selected)}
              onEdit={onEdit}
              onDelete={onDelete}
              onAllocate={onAllocate}
              onClick={(category) => {
                // Optional: Handle card click for quick allocation
                console.log("Category clicked:", category);
              }}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No categories found.</p>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="text-sm text-muted-foreground">Loading categories...</div>
        </div>
      )}
    </div>
  );
}