# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-02-real-time-balance-updates/spec.md

> Created: 2025-08-02
> Version: 1.0.0

## Technical Requirements

### Real-time Data Flow
- Supabase Realtime WebSocket connections for instant data synchronization
- React state management with optimistic updates for immediate UI feedback
- Database triggers to calculate and broadcast balance changes
- Connection state management with automatic reconnection handling

### Performance Considerations
- Debounced update batching to prevent excessive database queries
- Client-side balance calculations for immediate feedback before server confirmation
- Efficient data payloads containing only changed envelope balances
- Memory-efficient subscription management for multiple envelope categories

## Approach

### 1. Supabase Realtime Integration

**WebSocket Channel Setup**
```typescript
// lib/supabase/realtime.ts
import { createClient } from '@supabase/supabase-js'
import { RealtimeChannel } from '@supabase/realtime-js'

export const subscribeToEnvelopeUpdates = (
  userId: string,
  onBalanceUpdate: (payload: EnvelopeBalanceUpdate) => void
) => {
  const channel = supabase
    .channel(`envelope_balances:${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'transactions',
      filter: `user_id=eq.${userId}`
    }, onBalanceUpdate)
    .subscribe()
  
  return channel
}
```

**Database Trigger for Balance Updates**
```sql
-- Database function to calculate and broadcast balance changes
CREATE OR REPLACE FUNCTION notify_envelope_balance_change()
RETURNS TRIGGER AS $$
DECLARE
  envelope_balance RECORD;
BEGIN
  -- Calculate new balance for affected envelope
  SELECT 
    e.id,
    e.name,
    e.budget_amount,
    COALESCE(SUM(t.amount), 0) as spent_amount,
    (e.budget_amount - COALESCE(SUM(t.amount), 0)) as remaining_amount
  INTO envelope_balance
  FROM envelopes e
  LEFT JOIN transactions t ON t.envelope_id = e.id
  WHERE e.id = COALESCE(NEW.envelope_id, OLD.envelope_id)
  GROUP BY e.id, e.name, e.budget_amount;
  
  -- Broadcast the update via Supabase Realtime
  PERFORM pg_notify(
    'envelope_balance_update',
    json_build_object(
      'envelope_id', envelope_balance.id,
      'user_id', COALESCE(NEW.user_id, OLD.user_id),
      'spent_amount', envelope_balance.spent_amount,
      'remaining_amount', envelope_balance.remaining_amount,
      'is_overspent', envelope_balance.spent_amount > envelope_balance.budget_amount
    )::text
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger on transactions table
CREATE TRIGGER envelope_balance_update_trigger
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION notify_envelope_balance_change();
```

### 2. React State Management

**Real-time Balance Hook**
```typescript
// hooks/useRealtimeBalances.ts
import { useEffect, useState } from 'react'
import { useUser } from '@/hooks/useUser'
import { subscribeToEnvelopeUpdates } from '@/lib/supabase/realtime'

export interface EnvelopeBalance {
  envelope_id: string
  spent_amount: number
  remaining_amount: number
  is_overspent: boolean
}

export const useRealtimeBalances = () => {
  const [balances, setBalances] = useState<Map<string, EnvelopeBalance>>(new Map())
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useUser()

  useEffect(() => {
    if (!user) return

    const channel = subscribeToEnvelopeUpdates(
      user.id,
      (payload) => {
        const update = payload.new as EnvelopeBalance
        setBalances(prev => new Map(prev.set(update.envelope_id, update)))
      }
    )

    channel.on('presence', { event: 'sync' }, () => {
      setIsConnected(true)
    })

    return () => {
      channel.unsubscribe()
      setIsConnected(false)
    }
  }, [user])

  return { balances, isConnected }
}
```

**Optimistic UI Updates**
```typescript
// hooks/useOptimisticTransactions.ts
import { useState, useCallback } from 'react'
import { useRealtimeBalances } from './useRealtimeBalances'

export const useOptimisticTransactions = () => {
  const [pendingUpdates, setPendingUpdates] = useState<Map<string, number>>(new Map())
  const { balances } = useRealtimeBalances()

  const addOptimisticTransaction = useCallback((envelopeId: string, amount: number) => {
    setPendingUpdates(prev => {
      const current = prev.get(envelopeId) || 0
      return new Map(prev.set(envelopeId, current + amount))
    })
  }, [])

  const getOptimisticBalance = useCallback((envelopeId: string) => {
    const realBalance = balances.get(envelopeId)
    const pendingAmount = pendingUpdates.get(envelopeId) || 0
    
    if (!realBalance) return null
    
    return {
      ...realBalance,
      spent_amount: realBalance.spent_amount + pendingAmount,
      remaining_amount: realBalance.remaining_amount - pendingAmount,
      is_overspent: (realBalance.spent_amount + pendingAmount) > 
        (realBalance.spent_amount + realBalance.remaining_amount)
    }
  }, [balances, pendingUpdates])

  return { addOptimisticTransaction, getOptimisticBalance }
}
```

### 3. UI Component Updates

**Envelope Progress Bar Component**
```typescript
// components/EnvelopeProgressBar.tsx
import { useOptimisticTransactions } from '@/hooks/useOptimisticTransactions'
import { motion } from 'framer-motion'

interface EnvelopeProgressBarProps {
  envelopeId: string
  budgetAmount: number
}

export const EnvelopeProgressBar = ({ envelopeId, budgetAmount }: EnvelopeProgressBarProps) => {
  const { getOptimisticBalance } = useOptimisticTransactions()
  const balance = getOptimisticBalance(envelopeId)

  if (!balance) return <div className="animate-pulse bg-gray-200 h-4 rounded" />

  const percentage = Math.min((balance.spent_amount / budgetAmount) * 100, 100)
  const isOverspent = balance.is_overspent

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>${balance.spent_amount.toFixed(2)} spent</span>
        <span className={isOverspent ? 'text-red-600 font-semibold' : 'text-gray-600'}>
          ${Math.abs(balance.remaining_amount).toFixed(2)} {isOverspent ? 'over' : 'remaining'}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <motion.div
          className={`h-full rounded-full transition-colors duration-300 ${
            isOverspent ? 'bg-red-500' : 'bg-green-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      
      {isOverspent && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-600 text-sm font-medium"
        >
          ⚠️ Budget exceeded
        </motion.div>
      )}
    </div>
  )
}
```

### 4. Connection State Management

**Connection Status Component**
```typescript
// components/ConnectionStatus.tsx
import { useRealtimeBalances } from '@/hooks/useRealtimeBalances'

export const ConnectionStatus = () => {
  const { isConnected } = useRealtimeBalances()

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
        {isConnected ? 'Live updates active' : 'Reconnecting...'}
      </span>
    </div>
  )
}
```

## External Dependencies

### Required Package Updates
- **@supabase/supabase-js**: Latest version with Realtime support
- **framer-motion**: For smooth UI animations and transitions
- **@supabase/realtime-js**: For enhanced WebSocket connection management

### Supabase Configuration
- Enable Realtime on `transactions` and `envelopes` tables
- Configure RLS policies for real-time subscriptions
- Set up database triggers for balance calculations
- Configure WebSocket connection limits and rate limiting

### Performance Monitoring
- Track WebSocket connection stability and reconnection rates
- Monitor database trigger execution times
- Measure UI update latency from transaction creation to visual feedback
- Alert on excessive subscription memory usage or connection failures