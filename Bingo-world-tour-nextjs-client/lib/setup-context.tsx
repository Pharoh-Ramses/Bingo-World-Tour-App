"use client"

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react'

export interface Location {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  category: string | null
}

interface SetupState {
  sessionCode: string
  selectedLocationIds: string[]
  boardLayout: (string | null)[]
  allLocations: Location[]
  currentStep: 1 | 2
}

type SetupAction =
  | { type: 'SET_SESSION_CODE'; payload: string }
  | { type: 'SET_LOCATIONS'; payload: Location[] }
  | { type: 'TOGGLE_LOCATION'; payload: string }
  | { type: 'SELECT_RANDOM_LOCATIONS'; payload: number }
  | { type: 'CLEAR_SELECTIONS' }
  | { type: 'UPDATE_BOARD_POSITION'; payload: { position: number; locationId: string | null } }
  | { type: 'AUTO_ARRANGE_BOARD' }
  | { type: 'SHUFFLE_BOARD' }
  | { type: 'CLEAR_BOARD' }
  | { type: 'SET_STEP'; payload: 1 | 2 }
  | { type: 'RESET' }

const initialState: SetupState = {
  sessionCode: '',
  selectedLocationIds: [],
  boardLayout: Array(25).fill(null),
  allLocations: [],
  currentStep: 1,
}

function setupReducer(state: SetupState, action: SetupAction): SetupState {
  switch (action.type) {
    case 'SET_SESSION_CODE':
      return { ...state, sessionCode: action.payload }

    case 'SET_LOCATIONS':
      return { ...state, allLocations: action.payload }

    case 'TOGGLE_LOCATION': {
      const locationId = action.payload
      const isSelected = state.selectedLocationIds.includes(locationId)

      if (isSelected) {
        // Remove from selections
        return {
          ...state,
          selectedLocationIds: state.selectedLocationIds.filter(id => id !== locationId),
        }
      } else {
        // Add to selections (max 24)
        if (state.selectedLocationIds.length >= 24) {
          return state
        }
        return {
          ...state,
          selectedLocationIds: [...state.selectedLocationIds, locationId],
        }
      }
    }

    case 'SELECT_RANDOM_LOCATIONS': {
      const count = Math.min(action.payload, state.allLocations.length, 24)
      const shuffled = [...state.allLocations].sort(() => Math.random() - 0.5)
      const randomIds = shuffled.slice(0, count).map(loc => loc.id)
      return {
        ...state,
        selectedLocationIds: randomIds,
      }
    }

    case 'CLEAR_SELECTIONS':
      return {
        ...state,
        selectedLocationIds: [],
      }

    case 'UPDATE_BOARD_POSITION': {
      const { position, locationId } = action.payload
      const newLayout = [...state.boardLayout]
      newLayout[position] = locationId
      return {
        ...state,
        boardLayout: newLayout,
      }
    }

    case 'AUTO_ARRANGE_BOARD': {
      const newLayout = Array(25).fill(null)
      newLayout[12] = null // Center is always FREE

      // Get unplaced selected locations
      const placedIds = state.boardLayout.filter((id, idx) => id !== null && idx !== 12)
      const unplacedIds = state.selectedLocationIds.filter(id => !placedIds.includes(id))

      // Fill board with unplaced locations
      let unplacedIndex = 0
      for (let i = 0; i < 25; i++) {
        if (i === 12) continue // Skip center
        if (state.boardLayout[i]) {
          newLayout[i] = state.boardLayout[i] // Keep already placed
        } else if (unplacedIndex < unplacedIds.length) {
          newLayout[i] = unplacedIds[unplacedIndex]
          unplacedIndex++
        }
      }

      return {
        ...state,
        boardLayout: newLayout,
      }
    }

    case 'SHUFFLE_BOARD': {
      const newLayout = Array(25).fill(null)
      newLayout[12] = null // Center is always FREE

      // Shuffle selected locations
      const shuffled = [...state.selectedLocationIds].sort(() => Math.random() - 0.5)

      // Place shuffled locations
      let shuffleIndex = 0
      for (let i = 0; i < 25; i++) {
        if (i === 12) continue // Skip center
        if (shuffleIndex < shuffled.length) {
          newLayout[i] = shuffled[shuffleIndex]
          shuffleIndex++
        }
      }

      return {
        ...state,
        boardLayout: newLayout,
      }
    }

    case 'CLEAR_BOARD':
      return {
        ...state,
        boardLayout: Array(25).fill(null),
      }

    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
      }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

interface SetupContextValue {
  state: SetupState
  setSessionCode: (code: string) => void
  setLocations: (locations: Location[]) => void
  toggleLocation: (locationId: string) => void
  selectRandomLocations: (count: number) => void
  clearSelections: () => void
  updateBoardPosition: (position: number, locationId: string | null) => void
  autoArrangeBoard: () => void
  shuffleBoard: () => void
  clearBoard: () => void
  setStep: (step: 1 | 2) => void
  reset: () => void
}

const SetupContext = createContext<SetupContextValue | undefined>(undefined)

export function SetupProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(setupReducer, initialState)

  const setSessionCode = useCallback((code: string) => {
    dispatch({ type: 'SET_SESSION_CODE', payload: code })
  }, [])

  const setLocations = useCallback((locations: Location[]) => {
    dispatch({ type: 'SET_LOCATIONS', payload: locations })
  }, [])

  const toggleLocation = useCallback((locationId: string) => {
    dispatch({ type: 'TOGGLE_LOCATION', payload: locationId })
  }, [])

  const selectRandomLocations = useCallback((count: number) => {
    dispatch({ type: 'SELECT_RANDOM_LOCATIONS', payload: count })
  }, [])

  const clearSelections = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTIONS' })
  }, [])

  const updateBoardPosition = useCallback((position: number, locationId: string | null) => {
    dispatch({ type: 'UPDATE_BOARD_POSITION', payload: { position, locationId } })
  }, [])

  const autoArrangeBoard = useCallback(() => {
    dispatch({ type: 'AUTO_ARRANGE_BOARD' })
  }, [])

  const shuffleBoard = useCallback(() => {
    dispatch({ type: 'SHUFFLE_BOARD' })
  }, [])

  const clearBoard = useCallback(() => {
    dispatch({ type: 'CLEAR_BOARD' })
  }, [])

  const setStep = useCallback((step: 1 | 2) => {
    dispatch({ type: 'SET_STEP', payload: step })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  return (
    <SetupContext.Provider
      value={{
        state,
        setSessionCode,
        setLocations,
        toggleLocation,
        selectRandomLocations,
        clearSelections,
        updateBoardPosition,
        autoArrangeBoard,
        shuffleBoard,
        clearBoard,
        setStep,
        reset,
      }}
    >
      {children}
    </SetupContext.Provider>
  )
}

export function useSetup() {
  const context = useContext(SetupContext)
  if (context === undefined) {
    throw new Error('useSetup must be used within a SetupProvider')
  }
  return context
}
