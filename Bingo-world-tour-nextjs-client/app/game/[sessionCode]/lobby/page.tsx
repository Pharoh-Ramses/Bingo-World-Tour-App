"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWebSocket } from '@/lib/useWebSocket'
import { WSIncomingMessage } from '@/lib/websocket-types'

interface GameSession {
  id: string
  code: string
  status: 'WAITING' | 'STARTING' | 'ACTIVE' | 'PAUSED' | 'ENDED'
  revealInterval: number
  playerCount: number
  createdAt: string
  startedAt?: string
  endedAt?: string
  players: Array<{
    id: string
    name: string
    isReady: boolean
  }>
}

const LobbyPage = () => {
  const params = useParams()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const sessionCode = params.sessionCode as string

  const [session, setSession] = useState<GameSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [, setError] = useState('')

  const fetchSessionData = useCallback(async () => {
    try {
      const response = await fetch(`/api/game/${sessionCode}/status`)
      if (response.ok) {
        const data = await response.json()
        setSession(data)
        
        // Redirect to game if it has started
        if (data.status === 'ACTIVE' || data.status === 'PAUSED') {
          router.push(`/game/${sessionCode}/play`)
        }
      } else {
        setError('Session not found')
      }
    } catch (error) {
      console.error('Failed to fetch session data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [sessionCode, router])

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((message: WSIncomingMessage) => {
    switch (message.type) {
      case 'connected':
        setSession(prev => prev ? { ...prev, status: message.data.status } : null)
        break

      case 'game-started':
        setSession(prev => prev ? { ...prev, status: 'ACTIVE' } : null)
        // Redirect to play page when game starts
        router.push(`/game/${sessionCode}/play`)
        break

      case 'game-paused':
        setSession(prev => prev ? { ...prev, status: 'PAUSED' } : null)
        break

      case 'game-resumed':
        setSession(prev => prev ? { ...prev, status: 'ACTIVE' } : null)
        // Redirect to play page when game becomes active
        router.push(`/game/${sessionCode}/play`)
        break

      case 'game-ended':
        setSession(prev => prev ? { ...prev, status: 'ENDED' } : null)
        break

      case 'player-joined':
        setSession(prev => {
          if (!prev) return null
          return {
            ...prev,
            players: [...prev.players, {
              id: message.data.userId,
              name: message.data.userName || 'Anonymous',
              isReady: message.data.isReady || false
            }],
            playerCount: prev.playerCount + 1
          }
        })
        break

      case 'player-left':
        setSession(prev => {
          if (!prev) return null
          return {
            ...prev,
            players: prev.players.filter(p => p.id !== message.data.userId),
            playerCount: Math.max(0, prev.playerCount - 1)
          }
        })
        break
    }
  }, [router, sessionCode])

  // WebSocket connection
  const { connectionState } = useWebSocket({
    sessionCode,
    userId: user?.id,
    onMessage: handleWebSocketMessage,
    onError: (error) => console.error('WebSocket error:', error)
  })

  useEffect(() => {
    if (isLoaded && user && sessionCode) {
      fetchSessionData()
    } else if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [isLoaded, user, sessionCode, router, fetchSessionData])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WAITING': return 'bg-accent-sand text-tertiary-600'
      case 'STARTING': return 'bg-warning text-white'
      case 'ACTIVE': return 'bg-success text-white'
      case 'PAUSED': return 'bg-warning text-white'
      case 'ENDED': return 'bg-neutral-400 text-white'
      default: return 'bg-neutral-300 text-tertiary-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'WAITING': return 'Waiting for Players'
      case 'STARTING': return 'Starting Soon'
      case 'ACTIVE': return 'Game Active'
      case 'PAUSED': return 'Game Paused'
      case 'ENDED': return 'Game Ended'
      default: return status
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8 sm:py-12 lg:py-16">
        <div className="text-center">
          <p className="body-1 text-tertiary-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8 sm:py-12 lg:py-16">
        <div className="text-center">
          <p className="body-1 text-tertiary-300">Session not found</p>
          <Button 
            variant="outline" 
            onClick={() => router.push('/join')}
            className="mt-4"
          >
            Back to Join Game
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8 sm:py-12 lg:py-16">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="heading-1 text-tertiary-500">
              Game Lobby
            </h1>
            <p className="body-1 text-tertiary-300 mt-2">
              Session {session.code} • Waiting for game to start
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mt-4">
              <Badge className={getStatusColor(session.status)}>
                {getStatusText(session.status)}
              </Badge>
              <Badge className={`${
                connectionState === 'connected' ? 'bg-success text-white' : 
                connectionState === 'connecting' ? 'bg-warning text-white' : 
                'bg-error text-white'
              }`}>
                {connectionState === 'connected' ? 'Connected' : 
                 connectionState === 'connecting' ? 'Connecting...' : 
                 'Disconnected'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Session Info */}
            <Card>
              <CardHeader>
                <CardTitle className="heading-3 text-tertiary-500">
                  Session Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="body-3 text-tertiary-400">Session Code</p>
                  <p className="body-2 text-tertiary-600 font-mono text-lg">
                    {session.code}
                  </p>
                </div>
                <div>
                  <p className="body-3 text-tertiary-400">Reveal Interval</p>
                  <p className="body-2 text-tertiary-600">
                    {session.revealInterval} minutes
                  </p>
                </div>
                <div>
                  <p className="body-3 text-tertiary-400">Players Joined</p>
                  <p className="body-2 text-tertiary-600">
                    {session.playerCount} players
                  </p>
                </div>
                <div>
                  <p className="body-3 text-tertiary-400">Created</p>
                  <p className="body-2 text-tertiary-600">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Players List */}
            <Card>
              <CardHeader>
                <CardTitle className="heading-3 text-tertiary-500">
                  Players ({session.players.length})
                </CardTitle>
                <CardDescription>
                  Players who have joined and set up their boards
                </CardDescription>
              </CardHeader>
              <CardContent>
                {session.players.length === 0 ? (
                  <p className="body-2 text-tertiary-300 text-center py-8">
                    No players joined yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {session.players.map((player) => (
                      <div 
                        key={player.id}
                        className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                            <span className="text-white body-3 font-medium">
                              {player.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="body-2 text-tertiary-600">
                            {player.name}
                          </span>
                        </div>
                        <Badge 
                          className={player.isReady ? 'bg-success text-white' : 'bg-accent-sand text-tertiary-600'}
                        >
                          {player.isReady ? 'Ready' : 'Setting up'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Waiting Message */}
          <Card>
            <CardContent className="text-center py-12">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto">
                  <svg 
                    width="32" 
                    height="32" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    className="text-white animate-pulse"
                  >
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                </div>
                <h2 className="heading-3 text-tertiary-500">
                  Waiting for Game to Start
                </h2>
                <p className="body-1 text-tertiary-300 max-w-2xl mx-auto">
                  The game host will start the session when everyone is ready. 
                  You&apos;ll be automatically redirected to the game when it begins.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push(`/game/${sessionCode}/setup`)}
                    className="w-full sm:w-auto"
                  >
                    Edit My Board
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/join')}
                    className="w-full sm:w-auto"
                  >
                    Join Different Game
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default LobbyPage
