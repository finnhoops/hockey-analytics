import type {
  StatLeadersResponse,
  StandingsResponse,
  ClubStatsResponse,
  PlayerDetail,
  RosterResponse,
  RosterPlayerWithTeam,
  PlayoffBracket,
} from '@/types/nhl'
import { NHL_TEAMS } from '@/types/nhl'

const BASE = 'https://api-web.nhle.com/v1'

async function get<T>(path: string, revalidate = 3600): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'User-Agent': 'IceIQ/1.0' },
    next: { revalidate },
  })
  if (!res.ok) throw new Error(`NHL API error: ${res.status} for ${path}`)
  return res.json() as Promise<T>
}

export async function getAllSeasons(): Promise<number[]> {
  const seasons = await get<number[]>('/season', 86400)
  return [...seasons].reverse() // newest first
}

export async function getStatLeaders(
  season: number,
  limit = 10,
  gameType = 2
): Promise<StatLeadersResponse> {
  return get<StatLeadersResponse>(
    `/skater-stats-leaders/${season}/${gameType}?categories=points,goals,assists&limit=${limit}`
  )
}

export async function getStandings(date: string): Promise<StandingsResponse> {
  return get<StandingsResponse>(`/standings/${date}`)
}

export async function getClubStats(
  teamAbbrev: string,
  season: number,
  gameType = 2
): Promise<ClubStatsResponse> {
  return get<ClubStatsResponse>(`/club-stats/${teamAbbrev}/${season}/${gameType}`)
}

export async function getPlayerDetail(playerId: number): Promise<PlayerDetail> {
  return get<PlayerDetail>(`/player/${playerId}/landing`)
}

export async function getRoster(
  teamAbbrev: string,
  season: number
): Promise<RosterResponse> {
  return get<RosterResponse>(`/roster/${teamAbbrev}/${season}`)
}

export async function getPlayoffBracket(year: number): Promise<PlayoffBracket> {
  return get<PlayoffBracket>(`/playoff-bracket/${year}`)
}

export async function getTopSkaters(
  season: number,
  limit = 250,
  gameType = 2
): Promise<StatLeadersResponse> {
  return get<StatLeadersResponse>(
    `/skater-stats-leaders/${season}/${gameType}?categories=points,goals,assists&limit=${limit}`
  )
}

export function standingsDate(season: number): string {
  const year = Math.floor(season / 10000)
  const nextYear = year + 1
  return `${nextYear}-03-31`
}

// Fetch all current rosters from all 32 teams for the search pool
export async function getAllCurrentRosters(): Promise<RosterPlayerWithTeam[]> {
  const teamList = [...NHL_TEAMS]
  const results = await Promise.all(
    teamList.map(async (team) => {
      const roster = await get<RosterResponse>(`/roster/${team.abbrev}/current`, 86400).catch(() => null)
      if (!roster) return []
      const players = [...roster.forwards, ...roster.defensemen, ...roster.goalies]
      return players.map((p) => ({
        ...p,
        teamAbbrev: team.abbrev,
        teamName: team.name,
        teamLogo: `https://assets.nhle.com/logos/nhl/svg/${team.abbrev}_light.svg`,
      }))
    })
  )
  return results.flat()
}

const STATS_BASE = 'https://api.nhle.com/stats/rest/en'

async function getStats<T>(path: string): Promise<T> {
  const res = await fetch(`${STATS_BASE}${path}`, {
    headers: { 'User-Agent': 'IceIQ/1.0' },
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error(`NHL stats API error: ${res.status} for ${path}`)
  return res.json() as Promise<T>
}

export interface SkaterSummaryRow {
  playerId: number
  skaterFullName: string
  positionCode: string
  teamAbbrevs: string
  gamesPlayed: number
  goals: number
  assists: number
  points: number
  plusMinus: number
  penaltyMinutes: number
  ppGoals: number
  ppPoints: number
  shGoals: number
  shPoints: number
  gameWinningGoals: number
  otGoals: number
  shots: number
  shootingPct: number
  timeOnIcePerGame: number
  evGoals: number
  evPoints: number
  faceoffWinPct: number
}

export interface SkaterRealtimeRow {
  playerId: number
  hits: number
  blockedShots: number
  giveaways: number
  takeaways: number
}

export type SkaterFullStat = SkaterSummaryRow & Partial<SkaterRealtimeRow>

export async function getAllSkaterStats(
  season: number,
  gameType: number
): Promise<SkaterFullStat[]> {
  const expr = `seasonId=${season} and gameTypeId=${gameType}`
  const sortPoints = encodeURIComponent('[{"property":"points","direction":"DESC"}]')
  const sortHits = encodeURIComponent('[{"property":"hits","direction":"DESC"}]')
  const [summaryRes, realtimeRes] = await Promise.allSettled([
    getStats<{ data: SkaterSummaryRow[] }>(
      `/skater/summary?limit=1000&sort=${sortPoints}&cayenneExp=${encodeURIComponent(expr)}`
    ),
    getStats<{ data: SkaterRealtimeRow[] }>(
      `/skater/realtime?limit=1000&sort=${sortHits}&cayenneExp=${encodeURIComponent(expr)}`
    ),
  ])

  const summary = summaryRes.status === 'fulfilled' ? summaryRes.value.data : []
  const realtime = realtimeRes.status === 'fulfilled' ? realtimeRes.value.data : []

  const realtimeMap = new Map(realtime.map((r) => [r.playerId, r]))
  return summary.map((s) => ({ ...s, ...realtimeMap.get(s.playerId) }))
}

// Generate all season IDs between two years (inclusive, newest first)
export function seasonRange(fromYear: number, toYear: number): number[] {
  const seasons: number[] = []
  for (let y = toYear; y >= fromYear; y--) {
    seasons.push(y * 10000 + (y + 1))
  }
  return seasons
}

// Fetch standings for a specific team across a range of seasons for team profile history
export async function getTeamSeasonHistory(
  teamAbbrev: string,
  seasons: number[]
): Promise<{ season: number; standing: import('@/types/nhl').StandingTeam | null }[]> {
  return Promise.all(
    seasons.map(async (season) => {
      const date = standingsDate(season)
      const data = await get<StandingsResponse>(`/standings/${date}`, 86400).catch(() => null)
      const standing = data?.standings.find(
        (t) => t.teamAbbrev.default === teamAbbrev
      ) ?? null
      return { season, standing }
    })
  )
}
