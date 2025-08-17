"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Grid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  CategoryGroupCard, 
  CategoryGroup, 
  CategoryWithSpending,
  type CategoryGroupCardProps
} from "./CategoryGroupCard";

export interface CategoryGroupCardsViewProps {
  groups: CategoryGroup[];
  categoriesByGroup: Record<string, CategoryWithSpending[]>;
  onCreateGroup?: () => void;
  onEditGroup?: (group: CategoryGroup) => void;
  onDeleteGroup?: (group: CategoryGroup) => void;
  onGroupClick?: (group: CategoryGroup) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  isLoading?: boolean;
  className?: string;
}

interface EmptyStateProps {
  onCreateGroup?: () => void;
}

function EmptyState({ onCreateGroup }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-juno-surface-200 rounded-full flex items-center justify-center mb-4">
        <Grid className="h-8 w-8 text-juno-muted-fg" />
      </div>
      
      <h3 className="text-lg font-semibold text-juno-text mb-2">
        No category groups yet
      </h3>
      
      <p className="text-juno-muted-fg mb-6 max-w-md">
        Organize your categories into groups like "Bills & Fixed Expenses" or "Flexible & Lifestyle" 
        to get better insights into your spending patterns.
      </p>
      
      {onCreateGroup && (
        <Button 
          onClick={onCreateGroup}
          className="btn--secondary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create your first group
        </Button>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-4 md:gap-6">
      {/* Loading skeleton for mobile: single column */}
      <div className="grid gap-4 md:hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-juno-surface-200 rounded-xl animate-pulse" />
        ))}
      </div>
      
      {/* Loading skeleton for desktop: grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-56 bg-juno-surface-200 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function ViewModeToggle({ 
  viewMode, 
  onViewModeChange 
}: { 
  viewMode: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}) {
  if (!onViewModeChange) return null;

  return (
    <div className="flex items-center border border-juno-border-alpha-soft rounded-lg p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className={cn(
          "h-8 w-8 p-0",
          viewMode === 'grid' 
            ? "bg-juno-surface-200 text-juno-text" 
            : "text-juno-muted-fg hover:text-juno-text hover:bg-transparent"
        )}
      >
        <Grid className="h-4 w-4" />
        <span className="sr-only">Grid view</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange('list')}
        className={cn(
          "h-8 w-8 p-0",
          viewMode === 'list' 
            ? "bg-juno-surface-200 text-juno-text" 
            : "text-juno-muted-fg hover:text-juno-text hover:bg-transparent"
        )}
      >
        <List className="h-4 w-4" />
        <span className="sr-only">List view</span>
      </Button>
    </div>
  );
}

export function CategoryGroupCardsView({
  groups,
  categoriesByGroup,
  onCreateGroup,
  onEditGroup,
  onDeleteGroup,
  onGroupClick,
  viewMode = 'grid',
  onViewModeChange,
  isLoading = false,
  className,
}: CategoryGroupCardsViewProps) {
  // Sort groups by sort_order
  const sortedGroups = React.useMemo(() => 
    groups.sort((a, b) => a.sort_order - b.sort_order),
    [groups]
  );

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-juno-surface-200 rounded animate-pulse" />
          <div className="h-8 w-24 bg-juno-surface-200 rounded animate-pulse" />
        </div>
        <LoadingState />
      </div>
    );
  }

  if (sortedGroups.length === 0) {
    return (
      <div className={className}>
        <EmptyState onCreateGroup={onCreateGroup} />
      </div>
    );
  }

  const getGridClasses = () => {
    if (viewMode === 'list') {
      return "grid gap-4";
    }
    
    return cn(
      "grid gap-4 md:gap-6",
      "grid-cols-1", // Mobile: single column
      "md:grid-cols-2", // Tablet: 2 columns
      "lg:grid-cols-3", // Desktop: 3 columns
      "xl:grid-cols-4", // Large desktop: 4 columns
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-juno-text">
            Watchlist
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          <ViewModeToggle 
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
          />
          
          {onCreateGroup && (
            <Button 
              onClick={onCreateGroup}
              size="sm"
              className="btn--secondary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Group
            </Button>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      <div className={getGridClasses()}>
        {sortedGroups.map((group) => {
          const categories = categoriesByGroup[group.id] || [];
          
          return (
            <CategoryGroupCard
              key={group.id}
              group={group}
              categories={categories}
              onEdit={onEditGroup}
              onDelete={onDeleteGroup}
              onClick={onGroupClick}
              className={cn(
                viewMode === 'list' && "max-w-none",
                viewMode === 'grid' && "min-h-[220px]"
              )}
            />
          );
        })}
      </div>
    </div>
  );
}