import type { Board } from './state'
import type { TileMove } from './game'

// ---------------------------------------------------------------------------
// Full-width characters for uniform grid
// All cells use single full-width chars so alignment is consistent
// even with the proportional LVGL font on Even G2
// ---------------------------------------------------------------------------

const EMPTY = '\u3000' // 　(ideographic space / full-width space)
const PLACEHOLDER_CHAR = '\u2592' // ▒ (medium shade for new tile fade-in)

// Circled number mapping: tile value → single full-width character
const CIRCLED_NUMBERS: Record<number, string> = {
  2: '\u2460',     // ①
  4: '\u2461',     // ②
  8: '\u2462',     // ③
  16: '\u2463',    // ④
  32: '\u2464',    // ⑤
  64: '\u2465',    // ⑥
  128: '\u2466',   // ⑦
  256: '\u2467',   // ⑧
  512: '\u2468',   // ⑨
  1024: '\u2469',  // ⑩
  2048: '\u246A',  // ⑪
  4096: '\u246B',  // ⑫
  8192: '\u246C',  // ⑬
  16384: '\u246D',  // ⑭
  32768: '\u246E',  // ⑮
  65536: '\u246F',  // ⑯
  131072: '\u2470', // ⑰
}

function tileChar(value: number): string {
  if (value === 0) return EMPTY
  return CIRCLED_NUMBERS[value] ?? String(value)
}

// getCellWidth is kept for external reference but each cell is now 1 char
export function getCellWidth(_boardSize: number): number {
  return 1
}

// ---------------------------------------------------------------------------
// Render board: all full-width chars, no grid lines
// Each cell = 1 full-width character, separated by full-width space
// ---------------------------------------------------------------------------

export function renderFullBoard(board: Board, excludeCells?: Set<string>): string {
  const size = board.length
  const lines: string[] = []

  for (let r = 0; r < size; r++) {
    let row = ''
    for (let c = 0; c < size; c++) {
      if (c > 0) row += ' '
      const key = `${r},${c}`
      if (excludeCells && excludeCells.has(key)) {
        row += EMPTY
      } else {
        row += tileChar(board[r][c])
      }
    }
    lines.push(row)
  }

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Render moving tiles only (for the moving container overlay)
// Full-width spaces where there's no moving tile → transparent on display
// ---------------------------------------------------------------------------

export function renderMovingTiles(
  moves: TileMove[],
  boardSize: number,
  progress: number,
  totalSteps: number,
): string {
  const movingAt = new Map<string, string>()

  for (const move of moves) {
    if (move.merged) continue

    const frac = totalSteps > 0 ? Math.min(progress / totalSteps, 1) : 1
    const row = Math.round(move.fromRow + (move.toRow - move.fromRow) * frac)
    const col = Math.round(move.fromCol + (move.toCol - move.fromCol) * frac)
    const key = `${row},${col}`
    if (!movingAt.has(key)) {
      movingAt.set(key, tileChar(move.value))
    }
  }

  const lines: string[] = []
  for (let r = 0; r < boardSize; r++) {
    let row = ''
    for (let c = 0; c < boardSize; c++) {
      if (c > 0) row += ' '
      const key = `${r},${c}`
      row += movingAt.get(key) ?? EMPTY
    }
    lines.push(row)
  }

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Render board with new tile placeholder (▒) at specified cell
// ---------------------------------------------------------------------------

export function renderBoardWithPlaceholder(board: Board, row: number, col: number): string {
  const size = board.length
  const lines: string[] = []

  for (let r = 0; r < size; r++) {
    let rowStr = ''
    for (let c = 0; c < size; c++) {
      if (c > 0) rowStr += ' '
      if (r === row && c === col) {
        rowStr += PLACEHOLDER_CHAR
      } else {
        rowStr += tileChar(board[r][c])
      }
    }
    lines.push(rowStr)
  }

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// UI header text
// ---------------------------------------------------------------------------

export function renderHeader(score: number, axis: 'vertical' | 'horizontal', boardSize: number, extra?: string): string {
  const axisSymbol = axis === 'vertical' ? '\u2195' : '\u2194' // ↕ or ↔
  const text = `Score:${score}  ${axisSymbol}  ${boardSize}x${boardSize}`
  if (extra) return `${text}  ${extra}`
  return text
}

// ---------------------------------------------------------------------------
// Size select screen
// ---------------------------------------------------------------------------

export function renderSizeSelect(currentSize: number): string {
  const lines = [
    '      2048',
    '',
    `   Board: ${currentSize}x${currentSize}`,
    '',
    '   \u2191\u2193 Change size',
    '   Tap to start',
  ]
  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Game over screen
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Render tiles at specific positions (for pixel-offset animation)
// ---------------------------------------------------------------------------

export function renderMovingTilesAtPositions(
  tiles: { row: number; col: number; value: number }[],
  boardSize: number,
): string {
  const grid = new Map<string, string>()
  for (const t of tiles) {
    grid.set(`${t.row},${t.col}`, tileChar(t.value))
  }
  const lines: string[] = []
  for (let r = 0; r < boardSize; r++) {
    let row = ''
    for (let c = 0; c < boardSize; c++) {
      if (c > 0) row += ' '
      row += grid.get(`${r},${c}`) ?? EMPTY
    }
    lines.push(row)
  }
  return lines.join('\n')
}

export function renderGameOver(score: number): string {
  const lines = [
    '    GAME OVER',
    '',
    `    Score: ${score}`,
    '',
    '    Tap to continue',
  ]
  return lines.join('\n')
}
