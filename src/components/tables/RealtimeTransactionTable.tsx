"use client";

import * as React from "react";
import { useRealtimeBalance } from "@/lib/hooks/useRealtimeBalance";
import { Transaction, Category } from "@/lib/types/database";
import { ResponsiveTransactionView } from "./ResponsiveTransactionView";
import { TransactionTableRow } from "./TransactionTable";

interface RealtimeTransactionTableProps {
  budgetId: string;
  initialTransactions: Transaction[];
  categories: Category[];
  onEdit?: (transaction: TransactionTableRow) => void;
  onDelete?: (transaction: TransactionTableRow) => void;
  onBulkDelete?: (transactions: TransactionTableRow[]) => void;
  className?: string;
}

export function RealtimeTransactionTable({
  budgetId,
  initialTransactions,
  categories,
  onEdit,
  onDelete,
  onBulkDelete,
  className,
}: RealtimeTransactionTableProps) {
  const [transactions, setTransactions] = React.useState<Transaction[]>(initialTransactions);
  const { optimisticTransactions, connectionState } = useRealtimeBalance(budgetId);

  // Update transactions when initial data changes
  React.useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  // Create category lookup map for performance
  const categoryMap = React.useMemo(() => {
    return categories.reduce((map, category) => {
      map[category.id] = category;
      return map;
    }, {} as Record<string, Category>);
  }, [categories]);

  // Merge real transactions with optimistic updates
  const mergedTransactions = React.useMemo(() => {
    const realTransactions = transactions.map((transaction): TransactionTableRow => ({
      ...transaction,
      category: categoryMap[transaction.category_id] || {
        id: transaction.category_id,
        name: "Unknown Category",
        color: "#gray-500",
        allocated: 0,
        spent: 0,
        sort_order: 999,
      } as Category,
    }));

    // Add optimistic transactions (pending ones that haven't been confirmed)
    const optimisticTableRows = optimisticTransactions
      .filter(opt => !transactions.some(real => real.id === opt.id))
      .map((optimistic): TransactionTableRow => ({
        id: optimistic.id,
        user_id: "", // Will be filled by server
        category_id: optimistic.category_id,
        amount: optimistic.amount,
        description: optimistic.description,
        date: optimistic.date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: categoryMap[optimistic.category_id] || {
          id: optimistic.category_id,
          name: "Unknown Category",
          color: "#gray-500",
          allocated: 0,
          spent: 0,
          sort_order: 999,
        } as Category,
      }));

    // Combine and sort by date (newest first)
    return [...realTransactions, ...optimisticTableRows].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactions, optimisticTransactions, categoryMap]);

  // Enhanced handlers that provide optimistic updates
  const handleOptimisticEdit = React.useCallback((transaction: TransactionTableRow) => {
    // Call the original edit handler
    onEdit?.(transaction);
    
    // Optionally add optimistic update logic here
    // This would immediately update the UI while the request is being processed
  }, [onEdit]);

  const handleOptimisticDelete = React.useCallback((transaction: TransactionTableRow) => {
    // Immediately remove from local state for optimistic update
    setTransactions(prev => prev.filter(t => t.id !== transaction.id));
    
    // Call the original delete handler
    onDelete?.(transaction);
    
    // Note: If the delete fails, you would need to restore the transaction
    // This could be handled by the parent component or through error handling
  }, [onDelete]);

  const handleOptimisticBulkDelete = React.useCallback((transactions: TransactionTableRow[]) => {
    const transactionIds = transactions.map(t => t.id);
    
    // Immediately remove from local state for optimistic update
    setTransactions(prev => prev.filter(t => !transactionIds.includes(t.id)));
    
    // Call the original bulk delete handler
    onBulkDelete?.(transactions);
  }, [onBulkDelete]);

  return (
    <div className="space-y-4">
      {/* Connection Status Indicator */}
      {connectionState.status !== 'connected' && (
        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          <span className="text-sm text-yellow-700">
            {connectionState.status === 'connecting' ? 'Connecting to real-time updates...' : 
             'Real-time updates offline'}
          </span>
        </div>
      )}

      {/* Optimistic Transactions Indicator */}
      {optimisticTransactions.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-sm text-blue-700">
            {optimisticTransactions.length} transaction{optimisticTransactions.length !== 1 ? 's' : ''} pending...
          </span>
        </div>
      )}

      {/* Responsive Transaction View */}
      <ResponsiveTransactionView
        data={mergedTransactions}
        onEdit={handleOptimisticEdit}
        onDelete={handleOptimisticDelete}
        onBulkDelete={handleOptimisticBulkDelete}
        isLoading={false}
        className={className}
      />
    </div>
  );
}