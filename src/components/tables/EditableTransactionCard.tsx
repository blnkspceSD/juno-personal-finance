/**
 * Editable Transaction Card Component
 * Enhanced version of TransactionCard with inline editing capabilities
 * Supports both card-level inline editing with smart category suggestions
 */

"use client";

import * as React from "react";
import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Edit3 } from "lucide-react";

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
import { InlineTransactionEditor } from "@/components/forms/InlineTransactionEditor";
import type { Transaction, Category, UpdateTransactionForm } from "@/lib/types/database";

export interface EditableTransactionCardRow extends Transaction {
  category: Category;
}

interface EditableTransactionCardProps {
  transaction: EditableTransactionCardRow;
  categories: Category[];
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onUpdate?: (data: UpdateTransactionForm) => Promise<void>;
  onDelete?: (transaction: EditableTransactionCardRow) => void;
  onCategoryCreate?: (name: string) => Promise<string | null>;
  onClick?: (transaction: EditableTransactionCardRow) => void;
  userId?: string;
  allowInlineEditing?: boolean;
  allowCategoryCreation?: boolean;
}

export function EditableTransactionCard({
  transaction,
  categories,
  isSelected = false,
  onSelect,
  onUpdate,
  onDelete,
  onCategoryCreate,
  onClick,
  userId,
  allowInlineEditing = true,
  allowCategoryCreation = false,
}: EditableTransactionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  const date = new Date(transaction.date);
  const amount = parseFloat(transaction.amount.toString());
  const formattedAmount = formatCurrency(amount);

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async (updateData: UpdateTransactionForm) => {
    if (onUpdate) {
      try {
        await onUpdate(updateData);
        setIsEditing(false);
      } catch (error) {
        // Error will be handled by the inline editor
        throw error;
      }
    }
  };

  if (isEditing) {
    return (
      <Card className="transition-all duration-200 border-blue-200 bg-blue-50">
        <CardContent className="p-0">
          <InlineTransactionEditor
            transaction={transaction}
            categories={categories}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
            onCategoryCreate={onCategoryCreate}
            userId={userId}
            compact={false}
            allowCategoryCreation={allowCategoryCreation}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`transition-all duration-200 ${
        onClick ? "cursor-pointer hover:shadow-md" : ""
      } ${isSelected ? "ring-2 ring-primary" : ""} group`}
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
          <div className="flex items-center gap-1">
            {/* Quick edit button (visible on hover) */}
            {allowInlineEditing && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartEdit();
                }}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Quick edit"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            )}

            {/* More actions dropdown */}
            {(allowInlineEditing || onDelete) && (
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
                  {allowInlineEditing && (
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit();
                      }}
                    >
                      <Edit3 className="mr-2 h-4 w-4" />
                      Quick edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      // onEdit could open a full edit modal if needed
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit transaction
                  </DropdownMenuItem>
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
        </div>
      </CardContent>
    </Card>
  );
}