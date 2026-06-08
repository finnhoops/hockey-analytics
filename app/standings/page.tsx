import Image from 'next/image'
import Link from 'next/link'
import { getStandings, standingsDate, getAllSeasons } from '@/lib/nhl-api'
import { formatSeason, type StandingTeam } from '@/types/nhl'
import StandingsToggle from './StandingsToggle'

const DEFAULT_SEASON = 20252026

interface Props {
  searchParams: Promise<{ season?: string; view?: string }>
}

function StandingsTable({
  teams,
  showWC = false,
}: {
  teams: StandingTeam[]
  showWC?: boolean
}) {
  const thClass = 'px-3 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right first:text-left'
  const tdClass = 'px-3 py-2.5 text-sm text-right first:text-left'

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full">
        <thead className="border-b border-border bg-secondary/50">
          <tr>
            <th className={thClass}>#</th>
            <th className={`${thClass} min-w-[200px]`}>Team</th>
            <th className={thClass}>GP</th>
            <th className={thClass}>W</th>
            <th className={thClass}>L</th>
            <th className={thClass}>OTL</th>
            <th className={thClass}>PTS</th>
            <th className={thClass}>P%</th>
            <th className={thClass}>RW</th>
            <th className={thClass}>GF</th>
            <th className={thClass}>GA</th>
            <th className={thClass}>GD</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {teams.map((team, i) => {
            const gd = team.goalDifferential
            const isPlayoffLine = !showWC && i === 2
            return (
              <>
                {isPlayoffLine && (
                  <tr key="div-line">
                    <td colSpan={12}>
                      <div className="border-t-2 border-primary/60" />
                    </td>
                  </tr>
                )}
                <tr key={team.teamAbbrev.default} className="hover:bg-secondary/30 transition-colors">
                  <td className={`${tdClass} text-muted-foreground`}>{i + 1}</td>
                  <td className={tdClass}>
                    <Link
                      href={`/team/${team.teamAbbrev.default}`}
                      className="flex items-center gap-2.5 hover:text-primary transition-colors"
                    >
                      <div className="relative h-7 w-7 shrink-0">
                        <Image
                          src={team.teamLogo}
                          alt={team.teamAbbrev.default}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <div>
                        <span className="font-medium">{team.teamCommonName.default}</span>
                        {team.clinchIndicator && (
                          <span className="ml-1.5 text-xs text-primary font-bold">
                            {team.clinchIndicator}
                          </span>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className={`${tdClass} text-muted-foreground`}>{team.gamesPlayed}</td>
                  <td className={tdClass}>{team.wins}</td>
                  <td className={tdClass}>{team.losses}</td>
                  <td className={tdClass}>{team.otLosses}</td>
                  <td className={`${tdClass} font-bold text-primary`}>{team.points}</td>
                  <td className={`${tdClass} text-muted-foreground`}>
                    {(team.pointPctg * 100).toFixed(1)}%
                  </td>
                  <td className={`${tdClass} text-muted-foreground`}>{team.regulationWins}</td>
                  <td className={`${tdClass} text-muted-foreground`}>{team.goalFor}</td>
                  <td className={`${tdClass} text-muted-foreground`}>{team.goalAgainst}</td>
                  <td className={tdClass}>
                    <span className={gd >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {gd > 0 ? '+' : ''}{gd}
                    </span>
                  </td>
                </tr>
              </>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default async function StandingsPage({ searchParams }: Props) {
  const params = await searchParams
  const season = params.season ? parseInt(params.season) : DEFAULT_SEASON
  const validSeason = Number.isInteger(season) && season >= 19171918 ? season : DEFAULT_SEASON
  const view = (params.view ?? 'division') as 'division' | 'conference' | 'wildcard'

  const [allSeasons, data] = await Promise.all([
    getAllSeasons(),
    getStandings(standingsDate(validSeason)).catch(() => null),
  ])

  const teams = data?.standings ?? []

  let sections: { title: string; teams: StandingTeam[] }[] = []

  if (view === 'division') {
    const divisionNames = [...new Set(teams.map((t) => t.divisionName))].sort()
    sections = divisionNames.map((div) => ({
      title: div,
      teams: teams
        .filter((t) => t.divisionName === div)
        .sort((a, b) => a.divisionSequence - b.divisionSequence),
    }))
  } else if (view === 'conference') {
    const conferenceNames = [...new Set(teams.map((t) => t.conferenceName))]
    sections = conferenceNames.map((conf) => ({
      title: conf,
      teams: teams
        .filter((t) => t.conferenceName === conf)
        .sort((a, b) => a.conferenceSequence - b.conferenceSequence),
    }))
  } else {
    const conferenceNames = [...new Set(teams.map((t) => t.conferenceName))]
    sections = conferenceNames.map((conf) => ({
      title: `${conf} Wild Card`,
      teams: teams
        .filter((t) => t.conferenceName === conf)
        .sort((a, b) => a.wildcardSequence - b.wildcardSequence),
    }))
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Standings</h1>
        <p className="mt-1 text-muted-foreground">{formatSeason(validSeason)} regular season</p>
      </div>

      <StandingsToggle
        currentView={view}
        currentSeason={validSeason}
        allSeasons={allSeasons}
      />

      {teams.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-3">
          <p className="text-muted-foreground text-sm">
            Standings data is not available via the NHL API for this season.
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <a
              href={`https://www.hockey-reference.com/leagues/NHL_${validSeason % 10000}.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View on Hockey Reference →
            </a>
            <a
              href={`https://en.wikipedia.org/wiki/${Math.floor(validSeason / 10000)}%E2%80%93${String(validSeason % 10000).slice(-2)}_NHL_season`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Wikipedia season page →
            </a>
          </div>
        </div>
      ) : (
        <div className={view === 'division' ? 'grid gap-6 lg:grid-cols-2' : 'space-y-6'}>
          {sections.map(({ title, teams: sectionTeams }) => (
            <div key={title}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {title}
              </h2>
              <StandingsTable teams={sectionTeams} showWC={view === 'wildcard'} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
