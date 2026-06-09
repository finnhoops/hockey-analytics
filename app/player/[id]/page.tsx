import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPlayerDetail } from '@/lib/nhl-api'
import { formatSeason } from '@/types/nhl'
import { AWARD_META } from '@/lib/awards'
import PlayerStatsTable from './PlayerStatsTable'

interface Props {
  params: Promise<{ id: string }>
}

function cm(inches: number) {
  return Math.round(inches * 2.54)
}

function lbs(kg: number) {
  return Math.round(kg * 2.205)
}

function fmtDob(dob: string) {
  const d = new Date(dob)
  const age = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
  return `${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} (age ${age})`
}

function fmtHeight(inches: number) {
  const ft = Math.floor(inches / 12)
  const inp = inches % 12
  return `${ft}' ${inp}" (${cm(inches)} cm)`
}

export default async function PlayerPage({ params }: Props) {
  const { id } = await params
  const playerId = parseInt(id)
  if (!Number.isInteger(playerId)) return notFound()

  const player = await getPlayerDetail(playerId).catch(() => null)
  if (!player) return notFound()

  const fullName = `${player.firstName.default} ${player.lastName.default}`
  const awards = player.awards ?? []

  const nhlSeasons = player.seasonTotals.filter(
    (t) => t.leagueAbbrev === 'NHL' && t.gameTypeId === 2
  )
  const careerGP = nhlSeasons.reduce((sum, t) => sum + t.gamesPlayed, 0)
  const careerG = nhlSeasons.reduce((sum, t) => sum + t.goals, 0)
  const careerA = nhlSeasons.reduce((sum, t) => sum + t.assists, 0)
  const careerPTS = nhlSeasons.reduce((sum, t) => sum + t.points, 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero banner */}
      {player.heroImage && (
        <div className="relative h-48 w-full overflow-hidden rounded-2xl mb-6 bg-secondary">
          <Image
            src={player.heroImage}
            alt={fullName}
            fill
            className="object-cover object-top"
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
        </div>
      )}

      {/* Bio section — Hockey Reference style: headshot left, info right */}
      <div className="flex flex-wrap gap-6 mb-8">
        {/* Headshot */}
        <div className="relative h-36 w-28 shrink-0 overflow-hidden rounded-xl bg-muted border border-border">
          <Image
            src={player.headshot}
            alt={fullName}
            fill
            className="object-cover object-top"
            unoptimized
            priority
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{fullName}</h1>
              <p className="mt-0.5 text-muted-foreground text-sm">
                {player.sweaterNumber ? `#${player.sweaterNumber} · ` : ''}
                {player.position}
                {player.currentTeamAbbrev ? ` · ${player.currentTeamAbbrev}` : ''}
                {player.inHHOF ? ' · Hockey Hall of Fame' : ''}
                {!player.isActive ? ' · Retired' : ''}
              </p>
            </div>
            {player.teamLogo && player.currentTeamAbbrev && (
              <div className="relative h-14 w-14 shrink-0">
                <Image
                  src={player.teamLogo}
                  alt={player.currentTeamAbbrev}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}
          </div>

          {/* Bio grid */}
          <dl className="mt-3 grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2 text-sm">
            {player.birthDate && (
              <div className="flex gap-2">
                <dt className="text-muted-foreground min-w-[80px]">Born</dt>
                <dd>{fmtDob(player.birthDate)}</dd>
              </div>
            )}
            {(player.birthCity || player.birthCountry) && (
              <div className="flex gap-2">
                <dt className="text-muted-foreground min-w-[80px]">Birthplace</dt>
                <dd>
                  {[
                    player.birthCity?.default,
                    player.birthStateProvince?.default,
                    player.birthCountry,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </dd>
              </div>
            )}
            {player.heightInInches > 0 && (
              <div className="flex gap-2">
                <dt className="text-muted-foreground min-w-[80px]">Height</dt>
                <dd>{fmtHeight(player.heightInInches)}</dd>
              </div>
            )}
            {player.weightInPounds > 0 && (
              <div className="flex gap-2">
                <dt className="text-muted-foreground min-w-[80px]">Weight</dt>
                <dd>{player.weightInPounds} lbs ({player.weightInKilograms} kg)</dd>
              </div>
            )}
            {player.shootsCatches && (
              <div className="flex gap-2">
                <dt className="text-muted-foreground min-w-[80px]">
                  {player.position === 'G' ? 'Catches' : 'Shoots'}
                </dt>
                <dd>{player.shootsCatches}</dd>
              </div>
            )}
            {player.draftDetails && (
              <div className="flex gap-2">
                <dt className="text-muted-foreground min-w-[80px]">Draft</dt>
                <dd>
                  {player.draftDetails.year} · {player.draftDetails.teamAbbrev} · Round {player.draftDetails.round},
                  #{player.draftDetails.overallPick} overall
                </dd>
              </div>
            )}
          </dl>

          {/* Awards summary */}
          {awards.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {awards.map((a) => {
                const meta = AWARD_META[a.trophy.default]
                const tooltip = meta
                  ? `${a.trophy.default}: ${meta.description}${a.seasons.length > 1 ? ` (${a.seasons.length}×)` : ''}`
                  : a.trophy.default
                return (
                  <span
                    key={a.trophy.default}
                    className="inline-flex items-center gap-1.5 rounded-full bg-amber-900/30 border border-amber-700/40 px-2.5 py-1 text-xs text-amber-300 font-medium cursor-help"
                    title={tooltip}
                  >
                    {meta && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={meta.image} alt={a.trophy.default} className="h-5 w-5 object-contain shrink-0" />
                    )}
                    {a.seasons.length > 1 && <span className="font-bold">{a.seasons.length}×</span>}
                    {a.trophy.default}
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Career NHL totals summary bar */}
      {careerGP > 0 && (
        <div className="mb-6 grid grid-cols-4 gap-3">
          {[
            { label: 'Career GP', value: careerGP },
            { label: 'Career G', value: careerG },
            { label: 'Career A', value: careerA },
            { label: 'Career PTS', value: careerPTS },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-card px-4 py-3 text-center"
            >
              <p className="text-2xl font-bold text-primary">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Year-by-year stats */}
      <section>
        <h2 className="text-lg font-bold mb-3">Career Statistics</h2>
        <PlayerStatsTable seasonTotals={player.seasonTotals} awards={awards} />
      </section>
    </div>
  )
}
