"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Winner {
  id: string
  userId: string
  userName: string
  place: number
  winPattern: string
  wonAt: string
}

interface GameSession {
  id: string
  code: string
  status: string
  playerCount: number
  startedAt?: string
  endedAt?: string
}

const ResultsPage = () => {
  const params = useParams()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const sessionCode = params.sessionCode as string

  const [session, setSession] = useState<GameSession | null>(null)
  const [winners, setWinners] = useState<Winner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [, setError] = useState('')

  const fetchResults = useCallback(async () => {
    try {
      // Fetch session info
      const sessionResponse = await fetch(`/api/game/${sessionCode}/status`)
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json()
        setSession(sessionData)
      }

      // Fetch winners
      const winnersResponse = await fetch(`/api/game/${sessionCode}/winners`)
      if (winnersResponse.ok) {
        const winnersData = await winnersResponse.json()
        setWinners(winnersData.winners)
      }
    } catch (error) {
      console.error('Failed to fetch results:', error)
      setError('Failed to load results')
    } finally {
      setIsLoading(false)
    }
  }, [sessionCode])

  useEffect(() => {
    if (isLoaded && user && sessionCode) {
      fetchResults()
    } else if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [isLoaded, user, sessionCode, router, fetchResults])

  const getPlaceEmoji = (place: number) => {
    switch (place) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return '🏆'
    }
  }

  const getPlaceColor = (place: number) => {
    switch (place) {
      case 1: return 'bg-yellow-500 text-white'
      case 2: return 'bg-gray-400 text-white'
      case 3: return 'bg-amber-600 text-white'
      default: return 'bg-primary-500 text-white'
    }
  }

  const getPatternName = (pattern: string) => {
    switch (pattern) {
      case 'row-0': return 'Top Row'
      case 'row-1': return 'Second Row'
      case 'row-2': return 'Middle Row'
      case 'row-3': return 'Fourth Row'
      case 'row-4': return 'Bottom Row'
      case 'col-0': return 'Left Column'
      case 'col-1': return 'Second Column'
      case 'col-2': return 'Middle Column'
      case 'col-3': return 'Fourth Column'
      case 'col-4': return 'Right Column'
      case 'diagonal-1': return 'Diagonal (Top-Left to Bottom-Right)'
      case 'diagonal-2': return 'Diagonal (Top-Right to Bottom-Left)'
      default: return pattern
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8 sm:py-12 lg:py-16">
        <div className="text-center">
          <p className="body-1 text-tertiary-300">Loading results...</p>
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
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="heading-1 text-tertiary-500">
            Game Results
          </h1>
          <p className="body-1 text-tertiary-300 mt-2">
            Session {session.code} • {session.playerCount} players
          </p>
          <Badge className={`mt-4 ${session.status === 'ENDED' ? 'bg-neutral-400 text-white' : 'bg-success text-white'}`}>
            {session.status === 'ENDED' ? 'Game Ended' : 'Game Active'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Winners */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="heading-3 text-tertiary-500">
                  Winners
                </CardTitle>
                <CardDescription>
                  Congratulations to all the winners!
                </CardDescription>
              </CardHeader>
              <CardContent>
                {winners.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-tertiary-400">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                      </svg>
                    </div>
                    <p className="body-1 text-tertiary-300">
                      No winners yet. Game may still be in progress.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {winners.map((winner) => (
                      <div 
                        key={winner.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 bg-neutral-50 rounded-lg border gap-4 sm:gap-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getPlaceColor(winner.place)}`}>
                            <span className="text-2xl">
                              {getPlaceEmoji(winner.place)}
                            </span>
                          </div>
                          <div>
                            <h3 className="heading-4 text-tertiary-600">
                              {winner.userName}
                            </h3>
                            <p className="body-2 text-tertiary-400">
                              {getPatternName(winner.winPattern)}
                            </p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <Badge className={getPlaceColor(winner.place)}>
                            {winner.place === 1 ? '1st Place' : 
                             winner.place === 2 ? '2nd Place' : 
                             winner.place === 3 ? '3rd Place' : 
                             `${winner.place}th Place`}
                          </Badge>
                          <p className="body-3 text-tertiary-400 mt-1">
                            {new Date(winner.wonAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Game Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="heading-4 text-tertiary-500">
                  Game Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="body-3 text-tertiary-400">Total Players</p>
                  <p className="body-2 text-tertiary-600">
                    {session.playerCount}
                  </p>
                </div>
                <div>
                  <p className="body-3 text-tertiary-400">Winners</p>
                  <p className="body-2 text-tertiary-600">
                    {winners.length}
                  </p>
                </div>
                {session.startedAt && (
                  <div>
                    <p className="body-3 text-tertiary-400">Game Started</p>
                    <p className="body-2 text-tertiary-600">
                      {new Date(session.startedAt).toLocaleTimeString()}
                    </p>
                  </div>
                )}
                {session.endedAt && (
                  <div>
                    <p className="body-3 text-tertiary-400">Game Ended</p>
                    <p className="body-2 text-tertiary-600">
                      {new Date(session.endedAt).toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="heading-4 text-tertiary-500">
                  What&apos;s Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="primary" 
                  onClick={() => router.push('/join')}
                  className="w-full"
                >
                  Join New Game
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/admin')}
                  className="w-full"
                >
                  Host New Game
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/')}
                  className="w-full"
                >
                  Back to Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultsPage
