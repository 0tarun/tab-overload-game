import { Router } from 'express'
import {
  createHighscore,
  getHighscores,
  isHighscoreSubmission,
  MissingDatabaseUrlError,
} from '../highscores'

export const highscoreRouter = Router()

highscoreRouter.get('/', async (_request, response, next) => {
  try {
    response.json(await getHighscores())
  } catch (error) {
    if (error instanceof MissingDatabaseUrlError) {
      response.status(503).json({ error: 'Leaderboard database is not configured. Set DATABASE_URL.' })
      return
    }
    next(error)
  }
})

highscoreRouter.post('/', async (request, response, next) => {
  if (!isHighscoreSubmission(request.body)) {
    response.status(400).json({
      error: 'Provide a playerName (1-24 characters), timeRemaining (0-120), and completed workProgress (100).',
    })
    return
  }

  try {
    response.status(201).json(await createHighscore(request.body))
  } catch (error) {
    if (error instanceof MissingDatabaseUrlError) {
      response.status(503).json({ error: 'Leaderboard database is not configured. Set DATABASE_URL.' })
      return
    }
    next(error)
  }
})
