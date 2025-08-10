"use client";

import * as React from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, getCurrencyClasses } from "@/lib/utils/currency";
import { TransactionTableRow } from "./TransactionTable";

interface TransactionCardProps {
  transaction: TransactionTableRow;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onEdit?: (transaction: TransactionTableRow) => void;
  onDelete?: (transaction: TransactionTableRow) => void;
  onClick?: (transaction: TransactionTableRow) => void;
}

export function TransactionCard({
  transaction,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onClick,
}: TransactionCardProps) {
  const date = new Date(transaction.date);
  const amount = parseFloat(transaction.amount.toString());
  const formattedAmount = formatCurrency(amount);

  return (
    <Card 
      className={`transition-all duration-200 ${
        onClick ? "cursor-pointer hover:shadow-md" : ""
      } ${isSelected ? "ring-2 ring-primary" : ""}`}
      onClick={() => onClick?.(transaction)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Left side - Selection and Details */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {onSelect && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelect}
                className="mt-1"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            
            <div className="flex-1 min-w-0 space-y-2">
              {/* Date and Amount Row */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className={getCurrencyClasses("font-semibold text-slate-700")}>
                  {formattedAmount}
                </div>
              </div>

              {/* Description */}
              <div className="font-medium text-foreground truncate">
                {transaction.description}
              </div>

              {/* Category Badge */}
              <div>
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: `${transaction.category.color}15`,
                    color: transaction.category.color,
                    borderColor: `${transaction.category.color}30`,
                  }}
                  className="text-xs"
                >
                  {transaction.category.name}
                </Badge>
              </div>

              {/* Created Date */}
              <div className="text-xs text-muted-foreground">
                Created {new Date(transaction.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* Right side - Actions */}
          {(onEdit || onDelete) && (
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
                    navigator.clipboard.writeText(transaction.id);
                  }}
                >
                  Copy transaction ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {onEdit && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(transaction);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit transaction
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(transaction);
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete transaction
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}