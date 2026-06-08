'use client'

import { useState } from 'react'
import type { StandingTeam } from '@/types/nhl'
import { formatSeason } from '@/types/nhl'
import { STANLEY_CUP_WINNERS, PRESIDENTS_TROPHY } from '@/lib/awards'

interface SeasonRecord {
  season: number
  standing: StandingTeam | null
  playoffResult: string | null
}

interface Props {
  teamAbbrev: string
  history: SeasonRecord[]
}

function playoffRoundLabel(result: string | null) {
  if (!result) return null
  if (result === 'Champion') return { label: 'Stanley Cup Champions 🏆', gold: true }
  if (result === 'Finals') return { label: 'Stanley Cup Finals', gold: false }
  if (result === 'CF') return { label: 'Conference Finals', gold: false }
  if (result === 'R2') return { label: 'Second Round', gold: false }
  if (result === 'R1') return { label: 'First Round', gold: false }
  return { label: result, gold: false }
}

export default function TeamHistory({ teamAbbrev, history }: Props) {
  const [tab, setTab] = useState<'regular' | 'playoffs'>('regular')

  const thClass = 'px-3 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right first:text-left'
  const tdClass = 'px-3 py-2.5 text-sm text-right'

  return (
    <div>
      {/* Tab toggle */}
      <div className="mb-4">
        <div className="inline-flex rounded-lg border border-border bg-secondary p-1 gap-1">
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
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full">
          <thead className="border-b border-border bg-secondary/50">
            {tab === 'regular' ? (
              <tr>
                <th className={`${thClass} text-left`}></th>
                <th className={`${thClass} text-left`}>Season</th>
                <th className={thClass}>GP</th>
                <th className={thClass}>W</th>
                <th className={thClass}>L</th>
                <th className={thClass}>OTL</th>
                <th className={thClass}>PTS</th>
                <th className={thClass}>P%</th>
                <th className={thClass}>GF</th>
                <th className={thClass}>GA</th>
                <th className={thClass}>GD</th>
                <th className={`${thClass} text-left`}>Finish</th>
              </tr>
            ) : (
              <tr>
                <th className={`${thClass} text-left`}></th>
                <th className={`${thClass} text-left`}>Season</th>
                <th className={`${thClass} text-left`}>Result</th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-border">
            {history.map(({ season, standing, playoffResult }) => {
              const isCupWin = STANLEY_CUP_WINNERS[season] === teamAbbrev
              const isPrezTrophy = PRESIDENTS_TROPHY[season] === teamAbbrev && tab === 'regular'
              const isHighlighted = isCupWin || (isPrezTrophy && tab === 'regular')
              const gd = standing ? standing.goalDifferential : null
              const playoff = playoffRoundLabel(playoffResult)

              if (tab === 'regular') {
                return (
                  <tr
                    key={season}
                    className={[
                      'transition-colors',
                      isHighlighted
                        ? 'bg-amber-900/20 hover:bg-amber-900/30'
                        : 'hover:bg-secondary/30',
                    ].join(' ')}
                  >
                    {/* Award icons */}
                    <td className="pl-3 pr-1 py-2.5 whitespace-nowrap">
                      <span className="flex gap-0.5">
                        {isCupWin && <span title="Stanley Cup Champions">🏆</span>}
                        {isPrezTrophy && <span title="Presidents' Trophy">🥇</span>}
                      </span>
                    </td>
                    <td className={`${tdClass} text-left font-medium`}>
                      {isHighlighted ? (
                        <span className="text-amber-400 font-bold">{formatSeason(season)}</span>
                      ) : (
                        formatSeason(season)
                      )}
                    </td>
                    <td className={`${tdClass} text-muted-foreground`}>{standing?.gamesPlayed ?? '—'}</td>
                    <td className={tdClass}>{standing?.wins ?? '—'}</td>
                    <td className={tdClass}>{standing?.losses ?? '—'}</td>
                    <td className={tdClass}>{standing?.otLosses ?? '—'}</td>
                    <td className={`${tdClass} font-bold text-primary`}>{standing?.points ?? '—'}</td>
                    <td className={`${tdClass} text-muted-foreground`}>
                      {standing ? (standing.pointPctg * 100).toFixed(1) + '%' : '—'}
                    </td>
                    <td className={`${tdClass} text-muted-foreground`}>{standing?.goalFor ?? '—'}</td>
                    <td className={`${tdClass} text-muted-foreground`}>{standing?.goalAgainst ?? '—'}</td>
                    <td className={tdClass}>
                      {gd != null ? (
                        <span className={gd >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {gd > 0 ? '+' : ''}{gd}
                        </span>
                      ) : '—'}
                    </td>
                    <td className={`${tdClass} text-left text-xs text-muted-foreground`}>
                      {standing?.divisionName ?? ''}
                    </td>
                  </tr>
                )
              } else {
                // Playoffs tab
                const playedPlayoffs = playoffResult !== null || isCupWin
                return (
                  <tr
                    key={season}
                    className={[
                      'transition-colors',
                      isCupWin
                        ? 'bg-amber-900/20 hover:bg-amber-900/30'
                        : playedPlayoffs
                        ? 'hover:bg-secondary/30'
                        : 'opacity-50 hover:bg-secondary/20',
                    ].join(' ')}
                  >
                    <td className="pl-3 pr-1 py-2.5">
                      {isCupWin && <span title="Stanley Cup Champions">🏆</span>}
                    </td>
                    <td className={`${tdClass} text-left font-medium`}>
                      {isCupWin ? (
                        <span className="text-amber-400 font-bold">{formatSeason(season)}</span>
                      ) : (
                        formatSeason(season)
                      )}
                    </td>
                    <td className={`${tdClass} text-left`}>
                      {playedPlayoffs ? (
                        playoff ? (
                          <span className={playoff.gold ? 'text-amber-400 font-bold' : ''}>
                            {playoff.label}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Playoffs</span>
                        )
                      ) : (
                        <span className="text-muted-foreground text-xs">Did not qualify</span>
                      )}
                    </td>
                  </tr>
                )
              }
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">🏆 Stanley Cup Champions</span>
        {tab === 'regular' && (
          <span className="flex items-center gap-1">🥇 Presidents' Trophy (best regular season record)</span>
        )}
      </div>
    </div>
  )
}
