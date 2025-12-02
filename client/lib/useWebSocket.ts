"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { WSIncomingMessage, WSOutgoingMessage, WSConnectionState, UseWebSocketReturn } from './websocket-types'

interface UseWebSocketOptions {
  sessionCode: string
  userId?: string
  clientType?: 'admin' | 'player' | 'audience'
  onMessage?: (message: WSIncomingMessage) => void
  onError?: (error: string) => void
  onConnect?: () => void
  onDisconnect?: () => void
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export function useWebSocket({
  sessionCode,
  userId,
  clientType = 'player',
  onMessage,
  onError,
  onConnect,
  onDisconnect,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5
}: UseWebSocketOptions): UseWebSocketReturn {
  const [connectionState, setConnectionState] = useState<WSConnectionState>('disconnected')
  const [lastMessage, setLastMessage] = useState<WSIncomingMessage | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const isManualCloseRef = useRef(false)
  const isConnectingRef = useRef(false)
  const lastKnownStateRef = useRef<any>(null)
  const connectionQualityRef = useRef<'excellent' | 'good' | 'poor' | 'disconnected'>('disconnected')

  const getWebSocketUrl = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001/ws'
    const params = new URLSearchParams({ sessionCode })
    if (userId) {
      params.append('userId', userId)
    }
    if (clientType) {
      params.append('clientType', clientType)
    }

    const url = `${baseUrl}?${params.toString()}`
    console.log('WebSocket URL:', url) // Debug log
    return url
  }, [sessionCode, userId, clientType])

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || isConnectingRef.current) {
      console.log('WebSocket already connected or connecting, skipping connection attempt')
      return
    }

    console.log('Attempting WebSocket connection...')
    isConnectingRef.current = true
    setConnectionState('connecting')
    setError(null)
    
    // Request state sync if we have previous state
    if (lastKnownStateRef.current) {
      console.log('Requesting state sync with last known state:', lastKnownStateRef.current)
    }

    try {
      const url = getWebSocketUrl()
      console.log('Creating WebSocket with URL:', url)
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connection opened successfully')
        isConnectingRef.current = false
        setConnectionState('connected')
        reconnectAttemptsRef.current = 0
        onConnect?.()
      }

      ws.onmessage = (event) => {
        console.log('WebSocket message received:', event.data)
        try {
          const message: WSIncomingMessage = JSON.parse(event.data)
          console.log('Parsed WebSocket message:', message)
          setLastMessage(message)
          onMessage?.(message)
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
          setError('Failed to parse message')
        }
      }

      ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason)
        isConnectingRef.current = false
        setConnectionState('disconnected')
        onDisconnect?.()

        // Only attempt to reconnect if it wasn't a manual close
        if (!isManualCloseRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          const delay = reconnectInterval * Math.pow(2, reconnectAttemptsRef.current - 1)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        }
      }

      ws.onerror = (event) => {
        console.error('WebSocket error event:', event)
        isConnectingRef.current = false
        setConnectionState('error')
        const errorMessage = 'WebSocket connection error'
        setError(errorMessage)
        onError?.(errorMessage)
      }
    } catch (err) {
      isConnectingRef.current = false
      setConnectionState('error')
      setError('Failed to create WebSocket connection')
      onError?.('Failed to create WebSocket connection')
    }
  }, [getWebSocketUrl, onMessage, onError, onConnect, onDisconnect, reconnectInterval, maxReconnectAttempts])

  const disconnect = useCallback(() => {
    isManualCloseRef.current = true
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    setConnectionState('disconnected')
  }, [])

  const send = useCallback((message: WSOutgoingMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected. Cannot send message:', message)
    }
  }, [])

  // Enhanced reconnection with state sync
  const reconnect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || isConnectingRef.current) {
      console.log('WebSocket already connected or connecting, skipping reconnection attempt')
      return
    }

    console.log('Attempting WebSocket reconnection...')
    isConnectingRef.current = true
    setConnectionState('connecting')
    setError(null)
    
    // Request state sync if we have previous state
    if (lastKnownStateRef.current) {
      console.log('Requesting state sync with last known state:', lastKnownStateRef.current)
      send({ type: 'request-sync', data: { lastKnownMessageId: lastKnownStateRef.current.messageId } })
    }

    try {
      const url = getWebSocketUrl()
      console.log('Creating WebSocket with URL:', url)
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket reconnection successful')
        isConnectingRef.current = false
        setConnectionState('connected')
        reconnectAttemptsRef.current = 0
        onConnect?.()
      }

      ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason)
        isConnectingRef.current = false
        setConnectionState('disconnected')
        onDisconnect?.()

        // Only attempt to reconnect if it wasn't a manual close
        if (!isManualCloseRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          const delay = reconnectInterval * Math.pow(2, reconnectAttemptsRef.current - 1)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        }
      }

      ws.onerror = (event) => {
        console.error('WebSocket error event:', event)
        isConnectingRef.current = false
        setConnectionState('error')
        const errorMessage = 'WebSocket connection error'
        setError(errorMessage)
        onError?.(errorMessage)
      }
    } catch (err) {
      isConnectingRef.current = false
      setConnectionState('error')
      setError('Failed to create WebSocket connection')
      onError?.('Failed to create WebSocket connection')
    }
  }, [getWebSocketUrl, onMessage, onError, onConnect, onDisconnect, reconnectInterval, maxReconnectAttempts])

  // Auto-connect on mount
  useEffect(() => {
    if (sessionCode) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [sessionCode]) // Remove connect and disconnect from deps to prevent multiple connections

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  // Heartbeat for connection health
  const startHeartbeat = useCallback(() => {
    const heartbeatInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        send({ type: 'heartbeat' })
      } else {
        clearInterval(heartbeatInterval)
      }
    }, 30000) // Send heartbeat every 30 seconds
    return heartbeatInterval
  }, [send])

  // Start heartbeat on connection
  useEffect(() => {
    let heartbeatInterval: NodeJS.Timeout | null = null
    if (connectionState === 'connected') {
      heartbeatInterval = startHeartbeat()
    }

    return () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval)
      }
    }
  }, [connectionState, startHeartbeat])

  return {
    connectionState,
    send,
    lastMessage,
    error,
    connectionQuality: connectionQualityRef.current
  }
}
