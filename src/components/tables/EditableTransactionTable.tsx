/**
 * Editable Transaction Table Component
 * Enhanced version of TransactionTable with inline editing capabilities
 * Supports both row-level and card-level inline editing with smart category suggestions
 */

"use client";

import * as React from "react";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, Edit3 } from "lucide-react";

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

export interface EditableTransactionRow extends Transaction {
  category: Category;
}

interface EditableTransactionTableProps {
  data: EditableTransactionRow[];
  categories: Category[];
  onUpdate?: (transaction: UpdateTransactionForm) => Promise<void>;
  onDelete?: (transaction: EditableTransactionRow) => void;
  onBulkDelete?: (transactions: EditableTransactionRow[]) => void;
  onCategoryCreate?: (name: string) => Promise<string | null>;
  userId?: string;
  isLoading?: boolean;
  allowInlineEditing?: boolean;
  allowCategoryCreation?: boolean;
  className?: string;
}

function EditableTransactionRowActions({ 
  transaction, 
  onEdit,
  onDelete,
  onStartInlineEdit,
  isEditing
}: { 
  transaction: EditableTransactionRow;
  onEdit?: (transaction: EditableTransactionRow) => void;
  onDelete?: (transaction: EditableTransactionRow) => void;
  onStartInlineEdit?: () => void;
  isEditing?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {/* Quick inline edit button */}
      {onStartInlineEdit && !isEditing && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onStartInlineEdit}
          className="h-8 w-8 p-0"
          title="Quick edit"
        >
          <Edit3 className="h-3 w-3" />
        </Button>
      )}
      
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
          {onStartInlineEdit && (
            <DropdownMenuItem onClick={onStartInlineEdit}>
              <Edit3 className="mr-2 h-4 w-4" />
              Quick edit
            </DropdownMenuItem>
          )}
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

export function EditableTransactionTable({
  data,
  categories,
  onUpdate,
  onDelete,
  onBulkDelete,
  onCategoryCreate,
  userId,
  isLoading = false,
  allowInlineEditing = true,
  allowCategoryCreation = false,
  className,
}: EditableTransactionTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleStartEdit = (transactionId: string) => {
    setEditingId(transactionId);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (updateData: UpdateTransactionForm) => {
    if (onUpdate) {
      try {
        await onUpdate(updateData);
        setEditingId(null);
      } catch (error) {
        // Error will be handled by the inline editor
        throw error;
      }
    }
  };

  const columns: ColumnDef<EditableTransactionRow>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => {
        const transaction = row.original;
        const isEditing = editingId === transaction.id;
        
        if (isEditing) {
          return (
            <div className="col-span-full">
              <InlineTransactionEditor
                transaction={transaction}
                categories={categories}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
                onCategoryCreate={onCategoryCreate}
                userId={userId}
                compact={true}
                allowCategoryCreation={allowCategoryCreation}
              />
            </div>
          );
        }
        
        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const transaction = row.original;
        const isEditing = editingId === transaction.id;
        
        if (isEditing) {
          return null; // Content is in the first column
        }
        
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
      cell: ({ row }) => {
        const transaction = row.original;
        const isEditing = editingId === transaction.id;
        
        if (isEditing) {
          return null; // Content is in the first column
        }
        
        return (
          <div className="max-w-[200px] truncate font-medium">
            {row.getValue("description")}
          </div>
        );
      },
      size: 200,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const transaction = row.original;
        const isEditing = editingId === transaction.id;
        
        if (isEditing) {
          return null; // Content is in the first column
        }
        
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
        const transaction = row.original;
        const isEditing = editingId === transaction.id;
        
        if (isEditing) {
          return null; // Content is in the first column
        }
        
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
        const transaction = row.original;
        const isEditing = editingId === transaction.id;
        
        if (isEditing) {
          return null; // Content is in the first column
        }
        
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
      cell: ({ row }) => {
        const transaction = row.original;
        const isEditing = editingId === transaction.id;
        
        if (isEditing) {
          return null; // Content is in the first column
        }
        
        return (
          <EditableTransactionRowActions
            transaction={transaction}
            onEdit={undefined} // We'll handle full edit separately if needed
            onDelete={onDelete}
            onStartInlineEdit={allowInlineEditing ? () => handleStartEdit(transaction.id) : undefined}
            isEditing={isEditing}
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 100,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Data Table with Custom Row Rendering */}
      <DataTable
        columns={columns}
        data={data}
        className={className}
        onRowClick={(transaction) => {
          // Double-click to edit
          if (allowInlineEditing && editingId === null) {
            handleStartEdit(transaction.id);
          }
        }}
      />

      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="text-sm text-muted-foreground">Loading transactions...</div>
        </div>
      )}
    </div>
  );
}