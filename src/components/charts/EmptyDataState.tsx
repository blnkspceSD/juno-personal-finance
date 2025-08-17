/**
 * Empty state component for when users have no transaction data
 * Encourages users to add their first transaction
 */

'use client'

import React from 'react'
import { PlusCircle, TrendingUp, PieChart, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyDataStateProps {
  onAddTransaction?: () => void
  className?: string
}

export function EmptyDataState({ onAddTransaction, className }: EmptyDataStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className || ''}`}>
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200">
          <div className="flex space-x-1">
            <PieChart className="w-6 h-6 text-blue-500" />
            <BarChart3 className="w-6 h-6 text-indigo-500" />
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        {/* Floating elements */}
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-yellow-100 border border-yellow-300 flex items-center justify-center">
          <span className="text-xs">💰</span>
        </div>
        <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-green-100 border border-green-300 flex items-center justify-center">
          <span className="text-xs">📊</span>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">
          See where your money goes
        </h2>
        
        <p className="text-gray-600 leading-relaxed">
          Start tracking your expenses to visualize your spending patterns and take control of your finances.
        </p>

        {/* Features preview */}
        <div className="grid grid-cols-1 gap-3 mt-6 text-sm">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 border">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Budget vs Spending</div>
              <div className="text-gray-500">Compare your planned budget with actual spending</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 border">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <PieChart className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Category Breakdown</div>
              <div className="text-gray-500">See exactly how much you spend in each category</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 border">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Spending Trends</div>
              <div className="text-gray-500">Track your progress over time</div>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="pt-6">
          <Button 
            onClick={onAddTransaction}
            className="inline-flex items-center space-x-2 px-6 py-3"
            size="lg"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Add your first transaction</span>
          </Button>
          
          <p className="text-xs text-gray-500 mt-3">
            Start with any recent purchase to see your data come to life
          </p>
        </div>
      </div>
    </div>
  )
}

export default EmptyDataState