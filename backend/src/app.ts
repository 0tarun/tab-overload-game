import 'dotenv/config'
import cors from 'cors'
import express, { type ErrorRequestHandler } from 'express'
import { highscoreRouter } from './routes/highscores'

const app = express()
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }
    callback(new Error('Origin is not allowed by CORS.'))
  },
}))
app.use(express.json({ limit: '10kb' }))

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})
app.use('/api/highscores', highscoreRouter)

const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  console.error('Unhandled API error:', error)
  response.status(500).json({ error: 'An unexpected server error occurred.' })
}
app.use(errorHandler)

export default app
