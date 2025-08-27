'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface Transaction {
  id: string
  description: string
  amount: number
  date: string
  category_id: string
  category_name: string
  category_color?: string
}

interface RecentTransactionsCardProps {
  transactions: Transaction[]
}

export function RecentTransactionsCard({ transactions }: RecentTransactionsCardProps) {
  return (
    <Card className="bg-juno-surface-50 rounded-juno-xl shadow-juno-card-with-stroke flex flex-col h-full">
      <CardHeader className="px-juno-6 pb-juno-4">
        <CardTitle className="!text-sm !text-gray-400 !font-medium tracking-wider">RECENT TRANSACTIONS</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col" noPadding>
        {transactions.length > 0 ? (
          <>
            <div className="space-y-0 flex-1">
              {transactions.slice(0, 7).map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-center px-juno-4 py-juno-4 hover:bg-juno-surface-300 transition-colors duration-150"
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
                    {new Date(transaction.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="text-right ml-juno-4">
                  <p className="text-sm font-medium text-juno-text">
                    ${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                </div>
              ))}
            </div>
            
            {/* Action Buttons - Vertical layout */}
            <div className="px-juno-6 pb-juno-6 pt-juno-4 space-y-juno-3">
              <Button variant="primary" size="md" className="w-full" asChild>
                <Link href="/dashboard/transactions/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add transaction
                </Link>
              </Button>
              <Button variant="secondary" size="md" className="w-full" asChild>
                <Link href="/dashboard/transactions">
                  View all
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-juno-16 px-juno-6">
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
      </CardContent>
    </Card>
  )
}