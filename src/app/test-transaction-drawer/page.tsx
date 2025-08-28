"use client"

import { RecentTransactionsCard } from '@/components/dashboard/RecentTransactionsCard';
import { ToastContainer } from '@/components/ui/toast';

const mockTransactions = [
  {
    id: 'transaction-001-pizza-dominos',
    description: 'Pizza delivery from Domino\'s',
    amount: -28.45,
    date: '2024-08-21',
    category_id: 'category-food-dining-uuid',
    category_name: 'Food & Dining',
    category_color: '#8B5CF6',
    payment_method: 'Credit Card (*1234)',
    notes: 'Late night dinner with the team after our project release',
    receipt_url: 'https://receipts.dominos.com/abc123',
    created_at: '2024-08-21T20:15:30Z',
    updated_at: '2024-08-21T20:15:30Z'
  },
  {
    id: 'transaction-002-shell-gas',
    description: 'Shell gas station',
    amount: -45.60,
    date: '2024-08-21',
    category_id: 'category-transport-uuid',
    category_name: 'Transportation',
    category_color: '#F59E0B',
    payment_method: 'Debit Card',
    created_at: '2024-08-21T15:42:18Z',
    updated_at: '2024-08-21T15:42:18Z'
  },
  {
    id: 'transaction-003-movie-tickets',
    description: 'Movie tickets for two',
    amount: -24.98,
    date: '2024-08-20',
    category_id: 'category-entertainment-uuid',
    category_name: 'Entertainment',
    category_color: '#06B6D4',
    payment_method: 'Apple Pay',
    notes: 'Date night - watched the new Marvel movie',
    created_at: '2024-08-20T19:30:45Z',
    updated_at: '2024-08-20T19:30:45Z'
  },
  {
    id: 'transaction-004-safeway-groceries',
    description: 'Safeway grocery shopping',
    amount: -85.47,
    date: '2024-08-20',
    category_id: 'category-groceries-uuid',
    category_name: 'Groceries',
    category_color: '#10B981',
    payment_method: 'Credit Card (*5678)',
    receipt_url: 'https://receipts.safeway.com/xyz789',
    created_at: '2024-08-20T14:22:33Z',
    updated_at: '2024-08-22T10:15:22Z'
  },
  {
    id: 'transaction-005-nike-shoes',
    description: 'New running shoes from Nike',
    amount: -89.99,
    date: '2024-08-19',
    category_id: 'category-shopping-uuid',
    category_name: 'Shopping',
    category_color: '#F59E0B',
    payment_method: 'Credit Card (*1234)',
    notes: 'Annual shoe replacement - needed new ones for marathon training',
    receipt_url: 'https://receipts.nike.com/order456',
    created_at: '2024-08-19T16:45:12Z',
    updated_at: '2024-08-19T16:45:12Z'
  }
];

export default function TestTransactionDrawer() {
  const handleTransactionUpdate = () => {
    console.log('Transaction updated - would refresh data in real app')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Transaction Drawer Test</h1>
        <RecentTransactionsCard 
          transactions={mockTransactions} 
          onTransactionUpdate={handleTransactionUpdate}
        />
      </div>
      <ToastContainer />
    </div>
  );
}