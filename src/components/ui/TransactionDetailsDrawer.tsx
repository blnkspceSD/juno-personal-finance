"use client"

import React, { useState, useMemo, memo, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Trash2, Copy, Loader2, Edit3 } from 'lucide-react';
import { deleteTransactionClient, duplicateTransactionClient } from '@/lib/transactions/client-actions';
import { toast } from '@/lib/utils/toast';
import { EditTransactionForm } from './EditTransactionForm';

import { TransactionWithCategory } from '@/lib/transactions/queries';

interface Transaction extends TransactionWithCategory {
  // Additional optional fields for enhanced display
  notes?: string;
  payment_method?: string;
}

interface TransactionDetailsDrawerProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (transactionId: string) => void;
  onDuplicate?: (transaction: Transaction) => void;
  onTransactionUpdate?: () => void; // Callback to refresh transaction data
  isLoading?: boolean;
  showActions?: {
    delete: boolean;
    duplicate: boolean;
    edit: boolean;
  };
  customTitle?: string;
}

interface TransactionDetailsContentProps {
  transaction: Transaction;
}

function TransactionErrorState() {
  return (
    <div className="flex flex-col items-center justify-center py-juno-16 px-juno-6">
      <div className="text-center space-y-juno-4">
        <div className="mx-auto h-12 w-12 bg-red-100 rounded-juno-lg flex items-center justify-center">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-medium text-juno-text">Transaction not found</h3>
          <p className="text-xs text-juno-muted-fg mt-1">
            Unable to load transaction details
          </p>
        </div>
      </div>
    </div>
  );
}

function TransactionDetailsLoader() {
  return (
    <div className="space-y-juno-6">
      {/* Primary Info Skeleton */}
      <div className="space-y-juno-3">
        <div className="flex justify-between items-start">
          <div className="h-6 bg-juno-surface-200 rounded-juno-md w-3/4 animate-pulse" />
          <div className="text-right space-y-juno-1">
            <div className="h-8 bg-juno-surface-200 rounded-juno-md w-20 animate-pulse" />
            <div className="h-4 bg-juno-surface-200 rounded-juno-md w-16 animate-pulse ml-auto" />
          </div>
        </div>
        <div className="space-y-juno-1">
          <div className="h-4 bg-juno-surface-200 rounded-juno-md w-40 animate-pulse" />
          <div className="h-3 bg-juno-surface-200 rounded-juno-md w-24 animate-pulse" />
        </div>
      </div>
      
      {/* Category Skeleton */}
      <div className="space-y-juno-3">
        <div className="h-4 bg-juno-surface-200 rounded-juno-md w-16 animate-pulse" />
        <div className="flex items-center justify-between p-juno-3 bg-juno-surface-100 rounded-juno-lg">
          <div className="flex items-center space-x-juno-3">
            <div className="w-4 h-4 bg-juno-surface-200 rounded-full animate-pulse" />
            <div className="h-4 bg-juno-surface-200 rounded-juno-md w-24 animate-pulse" />
          </div>
          <div className="h-3 bg-juno-surface-200 rounded-juno-md w-16 animate-pulse" />
        </div>
      </div>

      {/* Transaction Details Skeleton */}
      <div className="space-y-juno-4">
        <div className="h-4 bg-juno-surface-200 rounded-juno-md w-32 animate-pulse" />
        <div className="space-y-juno-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center py-juno-2 border-b border-juno-surface-200">
              <div className="h-4 bg-juno-surface-200 rounded-juno-md w-24 animate-pulse" />
              <div className="h-4 bg-juno-surface-200 rounded-juno-md w-32 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Payment & Receipt Skeleton */}
      {[1, 2].map((i) => (
        <div key={i} className="space-y-juno-3">
          <div className="h-4 bg-juno-surface-200 rounded-juno-md w-28 animate-pulse" />
          <div className="p-juno-3 bg-juno-surface-100 rounded-juno-lg">
            <div className="flex items-center space-x-juno-2">
              <div className="w-2 h-2 bg-juno-surface-200 rounded-full animate-pulse" />
              <div className="h-4 bg-juno-surface-200 rounded-juno-md w-32 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const TransactionDetailsContent = memo(function TransactionDetailsContent({ transaction }: TransactionDetailsContentProps) {
  const formattedData = useMemo(() => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(Math.abs(transaction.amount));

    const formattedDate = new Date(transaction.date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const formattedTime = transaction.created_at ? new Date(transaction.created_at).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }) : null;

    return { formattedAmount, formattedDate, formattedTime };
  }, [transaction.amount, transaction.date, transaction.created_at]);

  const { formattedAmount, formattedDate, formattedTime } = formattedData;

  return (
    <div className="space-y-juno-6">
      {/* Primary Information */}
      <div className="space-y-juno-3">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-medium text-juno-text leading-tight flex-1 pr-juno-4">
            {transaction.description}
          </h2>
          <div className="text-right">
            <div className="text-2xl font-semibold text-juno-text">
              {formattedAmount}
            </div>
            {transaction.amount < 0 && (
              <span className="text-xs text-red-600 font-medium">EXPENSE</span>
            )}
            {transaction.amount > 0 && (
              <span className="text-xs text-green-600 font-medium">INCOME</span>
            )}
          </div>
        </div>
        <div className="space-y-juno-1">
          <p className="text-sm text-juno-text font-medium">
            {formattedDate}
          </p>
          {formattedTime && (
            <p className="text-xs text-juno-muted-fg">
              Added at {formattedTime}
            </p>
          )}
        </div>
      </div>

      {/* Category Section */}
      <div className="space-y-juno-3">
        <h3 className="text-sm font-medium text-juno-text">Category</h3>
        <div className="flex items-center justify-between p-juno-3 bg-juno-surface-100 rounded-juno-lg">
          <div className="flex items-center space-x-juno-3">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: transaction.category_color || 'var(--juno-muted-fg)' }}
            />
            <span className="text-sm font-medium text-juno-text">{transaction.category_name}</span>
          </div>
          <span className="text-xs text-juno-muted-fg">ID: {transaction.category_id.slice(-8)}</span>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="space-y-juno-4">
        <h3 className="text-sm font-medium text-juno-text">Transaction Details</h3>
        
        <div className="space-y-juno-3">
          <div className="flex justify-between items-center py-juno-2 border-b border-juno-surface-200">
            <span className="text-sm text-juno-muted-fg">Transaction ID</span>
            <span className="text-sm font-mono text-juno-text">{transaction.id.slice(-12)}</span>
          </div>
          
          <div className="flex justify-between items-center py-juno-2 border-b border-juno-surface-200">
            <span className="text-sm text-juno-muted-fg">Amount (Raw)</span>
            <span className="text-sm font-mono text-juno-text">
              ${Math.abs(transaction.amount).toFixed(2)}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-juno-2 border-b border-juno-surface-200">
            <span className="text-sm text-juno-muted-fg">Date</span>
            <span className="text-sm font-mono text-juno-text">{transaction.date}</span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="space-y-juno-3">
        <h3 className="text-sm font-medium text-juno-text">Payment Method</h3>
        <div className="p-juno-3 bg-juno-surface-100 rounded-juno-lg">
          {transaction.payment_method ? (
            <div className="flex items-center space-x-juno-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-juno-text">{transaction.payment_method}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-juno-2">
              <div className="w-2 h-2 rounded-full bg-juno-muted-fg" />
              <span className="text-sm text-juno-muted-fg">Not specified</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Notes Section */}
      {transaction.notes && (
        <div className="space-y-juno-3">
          <h3 className="text-sm font-medium text-juno-text">Notes</h3>
          <div className="p-juno-3 bg-blue-50 border border-blue-200 rounded-juno-lg">
            <p className="text-sm text-blue-900">{transaction.notes}</p>
          </div>
        </div>
      )}
      
      {/* Receipt Section */}
      <div className="space-y-juno-3">
        <h3 className="text-sm font-medium text-juno-text">Receipt</h3>
        <div className="p-juno-3 bg-juno-surface-100 rounded-juno-lg">
          {transaction.receipt_url ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-juno-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-juno-text">Receipt attached</span>
              </div>
              <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                View
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-juno-2">
              <div className="w-2 h-2 rounded-full bg-juno-muted-fg" />
              <span className="text-sm text-juno-muted-fg">No receipt attached</span>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="pt-juno-4 border-t border-juno-surface-200">
        <h4 className="text-xs font-medium text-juno-muted-fg mb-juno-2 uppercase tracking-wide">
          System Information
        </h4>
        <div className="space-y-juno-1">
          {transaction.created_at && (
            <div className="flex justify-between text-xs">
              <span className="text-juno-muted-fg">Created</span>
              <span className="text-juno-muted-fg font-mono">
                {new Date(transaction.created_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}
          {transaction.updated_at && transaction.updated_at !== transaction.created_at && (
            <div className="flex justify-between text-xs">
              <span className="text-juno-muted-fg">Last Modified</span>
              <span className="text-juno-muted-fg font-mono">
                {new Date(transaction.updated_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export function TransactionDetailsDrawer({
  transaction,
  isOpen,
  onClose,
  onDelete,
  onDuplicate,
  onTransactionUpdate,
  isLoading = false,
  showActions = { delete: true, duplicate: true, edit: true },
  customTitle = "Transaction Details"
}: TransactionDetailsDrawerProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    // Optimistic update - immediately show success feedback
    toast.success('Deleting transaction...');
    
    try {
      const result = await deleteTransactionClient(transaction.id);
      
      if (result.success) {
        toast.success('Transaction deleted successfully');
        onDelete?.(transaction.id);
        onTransactionUpdate?.(); // Trigger data refresh
        onClose(); // Close the drawer
      } else {
        console.error('Delete failed:', result.error);
        toast.error(result.error || 'Failed to delete transaction');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('An unexpected error occurred while deleting the transaction');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    
    // Optimistic update - immediately show progress feedback
    toast.success('Duplicating transaction...');
    
    try {
      const result = await duplicateTransactionClient(transaction.id);
      
      if (result.success) {
        toast.success('Transaction duplicated successfully');
        onDuplicate?.(transaction);
        onTransactionUpdate?.(); // Trigger data refresh
        onClose(); // Close the drawer
      } else {
        console.error('Duplicate failed:', result.error);
        toast.error(result.error || 'Failed to duplicate transaction');
      }
    } catch (error) {
      console.error('Duplicate error:', error);
      toast.error('An unexpected error occurred while duplicating the transaction');
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleEditSave = useCallback((updatedTransaction: Transaction) => {
    setIsEditing(false);
    onTransactionUpdate?.(); // Refresh data to show changes
    toast.success('Transaction updated successfully');
  }, [onTransactionUpdate]);

  const handleEditCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <SheetContent onClose={onClose}>
            <SheetHeader>
              <SheetTitle>{isEditing ? 'Edit Transaction' : customTitle}</SheetTitle>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto px-juno-6 py-juno-4">
              {isLoading ? (
                <TransactionDetailsLoader />
              ) : !transaction?.id ? (
                <TransactionErrorState />
              ) : isEditing ? (
                <EditTransactionForm 
                  transaction={transaction}
                  onSave={handleEditSave}
                  onCancel={handleEditCancel}
                />
              ) : (
                <TransactionDetailsContent transaction={transaction} />
              )}
            </div>
            
            {!isEditing && (showActions.edit || showActions.delete || showActions.duplicate) && (
              <SheetFooter className="flex-col sm:flex-col space-y-juno-3 sm:space-y-juno-3 sm:space-x-0">
                {showActions.edit && (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setIsEditing(true)}
                    disabled={isDeleting || isDuplicating}
                    icon={<Edit3 className="h-4 w-4" />}
                  >
                    Edit Transaction
                  </Button>
                )}
                
                {showActions.delete && (
                  <Button
                    variant="destructive"
                    size="md"
                    onClick={handleDelete}
                    disabled={isDeleting || isDuplicating}
                    loading={isDeleting}
                    icon={<Trash2 className="h-4 w-4" />}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Transaction'}
                  </Button>
                )}
                
                {showActions.duplicate && (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleDuplicate}
                    disabled={isDeleting || isDuplicating}
                    loading={isDuplicating}
                    icon={<Copy className="h-4 w-4" />}
                  >
                    {isDuplicating ? 'Duplicating...' : 'Duplicate Transaction'}
                  </Button>
                )}
              </SheetFooter>
            )}
          </SheetContent>
        </Sheet>
      )}
    </AnimatePresence>
  );
}