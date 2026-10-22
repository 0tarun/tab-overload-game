import { useCallback, useEffect, useState } from 'react'

export interface Highscore {
  id: string
  playerName: string
  timeRemaining: number
  workProgress: number
  createdAt: string
}

interface ScoreInput {
  playerName: string
  timeRemaining: number
  workProgress: number
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export function useHighscores() {
  const [scores, setScores] = useState<Highscore[]>([])
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/highscores`)
      if (!response.ok) throw new Error(`Leaderboard request failed (${response.status}).`)
      setScores(await response.json() as Highscore[])
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load leaderboard.')
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const submitScore = useCallback(async (score: ScoreInput): Promise<Highscore & { rank: number }> => {
    const response = await fetch(`${API_URL}/api/highscores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(score),
    })
    if (!response.ok) {
      const result = await response.json().catch(() => null)
      throw new Error(result?.error || `Score submission failed (${response.status}).`)
    }
    return await response.json() as Highscore & { rank: number }
  }, [])

  return { scores, error, submitScore, refresh }
}
