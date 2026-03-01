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
}

export let bridge: EvenAppBridge | null = null

export function setBridge(b: EvenAppBridge): void {
  bridge = b
}
