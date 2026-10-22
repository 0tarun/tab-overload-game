import { randomUUID } from 'node:crypto'
import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

export interface HighscoreSubmission {
  playerName: string
  timeRemaining: number
  workProgress: number
}

export interface Highscore extends HighscoreSubmission {
  id: string
  createdAt: string
}

export class MissingDatabaseUrlError extends Error {
  constructor() {
    super('DATABASE_URL is not configured.')
    this.name = 'MissingDatabaseUrlError'
  }
}

export function isHighscoreSubmission(value: unknown): value is HighscoreSubmission {
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

let schemaReady: Promise<void> | undefined

function getDatabase() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new MissingDatabaseUrlError()
  return neon(connectionString)
}

async function ensureSchema(sql: NeonQueryFunction<false, false>) {
  if (!schemaReady) {
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS highscores (
        id TEXT PRIMARY KEY,
        player_name VARCHAR(24) NOT NULL,
        time_remaining INTEGER NOT NULL CHECK (time_remaining BETWEEN 0 AND 120),
        work_progress INTEGER NOT NULL CHECK (work_progress = 100),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `.then(() => undefined).catch((error: unknown) => {
      schemaReady = undefined
      throw error
    })
  }
  await schemaReady
}

export async function getHighscores(): Promise<Highscore[]> {
  const sql = getDatabase()
  await ensureSchema(sql)
  const rows = await sql`
    SELECT
      id,
      player_name AS "playerName",
      time_remaining AS "timeRemaining",
      work_progress AS "workProgress",
      created_at AS "createdAt"
    FROM highscores
    ORDER BY time_remaining DESC, created_at ASC, id ASC
    LIMIT 10
  `
  return rows.map((row) => ({
    id: String(row.id),
    playerName: String(row.playerName),
    timeRemaining: Number(row.timeRemaining),
    workProgress: Number(row.workProgress),
    createdAt: new Date(String(row.createdAt)).toISOString(),
  }))
}

export async function createHighscore(submission: HighscoreSubmission) {
  const sql = getDatabase()
  await ensureSchema(sql)
  const id = randomUUID()
  const [score] = await sql`
    INSERT INTO highscores (id, player_name, time_remaining, work_progress)
    VALUES (
      ${id},
      ${submission.playerName.trim()},
      ${submission.timeRemaining},
      ${submission.workProgress}
    )
    RETURNING
      id,
      player_name AS "playerName",
      time_remaining AS "timeRemaining",
      work_progress AS "workProgress",
      created_at AS "createdAt"
  `
  if (!score) throw new Error('The database did not return the inserted high score.')
  const [rankRow] = await sql`
    SELECT COUNT(*)::integer + 1 AS rank
    FROM highscores
    WHERE time_remaining > ${submission.timeRemaining}
      OR (
        time_remaining = ${submission.timeRemaining}
        AND (
          created_at < (SELECT created_at FROM highscores WHERE id = ${id})
          OR (
            created_at = (SELECT created_at FROM highscores WHERE id = ${id})
            AND id <= ${id}
          )
        )
      )
  `
  if (!rankRow) throw new Error('The database did not return the high-score rank.')
  return {
    id: String(score.id),
    playerName: String(score.playerName),
    timeRemaining: Number(score.timeRemaining),
    workProgress: Number(score.workProgress),
    createdAt: new Date(String(score.createdAt)).toISOString(),
    rank: Number(rankRow.rank),
  }
}
