import Image from 'next/image'
import Link from 'next/link'
import type { PlayoffBracket, PlayoffSeries, PlayoffTeam } from '@/types/nhl'

// ── Series card ───────────────────────────────────────────────────────────────

function TeamRow({
  team,
  seedAbbrev,
  wins,
  isWinner,
  isDimmed,
}: {
  team: { abbrev: string; commonName: { default: string }; darkLogo: string }
  seedAbbrev: string
  wins: number
  isWinner: boolean
  isDimmed: boolean
}) {
  return (
    <Link
      href={`/team/${team.abbrev}`}
      className={`flex items-center gap-1.5 py-1 hover:bg-secondary/30 rounded transition-colors ${isDimmed ? 'opacity-35' : ''}`}
    >
      <span className="w-5 shrink-0 text-[10px] text-muted-foreground text-right leading-none">
        {seedAbbrev}
      </span>
      <div className="relative h-5 w-5 shrink-0">
        <Image
          src={team.darkLogo}
          alt={team.commonName.default}
          fill
          className="object-contain"
          unoptimized
        />
      </div>
      <span
        className={`flex-1 text-xs truncate ${
          isWinner ? 'font-bold text-primary' : 'text-foreground'
        }`}
      >
        {team.commonName.default}
      </span>
      <span
        className={`text-xs font-bold tabular-nums w-3 text-right ${
          isWinner ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        {wins}
      </span>
    </Link>
  )
}

function SeriesCard({ series }: { series: PlayoffSeries }) {
  const complete = (series.winningTeamId ?? 0) !== 0
  const topWon = complete && series.winningTeamId === series.topSeedTeam.id
  const bottomWon = complete && series.winningTeamId === series.bottomSeedTeam.id

  return (
    <div className="rounded-lg border border-border bg-card px-2 py-0.5 w-[168px] shrink-0">
      <TeamRow
        team={series.topSeedTeam}
        seedAbbrev={series.topSeedRankAbbrev}
        wins={series.topSeedWins}
        isWinner={topWon}
        isDimmed={bottomWon}
      />
      <div className="border-t border-border/40" />
      <TeamRow
        team={series.bottomSeedTeam}
        seedAbbrev={series.bottomSeedRankAbbrev}
        wins={series.bottomSeedWins}
        isWinner={bottomWon}
        isDimmed={topWon}
      />
    </div>
  )
}

// ── Bracket connector ─────────────────────────────────────────────────────────
// Two flex-1 halves with corner borders that merge a pair of series into one parent.
// Works because justify-around distributes items such that item centers land
// at the exact same relative positions as these border midpoints.

function PairConnector({ reversed = false }: { reversed?: boolean }) {
  const side = reversed ? 'border-l-2' : 'border-r-2'
  const br = reversed ? 'rounded-bl-lg' : 'rounded-br-lg'
  const tr = reversed ? 'rounded-tl-lg' : 'rounded-tr-lg'
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className={`flex-1 ${side} border-b-2 border-border/40 ${br}`} />
      <div className={`flex-1 ${side} border-t-2 border-border/40 ${tr}`} />
    </div>
  )
}

// ── One conference side ───────────────────────────────────────────────────────
// East layout: R1 → connector(s) → R2 → connector → CF
// West layout: CF → connector → R2 → connector(s) → R1  (reversed flag flips connectors)

function BracketSide({
  r1,
  r2,
  cf,
  reversed,
}: {
  r1: PlayoffSeries[]
  r2: PlayoffSeries[]
  cf: PlayoffSeries[]
  reversed: boolean
}) {
  const CARD_H = 68  // approximate px height of a SeriesCard
  const GAP = 8
  const n = Math.max(r1.length, 1)
  const containerH = n * CARD_H + (n - 1) * GAP + n * GAP // justify-around adds gap/2 top and bottom per item

  const r1Col = r1.length > 0 ? (
    <div key="r1" className="flex flex-col justify-around self-stretch">
      {r1.map((s) => <SeriesCard key={s.seriesLetter} series={s} />)}
    </div>
  ) : null

  const r1r2Conn = r1.length > 0 && r2.length > 0 ? (
    <div key="conn-r1-r2" className="flex flex-col self-stretch" style={{ width: '14px' }}>
      {r2.map((_, i) => <PairConnector key={i} reversed={false} />)}
    </div>
  ) : null

  const r2Col = r2.length > 0 ? (
    <div key="r2" className="flex flex-col justify-around self-stretch">
      {r2.map((s) => <SeriesCard key={s.seriesLetter} series={s} />)}
    </div>
  ) : null

  const r2cfConn = r2.length > 0 && cf.length > 0 ? (
    <div key="conn-r2-cf" className="flex flex-col self-stretch" style={{ width: '14px' }}>
      {cf.map((_, i) => <PairConnector key={i} reversed={false} />)}
    </div>
  ) : null

  const cfCol = cf.length > 0 ? (
    <div key="cf" className="flex items-center self-stretch">
      <SeriesCard series={cf[0]} />
    </div>
  ) : null

  const westR2cfConn = cf.length > 0 && r2.length > 0 ? (
    <div key="conn-cf-r2" className="flex flex-col self-stretch" style={{ width: '14px' }}>
      {cf.map((_, i) => <PairConnector key={i} reversed={true} />)}
    </div>
  ) : null

  const westR2r1Conn = r2.length > 0 && r1.length > 0 ? (
    <div key="conn-r2-r1" className="flex flex-col self-stretch" style={{ width: '14px' }}>
      {r2.map((_, i) => <PairConnector key={i} reversed={true} />)}
    </div>
  ) : null

  const columns = reversed
    ? [cfCol, westR2cfConn, r2Col, westR2r1Conn, r1Col]
    : [r1Col, r1r2Conn, r2Col, r2cfConn, cfCol]

  return (
    <div className="flex flex-row gap-0 items-stretch" style={{ minHeight: `${containerH}px` }}>
      {columns}
    </div>
  )
}

// ── Root component ────────────────────────────────────────────────────────────

export default function PlayoffBracket({ bracket }: { bracket: PlayoffBracket }) {
  const { series } = bracket

  if (!series || series.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No playoff bracket data available for this season.
      </p>
    )
  }

  // ── Dynamic round detection ──────────────────────────────────────────────────
  // NHL bracket formats have changed dramatically across eras:
  //   pre-1968: maxRound=2 (Semis + Finals) or maxRound=3 (QF/SF/Finals)
  //   1968-1974: maxRound=3 (QF/SF/Finals, no conferences)
  //   1975-1979: maxRound=4 with only 4 R1 series (Preliminary/QF/SF/Finals)
  //   1980-present: maxRound=4 with 8 R1 series (standard modern bracket)
  //   in-progress modern: last round has 2 CF series, Finals not yet created
  //
  // Strategy: find which round number IS the Finals (last round with exactly 1
  // series), then map the preceding rounds positionally to qf/sf/cf display slots.

  const allRoundNums = [...new Set(series.map((s) => s.playoffRound))].sort((a, b) => a - b)
  const maxRound = allRoundNums[allRoundNums.length - 1] ?? 0
  const lastRoundCount = series.filter((s) => s.playoffRound === maxRound).length

  // If the last round has exactly 1 series, that IS the Finals.
  // If it has 2+ series, those are CFs and the Finals hasn't been created yet.
  const finalsRoundNum = lastRoundCount === 1 ? maxRound : null

  // Non-finals rounds (the bracket halves) — exclude the Finals round if present.
  const nonFinalsRounds = finalsRoundNum !== null ? allRoundNums.slice(0, -1) : allRoundNums

  // Map the last three non-finals rounds to cf / sf / qf positions.
  // Earlier eras may have fewer rounds; missing positions get 0 (→ empty).
  const cfRoundNum = nonFinalsRounds[nonFinalsRounds.length - 1] ?? 0
  const sfRoundNum = nonFinalsRounds[nonFinalsRounds.length - 2] ?? 0
  const qfRoundNum = nonFinalsRounds[nonFinalsRounds.length - 3] ?? 0

  function splitRound(roundNum: number) {
    if (!roundNum) return { east: [] as PlayoffSeries[], west: [] as PlayoffSeries[] }
    const sorted = series
      .filter((s) => s.playoffRound === roundNum)
      .sort((a, b) => a.seriesLetter.localeCompare(b.seriesLetter))
    const half = Math.ceil(sorted.length / 2)
    return { east: sorted.slice(0, half), west: sorted.slice(half) }
  }

  const r1 = splitRound(qfRoundNum)   // First Round / Preliminary (may be empty)
  const r2 = splitRound(sfRoundNum)   // Second Round / Quarterfinals (may be empty)
  const r3 = splitRound(cfRoundNum)   // Conf. Finals / Semifinals equivalent

  const scf = finalsRoundNum
    ? series.filter((s) => s.playoffRound === finalsRoundNum).sort((a, b) => a.seriesLetter.localeCompare(b.seriesLetter))[0] ?? null
    : null

  // ── In-progress Finals detection ─────────────────────────────────────────────
  // When both CF series are complete but the Finals hasn't been added to the API
  // yet (happens mid-playoffs), derive the two finalists and show a pending card.
  function getSeriesWinner(s: PlayoffSeries): PlayoffTeam | null {
    if (s.winningTeamId && s.winningTeamId === s.topSeedTeam.id) return s.topSeedTeam
    if (s.winningTeamId && s.winningTeamId === s.bottomSeedTeam.id) return s.bottomSeedTeam
    return null
  }

  let effectiveSCF: PlayoffSeries | null = scf
  if (!scf && r3.east.length > 0 && r3.west.length > 0) {
    const eastWinner = getSeriesWinner(r3.east[0])
    const westWinner = getSeriesWinner(r3.west[0])
    if (eastWinner && westWinner) {
      effectiveSCF = {
        seriesTitle: 'Stanley Cup Final',
        seriesLetter: 'O',
        playoffRound: (finalsRoundNum ?? cfRoundNum) + 1,
        topSeedRank: 1,
        topSeedRankAbbrev: 'E',
        topSeedWins: 0,
        bottomSeedRank: 1,
        bottomSeedRankAbbrev: 'W',
        bottomSeedWins: 0,
        winningTeamId: undefined,
        losingTeamId: undefined,
        topSeedTeam: eastWinner,
        bottomSeedTeam: westWinner,
      }
    }
  }

  // ── Round labels derived from series data ─────────────────────────────────────
  function getRoundLabel(roundNum: number): string {
    if (!roundNum) return ''
    const s = series.find((x) => x.playoffRound === roundNum)
    const raw = s?.seriesTitle ?? ''
    if (/1st Round/i.test(raw)) return 'First Round'
    if (/2nd Round/i.test(raw)) return 'Second Round'
    if (/Conference Finals/i.test(raw)) return 'Conf. Finals'
    if (/Conference Semifinals/i.test(raw)) return 'Conf. Semifinals'
    if (/Conference Quarterfinals/i.test(raw)) return 'Conf. Quarterfinals'
    if (/Division Finals/i.test(raw)) return 'Division Finals'
    if (/Division Semifinals/i.test(raw)) return 'Division Semifinals'
    if (/Preliminary/i.test(raw)) return 'Preliminary'
    if (/Quarterfinals/i.test(raw)) return 'Quarterfinals'
    if (/Semifinals/i.test(raw)) return 'Semifinals'
    return raw
  }

  const r1Label = getRoundLabel(qfRoundNum)
  const r2Label = getRoundLabel(sfRoundNum)
  const r3Label = getRoundLabel(cfRoundNum)

  // ── Stub connectors between CF and SCF ───────────────────────────────────────
  const EastScfStub = r3.east.length > 0 ? (
    <div className="flex flex-col self-stretch" style={{ width: '10px' }}>
      <div className="flex-1 border-r-2 border-border/40" />
      <div className="flex-1 border-r-2 border-border/40" />
    </div>
  ) : null

  const WestScfStub = r3.west.length > 0 ? (
    <div className="flex flex-col self-stretch" style={{ width: '10px' }}>
      <div className="flex-1 border-l-2 border-border/40" />
      <div className="flex-1 border-l-2 border-border/40" />
    </div>
  ) : null

  return (
    <div className="overflow-x-auto -mx-4 px-4 pb-4">
      {/* Round label header */}
      <div className="flex items-end gap-0 mb-2 min-w-max text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {r1.east.length > 0 && <div style={{ width: '168px' }}>{r1Label}</div>}
        {r1.east.length > 0 && r2.east.length > 0 && <div style={{ width: '14px' }} />}
        {r2.east.length > 0 && <div style={{ width: '168px' }}>{r2Label}</div>}
        {r2.east.length > 0 && r3.east.length > 0 && <div style={{ width: '14px' }} />}
        {r3.east.length > 0 && <div style={{ width: '168px' }}>{r3Label}</div>}
        {r3.east.length > 0 && <div style={{ width: '10px' }} />}
        <div className="text-amber-400" style={{ width: '168px', textAlign: 'center' }}>Stanley Cup Finals</div>
        {r3.west.length > 0 && <div style={{ width: '10px' }} />}
        {r3.west.length > 0 && <div style={{ width: '168px' }}>{r3Label}</div>}
        {r2.west.length > 0 && r3.west.length > 0 && <div style={{ width: '14px' }} />}
        {r2.west.length > 0 && <div style={{ width: '168px' }}>{r2Label}</div>}
        {r1.west.length > 0 && r2.west.length > 0 && <div style={{ width: '14px' }} />}
        {r1.west.length > 0 && <div style={{ width: '168px', textAlign: 'right' }}>{r1Label}</div>}
      </div>

      {/* Bracket */}
      <div className="flex flex-row items-center gap-0 min-w-max">
        <BracketSide r1={r1.east} r2={r2.east} cf={r3.east} reversed={false} />
        {EastScfStub}
        <div className="flex items-center self-stretch">
          {effectiveSCF ? (
            <SeriesCard series={effectiveSCF} />
          ) : (
            <div
              className="rounded-lg border border-dashed border-border/40 flex items-center justify-center text-xs text-muted-foreground italic"
              style={{ width: '168px', height: '68px' }}
            >
              TBD
            </div>
          )}
        </div>
        {WestScfStub}
        <BracketSide r1={r1.west} r2={r2.west} cf={r3.west} reversed={true} />
      </div>

      {/* Conference labels — only shown when both sides have data */}
      {r3.east.length > 0 && r3.west.length > 0 && (
        <div className="flex min-w-max mt-2 text-xs text-muted-foreground font-medium">
          <div className="flex-1 text-left pl-1">Eastern Conference</div>
          <div style={{ width: '188px' }} />
          <div className="flex-1 text-right pr-1">Western Conference</div>
        </div>
      )}
    </div>
  )
}
