'use client'

import React, { useState, useCallback, memo, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ButtonPair } from '@/components/ui/button-pair'
import { TransactionDetailsDrawer } from '@/components/ui/TransactionDetailsDrawer'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Transaction {
  id: string
  user_id: string
  description: string
  amount: number
  date: string
  category_id: string
  category_name: string
  category_color?: string
  receipt_url?: string
  created_at: string
  updated_at: string
  notes?: string
  payment_method?: string
}


interface ClickableTransactionItemProps {
  transaction: Transaction;
  onClick: (transaction: Transaction) => void;
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

  const formattedData = useMemo(() => {
    const formattedAmount = `$${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    const formattedDate = new Date(transaction.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    const ariaLabel = `View transaction details: ${transaction.description}, ${formattedAmount} on ${formattedDate}`;
    
    return { formattedAmount, formattedDate, ariaLabel };
  }, [transaction.amount, transaction.date, transaction.description]);

  const { formattedAmount, formattedDate, ariaLabel } = formattedData;

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

interface RecentTransactionsCardProps {
  transactions: Transaction[]
  onTransactionUpdate?: () => void // Callback to refresh transaction data
}

export const RecentTransactionsCard = memo(function RecentTransactionsCard({ 
  transactions, 
  onTransactionUpdate 
}: RecentTransactionsCardProps) {
  const [openDrawerId, setOpenDrawerId] = useState<string | null>(null);
  const [isLoadingDrawer, setIsLoadingDrawer] = useState(false);

  const handleTransactionClick = useCallback((transaction: Transaction) => {
    setIsLoadingDrawer(true);
    setOpenDrawerId(transaction.id);
    
    // Simulate brief loading for UX (in real app, this would be actual data fetch)
    setTimeout(() => setIsLoadingDrawer(false), 150);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setOpenDrawerId(null);
  }, []);

  const handleDelete = useCallback((transactionId: string) => {
    console.log('Transaction deleted:', transactionId);
    onTransactionUpdate?.(); // Notify parent to refresh data
    setOpenDrawerId(null);
  }, [onTransactionUpdate]);

  const handleDuplicate = useCallback((transaction: Transaction) => {
    console.log('Transaction duplicated:', transaction);
    onTransactionUpdate?.(); // Notify parent to refresh data
    setOpenDrawerId(null);
  }, [onTransactionUpdate]);

  const selectedTransaction = useMemo(() => 
    transactions.find(t => t.id === openDrawerId) || transactions[0],
    [transactions, openDrawerId]
  );

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
        {transactions.length > 0 ? (
          <>
            <div className="space-y-0 flex-1">
              {transactions.slice(0, 6).map((transaction) => (
                <ClickableTransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onClick={handleTransactionClick}
                  isSelected={openDrawerId === transaction.id}
                />
              ))}
            </div>
            
            {/* Action Buttons - Using ButtonPair component */}
            <div className="px-8 pb-8 pt-juno-4">
              <ButtonPair direction="auto" aria-label="Transaction actions">
                <Button variant="secondary" size="md" className="flex-1" asChild>
                  <Link href="/dashboard/transactions/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add transaction
                  </Link>
                </Button>
                <Button variant="ghost" size="md" className="flex-1" asChild>
                  <Link href="/dashboard/transactions">
                    View all
                  </Link>
                </Button>
              </ButtonPair>
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
        <TransactionDetailsDrawer
          transaction={selectedTransaction}
          isOpen={!!openDrawerId}
          isLoading={isLoadingDrawer}
          onClose={handleDrawerClose}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onTransactionUpdate={onTransactionUpdate}
          showActions={{ delete: false, duplicate: true, edit: true }} // Hide delete in recent transactions
        />
      </CardContent>
    </Card>
  )
});