"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TransactionTable, TransactionTableRow } from "./TransactionTable";
import { TransactionCard } from "./TransactionCard";

interface ResponsiveTransactionViewProps {
  data: TransactionTableRow[];
  onEdit?: (transaction: TransactionTableRow) => void;
  onDelete?: (transaction: TransactionTableRow) => void;
  onBulkDelete?: (transactions: TransactionTableRow[]) => void;
  isLoading?: boolean;
  className?: string;
}

export function ResponsiveTransactionView({
  data,
  onEdit,
  onDelete,
  onBulkDelete,
  isLoading = false,
  className,
}: ResponsiveTransactionViewProps) {
  const [selectedTransactions, setSelectedTransactions] = React.useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = React.useState(false);

  // Check if mobile view should be used
  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleSelectTransaction = (transactionId: string, selected: boolean) => {
    const newSelected = new Set(selectedTransactions);
    if (selected) {
      newSelected.add(transactionId);
    } else {
      newSelected.delete(transactionId);
    }
    setSelectedTransactions(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedTransactions(new Set(data.map(t => t.id)));
    } else {
      setSelectedTransactions(new Set());
    }
  };

  const getSelectedTransactionObjects = () => {
    return data.filter(t => selectedTransactions.has(t.id));
  };

  const handleBulkDelete = () => {
    const selectedObjects = getSelectedTransactionObjects();
    onBulkDelete?.(selectedObjects);
    setSelectedTransactions(new Set());
  };

  // Desktop/Tablet: Use table view
  if (!isMobile) {
    return (
      <TransactionTable
        data={data}
        onEdit={onEdit}
        onDelete={onDelete}
        onBulkDelete={onBulkDelete}
        isLoading={isLoading}
        className={className}
      />
    );
  }

  // Mobile: Use card view
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Mobile Bulk Actions */}
      {selectedTransactions.size > 0 && onBulkDelete && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTransactions(new Set())}
            >
              Clear
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedTransactions.size} selected
            </span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      )}

      {/* Mobile Select All */}
      {data.length > 0 && onBulkDelete && (
        <div className="flex items-center justify-between px-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSelectAll(selectedTransactions.size !== data.length)}
          >
            {selectedTransactions.size === data.length ? "Deselect All" : "Select All"}
          </Button>
          <span className="text-sm text-muted-foreground">
            {data.length} transaction{data.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Mobile Cards */}
      <div className="space-y-3">
        {data.length > 0 ? (
          data.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              isSelected={selectedTransactions.has(transaction.id)}
              onSelect={(selected) => handleSelectTransaction(transaction.id, selected)}
              onEdit={onEdit}
              onDelete={onDelete}
              onClick={(transaction) => {
                // Optional: Handle card click for quick view/edit
                console.log("Transaction clicked:", transaction);
              }}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No transactions found.</p>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="text-sm text-muted-foreground">Loading transactions...</div>
        </div>
      )}
    </div>
  );
}