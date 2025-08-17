/**
 * Empty state component for onboarding users with no transaction data
 * Shows "See where your money goes" message and encourages first transaction
 */

'use client'

import React from 'react'
import { PlusCircle, BarChart3, TrendingUp, PieChart } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OnboardingEmptyStateProps {
  onAddTransaction?: () => void
  className?: string
}

export function OnboardingEmptyState({ onAddTransaction, className }: OnboardingEmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className || ''}`}>
      {/* Visual illustration */}
      <div className="relative mb-8">
        <div className="flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200">
          <div className="grid grid-cols-2 gap-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <PieChart className="w-8 h-8 text-indigo-500" />
            <TrendingUp className="w-8 h-8 text-purple-500" />
            <div className="w-8 h-8 rounded bg-gradient-to-br from-green-400 to-blue-500"></div>
          </div>
        </div>
        
        {/* Floating money icons */}
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-100 border-2 border-yellow-300 flex items-center justify-center animate-bounce">
          <span className="text-sm">💰</span>
        </div>
        <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center animate-pulse">
          <span className="text-sm">📊</span>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-lg space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            See where your money goes
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Start tracking your expenses to visualize your spending patterns and take control of your finances.
          </p>
        </div>

        {/* Preview of what they'll unlock */}
        <div className="bg-gray-50 rounded-xl p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What you'll unlock:</h3>
          <div className="space-y-3 text-sm text-left">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Budget vs Spending Charts</div>
                <div className="text-gray-500">Compare planned budget with actual spending</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <PieChart className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Category Breakdown</div>
                <div className="text-gray-500">See spending by category with visual patterns</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Progressive Insights</div>
                <div className="text-gray-500">Unlock daily, weekly, and monthly views as you track</div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="space-y-4">
          <Button 
            onClick={onAddTransaction}
            className="inline-flex items-center space-x-2 px-8 py-4 text-lg"
            size="lg"
          >
            <PlusCircle className="w-6 h-6" />
            <span>Add your first transaction</span>
          </Button>
          
          <p className="text-sm text-gray-500">
            Start with any recent purchase — grocery shopping, coffee, transport, anything!
          </p>
        </div>
      </div>
    </div>
  )
}

export default OnboardingEmptyState