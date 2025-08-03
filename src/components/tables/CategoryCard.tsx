"use client";

import * as React from "react";
import { MoreHorizontal, Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryTableRow } from "./CategoryTable";

interface CategoryCardProps {
  category: CategoryTableRow;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onEdit?: (category: CategoryTableRow) => void;
  onDelete?: (category: CategoryTableRow) => void;
  onAllocate?: (category: CategoryTableRow) => void;
  onClick?: (category: CategoryTableRow) => void;
}

function ProgressBar({ 
  percentage, 
  isOverspent 
}: { 
  percentage: number; 
  isOverspent: boolean;
}) {
  const clampedPercentage = Math.min(percentage, 100);
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all duration-300 ${
          isOverspent 
            ? "bg-red-500" 
            : percentage > 80 
            ? "bg-yellow-500" 
            : "bg-green-500"
        }`}
        style={{ width: `${clampedPercentage}%` }}
      />
    </div>
  );
}

export function CategoryCard({
  category,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onAllocate,
  onClick,
}: CategoryCardProps) {
  const formattedAllocated = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(category.allocated);

  const formattedSpent = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(category.spent);

  const formattedRemaining = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Math.abs(category.remaining));

  return (
    <Card 
      className={`transition-all duration-200 ${
        onClick ? "cursor-pointer hover:shadow-md" : ""
      } ${isSelected ? "ring-2 ring-primary" : ""} ${
        category.is_overspent ? "border-red-200 bg-red-50/50" : ""
      }`}
      onClick={() => onClick?.(category)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {onSelect && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelect}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <div className="font-semibold text-foreground truncate">
                {category.name}
              </div>
            </div>
          </div>

          {/* Actions Dropdown */}
          {(onEdit || onDelete || onAllocate) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" className="h-8 w-8 p-0 shrink-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(category.id);
                  }}
                >
                  Copy category ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {onAllocate && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onAllocate(category);
                    }}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Allocate funds
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(category);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit category
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(category);
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete category
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Amount Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Allocated</div>
            <div className="font-medium">{formattedAllocated}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Spent</div>
            <div className={`font-medium ${category.is_overspent ? "text-red-600" : ""}`}>
              {formattedSpent}
            </div>
          </div>
        </div>

        {/* Remaining Amount */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Remaining</div>
          <div className={`font-semibold flex items-center gap-1 ${
            category.remaining < 0 ? "text-red-600" : "text-green-600"
          }`}>
            {category.remaining < 0 ? (
              <TrendingDown className="h-4 w-4" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
            {formattedRemaining}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Progress</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {Math.round(category.percentage_used)}%
              </span>
              {category.is_overspent && (
                <Badge variant="destructive" className="text-xs">
                  Overspent
                </Badge>
              )}
            </div>
          </div>
          <ProgressBar 
            percentage={category.percentage_used} 
            isOverspent={category.is_overspent}
          />
        </div>

        {/* Transaction Count */}
        {category.transaction_count !== undefined && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Transactions</span>
            <Badge variant="outline">{category.transaction_count}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}