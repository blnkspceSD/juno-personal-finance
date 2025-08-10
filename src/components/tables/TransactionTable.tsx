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
  category: Category;
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

  return (
    <div className="space-y-4">
      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data}
        className={className}
        onRowClick={(transaction) => {
          // Optional: Handle row click for quick edit
          console.log("Transaction clicked:", transaction);
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