"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Location {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  category: string | null
}

interface GameSession {
  id: string
  code: string
  status: 'WAITING' | 'STARTING' | 'ACTIVE' | 'PAUSED' | 'ENDED'
  revealInterval: number
  playerCount: number
}

const BoardSetupPage = () => {
  const params = useParams()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const sessionCode = params.sessionCode as string

  const [session, setSession] = useState<GameSession | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [boardLayout, setBoardLayout] = useState<(string | null)[]>(new Array(25).fill(null))
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchSessionAndLocations = useCallback(async () => {
    try {
      // Fetch session status
      const sessionResponse = await fetch(`/api/game/${sessionCode}/status`)
      if (!sessionResponse.ok) {
        setError('Session not found')
        return
      }
      const sessionData = await sessionResponse.json()
      setSession(sessionData)

      // Fetch all available locations
      const locationsResponse = await fetch('/api/locations')
      if (locationsResponse.ok) {
        const locationsData = await locationsResponse.json()
        setLocations(locationsData.locations)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setError('Failed to load game data')
    } finally {
      setIsLoading(false)
    }
  }, [sessionCode])

  useEffect(() => {
    if (isLoaded && user && sessionCode) {
      fetchSessionAndLocations()
    } else if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [isLoaded, user, sessionCode, router, fetchSessionAndLocations])

  const handleLocationSelect = (locationId: string) => {
    if (selectedLocations.includes(locationId)) {
      // Remove from selection
      setSelectedLocations(prev => prev.filter(id => id !== locationId))
    } else if (selectedLocations.length < 24) {
      // Add to selection
      setSelectedLocations(prev => [...prev, locationId])
    }
  }

  const handleBoardPositionClick = (position: number) => {
    if (position === 12) return // Center is always FREE

    if (boardLayout[position]) {
      // Remove location from this position
      const newLayout = [...boardLayout]
      newLayout[position] = null
      setBoardLayout(newLayout)
    } else if (selectedLocations.length > 0) {
      // Place first selected location here
      const newLayout = [...boardLayout]
      newLayout[position] = selectedLocations[0]
      setBoardLayout(newLayout)
      setSelectedLocations(prev => prev.slice(1))
    }
  }

  const handleSaveBoard = async () => {
    if (boardLayout.filter((loc, index) => loc && index !== 12).length !== 24) {
      setError('Please place all 24 locations on your board')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/game/${sessionCode}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boardLayout
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to save board')
        setIsSaving(false)
        return
      }

      // Redirect to waiting room
      router.push(`/game/${sessionCode}/lobby`)
    } catch {
      setError('Something went wrong. Please try again.')
      setIsSaving(false)
    }
  }

  const getLocationById = (id: string) => {
    return locations.find(loc => loc.id === id)
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
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="heading-1 text-tertiary-500">
            Set Up Your BINGO Board
          </h1>
          <p className="body-1 text-tertiary-300 mt-2">
            Session {session.code} • Select 24 locations for your 5x5 board
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Bingo Board */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="heading-3 text-tertiary-500">
                  Your BINGO Board
                </CardTitle>
                <CardDescription>
                  Click on empty spaces to place your selected locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-1 sm:gap-2 max-w-md mx-auto">
                  {boardLayout.map((locationId, position) => (
                    <div
                      key={position}
                      className={`
                        aspect-square border-2 rounded-lg flex items-center justify-center p-1 sm:p-2 cursor-pointer transition-all
                        ${position === 12 
                          ? 'bg-primary-500 text-white border-primary-600' 
                          : locationId 
                            ? 'bg-primary-100 border-primary-300 hover:bg-primary-200' 
                            : 'bg-neutral-100 border-neutral-300 hover:bg-neutral-200'
                        }
                      `}
                      onClick={() => handleBoardPositionClick(position)}
                    >
                      {position === 12 ? (
                        <div className="text-center">
                          <p className="body-4 sm:body-3 font-bold">FREE</p>
                        </div>
                      ) : locationId ? (
                        <div className="text-center">
                          <p className="body-5 sm:body-4 text-tertiary-600 font-medium">
                            {getLocationById(locationId)?.name}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="body-5 sm:body-4 text-tertiary-400">Empty</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-center">
                  <p className="body-2 text-tertiary-500">
                    Placed: {boardLayout.filter((loc, index) => loc && index !== 12).length}/24
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Location Selection */}
          <div className="space-y-6">
            {/* Selected Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="heading-4 text-tertiary-500">
                  Selected Locations ({selectedLocations.length}/24)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedLocations.length === 0 ? (
                  <p className="body-2 text-tertiary-300 text-center py-4">
                    No locations selected yet
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedLocations.map((locationId) => {
                      const location = getLocationById(locationId)
                      return (
                        <div 
                          key={locationId}
                          className="p-2 bg-primary-100 rounded border border-primary-300"
                        >
                          <p className="body-3 text-tertiary-600 font-medium">
                            {location?.name}
                          </p>
                          {location?.category && (
                            <Badge className="mt-1 bg-accent-sage text-white text-xs">
                              {location.category}
                            </Badge>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="heading-4 text-tertiary-500">
                  Available Locations
                </CardTitle>
                <CardDescription>
                  Click to select locations for your board
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {locations.map((location) => {
                    const isSelected = selectedLocations.includes(location.id)
                    const isPlaced = boardLayout.includes(location.id)
                    
                    return (
                      <div
                        key={location.id}
                        className={`
                          p-3 rounded border cursor-pointer transition-all
                          ${isPlaced 
                            ? 'bg-success/20 border-success/40 cursor-not-allowed' 
                            : isSelected 
                              ? 'bg-primary-200 border-primary-400' 
                              : 'bg-white border-neutral-300 hover:bg-neutral-50'
                          }
                        `}
                        onClick={() => !isPlaced && handleLocationSelect(location.id)}
                      >
                        <p className="body-3 text-tertiary-600 font-medium">
                          {location.name}
                        </p>
                        {location.category && (
                          <Badge className="mt-1 bg-accent-sage text-white text-xs">
                            {location.category}
                          </Badge>
                        )}
                        {isPlaced && (
                          <Badge className="mt-1 bg-success text-white text-xs">
                            Placed
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="space-y-4">
              {error && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}
              
              <Button 
                variant="primary" 
                onClick={handleSaveBoard}
                disabled={isSaving || boardLayout.filter((loc, index) => loc && index !== 12).length !== 24}
                className="w-full h-12"
              >
                {isSaving ? 'Saving...' : 'Save Board & Join Game'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BoardSetupPage
