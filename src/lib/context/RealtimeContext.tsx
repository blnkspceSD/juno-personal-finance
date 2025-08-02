/**
 * React Context for global real-time state management
 * Provides centralized real-time updates across the application
 */

'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { getRealtimeManager, type EnvelopeBalanceChange, type ConnectionState } from '@/lib/supabase/realtime'
import type { Category, BudgetWithCategories } from '@/lib/types/database'

export interface RealtimeState {
  budgets: Map<string, BudgetWithCategories>
  envelopes: Map<string, Category>
  connectionState: ConnectionState
  lastUpdate: Date | null
  pendingUpdates: Set<string>
}

export type RealtimeAction =
  | { type: 'SET_BUDGET'; budgetId: string; budget: BudgetWithCategories }
  | { type: 'UPDATE_ENVELOPE'; envelope: Category }
  | { type: 'BALANCE_CHANGE'; change: EnvelopeBalanceChange }
  | { type: 'SET_CONNECTION_STATE'; state: ConnectionState }
  | { type: 'ADD_PENDING_UPDATE'; categoryId: string }
  | { type: 'REMOVE_PENDING_UPDATE'; categoryId: string }
  | { type: 'CLEAR_PENDING_UPDATES' }

const initialState: RealtimeState = {
  budgets: new Map(),
  envelopes: new Map(),
  connectionState: { status: 'disconnected', reconnectAttempts: 0 },
  lastUpdate: null,
  pendingUpdates: new Set()
}

function realtimeReducer(state: RealtimeState, action: RealtimeAction): RealtimeState {
  switch (action.type) {
    case 'SET_BUDGET': {
      const newBudgets = new Map(state.budgets)
      newBudgets.set(action.budgetId, action.budget)
      
      // Update envelopes map with budget categories
      const newEnvelopes = new Map(state.envelopes)
      action.budget.categories.forEach(category => {
        newEnvelopes.set(category.id, category)
      })
      
      return {
        ...state,
        budgets: newBudgets,
        envelopes: newEnvelopes,
        lastUpdate: new Date()
      }
    }

    case 'UPDATE_ENVELOPE': {
      const newEnvelopes = new Map(state.envelopes)
      newEnvelopes.set(action.envelope.id, action.envelope)
      
      // Update budget if it exists
      const newBudgets = new Map(state.budgets)
      const budget = Array.from(newBudgets.values()).find(b => 
        b.categories.some(c => c.id === action.envelope.id)
      )
      
      if (budget) {
        const updatedBudget = {
          ...budget,
          categories: budget.categories.map(c => 
            c.id === action.envelope.id ? action.envelope : c
          )
        }
        newBudgets.set(budget.id, updatedBudget)
      }
      
      return {
        ...state,
        budgets: newBudgets,
        envelopes: newEnvelopes,
        lastUpdate: new Date()
      }
    }

    case 'BALANCE_CHANGE': {
      const { change } = action
      const newEnvelopes = new Map(state.envelopes)
      const currentEnvelope = newEnvelopes.get(change.category_id)
      
      if (currentEnvelope) {
        const updatedEnvelope = {
          ...currentEnvelope,
          spent: change.new_spent
        }
        newEnvelopes.set(change.category_id, updatedEnvelope)
      }
      
      // Update budget
      const newBudgets = new Map(state.budgets)
      const budget = newBudgets.get(change.budget_id)
      
      if (budget) {
        const updatedBudget = {
          ...budget,
          categories: budget.categories.map(c =>
            c.id === change.category_id ? { ...c, spent: change.new_spent } : c
          )
        }
        newBudgets.set(change.budget_id, updatedBudget)
      }
      
      // Remove pending update
      const newPendingUpdates = new Set(state.pendingUpdates)
      newPendingUpdates.delete(change.category_id)
      
      return {
        ...state,
        budgets: newBudgets,
        envelopes: newEnvelopes,
        pendingUpdates: newPendingUpdates,
        lastUpdate: new Date()
      }
    }

    case 'SET_CONNECTION_STATE':
      return {
        ...state,
        connectionState: action.state
      }

    case 'ADD_PENDING_UPDATE': {
      const newPendingUpdates = new Set(state.pendingUpdates)
      newPendingUpdates.add(action.categoryId)
      return {
        ...state,
        pendingUpdates: newPendingUpdates
      }
    }

    case 'REMOVE_PENDING_UPDATE': {
      const newPendingUpdates = new Set(state.pendingUpdates)
      newPendingUpdates.delete(action.categoryId)
      return {
        ...state,
        pendingUpdates: newPendingUpdates
      }
    }

    case 'CLEAR_PENDING_UPDATES':
      return {
        ...state,
        pendingUpdates: new Set()
      }

    default:
      return state
  }
}

const RealtimeContext = createContext<{
  state: RealtimeState
  dispatch: React.Dispatch<RealtimeAction>
  setBudget: (budgetId: string, budget: BudgetWithCategories) => void
  updateEnvelope: (envelope: Category) => void
  addPendingUpdate: (categoryId: string) => void
  removePendingUpdate: (categoryId: string) => void
  getBudget: (budgetId: string) => BudgetWithCategories | undefined
  getEnvelope: (categoryId: string) => Category | undefined
  isEnvelopePending: (categoryId: string) => boolean
} | null>(null)

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(realtimeReducer, initialState)

  // Set up global connection monitoring
  useEffect(() => {
    const connectionId = 'global-realtime'
    const manager = getRealtimeManager()
    
    manager.addConnectionListener(connectionId, (connectionState) => {
      dispatch({ type: 'SET_CONNECTION_STATE', state: connectionState })
    })

    return () => {
      manager.removeConnectionListener(connectionId)
    }
  }, [])

  // Helper functions
  const setBudget = (budgetId: string, budget: BudgetWithCategories) => {
    dispatch({ type: 'SET_BUDGET', budgetId, budget })
  }

  const updateEnvelope = (envelope: Category) => {
    dispatch({ type: 'UPDATE_ENVELOPE', envelope })
  }

  const addPendingUpdate = (categoryId: string) => {
    dispatch({ type: 'ADD_PENDING_UPDATE', categoryId })
  }

  const removePendingUpdate = (categoryId: string) => {
    dispatch({ type: 'REMOVE_PENDING_UPDATE', categoryId })
  }

  const getBudget = (budgetId: string) => {
    return state.budgets.get(budgetId)
  }

  const getEnvelope = (categoryId: string) => {
    return state.envelopes.get(categoryId)
  }

  const isEnvelopePending = (categoryId: string) => {
    return state.pendingUpdates.has(categoryId)
  }

  const contextValue = {
    state,
    dispatch,
    setBudget,
    updateEnvelope,
    addPendingUpdate,
    removePendingUpdate,
    getBudget,
    getEnvelope,
    isEnvelopePending
  }

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtimeContext() {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error('useRealtimeContext must be used within a RealtimeProvider')
  }
  return context
}

export { RealtimeContext }