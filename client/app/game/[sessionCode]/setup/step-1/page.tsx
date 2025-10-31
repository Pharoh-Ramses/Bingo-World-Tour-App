"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useSetup, Location } from '@/lib/setup-context'

export default function Step1Page() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const sessionCode = params.sessionCode as string

  const {
    state,
    setSessionCode,
    setLocations,
    toggleLocation,
    selectRandomLocations,
    clearSelections,
    setStep,
  } = useSetup()

  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | 'ALL'>('ALL')

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      router.push('/sign-in')
      return
    }

    setSessionCode(sessionCode)
    fetchLocations()
  }, [isLoaded, user, sessionCode])

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations')
      if (response.ok) {
        const data = await response.json()
        setLocations(data.locations)
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Safely filter locations only if data is loaded
  const filteredLocations = !isLoading && state.allLocations.length > 0
    ? state.allLocations.filter((location) => {
        const matchesSearch = location.name.toLowerCase().includes(search.toLowerCase())
        const matchesCategory =
          categoryFilter === 'ALL' || location.category === categoryFilter
        return matchesSearch && matchesCategory
      })
    : []

  // Safely extract categories only if data is loaded
  const categories: string[] = !isLoading && state.allLocations.length > 0
    ? [
        'ALL',
        ...Array.from(new Set(state.allLocations.map((l) => l.category).filter((c): c is string => c !== null)))
      ]
    : ['ALL']

  const isLocationSelected = (id: string) => state.selectedLocationIds.includes(id)

  const handleNext = () => {
    setStep(2)
    router.push(`/game/${sessionCode}/setup/step-2`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="body-1 text-tertiary-300">Loading locations...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <Badge className="mb-4">Step 1 of 2</Badge>
            <h1 className="heading-1 text-tertiary-500">Select Your Locations</h1>
            <p className="body-1 text-tertiary-300 mt-2">
              Choose 24 locations for your bingo board
            </p>
          </div>

          {/* Progress */}
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="body-2 text-tertiary-600 font-medium">
                    {state.selectedLocationIds.length} / 24 locations selected
                  </p>
                  <div className="w-full bg-neutral-200 rounded-full h-2 mt-2" style={{maxWidth: '300px'}}>
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${(state.selectedLocationIds.length / 24) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => selectRandomLocations(24)}
                    disabled={state.allLocations.length < 24}
                  >
                    Random 24
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearSelections}
                    disabled={state.selectedLocationIds.length === 0}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search locations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={categoryFilter === category ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setCategoryFilter(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-neutral-200 rounded w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-neutral-200 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-neutral-200 rounded w-full" />
                  </CardContent>
                </Card>
              ))
            ) : filteredLocations.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="body-1 text-tertiary-300">
                  {state.allLocations.length === 0
                    ? 'No locations available. Please contact an admin.'
                    : 'No locations match your filters.'}
                </p>
              </div>
            ) : (
              filteredLocations.map((location) => {
              const selected = isLocationSelected(location.id)
              const canSelect = !selected && state.selectedLocationIds.length < 24

              return (
                <Card
                  key={location.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selected ? 'ring-2 ring-primary-500 bg-primary-50' : ''
                  } ${!canSelect && !selected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => {
                    if (selected || canSelect) {
                      toggleLocation(location.id)
                    }
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="heading-5 text-tertiary-600">
                        {location.name}
                      </CardTitle>
                      {selected && (
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                          >
                            <polyline points="3,8 6,11 13,4" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {location.category && (
                      <Badge size="sm" variant="outline" className="mb-2">
                        {location.category}
                      </Badge>
                    )}
                    {location.description && (
                      <p className="body-3 text-tertiary-400 line-clamp-2">
                        {location.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-neutral-200 py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-20 lg:px-20">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <Button variant="outline" onClick={() => router.push('/join')}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={state.selectedLocationIds.length !== 24}
              >
                Next: Arrange Board
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
