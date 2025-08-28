"use client"

import { RecentTransactionsCardWithData } from '@/components/dashboard/RecentTransactionsCardWithData';
import { ToastContainer } from '@/components/ui/toast';

export default function TestRealTransactions() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Real Transaction Data Test</h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          This tests the transaction drawer with actual Supabase data
        </p>
        <RecentTransactionsCardWithData />
      </div>
      <ToastContainer />
    </div>
  );
}