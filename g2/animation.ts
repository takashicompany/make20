import type { TileMove } from './game'

// ---------------------------------------------------------------------------
// Animation state for slide transitions
// ---------------------------------------------------------------------------

export type AnimationState = {
  moves: TileMove[]
  currentFrame: number
  totalFrames: number
  done: boolean
}

/**
 * Calculate total animation frames based on max tile distance
 */
export function createAnimation(moves: TileMove[]): AnimationState {
  let maxDist = 0
  for (const m of moves) {
    const dist = Math.abs(m.toRow - m.fromRow) + Math.abs(m.toCol - m.fromCol)
    if (dist > maxDist) maxDist = dist
  }

  return {
    moves,
    currentFrame: 0,
    totalFrames: maxDist, // 1 frame per cell of distance
    done: maxDist === 0,
  }
}

/**
 * Advance animation by one frame. Returns true if animation is complete.
 */
export function advanceFrame(anim: AnimationState): boolean {
  anim.currentFrame++
  if (anim.currentFrame >= anim.totalFrames) {
    anim.done = true
    return true
  }
  return false
}

/**
 * Get the set of cells that are currently being animated (source positions).
 * These should be excluded from the static board render.
 */
export function getAnimatingCells(moves: TileMove[]): Set<string> {
  const cells = new Set<string>()
  for (const m of moves) {
    cells.add(`${m.fromRow},${m.fromCol}`)
  }
  return cells
}

/**
 * Get the set of cells that have arrived at their destination at the current frame.
 * These can be shown on the static board.
 */
export function getArrivedCells(moves: TileMove[], currentFrame: number): Set<string> {
  const cells = new Set<string>()
  for (const m of moves) {
    const dist = Math.abs(m.toRow - m.fromRow) + Math.abs(m.toCol - m.fromCol)
    if (currentFrame >= dist) {
      cells.add(`${m.toRow},${m.toCol}`)
    }
  }
  return cells
}
