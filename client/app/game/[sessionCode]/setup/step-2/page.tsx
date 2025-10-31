"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSetup } from '@/lib/setup-context'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'

export default function Step2Page() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const sessionCode = params.sessionCode as string

  const {
    state,
    updateBoardPosition,
    autoArrangeBoard,
    shuffleBoard,
    clearBoard,
    setStep,
  } = useSetup()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      router.push('/sign-in')
      return
    }

    // Redirect back if no locations selected
    if (state.selectedLocationIds.length !== 24) {
      router.push(`/game/${sessionCode}/setup/step-1`)
    }
  }, [isLoaded, user, state.selectedLocationIds.length, sessionCode, router])

  const getLocationById = (id: string | null) => {
    if (!id) return null
    return state.allLocations.find((loc) => loc.id === id)
  }

  const unplacedLocations = state.selectedLocationIds.length > 0
    ? state.selectedLocationIds.filter((id) => !state.boardLayout.includes(id))
    : []

  const placedCount = state.boardLayout.filter((id, idx) => id !== null && idx !== 12).length

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Handle dropping on board position
    if (overId.startsWith('board-')) {
      const position = parseInt(overId.split('-')[1])
      if (position === 12) return // Can't place on center

      updateBoardPosition(position, activeId)
    }
  }

  const handleSaveBoard = async () => {
    if (placedCount !== 24) {
      setError('Please place all 24 locations on the board')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/game/${sessionCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardLayout: state.boardLayout }),
      })

      if (response.ok) {
        router.push(`/game/${sessionCode}/lobby`)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save board')
      }
    } catch (error) {
      console.error('Failed to save board:', error)
      setError('Failed to save board. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleBack = () => {
    setStep(1)
    router.push(`/game/${sessionCode}/setup/step-1`)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <Badge className="mb-4">Step 2 of 2</Badge>
              <h1 className="heading-1 text-tertiary-500">Arrange Your Board</h1>
              <p className="body-1 text-tertiary-300 mt-2">
                Drag locations onto your 5×5 bingo board
              </p>
            </div>

            {/* Progress */}
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="body-2 text-tertiary-600 font-medium">
                      {placedCount} / 24 locations placed
                    </p>
                    <div className="w-full bg-neutral-200 rounded-full h-2 mt-2" style={{maxWidth: '300px'}}>
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all"
                        style={{ width: `${(placedCount / 24) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={autoArrangeBoard}>
                      Auto-Arrange
                    </Button>
                    <Button variant="outline" onClick={shuffleBoard}>
                      Shuffle
                    </Button>
                    <Button variant="outline" onClick={clearBoard}>
                      Clear
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {error && (
              <Card className="border-error-300 bg-error-50">
                <CardContent className="py-4">
                  <p className="body-2 text-error-600">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Unplaced Locations */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="heading-4 text-tertiary-500">
                      Available Locations ({unplacedLocations.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {unplacedLocations.map((locationId) => {
                        const location = getLocationById(locationId)
                        if (!location) return null

                        return (
                          <div
                            key={location.id}
                            id={location.id}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.effectAllowed = 'move'
                              e.dataTransfer.setData('text/plain', location.id)
                            }}
                            className="p-3 bg-white border border-neutral-200 rounded-lg cursor-grab active:cursor-grabbing hover:border-primary-500 hover:shadow-md transition-all"
                          >
                            <p className="body-2 text-tertiary-600 font-medium">
                              {location.name}
                            </p>
                            {location.category && (
                              <Badge size="sm" variant="outline" className="mt-1">
                                {location.category}
                              </Badge>
                            )}
                          </div>
                        )
                      })}
                      {unplacedLocations.length === 0 && (
                        <p className="body-3 text-tertiary-300 text-center py-8">
                          All locations placed!
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right: 5x5 Board */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="heading-4 text-tertiary-500">
                      Your Bingo Board
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-2 sm:gap-3">
                      {Array.from({ length: 25 }).map((_, index) => {
                        const locationId = state.boardLayout[index]
                        const location = getLocationById(locationId)
                        const isFree = index === 12

                        return (
                          <div
                            key={index}
                            id={`board-${index}`}
                            onDragOver={(e) => {
                              if (isFree) return
                              e.preventDefault()
                            }}
                            onDrop={(e) => {
                              if (isFree) return
                              e.preventDefault()
                              const draggedId = e.dataTransfer.getData('text/plain')
                              updateBoardPosition(index, draggedId)
                            }}
                            className={`aspect-square rounded-lg flex items-center justify-center text-center p-2 transition-all ${
                              isFree
                                ? 'bg-accent-sage text-white font-bold'
                                : location
                                  ? 'bg-primary-100 border border-primary-300 cursor-move hover:shadow-lg'
                                  : 'bg-white border-2 border-dashed border-neutral-300 hover:border-primary-400'
                            }`}
                            draggable={!!location && !isFree}
                            onDragStart={(e) => {
                              if (!location || isFree) return
                              e.dataTransfer.effectAllowed = 'move'
                              e.dataTransfer.setData('text/plain', location.id)
                            }}
                          >
                            {isFree ? (
                              <span className="body-3">FREE</span>
                            ) : location ? (
                              <span className="body-4 text-tertiary-600 font-medium line-clamp-3">
                                {location.name}
                              </span>
                            ) : (
                              <span className="body-4 text-tertiary-300">Drop here</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-neutral-200 py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-20 lg:px-20">
              <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Button variant="outline" onClick={handleBack}>
                  Back to Selection
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveBoard}
                  disabled={placedCount !== 24 || isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Board & Continue'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DragOverlay>
        {activeId ? (
          <div className="p-3 bg-white border-2 border-primary-500 rounded-lg shadow-lg">
            <p className="body-2 text-tertiary-600 font-medium">
              {getLocationById(activeId)?.name}
            </p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
