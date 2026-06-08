import Image from 'next/image'
import { getStandings, standingsDate, getAllSeasons } from '@/lib/nhl-api'
import { formatSeason } from '@/types/nhl'
import TeamModal from './TeamModal'
import TeamsSeasonSelect from './TeamsSeasonSelect'

const DEFAULT_SEASON = 20252026

interface Props {
  searchParams: Promise<{ season?: string; team?: string; gameType?: string }>
}

export default async function TeamsPage({ searchParams }: Props) {
  const params = await searchParams
  const season = params.season ? parseInt(params.season) : DEFAULT_SEASON
  const validSeason = Number.isInteger(season) && season >= 19171918 ? season : DEFAULT_SEASON
  const selectedTeam = params.team ?? null
  const isPlayoffs = params.gameType === 'playoffs'

  const [allSeasons, standings] = await Promise.all([
    getAllSeasons(),
    getStandings(standingsDate(validSeason)).catch(() => null),
  ])

  const teams = standings
    ? standings.standings.sort((a, b) =>
        a.teamName.default.localeCompare(b.teamName.default)
      )
    : []

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="mt-1 text-muted-foreground">
            {formatSeason(validSeason)} regular season standings
          </p>
        </div>
        <TeamsSeasonSelect
          currentSeason={validSeason}
          allSeasons={allSeasons}
          isPlayoffs={isPlayoffs}
        />
      </div>

      {teams.length === 0 ? (
        <p className="text-sm text-muted-foreground">No team data available for this season.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {teams.map((team) => {
            const abbrev = team.teamAbbrev.default
            const ptPct = (team.pointPctg * 100).toFixed(1)
            const gd = team.goalDifferential
            return (
              <a
                key={abbrev}
                href={`/teams?season=${validSeason}&team=${abbrev}&gameType=${isPlayoffs ? 'playoffs' : 'regular'}`}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:bg-secondary/50 transition-all cursor-pointer"
              >
                <div className="relative h-14 w-14 shrink-0">
                  <Image
                    src={team.teamLogo}
                    alt={abbrev}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{team.teamCommonName.default}</p>
                  <p className="text-xs text-muted-foreground">{team.divisionName}</p>
                  <div className="mt-1 flex items-center gap-3 text-sm">
                    <span className="font-bold text-primary">{team.points} pts</span>
                    <span className="text-muted-foreground">
                      {team.wins}-{team.losses}-{team.otLosses}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">GD</p>
                  <p className={`font-bold ${gd >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {gd > 0 ? '+' : ''}{gd}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{ptPct}%</p>
                </div>
              </a>
            )
          })}
        </div>
      )}

      {selectedTeam && (
        <TeamModal
          teamAbbrev={selectedTeam}
          season={validSeason}
          gameType={isPlayoffs ? 3 : 2}
          teamName={
            teams.find((t) => t.teamAbbrev.default === selectedTeam)?.teamName.default ??
            selectedTeam
          }
        />
      )}
    </div>
  )
}
