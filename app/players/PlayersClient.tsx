'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { formatSeason, groupSeasonsByDecade } from '@/types/nhl'

interface Player {
  id: number
  name: string
  teamAbbrev: string
  position: string
  gamesPlayed: number
  goals: number
  assists: number
  points: number
  plusMinus: number
  pim: number
  ppGoals: number
  ppPoints: number
  shGoals: number
  gwGoals: number
  otGoals: number
  shots: number
  shootingPct: number
  toi: number
  evGoals: number
  evPoints: number
  faceoffPct: number
  hits: number | null
  blocks: number | null
  giveaways: number | null
  takeaways: number | null
}

interface Props {
  players: Player[]
  currentSeason: number
  allSeasons: number[]
  isPlayoffs: boolean
}

const POSITIONS = ['All', 'C', 'L', 'R', 'D']

type SortKey = keyof Omit<Player, 'id' | 'name' | 'teamAbbrev' | 'position'>

function dash(val: number | null | undefined): string {
  if (val == null) return '—'
  return val.toString()
}

function pct(val: number | null | undefined): string {
  if (val == null) return '—'
  return (val * 100).toFixed(1) + '%'
}

function fmtToi(secondsPerGame: number): string {
  if (!secondsPerGame) return '—'
  const mins = Math.floor(secondsPerGame / 60)
  const secs = Math.round(secondsPerGame % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const COLUMNS: { key: SortKey; label: string; title: string }[] = [
  { key: 'gamesPlayed', label: 'GP', title: 'Games Played' },
  { key: 'goals', label: 'G', title: 'Goals' },
  { key: 'assists', label: 'A', title: 'Assists' },
  { key: 'points', label: 'PTS', title: 'Points' },
  { key: 'plusMinus', label: '+/-', title: 'Plus/Minus' },
  { key: 'pim', label: 'PIM', title: 'Penalty Minutes' },
  { key: 'ppGoals', label: 'PPG', title: 'Power Play Goals' },
  { key: 'ppPoints', label: 'PPP', title: 'Power Play Points' },
  { key: 'shGoals', label: 'SHG', title: 'Shorthanded Goals' },
  { key: 'gwGoals', label: 'GWG', title: 'Game-Winning Goals' },
  { key: 'otGoals', label: 'OTG', title: 'Overtime Goals' },
  { key: 'evGoals', label: 'EVG', title: 'Even Strength Goals' },
  { key: 'evPoints', label: 'EVP', title: 'Even Strength Points' },
  { key: 'shots', label: 'SOG', title: 'Shots on Goal' },
  { key: 'shootingPct', label: 'S%', title: 'Shooting Percentage' },
  { key: 'toi', label: 'TOI/G', title: 'Average Time on Ice per Game' },
  { key: 'hits', label: 'HIT', title: 'Hits' },
  { key: 'blocks', label: 'BLK', title: 'Blocked Shots' },
  { key: 'giveaways', label: 'GV', title: 'Giveaways' },
  { key: 'takeaways', label: 'TK', title: 'Takeaways' },
  { key: 'faceoffPct', label: 'FO%', title: 'Faceoff Win Percentage' },
]

export default function PlayersClient({ players, currentSeason, allSeasons, isPlayoffs }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [search, setSearch] = useState('')
  const [position, setPosition] = useState('All')
  const [sortKey, setSortKey] = useState<SortKey>('points')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const filtered = useMemo(() => {
    return players
      .filter((p) => {
        const matchName = p.name.toLowerCase().includes(search.toLowerCase())
        const matchPos = position === 'All' || p.position === position
        return matchName && matchPos
      })
      .sort((a, b) => {
        const av = a[sortKey] ?? -Infinity
        const bv = b[sortKey] ?? -Infinity
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortDir === 'desc' ? bv - av : av - bv
        }
        return 0
      })
  }, [players, search, position, sortKey, sortDir])

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  function updateSeason(season: number) {
    router.push(`${pathname}?season=${season}&gameType=${isPlayoffs ? 'playoffs' : 'regular'}`)
  }

  function updateGameType(gt: string) {
    router.push(`${pathname}?season=${currentSeason}&gameType=${gt}`)
  }

  const groups = groupSeasonsByDecade(allSeasons)

  const thClass = 'px-2 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap cursor-pointer select-none hover:text-foreground transition-colors'

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex rounded-lg border border-border bg-secondary p-1 gap-1">
          <button
            onClick={() => updateGameType('regular')}
            className={['rounded-md px-4 py-1.5 text-sm font-medium transition-colors', !isPlayoffs ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'].join(' ')}
          >
            Regular Season
          </button>
          <button
            onClick={() => updateGameType('playoffs')}
            className={['rounded-md px-4 py-1.5 text-sm font-medium transition-colors', isPlayoffs ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'].join(' ')}
          >
            Playoffs
          </button>
        </div>

        <div className="flex rounded-lg border border-border bg-secondary p-1 gap-1">
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              onClick={() => setPosition(pos)}
              className={['rounded-md px-3 py-1.5 text-sm font-medium transition-colors', pos === position ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'].join(' ')}
            >
              {pos}
            </button>
          ))}
        </div>

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search players…"
          className="w-44"
        />

        <div className="ml-auto">
          <select
            value={currentSeason}
            onChange={(e) => updateSeason(parseInt(e.target.value))}
            className="rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {groups.map(({ decade, seasons }) => (
              <optgroup key={decade} label={decade}>
                {seasons.map((s) => (
                  <option key={s} value={s}>{formatSeason(s)}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3">{filtered.length} skaters · click a column header to sort</p>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No players found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 border-b border-border">
              <tr>
                <th className={`${thClass} text-left pl-3 min-w-[160px]`}>Player</th>
                <th className={`${thClass} text-left`}>Team</th>
                <th className={`${thClass} text-left`}>Pos</th>
                {COLUMNS.map(({ key, label, title }) => (
                  <th
                    key={key}
                    className={`${thClass} text-right ${sortKey === key ? 'text-primary' : ''}`}
                    title={title}
                    onClick={() => handleSort(key)}
                  >
                    {label}
                    {sortKey === key && (
                      <span className="ml-0.5 opacity-60">{sortDir === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p, idx) => {
                const pm = p.plusMinus
                return (
                  <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="pl-3 pr-2 py-2 text-left font-medium whitespace-nowrap">
                      <Link href={`/player/${p.id}`} className="hover:text-primary transition-colors">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-2 py-2 text-left text-muted-foreground text-xs">{p.teamAbbrev}</td>
                    <td className="px-2 py-2 text-left text-muted-foreground text-xs">{p.position}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{p.gamesPlayed}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{p.goals}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{p.assists}</td>
                    <td className="px-2 py-2 text-right tabular-nums font-bold text-primary">{p.points}</td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      <span className={pm > 0 ? 'text-emerald-400' : pm < 0 ? 'text-red-400' : ''}>
                        {pm > 0 ? '+' : ''}{pm}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">{p.pim}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{p.ppGoals}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{p.ppPoints}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{p.shGoals}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{p.gwGoals}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{p.otGoals}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{p.evGoals}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{p.evPoints}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{p.shots}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{pct(p.shootingPct)}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{fmtToi(p.toi)}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{dash(p.hits)}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{dash(p.blocks)}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{dash(p.giveaways)}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{dash(p.takeaways)}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{pct(p.faceoffPct)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
