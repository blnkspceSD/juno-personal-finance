"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react";

import { Category } from "@/lib/types/database";
import { formatCurrency, getCurrencyClasses } from "@/lib/utils/currency";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";

export interface CategoryTableRow extends Category {
  remaining: number;
  percentage_used: number;
  is_overspent: boolean;
  transaction_count?: number;
  is_optimistic?: boolean;
  pending_amount?: number;
}

interface CategoryTableProps {
  data: CategoryTableRow[];
  onEdit?: (category: CategoryTableRow) => void;
  onDelete?: (category: CategoryTableRow) => void;
  onAllocate?: (category: CategoryTableRow) => void;
  isLoading?: boolean;
  className?: string;
}

function CategoryRowActions({ 
  category, 
  onEdit, 
  onDelete,
  onAllocate
}: { 
  category: CategoryTableRow;
  onEdit?: (category: CategoryTableRow) => void;
  onDelete?: (category: CategoryTableRow) => void;
  onAllocate?: (category: CategoryTableRow) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(category.id)}
        >
          Copy category ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {onAllocate && (
          <DropdownMenuItem onClick={() => onAllocate(category)}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Allocate funds
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(category)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit category
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem 
            onClick={() => onDelete(category)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete category
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
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
            : percentage > 90 
            ? "bg-orange-400" 
            : percentage > 75
            ? "bg-yellow-400"
            : "bg-blue-500"
        }`}
        style={{ width: `${clampedPercentage}%` }}
      />
    </div>
  );
}

export function CategoryTable({
  data,
  onEdit,
  onDelete,
  onAllocate,
  isLoading = false,
  className,
}: CategoryTableProps) {
  const columns: ColumnDef<CategoryTableRow>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 text-juno-muted-fg group-hover:text-juno-text hover:bg-transparent font-medium"
        >
          Category
        </Button>
      ),
      meta: {
        headerClassName: "group hover:text-juno-text cursor-pointer"
      },
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <div className="font-medium">{category.name}</div>
          </div>
        );
      },
      size: 200,
    },
    {
      accessorKey: "allocated",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 text-juno-muted-fg group-hover:text-juno-text hover:bg-transparent font-medium"
        >
          Allocated
        </Button>
      ),
      meta: {
        headerClassName: "group hover:text-juno-text cursor-pointer"
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("allocated"));
        return (
          <div className={getCurrencyClasses("font-medium")}>
            {formatCurrency(amount)}
          </div>
        );
      },
      size: 120,
    },
    {
      accessorKey: "spent",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 text-juno-muted-fg group-hover:text-juno-text hover:bg-transparent font-medium"
        >
          Spent
        </Button>
      ),
      meta: {
        headerClassName: "group hover:text-juno-text cursor-pointer"
      },
      cell: ({ row }) => {
        const spent = parseFloat(row.getValue("spent"));
        return (
          <div className={getCurrencyClasses("font-medium")}>
            {formatCurrency(spent)}
          </div>
        );
      },
      size: 120,
    },
    {
      accessorKey: "remaining",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 text-juno-muted-fg group-hover:text-juno-text hover:bg-transparent font-medium"
        >
          Remaining
        </Button>
      ),
      meta: {
        headerClassName: "group hover:text-juno-text cursor-pointer"
      },
      cell: ({ row }) => {
        const remaining = row.original.remaining;
        const isOverspent = remaining < 0;
        return (
          <div className={`${getCurrencyClasses("font-medium")} flex items-center gap-2 ${
            isOverspent ? "text-red-600" : "text-slate-700"
          }`}>
            {isOverspent ? (
              <TrendingDown className="h-4 w-4" />
            ) : (
              <TrendingUp className="h-4 w-4 text-slate-500" />
            )}
            {formatCurrency(Math.abs(remaining))}
          </div>
        );
      },
      size: 140,
    },
    {
      accessorKey: "percentage_used",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 text-juno-muted-fg group-hover:text-juno-text hover:bg-transparent font-medium"
        >
          Progress
        </Button>
      ),
      meta: {
        headerClassName: "group hover:text-juno-text cursor-pointer"
      },
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>{Math.round(category.percentage_used)}%</span>
              {category.is_overspent && (
                <Badge variant="destructive" className="text-xs">
                  Overspent
                </Badge>
              )}
            </div>
            <ProgressBar 
              percentage={category.percentage_used} 
              isOverspent={category.is_overspent}
            />
          </div>
        );
      },
      size: 150,
    },
    {
      accessorKey: "transaction_count",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 text-juno-muted-fg group-hover:text-juno-text hover:bg-transparent font-medium"
        >
          Transactions
        </Button>
      ),
      meta: {
        headerClassName: "group hover:text-juno-text cursor-pointer"
      },
      cell: ({ row }) => {
        const count = row.original.transaction_count || 0;
        return (
          <div className="text-center">
            <Badge variant="outline">{count}</Badge>
          </div>
        );
      },
      size: 100,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <CategoryRowActions
          category={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
          onAllocate={onAllocate}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold">
            {data.length}
          </div>
          <div className="text-sm text-muted-foreground">Total Categories</div>
        </div>
        <div className="text-center">
          <div className={getCurrencyClasses("text-2xl font-bold")}>
            {formatCurrency(data.reduce((sum, cat) => sum + cat.allocated, 0))}
          </div>
          <div className="text-sm text-muted-foreground">Total Allocated</div>
        </div>
        <div className="text-center">
          <div className={getCurrencyClasses("text-2xl font-bold")}>
            {formatCurrency(data.reduce((sum, cat) => sum + cat.spent, 0))}
          </div>
          <div className="text-sm text-muted-foreground">Total Spent</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {data.filter(cat => cat.is_overspent).length}
          </div>
          <div className="text-sm text-muted-foreground">Overspent</div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data}
        className={className}
        onRowClick={(category) => {
          // Optional: Handle row click for quick allocation
          console.log("Category clicked:", category);
        }}
      />

      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="text-sm text-muted-foreground">Loading categories...</div>
        </div>
      )}
    </div>
  );
}