"use client";

import * as React from "react";
import { useRealtimeBalance } from "@/lib/hooks/useRealtimeBalance";
import { Category } from "@/lib/types/database";
import { ResponsiveCategoryView } from "./ResponsiveCategoryView";
import { CategoryTableRow } from "./CategoryTable";

interface RealtimeCategoryTableProps {
  budgetId: string;
  initialCategories: Category[];
  onEdit?: (category: CategoryTableRow) => void;
  onDelete?: (category: CategoryTableRow) => void;
  onAllocate?: (category: CategoryTableRow) => void;
  className?: string;
}

export function RealtimeCategoryTable({
  budgetId,
  initialCategories,
  onEdit,
  onDelete,
  onAllocate,
  className,
}: RealtimeCategoryTableProps) {
  const { envelopes, connectionState } = useRealtimeBalance(budgetId);

  // Merge initial categories with real-time envelope data
  const enhancedCategories = React.useMemo(() => {
    return initialCategories.map((category): CategoryTableRow => {
      // Find real-time envelope data for this category
      const envelope = envelopes.find(env => env.id === category.id);
      
      // Use real-time data if available, fallback to initial data
      const allocated = envelope?.allocated ?? category.allocated;
      const spent = envelope?.spent ?? category.spent;
      const remaining = allocated - spent;
      const percentage_used = allocated > 0 ? (spent / allocated) * 100 : 0;
      const is_overspent = remaining < 0;

      return {
        ...category,
        allocated,
        spent,
        remaining,
        percentage_used,
        is_overspent,
        // Add optimistic update indicators
        is_optimistic: envelope?.is_optimistic ?? false,
        pending_amount: envelope?.pending_amount,
        // You could add transaction_count here if you track it
        transaction_count: 0, // Would need to be calculated or fetched
      };
    });
  }, [initialCategories, envelopes]);

  // Enhanced handlers that provide optimistic updates
  const handleOptimisticEdit = React.useCallback((category: CategoryTableRow) => {
    onEdit?.(category);
  }, [onEdit]);

  const handleOptimisticDelete = React.useCallback((category: CategoryTableRow) => {
    onDelete?.(category);
  }, [onDelete]);

  const handleOptimisticAllocate = React.useCallback((category: CategoryTableRow) => {
    onAllocate?.(category);
  }, [onAllocate]);

  return (
    <div className="space-y-4">
      {/* Connection Status Indicator */}
      {connectionState.status !== 'connected' && (
        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          <span className="text-sm text-yellow-700">
            {connectionState.status === 'connecting' ? 'Connecting to real-time updates...' : 
             'Real-time updates offline'}
          </span>
        </div>
      )}

      {/* Optimistic Updates Indicator */}
      {enhancedCategories.some(cat => cat.is_optimistic) && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-sm text-blue-700">
            Balance updates pending...
          </span>
        </div>
      )}

      {/* Real-time Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {enhancedCategories.length}
          </div>
          <div className="text-sm text-muted-foreground">Categories</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(enhancedCategories.reduce((sum, cat) => sum + cat.allocated, 0))}
          </div>
          <div className="text-sm text-muted-foreground">Total Allocated</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(enhancedCategories.reduce((sum, cat) => sum + cat.spent, 0))}
          </div>
          <div className="text-sm text-muted-foreground">Total Spent</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${
            enhancedCategories.filter(cat => cat.is_overspent).length > 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            {enhancedCategories.filter(cat => cat.is_overspent).length}
          </div>
          <div className="text-sm text-muted-foreground">Overspent</div>
        </div>
      </div>

      {/* Responsive Category View */}
      <ResponsiveCategoryView
        data={enhancedCategories}
        onEdit={handleOptimisticEdit}
        onDelete={handleOptimisticDelete}
        onAllocate={handleOptimisticAllocate}
        isLoading={false}
        className={className}
      />
    </div>
  );
}