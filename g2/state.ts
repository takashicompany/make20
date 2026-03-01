import type { EvenAppBridge } from '@evenrealities/even_hub_sdk'
import { DEFAULT_BOARD_SIZE } from './layout'

export type Axis = 'vertical' | 'horizontal'

export type ScreenMode = 'size-select' | 'game' | 'gameover'

export type Cell = number // 0 = empty, 2/4/8/16/...

export type Board = Cell[][]

export type GameState = {
  screen: ScreenMode
  boardSize: number
  board: Board
  score: number
  axis: Axis
  animating: boolean
  startupRendered: boolean
}

export const state: GameState = {
  screen: 'size-select',
  boardSize: DEFAULT_BOARD_SIZE,
  board: [],
  score: 0,
  axis: 'vertical',
  animating: false,
  startupRendered: false,
}

export let bridge: EvenAppBridge | null = null

export function setBridge(b: EvenAppBridge): void {
  bridge = b
}
