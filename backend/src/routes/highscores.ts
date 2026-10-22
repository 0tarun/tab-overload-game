import { randomUUID } from 'node:crypto'
import { Router } from 'express'

export interface HighscoreSubmission {
  playerName: string
  timeRemaining: number
  workProgress: number
}

export interface Highscore extends HighscoreSubmission {
  id: string
  createdAt: string
}

const highscores: Highscore[] = []
export const highscoreRouter = Router()

highscoreRouter.get('/', (_request, response) => {
  response.json([...highscores]
    .sort((first, second) => second.timeRemaining - first.timeRemaining
      || first.createdAt.localeCompare(second.createdAt))
    .slice(0, 10))
})

highscoreRouter.post('/', (request, response) => {
  const body: unknown = request.body
  if (!isHighscoreSubmission(body)) {
    response.status(400).json({
      error: 'Provide a playerName (1-24 characters), timeRemaining (0-120), and completed workProgress (100).',
    })
    return
  }

  const score: Highscore = {
    id: randomUUID(),
    playerName: body.playerName.trim(),
    timeRemaining: body.timeRemaining,
    workProgress: body.workProgress,
    createdAt: new Date().toISOString(),
  }
  highscores.push(score)
  const rank = [...highscores]
    .sort((first, second) => second.timeRemaining - first.timeRemaining
      || first.createdAt.localeCompare(second.createdAt))
    .findIndex((entry) => entry.id === score.id) + 1

  response.status(201).json({ ...score, rank })
})

function isHighscoreSubmission(value: unknown): value is HighscoreSubmission {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.playerName === 'string'
    && candidate.playerName.trim().length > 0
    && candidate.playerName.trim().length <= 24
    && typeof candidate.timeRemaining === 'number'
    && Number.isInteger(candidate.timeRemaining)
    && candidate.timeRemaining >= 0
    && candidate.timeRemaining <= 120
    && candidate.workProgress === 100
}
