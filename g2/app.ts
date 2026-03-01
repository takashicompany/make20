import type { EvenAppBridge } from '@evenrealities/even_hub_sdk'
import { appendEventLog } from '../_shared/log'
import {
  ANIM_FRAME_MS,
  ANIM_PIXELS_PER_FRAME,
  CELL_HEIGHT_PX,
  CELL_WIDTH_PX,
  NEW_TILE_DELAY_MS,
} from './layout'
import { state, setBridge, saveState, loadState, resetAllData } from './state'
import type { Direction, TileMove } from './game'
import { slide, placeRandomTile, isGameOver, createInitialBoard, getMaxTile } from './game'
import {
  renderFullBoard,
  renderHeader,
  renderMovingTilesAtPositions,
} from './board-text'
import {
  showGameBoard,
  showGameOverScreen,
  updateHeader,
  updateStaticBoard,
  rebuildGameBoardWithOffset,
} from './renderer'
import { onEvenHubEvent, setEventHandlers } from './events'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Update highScore and maxTile tracking */
function updateTracking(): void {
  if (state.score > state.highScore) {
    state.highScore = state.score
  }
  const boardMax = getMaxTile(state.board)
  if (boardMax > state.maxTile) {
    state.maxTile = boardMax
  }
}

// ---------------------------------------------------------------------------
// Game lifecycle
// ---------------------------------------------------------------------------

function startGame(): void {
  state.board = createInitialBoard(4)
  state.score = 0
  state.axis = 'vertical'
  state.screen = 'game'
  state.animating = false
  updateTracking()
  saveState()
  void showGameBoard()
  appendEventLog('Game started: 4x4')
}

function restartGame(): void {
  startGame()
  appendEventLog('Game: restarted')
}

// ---------------------------------------------------------------------------
// Animation helper: get ALL tiles still in transit (including merged)
// ---------------------------------------------------------------------------

function getMovingTilesForPhase(
  moves: TileMove[],
  direction: Direction,
  phase: number,
): { row: number; col: number; value: number }[] {
  const tiles: { row: number; col: number; value: number }[] = []
  for (const m of moves) {
    const dist = Math.abs(m.toRow - m.fromRow) + Math.abs(m.toCol - m.fromCol)
    if (dist === 0) continue
    if (dist > phase) {
      let row = m.fromRow
      let col = m.fromCol
      switch (direction) {
        case 'up': row -= phase; break
        case 'down': row += phase; break
        case 'left': col -= phase; break
        case 'right': col += phase; break
      }
      tiles.push({ row, col, value: m.value })
    }
  }
  return tiles
}

// ---------------------------------------------------------------------------
// Slide execution with pixel-smooth animation
// ---------------------------------------------------------------------------

async function executeSlide(direction: Direction): Promise<void> {
  if (state.animating) return
  state.animating = true

  try {
    const result = slide(state.board, direction)

    if (!result.changed) {
      state.animating = false
      return
    }

    state.score += result.scoreGained

    // Calculate max tile distance
    let maxDist = 0
    for (const m of result.moves) {
      const dist = Math.abs(m.toRow - m.fromRow) + Math.abs(m.toCol - m.fromCol)
      if (dist > maxDist) maxDist = dist
    }

    // Pixel-smooth phase-based animation
    if (maxDist > 0) {
      const isVertical = direction === 'up' || direction === 'down'
      const cellPx = isVertical ? CELL_HEIGHT_PX : CELL_WIDTH_PX
      const sign = (direction === 'left' || direction === 'up') ? -1 : 1
      const framesPerCell = Math.ceil(cellPx / ANIM_PIXELS_PER_FRAME)
      const headerText = renderHeader(state.score, state.highScore, state.axis, state.maxTile)

      // Blank source cells of all moving tiles from state.board
      for (const m of result.moves) {
        const dist = Math.abs(m.toRow - m.fromRow) + Math.abs(m.toCol - m.fromCol)
        if (dist > 0) {
          state.board[m.fromRow][m.fromCol] = 0
        }
      }

      for (let phase = 0; phase < maxDist; phase++) {
        const movingTiles = getMovingTilesForPhase(result.moves, direction, phase)
        if (movingTiles.length === 0) continue

        // Static from current state.board (updated progressively)
        const staticText = renderFullBoard(state.board)
        const movingText = renderMovingTilesAtPositions(movingTiles, 4)

        const startFrame = phase === 0 ? 0 : 1
        for (let frame = startFrame; frame <= framesPerCell; frame++) {
          const px = Math.min(frame * ANIM_PIXELS_PER_FRAME, cellPx)
          const offsetX = isVertical ? 0 : px * sign
          const offsetY = isVertical ? px * sign : 0
          await rebuildGameBoardWithOffset(headerText, staticText, movingText, offsetX, offsetY)
          if (frame < framesPerCell) await sleep(ANIM_FRAME_MS)
        }

        // Phase complete: land arrived non-merged tiles on state.board
        for (const m of result.moves) {
          if (m.merged) continue
          const dist = Math.abs(m.toRow - m.fromRow) + Math.abs(m.toCol - m.fromCol)
          if (dist === phase + 1) {
            state.board[m.toRow][m.toCol] = m.value
          }
        }
      }
    }

    // Apply final merged values and reset container positions
    state.board = result.board
    updateTracking()
    await showGameBoard()

    // Place new tile
    const newTile = placeRandomTile(state.board)
    if (newTile) {
      await sleep(NEW_TILE_DELAY_MS)
      await updateStaticBoard()
    }

    saveState()

    // Check game over
    if (isGameOver(state.board)) {
      state.screen = 'gameover'
      appendEventLog(`Game over! Score: ${state.score}`)
      await sleep(500)
      await showGameOverScreen()
    }
  } finally {
    state.animating = false
  }
}

// ---------------------------------------------------------------------------
// Event handlers by screen
// ---------------------------------------------------------------------------

function handleScrollUp(): void {
  // SDK "scrollUp" = physical scroll down → tiles move down/right
  if (state.screen === 'game' && !state.animating) {
    const dir: Direction = state.axis === 'vertical' ? 'down' : 'right'
    void executeSlide(dir)
    appendEventLog(`Slide: ${dir}`)
  }
}

function handleScrollDown(): void {
  // SDK "scrollDown" = physical scroll up → tiles move up/left
  if (state.screen === 'game' && !state.animating) {
    const dir: Direction = state.axis === 'vertical' ? 'up' : 'left'
    void executeSlide(dir)
    appendEventLog(`Slide: ${dir}`)
  }
}

function handleClick(): void {
  switch (state.screen) {
    case 'game':
      // Toggle axis
      state.axis = state.axis === 'vertical' ? 'horizontal' : 'vertical'
      void updateHeader()
      appendEventLog(`Axis: ${state.axis}`)
      break

    case 'gameover':
      restartGame()
      break
  }
}

function handleDoubleClick(): void {
  // no-op
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

export async function initApp(appBridge: EvenAppBridge): Promise<void> {
  setBridge(appBridge)

  setEventHandlers({
    onScrollUp: handleScrollUp,
    onScrollDown: handleScrollDown,
    onClick: handleClick,
    onDoubleClick: handleDoubleClick,
  })

  appBridge.onEvenHubEvent((event) => {
    onEvenHubEvent(event)
  })

  if (loadState()) {
    state.screen = 'game'
    state.animating = false
    void showGameBoard()
    appendEventLog('2048: restored saved game')
  } else {
    startGame()
    appendEventLog('2048: initialized, new game')
  }
}

export async function resendApp(): Promise<void> {
  state.animating = false
  state.startupRendered = false
  void showGameBoard()
  appendEventLog('2048: re-sent to glasses')
}

export async function resetApp(): Promise<void> {
  state.animating = false
  startGame()
  appendEventLog('2048: new game from UI button')
}

/** Development only: force game over */
export async function forceGameOverApp(): Promise<void> {
  state.animating = false
  state.screen = 'gameover'
  await showGameOverScreen()
  appendEventLog('2048: forced game over')
}

/** Development only: reset all data including records */
export async function resetDataApp(): Promise<void> {
  state.animating = false
  resetAllData()
  startGame()
  appendEventLog('2048: all data reset')
}
