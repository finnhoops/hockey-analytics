import { getAllSkaterStats, getAllSeasons } from '@/lib/nhl-api'
import { formatSeason } from '@/types/nhl'
import PlayersClient from './PlayersClient'

const DEFAULT_SEASON = 20252026

interface Props {
  searchParams: Promise<{ season?: string; gameType?: string }>
}

export default async function PlayersPage({ searchParams }: Props) {
  const params = await searchParams
  const season = params.season ? parseInt(params.season) : DEFAULT_SEASON
  const validSeason = Number.isInteger(season) && season >= 19171918 ? season : DEFAULT_SEASON
  const isPlayoffs = params.gameType === 'playoffs'
  const apiGameType = isPlayoffs ? 3 : 2

  const [allSeasons, skaters] = await Promise.all([
    getAllSeasons(),
    getAllSkaterStats(validSeason, apiGameType).catch(() => null),
  ])

  const players = (skaters ?? []).map((s) => ({
    id: s.playerId,
    name: s.skaterFullName,
    teamAbbrev: s.teamAbbrevs,
    position: s.positionCode,
    gamesPlayed: s.gamesPlayed,
    goals: s.goals,
    assists: s.assists,
    points: s.points,
    plusMinus: s.plusMinus,
    pim: s.penaltyMinutes,
    ppGoals: s.ppGoals,
    ppPoints: s.ppPoints,
    shGoals: s.shGoals,
    gwGoals: s.gameWinningGoals,
    otGoals: s.otGoals,
    shots: s.shots,
    shootingPct: s.shootingPct,
    toi: s.timeOnIcePerGame,
    evGoals: s.evGoals,
    evPoints: s.evPoints,
    faceoffPct: s.faceoffWinPct,
    hits: s.hits ?? null,
    blocks: s.blockedShots ?? null,
    giveaways: s.giveaways ?? null,
    takeaways: s.takeaways ?? null,
  }))

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Players</h1>
        <p className="mt-1 text-muted-foreground">
          {formatSeason(validSeason)} {isPlayoffs ? 'playoffs' : 'regular season'} — skater stats
        </p>
      </div>
      <PlayersClient
        players={players}
        currentSeason={validSeason}
        allSeasons={allSeasons}
        isPlayoffs={isPlayoffs}
      />
    </div>
  )
}
