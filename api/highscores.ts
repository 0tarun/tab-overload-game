import {
  createHighscore,
  getHighscores,
  isHighscoreSubmission,
  MissingDatabaseUrlError,
} from '../backend/src/highscores'

interface ApiRequest {
  method?: string
  body?: unknown
}

interface ApiResponse {
  status(code: number): ApiResponse
  json(value: unknown): void
}

export default async function highscoresHandler(request: ApiRequest, response: ApiResponse) {
  try {
    if (request.method === 'GET') {
      response.status(200).json(await getHighscores())
      return
    }

    if (request.method !== 'POST') {
      response.status(405).json({ error: 'Method not allowed.' })
      return
    }

    if (!isHighscoreSubmission(request.body)) {
      response.status(400).json({
        error: 'Provide a playerName (1-24 characters), timeRemaining (0-120), and completed workProgress (100).',
      })
      return
    }

    response.status(201).json(await createHighscore(request.body))
  } catch (error) {
    if (error instanceof MissingDatabaseUrlError) {
      response.status(503).json({ error: 'Leaderboard database is not configured. Set DATABASE_URL in Vercel.' })
      return
    }
    console.error('High-score API error:', error)
    response.status(500).json({ error: 'Could not access the leaderboard.' })
  }
}
