import { NextRequest } from 'next/server'

interface SkaterRow {
  playerId: number
  skaterFullName: string
  positionCode: string
  points: number
  gamesPlayed: number
}

interface GoalieRow {
  playerId: number
  goalieFullName: string
  gamesStarted: number
}

interface StatsApiResponse<T> {
  data: T[]
  total: number
}

export interface PlayerSearchResult {
  playerId: number
  name: string
  position: string
}

const STATS_BASE = 'https://api.nhle.com/stats/rest/en'

async function fetchStats<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${STATS_BASE}${path}`, {
      headers: { 'User-Agent': 'IceIQ/1.0' },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data: StatsApiResponse<T> = await res.json()
    return data.data ?? []
  } catch {
    return []
  }
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? ''
  const trimmed = q.trim()
  if (trimmed.length < 2) {
    return Response.json([])
  }

  const safe = trimmed.replace(/'/g, "''")

  const [skaterRows, goalieRows] = await Promise.all([
    fetchStats<SkaterRow>(
      `/skater/summary?limit=50&start=0&sort=points&cayenneExp=skaterFullName%20likeIgnoreCase%20'%25${encodeURIComponent(safe)}%25'`
    ),
    fetchStats<GoalieRow>(
      `/goalie/summary?limit=20&start=0&sort=wins&cayenneExp=goalieFullName%20likeIgnoreCase%20'%25${encodeURIComponent(safe)}%25'`
    ),
  ])

  // Deduplicate by playerId, keep highest-GP entry per player
  const byId = new Map<number, PlayerSearchResult>()

  for (const row of skaterRows) {
    if (!byId.has(row.playerId)) {
      byId.set(row.playerId, {
        playerId: row.playerId,
        name: row.skaterFullName,
        position: row.positionCode,
      })
    }
  }

  for (const row of goalieRows) {
    if (!byId.has(row.playerId)) {
      byId.set(row.playerId, {
        playerId: row.playerId,
        name: row.goalieFullName,
        position: 'G',
      })
    }
  }

  const results = Array.from(byId.values()).slice(0, 20)
  return Response.json(results)
}
