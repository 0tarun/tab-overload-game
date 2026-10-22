import { useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { ROUND_SECONDS, TAB_TITLES, WORK_PARAGRAPH } from './content'
import type { GameAction, GameState, TabInstance, TabType } from './types'
import { GameContext } from './context'

const initialState: GameState = {
  status: 'ready',
  ram: 12,
  timeRemaining: ROUND_SECONDS,
  typedChars: 0,
  tabs: [],
  focusCounter: 10,
  runId: 0,
  lastKeyAt: 0,
}

const randomTabType = (): TabType => {
  const roll = Math.random()
  return roll < 1 / 3 ? 'autoplay-video' : roll < 2 / 3 ? 'cookie-consent' : 'infinite-captcha'
}

function createTab(state: GameState, type: TabType): TabInstance {
  const width = type === 'infinite-captcha' ? 370 : 350
  const titleOptions = TAB_TITLES[type]
  const workspace = document.querySelector<HTMLElement>('.workspace')
  const maxX = Math.max(16, (workspace?.clientWidth ?? window.innerWidth) - width - 16)
  const maxY = Math.max(70, (workspace?.clientHeight ?? window.innerHeight) - 370)
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    title: titleOptions[Math.floor(Math.random() * titleOptions.length)],
    x: 16 + Math.floor(Math.random() * Math.max(1, maxX - 16)),
    y: 16 + Math.floor(Math.random() * Math.max(1, maxY - 16)),
    minimized: false,
    maximized: false,
    muted: false,
    zIndex: state.focusCounter + 1,
  }
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_RUN':
      return { ...initialState, status: 'playing', runId: state.runId + 1 }
    case 'TICK': {
      if (state.status !== 'playing') return state
      const timeRemaining = Math.max(0, state.timeRemaining - 1)
      const ramDrain = state.tabs.reduce((total, tab) => {
        const ambient = tab.minimized ? 0.075 : 0.15
        return total + ambient + (tab.type === 'autoplay-video' && !tab.muted && !tab.minimized ? 2 : 0)
      }, 0.12)
      const ram = Math.min(100, state.ram + ramDrain)
      if (ram >= 100) return { ...state, ram: 100, timeRemaining, status: 'crashed' }
      if (timeRemaining <= 0) return { ...state, timeRemaining: 0, status: 'timeout' }
      return { ...state, ram, timeRemaining }
    }
    case 'SPAWN_TAB':
      if (state.status !== 'playing') return state
      {
        const tab = createTab(state, action.tabType ?? randomTabType())
        return { ...state, tabs: [...state.tabs, tab], focusCounter: tab.zIndex }
      }
    case 'TYPE_CHAR': {
      if (state.status !== 'playing') return state
      if (state.ram >= 70 && action.timestamp - state.lastKeyAt < 130) return state
      if (!action.correct) {
        const ram = Math.min(100, state.ram + 0.5)
        return { ...state, ram, lastKeyAt: action.timestamp, status: ram >= 100 ? 'crashed' : state.status }
      }
      const typedChars = state.typedChars + 1
      return {
        ...state,
        typedChars,
        lastKeyAt: action.timestamp,
        status: typedChars >= WORK_PARAGRAPH.length ? 'won' : state.status,
      }
    }
    case 'CLOSE_TAB':
      return { ...state, tabs: state.tabs.filter((tab) => tab.id !== action.id) }
    case 'MINIMIZE_TAB':
      return { ...state, tabs: state.tabs.map((tab) => tab.id === action.id ? { ...tab, minimized: true, maximized: false } : tab) }
    case 'RESTORE_TAB':
    case 'FOCUS_TAB': {
      const focusCounter = state.focusCounter + 1
      return {
        ...state,
        focusCounter,
        tabs: state.tabs.map((tab) => tab.id === action.id
          ? { ...tab, minimized: false, zIndex: focusCounter }
          : tab),
      }
    }
    case 'TOGGLE_MAXIMIZE': {
      const focusCounter = state.focusCounter + 1
      return {
        ...state,
        focusCounter,
        tabs: state.tabs.map((tab) => tab.id === action.id
          ? { ...tab, minimized: false, maximized: !tab.maximized, zIndex: focusCounter }
          : tab),
      }
    }
    case 'MUTE_TAB':
      return { ...state, tabs: state.tabs.map((tab) => tab.id === action.id ? { ...tab, muted: !tab.muted } : tab) }
    case 'RAM_PENALTY': {
      const ram = Math.min(100, state.ram + action.amount)
      return { ...state, ram, status: ram >= 100 && state.status === 'playing' ? 'crashed' : state.status }
    }
    case 'RESET':
      return { ...initialState, runId: state.runId + 1 }
    default:
      return state
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (state.status !== 'playing') return
    const timer = window.setInterval(() => dispatch({ type: 'TICK' }), 1000)
    return () => window.clearInterval(timer)
  }, [state.status, state.runId])

  useEffect(() => {
    if (state.status !== 'playing') return
    const spawner = window.setInterval(() => dispatch({ type: 'SPAWN_TAB' }), 4000)
    return () => window.clearInterval(spawner)
  }, [state.status, state.runId])

  const value = useMemo(() => ({
    state,
    dispatch,
    progress: Math.min(100, Math.round((state.typedChars / WORK_PARAGRAPH.length) * 100)),
  }), [state])

  return (
    <GameContext.Provider value={value}>{children}</GameContext.Provider>
  )
}
