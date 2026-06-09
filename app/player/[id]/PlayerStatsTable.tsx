'use client'

import { useState } from 'react'
import type { PlayerSeasonTotal, PlayerAward } from '@/types/nhl'
import { formatSeason } from '@/types/nhl'
import { AWARD_META, STANLEY_CUP_WINNERS, STANLEY_CUP_IMAGE } from '@/lib/awards'

interface Props {
  seasonTotals: PlayerSeasonTotal[]
  awards: PlayerAward[]
}

// Build a map: seasonId → award trophy names for this player
function buildAwardMap(awards: PlayerAward[]): Map<number, string[]> {
  const map = new Map<number, string[]>()
  for (const award of awards) {
    for (const s of award.seasons) {
      const sid = s.seasonId
      if (!map.has(sid)) map.set(sid, [])
      map.get(sid)!.push(award.trophy.default)
    }
  }
  return map
}

// Derive which team abbreviation a player was on for a given season
function teamAbbrevFromSeason(total: PlayerSeasonTotal): string | null {
  const name = total.teamName?.default
  if (!name) return null
  // Try to match common team names to abbreviations
  const MAP: Record<string, string> = {
    'Edmonton Oilers': 'EDM', 'Toronto Maple Leafs': 'TOR', 'Boston Bruins': 'BOS',
    'Colorado Avalanche': 'COL', 'Tampa Bay Lightning': 'TBL', 'Florida Panthers': 'FLA',
    'New York Rangers': 'NYR', 'Pittsburgh Penguins': 'PIT', 'Washington Capitals': 'WSH',
    'Chicago Blackhawks': 'CHI', 'Detroit Red Wings': 'DET', 'Montreal Canadiens': 'MTL',
    'Los Angeles Kings': 'LAK', 'Vegas Golden Knights': 'VGK', 'Carolina Hurricanes': 'CAR',
    'Dallas Stars': 'DAL', 'New Jersey Devils': 'NJD', 'St. Louis Blues': 'STL',
    'Minnesota Wild': 'MIN', 'Calgary Flames': 'CGY', 'Vancouver Canucks': 'VAN',
    'Ottawa Senators': 'OTT', 'Winnipeg Jets': 'WPG', 'Nashville Predators': 'NSH',
    'Philadelphia Flyers': 'PHI', 'Anaheim Ducks': 'ANA', 'San Jose Sharks': 'SJS',
    'Columbus Blue Jackets': 'CBJ', 'New York Islanders': 'NYI', 'Buffalo Sabres': 'BUF',
    'Seattle Kraken': 'SEA', 'Utah Hockey Club': 'UTA',
    // historical
    'Hartford Whalers': 'CAR', 'Quebec Nordiques': 'COL', 'Atlanta Flames': 'CGY',
    'Minnesota North Stars': 'DAL', 'Kansas City Scouts': 'NJD', 'Colorado Rockies': 'NJD',
    'Atlanta Thrashers': 'WPG', 'Phoenix Coyotes': 'UTA', 'Arizona Coyotes': 'UTA',
    'Mighty Ducks of Anaheim': 'ANA',
  }
  return MAP[name] ?? null
}

function pct(val?: number) {
  if (val == null) return '—'
  return (val * 100).toFixed(1) + '%'
}

function statOrDash(val?: number | null) {
  if (val == null) return '—'
  return val.toString()
}

function pctStat(val?: number | null) {
  if (val == null) return '—'
  return (val * 100).toFixed(1) + '%'
}

export default function PlayerStatsTable({ seasonTotals, awards }: Props) {
  const [tab, setTab] = useState<'regular' | 'playoffs'>('regular')

  const awardMap = buildAwardMap(awards)

  const gameTypeId = tab === 'regular' ? 2 : 3

  const rows = seasonTotals
    .filter((t) => t.gameTypeId === gameTypeId)
    .sort((a, b) => b.season - a.season || (b.sequence ?? 0) - (a.sequence ?? 0))

  // NHL rows (primary) vs other leagues
  const nhlRows = rows.filter((t) => t.leagueAbbrev === 'NHL')
  const otherRows = rows.filter((t) => t.leagueAbbrev !== 'NHL')
  const allRows = [...nhlRows, ...otherRows]

  function rowAwards(row: PlayerSeasonTotal) {
    const trophies = awardMap.get(row.season) ?? []
    // Add Stanley Cup icon if player was on the Cup-winning team
    if (tab === 'playoffs') {
      const abbrev = teamAbbrevFromSeason(row)
      if (abbrev && STANLEY_CUP_WINNERS[row.season] === abbrev) {
        if (!trophies.includes('__cup__')) {
          return ['__cup__', ...trophies]
        }
      }
    } else {
      const abbrev = teamAbbrevFromSeason(row)
      if (abbrev && STANLEY_CUP_WINNERS[row.season] === abbrev) {
        if (!trophies.includes('__cup__')) {
          return ['__cup__', ...trophies]
        }
      }
    }
    return trophies
  }

  function isCupRow(row: PlayerSeasonTotal) {
    const abbrev = teamAbbrevFromSeason(row)
    return !!abbrev && STANLEY_CUP_WINNERS[row.season] === abbrev
  }

  function hasNonCupAward(row: PlayerSeasonTotal) {
    return (awardMap.get(row.season) ?? []).length > 0
  }

  const thClass = 'px-2 py-2 text-right text-[11px] font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap'
  const tdClass = 'px-2 py-2 text-right text-sm tabular-nums'

  return (
    <div>
      {/* Tab toggle */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex rounded-lg border border-border bg-secondary p-1 gap-1">
          <button
            onClick={() => setTab('regular')}
            className={[
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              tab === 'regular'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            Regular Season
          </button>
          <button
            onClick={() => setTab('playoffs')}
            className={[
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              tab === 'playoffs'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            Playoffs
          </button>
        </div>
        <span className="text-xs text-muted-foreground">
          {nhlRows.length} NHL season{nhlRows.length !== 1 ? 's' : ''}
          {tab === 'playoffs' ? ' in playoffs' : ''}
        </span>
      </div>

      {allRows.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">
          No {tab === 'playoffs' ? 'playoff' : 'regular season'} data available.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 border-b border-border">
              <tr>
                <th className={`${thClass} text-left pl-3 w-4`} title="Awards"></th>
                <th className={`${thClass} text-left`}>Season</th>
                <th className={`${thClass} text-left`}>Team</th>
                <th className={`${thClass} text-left`}>Lg</th>
                <th className={thClass} title="Games Played">GP</th>
                <th className={thClass} title="Goals">G</th>
                <th className={thClass} title="Assists">A</th>
                <th className={`${thClass} text-primary`} title="Points">PTS</th>
                <th className={thClass} title="Plus/Minus">+/-</th>
                <th className={thClass} title="Penalty Minutes">PIM</th>
                <th className={thClass} title="Power Play Goals">PPG</th>
                <th className={thClass} title="Power Play Points">PPP</th>
                <th className={thClass} title="Shorthanded Goals">SHG</th>
                <th className={thClass} title="Game-Winning Goals">GWG</th>
                <th className={thClass} title="Overtime Goals">OTG</th>
                <th className={thClass} title="Shots">SOG</th>
                <th className={thClass} title="Shooting Percentage">S%</th>
                <th className={thClass} title="Average Time On Ice">TOI/G</th>
                {tab === 'regular' && (
                  <th className={thClass} title="Faceoff Win %">FO%</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allRows.map((row, idx) => {
                const isNHL = row.leagueAbbrev === 'NHL'
                const cup = isCupRow(row)
                const hasAward = hasNonCupAward(row)
                const rowTrophies = awardMap.get(row.season) ?? []
                const isHighlighted = cup || hasAward
                const pim = row.pim ?? row.penaltyMinutes

                return (
                  <tr
                    key={`${row.season}-${row.gameTypeId}-${idx}`}
                    className={[
                      'transition-colors',
                      isHighlighted
                        ? 'bg-amber-900/20 hover:bg-amber-900/30'
                        : isNHL
                        ? 'hover:bg-secondary/30'
                        : 'opacity-60 hover:bg-secondary/20',
                    ].join(' ')}
                  >
                    {/* Award icons column */}
                    <td className="pl-3 pr-1 py-2 text-left whitespace-nowrap">
                      <div className="flex items-center gap-0.5">
                        {cup && (
                          <img
                            src={STANLEY_CUP_IMAGE}
                            alt="Stanley Cup Champion"
                            title="Stanley Cup Champion"
                            className="h-6 w-6 object-contain inline-block cursor-help"
                          />
                        )}
                        {rowTrophies.map((trophy) => {
                          const meta = AWARD_META[trophy]
                          if (!meta) return null
                          return (
                            <img
                              key={trophy}
                              src={meta.image}
                              alt={trophy}
                              title={`${trophy}: ${meta.description}`}
                              className="h-6 w-6 object-contain inline-block cursor-help"
                            />
                          )
                        })}
                      </div>
                    </td>
                    <td className={`${tdClass} text-left font-medium whitespace-nowrap`}>
                      {isHighlighted ? (
                        <span className="text-amber-400 font-bold">{formatSeason(row.season)}</span>
                      ) : (
                        formatSeason(row.season)
                      )}
                    </td>
                    <td className={`${tdClass} text-left max-w-[120px] truncate`}>
                      {row.teamCommonName?.default ?? row.teamName?.default ?? '—'}
                    </td>
                    <td className={`${tdClass} text-left text-muted-foreground text-xs`}>
                      {row.leagueAbbrev}
                    </td>
                    <td className={tdClass}>{row.gamesPlayed}</td>
                    <td className={tdClass}>{row.goals}</td>
                    <td className={tdClass}>{row.assists}</td>
                    <td className={`${tdClass} font-bold text-primary`}>{row.points}</td>
                    <td className={tdClass}>
                      <span className={
                        (row.plusMinus ?? 0) > 0
                          ? 'text-emerald-400'
                          : (row.plusMinus ?? 0) < 0
                          ? 'text-red-400'
                          : ''
                      }>
                        {row.plusMinus != null
                          ? (row.plusMinus > 0 ? '+' : '') + row.plusMinus
                          : '—'}
                      </span>
                    </td>
                    <td className={tdClass}>{statOrDash(pim)}</td>
                    <td className={tdClass}>{statOrDash(row.powerPlayGoals)}</td>
                    <td className={tdClass}>{statOrDash(row.powerPlayPoints)}</td>
                    <td className={tdClass}>{statOrDash(row.shorthandedGoals)}</td>
                    <td className={tdClass}>{statOrDash(row.gameWinningGoals)}</td>
                    <td className={tdClass}>{statOrDash(row.otGoals)}</td>
                    <td className={tdClass}>{statOrDash(row.shots)}</td>
                    <td className={tdClass}>{pctStat(row.shootingPctg)}</td>
                    <td className={`${tdClass} text-muted-foreground`}>{row.avgToi ?? '—'}</td>
                    {tab === 'regular' && (
                      <td className={tdClass}>{pctStat(row.faceoffWinningPctg)}</td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Award legend */}
      {awards.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <img src={STANLEY_CUP_IMAGE} alt="Stanley Cup" className="h-5 w-5 object-contain" />
            Stanley Cup champion
          </span>
          {awards.map((a) => {
            const meta = AWARD_META[a.trophy.default]
            if (!meta) return null
            return (
              <span key={a.trophy.default} className="flex items-center gap-1.5">
                <img src={meta.image} alt={a.trophy.default} className="h-5 w-5 object-contain" />
                {a.trophy.default}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
