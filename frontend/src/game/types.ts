export type GameStatus = 'ready' | 'playing' | 'won' | 'crashed' | 'timeout'
export type TabType = 'autoplay-video' | 'cookie-consent' | 'infinite-captcha'

export interface TabInstance {
  id: string
  type: TabType
  title: string
  x: number
  y: number
  minimized: boolean
  maximized: boolean
  muted: boolean
  zIndex: number
}

export interface GameState {
  status: GameStatus
  ram: number
  timeRemaining: number
  typedChars: number
  tabs: TabInstance[]
  focusCounter: number
  runId: number
  lastKeyAt: number
}

export type GameAction =
  | { type: 'START_RUN' }
  | { type: 'TICK' }
  | { type: 'SPAWN_TAB'; tabType?: TabType }
  | { type: 'TYPE_CHAR'; correct: boolean; timestamp: number }
  | { type: 'CLOSE_TAB'; id: string }
  | { type: 'MINIMIZE_TAB'; id: string }
  | { type: 'RESTORE_TAB'; id: string }
  | { type: 'TOGGLE_MAXIMIZE'; id: string }
  | { type: 'FOCUS_TAB'; id: string }
  | { type: 'MUTE_TAB'; id: string }
  | { type: 'RAM_PENALTY'; amount: number }
  | { type: 'RESET' }
