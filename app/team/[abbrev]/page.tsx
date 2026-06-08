import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getAllSeasons, getTeamSeasonHistory, getPlayoffBracket, seasonRange } from '@/lib/nhl-api'
import { FRANCHISE_INFO, FRANCHISE_CHAINS } from '@/lib/team-history'
import { STANLEY_CUP_WINNERS } from '@/lib/awards'
import { formatSeason } from '@/types/nhl'
import TeamHistory from './TeamHistory'
import FranchiseChain from './FranchiseChain'

interface Props {
  params: Promise<{ abbrev: string }>
}

function getPlayoffResultFromBracket(
  abbrev: string,
  bracket: import('@/types/nhl').PlayoffBracket | null
): string | null {
  if (!bracket?.series?.length) return null

  const teamSeries = bracket.series.filter(
    (s) =>
      s.topSeedTeam.abbrev === abbrev ||
      s.bottomSeedTeam.abbrev === abbrev
  )
  if (teamSeries.length === 0) return null

  const maxRound = Math.max(...teamSeries.map((s) => s.playoffRound))
  const lastSeries = teamSeries.filter((s) => s.playoffRound === maxRound)
  const finalSeries = lastSeries[lastSeries.length - 1]

  const won = finalSeries.winningTeamId !== 0 && (
    (finalSeries.topSeedTeam.abbrev === abbrev && finalSeries.winningTeamId === finalSeries.topSeedTeam.id) ||
    (finalSeries.bottomSeedTeam.abbrev === abbrev && finalSeries.winningTeamId === finalSeries.bottomSeedTeam.id)
  )

  if (maxRound === 4 && won) return 'Champion'
  if (maxRound === 4) return 'Finals'
  if (maxRound === 3) return 'CF'
  if (maxRound === 2) return 'R2'
  if (maxRound === 1) return 'R1'
  return null
}

export default async function TeamPage({ params }: Props) {
  const { abbrev } = await params
  const upperAbbrev = abbrev.toUpperCase()

  const info = FRANCHISE_INFO[upperAbbrev]
  if (!info) return notFound()

  // Build the full season range for this team
  const currentYear = new Date().getFullYear()
  const lastActiveYear = info.isDefunct && info.yearsActive
    ? parseInt(info.yearsActive.split('–')[1]) - 1
    : currentYear

  const allSeasons = seasonRange(info.foundedYear, lastActiveYear)

  // Cap at 50 seasons max for performance; show most recent first
  const seasonsToFetch = allSeasons.slice(0, 50)

  const [historyData, ...bracketData] = await Promise.all([
    getTeamSeasonHistory(upperAbbrev, seasonsToFetch),
    ...seasonsToFetch.map((s) => {
      const year = s % 10000
      return getPlayoffBracket(year).catch(() => null)
    }),
  ])

  const bracketMap = new Map(
    seasonsToFetch.map((s, i) => [s, bracketData[i]])
  )

  const history = historyData.map(({ season, standing }) => {
    const cupWinner = STANLEY_CUP_WINNERS[season] === upperAbbrev
    const bracket = bracketMap.get(season) ?? null
    const playoffResult = cupWinner
      ? 'Champion'
      : getPlayoffResultFromBracket(upperAbbrev, bracket)
    return { season, standing, playoffResult }
  })

  const currentStanding = history.find((h) => h.standing)?.standing

  // Build franchise chain for this team
  const franchiseId = info.franchiseId
  const chainAbbrevs = franchiseId ? (FRANCHISE_CHAINS[franchiseId] ?? []) : []
  const chainEntries = chainAbbrevs
    .map((a) => FRANCHISE_INFO[a])
    .filter(Boolean) as import('@/lib/team-history').FranchiseInfo[]

  const hasChain = chainEntries.length > 1

  const isCurrentTeam = !info.isDefunct
  const logoUrl = `https://assets.nhle.com/logos/nhl/svg/${upperAbbrev}_light.svg`

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Team header */}
      <div className="flex flex-wrap items-start gap-6 mb-8">
        {/* Logo or text badge */}
        <div className="relative h-28 w-28 shrink-0 flex items-center justify-center">
          {isCurrentTeam ? (
            <Image
              src={logoUrl}
              alt={info.name}
              fill
              className="object-contain"
              unoptimized
              priority
            />
          ) : (
            <div className="h-28 w-28 rounded-2xl bg-secondary border border-border flex items-center justify-center">
              <span className="text-2xl font-black text-muted-foreground tracking-tight">
                {upperAbbrev}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">{info.name}</h1>
            {info.isDefunct && (
              <span className="inline-flex items-center rounded-full bg-secondary border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                Defunct · {info.yearsActive}
              </span>
            )}
          </div>

          <dl className="mt-3 grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-muted-foreground min-w-[100px]">Founded</dt>
              <dd>{info.foundedYear}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted-foreground min-w-[100px]">Arena</dt>
              <dd>{info.arena}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted-foreground min-w-[100px]">Location</dt>
              <dd>{info.city}</dd>
            </div>
            {currentStanding && (
              <>
                <div className="flex gap-2">
                  <dt className="text-muted-foreground min-w-[100px]">Division</dt>
                  <dd>{currentStanding.divisionName}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-muted-foreground min-w-[100px]">Conference</dt>
                  <dd>{currentStanding.conferenceName}</dd>
                </div>
              </>
            )}
            {info.previousNames && info.previousNames.length > 0 && (
              <div className="flex gap-2 sm:col-span-2">
                <dt className="text-muted-foreground min-w-[100px]">History</dt>
                <dd className="text-muted-foreground">
                  {info.previousNames.map((pn, i) => (
                    <span key={i}>
                      {pn.name} ({pn.years})
                      {i < info.previousNames!.length - 1 ? ' → ' : ''}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>

          {/* Stanley Cup wins summary */}
          {(() => {
            const cups = Object.entries(STANLEY_CUP_WINNERS)
              .filter(([, t]) => t === upperAbbrev)
              .map(([s]) => formatSeason(Number(s)))
            return cups.length > 0 ? (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-amber-400 text-sm font-semibold">
                  🏆 {cups.length} Stanley Cup{cups.length > 1 ? 's' : ''}:
                </span>
                <span className="text-sm text-muted-foreground">{cups.join(', ')}</span>
              </div>
            ) : null
          })()}
        </div>
      </div>

      {/* Franchise chain */}
      {hasChain && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Franchise History
          </h2>
          <FranchiseChain chain={chainEntries} currentAbbrev={upperAbbrev} />
        </section>
      )}

      {/* Year-by-year history */}
      <section>
        <h2 className="text-lg font-bold mb-3">Season History</h2>
        <TeamHistory teamAbbrev={upperAbbrev} history={history} />
      </section>
    </div>
  )
}
