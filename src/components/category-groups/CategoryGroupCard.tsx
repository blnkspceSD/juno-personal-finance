"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/currency";

export interface CategoryGroup {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryWithSpending {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  color: string;
}

export interface GroupSummary {
  totalAllocated: number;
  totalSpent: number;
  remainingBudget: number;
  utilizationRate: number;
  overspentCount: number;
  healthStatus: 'healthy' | 'warning' | 'overspent' | 'underfunded';
  categoryCount: number;
}

export interface CategoryGroupCardProps {
  group: CategoryGroup;
  categories: CategoryWithSpending[];
  onEdit?: (group: CategoryGroup) => void;
  onDelete?: (group: CategoryGroup) => void;
  onClick?: (group: CategoryGroup) => void;
  className?: string;
}

function calculateGroupSummary(categories: CategoryWithSpending[]): GroupSummary {
  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const remainingBudget = totalAllocated - totalSpent;
  const utilizationRate = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
  const overspentCount = categories.filter(cat => cat.spent > cat.allocated).length;

  let healthStatus: GroupSummary['healthStatus'] = 'healthy';
  if (remainingBudget < 0) {
    healthStatus = 'overspent';
  } else if (utilizationRate > 90) {
    healthStatus = 'warning';
  } else if (utilizationRate < 20 && totalAllocated > 0) {
    healthStatus = 'underfunded';
  }

  return {
    totalAllocated,
    totalSpent,
    remainingBudget,
    utilizationRate,
    overspentCount,
    healthStatus,
    categoryCount: categories.length,
  };
}


export function CategoryGroupCard({
  group,
  categories,
  onEdit,
  onDelete,
  onClick,
  className,
}: CategoryGroupCardProps) {
  const summary = React.useMemo(() => calculateGroupSummary(categories), [categories]);

  const handleCardClick = React.useCallback((e: React.MouseEvent) => {
    if (onClick) {
      onClick(group);
    }
  }, [onClick, group]);


  return (
    <Card 
      className={cn(
        'hover:shadow-juno-btn-secondary-hover transition-all duration-200 cursor-pointer hover:-translate-y-0.5',
        'bg-juno-surface-50 rounded-xl border-juno-border-alpha-soft',
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-juno-text text-lg">
            {group.name}
          </h3>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-2">
        {/* Individual Categories */}
        <div className="space-y-2">
          {categories.map((category) => {
            const utilizationRate = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0;
            const isOverspent = category.spent > category.allocated;
            
            return (
              <div 
                key={category.id} 
                className="group p-3 rounded-lg hover:bg-juno-surface-300 transition-all duration-200 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-juno-muted-fg group-hover:text-juno-text transition-colors duration-200">
                    {category.name}
                  </span>
                  <span className={cn(
                    "text-sm font-medium transition-colors duration-200",
                    isOverspent 
                      ? "text-juno-danger-fg" 
                      : "text-juno-muted-fg group-hover:text-juno-text"
                  )}>
                    {Math.round(utilizationRate)}%
                  </span>
                </div>
                
                {/* Individual progress bar with gradient and white overlay */}
                <div className="w-full bg-juno-surface-500 rounded-full h-2 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300 relative",
                      isOverspent ? "bg-gradient-to-r from-juno-danger-bg to-juno-danger-fg" : "bg-gradient-to-r from-juno-neutral-400 to-juno-text"
                    )}
                    style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                  >
                    {/* White tint overlay that disappears on hover */}
                    <div className="absolute inset-0 bg-white opacity-25 group-hover:opacity-0 transition-opacity duration-200 rounded-full" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}