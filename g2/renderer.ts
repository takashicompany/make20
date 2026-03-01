import {
  CreateStartUpPageContainer,
  RebuildPageContainer,
  TextContainerProperty,
  TextContainerUpgrade,
} from '@evenrealities/even_hub_sdk'
import { appendEventLog } from '../_shared/log'
import {
  DISPLAY_WIDTH,
  DISPLAY_HEIGHT,
  HEADER_HEIGHT,
  BOARD_Y,
  BOARD_HEIGHT,
} from './layout'
import { state, bridge } from './state'
import {
  renderFullBoard,
  renderMovingTiles,
  renderBoardWithPlaceholder,
  renderHeader,
  renderSizeSelect,
  renderGameOver,
} from './board-text'
import type { TileMove } from './game'

// ---------------------------------------------------------------------------
// Rebuild helper
// ---------------------------------------------------------------------------

async function rebuildPage(config: {
  containerTotalNum: number
  textObject?: TextContainerProperty[]
}): Promise<void> {
  if (!bridge) return
  if (!state.startupRendered) {
    await bridge.createStartUpPageContainer(new CreateStartUpPageContainer(config))
    state.startupRendered = true
    return
  }
  await bridge.rebuildPageContainer(new RebuildPageContainer(config))
}

// ---------------------------------------------------------------------------
// Invisible event-capture container (snake demo pattern)
// Content is a single space — firmware has nothing to scroll
// ---------------------------------------------------------------------------

function evtContainer(): TextContainerProperty {
  return new TextContainerProperty({
    containerID: 1,
    containerName: 'evt',
    content: ' ',
    xPosition: 0,
    yPosition: 0,
    width: DISPLAY_WIDTH,
    height: DISPLAY_HEIGHT,
    isEventCapture: 1,
    paddingLength: 0,
  })
}

// ---------------------------------------------------------------------------
// Screen: Size selection (2 containers: evt + content)
// ---------------------------------------------------------------------------

export async function showSizeSelect(): Promise<void> {
  const content = renderSizeSelect(state.boardSize)
  await rebuildPage({
    containerTotalNum: 2,
    textObject: [
      evtContainer(),
      new TextContainerProperty({
        containerID: 2,
        containerName: 'screen',
        content,
        xPosition: 0,
        yPosition: 0,
        width: DISPLAY_WIDTH,
        height: DISPLAY_HEIGHT,
        isEventCapture: 0,
        paddingLength: 8,
      }),
    ],
  })
  appendEventLog(`Screen: size-select (${state.boardSize}x${state.boardSize})`)
}

// ---------------------------------------------------------------------------
// Screen: Game board (4 containers: evt + header + static + moving)
// ---------------------------------------------------------------------------

export async function showGameBoard(): Promise<void> {
  const headerText = renderHeader(state.score, state.axis, state.boardSize)
  const boardText = renderFullBoard(state.board)

  await rebuildPage({
    containerTotalNum: 4,
    textObject: [
      evtContainer(),
      new TextContainerProperty({
        containerID: 2,
        containerName: 'header',
        content: headerText,
        xPosition: 0,
        yPosition: 0,
        width: DISPLAY_WIDTH,
        height: HEADER_HEIGHT,
        isEventCapture: 0,
        paddingLength: 4,
      }),
      new TextContainerProperty({
        containerID: 3,
        containerName: 'static',
        content: boardText,
        xPosition: 0,
        yPosition: BOARD_Y,
        width: DISPLAY_WIDTH,
        height: BOARD_HEIGHT,
        isEventCapture: 0,
        paddingLength: 4,
      }),
      new TextContainerProperty({
        containerID: 4,
        containerName: 'moving',
        content: '',
        xPosition: 0,
        yPosition: BOARD_Y,
        width: DISPLAY_WIDTH,
        height: BOARD_HEIGHT,
        isEventCapture: 0,
        paddingLength: 4,
      }),
    ],
  })
  appendEventLog('Screen: game board')
}

// ---------------------------------------------------------------------------
// Screen: Game over (2 containers: evt + content)
// ---------------------------------------------------------------------------

export async function showGameOverScreen(): Promise<void> {
  const content = renderGameOver(state.score)
  await rebuildPage({
    containerTotalNum: 2,
    textObject: [
      evtContainer(),
      new TextContainerProperty({
        containerID: 2,
        containerName: 'screen',
        content,
        xPosition: 0,
        yPosition: 0,
        width: DISPLAY_WIDTH,
        height: DISPLAY_HEIGHT,
        isEventCapture: 0,
        paddingLength: 8,
      }),
    ],
  })
  appendEventLog(`Screen: game over (score=${state.score})`)
}

// ---------------------------------------------------------------------------
// Rebuild game board with moving container at pixel offset (for animation)
// ---------------------------------------------------------------------------

export async function rebuildGameBoardWithOffset(
  headerText: string,
  staticText: string,
  movingText: string,
  offsetX: number,
  offsetY: number,
): Promise<void> {
  await rebuildPage({
    containerTotalNum: 4,
    textObject: [
      evtContainer(),
      new TextContainerProperty({
        containerID: 2,
        containerName: 'header',
        content: headerText,
        xPosition: 0,
        yPosition: 0,
        width: DISPLAY_WIDTH,
        height: HEADER_HEIGHT,
        isEventCapture: 0,
        paddingLength: 4,
      }),
      new TextContainerProperty({
        containerID: 3,
        containerName: 'static',
        content: staticText,
        xPosition: 0,
        yPosition: BOARD_Y,
        width: DISPLAY_WIDTH,
        height: BOARD_HEIGHT,
        isEventCapture: 0,
        paddingLength: 4,
      }),
      new TextContainerProperty({
        containerID: 4,
        containerName: 'moving',
        content: movingText,
        xPosition: offsetX,
        yPosition: BOARD_Y + offsetY,
        width: DISPLAY_WIDTH,
        height: BOARD_HEIGHT,
        isEventCapture: 0,
        paddingLength: 4,
      }),
    ],
  })
}

// ---------------------------------------------------------------------------
// Update: header
// ---------------------------------------------------------------------------

export async function updateHeader(): Promise<void> {
  if (!bridge) return
  const headerText = renderHeader(state.score, state.axis, state.boardSize)
  await bridge.textContainerUpgrade(
    new TextContainerUpgrade({
      containerID: 2,
      containerName: 'header',
      contentOffset: 0,
      contentLength: 200,
      content: headerText,
    }),
  )
}

// ---------------------------------------------------------------------------
// Update: static board
// ---------------------------------------------------------------------------

export async function updateStaticBoard(excludeCells?: Set<string>): Promise<void> {
  if (!bridge) return
  const boardText = renderFullBoard(state.board, excludeCells)
  await bridge.textContainerUpgrade(
    new TextContainerUpgrade({
      containerID: 3,
      containerName: 'static',
      contentOffset: 0,
      contentLength: 2000,
      content: boardText,
    }),
  )
}

// ---------------------------------------------------------------------------
// Update: moving tiles
// ---------------------------------------------------------------------------

export async function updateMovingTiles(
  moves: TileMove[],
  progress: number,
  totalSteps: number,
): Promise<void> {
  if (!bridge) return
  const text = renderMovingTiles(moves, state.boardSize, progress, totalSteps)
  await bridge.textContainerUpgrade(
    new TextContainerUpgrade({
      containerID: 4,
      containerName: 'moving',
      contentOffset: 0,
      contentLength: 2000,
      content: text,
    }),
  )
}

// ---------------------------------------------------------------------------
// Clear moving tiles
// ---------------------------------------------------------------------------

export async function clearMovingTiles(): Promise<void> {
  if (!bridge) return
  await bridge.textContainerUpgrade(
    new TextContainerUpgrade({
      containerID: 4,
      containerName: 'moving',
      contentOffset: 0,
      contentLength: 2000,
      content: '',
    }),
  )
}

// ---------------------------------------------------------------------------
// New tile placeholder (▒) then reveal
// ---------------------------------------------------------------------------

export async function showNewTileFade(row: number, col: number): Promise<void> {
  if (!bridge) return
  const text = renderBoardWithPlaceholder(state.board, row, col)
  await bridge.textContainerUpgrade(
    new TextContainerUpgrade({
      containerID: 4,
      containerName: 'moving',
      contentOffset: 0,
      contentLength: 2000,
      content: text,
    }),
  )
}

export async function revealNewTile(): Promise<void> {
  await clearMovingTiles()
  await updateStaticBoard()
}

// ---------------------------------------------------------------------------
// Update size select screen
// ---------------------------------------------------------------------------

export async function updateSizeSelect(): Promise<void> {
  if (!bridge) return
  const content = renderSizeSelect(state.boardSize)
  await bridge.textContainerUpgrade(
    new TextContainerUpgrade({
      containerID: 2,
      containerName: 'screen',
      contentOffset: 0,
      contentLength: 2000,
      content,
    }),
  )
}
