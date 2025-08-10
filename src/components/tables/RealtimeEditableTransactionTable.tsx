/**
 * Realtime Editable Transaction Table Component
 * Enhanced version of RealtimeTransactionTable with inline editing capabilities
 * Combines real-time updates with optimistic inline editing for seamless UX
 */

"use client";

import * as React from "react";
import { useRealtimeBalance } from "@/lib/hooks/useRealtimeBalance";
import { createClient } from "@/lib/supabase/client";
import { Transaction, Category, UpdateTransactionForm } from "@/lib/types/database";
import { categorySpentService } from "@/lib/services/categorySpentService";
import { EditableTransactionCard, EditableTransactionCardRow } from "./EditableTransactionCard";
import { SimpleEditableTransactionTable, SimpleEditableTransactionRow } from "./SimpleEditableTransactionTable";

interface RealtimeEditableTransactionTableProps {
  budgetId: string;
  initialTransactions: Transaction[];
  categories: Category[];
  userId: string;
  onEdit?: (transaction: SimpleEditableTransactionRow) => void; // For full edit modal/page
  onDelete?: (transaction: SimpleEditableTransactionRow) => void;
  onBulkDelete?: (transactions: SimpleEditableTransactionRow[]) => void;
  onCategoryCreate?: (name: string) => Promise<string | null>;
  viewMode?: 'table' | 'cards';
  allowInlineEditing?: boolean;
  allowCategoryCreation?: boolean;
  className?: string;
}

export function RealtimeEditableTransactionTable({
  budgetId,
  initialTransactions,
  categories,
  userId,
  onEdit,
  onDelete,
  onBulkDelete,
  onCategoryCreate,
  viewMode = 'table',
  allowInlineEditing = true,
  allowCategoryCreation = false,
  className,
}: RealtimeEditableTransactionTableProps) {
  const [transactions, setTransactions] = React.useState<Transaction[]>(initialTransactions);
  const [isUpdating, setIsUpdating] = React.useState<string | null>(null); // Track which transaction is being updated
  const { optimisticTransactions, connectionState } = useRealtimeBalance(budgetId);
  const supabase = createClient();

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
    const realTransactions = transactions.map((transaction): EditableTransactionCardRow => ({
      ...transaction,
      category: categoryMap[transaction.category_id] || {
        id: transaction.category_id,
        name: "Unknown Category",
        color: "#gray-500",
        allocated: 0,
        spent: 0,
        sort_order: 999,
        user_id: userId,
        budget_id: budgetId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Category,
    }));

    // Add optimistic transactions (pending ones that haven't been confirmed)
    const optimisticTableRows = optimisticTransactions
      .filter(opt => !transactions.some(real => real.id === opt.id))
      .map((optimistic): EditableTransactionCardRow => ({
        id: optimistic.id,
        user_id: userId,
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
          user_id: userId,
          budget_id: budgetId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Category,
      }));

    // Combine and sort by date (newest first)
    return [...realTransactions, ...optimisticTableRows].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactions, optimisticTransactions, categoryMap, userId, budgetId]);

  // Handle inline transaction updates with optimistic updates
  const handleInlineUpdate = React.useCallback(async (updateData: UpdateTransactionForm) => {
    setIsUpdating(updateData.id);
    
    try {
      // Optimistic update - immediately update local state
      const optimisticTransaction = {
        ...updateData,
        amount: updateData.amount!,
        description: updateData.description!,
        category_id: updateData.category_id!,
        date: updateData.date!,
      };

      setTransactions(prev => 
        prev.map(transaction => 
          transaction.id === updateData.id 
            ? { ...transaction, ...optimisticTransaction, updated_at: new Date().toISOString() }
            : transaction
        )
      );

      // Update in database
      const { error } = await supabase
        .from('transactions')
        .update({
          amount: updateData.amount,
          description: updateData.description,
          category_id: updateData.category_id,
          date: updateData.date
        })
        .eq('id', updateData.id);

      if (error) {
        // Revert optimistic update on error
        setTransactions(prev => 
          prev.map(transaction => 
            transaction.id === updateData.id 
              ? initialTransactions.find(t => t.id === updateData.id) || transaction
              : transaction
          )
        );
        throw new Error(`Failed to update transaction: ${error.message}`);
      }

      // Update category spent amounts manually (since we removed the automatic trigger)
      try {
        const oldTransaction = initialTransactions.find(t => t.id === updateData.id)
        await categorySpentService.handleTransactionChange(
          'update',
          { category_id: updateData.category_id! },
          oldTransaction ? { category_id: oldTransaction.category_id } : undefined
        )
      } catch (spentUpdateError) {
        console.warn('Failed to update category spent amounts:', spentUpdateError)
        // Don't fail the transaction update for this
      }
      
      // Success - the real-time subscription will handle the final update
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error; // Re-throw to be handled by the inline editor
    } finally {
      setIsUpdating(null);
    }
  }, [supabase, initialTransactions]);

  // Enhanced handlers that provide optimistic updates
  const handleOptimisticEdit = React.useCallback((transaction: SimpleEditableTransactionRow) => {
    // Call the original edit handler
    onEdit?.(transaction);
  }, [onEdit]);

  const handleOptimisticDelete = React.useCallback(async (transaction: SimpleEditableTransactionRow) => {
    try {
      // Immediately remove from local state for optimistic update
      setTransactions(prev => prev.filter(t => t.id !== transaction.id));
      
      // Store original transaction for spent amount update
      const originalTransaction = initialTransactions.find(t => t.id === transaction.id)
      
      // Delete from database
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transaction.id);

      if (error) {
        // Revert optimistic update on error
        if (originalTransaction) {
          setTransactions(prev => [...prev, originalTransaction].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          ));
        }
        throw new Error(`Failed to delete transaction: ${error.message}`);
      }
      
      // Update category spent amounts manually
      if (originalTransaction) {
        try {
          await categorySpentService.handleTransactionChange(
            'delete',
            undefined,
            { category_id: originalTransaction.category_id }
          )
        } catch (spentUpdateError) {
          console.warn('Failed to update category spent amounts:', spentUpdateError)
          // Don't fail the transaction delete for this
        }
      }
      
      // Call the original delete handler for any additional logic
      onDelete?.(transaction);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      // Could show a toast notification here
    }
  }, [onDelete, supabase, initialTransactions]);

  const handleOptimisticBulkDelete = React.useCallback(async (transactions: SimpleEditableTransactionRow[]) => {
    const transactionIds = transactions.map(t => t.id);
    
    try {
      // Immediately remove from local state for optimistic update
      setTransactions(prev => prev.filter(t => !transactionIds.includes(t.id)));
      
      // Delete from database
      const { error } = await supabase
        .from('transactions')
        .delete()
        .in('id', transactionIds);

      if (error) {
        // Revert optimistic update on error
        const originalTransactions = initialTransactions.filter(t => transactionIds.includes(t.id));
        setTransactions(prev => [...prev, ...originalTransactions].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
        throw new Error(`Failed to delete transactions: ${error.message}`);
      }
      
      // Call the original bulk delete handler
      onBulkDelete?.(transactions);
    } catch (error) {
      console.error('Error bulk deleting transactions:', error);
      // Could show a toast notification here
    }
  }, [onBulkDelete, supabase, initialTransactions]);

  const handleQuickEdit = React.useCallback((transaction: SimpleEditableTransactionRow) => {
    // For table view, this could open an inline edit modal or drawer
    // For now, we'll just call the regular edit handler
    onEdit?.(transaction);
  }, [onEdit]);

  if (viewMode === 'cards') {
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

        {/* Transaction Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mergedTransactions.map((transaction) => (
            <EditableTransactionCard
              key={transaction.id}
              transaction={transaction}
              categories={categories}
              onUpdate={handleInlineUpdate}
              onDelete={handleOptimisticDelete}
              onCategoryCreate={onCategoryCreate}
              userId={userId}
              allowInlineEditing={allowInlineEditing}
              allowCategoryCreation={allowCategoryCreation}
            />
          ))}
        </div>

        {mergedTransactions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No transactions found.
          </div>
        )}
      </div>
    );
  }

  // Table view
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

      {/* Simple Editable Transaction Table */}
      <SimpleEditableTransactionTable
        data={mergedTransactions as SimpleEditableTransactionRow[]}
        categories={categories}
        onUpdate={handleInlineUpdate}
        onEdit={handleOptimisticEdit}
        onDelete={handleOptimisticDelete}
        onBulkDelete={handleOptimisticBulkDelete}
        onQuickEdit={handleQuickEdit}
        onCategoryCreate={onCategoryCreate}
        userId={userId}
        isLoading={isUpdating !== null}
        allowQuickEdit={allowInlineEditing}
        allowCategoryCreation={allowCategoryCreation}
        className={className}
      />
    </div>
  );
}