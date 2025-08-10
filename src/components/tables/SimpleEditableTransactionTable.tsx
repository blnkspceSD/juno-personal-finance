/**
 * Simple Editable Transaction Table Component
 * Enhanced version of TransactionTable with basic editing capabilities
 * Focuses on individual row editing rather than complex inline editing
 */

"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Transaction, Category, UpdateTransactionForm } from "@/lib/types/database";
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
import { InlineTransactionEditor } from "@/components/forms/InlineTransactionEditor";

export interface SimpleEditableTransactionRow extends Transaction {
  category: Category;
}

interface SimpleEditableTransactionTableProps {
  data: SimpleEditableTransactionRow[];
  categories: Category[];
  onUpdate?: (transaction: UpdateTransactionForm) => Promise<void>;
  onDelete?: (transaction: SimpleEditableTransactionRow) => void;
  onBulkDelete?: (transactions: SimpleEditableTransactionRow[]) => void;
  onEdit?: (transaction: SimpleEditableTransactionRow) => void; // For full edit modal/page
  onQuickEdit?: (transaction: SimpleEditableTransactionRow) => void; // Deprecated - use row clicks instead
  onCategoryCreate?: (name: string) => Promise<string | null>;
  userId?: string;
  isLoading?: boolean;
  allowQuickEdit?: boolean;
  allowCategoryCreation?: boolean;
  className?: string;
}

function SimpleEditableTransactionRowActions({ 
  transaction, 
  onEdit,
  onDelete
}: { 
  transaction: SimpleEditableTransactionRow;
  onEdit?: (transaction: SimpleEditableTransactionRow) => void;
  onDelete?: (transaction: SimpleEditableTransactionRow) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {/* More actions dropdown */}
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
            onClick={() => navigator.clipboard.writeText(transaction.id)}
          >
            Copy transaction ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(transaction)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit transaction
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem 
              onClick={() => onDelete(transaction)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete transaction
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function SimpleEditableTransactionTable({
  data,
  categories,
  onUpdate,
  onDelete,
  onBulkDelete,
  onEdit,
  onQuickEdit, // Deprecated - not used
  onCategoryCreate,
  userId,
  isLoading = false,
  allowQuickEdit = true, // Deprecated - not used
  allowCategoryCreation = false,
  className,
}: SimpleEditableTransactionTableProps) {
  const [editingTransactionId, setEditingTransactionId] = React.useState<string | null>(null);

  const handleStartEdit = (transactionId: string) => {
    setEditingTransactionId(transactionId);
  };

  const handleCancelEdit = () => {
    setEditingTransactionId(null);
  };

  const handleSaveEdit = async (updateData: UpdateTransactionForm) => {
    if (onUpdate) {
      try {
        await onUpdate(updateData);
        setEditingTransactionId(null);
      } catch (error) {
        // Error will be handled by the inline editor
        throw error;
      }
    }
  };

  const columns: ColumnDef<SimpleEditableTransactionRow>[] = [
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
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("date"));
        return (
          <div className="font-medium">
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        );
      },
      size: 120,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate font-medium">
          {row.getValue("description")}
        </div>
      ),
      size: 200,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.original.category;
        return (
          <Badge
            variant="secondary"
            style={{
              backgroundColor: `${category.color}15`,
              color: category.color,
              borderColor: `${category.color}30`,
            }}
          >
            {category.name}
          </Badge>
        );
      },
      size: 150,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"));
        return (
          <div className={getCurrencyClasses("font-medium text-slate-700")}>
            {formatCurrency(amount)}
          </div>
        );
      },
      size: 120,
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return (
          <div className="text-sm text-muted-foreground">
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </div>
        );
      },
      size: 100,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <SimpleEditableTransactionRowActions
          transaction={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 100,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data}
        className={className}
        onRowClick={(transaction) => {
          // Optional: Handle row click for quick edit
          if (allowQuickEdit && !editingTransactionId) {
            handleStartEdit(transaction.id);
          }
        }}
      />

      {/* Inline Editor Row (shows below table when editing) */}
      {editingTransactionId && (
        <div className="border rounded-lg bg-blue-50 border-blue-200">
          <div className="p-4">
            <div className="text-sm font-medium text-blue-800 mb-3">
              Editing Transaction
            </div>
            <InlineTransactionEditor
              transaction={data.find(t => t.id === editingTransactionId)!}
              categories={categories}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
              onCategoryCreate={onCategoryCreate}
              userId={userId}
              compact={false}
              allowCategoryCreation={allowCategoryCreation}
            />
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="text-sm text-muted-foreground">Loading transactions...</div>
        </div>
      )}
    </div>
  );
}