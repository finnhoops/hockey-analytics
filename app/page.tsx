import Image from 'next/image'
import Link from 'next/link'
import {
  getStatLeaders,
  getStandings,
  getPlayoffBracket,
  getAllSeasons,
  standingsDate,
} from '@/lib/nhl-api'
import { formatSeason, type StatLeader, type StandingTeam } from '@/types/nhl'
import DashboardFilters from '@/components/DashboardFilters'
import PlayoffBracketView from '@/components/PlayoffBracket'
import NewsSection from '@/components/NewsSection'

const DEFAULT_SEASON = 20252026

interface Props {
  searchParams: Promise<{ season?: string; gameType?: string }>
}

function LeaderCard({ player, stat }: { player: StatLeader; stat: string }) {
  return (
    <Link href={`/player/${player.id}`} className="flex items-center gap-3 rounded-lg bg-secondary p-3 hover:bg-secondary/70 hover:border-primary/30 border border-transparent transition-all">
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
        <Image
          src={player.headshot}
          alt={`${player.firstName.default} ${player.lastName.default}`}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-sm">
          {player.firstName.default} {player.lastName.default}
        </p>
        <p className="text-xs text-muted-foreground">{player.teamAbbrev} · {player.position}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xl font-bold text-primary">{player.value}</p>
        <p className="text-xs text-muted-foreground uppercase">{stat}</p>
      </div>
    </Link>
  )
}

function StandingsRow({ team, rank }: { team: StandingTeam; rank: number }) {
  const pct = (team.pointPctg * 100).toFixed(1)
  return (
    <Link href={`/team/${team.teamAbbrev.default}`} className="flex items-center gap-3 py-2 hover:text-primary transition-colors">
      <span className="w-5 text-sm text-muted-foreground text-right">{rank}</span>
      <div className="relative h-7 w-7 shrink-0">
        <Image
          src={team.teamLogo}
          alt={team.teamAbbrev.default}
          fill
          className="object-contain"
          unoptimized
        />
      </div>
      <span className="flex-1 text-sm font-medium truncate">{team.teamCommonName.default}</span>
      <span className="text-sm font-bold text-primary">{team.points}</span>
      <span className="text-xs text-muted-foreground w-12 text-right hidden sm:block">
        {team.wins}-{team.losses}-{team.otLosses}
      </span>
      <span className="text-xs text-muted-foreground w-10 text-right hidden md:block">{pct}%</span>
    </Link>
  )
}

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams
  const season = params.season ? parseInt(params.season) : DEFAULT_SEASON
  const validSeason = Number.isInteger(season) && season >= 19171918 ? season : DEFAULT_SEASON
  const isPlayoffs = params.gameType === 'playoffs'
  const apiGameType = isPlayoffs ? 3 : 2
  const bracketYear = validSeason % 10000 // e.g. 20252026 → 2026

  const [allSeasons, leaders] = await Promise.all([
    getAllSeasons(),
    getStatLeaders(validSeason, 3, apiGameType).catch(() => null),
  ])

  const bracket = isPlayoffs
    ? await getPlayoffBracket(bracketYear).catch(() => null)
    : null

  const standings = !isPlayoffs
    ? await getStandings(standingsDate(validSeason)).catch(() => null)
    : null

  const byDivision = standings
    ? [...new Set(standings.standings.map((t) => t.divisionName))].sort().map((div) => ({
        name: div,
        teams: standings.standings
          .filter((t) => t.divisionName === div)
          .sort((a, b) => a.divisionSequence - b.divisionSequence)
          .slice(0, 3),
      }))
    : []

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {formatSeason(validSeason)} {isPlayoffs ? 'Playoffs' : 'Season'}
        </h1>
        <p className="mt-1 text-muted-foreground">
          NHL stats, standings, and analysis
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <DashboardFilters
          allSeasons={allSeasons}
          currentSeason={validSeason}
          gameType={isPlayoffs ? 'playoffs' : 'regular'}
        />
      </div>

      {/* Stat Leaders */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isPlayoffs ? 'Playoff' : 'Regular Season'} Stat Leaders
          </h2>
          <Link href="/players" className="text-sm text-primary hover:underline">
            View all players →
          </Link>
        </div>
        {leaders ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">Points</h3>
              <div className="space-y-2">
                {leaders.points.map((p) => (
                  <LeaderCard key={p.id} player={p} stat="PTS" />
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">Goals</h3>
              <div className="space-y-2">
                {leaders.goals.map((p) => (
                  <LeaderCard key={p.id} player={p} stat="G" />
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">Assists</h3>
              <div className="space-y-2">
                {leaders.assists.map((p) => (
                  <LeaderCard key={p.id} player={p} stat="A" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No stat leader data available for this season.</p>
        )}
      </section>

      {/* Playoff Bracket */}
      {isPlayoffs && (
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Playoff Bracket</h2>
          </div>
          {bracket ? (
            <PlayoffBracketView bracket={bracket} />
          ) : (
            <p className="text-sm text-muted-foreground">No bracket data available for this season.</p>
          )}
        </section>
      )}

      {/* Standings Snapshot (regular season only) */}
      {!isPlayoffs && (
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Standings Snapshot</h2>
            <Link href="/standings" className="text-sm text-primary hover:underline">
              Full standings →
            </Link>
          </div>
          {byDivision.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {byDivision.map(({ name, teams }) => (
                <div key={name} className="rounded-xl border border-border bg-card p-4">
                  <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {name}
                  </h3>
                  <div className="divide-y divide-border">
                    {teams.map((team, i) => (
                      <StandingsRow key={team.teamAbbrev.default} team={team} rank={i + 1} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No standings data available for this season.</p>
          )}
        </section>
      )}

      {/* Hockey News */}
      {!isPlayoffs && (
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Hockey News</h2>
          </div>
          <NewsSection season={validSeason} />
        </section>
      )}

      {/* Ask Anything CTA */}
      <section>
        <div className="rounded-xl border border-primary/30 bg-accent p-6 text-center">
          <h2 className="mb-2 text-xl font-bold">Ask Anything</h2>
          <p className="mb-4 text-muted-foreground max-w-xl mx-auto">
            Got a nuanced hockey question? Ask it here. Inspired by the research-style analysis
            you hear on podcasts like 32 Thoughts — powered by AI.
          </p>
          <Link
            href="/ask"
            className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Start asking →
          </Link>
        </div>
      </section>
    </div>
  )
}
