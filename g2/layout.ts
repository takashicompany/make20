// Display dimensions (Even G2)
export const DISPLAY_WIDTH = 576
export const DISPLAY_HEIGHT = 288

// UI header area
export const HEADER_HEIGHT = 30

// Board area
export const BOARD_Y = HEADER_HEIGHT
export const BOARD_HEIGHT = DISPLAY_HEIGHT - HEADER_HEIGHT

// Default board size
export const DEFAULT_BOARD_SIZE = 4
export const MIN_BOARD_SIZE = 3
export const MAX_BOARD_SIZE = 6

// Animation timing
export const ANIM_FRAME_MS = 1         // ms between animation frames
export const ANIM_PIXELS_PER_FRAME = 14 // pixels to move per frame
export const NEW_TILE_DELAY_MS = 150

// Approximate cell dimensions in pixels (tune on real device)
// These depend on the LVGL font line height and character width
export const CELL_HEIGHT_PX = 30  // pixel height per text line (tune on device)
export const CELL_WIDTH_PX = 28   // pixel width per full-width char + separator

// Scroll cooldown
export const SCROLL_COOLDOWN_MS = 200
