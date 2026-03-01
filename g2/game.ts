import type { Board, Cell } from './state'
import { TILE_4_CHANCE } from './layout'

// ---------------------------------------------------------------------------
// Tile movement info (for animation)
// ---------------------------------------------------------------------------

export type TileMove = {
  fromRow: number
  fromCol: number
  toRow: number
  toCol: number
  value: Cell
  merged: boolean // true if this tile merged into another at destination
}

export type SlideResult = {
  board: Board
  moves: TileMove[]
  scoreGained: number
  changed: boolean
}

// ---------------------------------------------------------------------------
// Core: merge a single row/column (left-to-right direction)
// ---------------------------------------------------------------------------

function mergeRow(row: Cell[]): { merged: Cell[]; score: number; mapping: { from: number; to: number; merged: boolean }[] } {
  const nonZero = row.map((v, i) => ({ value: v, index: i })).filter((x) => x.value !== 0)
  const result: Cell[] = new Array(row.length).fill(0)
  const mapping: { from: number; to: number; merged: boolean }[] = []
  let score = 0
  let writePos = 0

  let i = 0
  while (i < nonZero.length) {
    if (i + 1 < nonZero.length && nonZero[i].value === nonZero[i + 1].value) {
      // Merge
      const newVal = nonZero[i].value * 2
      result[writePos] = newVal
      score += newVal
      mapping.push({ from: nonZero[i].index, to: writePos, merged: false })
      mapping.push({ from: nonZero[i + 1].index, to: writePos, merged: true })
      writePos++
      i += 2
    } else {
      // Just slide
      result[writePos] = nonZero[i].value
      mapping.push({ from: nonZero[i].index, to: writePos, merged: false })
      writePos++
      i++
    }
  }

  return { merged: result, score, mapping }
}

// ---------------------------------------------------------------------------
// Slide: move all tiles in a direction
// ---------------------------------------------------------------------------

export type Direction = 'up' | 'down' | 'left' | 'right'

function createEmptyBoard(size: number): Board {
  return Array.from({ length: size }, () => new Array(size).fill(0))
}

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row])
}

function getRow(board: Board, row: number): Cell[] {
  return [...board[row]]
}

function getCol(board: Board, col: number): Cell[] {
  return board.map((row) => row[col])
}

export function slide(board: Board, direction: Direction): SlideResult {
  const size = board.length
  const newBoard = createEmptyBoard(size)
  const moves: TileMove[] = []
  let totalScore = 0
  let changed = false

  if (direction === 'left' || direction === 'right') {
    for (let r = 0; r < size; r++) {
      let row = getRow(board, r)
      if (direction === 'right') row.reverse()

      const { merged, score, mapping } = mergeRow(row)
      totalScore += score

      if (direction === 'right') merged.reverse()
      newBoard[r] = merged

      for (const m of mapping) {
        const fromCol = direction === 'right' ? size - 1 - m.from : m.from
        const toCol = direction === 'right' ? size - 1 - m.to : m.to
        if (fromCol !== toCol) changed = true
        moves.push({
          fromRow: r,
          fromCol,
          toRow: r,
          toCol,
          value: board[r][fromCol],
          merged: m.merged,
        })
      }
    }
  } else {
    // up or down
    for (let c = 0; c < size; c++) {
      let col = getCol(board, c)
      if (direction === 'down') col.reverse()

      const { merged, score, mapping } = mergeRow(col)
      totalScore += score

      if (direction === 'down') merged.reverse()
      for (let r = 0; r < size; r++) {
        newBoard[r][c] = merged[r]
      }

      for (const m of mapping) {
        const fromRow = direction === 'down' ? size - 1 - m.from : m.from
        const toRow = direction === 'down' ? size - 1 - m.to : m.to
        if (fromRow !== toRow) changed = true
        moves.push({
          fromRow,
          fromCol: c,
          toRow,
          toCol: c,
          value: board[fromRow][c],
          merged: m.merged,
        })
      }
    }
  }

  // Check for merges (score > 0 means something merged)
  if (totalScore > 0) changed = true

  return { board: newBoard, moves, scoreGained: totalScore, changed }
}

// ---------------------------------------------------------------------------
// Place a random tile (2 or 4)
// ---------------------------------------------------------------------------

export function getEmptyCells(board: Board): { row: number; col: number }[] {
  const empty: { row: number; col: number }[] = []
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] === 0) {
        empty.push({ row: r, col: c })
      }
    }
  }
  return empty
}

export function placeRandomTile(board: Board): { row: number; col: number; value: number } | null {
  const empty = getEmptyCells(board)
  if (empty.length === 0) return null

  const pos = empty[Math.floor(Math.random() * empty.length)]
  const value = Math.random() < TILE_4_CHANCE ? 4 : 2
  board[pos.row][pos.col] = value
  return { ...pos, value }
}

// ---------------------------------------------------------------------------
// Game over check
// ---------------------------------------------------------------------------

export function isGameOver(board: Board): boolean {
  const size = board.length

  // Check for empty cells
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 0) return false
    }
  }

  // Check for possible merges
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const val = board[r][c]
      // Check right neighbor
      if (c + 1 < size && board[r][c + 1] === val) return false
      // Check bottom neighbor
      if (r + 1 < size && board[r + 1][c] === val) return false
    }
  }

  return true
}

// ---------------------------------------------------------------------------
// Create initial board
// ---------------------------------------------------------------------------

export function createInitialBoard(size: number): Board {
  const board = createEmptyBoard(size)
  placeRandomTile(board)
  placeRandomTile(board)
  return board
}
