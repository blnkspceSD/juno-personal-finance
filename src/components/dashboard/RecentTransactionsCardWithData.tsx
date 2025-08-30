'use client'

import React, { useState, useCallback, memo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ButtonPair } from '@/components/ui/button-pair'
import { TransactionDetailsDrawer } from '@/components/ui/TransactionDetailsDrawer'
import { Plus, RefreshCw, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRecentTransactions } from '@/hooks/use-recent-transactions'
import { TransactionWithCategory } from '@/lib/transactions/queries'

interface ClickableTransactionItemProps {
  transaction: TransactionWithCategory;
  onClick: (transaction: TransactionWithCategory) => void;
  isSelected?: boolean;
}

const ClickableTransactionItem = memo(function ClickableTransactionItem({ 
  transaction, 
  onClick, 
  isSelected = false 
}: ClickableTransactionItemProps) {
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(transaction);
    }
  }, [onClick, transaction]);

  const handleClick = useCallback(() => {
    onClick(transaction);
  }, [onClick, transaction]);

  const formattedAmount = `$${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const formattedDate = new Date(transaction.date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
  const ariaLabel = `View transaction details: ${transaction.description}, ${formattedAmount} on ${formattedDate}`;

  return (
    <div
      className={cn(
        "flex items-center px-juno-4 py-juno-4 transition-all duration-150 cursor-pointer",
        "hover:bg-juno-surface-300 active:bg-juno-surface-400",
        "focus-visible:outline-2 focus-visible:outline-juno-focus-ring focus-visible:outline-offset-2",
        "focus-visible:rounded-juno-md",
        "min-h-[48px]", // Ensure minimum touch target size
        "touch-manipulation", // Improve touch responsiveness
        isSelected && "bg-juno-surface-300"
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={ariaLabel}
      aria-expanded={isSelected}
      aria-haspopup="dialog"
    >
      {/* Color indicator bar */}
      <div 
        className="w-1 h-10 rounded-full mr-juno-4 flex-shrink-0"
        style={{ backgroundColor: transaction.category_color || 'var(--juno-muted-fg)' }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-juno-text truncate">
          {transaction.description}
        </p>
        <p className="text-xs text-juno-muted-fg">
          {formattedDate}
        </p>
      </div>
      <div className="text-right ml-juno-4">
        <p className="text-sm font-medium text-juno-text">
          {formattedAmount}
        </p>
      </div>
    </div>
  );
});

function LoadingState() {
  return (
    <div className="space-y-0 flex-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center px-juno-4 py-juno-4">
          <div className="w-1 h-10 rounded-full mr-juno-4 bg-juno-surface-200 animate-pulse" />
          <div className="flex-1 space-y-juno-2">
            <div className="h-4 bg-juno-surface-200 rounded-juno-md w-3/4 animate-pulse" />
            <div className="h-3 bg-juno-surface-200 rounded-juno-md w-1/3 animate-pulse" />
          </div>
          <div className="ml-juno-4">
            <div className="h-4 bg-juno-surface-200 rounded-juno-md w-16 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center py-juno-16 px-8">
      <div className="text-center space-y-juno-4">
        <div className="mx-auto h-12 w-12 bg-red-100 rounded-juno-lg flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-juno-text">Failed to load transactions</h3>
          <p className="text-xs text-juno-muted-fg mt-1">{error}</p>
        </div>
        <Button variant="secondary" size="md" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  );
}

export const RecentTransactionsCardWithData = memo(function RecentTransactionsCardWithData() {
  const { transactions, isLoading, error, refetch } = useRecentTransactions(6);
  const [openDrawerId, setOpenDrawerId] = useState<string | null>(null);
  const [isLoadingDrawer, setIsLoadingDrawer] = useState(false);

  const handleTransactionClick = useCallback((transaction: TransactionWithCategory) => {
    setIsLoadingDrawer(true);
    setOpenDrawerId(transaction.id);
    
    // Brief loading for UX
    setTimeout(() => setIsLoadingDrawer(false), 150);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setOpenDrawerId(null);
  }, []);

  const handleDelete = useCallback((transactionId: string) => {
    refetch(); // Refresh data after delete
    setOpenDrawerId(null);
  }, [refetch]);

  const handleDuplicate = useCallback((transaction: TransactionWithCategory) => {
    refetch(); // Refresh data after duplicate
    setOpenDrawerId(null);
  }, [refetch]);

  const selectedTransaction = transactions.find(t => t.id === openDrawerId) || transactions[0];

  return (
    <Card 
      variant="outlined" 
      className="flex flex-col h-full"
      style={{
        "--card-header-pad-block": "32px", 
        "--card-header-pad-inline": "32px",
        "--card-content-pad-block": "0", 
        "--card-content-pad-inline": "0"
      } as React.CSSProperties}
    >
      <CardHeader>
        <CardTitle className="!text-sm !text-gray-400 !font-medium tracking-wider">RECENT TRANSACTIONS</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : transactions.length > 0 ? (
          <>
            <div className="space-y-0 flex-1">
              {transactions.map((transaction) => (
                <ClickableTransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onClick={handleTransactionClick}
                  isSelected={openDrawerId === transaction.id}
                />
              ))}
            </div>
            
            {/* Action Button - Single Add Transaction button */}
            <div className="px-8 pb-8 pt-juno-4">
              <Button variant="secondary" size="md" className="w-full" asChild>
                <Link href="/dashboard/transactions/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add transaction
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-juno-16 px-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-juno-surface-200 rounded-juno-lg flex items-center justify-center mb-juno-4">
                <svg className="h-6 w-6 text-juno-muted-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm text-juno-muted-fg mb-juno-4">No transactions yet</p>
              <Button variant="primary" size="md" asChild>
                <Link href="/dashboard/transactions/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Transaction Details Drawer */}
        {selectedTransaction && (
          <TransactionDetailsDrawer
            transaction={selectedTransaction}
            isOpen={!!openDrawerId}
            isLoading={isLoadingDrawer}
            onClose={handleDrawerClose}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onTransactionUpdate={refetch}
            showActions={{ delete: true, duplicate: true, edit: true }}
          />
        )}
      </CardContent>
    </Card>
  )
});