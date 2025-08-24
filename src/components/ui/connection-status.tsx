'use client'

import React from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { useRealtimeContext } from '@/lib/context/RealtimeContext'

export function ConnectionStatus() {
  const { isConnected, isReconnecting, hasError } = useRealtimeContext()

  return (
    <div className="flex items-center gap-2 text-sm">
      {isConnected ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-green-600">Live updates active</span>
        </>
      ) : isReconnecting ? (
        <>
          <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-blue-600">Reconnecting...</span>
        </>
      ) : hasError ? (
        <>
          <WifiOff className="h-4 w-4 text-red-500" />
          <span className="text-red-600">Connection lost</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-gray-400" />
          <span className="text-gray-500">Connecting...</span>
        </>
      )}
    </div>
  )
}