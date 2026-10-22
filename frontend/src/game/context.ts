import { createContext } from 'react'
import type { Dispatch } from 'react'
import type { GameAction, GameState } from './types'

export interface GameContextValue {
  state: GameState
  dispatch: Dispatch<GameAction>
  progress: number
}

export const GameContext = createContext<GameContextValue | null>(null)
