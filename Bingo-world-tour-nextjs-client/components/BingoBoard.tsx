"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'

interface Location {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  category: string | null
}

interface BingoBoardProps {
  boardLayout: (string | null)[]
  revealedLocations: string[]
  selectedTiles: boolean[]
  onTileClick: (position: number) => void
  locations: Location[]
  isGameActive: boolean
  winningPattern?: string | null
}

const BingoBoard = ({
  boardLayout,
  revealedLocations,
  selectedTiles,
  onTileClick,
  locations,
  isGameActive,
  winningPattern
}: BingoBoardProps) => {
  const [winningPositions, setWinningPositions] = useState<number[]>([])

  useEffect(() => {
    if (winningPattern) {
      // Calculate winning positions based on pattern
      const positions = getWinningPositions(winningPattern)
      setWinningPositions(positions)
    } else {
      setWinningPositions([])
    }
  }, [winningPattern])

  const getWinningPositions = (pattern: string): number[] => {
    switch (pattern) {
      case 'row-0': return [0, 1, 2, 3, 4]
      case 'row-1': return [5, 6, 7, 8, 9]
      case 'row-2': return [10, 11, 12, 13, 14]
      case 'row-3': return [15, 16, 17, 18, 19]
      case 'row-4': return [20, 21, 22, 23, 24]
      case 'col-0': return [0, 5, 10, 15, 20]
      case 'col-1': return [1, 6, 11, 16, 21]
      case 'col-2': return [2, 7, 12, 17, 22]
      case 'col-3': return [3, 8, 13, 18, 23]
      case 'col-4': return [4, 9, 14, 19, 24]
      case 'diagonal-1': return [0, 6, 12, 18, 24]
      case 'diagonal-2': return [4, 8, 12, 16, 20]
      default: return []
    }
  }

  const getLocationById = (id: string) => {
    return locations.find(loc => loc.id === id)
  }

  const getTileState = (position: number) => {
    const locationId = boardLayout[position]
    const isRevealed = position === 12 || (locationId && revealedLocations.includes(locationId))
    const isSelected = selectedTiles[position]
    const isWinning = winningPositions.includes(position)
    
    return {
      isRevealed,
      isSelected,
      isWinning,
      isCenter: position === 12,
      location: locationId ? getLocationById(locationId) : null
    }
  }

  const getTileClasses = (position: number) => {
    const state = getTileState(position)
    const baseClasses = "aspect-square border-2 rounded-lg flex items-center justify-center p-1 sm:p-2 transition-all duration-300"
    
    if (state.isWinning) {
      return `${baseClasses} bg-success text-white border-success-600 shadow-lg animate-pulse`
    }
    
    if (state.isCenter) {
      return `${baseClasses} bg-primary-500 text-white border-primary-600`
    }
    
    if (state.isRevealed && state.isSelected) {
      return `${baseClasses} bg-primary-300 text-white border-primary-500 shadow-md`
    }
    
    if (state.isRevealed) {
      return `${baseClasses} bg-primary-100 border-primary-300 hover:bg-primary-200 cursor-pointer`
    }
    
    return `${baseClasses} bg-neutral-200 border-neutral-400`
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="grid grid-cols-5 gap-1 sm:gap-2">
        {boardLayout.map((locationId, position) => {
          const state = getTileState(position)
          
          return (
            <div
              key={position}
              className={getTileClasses(position)}
              onClick={() => {
                if (isGameActive && state.isRevealed && !state.isCenter) {
                  onTileClick(position)
                }
              }}
            >
              {state.isCenter ? (
                <div className="text-center">
                  <p className="body-4 sm:body-3 font-bold">FREE</p>
                </div>
              ) : state.isRevealed ? (
                <div className="text-center w-full">
                  {state.location?.imageUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={state.location.imageUrl}
                        alt={state.location.name}
                        fill
                        className="object-cover rounded"
                      />
                      <div className="absolute inset-0 bg-black/40 rounded flex items-center justify-center">
                        <p className="body-5 sm:body-4 text-white font-medium text-center px-1">
                          {state.location.name}
                        </p>
                      </div>
                      {state.isSelected && (
                        <div className="absolute top-1 right-1">
                          <div className="w-4 h-4 bg-success rounded-full flex items-center justify-center">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20,6 9,17 4,12"></polyline>
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <p className="body-5 sm:body-4 text-tertiary-600 font-medium text-center">
                        {state.location?.name}
                      </p>
                      {state.location?.category && (
                        <Badge className="mt-1 bg-accent-sage text-white text-xs">
                          {state.location.category}
                        </Badge>
                      )}
                      {state.isSelected && (
                        <div className="mt-2">
                          <div className="w-4 h-4 bg-success rounded-full flex items-center justify-center">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20,6 9,17 4,12"></polyline>
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center w-full">
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-tertiary-300 rounded-full flex items-center justify-center mb-1 sm:mb-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    </div>
                    <p className="body-5 sm:body-4 text-tertiary-500 font-medium text-center">
                      {state.location?.name || 'Hidden'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {winningPattern && (
        <div className="mt-4 text-center">
          <Badge className="bg-success text-white text-lg px-4 py-2">
            🎉 BINGO! 🎉
          </Badge>
        </div>
      )}
    </div>
  )
}

export default BingoBoard
