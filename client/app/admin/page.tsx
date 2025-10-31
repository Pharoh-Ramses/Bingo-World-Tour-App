"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Gamepad2, 
  MapPin, 
  TrendingUp,
  Users,
  Clock
} from 'lucide-react'

interface GameSession {
  id: string
  code: string
  status: 'WAITING' | 'STARTING' | 'ACTIVE' | 'PAUSED' | 'ENDED'
  revealInterval: number
  currentRevealIndex: number
  playerCount: number
  createdAt: string
  startedAt?: string
  endedAt?: string
}

const AdminDashboard = () => {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [sessions, setSessions] = useState<GameSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [endingSessionId, setEndingSessionId] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && user) {
      // Check if user is admin (you can implement this check based on your needs)
      // For now, we'll allow any signed-in user to access admin
      fetchSessions()
    } else if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [isLoaded, user, router])

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/admin/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions)
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndSession = async (sessionId: string) => {
    setEndingSessionId(sessionId)
    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}/end`, {
        method: 'POST'
      })

      if (response.ok) {
        // Refresh the sessions list
        await fetchSessions()
      } else {
        console.error('Failed to end session')
      }
    } catch (error) {
      console.error('Error ending session:', error)
    } finally {
      setEndingSessionId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WAITING':
        return 'bg-accent-sand hover:bg-accent-sand text-tertiary-600 border border-accent-sand'
      case 'ACTIVE':
        return 'bg-success hover:bg-success text-neutral-100'
      case 'PAUSED':
        return 'bg-warning hover:bg-warning text-neutral-100'
      case 'ENDED':
        return 'bg-neutral-400 hover:bg-neutral-400 text-neutral-100'
      default:
        return 'bg-neutral-300 hover:bg-neutral-300 text-tertiary-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'WAITING': return 'Waiting for Players'
      case 'STARTING': return 'Starting Soon'
      case 'ACTIVE': return 'Game Active'
      case 'PAUSED': return 'Paused'
      case 'ENDED': return 'Game Ended'
      default: return status
    }
  }

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-20 py-16">
        <div className="text-center">
          <p className="body-1 text-tertiary-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to sign-in
  }

  return (
    <div className="space-y-8 p-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="heading-1 text-tertiary-500">Admin Dashboard</h1>
          <p className="body-1 text-tertiary-300 mt-2">
            Manage your BINGO World Tour game sessions and locations
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/admin/locations')}>
            <CardContent className="p-6 text-center">
              <MapPin className="w-8 h-8 text-primary-500 mx-auto mb-3" />
              <h3 className="heading-4 text-tertiary-500 mb-2">Manage Locations</h3>
              <p className="body-3 text-tertiary-300">
                View and edit all travel locations
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/admin/sessions/create')}>
            <CardContent className="p-6 text-center">
              <Gamepad2 className="w-8 h-8 text-primary-500 mx-auto mb-3" />
              <h3 className="heading-4 text-tertiary-500 mb-2">Create Session</h3>
              <p className="body-3 text-tertiary-300">
                Start a new game session
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer opacity-75">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-tertiary-400 mx-auto mb-3" />
              <h3 className="heading-4 text-tertiary-500 mb-2">View Players</h3>
              <p className="body-3 text-tertiary-300">
                Manage player accounts
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer opacity-75">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-tertiary-400 mx-auto mb-3" />
              <h3 className="heading-4 text-tertiary-500 mb-2">Analytics</h3>
              <p className="body-3 text-tertiary-300">
                View game statistics
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sessions List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="heading-3 text-tertiary-500">Recent Sessions</h2>
            <Button 
              variant="primary" 
              onClick={() => router.push('/admin/sessions/create')}
              size="sm"
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              Create Session
            </Button>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <p className="body-1 text-tertiary-300">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="body-1 text-tertiary-300 mb-4">
                  No game sessions yet. Create your first session to get started!
                </p>
                <Button 
                  variant="primary" 
                  onClick={() => router.push('/admin/sessions/create')}
                >
                  Create Session
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sessions.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="heading-4 text-tertiary-500">
                            Session {session.code}
                          </h3>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="body-2 text-tertiary-300">
                              {session.playerCount} players
                            </p>
                            <p className="body-2 text-tertiary-300">
                              {session.revealInterval}min intervals
                            </p>
                            <div className="flex items-center gap-1 text-tertiary-300">
                              <Clock className="w-3 h-3" />
                              <p className="body-3">
                                {new Date(session.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(session.status)}>
                          {getStatusText(session.status)}
                        </Badge>
                        
                        <div className="flex gap-2">
                          {/* Cancel/End Session Button - for cancellable sessions */}
                          {(session.status === 'WAITING' || session.status === 'ACTIVE' || session.status === 'PAUSED') && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleEndSession(session.id)}
                              disabled={endingSessionId === session.id}
                            >
                              {endingSessionId === session.id ? 'Ending...' : session.status === 'WAITING' ? 'Cancel' : 'End'}
                            </Button>
                          )}

                          {/* Primary Action Buttons */}
                          {session.status === 'WAITING' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/sessions/${session.id}`)}
                            >
                              Manage
                            </Button>
                          )}
                          {session.status === 'ACTIVE' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => router.push(`/admin/sessions/${session.id}`)}
                            >
                              Control Panel
                            </Button>
                          )}
                          {session.status === 'PAUSED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/sessions/${session.id}`)}
                            >
                              Manage
                            </Button>
                          )}
                          {session.status === 'ENDED' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => router.push(`/game/${session.code}/results`)}
                            >
                              View Results
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
    </div>
  )
}

export default AdminDashboard
