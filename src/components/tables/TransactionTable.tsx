"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Transaction, Category } from "@/lib/types/database";
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

export interface TransactionTableRow extends Transaction {
  category_name: string;
}

interface TransactionTableProps {
  data: TransactionTableRow[];
  onEdit?: (transaction: TransactionTableRow) => void;
  onDelete?: (transaction: TransactionTableRow) => void;
  onBulkDelete?: (transactions: TransactionTableRow[]) => void;
  isLoading?: boolean;
  className?: string;
}

function TransactionRowActions({ 
  transaction, 
  onEdit, 
  onDelete 
}: { 
  transaction: TransactionTableRow;
  onEdit?: (transaction: TransactionTableRow) => void;
  onDelete?: (transaction: TransactionTableRow) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-8 w-8 p-0 text-juno-neutral-500 hover:text-juno-text"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        className="bg-juno-surface-50 border-juno-border-alpha-medium"
      >
        <DropdownMenuLabel className="text-juno-text">Actions</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-juno-border-alpha-soft" />
        
        {onEdit && (
          <DropdownMenuItem 
            onClick={() => onEdit(transaction)}
            className="text-juno-text hover:bg-juno-surface-200 gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit transaction
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(transaction.id)}
          className="text-juno-text hover:bg-juno-surface-200"
        >
          Copy transaction ID
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-juno-border-alpha-soft" />
        
        {onDelete && (
          <DropdownMenuItem 
            onClick={() => onDelete(transaction)}
            className="text-juno-danger-fg hover:bg-juno-danger-bg gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete transaction
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TransactionTable({
  data,
  onEdit,
  onDelete,
  onBulkDelete,
  isLoading = false,
  className,
}: TransactionTableProps) {

  const columns: ColumnDef<TransactionTableRow>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="border-juno-border-alpha-medium data-[state=checked]:bg-juno-accent data-[state=checked]:border-juno-accent"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="border-juno-border-alpha-medium data-[state=checked]:bg-juno-accent data-[state=checked]:border-juno-accent"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 text-juno-muted-fg hover:text-juno-text font-medium"
        >
          Date
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("date"));
        return (
          <div className="text-sm text-juno-text font-medium">
            {date.toLocaleDateString('en-MY', { 
              day: '2-digit',
              month: 'short',
              year: '2-digit'
            })}
          </div>
        );
      },
      size: 120,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 text-juno-muted-fg hover:text-juno-text font-medium"
        >
          Description
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-juno-text font-medium max-w-[200px] truncate">
          {row.getValue("description")}
        </div>
      ),
      size: 200,
    },
    {
      accessorKey: "category_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 text-juno-muted-fg hover:text-juno-text font-medium"
        >
          Category
        </Button>
      ),
      cell: ({ row }) => (
        <Badge 
          variant="secondary" 
          className="bg-juno-surface-200 text-juno-text border-juno-border-alpha-soft text-xs"
        >
          {row.getValue("category_name")}
        </Badge>
      ),
      size: 150,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 text-juno-muted-fg hover:text-juno-text font-medium"
        >
          Amount
        </Button>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"));
        const isNegative = amount < 0;
        
        return (
          <div className={`${getCurrencyClasses("text-sm font-mono font-medium")} ${
            isNegative 
              ? 'text-juno-neutral-600' 
              : 'text-juno-neutral-600'
          }`}>
            {isNegative ? '-' : ''}RM{Math.abs(amount).toFixed(2)}
          </div>
        );
      },
      size: 120,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <TransactionRowActions
          transaction={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-juno-accent"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-juno-muted-fg text-sm">
          No transactions found
        </div>
        <div className="text-juno-muted-fg text-xs mt-1">
          Add your first transaction to get started
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <DataTable 
        columns={columns} 
        data={data}
        enablePagination={true}
        enableSorting={true}
        initialPageSize={5}
      />
    </div>
  );
}