// Game logic utilities for BINGO World Tour

export type BoardPosition = {
  row: number
  col: number
  position: number // 0-24 (5x5 grid)
}

export type WinPattern = 
  | 'row-0' | 'row-1' | 'row-2' | 'row-3' | 'row-4'
  | 'col-0' | 'col-1' | 'col-2' | 'col-3' | 'col-4'
  | 'diagonal-1' | 'diagonal-2'

export type BoardState = {
  positions: (string | null)[] // 25 positions, center (12) is always 'FREE'
  selected: boolean[] // which positions player has marked
  revealed: boolean[] // which positions have been revealed
}

/**
 * Convert 1D position (0-24) to 2D coordinates (row, col)
 */
export function positionToCoords(position: number): BoardPosition {
  return {
    row: Math.floor(position / 5),
    col: position % 5,
    position
  }
}

/**
 * Convert 2D coordinates to 1D position
 */
export function coordsToPosition(row: number, col: number): number {
  return row * 5 + col
}

/**
 * Get all positions for a specific win pattern
 */
export function getWinPatternPositions(pattern: WinPattern): number[] {
  switch (pattern) {
    // Rows
    case 'row-0': return [0, 1, 2, 3, 4]
    case 'row-1': return [5, 6, 7, 8, 9]
    case 'row-2': return [10, 11, 12, 13, 14]
    case 'row-3': return [15, 16, 17, 18, 19]
    case 'row-4': return [20, 21, 22, 23, 24]
    
    // Columns
    case 'col-0': return [0, 5, 10, 15, 20]
    case 'col-1': return [1, 6, 11, 16, 21]
    case 'col-2': return [2, 7, 12, 17, 22]
    case 'col-3': return [3, 8, 13, 18, 23]
    case 'col-4': return [4, 9, 14, 19, 24]
    
    // Diagonals
    case 'diagonal-1': return [0, 6, 12, 18, 24] // top-left to bottom-right
    case 'diagonal-2': return [4, 8, 12, 16, 20] // top-right to bottom-left
    
    default:
      return []
  }
}

/**
 * Check if a specific pattern is complete (all positions selected)
 */
export function isPatternComplete(
  pattern: WinPattern, 
  selected: boolean[], 
  revealed: boolean[]
): boolean {
  const positions = getWinPatternPositions(pattern)
  
  return positions.every(pos => {
    // Center position (12) is always considered complete
    if (pos === 12) return true
    
    // Position must be revealed AND selected
    return revealed[pos] && selected[pos]
  })
}

/**
 * Find all winning patterns for a board
 */
export function findWinningPatterns(
  selected: boolean[], 
  revealed: boolean[]
): WinPattern[] {
  const patterns: WinPattern[] = [
    'row-0', 'row-1', 'row-2', 'row-3', 'row-4',
    'col-0', 'col-1', 'col-2', 'col-3', 'col-4',
    'diagonal-1', 'diagonal-2'
  ]
  
  return patterns.filter(pattern => isPatternComplete(pattern, selected, revealed))
}

/**
 * Check if player has a valid BINGO
 */
export function hasBingo(selected: boolean[], revealed: boolean[]): boolean {
  return findWinningPatterns(selected, revealed).length > 0
}

/**
 * Generate a random 6-character session code
 */
export function generateSessionCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Validate session code format
 */
export function isValidSessionCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code)
}

/**
 * Get the next reveal time based on interval
 */
export function getNextRevealTime(intervalMinutes: number): Date {
  return new Date(Date.now() + intervalMinutes * 60 * 1000)
}

/**
 * Calculate time remaining until next reveal
 */
export function getTimeUntilNextReveal(nextRevealTime: Date): number {
  return Math.max(0, nextRevealTime.getTime() - Date.now())
}

/**
 * Format time remaining as MM:SS
 */
export function formatTimeRemaining(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Get all possible win patterns for display
 */
export function getAllWinPatterns(): WinPattern[] {
  return [
    'row-0', 'row-1', 'row-2', 'row-3', 'row-4',
    'col-0', 'col-1', 'col-2', 'col-3', 'col-4',
    'diagonal-1', 'diagonal-2'
  ]
}

/**
 * Get human-readable pattern name
 */
export function getPatternName(pattern: WinPattern): string {
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
    default: return 'Unknown Pattern'
  }
}
