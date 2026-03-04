import type { EvenAppBridge } from '@evenrealities/even_hub_sdk'

export type Axis = 'vertical' | 'horizontal'

export type ScreenMode = 'game' | 'gameover'

export type Cell = number // 0 = empty, 2/4/8/16/...

export type Board = Cell[][]

export type GameState = {
  screen: ScreenMode
  board: Board
  score: number
  highScore: number
  maxTile: number
  axis: Axis
  animating: boolean
  startupRendered: boolean
  clickable: boolean
}

export const state: GameState = {
  screen: 'game',
  board: [],
  score: 0,
  highScore: 0,
  maxTile: 0,
  axis: 'vertical',
  animating: false,
  startupRendered: false,
  clickable: true,
}

export let bridge: EvenAppBridge | null = null

export function setBridge(b: EvenAppBridge): void {
  bridge = b
}

// ---------------------------------------------------------------------------
// Persistence (localStorage)
// ---------------------------------------------------------------------------

const SAVE_KEY = 'make20-even-g2-save'

type SaveData = {
  board: Board
  score: number
  highScore: number
  maxTile: number
}

export function saveState(): void {
  const data: SaveData = {
    board: state.board,
    score: state.score,
    highScore: state.highScore,
    maxTile: state.maxTile,
  }
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  } catch { /* ignore quota errors */ }
}

export function loadState(): boolean {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return false
    const data: SaveData = JSON.parse(raw)
    if (!Array.isArray(data.board) || data.board.length === 0) return false
    state.board = data.board
    state.score = data.score ?? 0
    state.highScore = data.highScore ?? 0
    state.maxTile = data.maxTile ?? 0
    return true
  } catch {
    return false
  }
}

/** Reset all data (development use only) */
export function resetAllData(): void {
  localStorage.removeItem(SAVE_KEY)
  state.score = 0
  state.highScore = 0
  state.maxTile = 0
  state.board = []
}
